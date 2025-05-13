/**
 * FILE: components/ui/onboarding/__tests__/DrinkQuantityInput.test.tsx
 * PURPOSE: Tests for the DrinkQuantityInput component that validates and collects user input for weekly drink quantity
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

describe("DrinkQuantityInput Component", () => {
	// MARK: - Scenario 1: Initial state of the Drink Quantity Input
	describe("Initial State", () => {
		it('should render with "0" placeholder and disabled Next button', () => {
			const mockOnSubmit = jest.fn();
			const { getByPlaceholderText, getByRole } = render(
				<DrinkQuantityInput onSubmit={mockOnSubmit} />,
			);

			// Check for placeholder text
			expect(getByPlaceholderText("0")).toBeTruthy();

			// Check that the Next button is disabled via accessibilityState
			const nextButton = getByRole("button", { name: /next/i });
			expect(nextButton).toBeTruthy();
			expect(nextButton.props.accessibilityState?.disabled).toBe(true);
		});
	});

	// MARK: - Scenario 2: Entering a valid positive integer
	describe("Valid Input Handling", () => {
		it("should update display and enable Next button when valid positive integer is entered", async () => {
			const mockOnSubmit = jest.fn();
			const { getByPlaceholderText, getByRole } = render(
				<DrinkQuantityInput onSubmit={mockOnSubmit} />,
			);

			// Find the input field
			const input = getByPlaceholderText("0");

			// Enter a valid positive integer
			await act(async () => {
				fireEvent.changeText(input, "7");
			});

			// Check that the input value is updated
			expect(input.props.value).toBe("7");

			// Check that the Next button is enabled via accessibilityState
			await waitFor(() => {
				const nextButton = getByRole("button", { name: /next/i });
				expect(nextButton.props.accessibilityState?.disabled).toBe(false);
			});
		});
	});

	// MARK: - Scenario 3: Entering zero after entering a positive integer
	describe("Zero Input Handling", () => {
		it('should update display to "0" and disable Next button when input is cleared or set to 0', async () => {
			const { getByPlaceholderText, getByRole } = render(
				<DrinkQuantityInput onSubmit={jest.fn()} />,
			);

			// Find the input field
			const input = getByPlaceholderText("0");

			// First enter a valid positive integer
			await act(async () => {
				fireEvent.changeText(input, "7");
			});

			// Check that the Next button is enabled via accessibilityState
			await waitFor(() => {
				const nextButton = getByRole("button", { name: /next/i });
				expect(nextButton.props.accessibilityState?.disabled).toBe(false);
			});

			// Now clear the input or enter 0
			await act(async () => {
				fireEvent.changeText(input, "0");
			});

			// Check that the input value is updated to "0"
			expect(input.props.value).toBe("0");

			// Check that the Next button is disabled again via accessibilityState
			await waitFor(() => {
				const nextButton = getByRole("button", { name: /next/i });
				expect(nextButton.props.accessibilityState?.disabled).toBe(true);
			});
		});
	});

	// MARK: - Scenario 4: Attempting to enter a negative number (via Zod validation)
	describe("Negative Input Validation", () => {
		it("should display validation error and keep Next button disabled when zero or empty value is entered", async () => {
			const { getByPlaceholderText, getByRole, findByRole } = render(
				<DrinkQuantityInput onSubmit={jest.fn()} />,
			);

			// Find the input field
			const input = getByPlaceholderText("0");

			// Enter zero (invalid value)
			await act(async () => {
				fireEvent.changeText(input, "0");
			});

			// Wait for the error message to appear with correct accessibility role and content
			const alert = await findByRole("alert");
			expect(alert).toBeTruthy();
			const errorText =
				typeof alert.props?.children === "string"
					? alert.props.children
					: Array.isArray(alert.props?.children)
						? alert.props.children.join(" ")
						: "";
			expect(errorText).toContain("Please enter a quantity greater than 0");

			// Check that the Next button remains disabled via accessibilityState
			await waitFor(() => {
				const nextButton = getByRole("button", { name: /next/i });
				expect(nextButton.props.accessibilityState?.disabled).toBe(true);
			});
		});
	});

	// MARK: - Scenario 5: Submitting a valid positive integer
	describe("Submission with Valid Input", () => {
		it("should call onSubmit callback with correct value when Next button is tapped with valid input", async () => {
			// Create a mock function for the onSubmit callback
			const mockOnSubmit = jest.fn();

			const { getByPlaceholderText, getByRole } = render(
				<DrinkQuantityInput onSubmit={mockOnSubmit} />,
			);

			// Find the input field
			const input = getByPlaceholderText("0");

			// Enter a valid positive integer
			await act(async () => {
				fireEvent.changeText(input, "10");
			});

			// Find and tap the Next button via accessibilityState
			await waitFor(() => {
				const nextButton = getByRole("button", { name: /next/i });
				expect(nextButton.props.accessibilityState?.disabled).toBe(false);
			});

			const nextButton = getByRole("button", { name: /next/i });
			await act(async () => {
				fireEvent.press(nextButton);
			});

			// Check that the onSubmit callback was called with the correct value
			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledWith(10);
			});
		});
	});

	// MARK: - Scenario 6: Attempting to submit zero or empty input
	describe("Submission Prevention with Invalid Input", () => {
		it("should not call onSubmit callback when Next button is tapped with zero or empty input", async () => {
			// Create a mock function for the onSubmit callback
			const mockOnSubmit = jest.fn();

			render(<DrinkQuantityInput onSubmit={mockOnSubmit} />);

			// Find the Next button (which should be disabled via accessibilityState)
			const nextButton = screen.getByRole("button", { name: /next/i });
			expect(nextButton).toBeTruthy();

			// Attempt to tap the disabled button
			await act(async () => {
				fireEvent.press(nextButton);
			});

			// Check that the onSubmit callback was not called
			expect(mockOnSubmit).not.toHaveBeenCalled();
		});
	});
});
