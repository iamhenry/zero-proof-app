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
				className={`px-4 py-3 bg-orange-50 rounded-full shadow-md border border-orange-400 flex-row items-center gap-2 ${className}`}
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
