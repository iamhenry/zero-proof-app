import React from "react";
import { render, screen } from "@testing-library/react-native";

import { StreakCounter } from "../StreakCounter";

// Mock the StreakIcon component
// We render simple text to easily find it in the test assertions.
jest.mock("../StreakIcon", () => {
	// Import Text inside the factory function to avoid scope issues
	const { Text } = require("react-native");
	const MockStreakIcon = () => <Text>MockStreakIcon</Text>;
	// Assigning displayName for better debugging and potential use in testing library queries
	MockStreakIcon.displayName = "MockStreakIcon";
	// Return an object mapping the named export to the mock component
	return {
		StreakIcon: MockStreakIcon,
	};
});

describe("StreakCounter", () => {
	// MARK: - Scenario: Displaying the current streak count

	it("should render the correct streak count when count is positive", () => {
		const testCount = 30;
		render(<StreakCounter count={testCount} />);

		// Expect the component to display the number passed in the count prop
		// This test will fail because the component doesn't exist yet or doesn't render the count.
		expect(screen.getByText(testCount.toString())).toBeTruthy();
	});

	it("should render zero when streak count is zero", () => {
		const testCount = 0;
		render(<StreakCounter count={testCount} />);

		// Expect the component to display "0"
		// This test will fail because the component doesn't exist yet or doesn't render the count.
		expect(screen.getByText(testCount.toString())).toBeTruthy();
	});

	it("should render the StreakIcon", () => {
		render(<StreakCounter count={5} />); // Count value doesn't matter for this test

		// Expect the mocked StreakIcon component to be rendered
		// This test will fail because the component doesn't exist yet or doesn't render the icon.
		expect(screen.getByText("MockStreakIcon")).toBeTruthy();
	});

	// Note: Scenarios 3 & 4 from bdd-streak-counter.md involve state updates in the parent component.
	// Testing the StreakCounter's reaction to prop changes is implicitly covered by testing
	// different count values (0 and 30). A dedicated test for prop updates could be added,
	// but these basic rendering tests cover the component's core responsibility based on props.
});
