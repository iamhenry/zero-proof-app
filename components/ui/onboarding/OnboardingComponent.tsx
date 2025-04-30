/*
FILE: OnboardingComponent.tsx
PURPOSE: Displays onboarding screens for new users, including a paywall as the final step.
FUNCTIONS:
  - OnboardingComponent({onDone}) → JSX.Element: Renders the onboarding flow.
DEPENDENCIES: react-native-onboarding-swiper, react-native Image, PaywallScreen
*/
import React from "react";
import { Image, View } from "react-native"; // Removed TouchableOpacity, Button, Text imports
import Onboarding from "react-native-onboarding-swiper"; // Removed DoneButtonProps
import PaywallScreen from "./PaywallScreen"; // Import the new PaywallScreen

// Define props interface
interface OnboardingComponentProps {
	onDone: () => void;
}

// Update component to accept props
const OnboardingComponent: React.FC<OnboardingComponentProps> = ({
	onDone,
}) => {
	// Removed custom DoneButtonComponent

	return (
		<Onboarding
			onDone={onDone} // This prop is now primarily for the library's internal use if needed, dismissal is handled in PaywallScreen
			showSkip={false} // As per roadmap requirement
			showNext={false} // Explicitly hide Next button on all pages
			showDone={false} // Hide default Done button
			bottomBarColor={false} // Make bottom bar transparent to avoid background color issues
			bottomBarHighlight={false} // Disable the default bottom bar highlight effect
			// Removed DoneButtonComponent prop
			pages={[
				{
					backgroundColor: "#fff",
					image: (
						<Image
							source={require("assets/onboarding/onboarding-heatmap.png")}
						/>
					), // Using existing asset as placeholder
					title: "Sobriety Heatmap",
					subtitle:
						"The longer your active sober streak, the darker your shades get.",
				},
				{
					backgroundColor: "#fff",
					image: (
						<Image
							source={require("assets/onboarding/onboarding-streak.png")}
						/>
					), // Using existing asset as placeholder
					title: "Active Streak",
					subtitle:
						"Active steak helps you stay motivated on your journey to sobriety",
				},
				{
					backgroundColor: "#fff",
					image: (
						<Image
							source={require("assets/onboarding/onboarding-savings.png")}
						/>
					), // Using existing asset as placeholder
					title: "Track Savings",
					subtitle:
						"Track and calculate your savings based on the days you've been sober.",
				},
				// Add the PaywallScreen as the last page
				{
					backgroundColor: "#fff", // Match PaywallScreen background
					// Render PaywallScreen within the 'subtitle' prop as per ADR
					image: null, // Set image to null as content is in subtitle
					title: "", // No title needed
					// Pass onDone prop to PaywallScreen
					subtitle: <PaywallScreen onDone={onDone} />,
				},
			]}
		/>
	);
};

export default OnboardingComponent;
