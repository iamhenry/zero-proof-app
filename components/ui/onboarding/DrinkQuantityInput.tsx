/**
 * DrinkQuantityInput Component
 *
 * A reusable component for collecting and validating drink quantity input
 * that works in both onboarding and settings contexts.
 */

import React from "react";
import { View, Text } from "react-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";
import { useDrinkQuantityForm } from "@/components/ui/onboarding/hooks/useDrinkQuantityForm";
import { DrinkQuantityInputProps } from "@/components/ui/onboarding/types";

const DrinkQuantityInput: React.FC<DrinkQuantityInputProps> = ({
	onSubmit,
	initialValue = 0,
	placeholder = "0",
	errorMessage = "Please enter a valid quantity",
	label = "How many drinks would you typically have in a week?",
	buttonText = "Next",
	isSettingsMode = false,
	onCancel,
	isLoading = false,
}) => {
	const { control, handleSubmit, errors, isButtonDisabled, setValue } =
		useDrinkQuantityForm({
			onSubmit,
			initialValue,
			errorMessage,
		});

	const handleFormSubmit = async (data: { quantity: string }) => {
		await onSubmit(parseInt(data.quantity, 10));
	};

	return (
		<View className="flex flex-1 justify-center p-4" accessible={true}>
			<Label
				nativeID="drinkQuantityLabel"
				className="pb-2 text-lg font-semibold"
			>
				{label}
			</Label>
			<Text className="text-4xl text-center mb-4">{placeholder}</Text>
			<Controller
				control={control}
				name="quantity"
				render={({ field: { onChange, onBlur, value } }) => (
					<Input
						placeholder={placeholder}
						onBlur={onBlur}
						onChangeText={(text) => {
							// Allow only numeric input
							const numericText = text.replace(/[^0-9]/g, "");
							onChange(numericText);
							setValue("quantity", numericText, { shouldValidate: true });
						}}
						value={value}
						keyboardType="numeric"
						className="mb-4 text-4xl"
						aria-labelledby="drinkQuantityLabel"
						aria-describedby={errors.quantity ? "quantityError" : undefined}
						editable={!isLoading}
					/>
				)}
			/>
			{errors.quantity && (
				<Text
					nativeID="quantityError"
					className="text-red-500 pb-2"
					accessibilityRole="alert"
					role="alert"
				>
					{errors.quantity.message || errorMessage}
				</Text>
			)}
			<View
				className={`mt-4 ${isSettingsMode ? "flex-row justify-between" : ""}`}
			>
				{isSettingsMode && onCancel && (
					<Button
						onPress={onCancel}
						className="flex-1 mr-2"
						aria-label="Cancel"
						accessibilityRole="button"
						variant="outline"
						disabled={isLoading}
					>
						Cancel
					</Button>
				)}
				<Button
					onPress={handleSubmit(handleFormSubmit)}
					disabled={isButtonDisabled || isLoading}
					className={isSettingsMode ? "flex-1" : ""}
					aria-label={buttonText}
					accessibilityState={{ disabled: isButtonDisabled || isLoading }}
					accessibilityRole="button"
				>
					{buttonText}
				</Button>
			</View>
		</View>
	);
};

export default DrinkQuantityInput;
