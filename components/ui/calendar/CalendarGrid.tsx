import React, { useMemo } from "react";
import { View, FlatList } from "react-native";
import { WeekdayHeader } from "./WeekdayHeader";
import { DayCell } from "./DayCell";
import { generateStaticCalendarData } from "./utils";
import { WeekData } from "./types";

export function CalendarGrid() {
	// Generate static calendar data with 5 months
	const calendarData = useMemo(() => generateStaticCalendarData(), []);

	const renderWeek = ({ item }: { item: WeekData }) => (
		<View className="flex-row">
			{item.days.map((day) => (
				<DayCell key={day.id} day={day} />
			))}
		</View>
	);

	return (
		<View className="flex-1">
			{/* Fixed header - position it above the scrollable content */}
			<View className="bg-background pb-2">
				<WeekdayHeader />
			</View>

			{/* Scrollable calendar grid */}
			<FlatList
				data={calendarData.weeks}
				renderItem={renderWeek}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				removeClippedSubviews={true}
				windowSize={10}
				initialNumToRender={8}
				maxToRenderPerBatch={10}
				className="flex-1"
			/>
		</View>
	);
}
