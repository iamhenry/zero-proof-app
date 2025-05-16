/**
 * OnboardingDrinkQuantityContainer Component
 *
 * Container component that wraps DrinkQuantityInput for use in the onboarding flow.
 * It handles persistence of drink quantity data to the repository.
 */

import React, { useCallback } from "react";
import { View } from "react-native";
import { useRepository } from "@/context/RepositoryContext";
import { useSavingsData } from "@/context/SavingsDataContext";
import DrinkQuantityInput from "./DrinkQuantityInput";

interface OnboardingDrinkQuantityContainerProps {
	onSubmit: () => void;
}

const OnboardingDrinkQuantityContainer: React.FC<
	OnboardingDrinkQuantityContainerProps
> = ({ onSubmit }) => {
	const repository = useRepository();
	const { refreshDrinkCost } = useSavingsData();

	const handleSubmit = useCallback(
		async (weeklyDrinks: number) => {
			try {
				// Validate input
				if (weeklyDrinks < 0) {
					console.warn(
						"[OnboardingDrinkQuantityContainer] Negative weekly drinks value received, defaulting to 0",
					);
					weeklyDrinks = 0;
				}

				console.log(
					"[OnboardingDrinkQuantityContainer] Saving weekly drinks:",
					weeklyDrinks,
				);

				await repository.saveDrinkCost(weeklyDrinks);
				await refreshDrinkCost(); // Refresh savings data after saving

				console.log(
					"[OnboardingDrinkQuantityContainer] Successfully saved weekly drinks",
				);

				// Verify the save
				const savedValue = await repository.loadDrinkCost();
				console.log(
					"[OnboardingDrinkQuantityContainer] Verified saved value:",
					savedValue,
				);

				onSubmit();
			} catch (error) {
				console.error(
					"[OnboardingDrinkQuantityContainer] Error saving weekly drinks:",
					error,
				);
				// Save a default value of 0 on error
				try {
					await repository.saveDrinkCost(0);
					await refreshDrinkCost(); // Refresh even with default value
					console.log(
						"[OnboardingDrinkQuantityContainer] Saved default value (0) after error",
					);
				} catch (innerError) {
					console.error(
						"[OnboardingDrinkQuantityContainer] Failed to save default value:",
						innerError,
					);
				}
				onSubmit();
			}
		},
		[repository, onSubmit, refreshDrinkCost],
	);

	return (
		<View className="flex-1 justify-center items-center">
			<DrinkQuantityInput onSubmit={handleSubmit} initialValue={0} />
		</View>
	);
};

export default OnboardingDrinkQuantityContainer;
