/*
FILE: PaywallScreen.tsx
PURPOSE: Displays RevenueCat paywall for subscription purchases and handles user interaction for trial initiation.
FUNCTIONS:
  - PaywallScreen({onDone}) → JSX.Element: Renders the RevenueCat paywall UI.
DEPENDENCIES: react-native, react-native-purchases-ui
*/
import React from "react";
import { View } from "react-native";
import RevenueCatUI from "react-native-purchases-ui";

// Define props interface including the onDone callback
interface PaywallScreenProps {
	onDone: () => void;
}

// Update component to use RevenueCat UI SDK
const PaywallScreen: React.FC<PaywallScreenProps> = ({ onDone }) => {
	return (
		<View style={{ flex: 1 }}>
			<RevenueCatUI.Paywall
				options={{
					displayCloseButton: false, // No close button since onboarding handles navigation
				}}
				onPurchaseCompleted={({ customerInfo }) => {
					// Purchase successful - user now has subscription access
					console.log("Purchase completed:", customerInfo.entitlements);
					onDone();
				}}
				onRestoreCompleted={({ customerInfo }) => {
					// Check if user now has active entitlements
					if (
						customerInfo.entitlements.active &&
						Object.keys(customerInfo.entitlements.active).length > 0
					) {
						console.log("Restore completed with active entitlements");
						onDone();
					}
				}}
				onDismiss={() => {
					// This shouldn't be called since displayCloseButton is false
					// But handle it just in case
					console.log("Paywall dismissed without purchase");
				}}
				onPurchaseError={(error) => {
					// Handle purchase errors
					console.error("Purchase error:", error);
				}}
				onPurchaseCancelled={() => {
					// Handle purchase cancellation
					console.log("Purchase cancelled by user");
				}}
			/>
		</View>
	);
};

export default PaywallScreen;
