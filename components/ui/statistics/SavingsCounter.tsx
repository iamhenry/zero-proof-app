/**
 * FILE: components/ui/statistics/SavingsCounter.tsx
 * CREATED: 2025-03-27 14:30:00
 *
 * PURPOSE:
 * Displays the total monetary savings achieved, typically related to sobriety efforts.
 * Includes a visual money icon.
 *
 * COMPONENTS:
 * - SavingsCounter(props: SavingsCounterProps): Renders the savings display.
 *   - props: { amount: string, className?: string }
 * DEPENDENCIES: react, react-native, ./MoneyIcon
 */

import * as React from "react";
import { View, Text } from "react-native";
import { MoneyIcon } from "./MoneyIcon";

export interface SavingsCounterProps {
	amount: string;
	className?: string;
}

export const SavingsCounter: React.FC<SavingsCounterProps> = ({
	amount = "$1,298",
	className = "",
}) => {
	return (
		<View className="absolute top-20 right-5 z-10">
			<View
				className={`px-4 py-3 bg-green-100 rounded-full shadow-[0px_1px_4px_0px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] border border-emerald-400 flex-row items-center gap-2 ${className}`}
			>
				<View className="flex items-center justify-center">
					<MoneyIcon />
				</View>
				<Text className="text-center text-black text-xl font-extrabold font-['Rounded_Mplus_1c']">
					${amount}
				</Text>
			</View>
		</View>
	);
};
