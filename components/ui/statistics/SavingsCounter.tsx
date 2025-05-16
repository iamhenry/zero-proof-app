// FILE: components/ui/statistics/SavingsCounter.tsx
// PURPOSE: Displays the total monetary savings achieved, fetching data from SavingsDataContext. Includes a visual money icon.
// COMPONENTS:
//   - SavingsCounter(props: { className?: string }): Renders the savings display. Fetches savings amount via useSavingsData hook.
// DEPENDENCIES: React, React Native, ./MoneyIcon, @/context/SavingsDataContext

import * as React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { MoneyIcon } from "./MoneyIcon";
import { useSavingsData } from "@/context/SavingsDataContext"; // Import the hook

// Remove amount prop, className is still useful
export interface SavingsCounterProps {
	className?: string;
}

export const SavingsCounter: React.FC<SavingsCounterProps> = ({
	className = "",
}) => {
	// Consume the context
	const { currentSavings, isLoading, refreshDrinkCost } = useSavingsData();

	// Refresh on mount to ensure fresh data
	React.useEffect(() => {
		refreshDrinkCost();
	}, [refreshDrinkCost]);

	// Log when savings update
	React.useEffect(() => {
		console.log("[SavingsCounter] Savings updated:", {
			currentSavings,
			isLoading,
		});
	}, [currentSavings, isLoading]);

	// Minimal formatting for display
	const formattedAmount = currentSavings.toLocaleString();

	return (
		<View className="absolute top-20 right-5 z-10">
			<View
				className={`px-4 py-3 bg-green-100 rounded-full shadow-[0px_1px_4px_0px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] border border-emerald-400 flex-row items-center gap-2 ${className}`}
			>
				<View className="flex items-center justify-center">
					<MoneyIcon />
				</View>
				{isLoading ? (
					<ActivityIndicator
						testID="activity-indicator"
						size="small"
						color="#10B981" // Emerald-500 color
					/>
				) : (
					<Text className="text-center text-black text-xl font-extrabold font-['Rounded_Mplus_1c']">
						${formattedAmount}
					</Text>
				)}
			</View>
		</View>
	);
};
