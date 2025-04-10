// context/__tests__/SavingsDataContext.test.tsx
import React, { ReactNode } from "react";
import { renderHook, act } from "@testing-library/react-native";
import { SavingsDataProvider, useSavingsData } from "../SavingsDataContext";
import { useCalendarContext } from "../CalendarDataContext"; // Import the hook to mock
import * as FinancialService from "../../lib/services/financial-service"; // Import service to mock
import { WeekData, DayData } from "components/ui/calendar/types"; // Corrected import path

// --- Mocks ---

// Mock the useCalendarContext hook
jest.mock("../CalendarDataContext", () => ({
	useCalendarContext: jest.fn(),
}));

// Mock the financial service module
jest.mock("../../lib/services/financial-service", () => ({
	calculateSavings: jest.fn(),
}));

// Type assertion for mocked hooks/functions
const mockedUseCalendarContext = useCalendarContext as jest.Mock;
const mockedCalculateSavings = FinancialService.calculateSavings as jest.Mock;

// Helper to create mock weeks data based on sober days count
const createMockWeeks = (soberDaysCount: number): WeekData[] => {
	const days: DayData[] = [];
	const year = 2025;
	const month = 1; // January
	for (let i = 0; i < 30; i++) {
		// Create 30 days for simplicity
		const day = i + 1;
		const date = new Date(Date.UTC(year, month - 1, day)); // Use UTC for consistency
		const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		days.push({
			id: `${dateString}-${i}`, // Simple unique ID
			date: dateString,
			day: day,
			month: month,
			year: year,
			sober: i < soberDaysCount, // Mark first 'soberDaysCount' days as sober
			intensity: i < soberDaysCount ? 1 : 0,
			streakStartTimestampUTC: null, // Default to null for simplicity
			isFirstOfMonth: day === 1,
		});
	}
	// Group into weeks (simplified: one large week for this test)
	return [{ id: "mock-week-1", days }];
};

// --- Test Setup ---

// Wrapper component to provide the necessary context
const wrapper = ({ children }: { children: ReactNode }) => (
	<SavingsDataProvider>{children}</SavingsDataProvider>
);

// --- Tests ---

describe("SavingsDataContext & useSavingsData Hook", () => {
	beforeEach(() => {
		// Reset mocks before each test
		mockedUseCalendarContext.mockClear();
		mockedCalculateSavings.mockClear();
	});

	// MARK: - Scenario: Initial Savings Calculation
	it("should calculate initial savings based on sober days from CalendarDataContext", () => {
		const initialSoberDays = 10;
		const mockWeeks = createMockWeeks(initialSoberDays);
		const expectedSavings = 100; // Example value, calculation is mocked

		// Setup mocks
		mockedUseCalendarContext.mockReturnValue({ weeks: mockWeeks });
		mockedCalculateSavings.mockReturnValue(expectedSavings);

		// Render the hook within the provider
		const { result } = renderHook(() => useSavingsData(), { wrapper });

		// Assertions
		expect(mockedUseCalendarContext).toHaveBeenCalled();
		expect(mockedCalculateSavings).toHaveBeenCalledWith(initialSoberDays);
		expect(result.current.currentSavings).toBe(expectedSavings);
	});

	it("should provide 0 savings when initial sober days are 0", () => {
		const initialSoberDays = 0;
		const mockWeeks = createMockWeeks(initialSoberDays);
		const expectedSavings = 0;

		// Setup mocks
		mockedUseCalendarContext.mockReturnValue({ weeks: mockWeeks });
		mockedCalculateSavings.mockReturnValue(expectedSavings);

		// Render the hook
		const { result } = renderHook(() => useSavingsData(), { wrapper });

		// Assertions
		expect(mockedCalculateSavings).toHaveBeenCalledWith(initialSoberDays);
		expect(result.current.currentSavings).toBe(expectedSavings);
	});

	// MARK: - Scenario: Savings Counter Updates (Reactivity)
	it("should update savings when CalendarDataContext weeks data changes", () => {
		const initialSoberDays = 5;
		const initialMockWeeks = createMockWeeks(initialSoberDays);
		const initialExpectedSavings = 50;

		// Initial setup
		mockedUseCalendarContext.mockReturnValue({ weeks: initialMockWeeks });
		mockedCalculateSavings.mockReturnValue(initialExpectedSavings);

		// Initial render
		const { result, rerender } = renderHook(() => useSavingsData(), {
			wrapper,
		});

		// Initial assertions
		expect(mockedCalculateSavings).toHaveBeenCalledWith(initialSoberDays);
		expect(result.current.currentSavings).toBe(initialExpectedSavings);

		// Simulate update in CalendarDataContext
		const updatedSoberDays = 7;
		const updatedMockWeeks = createMockWeeks(updatedSoberDays);
		const updatedExpectedSavings = 70;

		// Update mocks and trigger rerender by changing context value
		mockedUseCalendarContext.mockReturnValue({ weeks: updatedMockWeeks });
		mockedCalculateSavings.mockReturnValue(updatedExpectedSavings);

		// Rerender the hook (simulates provider re-rendering due to context change)
		rerender();

		// Assertions after update
		// The hook depends on `weeks`, so calculateSavings should be called again
		expect(mockedCalculateSavings).toHaveBeenCalledTimes(2); // Called initially and on update
		expect(mockedCalculateSavings).toHaveBeenCalledWith(updatedSoberDays);
		expect(result.current.currentSavings).toBe(updatedExpectedSavings);
	});

	it("should throw an error if useSavingsData is used outside of SavingsDataProvider", () => {
		// Suppress console.error output from React for this expected error
		const originalError = console.error;
		console.error = jest.fn();

		// Expect renderHook without the wrapper to throw
		expect(() => renderHook(() => useSavingsData())).toThrow(
			"useSavingsData must be used within a SavingsDataProvider",
		);

		// Restore console.error
		console.error = originalError;
	});
});
