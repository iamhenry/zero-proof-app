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

	return (
		<View className="flex-1 aspect-square p-0.5">
			<View
				className={`${intensityColor} rounded-md flex-1 justify-center items-center`}
			>
				{day.isFirstOfMonth ? (
					<View className="absolute top-1 left-1">
						<Text className="text-[10px] text-foreground font-medium">
							{`${getMonthName(day.month)} ${day.day}`}
						</Text>
					</View>
				) : null}

				<Text className="text-xs text-foreground font-medium">{day.day}</Text>
			</View>
		</View>
	);
}
