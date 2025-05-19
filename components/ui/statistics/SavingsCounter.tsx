// FILE: components/ui/statistics/SavingsCounter.tsx
// PURPOSE: Displays the total monetary savings achieved, fetching data from SavingsDataContext. Includes a visual money icon.
// COMPONENTS:
//   - SavingsCounter(props: { className?: string }): Renders the savings display. Fetches savings amount via useSavingsData hook.
// DEPENDENCIES: React, React Native, ./MoneyIcon, @/context/SavingsDataContext, ../settings/SettingsDrinkQuantityContainer

import * as React from "react";
import {
	View,
	Text,
	ActivityIndicator,
	Modal,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	Button,
} from "react-native";
import { MoneyIcon } from "./MoneyIcon";
import { useSavingsData } from "@/context/SavingsDataContext"; // Import the hook
import SettingsDrinkQuantityContainer from "@/components/ui/settings/SettingsDrinkQuantityContainer";

// Remove amount prop, className is still useful
export interface SavingsCounterProps {
	className?: string;
}

export const SavingsCounter: React.FC<SavingsCounterProps> = ({
	className = "",
}) => {
	const [isModalVisible, setIsModalVisible] = React.useState(false);
	const [isSaving, setIsSaving] = React.useState(false);
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

	const openModal = () => setIsModalVisible(true);
	const closeModal = () => setIsModalVisible(false);

	return (
		<>
			<TouchableOpacity
				onPress={openModal}
				className="absolute top-20 right-5 z-10"
			>
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
			</TouchableOpacity>
			<Modal
				testID="modal"
				visible={isModalVisible}
				onRequestClose={closeModal}
				animationType="slide"
				presentationStyle="pageSheet"
			>
				<SafeAreaView style={styles.modalContent}>
					<View style={styles.modalHeader}>
						<TouchableOpacity
							onPress={closeModal}
							testID="modal-close-button"
							style={{ padding: 8 }}
						>
							<Text style={{ color: "#007AFF", fontSize: 17 }}>Close</Text>
						</TouchableOpacity>
					</View>
					<SettingsDrinkQuantityContainer
						onSuccess={async () => {
							console.log("[SavingsCounter] Starting save success handler");
							setIsSaving(true);
							try {
								console.log("[SavingsCounter] Refreshing drink cost");
								await refreshDrinkCost();
								console.log("[SavingsCounter] Refresh complete");
								console.log("[SavingsCounter] Cleaning up");
								setIsSaving(false);
								// Use requestAnimationFrame to ensure state updates have propagated
								requestAnimationFrame(() => {
									closeModal();
									console.log("[SavingsCounter] Modal closed");
								});
							} catch (error) {
								console.error(
									"[SavingsCounter] Error in success handler:",
									error,
								);
								setIsSaving(false);
								throw error;
							}
						}}
						onCancel={closeModal}
						disabled={isSaving}
					/>
				</SafeAreaView>
			</Modal>
		</>
	);
};

const styles = StyleSheet.create({
	modalContent: {
		flex: 1,
		marginTop: 22, // Adjust as needed for pageSheet presentation
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "flex-end",
		paddingHorizontal: 10,
		paddingTop: 10,
	},
});
