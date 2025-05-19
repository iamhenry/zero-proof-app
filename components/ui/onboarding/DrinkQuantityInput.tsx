/**
 * DrinkQuantityInput Component
 *
 * A reusable component for collecting and validating drink quantity input
 * that works in both onboarding and settings contexts.
 */

import React from "react";
import {
	View,
	Text,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
} from "react-native";
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
	label = "How many drinks per week?",
	buttonText = "Next",
	isSettingsMode = false,
	onCancel,
	isLoading = false,
	disabled = false,
}) => {
	const {
		control,
		handleSubmit,
		errors,
		isButtonDisabled,
		setValue,
		quantityValue,
	} = useDrinkQuantityForm({
		onSubmit,
		initialValue,
		errorMessage,
	});

	const handleFormSubmit = async (data: { quantity: string }) => {
		Keyboard.dismiss();
		await onSubmit(parseInt(data.quantity, 10));
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			keyboardVerticalOffset={100}
			style={{ flex: 1 }}
		>
			<View className="flex flex-1 justify-center p-4" accessible={true}>
				<Label
					nativeID="drinkQuantityLabel"
					testID="drink-quantity-label"
					className="pb-2 text-lg font-semibold text-center"
				>
					{label}
				</Label>
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
							className="mb-4 text-8xl border-0 text-center"
							aria-labelledby="drinkQuantityLabel"
							aria-describedby={errors.quantity ? "quantityError" : undefined}
							editable={!isLoading && !disabled}
							returnKeyType="done"
							onSubmitEditing={Keyboard.dismiss}
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
							onPress={() => {
								Keyboard.dismiss();
								onCancel();
							}}
							className="flex-1 mr-2 rounded-full text-black"
							aria-label="Cancel"
							accessibilityRole="button"
							variant="outline"
							disabled={isLoading || disabled}
						>
							<Text>Cancel</Text>
						</Button>
					)}
					<Button
						onPress={handleSubmit(handleFormSubmit)}
						disabled={isButtonDisabled || isLoading || disabled}
						className={`${isSettingsMode ? "flex-1" : ""} rounded-full`}
						aria-label={buttonText}
						accessibilityState={{ disabled: isButtonDisabled || isLoading }}
						accessibilityRole="button"
					>
						{isLoading ? (
							<ActivityIndicator testID="loading-indicator" color="white" />
						) : (
							<Text className="text-white">Save</Text>
						)}
					</Button>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
};

export default DrinkQuantityInput;
