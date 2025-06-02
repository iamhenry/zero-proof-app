import { Tabs } from "expo-router";
import React, { useState, useEffect } from "react";

import OnboardingComponent from "@/components/ui/onboarding/OnboardingComponent"; // Import OnboardingComponent
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import { useRepository } from "@/context/RepositoryContext";

export default function ProtectedLayout() {
	const { colorScheme } = useColorScheme();
	const repository = useRepository();
	const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null); // null = loading
	const [isLoading, setIsLoading] = useState(true);

	// Load onboarding completion status on mount
	useEffect(() => {
		const loadOnboardingStatus = async () => {
			try {
				const completed = await repository.loadOnboardingCompletion();
				console.log(
					`[ProtectedLayout] Onboarding completion status: ${completed}`,
				);
				setShowOnboarding(!completed); // Show onboarding if NOT completed
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
	}, [repository]);

	// Handle onboarding completion
	const handleDone = async () => {
		try {
			console.log("[ProtectedLayout] Onboarding completed, saving to storage");
			await repository.saveOnboardingCompletion(true);
			setShowOnboarding(false);
		} catch (error) {
			console.error(
				"[ProtectedLayout] Error saving onboarding completion:",
				error,
			);
			// Still hide onboarding even if save fails
			setShowOnboarding(false);
		}
	};

	// Show loading state while checking onboarding status
	if (isLoading || showOnboarding === null) {
		return null; // Or a loading spinner if you prefer
	}

	// Show onboarding if not completed
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
