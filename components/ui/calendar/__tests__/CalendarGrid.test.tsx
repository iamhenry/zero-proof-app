import React from "react";
import {
	render,
	fireEvent,
	screen,
	act,
	waitFor,
} from "@testing-library/react-native";
import { CalendarGrid } from "../CalendarGrid";
import "./mockNativeWind";
import { createMockCalendarData } from "./testUtils";
import { DayData, WeekData } from "../types";
import dayjs from "dayjs";

// Import Providers and context hooks
import { CalendarDataProvider } from "@/context/CalendarDataContext";
import { useRepository } from "@/context/RepositoryContext";
import { useTimerState } from "@/context/TimerStateContext";
import {
	ISobrietyDataRepository,
	StreakData,
	TimerState,
	StoredDayData,
	DayDataMap,
} from "@/lib/types/repositories";

// Import the actual utils module to spy on
import * as CalendarUtils from "../utils";

// --- Top-Level Mocks ---

// Mock nativewind
jest.mock("nativewind", () => ({
	styled: (component: any) => component,
	useColorScheme: () => "light",
}));

// DO NOT mock the entire utils module here anymore
// jest.mock("../utils", ...);

// Define individual mock functions for the repository
const mockLoadAllDayStatus = jest.fn<Promise<DayDataMap>, []>();
const mockSaveDayStatus = jest
	.fn<Promise<void>, [string, boolean, number | null]>()
	.mockResolvedValue(undefined); // Ensure it returns a Promise
const mockLoadDayStatus = jest.fn<Promise<StoredDayData | null>, [string]>();
const mockSaveStreakData = jest.fn<Promise<void>, [StreakData]>();
const mockLoadStreakData = jest.fn<Promise<StreakData | null>, []>();
const mockSaveTimerState = jest.fn<Promise<void>, [TimerState]>();
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

// Mock the context consumer hooks
jest.mock("@/context/RepositoryContext", () => ({
	useRepository: () => mockRepository,
}));
jest.mock("@/context/TimerStateContext", () => ({
	useTimerState: () => mockTimerStateValue,
}));
// --- End Mocks ---

// Helper to render with the CalendarDataProvider
const renderWithProviders = (ui: React.ReactElement) => {
	return render(<CalendarDataProvider>{ui}</CalendarDataProvider>);
};

