/**
 * FILE: components/ui/settings/AccountDeletionModal.tsx
 * PURPOSE: Modal component for account deletion confirmation with subscription warnings and error handling
 * FUNCTIONS:
 *   - AccountDeletionModal({ visible, onConfirm, onCancel, isLoading, error }) → JSX.Element: Renders confirmation modal
 *   - handleConfirm() → Promise<void>: Handles account deletion confirmation with loading state
 *   - handleCancel() → void: Handles modal cancellation and cleanup
 * DEPENDENCIES: react, react-native, AccountDeletionTypes, UI components
 */

import React, { useState } from "react";
import {
	Modal,
	View,
	SafeAreaView,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Feather } from "@expo/vector-icons";
import { AccountDeletionModalProps } from "../../../lib/types/AccountDeletionTypes";

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
	visible,
	onConfirm,
	onCancel,
	isLoading,
	error,
}) => {
	const [hasAcknowledgedWarning, setHasAcknowledgedWarning] = useState(false);

	const handleConfirm = async (): Promise<void> => {
		await onConfirm();
	};

	const handleCancel = (): void => {
		onCancel();
		setHasAcknowledgedWarning(false);
	};

	const handleAcknowledgeWarning = (): void => {
		setHasAcknowledgedWarning(!hasAcknowledgedWarning);
	};

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<SafeAreaView className="flex-1 bg-background">
				{/* Header */}
				<View className="flex-row items-center justify-between p-4 border-b border-gray-200">
					<Text className="text-lg font-semibold">Delete Account</Text>
					<TouchableOpacity onPress={handleCancel}>
						<Feather name="x" size={24} color="#666" />
					</TouchableOpacity>
				</View>

				{/* Content */}
				<View className="flex-1 p-6">
					{/* Warning Message */}
					<View className="mb-6">
						<Text className="text-red-600 font-medium text-lg mb-2">
							Warning: This action cannot be undone
						</Text>
						<Text className="text-gray-700 mb-4">
							Deleting your account will permanently remove:
						</Text>
						<View className="mb-4">
							<Text className="text-gray-700 mb-1">
								• Your account credentials
							</Text>
							<Text className="text-gray-700 mb-1">
								• Access to premium features
							</Text>
							<Text className="text-gray-700 mb-1">
								• Access to your local data
							</Text>
						</View>
					</View>

					{/* Local Data Warning */}
					<View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
						<Text className="text-blue-800 font-medium mb-2">Local Data</Text>
						<Text className="text-blue-700">
							Your local app data will remain on this device until you uninstall
							the app.
						</Text>
					</View>

					{/* Subscription Warning */}
					<View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
						<Text className="text-yellow-800 font-medium mb-2">
							Subscription Management
						</Text>
						<Text className="text-yellow-700 mb-2">
							Deleting your account does NOT cancel your subscription. You must
							cancel your subscription separately in your device settings.
						</Text>
						<TouchableOpacity onPress={handleAcknowledgeWarning}>
							<View className="flex-row items-center mt-2">
								<Feather
									name={hasAcknowledgedWarning ? "check-square" : "square"}
									size={16}
									color="#d97706"
								/>
								<Text className="text-yellow-700 ml-2">
									I understand subscription is separate
								</Text>
							</View>
						</TouchableOpacity>
					</View>

					{/* Error Display */}
					{error && (
						<View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
							<Text className="text-red-800 font-medium mb-2">❌ Error</Text>
							<Text className="text-red-700">{error.message}</Text>
						</View>
					)}

					{/* Action Buttons */}
					<View className="flex-row gap-4 mt-auto">
						<Button
							className="flex-1 bg-gray-200 rounded-full"
							variant="outline"
							onPress={handleCancel}
							disabled={isLoading}
							testID="cancel-button"
						>
							<Text className="text-gray-700">Cancel</Text>
						</Button>

						<Button
							className="flex-1 bg-red-600 rounded-full"
							onPress={handleConfirm}
							disabled={isLoading || !hasAcknowledgedWarning}
							testID="delete-button"
						>
							{isLoading ? (
								<ActivityIndicator color="white" testID="activity-indicator" />
							) : (
								<View className="flex-row items-center gap-2">
									<Text className="text-white font-medium text-red-50">
										Delete Account
									</Text>
								</View>
							)}
						</Button>
					</View>
				</View>
			</SafeAreaView>
		</Modal>
	);
};
