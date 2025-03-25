import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { DayCell } from "../DayCell";
import { createMockDayData } from "./testUtils";
import "./mockNativeWind";

jest.mock("nativewind", () => ({
	styled: (component: any) => component,
	useColorScheme: () => "light",
}));

describe("DayCell", () => {
	beforeAll(() => {
		// Mock current date to 2024-03-25
		jest.useFakeTimers();
		jest.setSystemTime(new Date(2024, 2, 25));
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	it("renders the day number", () => {
		const mockDay = createMockDayData({ day: 15, isFirstOfMonth: false });
		const { getByText } = render(<DayCell day={mockDay} />);
		expect(getByText("15")).toBeTruthy();
	});

	it("renders the first day of the month with month name", () => {
		const mockDay = createMockDayData({ day: 1, isFirstOfMonth: true });
		const { getByText } = render(<DayCell day={mockDay} />);
		expect(getByText("Jan 1")).toBeTruthy();
	});

	it("applies correct classes for sober days", () => {
		const mockDay = createMockDayData({ sober: true });
		const { getByTestId } = render(<DayCell day={mockDay} />);
		const touchable = getByTestId("day-cell-touchable");
		expect(touchable).toBeTruthy();
	});

	it("applies correct text color for non-sober days", () => {
		const mockDay = createMockDayData({ sober: false });
		const { getByText } = render(<DayCell day={mockDay} />);
		const text = getByText("Jan 1");
		expect(text).toBeTruthy();
	});

	it("calls onToggleSober when pressed", () => {
		const onToggleSober = jest.fn();
		const mockDay = createMockDayData();
		const { getByTestId } = render(
			<DayCell day={mockDay} onToggleSober={onToggleSober} />,
		);

		const touchable = getByTestId("day-cell-touchable");
		fireEvent.press(touchable);

		expect(onToggleSober).toHaveBeenCalledWith(mockDay.id);
	});

	it("handles missing onToggleSober prop gracefully", () => {
		const mockDay = createMockDayData();
		const { getByTestId } = render(<DayCell day={mockDay} />);

		const touchable = getByTestId("day-cell-touchable");
		expect(() => fireEvent.press(touchable)).not.toThrow();
	});

	it("applies correct classes for past non-sober days", () => {
		const mockDay = createMockDayData({
			sober: false,
			date: "2024-03-20", // Past date
		});
		const { getByText } = render(<DayCell day={mockDay} />);
		const text = getByText("Jan 1");
		expect(text).toBeTruthy();
	});

	it("applies correct classes for future non-sober days", () => {
		const mockDay = createMockDayData({
			sober: false,
			date: "2024-03-30", // Future date
		});
		const { getByText } = render(<DayCell day={mockDay} />);
		const text = getByText("Jan 1");
		expect(text).toBeTruthy();
	});
});
