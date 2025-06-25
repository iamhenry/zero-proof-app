/*
FILE: app/(app)/welcome.tsx
PURPOSE: Welcome screen component for Zero Proof app with authentication navigation and email verification handling
FUNCTIONS:
  - WelcomeScreen() → JSX.Element: Main welcome screen with sign-up/sign-in navigation and email verification toast
  - useEffect(showEmailVerification) → void: Handles legacy email verification parameter and displays toast notification
DEPENDENCIES: expo-router, react, react-native, custom UI components, toast context
*/

import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/context/toast-provider";

export default function WelcomeScreen() {
	const router = useRouter();
	const { showEmailVerification } = useLocalSearchParams();
	const { showToast } = useToast();

	useEffect(() => {
		// Handle legacy showEmailVerification parameter for backward compatibility
		// This maintains support for existing sign-up flow
		// Note: Deep link email verification is handled by DeepLinkService in root layout
		// which shows success/error toasts and navigates to this screen
		if (showEmailVerification === "true") {
			showToast("Check your email to verify your account", "info", 5000);
			// Clean up the URL parameter
			router.replace("/welcome");
		}
	}, [showEmailVerification, showToast, router]);

	return (
		<SafeAreaView className="flex flex-1 bg-background p-4">
			<ToastContainer />
			<View className="flex flex-1 items-center justify-center gap-y-4 web:m-4">
				<Image
					source={require("@/assets/icon.png")}
					className="w-16 h-16 rounded-xl"
				/>
				<H1 className="text-center">Welcome to Zero Proof</H1>
				<Muted className="text-center">
					Track your sobriety journey with beautiful calendar visualization and
					streak tracking!
				</Muted>
			</View>
			<View className="flex flex-col gap-y-4 web:m-4">
				<Button
					size="default"
					variant="default"
					className="rounded-full"
					onPress={() => {
						router.push("/sign-up");
					}}
				>
					<Text>Sign Up</Text>
				</Button>
				<Button
					size="default"
					variant="secondary"
					className="rounded-full"
					onPress={() => {
						router.push("/sign-in");
					}}
				>
					<Text>Sign In</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
