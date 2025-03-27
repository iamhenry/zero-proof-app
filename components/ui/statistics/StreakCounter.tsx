/**
 * FILE: components/ui/statistics/StreakCounter.tsx
 * CREATED: 2025-03-27 14:30:00
 *
 * PURPOSE:
 * Displays the current sobriety streak count (number of consecutive sober days).
 * Includes a visual streak icon.
 *
 * COMPONENTS:
 * - StreakCounter(props: StreakCounterProps): Renders the streak display.
 *   - props: { count: number, className?: string }
 * DEPENDENCIES: react, react-native, ./StreakIcon
 */

import * as React from "react";
import { View, Text } from "react-native";
import { StreakIcon } from "./StreakIcon";

export interface StreakCounterProps {
	count: number;
	className?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
	count = 0,
	className = "",
}) => {
	return (
		<View className="absolute top-20 left-5 z-10">
			<View
				className={`px-4 py-3 bg-orange-50 rounded-full shadow-[0px_1px_4px_0px_rgba(0,0,0,0.10)] outline outline-1 outline-offset border border-orange-400 flex-row items-center gap-2 ${className}`}
			>
				<View className="flex items-center justify-center">
					<StreakIcon />
				</View>
				<Text className="text-center text-black text-xl font-extrabold font-['Rounded_Mplus_1c']">
					{count}
				</Text>
			</View>
		</View>
	);
};
