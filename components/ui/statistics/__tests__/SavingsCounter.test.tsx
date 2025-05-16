// components/ui/statistics/__tests__/SavingsCounter.test.tsx
import React, { ReactNode } from "react";
import { render, act, waitFor } from "@testing-library/react-native";
import { SavingsCounter } from "../SavingsCounter";
import { SavingsDataProvider } from "../../../../context/SavingsDataContext";
import { useCalendarContext } from "../../../../context/CalendarDataContext";
import { RepositoryContext } from "../../../../context/RepositoryContext";
import * as FinancialService from "../../../../lib/services/financial-service";
import { WeekData, DayData } from "../../../ui/calendar/types";
import { ISobrietyDataRepository } from "../../../../lib/types/repositories";

// --- Mocks ---

// Mock the useCalendarContext hook
jest.mock("../../../../context/CalendarDataContext", () => ({
	useCalendarContext: jest.fn(),
}));

// Mock the financial service module
jest.mock("../../../../lib/services/financial-service", () => ({
	calculateSavings: jest.fn(),
}));

// Type assertion for mocked hooks/functions
const mockedUseCalendarContext = useCalendarContext as jest.Mock;
const mockedCalculateSavings = FinancialService.calculateSavings as jest.Mock;

// Helper to create mock day data
const createMockDayData = (overrides: Partial<DayData> = {}): DayData => ({
	id: "2024-01-01",
	date: "2024-01-01",
	day: 1,
	month: 0,
	year: 2024,
	sober: false,
	intensity: 0,
	isFirstOfMonth: true,
	streakStartTimestampUTC: null,
	...overrides,
});

// Helper to create mock week data
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

// Mock repository
const mockRepository: jest.Mocked<ISobrietyDataRepository> = {
	loadDayStatus: jest.fn(),
	saveDayStatus: jest.fn(),
	loadAllDayStatus: jest.fn(),
	loadDrinkCost: jest.fn(),
	saveDrinkCost: jest.fn(),
	loadStreakData: jest.fn(),
	saveStreakData: jest.fn(),
	loadTimerState: jest.fn(),
	saveTimerState: jest.fn(),
};

// --- Test Setup ---

// Wrapper component to provide both SavingsDataProvider and RepositoryContext
const TestWrapper = ({ children }: { children: ReactNode }) => (
	<RepositoryContext.Provider value={mockRepository}>
		<SavingsDataProvider>{children}</SavingsDataProvider>
	</RepositoryContext.Provider>
);

describe("SavingsCounter Component Integration", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockRepository.loadDrinkCost.mockResolvedValue(14); // Default to 14 drinks per week
	});

	// MARK: - Scenario: Initial Savings Display
	it("displays initial savings based on sober days", async () => {
		const initialSoberDays = 5;
		const mockWeeks = createMockWeeks(initialSoberDays);
		const expectedInitialSavings = 50;

		// Setup mocks
		mockedUseCalendarContext.mockReturnValue({ weeks: mockWeeks });
		mockedCalculateSavings.mockReturnValue(expectedInitialSavings);

		const { getByText } = render(<SavingsCounter />, { wrapper: TestWrapper });

		await waitFor(() => {
			expect(mockedCalculateSavings).toHaveBeenCalledWith(initialSoberDays, 14);
			expect(getByText(`$${expectedInitialSavings}`)).toBeTruthy();
		});
	});

	it("should display $0 when initial sober days are 0", async () => {
		const initialSoberDays = 0;
		const mockWeeks = createMockWeeks(initialSoberDays);
		const weeklyDrinks = 14;
		const expectedInitialSavings = 0;

		// Setup mocks
		mockedUseCalendarContext.mockReturnValue({ weeks: mockWeeks });
		mockRepository.loadDrinkCost.mockResolvedValue(weeklyDrinks);
		mockedCalculateSavings.mockReturnValue(expectedInitialSavings);

		const { getByText } = render(<SavingsCounter />, { wrapper: TestWrapper });

		await waitFor(() => {
			expect(mockedCalculateSavings).toHaveBeenCalledWith(
				initialSoberDays,
				weeklyDrinks,
			);
			expect(getByText(`$${expectedInitialSavings}`)).toBeTruthy();
		});
	});

	// MARK: - Scenario: Savings Counter Updates (Reactivity)
	it("should update the displayed savings when CalendarDataContext weeks data changes", async () => {
		const initialSoberDays = 5;
		const initialMockWeeks = createMockWeeks(initialSoberDays);
		const initialExpectedSavings = 50;

		// Initial setup
		mockedUseCalendarContext.mockReturnValue({ weeks: initialMockWeeks });
		mockedCalculateSavings.mockReturnValue(initialExpectedSavings);

		// Initial render
		const { getByText, rerender } = render(<SavingsCounter />, {
			wrapper: TestWrapper,
		});

		// Initial assertions
		await waitFor(() => {
			expect(mockedCalculateSavings).toHaveBeenCalledWith(initialSoberDays, 14);
			expect(getByText(`$${initialExpectedSavings}`)).toBeTruthy();
		});

		// Simulate update in CalendarDataContext
		const updatedSoberDays = 7;
		const updatedMockWeeks = createMockWeeks(updatedSoberDays);
		const updatedExpectedSavings = 70;

		// Update mocks and trigger rerender by changing context value
		mockedUseCalendarContext.mockReturnValue({ weeks: updatedMockWeeks });
		mockedCalculateSavings.mockReturnValue(updatedExpectedSavings);

		// Rerender the component (simulates provider re-rendering due to context change)
		rerender(<SavingsCounter />);

		// Assertions after update
		await waitFor(() => {
			expect(mockedCalculateSavings).toHaveBeenCalledWith(updatedSoberDays, 14);
			expect(getByText(`$${updatedExpectedSavings}`)).toBeTruthy();
		});
	});

	// MARK: - Scenario: Loading State
	it("should show loading indicator while drink cost is being loaded", async () => {
		const mockWeeks = createMockWeeks(5);
		mockedUseCalendarContext.mockReturnValue({ weeks: mockWeeks });

		// Delay the loadDrinkCost resolution
		let resolveLoadDrinkCost: (value: number) => void;
		mockRepository.loadDrinkCost.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveLoadDrinkCost = resolve;
				}),
		);

		const { getByTestId } = render(<SavingsCounter />, {
			wrapper: TestWrapper,
		});

		// Initially should show loading indicator
		expect(getByTestId("activity-indicator")).toBeTruthy();

		// Resolve the loadDrinkCost promise
		await act(async () => {
			resolveLoadDrinkCost!(14);
		});

		// After loading, should show the savings amount
		await waitFor(() => {
			expect(() => getByTestId("activity-indicator")).toThrow();
		});
	});

	it("should handle errors gracefully when loading drink cost fails", async () => {
		const mockWeeks = createMockWeeks(5);
		mockedUseCalendarContext.mockReturnValue({ weeks: mockWeeks });
		mockRepository.loadDrinkCost.mockRejectedValue(new Error("Load failed"));
		mockedCalculateSavings.mockReturnValue(50); // Using default weekly drinks

		const { getByText } = render(<SavingsCounter />, { wrapper: TestWrapper });

		await waitFor(() => {
			expect(getByText("$50")).toBeTruthy(); // Should still display savings using default value
		});
	});
});
