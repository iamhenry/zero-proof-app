import React, { useMemo, useState, useCallback } from "react";
import { View, FlatList } from "react-native";
import { WeekdayHeader } from "./WeekdayHeader";
import { DayCell } from "./DayCell";
import { generateStaticCalendarData } from "./utils";
import { WeekData } from "./types";

export function CalendarGrid() {
	// Generate static calendar data with 5 months
	const initialCalendarData = useMemo(() => generateStaticCalendarData(), []);
	const [calendarData, setCalendarData] = useState(initialCalendarData);

	// Function to toggle sober state and recalculate streaks
	const toggleSoberDay = useCallback((dayId: string) => {
		setCalendarData((prevData) => {
			// Create a deep copy of the calendar data
			const newData = JSON.parse(JSON.stringify(prevData));

			// Find the day to toggle
			let targetDay = null;
			let targetWeekIndex = -1;
			let targetDayIndex = -1;

			// Find the day in the weeks array
			for (let i = 0; i < newData.weeks.length; i++) {
				const dayIndex = newData.weeks[i].days.findIndex(
					(day: any) => day.id === dayId,
				);
				if (dayIndex !== -1) {
					targetDay = newData.weeks[i].days[dayIndex];
					targetWeekIndex = i;
					targetDayIndex = dayIndex;
					break;
				}
			}

			if (targetDay) {
				// Toggle the sober state
				targetDay.sober = !targetDay.sober;

				// Recalculate intensities based on consecutive sober days
				// Start from the current day and go backwards to find the beginning of the streak
				let currentStreak = 0;

				// Process all days from the beginning to update streaks
				for (let w = 0; w < newData.weeks.length; w++) {
					for (let d = 0; d < newData.weeks[w].days.length; d++) {
						const currentDay = newData.weeks[w].days[d];

						if (currentDay.sober) {
							currentStreak++;
							// Cap intensity at 10
							currentDay.intensity = Math.min(currentStreak, 10);
						} else {
							currentStreak = 0;
							currentDay.intensity = 0;
						}
					}
				}
			}

			return newData;
		});
	}, []);

	return (
		<View className="flex-1 w-full flex-col">
			{/* Fixed header - position it above the scrollable content */}
			<View className="bg-background pb-2">
				<WeekdayHeader />
			</View>

			{/* Scrollable calendar grid */}
			<FlatList
				testID="calendar-grid-list"
				renderItem={({ item }: { item: WeekData }) => (
					<View className="flex-row gap-1 mb-1">
						{item.days.map((day) => (
							<DayCell key={day.id} day={day} onToggleSober={toggleSoberDay} />
						))}
					</View>
				)}
				data={calendarData.weeks}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				removeClippedSubviews={true}
				windowSize={10}
				initialNumToRender={8}
				maxToRenderPerBatch={10}
				className="flex-1"
				contentContainerStyle={{ gap: 1 }}
			/>
		</View>
	);
}
