/**
 * FILE: components/ui/settings/__tests__/SettingsDrinkQuantityContainer.test.tsx
 * PURPOSE: Tests for SettingsDrinkQuantityContainer that handles drink quantity input and persistence in settings
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
import { ISobrietyDataRepository } from "@/lib/types/repositories";
import SettingsDrinkQuantityContainer from "../SettingsDrinkQuantityContainer";

// Mock repository for testing
const createMockRepository = (): ISobrietyDataRepository => ({
	saveDrinkCost: jest.fn().mockResolvedValue(undefined),
	loadDrinkCost: jest.fn().mockResolvedValue(8), // Default to returning 8 as the saved value
	saveDayStatus: jest.fn(),
	loadDayStatus: jest.fn(),
	loadAllDayStatus: jest.fn(),
	saveStreakData: jest.fn(),
	loadStreakData: jest.fn(),
	saveTimerState: jest.fn(),
	loadTimerState: jest.fn(),
});

// Helper to render component with context provider
const renderWithRepository = (
	ui: React.ReactElement,
	repository: ISobrietyDataRepository,
) => {
	return render(
		<RepositoryContext.Provider value={repository}>
			{ui}
		</RepositoryContext.Provider>,
	);
};

// Ensure cleanup after each test for isolation
afterEach(cleanup);

describe("SettingsDrinkQuantityContainer", () => {
	// MARK: - Scenario 1: Initial state and loading
	describe("Initial Loading", () => {
		it("should load initial value from repository and show in input field", async () => {
			const mockRepository = createMockRepository();

			renderWithRepository(<SettingsDrinkQuantityContainer />, mockRepository);

			// Verify loading state initially
			expect(
				screen.getByRole("button", { name: /save/i }).props.accessibilityState
					?.disabled,
			).toBe(true);

			// Wait for data to load
			await waitFor(() => {
				expect(mockRepository.loadDrinkCost).toHaveBeenCalled();
			});

			// Verify input field has loaded value
			await waitFor(() => {
				const input = screen.getByPlaceholderText("0");
				expect(input.props.value).toBe("8");
			});

			// Verify Save button is enabled after loading with valid value
			await waitFor(() => {
				const saveButton = screen.getByRole("button", { name: /save/i });
				expect(saveButton.props.accessibilityState?.disabled).toBe(false);
			});
		});

		it("should show cancel button in settings mode", async () => {
			const mockRepository = createMockRepository();
			const mockOnCancel = jest.fn();

			renderWithRepository(
				<SettingsDrinkQuantityContainer onCancel={mockOnCancel} />,
				mockRepository,
			);

			// Verify that the Cancel button is visible
			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			expect(cancelButton).toBeTruthy();
		});

		it("should show default placeholder when no value exists", async () => {
			const mockRepository = createMockRepository();
			// Override loadDrinkCost to return null (no saved value)
			mockRepository.loadDrinkCost = jest.fn().mockResolvedValue(null);

			renderWithRepository(<SettingsDrinkQuantityContainer />, mockRepository);

			// Wait for data to load
			await waitFor(() => {
				expect(mockRepository.loadDrinkCost).toHaveBeenCalled();
			});

			// Verify placeholder is shown
			const placeholder = screen.getByText("0");
			expect(placeholder).toBeTruthy();
		});
	});

	// MARK: - Scenario 2: Entering a valid quantity value in settings
	describe("Input Validation", () => {
		it("should enable Save button when valid value is entered and disable for invalid input", async () => {
			const mockRepository = createMockRepository();

			renderWithRepository(<SettingsDrinkQuantityContainer />, mockRepository);

			// Wait for data to load and form to be ready
			await waitFor(() => {
				expect(mockRepository.loadDrinkCost).toHaveBeenCalled();
			});

			// Wait for the initial value to be set and validation to complete
			await waitFor(() => {
				const input = screen.getByPlaceholderText("0");
				expect(input.props.value).toBe("8");
			});

			// Now check that the Save button is enabled with valid initial value
			await waitFor(() => {
				const saveButton = screen.getByRole("button", { name: /save/i });
				expect(saveButton.props.accessibilityState?.disabled).toBe(false);
			});

			// Change to invalid value (0)
			const input = screen.getByPlaceholderText("0");
			await act(async () => {
				fireEvent.changeText(input, "0");
			});

			// Save button should now be disabled
			await waitFor(() => {
				const saveButton = screen.getByRole("button", { name: /save/i });
				expect(saveButton.props.accessibilityState?.disabled).toBe(true);
			});

			// Change to valid value
			await act(async () => {
				fireEvent.changeText(input, "5");
			});

			// Save button should be enabled again
			await waitFor(() => {
				const saveButton = screen.getByRole("button", { name: /save/i });
				expect(saveButton.props.accessibilityState?.disabled).toBe(false);
			});
		});

		it("should update displayed value as digits are entered", async () => {
			const mockRepository = createMockRepository();

			renderWithRepository(<SettingsDrinkQuantityContainer />, mockRepository);

			// Wait for data to load
			await waitFor(() => {
				expect(mockRepository.loadDrinkCost).toHaveBeenCalled();
			});

			// Get the input field
			const input = screen.getByPlaceholderText("0");

			// Enter digits one by one to simulate typing
			await act(async () => {
				fireEvent.changeText(input, "1");
			});

			expect(input.props.value).toBe("1");

			await act(async () => {
				fireEvent.changeText(input, "12");
			});

			expect(input.props.value).toBe("12");

			await act(async () => {
				fireEvent.changeText(input, "123");
			});

			expect(input.props.value).toBe("123");
		});
	});

	// MARK: - Scenario 3: Saving the drink quantity value
	describe("Saving Value", () => {
		it("should save new value to repository when Save button is pressed", async () => {
			const mockRepository = createMockRepository();
			const mockOnSuccess = jest.fn();

			renderWithRepository(
				<SettingsDrinkQuantityContainer onSuccess={mockOnSuccess} />,
				mockRepository,
			);

			// Wait for data to load
			await waitFor(() => {
				expect(mockRepository.loadDrinkCost).toHaveBeenCalled();
			});

			// Change input value
			const input = screen.getByPlaceholderText("0");
			await act(async () => {
				fireEvent.changeText(input, "12");
			});

			// Submit the form
			const saveButton = screen.getByRole("button", { name: /save/i });
			await act(async () => {
				fireEvent.press(saveButton);
			});

			// Verify repository was called with new value
			await waitFor(() => {
				expect(mockRepository.saveDrinkCost).toHaveBeenCalledWith(12);
			});

			// Verify success message is displayed
			await waitFor(() => {
				expect(screen.getByText(/saved successfully/i)).toBeTruthy();
			});

			// Verify onSuccess callback was called
			expect(mockOnSuccess).toHaveBeenCalled();
		});
	});

	// MARK: - Scenario 4: Cancellation
	describe("Cancellation", () => {
		it("should call onCancel callback when Cancel button is pressed", async () => {
			const mockRepository = createMockRepository();
			const mockOnCancel = jest.fn();

			renderWithRepository(
				<SettingsDrinkQuantityContainer onCancel={mockOnCancel} />,
				mockRepository,
			);

			// Wait for data to load
			await waitFor(() => {
				expect(mockRepository.loadDrinkCost).toHaveBeenCalled();
			});

			// Find and press the Cancel button
			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			await act(async () => {
				fireEvent.press(cancelButton);
			});

			// Verify onCancel callback was called
			expect(mockOnCancel).toHaveBeenCalled();

			// Verify repository save was NOT called
			expect(mockRepository.saveDrinkCost).not.toHaveBeenCalled();
		});
	});

	// MARK: - Scenario 5: Loading existing data when entering settings
	describe("Loading Existing Data", () => {
		it("should fetch and display the previously saved value", async () => {
			const mockRepository = createMockRepository();
			mockRepository.loadDrinkCost = jest.fn().mockResolvedValue(15); // Different value to test

			renderWithRepository(<SettingsDrinkQuantityContainer />, mockRepository);

			// Verify repository was called to load the value
			await waitFor(() => {
				expect(mockRepository.loadDrinkCost).toHaveBeenCalled();
			});

			// Verify the loaded value is displayed
			await waitFor(() => {
				const input = screen.getByPlaceholderText("0");
				expect(input.props.value).toBe("15");
			});
		});
	});

	// MARK: - Scenario 6: Real-time savings calculation update
	// Note: This test requires integration with SavingsDataContext
	describe("Integration with Savings Calculation", () => {
		it("should trigger recalculation of savings when saving a new value", async () => {
			// This is a partial test as we can only verify the repository interaction
			// A full test would require mocking the SavingsDataContext
			const mockRepository = createMockRepository();

			// We can verify that saving a value happens correctly, which would
			// trigger the savings recalculation in a real context
			renderWithRepository(<SettingsDrinkQuantityContainer />, mockRepository);

			// Wait for data to load
			await waitFor(() => {
				expect(mockRepository.loadDrinkCost).toHaveBeenCalled();
			});

			// Change input value to something different
			const input = screen.getByPlaceholderText("0");
			await act(async () => {
				fireEvent.changeText(input, "10");
			});

			// Submit the form
			const saveButton = screen.getByRole("button", { name: /save/i });
			await act(async () => {
				fireEvent.press(saveButton);
			});

			// Verify repository was called with the new value, which would trigger recalculation
			await waitFor(() => {
				expect(mockRepository.saveDrinkCost).toHaveBeenCalledWith(10);
			});

			// A full test would verify that SavingsDataContext.recalculateSavings() is called
			// or that savings components are updated, but that requires more complex mocking
		});
	});

	// MARK: - Scenario 4: Error handling
	describe("Error Handling", () => {
		it("should display error message when loading fails", async () => {
			const mockRepository = createMockRepository();

			// Override loadDrinkCost to reject
			mockRepository.loadDrinkCost = jest
				.fn()
				.mockRejectedValue(new Error("Load failed"));

			renderWithRepository(<SettingsDrinkQuantityContainer />, mockRepository);

			// Verify error message is displayed
			await waitFor(() => {
				expect(screen.getByText(/failed to load/i)).toBeTruthy();
			});
		});

		it("should display error message when save fails", async () => {
			const mockRepository = createMockRepository();

			// Override saveDrinkCost to reject
			mockRepository.saveDrinkCost = jest
				.fn()
				.mockRejectedValue(new Error("Save failed"));

			renderWithRepository(<SettingsDrinkQuantityContainer />, mockRepository);

			// Wait for data to load
			await waitFor(() => {
				expect(mockRepository.loadDrinkCost).toHaveBeenCalled();
			});

			// Wait for the initial value to be set
			await waitFor(() => {
				const input = screen.getByPlaceholderText("0");
				expect(input.props.value).toBe("8");
			});

			// Submit the form - this should trigger the error
			const saveButton = screen.getByRole("button", { name: /save/i });
			await act(async () => {
				fireEvent.press(saveButton);
			});

			// Verify error message is displayed after the save failure
			await waitFor(() => {
				expect(screen.getByText(/failed to save/i)).toBeTruthy();
			});
		});
	});
});
