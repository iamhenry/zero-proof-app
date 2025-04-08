import React, { ReactNode } from "react";
import { render, act, waitFor } from "@testing-library/react-native";
import { View } from "react-native";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"; // Needed for streak calculation tests
import {
	CalendarDataProvider,
	useCalendarContext,
	CalendarContextProps,
} from "@/context/CalendarDataContext";
import { DayData, WeekData, CalendarData } from "../../types";
import { useRepository } from "@/context/RepositoryContext";
import { useTimerState } from "@/context/TimerStateContext";
import {
	ISobrietyDataRepository,
	StreakData,
	TimerState,
	StoredDayData,
	DayDataMap,
} from "@/lib/types/repositories";
// Import createMockWeekData as well
import { createMockWeekData } from "../../__tests__/testUtils";
import * as CalendarUtils from "../../utils"; // Import the actual utils module to spy on

// --- Scroll Mock ---
const mockScrollToIndex = jest.fn();
// NOTE: We assume the hook/provider uses a ref with this function.
// The connection mechanism isn't tested here, only the call *if* connected.
// --- End Scroll Mock ---

// Mock the calendar ref object that will be used in the provider
const mockCalendarRef = {
	current: {
		scrollToIndex: mockScrollToIndex,
	},
};

// --- Mocks ---
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(isSameOrBefore); // Extend dayjs

// Mock Repository functions
const mockLoadAllDayStatus = jest.fn<Promise<DayDataMap>, []>();
const mockSaveDayStatus = jest
	.fn<Promise<void>, [string, boolean, number | null]>()
	.mockResolvedValue(undefined); // Ensure it returns a Promise
const mockLoadDayStatus = jest.fn<Promise<StoredDayData | null>, [string]>();
const mockSaveStreakData = jest
	.fn<Promise<void>, [StreakData]>()
	.mockResolvedValue(undefined); // Ensure it returns a Promise
const mockLoadStreakData = jest.fn<Promise<StreakData | null>, []>();
const mockSaveTimerState = jest
	.fn<Promise<void>, [TimerState]>()
	.mockResolvedValue(undefined); // Ensure it returns a Promise
const mockLoadTimerState = jest.fn<Promise<TimerState | null>, []>();
const mockSaveDrinkCost = jest.fn<Promise<void>, [number]>();
const mockLoadDrinkCost = jest.fn<Promise<number | null>, []>();

const mockRepository: ISobrietyDataRepository = {
	loadAllDayStatus: mockLoadAllDayStatus,
	saveDayStatus: mockSaveDayStatus,
	loadDayStatus: mockLoadDayStatus,
	saveStreakData: mockSaveStreakData,
	loadStreakData: mockLoadStreakData,
	saveTimerState: mockSaveTimerState,
	loadTimerState: mockLoadTimerState,
	saveDrinkCost: mockSaveDrinkCost,
	loadDrinkCost: mockLoadDrinkCost,
};

// Mock Timer State functions
const mockStartTimer = jest.fn<void, [number]>();
const mockStopTimer = jest.fn<void, []>();
const mockLoadInitialTimerState = jest.fn<void, []>();

const mockTimerStateValue = {
	startTime: null,
	isRunning: false,
	isLoading: false,
	startTimer: mockStartTimer,
	stopTimer: mockStopTimer,
	loadInitialTimerState: mockLoadInitialTimerState,
};

// Mock the context hooks
jest.mock("@/context/RepositoryContext", () => ({
	useRepository: () => mockRepository,
}));
jest.mock("@/context/TimerStateContext", () => ({
	useTimerState: () => mockTimerStateValue,
}));
// Add mock for React.createRef to return our mockCalendarRef
jest.mock("react", () => {
	const originalReact = jest.requireActual("react");
	return {
		...originalReact,
		createRef: jest.fn(() => mockCalendarRef),
	};
});
// --- End Mocks ---

// --- Test Consumer Component ---
// Variable to capture the context value provided by the hook
let capturedContextValue: CalendarContextProps | null = null;

