import React from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { H1, P } from "@/components/ui/typography"; // Removed Small as it's not used
import { Button } from "@/components/ui/button";

// Define props interface including the onDone callback
interface PaywallScreenProps {
	onDone: () => void;
}

// Helper component for feature list items - defined outside PaywallScreen
const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
	<View className="flex-row items-center mb-3 w-full gap-3 self-stretch">
		{/* Using emoji/text icon based on snippet */}
		<View className="w-10 h-9 px-2.5 py-1 bg-emerald-100 rounded-lg border border-emerald-200 items-center justify-center">
			<Text className="text-green-600 text-lg">{icon}</Text>
		</View>
		<Text className="text-black text-base font-extrabold flex-1">{text}</Text>
	</View>
);

// Update component to accept props
const PaywallScreen: React.FC<PaywallScreenProps> = ({ onDone }) => {
	// Renders the static paywall UI based on the visual reference and HTML snippet
	// Uses the passed onDone prop for the "Start trial" button
	return (
		// Use flex-1 and justify-between to distribute space within viewport
		<View className="flex-1 justify-between p-6 bg-background">
			{/* Container for all content EXCEPT the final button */}
			<View className="items-center">
				{/* Top Section: Icon and Title/Subtitle */}
				<View className="items-center">
					{/* Using the standard app icon */}
					<Image
						source={require("@/assets/onboarding/onboarding-app-icon.png")}
						className="w-20 h-20 mb-4" // Adjusted size from snippet reference
						resizeMode="contain"
					/>
					{/* Title from snippet */}
					<H1 className="mb-1 text-center text-xl font-extrabold">
						Try Zero Proof for $0.99/week!
					</H1>
					{/* Subtitle from snippet */}
					<P className="text-muted-foreground text-center text-sm mb-6">
						3-day free trial
					</P>
				</View>

				{/* Middle Section: Features List from snippet */}
				<View className="w-full self-stretch">
					<FeatureItem icon="📊" text="Visualize your sobriety" />
					<FeatureItem icon="💰" text="Track your savings" />
					<FeatureItem icon="🔥" text="Stay motivated with Streaks" />
				</View>

				{/* Bottom Section: Pricing Options from snippet */}
				<View className="w-full items-center self-stretch mt-6">
					{/* Weekly (Free Trial) Button */}
					<TouchableOpacity
						onPress={() => console.log("Weekly Pressed")} // Placeholder
						className="w-full p-4 bg-emerald-100 rounded-2xl border border-green-600 flex-row justify-between items-center mb-3"
					>
						<Text className="text-green-600 text-base font-extrabold">
							Weekly
						</Text>
						<Text className="text-green-600 text-base font-extrabold">
							$0.99
						</Text>
					</TouchableOpacity>

					{/* Monthly Button */}
					<TouchableOpacity
						onPress={() => console.log("Monthly Pressed")} // Placeholder
						className="w-full p-4 rounded-2xl border border-neutral-200 flex-row justify-between items-center mb-3"
					>
						<View className="flex-row items-end gap-2">
							<Text className="text-black text-base font-extrabold">
								Monthly
							</Text>
							<Text className="text-neutral-500 text-xs font-extrabold leading-snug">
								save 15%
							</Text>
						</View>
						<Text className="text-black text-base font-extrabold">$2.99</Text>
					</TouchableOpacity>

					{/* Yearly Button */}
					<TouchableOpacity
						onPress={() => console.log("Yearly Pressed")} // Placeholder
						className="w-full p-4 rounded-2xl border border-neutral-200 flex-row justify-between items-center"
					>
						<View className="flex-row items-center gap-2">
							<Text className="text-black text-base font-extrabold">
								Yearly
							</Text>
							<Text className="text-neutral-500 text-xs font-extrabold leading-tight">
								save 25%
							</Text>
						</View>
						<Text className="text-black text-base font-extrabold">$34.99</Text>
					</TouchableOpacity>
				</View>
				{/* Closing tag for the content container View */}
				<Button
					onPress={onDone} // Attach the dismissal callback here
					variant="default" // Assuming default is the black button style
					className="w-full" // Removed margin, rely on justify-between
				>
					<Text className="text-primary-foreground">Start trial</Text>
				</Button>
			</View>
		</View>
	);
};

export default PaywallScreen;
