// context/__tests__/SavingsDataContext.test.tsx
import React, { ReactNode } from "react";
import { renderHook, act } from "@testing-library/react-native";
import { SavingsDataProvider, useSavingsData } from "../SavingsDataContext";
import { useCalendarContext } from "../CalendarDataContext";
import { RepositoryProvider, RepositoryContext } from "../RepositoryContext";
import * as FinancialService from "../../lib/services/financial-service";
import { WeekData, DayData } from "@/components/ui/calendar/types";
import { ISobrietyDataRepository } from "../../lib/types/repositories";

// --- Mocks ---

// Mock the useCalendarContext hook
jest.mock("../CalendarDataContext", () => ({
	useCalendarContext: jest.fn(),
}));

// Mock the financial service module
jest.mock("../../lib/services/financial-service", () => ({
	calculateSavings: jest.fn(
		(soberDays: number, weeklyDrinks: number) => soberDays * weeklyDrinks,
	),
}));

// Type assertion for mocked hooks/functions
const mockedUseCalendarContext = useCalendarContext as jest.Mock;
const mockedCalculateSavings = FinancialService.calculateSavings as jest.Mock;

// Create a mock repository
const mockRepository: ISobrietyDataRepository = {
	loadDrinkCost: jest.fn().mockResolvedValue(10), // Default to 10 drinks per week
	saveDrinkCost: jest.fn().mockResolvedValue(undefined),
	loadDayStatus: jest.fn(),
	saveDayStatus: jest.fn(),
	loadStreakData: jest.fn(),
	saveStreakData: jest.fn(),
	loadTimerState: jest.fn(),
	saveTimerState: jest.fn(),
	loadAllDayStatus: jest.fn(), // Add the missing method
};

// Helper to create mock weeks data based on sober days count
const createMockWeeks = (soberDaysCount: number): WeekData[] => {
	const days: DayData[] = [];
	const year = 2025;
	const month = 1; // January
	for (let i = 0; i < 30; i++) {
		const day = i + 1;
		const date = new Date(Date.UTC(year, month - 1, day));
		const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		days.push({
			id: `${dateString}-${i}`,
			date: dateString,
			day: day,
			month: month,
			year: year,
			sober: i < soberDaysCount,
			intensity: i < soberDaysCount ? 1 : 0,
			streakStartTimestampUTC: null,
			isFirstOfMonth: day === 1,
		});
	}
	return [{ id: "mock-week-1", days }];
};

// Wrapper component to provide the necessary context
const wrapper = ({ children }: { children: ReactNode }) => (
	<RepositoryContext.Provider value={mockRepository}>
		<SavingsDataProvider>{children}</SavingsDataProvider>
	</RepositoryContext.Provider>
);

// --- Tests ---

