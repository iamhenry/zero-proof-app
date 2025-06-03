import { Tabs } from "expo-router";
import React, { useState, useEffect } from "react";

import OnboardingComponent from "@/components/ui/onboarding/OnboardingComponent"; // Import OnboardingComponent
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import { useRepository } from "@/context/RepositoryContext";
import { useSubscription } from "@/context/SubscriptionContext";

export default function ProtectedLayout() {
	const { colorScheme } = useColorScheme();
	const repository = useRepository();
	const subscription = useSubscription();
	const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null); // null = loading
	const [isLoading, setIsLoading] = useState(true);

	// Load onboarding completion status on mount
	// Potential Issue: isLoading flag never resets on effect re-runs.
	// UI may flash incorrect content because isLoading stays false while async work is still ongoing.
	// I think this happend on the welcome screen. NEED TO TEST.
	useEffect(() => {
		const loadOnboardingStatus = async () => {
			try {
				const completed = await repository.loadOnboardingCompletion();
				console.log(
					`[ProtectedLayout] Onboarding completion status: ${completed}`,
				);
				console.log(
					`[ProtectedLayout] Subscription access: ${subscription.hasAccess}`,
				);

				// Show onboarding if NOT completed OR if no subscription access
				// This ensures users without subscription go through the paywall in onboarding
				setShowOnboarding(!completed || !subscription.hasAccess);
			} catch (error) {
				console.error(
					"[ProtectedLayout] Error loading onboarding status:",
					error,
				);
				setShowOnboarding(true); // Default to showing onboarding on error
			} finally {
				setIsLoading(false);
			}
		};

		loadOnboardingStatus();
	}, [repository, subscription.hasAccess]);

	// Handle onboarding completion
	const handleDone = async () => {
		try {
			console.log("[ProtectedLayout] Onboarding completed, saving to storage");
			await repository.saveOnboardingCompletion(true);

			// Only hide onboarding if user has subscription access
			// This ensures users without subscription stay in onboarding/paywall flow
			if (subscription.hasAccess) {
				setShowOnboarding(false);
			} else {
				// Keep showing onboarding if no subscription - user needs to purchase
				console.log(
					"[ProtectedLayout] No subscription access, keeping onboarding visible",
				);
				setShowOnboarding(true);
			}
		} catch (error) {
			console.error(
				"[ProtectedLayout] Error saving onboarding completion:",
				error,
			);
			// Still check subscription access even if save fails
			if (subscription.hasAccess) {
				setShowOnboarding(false);
			}
		}
	};

	// Show loading state while checking onboarding status or subscription loading
	if (isLoading || showOnboarding === null || subscription.isLoading) {
		return null; // Or a loading spinner if you prefer
	}

	// Show onboarding if not completed OR no subscription access
	if (showOnboarding) {
		return <OnboardingComponent onDone={handleDone} />;
	}

	// Original return statement for when onboarding is done
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				tabBarActiveTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
				tabBarShowLabel: false,
			}}
		>
			<Tabs.Screen name="index" options={{ title: "Home" }} />
			<Tabs.Screen name="settings" options={{ title: "Settings" }} />
		</Tabs>
	);
}
