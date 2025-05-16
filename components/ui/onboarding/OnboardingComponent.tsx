/*
FILE: OnboardingComponent.tsx
PURPOSE: Displays onboarding screens for new users, including a paywall as the final step.
FUNCTIONS:
  - OnboardingComponent({onDone}) → JSX.Element: Renders the onboarding flow.
DEPENDENCIES: react-native-onboarding-swiper, react-native Image, PaywallScreen
*/
import React, { useRef } from "react";
import { Image, View } from "react-native"; // Removed TouchableOpacity, Button, Text imports
import Onboarding from "react-native-onboarding-swiper"; // Removed DoneButtonProps
import PaywallScreen from "./PaywallScreen"; // Import the new PaywallScreen
import OnboardingDrinkQuantityContainer from "./OnboardingDrinkQuantityContainer"; // Import the new OnboardingDrinkQuantityContainer component

// Define props interface
interface OnboardingComponentProps {
	onDone: () => void;
}

// Update component to accept props
const OnboardingComponent: React.FC<OnboardingComponentProps> = ({
	onDone,
}) => {
	// Create ref for onboarding navigation
	const onboardingRef = useRef<any>();

	return (
		<Onboarding
			onDone={onDone} // This prop is now primarily for the library's internal use if needed, dismissal is handled in PaywallScreen
			showSkip={false} // As per roadmap requirement
			showNext={false} // Explicitly hide Next button on all pages
			showDone={false} // Hide default Done button
			bottomBarColor={false} // Make bottom bar transparent to avoid background color issues
			bottomBarHighlight={false} // Disable the default bottom bar highlight effect
			ref={onboardingRef}
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
				// Insert OnboardingDrinkQuantityContainer as the 4th page
				{
					backgroundColor: "#fff",
					image: null,
					title: "",
					subtitle: (
						<OnboardingDrinkQuantityContainer
							onSubmit={() => {
								if (onboardingRef.current) {
									onboardingRef.current.goNext();
								}
							}}
						/>
					),
				},
				// Move PaywallScreen to the 5th (last) page
				{
					backgroundColor: "#fff", // Match PaywallScreen background
					image: null, // Set image to null as content is in subtitle
					title: "", // No title needed
					subtitle: <PaywallScreen onDone={onDone} />,
				},
			]}
		/>
	);
};

export default OnboardingComponent;
