import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { CalendarGrid } from "../CalendarGrid";
import "./mockNativeWind";
import { createMockCalendarData } from "./testUtils";
import { DayData, WeekData } from "../types"; // Import types if needed for mock
import dayjs from "dayjs";

// Import the actual hook module to spy on
import * as useCalendarDataHook from "../hooks/useCalendarData";

// Mock nativewind
jest.mock("nativewind", () => ({
	styled: (component: any) => component,
	useColorScheme: () => "light",
}));

// Mock necessary utils (if still directly used by CalendarGrid/DayCell)
jest.mock("../utils", () => ({
	// Mock all utils used directly by DayCell or CalendarGrid
	getMonthName: jest.fn(
		(month: number) =>
			[
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
			][month],
	),
	// Other utils like getIntensityColor, getTextColorClass, getDayStatus should be handled by the hook
	// Add mocks for utils used by DayCell
	getDayStatus: jest.fn((date: string) => {
		// Simple mock logic: return 'past' for simplicity, or implement basic date comparison
		// Best Practice: Return simple, predictable values without external library logic.
		// Based on the fixed system time "2024-03-25" set in beforeAll.
		if (date === "2024-03-25") return "today";
		if (date < "2024-03-25") return "past";
		return "future"; // Default to future for simplicity
	}),
	getIntensityColor: jest.fn(
		(intensity: number) => `mock-intensity-${intensity}`,
	), // Return a predictable string
	getTextColorClass: jest.fn(
		(intensity: number) => `mock-text-color-${intensity}`,
	), // Return a predictable string
	getStatusTextColor: jest.fn(
		(status: "today" | "past" | "future") => `mock-status-text-${status}`,
	), // Return a predictable string
}));

// Mock the hook that CalendarGrid will use
const mockToggleSoberDay = jest.fn();
const mockLoadPastWeeks = jest.fn();
const mockLoadFutureWeeks = jest.fn();
let mockWeeksData: WeekData[] = []; // This will be populated in beforeEach

// Define the mock implementation for the hook
const mockUseCalendarData = jest.fn(() => ({
	weeks: mockWeeksData,
	currentStreak: 5, // Example value
	longestStreak: 10, // Example value
	toggleSoberDay: mockToggleSoberDay,
	loadPastWeeks: mockLoadPastWeeks,
	loadFutureWeeks: mockLoadFutureWeeks,
	isLoadingInitial: false,
	isLoadingPast: false,
	isLoadingFuture: false,
}));