describe("CalendarGrid", () => {
	let loadMoreWeeksSpy: jest.SpyInstance; // Declare spy variable

	beforeAll(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date(2024, 2, 25)); // March 25, 2024
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	beforeEach(() => {
		// Clear all individual mock functions
		mockLoadAllDayStatus.mockClear();
		mockSaveDayStatus.mockClear();
		mockLoadDayStatus.mockClear();
		mockSaveStreakData.mockClear();
		mockLoadStreakData.mockClear();
		mockSaveTimerState.mockClear();
		mockLoadTimerState.mockClear();
		mockSaveDrinkCost.mockClear();
		mockLoadDrinkCost.mockClear();
		mockStartTimer.mockClear();
		mockStopTimer.mockClear();
		mockLoadInitialTimerState.mockClear();

		// Reset default resolved values
		mockLoadAllDayStatus.mockResolvedValue({});
		mockLoadStreakData.mockResolvedValue({
			currentStreak: 0,
			longestStreak: 0,
		});
		mockLoadTimerState.mockResolvedValue({ startTime: null, isRunning: false });
		mockLoadDayStatus.mockResolvedValue(null);
		mockLoadDrinkCost.mockResolvedValue(null);

		// Spy on loadMoreWeeks and provide mock implementation
		loadMoreWeeksSpy = jest
			.spyOn(CalendarUtils, "loadMoreWeeks")
			.mockImplementation((data, direction) => {
				console.log(`Spy: loadMoreWeeks called for ${direction}`);
				return { ...data, weeks: [...data.weeks] }; // Return a copy
			});
	});

	afterEach(() => {
		// Restore all mocks, including the spy
		jest.restoreAllMocks();
	});

	// MARK: - Scenario: Initial Calendar Load
	test("renders WeekdayHeader", async () => {
		renderWithProviders(<CalendarGrid />);
		await screen.findByTestId("weekday-header-container");
		expect(screen.getByTestId("weekday-header-container")).toBeTruthy();
	});

	test("renders FlatList", async () => {
		renderWithProviders(<CalendarGrid />);
		await screen.findByTestId("calendar-grid-list");
		expect(screen.getByTestId("calendar-grid-list")).toBeTruthy();
	});

	test("renders DayCell components after initial load", async () => {
		const initialDayData = {
			"2024-03-25": { sober: true, streakStartTimestampUTC: null },
		};
		mockLoadAllDayStatus.mockResolvedValue(initialDayData);

		renderWithProviders(<CalendarGrid />);
		await screen.findAllByTestId("day-cell-touchable"); // Wait for cells

		const dayCells = screen.queryAllByTestId("day-cell-touchable");
		expect(dayCells.length).toBeGreaterThan(0);
		expect(mockLoadAllDayStatus).toHaveBeenCalledTimes(1);
	}, 10000);

	// MARK: - Scenario: Toggle a Day's Sobriety Status
	test("triggers day toggle logic when a day cell is pressed", async () => {
		const dayToPressId = "2024-03-24"; // Past day
		const initialDayData = {
			[dayToPressId]: { sober: false, streakStartTimestampUTC: null },
		};
		mockLoadAllDayStatus.mockResolvedValue(initialDayData);

		renderWithProviders(<CalendarGrid />);
		const dayCells = await screen.findAllByTestId("day-cell-touchable");
		expect(dayCells.length).toBeGreaterThan(0);

		const targetCell = dayCells[0]; // Pressing first cell for simplicity
		if (!targetCell) throw new Error("Could not find a day cell to press");

		fireEvent.press(targetCell);

		await waitFor(() => expect(mockSaveDayStatus).toHaveBeenCalledTimes(1));
		expect(mockSaveDayStatus).toHaveBeenCalledWith(
			expect.any(String),
			true,
			null,
		);
	});

	// MARK: - Scenario: Load More Weeks
	test("calls loadMoreWeeks util when FlatList reaches end", async () => {
		renderWithProviders(<CalendarGrid />);
		const flatList = await screen.findByTestId("calendar-grid-list");

		fireEvent(flatList, "onEndReached");

		// Wait for the spy to be called
		await waitFor(() => expect(loadMoreWeeksSpy).toHaveBeenCalledTimes(1));

		expect(loadMoreWeeksSpy).toHaveBeenCalledWith(
			expect.anything(),
			"future",
			4,
		);
	});

	test("calls loadMoreWeeks util when FlatList scrolls near top", async () => {
		renderWithProviders(<CalendarGrid />);
		const flatList = await screen.findByTestId("calendar-grid-list");

		fireEvent.scroll(flatList, {
			nativeEvent: {
				contentOffset: { y: 10 },
				contentSize: { height: 1000, width: 400 },
				layoutMeasurement: { height: 500, width: 400 },
			},
		});

		// Wait for the spy to be called
		await waitFor(() => expect(loadMoreWeeksSpy).toHaveBeenCalledTimes(1));

		expect(loadMoreWeeksSpy).toHaveBeenCalledWith(expect.anything(), "past", 4);
	});

	// MARK: - Scenario: Programmatic Scrolling and Future Date Loading
	describe("Programmatic Scrolling and Future Date Loading", () => {
		test("should reset isProgrammaticScrolling flag after initial scroll to today", async () => {
			// Arrange
			renderWithProviders(<CalendarGrid />);
			const flatList = await screen.findByTestId("calendar-grid-list");

			// Act - simulate completion of initial scroll
			act(() => {
				jest.advanceTimersByTime(1000); // advance past the initial scroll timeout
			});

			// Simulate user scroll to bottom
			fireEvent.scroll(flatList, {
				nativeEvent: {
					contentOffset: { y: 500 },
					contentSize: { height: 1000, width: 400 },
					layoutMeasurement: { height: 500, width: 400 },
				},
			});

			// Assert - should load future dates since flag should be reset
			await waitFor(() => {
				expect(loadMoreWeeksSpy).toHaveBeenCalledWith(
					expect.anything(),
					"future",
					4,
				);
			});
		});

		test("should load future dates on first scroll to bottom without loading past dates", async () => {
			// Arrange
			renderWithProviders(<CalendarGrid />);
			const flatList = await screen.findByTestId("calendar-grid-list");

			// Act - simulate completion of initial scroll and flag reset
			act(() => {
				jest.advanceTimersByTime(1000);
			});

			// Simulate scroll to bottom without loading past dates
			fireEvent(flatList, "onEndReached");

			// Assert
			await waitFor(() => {
				expect(loadMoreWeeksSpy).toHaveBeenCalledWith(
					expect.anything(),
					"future",
					4,
				);
			});
			// Verify past dates weren't loaded
			expect(loadMoreWeeksSpy).not.toHaveBeenCalledWith(
				expect.anything(),
				"past",
				expect.any(Number),
			);
		});

		test("should handle user scroll during programmatic scroll", async () => {
			// Arrange
			renderWithProviders(<CalendarGrid />);
			const flatList = await screen.findByTestId("calendar-grid-list");

			// Act - simulate user scroll during programmatic scroll
			fireEvent.scroll(flatList, {
				nativeEvent: {
					contentOffset: { y: 100 },
					contentSize: { height: 1000, width: 400 },
					layoutMeasurement: { height: 500, width: 400 },
				},
			});

			// Simulate reaching the bottom
			fireEvent(flatList, "onEndReached");

			// Assert
			await waitFor(() => {
				expect(loadMoreWeeksSpy).toHaveBeenCalledWith(
					expect.anything(),
					"future",
					4,
				);
			});
		});
	});
});
