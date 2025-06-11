/*
FILE: PaywallScreen.tsx
PURPOSE: Displays RevenueCat paywall for subscription purchases and handles user interaction for trial initiation.
FUNCTIONS:
  - PaywallScreen({onDone}) → JSX.Element: Renders the RevenueCat paywall UI with error handling and loading states.
DEPENDENCIES: react-native, react-native-purchases-ui, react-native-purchases
*/
import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import RevenueCatUI from "react-native-purchases-ui";
import { getOfferings, getCustomerInfo } from "@/config/revenuecat";
import { useSubscription } from "@/context/SubscriptionContext";

// Define props interface including the onDone callback
interface PaywallScreenProps {
	onDone: () => void;
}

// Update component to use RevenueCat UI SDK with enhanced error handling
const PaywallScreen: React.FC<PaywallScreenProps> = ({ onDone }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [hasOfferings, setHasOfferings] = useState(false);
	const { handlePurchaseEvent } = useSubscription();

	useEffect(() => {
		// Verify RevenueCat is ready and has offerings
		const checkRevenueCatStatus = async () => {
			try {
				console.log("🔍 PaywallScreen: Checking RevenueCat status...");
				const customerInfo = await getCustomerInfo(); // Initial check
				console.log("✅ PaywallScreen: Customer info retrieved for initial check.", customerInfo.entitlements.active);

				const offerings = await getOfferings();
				console.log("✅ PaywallScreen: Offerings check complete.");
				console.log(
					"📦 Available offerings:",
					JSON.stringify(offerings.all, null, 2), // Log all offerings details
				);

				if (
					offerings.current &&
					offerings.current.availablePackages.length > 0
				) {
					setHasOfferings(true);
					console.log("🎯 PaywallScreen: Current offering found with packages. Identifier:", offerings.current.identifier);
					// Log details of packages in the current offering
					offerings.current.availablePackages.forEach(pkg => {
						console.log(`  Package: ${pkg.identifier}, Product: ${pkg.product.identifier}, Type: ${pkg.packageType}`);
						if (pkg.product.introductoryPrice) {
							console.log(`    Introductory Price: ${JSON.stringify(pkg.product.introductoryPrice)}`);
						}
					});
				} else {
					setError(
						"No subscription packages available. Please check RevenueCat dashboard configuration.",
					);
					console.warn(
						"⚠️ PaywallScreen: No current offering or packages found",
					);
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error occurred";
				setError(`RevenueCat setup error: ${errorMessage}`);
				console.error("❌ PaywallScreen: RevenueCat status check failed:", err);
			} finally {
				setIsLoading(false);
			}
		};

		checkRevenueCatStatus();
	}, []);

	// Loading state
	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#fff",
				}}
			>
				<ActivityIndicator size="large" color="#007AFF" />
				<Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
					Loading subscription options...
				</Text>
			</View>
		);
	}

	// Error state with retry option
	if (error) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#fff",
					padding: 20,
				}}
			>
				<Text
					style={{
						fontSize: 18,
						fontWeight: "bold",
						color: "#FF3B30",
						textAlign: "center",
						marginBottom: 16,
					}}
				>
					Subscription Unavailable
				</Text>
				<Text
					style={{
						fontSize: 14,
						color: "#666",
						textAlign: "center",
						marginBottom: 24,
					}}
				>
					{error}
				</Text>
				<TouchableOpacity
					onPress={() => {
						setError(null);
						setIsLoading(true);
						// Retry the check
						setTimeout(() => {
							const checkAgain = async () => {
								try {
									const offerings = await getOfferings();
									if (
										offerings.current &&
										offerings.current.availablePackages.length > 0
									) {
										setHasOfferings(true);
										console.log("🎯 PaywallScreen (Retry): Current offering found.");
									} else {
										setError("Still no subscription packages available.");
										console.warn("⚠️ PaywallScreen (Retry): Still no offerings.");
									}
								} catch (err) {
									setError(
										`Retry failed: ${err instanceof Error ? err.message : "Unknown error"}`,
									);
								} finally {
									setIsLoading(false);
								}
							};
							checkAgain();
						}, 1000);
					}}
					style={{
						backgroundColor: "#007AFF",
						paddingHorizontal: 20,
						paddingVertical: 12,
						borderRadius: 8,
						marginBottom: 16,
					}}
				>
					<Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
						Retry
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={onDone}
					style={{
						backgroundColor: "#666",
						paddingHorizontal: 20,
						paddingVertical: 12,
						borderRadius: 8,
					}}
				>
					<Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
						Continue Without Subscription
					</Text>
				</TouchableOpacity>
			</View>
		);
	}

	// Main paywall component (only render if we have offerings)
	if (!hasOfferings) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#fff",
				}}
			>
				<Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
					No subscription options available at this time.
				</Text>
				<TouchableOpacity
					onPress={onDone}
					style={{
						backgroundColor: "#007AFF",
						paddingHorizontal: 20,
						paddingVertical: 12,
						borderRadius: 8,
						marginTop: 20,
					}}
				>
					<Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
						Continue
					</Text>
				</TouchableOpacity>
			</View>
		);
	}

	console.log("🚀 PaywallScreen: Rendering RevenueCatUI.Paywall component.");
	return (
		<View
			style={{
				flex: 1,
				width: "100%",
				paddingBottom: 90,
			}}
		>
			<RevenueCatUI.Paywall
				options={{
					displayCloseButton: false,
				}}
				onPurchaseCompleted={async ({ customerInfo }) => {
					console.log(
						"✅ PaywallScreen: Purchase completed. CustomerInfo entitlements:",
						JSON.stringify(customerInfo.entitlements.active, null, 2),
					);
					await handlePurchaseEvent(customerInfo); // Ensure this is awaited if it's async
					onDone();
				}}
				onRestoreCompleted={async ({ customerInfo }) => {
					console.log(
						"ℹ️ PaywallScreen: Restore attempt completed. CustomerInfo entitlements:",
						JSON.stringify(customerInfo.entitlements.active, null, 2),
					);
					if (
						customerInfo.entitlements.active &&
						Object.keys(customerInfo.entitlements.active).length > 0
					) {
						console.log(
							"✅ PaywallScreen: Restore completed with active entitlements.",
						);
						await handlePurchaseEvent(customerInfo); // Ensure this is awaited
						onDone();
					} else {
						console.log(
							"ℹ️ PaywallScreen: Restore completed but no active entitlements found.",
						);
						// Optionally, you might want to inform the user here or let SubscriptionContext handle it.
					}
				}}
				onDismiss={() => {
					console.log("ℹ️ PaywallScreen: Paywall dismissed. This should not happen with displayCloseButton:false.");
				}}
				onPurchaseError={(error) => {
					console.error("❌ PaywallScreen: Purchase error:", error);
				}}
				onPurchaseCancelled={() => {
					console.log("ℹ️ PaywallScreen: Purchase cancelled by user.");
				}}
				onPurchaseStarted={(purchaseParams) => {
					console.log("🚀 PaywallScreen: Purchase started for package:", purchaseParams.packageIdentifier);
				}}
			/>
		</View>
	);
};

export default PaywallScreen;
