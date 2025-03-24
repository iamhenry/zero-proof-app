import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { DayData } from "./types";
import {
	getIntensityColor,
	getMonthName,
	getTextColorClass,
	getDayStatus,
	getStatusTextColor,
} from "./utils";

interface DayCellProps {
	day: DayData;
	onToggleSober?: (dayId: string) => void;
}

export function DayCell({ day, onToggleSober }: DayCellProps) {
	const intensityColor = getIntensityColor(day.intensity);
	const dayStatus = getDayStatus(day.date);

	// Get text color based on sober status and intensity
	const textColorClass = day.sober
		? getTextColorClass(day.intensity)
		: getStatusTextColor(dayStatus);

	// Cell style based on sober status
	const cellClass = day.sober
		? `${intensityColor} rounded-lg outline outline-1 outline-offset-[-1px]`
		: `rounded-lg outline outline-1 outline-offset-[-1px]`;

	const handlePress = () => {
		if (onToggleSober) {
			onToggleSober(day.id);
		}
	};

	return (
		<View className="flex-1 p-0.5">
			<TouchableOpacity
				onPress={handlePress}
				activeOpacity={0.7}
				className={`${cellClass} flex-1 px-2.5 pt-7 pb-2 flex-col justify-end items-center h-[60px]`}
			>
				<Text
					className={`${textColorClass} text-center text-[10px] font-extrabold leading-tight`}
				>
					{day.isFirstOfMonth
						? `${getMonthName(day.month)} ${day.day}`
						: day.day}
				</Text>
			</TouchableOpacity>
		</View>
	);
}