describe("CalendarGrid", () => {
	// Set a fixed date for consistent testing
	beforeAll(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date(2024, 2, 25)); // March 25, 2024 (Month is 0-indexed)
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	// Reset mocks and set initial data before each test
	beforeEach(() => {
		// Use the test utility to create mock data centered around the fixed date
		// Corrected: Call with zero arguments to match signature. Generates default mock data.
		mockWeeksData = createMockCalendarData().weeks;
		// Reset mock function calls
		mockToggleSoberDay.mockClear();
		mockLoadPastWeeks.mockClear();
		mockLoadFutureWeeks.mockClear();
		// Reset the hook mock itself to ensure fresh state for each test if needed
		// Use spyOn to mock the implementation for this test suite
		jest
			.spyOn(useCalendarDataHook, "useCalendarData")
			.mockImplementation(() => ({
				// Re-apply implementation with fresh mocks
				weeks: mockWeeksData,
				currentStreak: 5,
				longestStreak: 10,
				toggleSoberDay: mockToggleSoberDay,
				loadPastWeeks: mockLoadPastWeeks,
				loadFutureWeeks: mockLoadFutureWeeks,
				isLoadingInitial: false,
				isLoadingPast: false,
				isLoadingFuture: false,
			}));
	});

	// Restore mocks after each test
	afterEach(() => {
		jest.restoreAllMocks();
	});

	// MARK: - Scenario: Initial Calendar Load
	test("renders WeekdayHeader", () => {
		render(<CalendarGrid />);
		expect(screen.getByTestId("weekday-header-container")).toBeTruthy();
	});

	test("renders FlatList", () => {
		render(<CalendarGrid />);
		expect(screen.getByTestId("calendar-grid-list")).toBeTruthy();
	});

	test("renders correct number of DayCell components based on hook data", () => {
		const { getAllByTestId } = render(<CalendarGrid />);
		const dayCells = screen.getAllByTestId("day-cell-touchable");
		// Calculate expected number based on mockWeeksData
		const expectedDayCount = mockWeeksData.reduce(
			(count, week) => count + week.days.length,
			0,
		);
		expect(dayCells).toHaveLength(expectedDayCount);
		// Example: Check if a specific day from mock data is rendered
		// We can't easily target a specific day by ID anymore with the static testID.
		// Instead, we just verify the count, which implicitly checks rendering.
		// If needed, we could check the text content of a specific cell by index.
		// For example, check the text of the 18th cell (index 17):
		// const specificDayIndex = 17; // Corresponds to 2024-01-18 in the mock data
		// expect(within(dayCells[specificDayIndex]).getByText('18')).toBeTruthy();
	});

	test("calls useCalendarData hook on mount", () => {
		render(<CalendarGrid />);
		// Check if the spy was called
		expect(useCalendarDataHook.useCalendarData).toHaveBeenCalledTimes(1);
	});

	// MARK: - Scenario: Toggle a Day's Sobriety Status
	test("calls toggleSoberDay from hook when a day cell is pressed", () => {
		render(<CalendarGrid />);
		// Find all day cells and press the first one (index 0)
		const firstDayData = mockWeeksData[0]?.days[0];
		expect(firstDayData).toBeDefined(); // Ensure mock data is valid
		const dayCells = screen.getAllByTestId("day-cell-touchable");
		expect(dayCells.length).toBeGreaterThan(0); // Ensure cells are rendered
		const firstDayCell = dayCells[0];

		fireEvent.press(firstDayCell);

		// Verify the hook's function was called with the correct ID
		expect(mockToggleSoberDay).toHaveBeenCalledTimes(1);
		expect(mockToggleSoberDay).toHaveBeenCalledWith(firstDayData.id);
	});

	// MARK: - Scenario: Load More Weeks
	test("calls loadFutureWeeks from hook when FlatList reaches end", () => {
		render(<CalendarGrid />);
		const flatList = screen.getByTestId("calendar-grid-list");

		// Simulate reaching the end of the list
		fireEvent(flatList, "onEndReached");

		// Verify the hook's function was called
		expect(mockLoadFutureWeeks).toHaveBeenCalledTimes(1);
	});

	test("calls loadPastWeeks from hook when FlatList scrolls near top", () => {
		render(<CalendarGrid />);
		const flatList = screen.getByTestId("calendar-grid-list");

		// Simulate scrolling near the top. The exact event properties might vary.
		// We trigger the onScroll event, assuming CalendarGrid passes it to FlatList.
		// The actual logic to determine "near top" resides within CalendarGrid (which is not yet refactored).
		// This test *will fail* until CalendarGrid implements the scroll handling logic
		// that calls loadPastWeeks based on the scroll offset.
		fireEvent.scroll(flatList, {
			nativeEvent: {
				contentOffset: { y: 10 }, // Example: Small offset, near top
				contentSize: { height: 1000, width: 400 }, // Example sizes
				layoutMeasurement: { height: 500, width: 400 }, // Example dimensions
			},
		});

		// This assertion checks if the scroll handler in CalendarGrid correctly called the hook function.
		// It's expected to fail initially.
		expect(mockLoadPastWeeks).toHaveBeenCalled();
	});

	// Note: Tests related to *visual updates* after toggling or loading more weeks
	// (e.g., checking background color changes, verifying new weeks appear)
	// are harder to write purely against the mock hook. They depend on the component
	// correctly re-rendering based on the updated `weeks` data provided by the hook.
	// These might be better suited for integration tests or added after the
	// Green phase when the component uses the real hook.
});
