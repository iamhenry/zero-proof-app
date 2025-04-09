/**
 * FILE: components/ui/calendar/DayCell.tsx
 * PURPOSE: Renders an optimized, memoized, interactive day cell for the calendar grid.
 * FUNCTIONS:
 *   - DayCell({ day: DayData, onToggleSober?: (dayId: string) => void }): JSX.Element -> Renders a single day cell, optimized with React.memo.
 * DEPENDENCIES: react, react-native, @/components/ui/text, ./types, ./utils
 */

import React, { useCallback, useMemo } from "react";
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

// Use React.memo to prevent unnecessary re-renders
export const DayCell = React.memo(
	function DayCell({ day, onToggleSober }: DayCellProps) {
		// Memoize expensive calculations
		const dayStatus = useMemo(() => getDayStatus(day.date), [day.date]);
		const intensityColor = useMemo(
			() => getIntensityColor(day.intensity),
			[day.intensity],
		);

		// Added debug log for DayCell render
		React.useEffect(() => {
			console.log(
				`[DayCell:render] Day: ${day.id}, Sober: ${day.sober}, Intensity: ${day.intensity}`,
			);
		}, [day.id, day.sober, day.intensity]);

		// Memoize text color calculation
		const textColorClass = useMemo(() => {
			return day.sober
				? getTextColorClass(day.intensity)
				: getStatusTextColor(dayStatus);
		}, [day.sober, day.intensity, dayStatus]);

		// Memoize cell class string
		const cellClass = useMemo(() => {
			return day.sober
				? `${intensityColor} rounded-lg outline outline-1 outline-offset-[-1px]`
				: `rounded-lg outline outline-1 outline-offset-[-1px]`;
		}, [day.sober, intensityColor]);

		// Memoize cell content
		const cellContent = useMemo(() => {
			return day.isFirstOfMonth
				? `${getMonthName(day.month)} ${day.day}`
				: day.day;
		}, [day.isFirstOfMonth, day.month, day.day]);

		// Memoize press handler
		const handlePress = useCallback(() => {
			console.log(
				`[DayCell:handlePress] Called for day: ${day.id}. Current state: Sober=${day.sober}, Intensity=${day.intensity}. Has onToggleSober prop: ${!!onToggleSober}`,
			);
			if (onToggleSober) {
				onToggleSober(day.id);
			}
		}, [onToggleSober, day.id, day.sober, day.intensity]);

		return (
			<View className="flex-1 p-0.5">
				<TouchableOpacity
					testID="day-cell-touchable"
					onPress={handlePress}
					activeOpacity={0.9} // Increase activeOpacity to make the effect less noticeable
					className={`${cellClass} flex-1 px-2.5 pt-7 pb-2 flex-col justify-end items-center h-[60px]`}
				>
					<Text
						className={`${textColorClass} text-center text-[10px] font-extrabold leading-tight`}
					>
						{cellContent}
					</Text>
				</TouchableOpacity>
			</View>
		);
	},
	(prevProps, nextProps) => {
		// Custom equality function for React.memo
		// Only re-render if these props change
		return (
			prevProps.day.id === nextProps.day.id &&
			prevProps.day.sober === nextProps.day.sober &&
			prevProps.day.intensity === nextProps.day.intensity &&
			prevProps.day.isFirstOfMonth === nextProps.day.isFirstOfMonth
		);
	},
);