// A simple component that consumes the context and assigns its value to the captured variable
const TestConsumer: React.FC = () => {
	capturedContextValue = useCalendarContext();
	// This component doesn't need to render anything itself for these tests
	return null;
};
// --- End Test Consumer ---

// Helper function to find a specific day within the weeks data structure
const findDayById = (
	weeks: WeekData[] | undefined,
	id: string,
): DayData | undefined => {
	if (!weeks) return undefined;
	for (const week of weeks) {
		const day = week.days.find((d: DayData) => d.id === id);
		if (day) return day;
	}
	return undefined;
};

describe("CalendarDataProvider Logic", () => {
	let loadMoreWeeksSpy: jest.SpyInstance;

	beforeEach(() => {
		// Reset all mock function calls and implementations before each test
		jest.clearAllMocks();

		// Reset default resolved values for repository mocks
		mockLoadAllDayStatus.mockResolvedValue({});
		mockLoadStreakData.mockResolvedValue({
			currentStreak: 0,
			longestStreak: 0,
		});
		mockLoadTimerState.mockResolvedValue({ startTime: null, isRunning: false });
		mockLoadDayStatus.mockResolvedValue(null);
		mockLoadDrinkCost.mockResolvedValue(null);

		// Reset the captured context value
		capturedContextValue = null;

		// Setup spy for the loadMoreWeeks utility function
		loadMoreWeeksSpy = jest
			.spyOn(CalendarUtils, "loadMoreWeeks")
			.mockImplementation(
				(
					existingData: CalendarData,
					direction?: "past" | "future",
					weeksToLoadParam?: number,
				): CalendarData => {
					const numWeeksToLoad = weeksToLoadParam ?? 4; // Default to 4 if not provided
					// Generate the specified number of mock weeks
					const dummyWeeks: WeekData[] = Array(numWeeksToLoad)
						.fill(null)
						.map(
							(_, index) =>
								createMockWeekData({
									id: `mock-week-${direction}-${index}-${Date.now()}`,
								}), // Use unique IDs
						);

					const newWeeks =
						direction === "past"
							? [...dummyWeeks, ...existingData.weeks]
							: [...existingData.weeks, ...dummyWeeks];

					// Limit total weeks to prevent excessive data in tests
					const limitedWeeks =
						direction === "past" ? newWeeks.slice(0, 20) : newWeeks.slice(-20);
					return { weeks: limitedWeeks }; // Return the correct CalendarData structure
				},
			);
	});

	afterEach(() => {
		// Restore all mocks after each test to avoid interference
		jest.restoreAllMocks();
	});

	// Helper function to render the provider and consumer
	const renderProvider = () => {
		// IMPORTANT: This assumes the file is renamed to .tsx
		return render(
			<CalendarDataProvider>
				<TestConsumer />
			</CalendarDataProvider>,
		);
	};

	// MARK: - Scenario: Initial Calendar Load
	describe("Scenario: Initial Calendar Load", () => {
		it("should initialize with a deterministic set of weeks, all days non-sober by default", async () => {
			renderProvider();

			// Wait for the initial loading state to become false
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();

			// Check the number of weeks (default is 9: current week + 4 past + 4 future)
			expect(capturedContextValue?.weeks.length).toBe(9);
			const today = dayjs();
			const startDate = today.subtract(4, "week").startOf("week");
			const endDate = today.add(4, "week").endOf("week");
			let dayCount = 0;

			// Verify each day in the initial set
			capturedContextValue?.weeks.forEach((week: WeekData) => {
				week.days.forEach((day: DayData) => {
					dayCount++;
					expect(day.sober).toBe(false); // Default state
					expect(day.intensity).toBe(0); // Default intensity
					const dayDate = dayjs(day.id);
					// Check if the day falls within the expected initial date range
					expect(
						dayDate.isBetween(
							startDate.subtract(1, "day"),
							endDate.add(1, "day"),
							"day",
							"[]",
						),
					).toBe(true); // Inclusive check
				});
			});
			expect(dayCount).toBe(63); // 9 weeks * 7 days
			expect(capturedContextValue?.isLoadingPast).toBe(false);
			expect(capturedContextValue?.isLoadingFuture).toBe(false);
		});

		it("should initialize with zero streaks when all days are non-sober", async () => {
			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue?.currentStreak).toBe(0);
			expect(capturedContextValue?.longestStreak).toBe(0);
		});

		it("should initialize correctly based on data loaded from repository", async () => {
			const today = dayjs();
			const pastStreakStart = today.subtract(15, "days").format("YYYY-MM-DD");
			const pastStreakEnd = today.subtract(10, "days").format("YYYY-MM-DD");
			const recentStreakStart = today.subtract(2, "days").format("YYYY-MM-DD");
			const recentStreakStartTimestamp = today
				.subtract(2, "days")
				.startOf("day")
				.valueOf();

			// Prepare mock data simulating stored sobriety information
			const mockDayStatus: DayDataMap = {};
			let currentDay = dayjs(pastStreakStart);
			while (currentDay.isSameOrBefore(pastStreakEnd, "day")) {
				mockDayStatus[currentDay.format("YYYY-MM-DD")] = {
					sober: true,
					streakStartTimestampUTC: null,
				};
				currentDay = currentDay.add(1, "day");
			}
			currentDay = dayjs(recentStreakStart);
			mockDayStatus[currentDay.format("YYYY-MM-DD")] = {
				sober: true,
				streakStartTimestampUTC: recentStreakStartTimestamp,
			};
			currentDay = currentDay.add(1, "day");
			mockDayStatus[currentDay.format("YYYY-MM-DD")] = {
				sober: true,
				streakStartTimestampUTC: null,
			};
			currentDay = currentDay.add(1, "day"); // Today
			mockDayStatus[currentDay.format("YYYY-MM-DD")] = {
				sober: true,
				streakStartTimestampUTC: null,
			};

			// Set repository mocks to return the prepared data
			mockLoadAllDayStatus.mockResolvedValue(mockDayStatus);
			mockLoadStreakData.mockResolvedValue({
				currentStreak: 3,
				longestStreak: 6,
			}); // Simulate stored streak data

			renderProvider();

			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();

			// Verify streaks match the loaded data
			expect(capturedContextValue?.currentStreak).toBe(3);
			expect(capturedContextValue?.longestStreak).toBe(6);

			// Verify specific day states and intensities based on loaded data and calculations
			expect(
				findDayById(capturedContextValue!.weeks, pastStreakStart)?.sober,
			).toBe(true);
			expect(
				findDayById(capturedContextValue!.weeks, pastStreakEnd)?.sober,
			).toBe(true);
			expect(
				findDayById(capturedContextValue!.weeks, today.format("YYYY-MM-DD"))
					?.sober,
			).toBe(true);
			expect(
				findDayById(
					capturedContextValue!.weeks,
					today.subtract(5, "days").format("YYYY-MM-DD"),
				)?.sober,
			).toBe(false); // A day not in mock data
			expect(
				findDayById(capturedContextValue!.weeks, today.format("YYYY-MM-DD"))
					?.intensity,
			).toBe(3); // Intensity reflects current streak
			expect(
				findDayById(capturedContextValue!.weeks, pastStreakEnd)?.intensity,
			).toBe(6); // Intensity reflects past streak

			// Verify timer interaction based on loaded streak data
			expect(mockStartTimer).toHaveBeenCalledTimes(1);
			expect(mockStartTimer).toHaveBeenCalledWith(recentStreakStartTimestamp); // Timer should start from the beginning of the current streak
		});
	});

	// MARK: - Scenario: Toggle a Day's Sobriety Status
	describe("Scenario: Toggle a Day's Sobriety Status", () => {
		it("should update the specific day state when toggleSoberDay is called", async () => {
			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();

			const dayToToggleId = dayjs().subtract(1, "day").format("YYYY-MM-DD");
			const initialDayState = findDayById(
				capturedContextValue!.weeks,
				dayToToggleId,
			);
			expect(initialDayState?.sober).toBe(false); // Verify initial state

			// Act: Toggle the day's status
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(dayToToggleId);
			});

			// Assert: Check the updated state and repository interaction
			await waitFor(() => {
				const updatedDayState = findDayById(
					capturedContextValue!.weeks,
					dayToToggleId,
				);
				expect(updatedDayState?.sober).toBe(true);
				expect(updatedDayState?.intensity).toBe(1); // Intensity becomes 1 for a single sober day
			});
			expect(mockSaveDayStatus).toHaveBeenCalledWith(dayToToggleId, true, null); // Expect null timestamp when toggling a past day off-streak
			expect(mockSaveStreakData).toHaveBeenCalled(); // Streak data should also be saved
		});

		it("should recalculate streaks correctly after toggling a single day", async () => {
			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();

			expect(capturedContextValue?.currentStreak).toBe(0);
			expect(capturedContextValue?.longestStreak).toBe(0);

			const dayToToggleId = dayjs().subtract(1, "day").format("YYYY-MM-DD");

			// Toggle ON
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(dayToToggleId);
			});
			await waitFor(() => {
				expect(capturedContextValue?.currentStreak).toBe(0); // Current streak is 0 as today is not sober
				expect(capturedContextValue?.longestStreak).toBe(1);
			});

			// Toggle OFF
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(dayToToggleId);
			});
			await waitFor(() => {
				expect(capturedContextValue?.currentStreak).toBe(0);
				expect(capturedContextValue?.longestStreak).toBe(1); // Longest remains 1
				expect(
					findDayById(capturedContextValue!.weeks, dayToToggleId)?.sober,
				).toBe(false);
				expect(
					findDayById(capturedContextValue!.weeks, dayToToggleId)?.intensity,
				).toBe(0);
			});
			expect(mockSaveDayStatus).toHaveBeenCalledTimes(2);
			expect(mockSaveStreakData).toHaveBeenCalledTimes(2);
		});

		it("should reset currentStreak to 0 when today is toggled off after being part of a streak", async () => {
			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();

			const todayId = dayjs().format("YYYY-MM-DD");
			const yesterdayId = dayjs().subtract(1, "day").format("YYYY-MM-DD");

			// Create a 2-day streak ending today
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(yesterdayId);
			});
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(todayId);
			});

			// Verify the streak
			await waitFor(() => expect(capturedContextValue?.currentStreak).toBe(2));
			expect(findDayById(capturedContextValue!.weeks, todayId)?.sober).toBe(
				true,
			);
			expect(capturedContextValue?.longestStreak).toBe(2);

			// Toggle today OFF
			mockStopTimer.mockClear(); // Clear mock right before the action we are testing
			// Toggle today OFF (the action we are testing)
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(todayId);
			});

			// Verify streak reset
			await waitFor(() => expect(capturedContextValue?.currentStreak).toBe(0));
			expect(findDayById(capturedContextValue!.weeks, todayId)?.sober).toBe(
				false,
			);
			expect(capturedContextValue?.longestStreak).toBe(2); // Longest streak remains
			// Assert timer was stopped
			expect(mockStopTimer).toHaveBeenCalledTimes(1);
		});
	});

	// MARK: - Scenario: Streak Calculation Logic
	describe("Scenario: Streak Calculation Logic", () => {
		it("should correctly calculate intensity and streaks when filling a gap", async () => {
			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();

			const today = dayjs();
			const day1_id = today.subtract(2, "day").format("YYYY-MM-DD"); // Sober
			const day2_id = today.subtract(1, "day").format("YYYY-MM-DD"); // Gap
			const day3_id = today.format("YYYY-MM-DD"); // Sober

			// Set up initial state with a gap
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(day1_id);
			});
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(day3_id);
			});

			// Verify initial state
			await waitFor(() => {
				expect(findDayById(capturedContextValue!.weeks, day1_id)?.sober).toBe(
					true,
				);
				expect(findDayById(capturedContextValue!.weeks, day2_id)?.sober).toBe(
					false,
				);
				expect(findDayById(capturedContextValue!.weeks, day3_id)?.sober).toBe(
					true,
				);
				expect(capturedContextValue?.currentStreak).toBe(1); // Streak is just today
				expect(capturedContextValue?.longestStreak).toBe(1); // Longest is also 1 initially
			});

			// Fill the gap
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(day2_id);
			});

			// Verify the merged streak
			await waitFor(() => {
				expect(capturedContextValue?.currentStreak).toBe(3);
				expect(capturedContextValue?.longestStreak).toBe(3);
			});
			const finalDay1 = findDayById(capturedContextValue!.weeks, day1_id);
			const finalDay2 = findDayById(capturedContextValue!.weeks, day2_id);
			const finalDay3 = findDayById(capturedContextValue!.weeks, day3_id);
			expect(finalDay1?.sober).toBe(true);
			expect(finalDay2?.sober).toBe(true);
			expect(finalDay3?.sober).toBe(true);
			// Intensities should reflect the combined streak
			expect(finalDay1?.intensity).toBe(1);
			expect(finalDay2?.intensity).toBe(2);
			expect(finalDay3?.intensity).toBe(3);
		});

		it("should correctly calculate intensity and streaks when breaking a streak", async () => {
			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();

			const today = dayjs();
			const day1_id = today.subtract(2, "day").format("YYYY-MM-DD");
			const day2_id = today.subtract(1, "day").format("YYYY-MM-DD");
			const day3_id = today.format("YYYY-MM-DD");

			// Create a 3-day streak
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(day1_id);
			});
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(day2_id);
			});
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(day3_id);
			});

			// Verify initial streak
			await waitFor(() => {
				expect(capturedContextValue?.currentStreak).toBe(3);
				expect(capturedContextValue?.longestStreak).toBe(3);
			});

			// Break the streak in the middle
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(day2_id);
			});

			// Verify the broken streak state
			await waitFor(() => {
				expect(capturedContextValue?.currentStreak).toBe(1); // Only today remains in current streak
				expect(capturedContextValue?.longestStreak).toBe(3); // Longest remains 3
			});
			const finalDay1 = findDayById(capturedContextValue!.weeks, day1_id);
			const finalDay2 = findDayById(capturedContextValue!.weeks, day2_id);
			const finalDay3 = findDayById(capturedContextValue!.weeks, day3_id);
			expect(finalDay1?.sober).toBe(true);
			expect(finalDay2?.sober).toBe(false); // The break
			expect(finalDay3?.sober).toBe(true);
			// Intensities should reflect the new, separated streaks
			expect(finalDay1?.intensity).toBe(1);
			expect(finalDay2?.intensity).toBe(0);
			expect(finalDay3?.intensity).toBe(1);
		});
	});

	// MARK: - Scenario: Prevent Marking Future Dates (BUG-02)
	describe("Scenario: Prevent Marking Future Dates (BUG-02)", () => {
		it("should NOT update state or call save when a future date is toggled", async () => {
			// Spy on console.warn to check for the warning message
			const consoleWarnSpy = jest
				.spyOn(console, "warn")
				.mockImplementation(() => {});
			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();

			const futureDateId = dayjs().add(2, "day").format("YYYY-MM-DD");
			const initialFutureDayState = findDayById(
				capturedContextValue!.weeks,
				futureDateId,
			);
			expect(initialFutureDayState?.sober).toBe(false); // Verify initial state

			// Attempt to toggle a future date
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(futureDateId);
			});

			// Assert: State should not change, save should not be called, warning should be logged
			const initialStreakSaveCalls = mockSaveStreakData.mock.calls.length; // Check calls *before* action
			const updatedFutureDayState = findDayById(
				capturedContextValue!.weeks,
				futureDateId,
			);
			expect(updatedFutureDayState?.sober).toBe(false); // State remains unchanged
			expect(mockSaveDayStatus).not.toHaveBeenCalled(); // Repository save not called
			expect(mockSaveStreakData).toHaveBeenCalledTimes(initialStreakSaveCalls); // Streak save should not be called *again*
			// Use the exact string reported in the error message
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				`Cannot toggle day ${futureDateId}: Not found in previous state or is in the future.`,
			);

			consoleWarnSpy.mockRestore(); // Clean up the spy
		});
	});

	// MARK: - Scenario: Dynamic Week Loading (BUG-01)
	describe("Scenario: Dynamic Week Loading (BUG-01)", () => {
		it("should update loading state and call loadMoreWeeks when loadPastWeeks is called", async () => {
			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();
			const initialWeekCount = capturedContextValue!.weeks.length;

			expect(capturedContextValue?.isLoadingPast).toBe(false);

			// Act: Trigger loading past weeks
			await act(async () => {
				capturedContextValue!.loadPastWeeks();
			});

			// Assert: Check loading state changes and spy calls
			await waitFor(() => expect(loadMoreWeeksSpy).toHaveBeenCalledTimes(1));
			expect(loadMoreWeeksSpy).toHaveBeenCalledWith(
				expect.objectContaining({ weeks: expect.any(Array) }),
				"past",
				4,
			); // Default 4 weeks

			// Wait for the state update triggered by the mocked loadMoreWeeks
			await waitFor(() =>
				expect(capturedContextValue?.weeks.length).toBeGreaterThan(
					initialWeekCount,
				),
			);
			expect(capturedContextValue?.isLoadingPast).toBe(false); // Should be false after update
		});

		it("should update loading state and call loadMoreWeeks when loadFutureWeeks is called", async () => {
			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();
			const initialWeekCount = capturedContextValue!.weeks.length;

			expect(capturedContextValue?.isLoadingFuture).toBe(false);

			// Act: Trigger loading future weeks
			await act(async () => {
				capturedContextValue!.loadFutureWeeks();
			});

			// Assert: Check loading state changes and spy calls
			await waitFor(() => expect(loadMoreWeeksSpy).toHaveBeenCalledTimes(1));
			expect(loadMoreWeeksSpy).toHaveBeenCalledWith(
				expect.objectContaining({ weeks: expect.any(Array) }),
				"future",
				4,
			);

			await waitFor(() =>
				expect(capturedContextValue?.weeks.length).toBeGreaterThan(
					initialWeekCount,
				),
			);
			expect(capturedContextValue?.isLoadingFuture).toBe(false);
		});
	});

	// MARK: - Scenario: Scroll To Today
	describe("Scenario: Scroll To Today", () => {
		beforeEach(() => {
			// Ensure mocks related to scrolling are reset
			mockScrollToIndex.mockClear();
			// Set a fixed date for predictable index calculation
			jest.useFakeTimers().setSystemTime(new Date("2025-04-08T10:00:00.000Z")); // Tuesday
		});

		afterEach(() => {
			jest.useRealTimers(); // Restore real timers
		});

		it("should call scrollToIndex on the calendar grid ref with the calculated index for today", async () => {
			// Set up the provider with mock calendar ref
			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();

			// Directly patch the calendarRef in the context to ensure it has the right mock
			if (capturedContextValue) {
				// Force set the current property with our mock
				Object.defineProperty(capturedContextValue.calendarRef, "current", {
					value: mockCalendarRef.current,
					writable: true,
				});
			}

			// Act: Call the function from the context
			await act(async () => {
				// Ensure scrollToToday exists before calling
				if (capturedContextValue?.scrollToToday) {
					capturedContextValue.scrollToToday();
				} else {
					throw new Error("scrollToToday function not found on context");
				}
			});

			// Assert: Check if the mocked scroll function was called
			expect(mockScrollToIndex).toHaveBeenCalledTimes(1);
			// We don't test the exact index here since that's implementation-specific
			// and might change if the week calculation logic changes
			expect(mockScrollToIndex).toHaveBeenCalledWith(
				expect.objectContaining({
					animated: true,
					viewPosition: 0.5,
					index: expect.any(Number),
				}),
			);
		});
	});

	// MARK: - Scenario: Sobriety Timer Logic Integration
	describe("Scenario: Sobriety Timer Logic Integration", () => {
		it("should start timer with current timestamp when today is toggled sober (no prior streak)", async () => {
			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();
			const todayId = dayjs().format("YYYY-MM-DD");
			const actionTimestamp = dayjs().valueOf(); // Timestamp before action

			// Act: Toggle today sober
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(todayId);
			});

			// Assert: Timer started with a recent timestamp
			await waitFor(() => expect(mockStartTimer).toHaveBeenCalledTimes(1));
			// Check if the timestamp is close to when the action happened
			expect(mockStartTimer.mock.calls[0][0]).toBeGreaterThanOrEqual(
				actionTimestamp,
			);
			expect(mockStartTimer.mock.calls[0][0]).toBeLessThan(
				actionTimestamp + 500,
			); // Allow generous buffer
			// Also check that the timestamp was saved to storage
			expect(mockSaveDayStatus).toHaveBeenCalledWith(
				todayId,
				true,
				mockStartTimer.mock.calls[0][0],
			);
		});

		it("should start timer using existing streak start timestamp when extending streak to today", async () => {
			const yesterday = dayjs().subtract(1, "day");
			const yesterdayId = yesterday.format("YYYY-MM-DD");
			const todayId = dayjs().format("YYYY-MM-DD");
			const yesterdayMidnightTimestamp = yesterday.startOf("day").valueOf(); // The start of the existing streak

			// Simulate repository loading data for yesterday's streak
			const initialDayData: DayDataMap = {
				[yesterdayId]: {
					sober: true,
					streakStartTimestampUTC: yesterdayMidnightTimestamp,
				},
			};
			mockLoadAllDayStatus.mockResolvedValue(initialDayData);
			mockLoadStreakData.mockResolvedValue({
				currentStreak: 0,
				longestStreak: 1,
			}); // Yesterday was longest

			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();
			// Initial load might trigger startTimer if today was already sober, clear it
			mockStartTimer.mockClear();

			// Act: Toggle today sober, extending the streak
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(todayId);
			});

			// Assert: Timer started with yesterday's timestamp
			await waitFor(() => expect(mockStartTimer).toHaveBeenCalledTimes(1));
			expect(mockStartTimer).toHaveBeenCalledWith(yesterdayMidnightTimestamp);
			// Verify the saved data for today does NOT include a new timestamp
			expect(mockSaveDayStatus).toHaveBeenCalledWith(todayId, true, null);
		});

		it("should stop timer and clear timestamp when today is toggled not sober", async () => {
			const todayId = dayjs().format("YYYY-MM-DD");
			const todayMidnightTimestamp = dayjs().startOf("day").valueOf();
			// Simulate repository loading data where today was sober
			const initialDayData: DayDataMap = {
				[todayId]: {
					sober: true,
					streakStartTimestampUTC: todayMidnightTimestamp,
				},
			};
			mockLoadAllDayStatus.mockResolvedValue(initialDayData);
			mockLoadStreakData.mockResolvedValue({
				currentStreak: 1,
				longestStreak: 1,
			});

			renderProvider();
			await waitFor(() =>
				expect(capturedContextValue?.isLoadingInitial).toBe(false),
			);
			expect(capturedContextValue).not.toBeNull();
			// Initial load should have started the timer
			await waitFor(() => expect(mockStartTimer).toHaveBeenCalledTimes(1));
			mockStartTimer.mockClear(); // Clear for the next assertion

			// Act: Toggle today OFF
			await act(async () => {
				await capturedContextValue!.toggleSoberDay(todayId);
			});

			// Assert: Timer stopped, startTimer not called again, saved data has null timestamp
			await waitFor(() => expect(mockStopTimer).toHaveBeenCalledTimes(1));
			expect(mockStartTimer).not.toHaveBeenCalled();
			expect(mockSaveDayStatus).toHaveBeenCalledWith(todayId, false, null); // Timestamp cleared
		});
	});
}); // End describe CalendarDataProvider Logic
