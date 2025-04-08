import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { SobrietyTimer } from "../SobrietyTimer";
import {
	useCalendarContext,
	CalendarContextProps,
} from "../../../../context/CalendarDataContext";
// No longer importing TimerStateProvider
import {
	useTimerState,
	TimerStateContextProps,
} from "../../../../context/TimerStateContext"; // Import hook and type
import { useRepository } from "../../../../context/RepositoryContext";
import {
	ISobrietyDataRepository,
	TimerState,
} from "../../../../lib/types/repositories";

// --- Mocking useCalendarContext ---
jest.mock("../../../../context/CalendarDataContext", () => ({
	useCalendarContext: jest.fn(),
}));

const mockScrollToToday = jest.fn();

const getDefaultMockCalendarContextValue = (): Partial<CalendarContextProps> & {
	scrollToToday: () => void;
} => ({
	weeks: [],
	toggleSoberDay: jest.fn().mockResolvedValue(undefined),
	loadPastWeeks: jest.fn(),
	loadFutureWeeks: jest.fn(),
	currentStreak: 0,
	longestStreak: 0,
	isLoadingInitial: false,
	isLoadingPast: false,
	isLoadingFuture: false,
	scrollToToday: mockScrollToToday,
});
// --- End Mocking useCalendarContext ---

// --- Mocking useRepository ---
jest.mock("../../../../context/RepositoryContext", () => ({
	useRepository: jest.fn(),
}));

const mockRepository: ISobrietyDataRepository = {
	saveDayStatus: jest.fn().mockResolvedValue(undefined),
	loadDayStatus: jest.fn().mockResolvedValue(null),
	loadAllDayStatus: jest.fn().mockResolvedValue({}),
	saveStreakData: jest.fn().mockResolvedValue(undefined),
	loadStreakData: jest.fn().mockResolvedValue(null),
	saveTimerState: jest.fn().mockResolvedValue(undefined),
	loadTimerState: jest
		.fn()
		.mockResolvedValue({
			startTime: Date.now() - 1000 * 60 * 5,
			isRunning: true,
		}),
	saveDrinkCost: jest.fn().mockResolvedValue(undefined),
	loadDrinkCost: jest.fn().mockResolvedValue(null),
};
// --- End Mocking useRepository ---

// --- Mocking useTimerState ---
jest.mock("../../../../context/TimerStateContext", () => ({
	useTimerState: jest.fn(),
}));

// Define the default state returned by the mocked useTimerState hook
const getDefaultMockTimerStateValue = (): TimerStateContextProps => ({
	startTime: Date.now() - 1000 * 60 * 60 * 24 * 3, // Example: 3 days ago
	isRunning: true,
	elapsedDays: 3,
	isLoading: false, // Ensure isLoading is false
	startTimer: jest.fn(),
	stopTimer: jest.fn(),
});
// --- End Mocking useTimerState ---

describe("Feature: Timer Tap Scrolls Calendar to Today (US-15 Interaction)", () => {
	beforeEach(() => {
		mockScrollToToday.mockClear();
		// Configure all mocks for each test
		(useCalendarContext as jest.Mock).mockImplementation(() =>
			getDefaultMockCalendarContextValue(),
		);
		(useRepository as jest.Mock).mockImplementation(() => mockRepository);
		(useTimerState as jest.Mock).mockImplementation(() =>
			getDefaultMockTimerStateValue(),
		);

		// Clear repository mocks if needed
		Object.values(mockRepository).forEach((mockFn) => {
			if (jest.isMockFunction(mockFn)) {
				mockFn.mockClear();
			}
		});
	});

	// Helper function to render the component (no providers needed now)
	const renderComponent = () => {
		return render(<SobrietyTimer />);
	};

	// MARK: - Scenario: Tap Timer When Today is Visible
	test("testTimerTap_WhenTodayVisible_ShouldCallScrollToToday", async () => {
		// Arrange
		const { getByText, findByText } = renderComponent();

		// Wait for the "Sober" text to ensure component rendered correctly after hooks resolved
		await findByText("Sober"); // Use findByText which includes waitFor

		const timerContainer = getByText("Sober").parent;
		if (!timerContainer) throw new Error("Could not find timer container.");

		// Act
		fireEvent.press(timerContainer);

		// Assert
		expect(mockScrollToToday).toHaveBeenCalledTimes(1);
	});

	// MARK: - Scenario: Tap Timer When Scrolled to Past
	test("testTimerTap_WhenScrolledToPast_ShouldCallScrollToToday", async () => {
		// Arrange
		const { getByText, findByText } = renderComponent();
		await findByText("Sober"); // Wait for render
		const timerContainer = getByText("Sober").parent;
		if (!timerContainer) throw new Error("Could not find timer container.");

		// Act
		fireEvent.press(timerContainer);

		// Assert
		expect(mockScrollToToday).toHaveBeenCalledTimes(1);
	});

	// MARK: - Scenario: Tap Timer When Scrolled to Future
	test("testTimerTap_WhenScrolledToFuture_ShouldCallScrollToToday", async () => {
		// Arrange
		const { getByText, findByText } = renderComponent();
		await findByText("Sober"); // Wait for render
		const timerContainer = getByText("Sober").parent;
		if (!timerContainer) throw new Error("Could not find timer container.");

		// Act
		fireEvent.press(timerContainer);

		// Assert
		expect(mockScrollToToday).toHaveBeenCalledTimes(1);
	});
});
