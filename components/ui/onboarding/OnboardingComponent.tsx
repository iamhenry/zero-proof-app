/*
FILE: OnboardingComponent.tsx
PURPOSE: Displays onboarding screens for new users with 3 tutorial steps
COMPONENT:
  - OnboardingComponent({onDone}) → JSX: Renders onboarding flow with completion callback
DEPENDENCIES:
  - react-native-onboarding-swiper
  - react-native Image
*/
import React from "react";
import { Image } from "react-native";
import Onboarding from "react-native-onboarding-swiper";

// Define props interface
interface OnboardingComponentProps {
	onDone: () => void;
}

// Update component to accept props
const OnboardingComponent: React.FC<OnboardingComponentProps> = ({
	onDone,
}) => {
	return (
		<Onboarding
			onDone={onDone} // Pass the onDone prop here
			showSkip={false} // As per roadmap requirement
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
			]}
		/>
	);
};

export default OnboardingComponent;
