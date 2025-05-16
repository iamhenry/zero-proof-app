/**
 * FILE: components/ui/onboarding/__tests__/DrinkQuantityInput.enhanced.test.tsx
 * PURPOSE: Tests for the enhanced features of DrinkQuantityInput component, including settings mode
 * DEPENDENCIES: React Testing Library, React Hook Form, Zod
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
import DrinkQuantityInput from "../DrinkQuantityInput";

// Ensure cleanup after each test for isolation
afterEach(cleanup);

describe("Enhanced DrinkQuantityInput Component", () => {
	// MARK: - Scenario 1: Custom Button Text
	describe("Custom Button Text", () => {
		it('should render with custom button text when "buttonText" prop is provided', () => {
			const mockOnSubmit = jest.fn();
			render(<DrinkQuantityInput onSubmit={mockOnSubmit} buttonText="Save" />);

			// Check that the button text is "Save" instead of default "Next"
			const saveButton = screen.getByRole("button", { name: /save/i });
			expect(saveButton).toBeTruthy();
		});
	});

	// MARK: - Scenario 2: Settings Mode Rendering
	describe("Settings Mode Rendering", () => {
		it("should render with Cancel button when in settings mode", () => {
			const mockOnSubmit = jest.fn();
			const mockOnCancel = jest.fn();

			render(
				<DrinkQuantityInput
					onSubmit={mockOnSubmit}
					isSettingsMode={true}
					onCancel={mockOnCancel}
					buttonText="Save"
				/>,
			);

			// Check that both Cancel and Save buttons are rendered
			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			const saveButton = screen.getByRole("button", { name: /save/i });

			expect(cancelButton).toBeTruthy();
			expect(saveButton).toBeTruthy();
		});

		it("should call onCancel when Cancel button is pressed", async () => {
			const mockOnSubmit = jest.fn();
			const mockOnCancel = jest.fn();

			render(
				<DrinkQuantityInput
					onSubmit={mockOnSubmit}
					isSettingsMode={true}
					onCancel={mockOnCancel}
					buttonText="Save"
				/>,
			);

			// Find and tap the Cancel button
			const cancelButton = screen.getByRole("button", { name: /cancel/i });

			await act(async () => {
				fireEvent.press(cancelButton);
			});

			// Check that the onCancel callback was called
			expect(mockOnCancel).toHaveBeenCalled();
		});
	});

	// MARK: - Scenario 3: Loading State
	describe("Loading State", () => {
		it("should disable input and buttons when in loading state", () => {
			const mockOnSubmit = jest.fn();
			const mockOnCancel = jest.fn();

			render(
				<DrinkQuantityInput
					onSubmit={mockOnSubmit}
					isSettingsMode={true}
					onCancel={mockOnCancel}
					buttonText="Save"
					isLoading={true}
				/>,
			);

			// Find the input field
			const input = screen.getByPlaceholderText("0");

			// Check that the input is disabled via editable prop
			expect(input.props.editable).toBe(false);

			// Check that both buttons are disabled
			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			const saveButton = screen.getByRole("button", { name: /save/i });

			expect(cancelButton.props.accessibilityState?.disabled).toBe(true);
			expect(saveButton.props.accessibilityState?.disabled).toBe(true);
		});
	});

	// MARK: - Scenario 4: Initial Value in Settings Mode
	describe("Initial Value in Settings Mode", () => {
		it("should display initial value when provided", async () => {
			const mockOnSubmit = jest.fn();

			render(
				<DrinkQuantityInput
					onSubmit={mockOnSubmit}
					initialValue={5}
					isSettingsMode={true}
					buttonText="Save"
				/>,
			);

			// Check that the input value is set correctly
			const input = screen.getByPlaceholderText("0");
			expect(input.props.value).toBe("5");

			// Check that the Save button is enabled (initial value > 0)
			await waitFor(() => {
				const saveButton = screen.getByRole("button", { name: /save/i });
				expect(saveButton.props.accessibilityState?.disabled).toBe(false);
			});
		});
	});
});
