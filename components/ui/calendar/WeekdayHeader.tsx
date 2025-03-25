import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

export function WeekdayHeader() {
	const weekdays = ["S", "M", "T", "W", "Th", "F", "S"];

	return (
		<View testID="weekday-header-container" className="flex-row mb-2 gap-1">
			{weekdays.map((day, index) => (
				<View
					key={index}
					testID="weekday-column"
					className="flex-1 items-center justify-center py-3"
				>
					<Text className="text-[11px] font-bold text-neutral-500">{day}</Text>
				</View>
			))}
		</View>
	);
}
