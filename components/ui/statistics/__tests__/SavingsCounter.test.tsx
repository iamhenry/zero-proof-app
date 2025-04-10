// components/ui/statistics/__tests__/SavingsCounter.test.tsx
import React, { ReactNode } from "react";
import { render, act, waitFor } from "@testing-library/react-native";
import { SavingsCounter } from "../SavingsCounter";
import { SavingsDataProvider } from "../../../../context/SavingsDataContext";
import { useCalendarContext } from "../../../../context/CalendarDataContext"; // Import the hook to mock
import * as FinancialService from "../../../../lib/services/financial-service"; // Import service to mock
import { WeekData, DayData } from "../../../ui/calendar/types"; // Corrected import path

// --- Mocks ---

// Mock the useCalendarContext hook
jest.mock("../../../../context/CalendarDataContext", () => ({
	useCalendarContext: jest.fn(),
}));

// Mock the financial service module
jest.mock("../../../../lib/services/financial-service", () => ({
	calculateSavings: jest.fn(),
}));

// Type assertions for mocked hooks/functions
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

// Wrapper component to provide ONLY the SavingsDataProvider
// The CalendarDataContext is mocked via useCalendarContext
const TestWrapper = ({ children }: { children: ReactNode }) => (
	<SavingsDataProvider>{children}</SavingsDataProvider>
);

// --- Tests ---

describe("SavingsCounter Component Integration", () => {
	beforeEach(() => {
		// Reset mocks before each test
		mockedUseCalendarContext.mockClear();
		mockedCalculateSavings.mockClear();
	});

	// MARK: - Scenario: Display Initial Savings
	it("should display the initial savings calculated based on CalendarDataContext", () => {
		const initialSoberDays = 15;
		const mockWeeks = createMockWeeks(initialSoberDays);
		const expectedInitialSavings = 150; // Example: 15 days * 2 drinks/day * $5/drink

		// Setup mocks
		mockedUseCalendarContext.mockReturnValue({ weeks: mockWeeks }); // Provide mock weeks via the hook
		mockedCalculateSavings.mockReturnValue(expectedInitialSavings);

		// Render with wrapper
		const { getByText } = render(<SavingsCounter />, { wrapper: TestWrapper });

		// Assertions
		expect(mockedUseCalendarContext).toHaveBeenCalled();
		expect(mockedCalculateSavings).toHaveBeenCalledWith(initialSoberDays);
		expect(getByText(`$${expectedInitialSavings}`)).toBeTruthy();
	});

	it("should display $0 when initial sober days are 0", () => {
		const initialSoberDays = 0;
		const mockWeeks = createMockWeeks(initialSoberDays);
		const expectedInitialSavings = 0;

		// Setup mocks
		mockedUseCalendarContext.mockReturnValue({ weeks: mockWeeks });
		mockedCalculateSavings.mockReturnValue(expectedInitialSavings);

		const { getByText } = render(<SavingsCounter />, { wrapper: TestWrapper });

		expect(mockedCalculateSavings).toHaveBeenCalledWith(initialSoberDays);
		expect(getByText(`$${expectedInitialSavings}`)).toBeTruthy();
	});

	// MARK: - Scenario: Savings Counter Updates (Reactivity)
	it("should update the displayed savings when CalendarDataContext weeks data changes", async () => {
		const initialSoberDays = 15;
		const initialMockWeeks = createMockWeeks(initialSoberDays);
		const initialExpectedSavings = 150;

		const updatedSoberDays = 20; // Simulate more sober days
		const updatedMockWeeks = createMockWeeks(updatedSoberDays);
		const updatedExpectedSavings = 200; // 20 * 2 * 5

		// Initial mock setup
		mockedUseCalendarContext.mockReturnValue({ weeks: initialMockWeeks });
		mockedCalculateSavings.mockReturnValue(initialExpectedSavings);

		// Initial render
		const { getByText, rerender } = render(<SavingsCounter />, {
			wrapper: TestWrapper,
		});

		// Check initial state
		expect(mockedCalculateSavings).toHaveBeenCalledWith(initialSoberDays);
		expect(getByText(`$${initialExpectedSavings}`)).toBeTruthy();

		// Simulate update in CalendarDataContext by changing the mock hook's return value
		mockedUseCalendarContext.mockReturnValue({ weeks: updatedMockWeeks });
		mockedCalculateSavings.mockReturnValue(updatedExpectedSavings); // Update calc mock too

		// Rerender the component to trigger the updated context consumption
		// Use act because the state update within SavingsDataProvider might happen
		act(() => {
			rerender(<SavingsCounter />);
		});

		// Verify the displayed savings updated after context change
		// Use waitFor because the update within SavingsDataProvider might be async or batched
		await waitFor(() => {
			// SavingsDataProvider recalculates based on the new 'weeks' from the mocked hook
			expect(mockedCalculateSavings).toHaveBeenCalledTimes(2); // Called initially and on update
			expect(mockedCalculateSavings).toHaveBeenCalledWith(updatedSoberDays);
			expect(getByText(`$${updatedExpectedSavings}`)).toBeTruthy();
		});
	});
});
