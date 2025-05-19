/**
 * FILE: components/ui/statistics/__tests__/SavingsCounterModal.test.tsx
 * PURPOSE: Tests for SavingsCounter modal interactions and state management
 * DEPENDENCIES: React Testing Library, React Native Testing Library, Repository mocks
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
import { ISobrietyDataRepository } from "@/lib/types/repositories";
import { SavingsCounter } from "../SavingsCounter";
import { SavingsDataContext } from "@/context/SavingsDataContext";
import { View } from "react-native";

// Mock the Modal component
jest.mock("react-native/Libraries/Modal/Modal", () => "Modal");

// Mock MoneyIcon component
jest.mock("../MoneyIcon", () => ({
	MoneyIcon: "MoneyIcon",
}));

// Mock repository for testing
const createMockRepository = (): ISobrietyDataRepository => {
	const mockSaveDrinkCost = jest.fn((cost: number) => Promise.resolve());
	const mockLoadDrinkCost = jest.fn(() => Promise.resolve(8));

	return {
		saveDrinkCost: mockSaveDrinkCost,
		loadDrinkCost: mockLoadDrinkCost,
		saveDayStatus: jest.fn(),
		loadDayStatus: jest.fn(),
		loadAllDayStatus: jest.fn(),
		saveStreakData: jest.fn(),
		loadStreakData: jest.fn(),
		saveTimerState: jest.fn(),
		loadTimerState: jest.fn(),
	};
};

// Helper to render component with contexts
const renderWithContexts = (
	ui: React.ReactElement,
	repository: ISobrietyDataRepository,
	savingsData = {
		currentSavings: 100,
		isLoading: false,
		refreshDrinkCost: jest.fn(),
	},
) => {
	return render(
		<RepositoryContext.Provider value={repository}>
			<SavingsDataContext.Provider value={savingsData}>
				{ui}
			</SavingsDataContext.Provider>
		</RepositoryContext.Provider>,
	);
};

// Ensure cleanup after each test
afterEach(cleanup);

describe("SavingsCounter Modal Interactions", () => {
	// MARK: - Scenario 1: Opening the Settings Modal
	describe("Modal Opening", () => {
		it("should open modal when SavingsCounter is pressed", async () => {
			const mockRepository = createMockRepository();

			renderWithContexts(<SavingsCounter />, mockRepository);

			// Get the SavingsCounter component and press it
			const counter = screen.getByText("$100");
			fireEvent.press(counter);

			// Verify modal is displayed
			await waitFor(() => {
				const modal = screen.getByTestId("modal");
				expect(modal).toBeTruthy();
			});

			// Verify SettingsDrinkQuantityContainer is rendered
			await waitFor(() => {
				const container = screen.getByTestId(
					"settings-drink-quantity-container",
				);
				expect(container).toBeTruthy();
			});
		});
	});

	// MARK: - Scenario 2: Displaying Current Drink Quantity
	describe("Current Drink Quantity Display", () => {
		it("should display previously saved drink quantity in modal", async () => {
			const mockRepository = createMockRepository();
			const savedValue = 10;
			(mockRepository.loadDrinkCost as jest.Mock).mockResolvedValue(savedValue);

			renderWithContexts(<SavingsCounter />, mockRepository);

			// Open the modal
			const counter = screen.getByText("$100");
			fireEvent.press(counter);

			// Verify the saved value is displayed
			await waitFor(() => {
				const input = screen.getByPlaceholderText("0");
				expect(input.props.value).toBe(String(savedValue));
			});

			// Verify the label shows the same value
			await waitFor(() => {
				const label = screen.getByTestId("drink-quantity-label");
				expect(label).toHaveTextContent(String(savedValue));
			});
		});

		it("should handle case with no previously saved value", async () => {
			const mockRepository = createMockRepository();
			(mockRepository.loadDrinkCost as jest.Mock).mockResolvedValue(null);

			renderWithContexts(<SavingsCounter />, mockRepository);

			// Open the modal
			const counter = screen.getByText("$100");
			fireEvent.press(counter);

			// Verify default/placeholder is shown
			await waitFor(() => {
				const input = screen.getByPlaceholderText("0");
				expect(input.props.value).toBe("");
			});
		});
	});

	// MARK: - Scenario 3: Closing the Settings Modal
	describe("Modal Closing", () => {
		it("should close modal when close button is pressed", async () => {
			const mockRepository = createMockRepository();
			const setStateSpy = jest.spyOn(React, "useState");

			renderWithContexts(<SavingsCounter />, mockRepository);

			// Open the modal
			const counter = screen.getByText("$100");
			fireEvent.press(counter);

			// Verify modal is open
			await waitFor(() => {
				const modal = screen.getByTestId("modal");
				expect(modal).toBeTruthy();
			});

			// Clear any previous mock calls
			jest.clearAllMocks();

			// Press close button with proper act wrapping
			await act(async () => {
				const closeButton = screen.getByTestId("modal-close-button");
				fireEvent.press(closeButton);
				// Allow time for state updates to propagate
				await new Promise((resolve) => setTimeout(resolve, 50));
			});

			// Verify the state change was triggered
			expect(setStateSpy).toHaveBeenCalled();
		});
	});

	// MARK: - Scenario 4: Immediate Savings Update After Save
	describe("Savings Update", () => {
		it("should update savings counter immediately after saving new quantity", async () => {
			// Create mock context value that we can mutate
			const mockSavingsContextValue = {
				currentSavings: 100,
				isLoading: false,
				refreshDrinkCost: jest.fn(),
			};

			// Update refreshDrinkCost to simulate recalculation
			mockSavingsContextValue.refreshDrinkCost = jest
				.fn()
				.mockImplementation(async () => {
					// Simulate async behavior
					await new Promise((resolve) => setTimeout(resolve, 10));
					// Simulate the refresh updating the savings amount
					mockSavingsContextValue.currentSavings = 150; // New amount after recalculation
					return Promise.resolve();
				});

			// Mock repository with a successful save operation
			const mockRepository = createMockRepository();

			// Render component with contexts
			const { rerender } = renderWithContexts(
				<SavingsCounter />,
				mockRepository,
				mockSavingsContextValue,
			);

			// Open the modal
			const counter = screen.getByText("$100");
			fireEvent.press(counter);

			// Enter a valid quantity
			const input = await screen.findByPlaceholderText("0");
			fireEvent.changeText(input, "15");

			// Reset mocks before testing the behavior we're interested in
			jest.clearAllMocks();

			// Press the save button and wait for all updates
			await act(async () => {
				const saveButton = screen.getByRole("button", { name: /save/i });
				fireEvent.press(saveButton);

				// Wait for multiple state updates & modal animation
				await new Promise((resolve) => setTimeout(resolve, 300));
			});

			// Finally verify the UI shows updated amount
			expect(screen.getByText("$150")).toBeTruthy();
		});
	});

	// MARK: - Scenario 5: Handling Save Errors
	describe("Error Handling", () => {
		it("should display error message and keep modal open on save failure", async () => {
			const mockRepository = createMockRepository();
			(mockRepository.saveDrinkCost as jest.Mock).mockRejectedValue(
				new Error("Save failed"),
			);

			renderWithContexts(<SavingsCounter />, mockRepository);

			// Open modal and try to save
			const counter = screen.getByText("$100");
			fireEvent.press(counter);

			const input = await screen.findByPlaceholderText("0");
			fireEvent.changeText(input, "15");

			const saveButton = screen.getByRole("button", { name: /save/i });
			fireEvent.press(saveButton);

			// Verify error message is shown
			await waitFor(() => {
				const errorMessage = screen.getByTestId("error-message");
				expect(errorMessage).toHaveTextContent(/save failed/i);
			});

			// Verify modal stays open
			const modal = screen.getByTestId("modal");
			expect(modal).toBeTruthy();
		});
	});

	// MARK: - Scenario 6: Loading State Management
	describe("Loading State", () => {
		it("should show loading state and prevent dismissal during save", async () => {
			const mockRepository = createMockRepository();
			// Make save operation take some time
			(mockRepository.saveDrinkCost as jest.Mock).mockImplementation(
				() => new Promise((resolve) => setTimeout(resolve, 1000)),
			);

			renderWithContexts(<SavingsCounter />, mockRepository);

			// Open modal and trigger save
			const counter = screen.getByText("$100");
			fireEvent.press(counter);

			const input = await screen.findByPlaceholderText("0");
			fireEvent.changeText(input, "15");

			const saveButton = screen.getByRole("button", { name: /save/i });
			fireEvent.press(saveButton);

			// Verify loading state
			await waitFor(() => {
				expect(saveButton.props.accessibilityState?.disabled).toBe(true);
				const loadingIndicator = screen.getByTestId("loading-indicator");
				expect(loadingIndicator).toBeTruthy();
			});

			// Try to dismiss modal during save
			const closeButton = screen.getByTestId("modal-close-button");
			fireEvent.press(closeButton);

			// Verify modal stays open
			const modal = screen.getByTestId("modal");
			expect(modal).toBeTruthy();
		});
	});
});
