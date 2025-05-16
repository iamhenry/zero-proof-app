/**
 * SettingsDrinkQuantityContainer Component
 *
 * Container component that wraps DrinkQuantityInput for use in the settings screen.
 * It loads and persists drink quantity data using the repository.
 */

import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useRepository } from "@/context/RepositoryContext";
import DrinkQuantityInput from "../onboarding/DrinkQuantityInput";

interface SettingsDrinkQuantityContainerProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

const SettingsDrinkQuantityContainer: React.FC<
	SettingsDrinkQuantityContainerProps
> = ({ onSuccess, onCancel }) => {
	const repository = useRepository();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [initialValue, setInitialValue] = useState<number>(0);
	const [isSaved, setIsSaved] = useState(false);

	useEffect(() => {
		const loadDrinkCost = async () => {
			try {
				const value = await repository.loadDrinkCost();
				setInitialValue(value || 0);
			} catch (error) {
				setErrorMessage("Failed to load drink quantity data.");
				console.error("Error loading drink quantity data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadDrinkCost();
	}, [repository]);

	const handleSubmit = async (quantity: number) => {
		setIsLoading(true);
		setErrorMessage(null);
		setIsSaved(false);

		try {
			await repository.saveDrinkCost(quantity);
			setIsSaved(true);

			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			setErrorMessage("Failed to save drink quantity. Please try again.");
			console.error("Error saving drink quantity:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Use a separate error message display outside of the DrinkQuantityInput
	// to ensure it's visible even when the save operation fails
	const renderErrorMessage = () => {
		if (errorMessage) {
			return (
				<Text
					className="text-red-500 text-center mt-2"
					accessibilityRole="alert"
				>
					{errorMessage}
				</Text>
			);
		}
		return null;
	};

	return (
		<View className="flex-1">
			<DrinkQuantityInput
				onSubmit={handleSubmit}
				initialValue={initialValue}
				errorMessage={undefined} // Handle errors at the container level instead
				isLoading={isLoading}
				label="Weekly drink quantity"
				buttonText="Save"
				isSettingsMode={true}
				onCancel={onCancel}
			/>
			{renderErrorMessage()}
			{isSaved && !errorMessage && (
				<Text className="text-green-500 text-center mt-2">
					Settings saved successfully!
				</Text>
			)}
		</View>
	);
};

export default SettingsDrinkQuantityContainer;
