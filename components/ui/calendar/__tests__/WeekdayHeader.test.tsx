import React from "react";
import { render } from "@testing-library/react-native";
import { WeekdayHeader } from "../WeekdayHeader";

describe("WeekdayHeader", () => {
	test("renders all weekday labels", () => {
		const { getAllByText } = render(<WeekdayHeader />);
		const weekdays = ["S", "M", "T", "W", "Th", "F", "S"];

		weekdays.forEach((day) => {
			const elements = getAllByText(day);
			expect(elements.length).toBeGreaterThan(0);
		});
	});

	test("renders weekday labels with correct styling", () => {
		const { getAllByText } = render(<WeekdayHeader />);
		const sundayLabel = getAllByText("S")[0]; // Get first 'S' (Sunday)

		expect(sundayLabel.props.className).toContain("text-[11px]");
		expect(sundayLabel.props.className).toContain("font-bold");
		expect(sundayLabel.props.className).toContain("text-neutral-500");
	});

	test("renders in a flex row layout", () => {
		const { getByTestId } = render(<WeekdayHeader />);
		const container = getByTestId("weekday-header-container");
		expect(container.props.className).toContain("flex-row");
	});

	test("renders seven day columns", () => {
		const { getAllByTestId } = render(<WeekdayHeader />);
		const dayColumns = getAllByTestId("weekday-column");
		expect(dayColumns).toHaveLength(7);
	});
});
