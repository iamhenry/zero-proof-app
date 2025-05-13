/**
 * DrinkQuantityInput Component
 * A form component for collecting and validating weekly drink quantity input.
 * Uses React Hook Form with Zod validation.
 */

import React from "react";
import { View } from "react-native";
import { Controller } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Label } from "@/components/ui/label";
import { useDrinkQuantityForm } from "@/components/ui/onboarding/hooks/useDrinkQuantityForm";
import { DrinkQuantityInputProps } from "@/components/ui/onboarding/types";

const DrinkQuantityInput: React.FC<DrinkQuantityInputProps> = ({
	onSubmit,
	initialValue = 0,
	placeholder = "0",
	errorMessage = "Please enter a quantity greater than 0",
	label = "Number of drinks per week?",
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
			<Button
				onPress={handleSubmit(handleFormSubmit)}
				disabled={isButtonDisabled}
				className="mt-4"
				aria-label="Next"
				accessibilityState={{ disabled: isButtonDisabled }}
				accessibilityRole="button"
			>
				<Text>Next</Text>
			</Button>
		</View>
	);
};

export default DrinkQuantityInput;
