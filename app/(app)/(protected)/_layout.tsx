import { Tabs } from "expo-router";
import React, { useState } from "react"; // Import useState

import OnboardingComponent from "@/components/ui/onboarding/OnboardingComponent"; // Import OnboardingComponent
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/lib/useColorScheme";

export default function ProtectedLayout() {
	const { colorScheme } = useColorScheme();
	const [showOnboarding, setShowOnboarding] = useState(true); // Add state

	// Add handler function
	const handleDone = () => {
		setShowOnboarding(false);
	};

	// Add conditional rendering logic
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
