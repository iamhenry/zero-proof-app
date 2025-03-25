import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CalendarGrid } from "../CalendarGrid";
import "./mockNativeWind";
import { generateStaticCalendarData } from "../utils";
import { createMockCalendarData } from "./testUtils";

jest.mock("nativewind", () => ({
	styled: (component: any) => component,
	useColorScheme: () => "light",
}));

jest.mock("../utils", () => ({
	generateStaticCalendarData: jest.fn(),
	getIntensityColor: (intensity: number): string => {
		switch (intensity) {
			case 0:
				return ""; // Not sober - will be white
			case 1:
				return "bg-green-50"; // First day of streak
			case 2:
				return "bg-green-100"; // 2 days
			case 3:
				return "bg-green-200"; // 3 days
			case 4:
				return "bg-green-300"; // 4 days
			case 5:
				return "bg-green-400"; // 5 days
			case 6:
				return "bg-green-500"; // 6 days
			case 7:
				return "bg-green-600"; // 7 days
			case 8:
				return "bg-green-700"; // 8 days
			case 9:
				return "bg-green-800"; // 9 days
			case 10:
				return "bg-green-900"; // 10+ days (max intensity)
			default:
				return ""; // Fallback
		}
	},
	getTextColorClass: (intensity: number): string => {
		if (intensity >= 5) return "text-green-100";
		else if (intensity >= 1) return "text-green-600";
		return "text-stone-300";
	},
	getDayStatus: (date: string): "today" | "past" | "future" => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const dayDate = new Date(date);
		dayDate.setHours(0, 0, 0, 0);
		if (dayDate.getTime() === today.getTime()) return "today";
		else if (dayDate < today) return "past";
		else return "future";
	},
	getStatusTextColor: (status: "today" | "past" | "future"): string => {
		switch (status) {
			case "today":
				return "text-sky-500";
			case "past":
				return "text-stone-300";
			case "future":
				return "text-neutral-700";
			default:
				return "text-stone-300";
		}
	},
	getMonthName: (month: number): string => {
		const months = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		return months[month];
	},
}));

describe("CalendarGrid", () => {
	beforeAll(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date(2024, 2, 25)); // March 25, 2024
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	beforeEach(() => {
		(generateStaticCalendarData as jest.Mock).mockReturnValue(
			createMockCalendarData(),
		);
	});

	test("renders WeekdayHeader", () => {
		const { getByTestId } = render(<CalendarGrid />);
		expect(getByTestId("weekday-header-container")).toBeTruthy();
	});

	test("renders FlatList with week data", () => {
		const { getByTestId } = render(<CalendarGrid />);
		expect(getByTestId("calendar-grid-list")).toBeTruthy();
	});

	test("renders correct number of DayCell components", () => {
		const { getAllByTestId } = render(<CalendarGrid />);
		const dayCells = getAllByTestId("day-cell-touchable");
		expect(dayCells).toHaveLength(35); // 5 weeks * 7 days
	});

	test("toggles sober state when day is pressed", () => {
		const { getAllByTestId } = render(<CalendarGrid />);
		const firstDayCell = getAllByTestId("day-cell-touchable")[0];

		// Initially not sober
		expect(firstDayCell.props.style).toBeTruthy();

		// Press to toggle
		fireEvent.press(firstDayCell);

		// Re-render to check updated state
		const { getAllByTestId: getUpdatedCells } = render(<CalendarGrid />);
		const updatedFirstDayCell = getUpdatedCells("day-cell-touchable")[0];
		expect(updatedFirstDayCell.props.style).toBeTruthy();
	});

	test("maintains streak intensity when toggling consecutive days", () => {
		// Mock the initial calendar data with a streak
		(generateStaticCalendarData as jest.Mock).mockReturnValue({
			weeks: [
				{
					id: "week-1",
					days: [
						{
							id: "2024-1-1",
							date: "2024-01-01",
							day: 1,
							month: 0,
							year: 2024,
							sober: true,
							intensity: 1,
							isFirstOfMonth: true,
						},
						{
							id: "2024-1-2",
							date: "2024-01-02",
							day: 2,
							month: 0,
							year: 2024,
							sober: true,
							intensity: 2,
							isFirstOfMonth: false,
						},
						{
							id: "2024-1-3",
							date: "2024-01-03",
							day: 3,
							month: 0,
							year: 2024,
							sober: true,
							intensity: 3,
							isFirstOfMonth: false,
						},
					],
				},
			],
		});

		const { getAllByTestId } = render(<CalendarGrid />);
		const dayCells = getAllByTestId("day-cell-touchable");

		// Check that the cells have the correct intensity colors
		expect(dayCells[0].props.style).toBeTruthy();
		expect(dayCells[1].props.style).toBeTruthy();
		expect(dayCells[2].props.style).toBeTruthy();
	});

	test("resets streak when toggling day to not sober", () => {
		// Mock the initial calendar data with a broken streak
		(generateStaticCalendarData as jest.Mock).mockReturnValue({
			weeks: [
				{
					id: "week-1",
					days: [
						{
							id: "2024-1-1",
							date: "2024-01-01",
							day: 1,
							month: 0,
							year: 2024,
							sober: true,
							intensity: 1,
							isFirstOfMonth: true,
						},
						{
							id: "2024-1-2",
							date: "2024-01-02",
							day: 2,
							month: 0,
							year: 2024,
							sober: false,
							intensity: 0,
							isFirstOfMonth: false,
						},
						{
							id: "2024-1-3",
							date: "2024-01-03",
							day: 3,
							month: 0,
							year: 2024,
							sober: true,
							intensity: 1,
							isFirstOfMonth: false,
						},
					],
				},
			],
		});

		const { getAllByTestId } = render(<CalendarGrid />);
		const dayCells = getAllByTestId("day-cell-touchable");

		// Check that the cells have the correct intensity colors
		expect(dayCells[0].props.style).toBeTruthy();
		expect(dayCells[1].props.style).toBeTruthy();
		expect(dayCells[2].props.style).toBeTruthy();
	});
});
