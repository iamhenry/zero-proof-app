import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

export function WeekdayHeader() {
	const weekdays = ["S", "M", "T", "W", "Th", "F", "S"];

	return (
		<View className="flex-row mb-2">
			{weekdays.map((day, index) => (
				<View key={index} className="flex-1 items-center justify-center py-2.5">
					<Text className="text-xs font-medium text-foreground/70">{day}</Text>
				</View>
			))}
		</View>
	);
}
