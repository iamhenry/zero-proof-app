import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { DayData } from "./types";
import { getIntensityColor, getMonthName } from "./utils";

interface DayCellProps {
	day: DayData;
}

export function DayCell({ day }: DayCellProps) {
	const intensityColor = getIntensityColor(day.intensity);

	// Add a background class for days with no intensity (white cells)
	const bgClass = day.intensity === 0 ? "bg-white" : intensityColor;

	return (
		<View className="flex-1 aspect-square p-0.5">
			<View
				className={`${bgClass} rounded-md flex-1 justify-end items-center pb-1`}
			>
				<Text className="text-xs text-foreground font-medium">
					{day.isFirstOfMonth
						? `${getMonthName(day.month)} ${day.day}`
						: day.day}
				</Text>
			</View>
		</View>
	);
}
