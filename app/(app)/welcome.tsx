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
				<H1 className="text-center">Welcome to Expo Supabase Starter</H1>
				<Muted className="text-center">
					A comprehensive starter project for developing React Native and Expo
					applications with Supabase as the backend!
				</Muted>
			</View>
			<View className="flex flex-col gap-y-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={() => {
						router.push("/sign-up");
					}}
				>
					<Text>Sign Up</Text>
				</Button>
				<Button
					size="default"
					variant="secondary"
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
