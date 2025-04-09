/**
 * FILE: components/ui/statistics/StreakCounter.tsx
 * PURPOSE: Displays the current sobriety streak count with a visual icon.
 * FUNCTIONS:
 *   - StreakCounter({ count: number, className?: string }): JSX.Element -> Renders the streak counter component.
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
	// Add debug log for when streak count changes
	React.useEffect(() => {
		console.log(`[StreakCounter:render] Displaying streak count: ${count}`);
	}, [count]);

	return (
		<View className="absolute top-20 left-5 z-10">
			<View
				className={`px-4 py-3 bg-orange-50 rounded-full shadow-[0px_1px_4px_0px_rgba(0,0,0,0.10)] outline outline-1 outline-offset border border-orange-400 flex-row items-center gap-2 ${className}`}
			>
				<View className="flex items-center justify-center">
					{/* Explicitly passing default props as a potential workaround for test environment issues */}
					<StreakIcon width={18} height={21} />
				</View>
				<Text className="text-center text-black text-xl font-extrabold font-['Rounded_Mplus_1c']">
					{count}
				</Text>
			</View>
		</View>
	);
};