describe("SavingsDataContext & useSavingsData Hook", () => {
	beforeEach(() => {
		// Reset mocks before each test
		mockedUseCalendarContext.mockClear();
		mockedCalculateSavings.mockClear();
		(mockRepository.loadDrinkCost as jest.Mock).mockClear();
		// Ensure loadDrinkCost has a default mock implementation for each test
		(mockRepository.loadDrinkCost as jest.Mock).mockResolvedValue(10);
	});

	// MARK: - Scenario: Initial Savings Calculation
	it("should calculate initial savings based on sober days from CalendarDataContext", async () => {
		const initialSoberDays = 10;
		const mockWeeks = createMockWeeks(initialSoberDays);
		const expectedSavings = 100; // 10 sober days * 10 drinks per week = 100

		// Setup mocks
		mockedUseCalendarContext.mockReturnValue({ weeks: mockWeeks });

		// Render the hook within the provider
		const { result } = renderHook(() => useSavingsData(), { wrapper });

		// Wait for the async operations to complete
		await act(async () => {
			await Promise.resolve();
		});

		// Assertions
		expect(mockedUseCalendarContext).toHaveBeenCalled();
		expect(mockRepository.loadDrinkCost).toHaveBeenCalled();
		expect(mockedCalculateSavings).toHaveBeenCalledWith(initialSoberDays, 10);
		expect(result.current.currentSavings).toBe(expectedSavings);
		expect(result.current.isLoading).toBe(false);
	});

	it("should provide 0 savings when initial sober days are 0", async () => {
		const initialSoberDays = 0;
		const mockWeeks = createMockWeeks(initialSoberDays);
		const expectedSavings = 0; // 0 sober days * 10 drinks per week = 0

		// Setup mocks
		mockedUseCalendarContext.mockReturnValue({ weeks: mockWeeks });

		// Render the hook
		const { result } = renderHook(() => useSavingsData(), { wrapper });

		// Wait for the async operations to complete
		await act(async () => {
			await Promise.resolve();
		});

		// Assertions
		expect(mockRepository.loadDrinkCost).toHaveBeenCalled();
		expect(mockedCalculateSavings).toHaveBeenCalledWith(initialSoberDays, 10);
		expect(result.current.currentSavings).toBe(expectedSavings);
		expect(result.current.isLoading).toBe(false);
	});

	// MARK: - Scenario: Savings Counter Updates (Reactivity)
	it("should update savings when CalendarDataContext weeks data changes", async () => {
		const initialSoberDays = 5;
		const initialMockWeeks = createMockWeeks(initialSoberDays);
		const initialExpectedSavings = 50; // 5 sober days * 10 drinks per week = 50

		// Initial setup
		mockedUseCalendarContext.mockReturnValue({ weeks: initialMockWeeks });

		// Initial render
		const { result, rerender } = renderHook(() => useSavingsData(), {
			wrapper,
		});

		// Wait for initial async operations
		await act(async () => {
			await Promise.resolve();
		});

		// Initial assertions
		expect(mockedCalculateSavings).toHaveBeenCalledWith(initialSoberDays, 10);
		expect(result.current.currentSavings).toBe(initialExpectedSavings);

		// Simulate update in CalendarDataContext
		const updatedSoberDays = 7;
		const updatedMockWeeks = createMockWeeks(updatedSoberDays);
		const updatedExpectedSavings = 70; // 7 sober days * 10 drinks per week = 70

		// Update mocks and trigger rerender
		mockedUseCalendarContext.mockReturnValue({ weeks: updatedMockWeeks });
		rerender({ children: null });

		// Wait for any async updates
		await act(async () => {
			await Promise.resolve();
		});

		// Assertions after update
		expect(mockedCalculateSavings).toHaveBeenCalledWith(updatedSoberDays, 10);
		expect(result.current.currentSavings).toBe(updatedExpectedSavings);
	});

	// MARK: - Scenario: Drink Cost Update
	it("should recalculate savings when drink cost is updated and refreshed", async () => {
		const initialSoberDays = 5;
		const initialDrinkCost = 10;
		const initialExpectedSavings = initialSoberDays * initialDrinkCost;

		// Initial setup for mocks
		mockedUseCalendarContext.mockReturnValue({
			weeks: createMockWeeks(initialSoberDays),
		});
		(mockRepository.loadDrinkCost as jest.Mock).mockResolvedValue(
			initialDrinkCost,
		);

		// Render the hook
		const { result } = renderHook(() => useSavingsData(), { wrapper });

		// Wait for initial async operations
		await act(async () => {
			await Promise.resolve();
		});

		// Initial assertions
		expect(mockRepository.loadDrinkCost).toHaveBeenCalledTimes(1);
		expect(mockedCalculateSavings).toHaveBeenCalledWith(
			initialSoberDays,
			initialDrinkCost,
		);
		expect(result.current.currentSavings).toBe(initialExpectedSavings);

		// Update drink cost and trigger refresh
		const updatedDrinkCost = 20;
		const updatedExpectedSavings = initialSoberDays * updatedDrinkCost;

		// Mock the updated value
		(mockRepository.loadDrinkCost as jest.Mock).mockResolvedValue(
			updatedDrinkCost,
		);

		// Call refreshDrinkCost and wait for updates
		await act(async () => {
			await result.current.refreshDrinkCost();
		});

		// Final assertions
		expect(mockRepository.loadDrinkCost).toHaveBeenCalledTimes(2);
		expect(result.current.currentSavings).toBe(updatedExpectedSavings);
		expect(mockedCalculateSavings).toHaveBeenCalledWith(
			initialSoberDays,
			updatedDrinkCost,
		);
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
