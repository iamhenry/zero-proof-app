// FILE: app/(app)/(protected)/settings.tsx
// PURPOSE: Display the authenticated user's profile with options to manage
// their subscription and sign out.
// FUNCTIONS:
//   - Settings(): React component showing profile info, Manage Subscription
//     button for iOS, and sign out button.
// DEPENDENCIES: React Native, custom UI components, and Supabase context.
import { FlatList, Linking, Platform, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Muted } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Feather } from "@expo/vector-icons";

const defaultIconSize = 16;

export default function Settings() {
	const { signOut, user } = useSupabase();

	const email = user?.email ?? "Unknown";
	const avatarText = user?.email?.[0]?.toUpperCase() ?? "?";

	const handleManageSubscription = async () => {
		if (Platform.OS !== "ios") return;
		const url = "App-Prefs:root=SUBSCRIPTIONS";
		try {
			const canOpen = await Linking.canOpenURL(url);
			if (canOpen) {
				await Linking.openURL(url);
			} else {
				await Linking.openSettings();
			}
		} catch (err) {
			console.warn("Unable to open subscription settings", err);
		}
	};

	const handleSendFeedback = async () => {
		const userEmail = user?.email;
		const subject = "Feedback%20for%20App";
		const mailtoUri = userEmail
			? `mailto:${userEmail}?subject=${subject}`
			: `mailto:?subject=${subject}`;

		try {
			const canOpen = await Linking.canOpenURL(mailtoUri);
			if (canOpen) {
				await Linking.openURL(mailtoUri);
			} else {
				// TODO: Maybe show an alert that no email app is available
				console.warn("Cannot open mailto link");
			}
		} catch (err) {
			console.warn("Unable to open email client", err);
		}
	};

	const items = [
		{
			id: "send-feedback",
			title: "Send Feedback",
			onPress: handleSendFeedback,
			icon: "mail",
			iconSize: defaultIconSize,
		},
		{
			id: "manage-sub",
			title: "Manage Subscription",
			onPress: handleManageSubscription,
			icon: "credit-card",
			iconSize: defaultIconSize,
		},
		{
			id: "sign-out",
			title: "Sign Out",
			onPress: signOut,
			icon: "log-out",
			iconSize: defaultIconSize,
		},
	];

	return (
		<View className="flex-1 bg-background p-4">
			{/* Spacer to push content to center */}
			<View className="flex-1" />

			{/* User profile section */}
			<View className="w-full items-center space-y-4 mb-8">
				<Avatar className="h-20 w-20" text={avatarText} />
				<Text className="text-xl">{email}</Text>
				<Badge text="Pro" />
			</View>

			{/* Settings actions list */}
			<FlatList
				data={items}
				keyExtractor={(item) => item.id}
				scrollEnabled={false}
				renderItem={({ item }) => (
					<Button
						className="w-full bg-white px-4 py-4 justify-start items-start rounded-none border-b border-gray-100"
						variant="ghost"
						size={"lg"}
						onPress={item.onPress}
					>
						<View className="flex-row items-center gap-x-4">
							<Feather
								name={item.icon as any}
								size={item.iconSize || defaultIconSize}
								color="#1f2937"
							/>
							<Text className="text-left text-gray-900 text-base w-full">
								{item.title}
							</Text>
						</View>
					</Button>
				)}
				className="w-full rounded-lg overflow-hidden"
			/>

			{/* Spacer to push content to center */}
			<View className="flex-1" />
		</View>
	);
}
