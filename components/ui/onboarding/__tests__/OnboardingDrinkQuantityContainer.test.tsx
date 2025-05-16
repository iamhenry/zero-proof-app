/**
 * FILE: components/ui/onboarding/__tests__/OnboardingDrinkQuantityContainer.test.tsx
 * PURPOSE: Tests for OnboardingDrinkQuantityContainer that handles drink quantity input and persistence during onboarding
 * DEPENDENCIES: React Testing Library, React Hook Form, Repository mocks
 */

import React from "react";
import {
	render,
	fireEvent,
	screen,
	waitFor,
	act,
	cleanup,
} from "@testing-library/react-native";
import { RepositoryContext } from "@/context/RepositoryContext";
import { SavingsDataContext } from "@/context/SavingsDataContext";
import { ISobrietyDataRepository } from "@/lib/types/repositories";
import OnboardingDrinkQuantityContainer from "../OnboardingDrinkQuantityContainer";

// Mock repository for testing
const createMockRepository = (): ISobrietyDataRepository => ({
	saveDrinkCost: jest.fn().mockResolvedValue(undefined),
	loadDrinkCost: jest.fn().mockResolvedValue(null),
	saveDayStatus: jest.fn(),
	loadDayStatus: jest.fn(),
	loadAllDayStatus: jest.fn(),
	saveStreakData: jest.fn(),
	loadStreakData: jest.fn(),
	saveTimerState: jest.fn(),
	loadTimerState: jest.fn(),
});

// Mock SavingsDataContext value
const mockSavingsContextValue = {
	currentSavings: 0,
	isLoading: false,
	refreshDrinkCost: jest.fn().mockResolvedValue(undefined),
};

// Helper to render component with context providers
const renderWithRepository = (
	ui: React.ReactElement,
	repository: ISobrietyDataRepository,
) => {
	return render(
		<RepositoryContext.Provider value={repository}>
			<SavingsDataContext.Provider value={mockSavingsContextValue}>
				{ui}
			</SavingsDataContext.Provider>
		</RepositoryContext.Provider>,
	);
};

// Ensure cleanup after each test for isolation
afterEach(cleanup);

describe("OnboardingDrinkQuantityContainer", () => {
	beforeEach(() => {
		// Reset mocks before each test
		mockSavingsContextValue.refreshDrinkCost.mockClear();
	});

	// MARK: - Scenario 1: Integration with Onboarding Flow
	describe("Initial Rendering", () => {
		it("should render the DrinkQuantityInput component with Next button disabled", () => {
			const mockRepository = createMockRepository();
			const mockOnSubmit = jest.fn();

			renderWithRepository(
				<OnboardingDrinkQuantityContainer onSubmit={mockOnSubmit} />,
				mockRepository,
			);

			// Verify DrinkQuantityInput is rendered with correct label
			expect(
				screen.getByText("How many drinks would you typically have in a week?"),
			).toBeTruthy();

			// Verify Next button exists and is disabled initially
			const nextButton = screen.getByRole("button", { name: /next/i });
			expect(nextButton).toBeTruthy();
			expect(nextButton.props.accessibilityState?.disabled).toBe(true);
		});
	});

	// MARK: - Scenario 2: Persisting drink quantity during onboarding
	describe("Submitting Valid Input", () => {
		it("should save quantity to repository and call onSubmit on valid submission", async () => {
			const mockRepository = createMockRepository();
			const mockOnSubmit = jest.fn();

			renderWithRepository(
				<OnboardingDrinkQuantityContainer onSubmit={mockOnSubmit} />,
				mockRepository,
			);

			// Find input and enter valid value
			const input = screen.getByPlaceholderText("0");
			await act(async () => {
				fireEvent.changeText(input, "7");
			});

			// Verify Next button is enabled
			await waitFor(() => {
				const nextButton = screen.getByRole("button", { name: /next/i });
				expect(nextButton.props.accessibilityState?.disabled).toBe(false);
			});

			// Submit the form
			const nextButton = screen.getByRole("button", { name: /next/i });
			await act(async () => {
				fireEvent.press(nextButton);
			});

			// Verify repository was called with correct value
			await waitFor(() => {
				expect(mockRepository.saveDrinkCost).toHaveBeenCalledWith(7);
				expect(mockSavingsContextValue.refreshDrinkCost).toHaveBeenCalled();
				expect(mockOnSubmit).toHaveBeenCalled();
			});
		});
	});

	// MARK: - Scenario 3: Error handling during persistence
	describe("Error Handling", () => {
		it("should handle save failure and still call onSubmit with default value", async () => {
			const mockRepository = createMockRepository();
			const mockOnSubmit = jest.fn();

			// Mock saveDrinkCost to fail on first call but succeed on second call
			mockRepository.saveDrinkCost = jest
				.fn()
				.mockRejectedValueOnce(new Error("Save failed")) // First call fails
				.mockResolvedValueOnce(undefined); // Second call succeeds

			renderWithRepository(
				<OnboardingDrinkQuantityContainer onSubmit={mockOnSubmit} />,
				mockRepository,
			);

			// Find input and enter valid value
			const input = screen.getByPlaceholderText("0");
			await act(async () => {
				fireEvent.changeText(input, "7");
			});

			// Submit the form
			const nextButton = screen.getByRole("button", { name: /next/i });
			await act(async () => {
				fireEvent.press(nextButton);
			});

			// Verify repository was called with default value after error
			await waitFor(() => {
				// First call should be with 7 (fails)
				expect(mockRepository.saveDrinkCost).toHaveBeenNthCalledWith(1, 7);
				// Second call should be with 0 (succeeds)
				expect(mockRepository.saveDrinkCost).toHaveBeenNthCalledWith(2, 0);
				expect(mockSavingsContextValue.refreshDrinkCost).toHaveBeenCalled();
				expect(mockOnSubmit).toHaveBeenCalled();
			});
		});
	});

	// MARK: - Scenario 4: Input validation
	describe("Input Validation", () => {
		it("should prevent invalid input and disable submit button", async () => {
			const mockRepository = createMockRepository();
			const mockOnSubmit = jest.fn();

			renderWithRepository(
				<OnboardingDrinkQuantityContainer onSubmit={mockOnSubmit} />,
				mockRepository,
			);

			// Find input and enter invalid value
			const input = screen.getByPlaceholderText("0");

			// Try entering a negative value (should be prevented by input validation)
			await act(async () => {
				fireEvent.changeText(input, "-");
			});

			// Verify input is empty (invalid character prevented)
			expect(input.props.value).toBe("");

			// Verify Next button is disabled
			const nextButton = screen.getByRole("button", { name: /next/i });
			expect(nextButton.props.accessibilityState?.disabled).toBe(true);

			// Try entering zero (should be allowed but button disabled)
			await act(async () => {
				fireEvent.changeText(input, "0");
			});

			// Verify Next button is still disabled
			expect(nextButton.props.accessibilityState?.disabled).toBe(true);

			// Enter valid value
			await act(async () => {
				fireEvent.changeText(input, "1");
			});

			// Verify Next button is enabled
			expect(nextButton.props.accessibilityState?.disabled).toBe(false);

			// Submit the form
			await act(async () => {
				fireEvent.press(nextButton);
			});

			// Verify repository was called with valid value
			await waitFor(() => {
				expect(mockRepository.saveDrinkCost).toHaveBeenCalledWith(1);
			});

			// Verify onSubmit was called
			expect(mockOnSubmit).toHaveBeenCalled();
		});
	});
});
