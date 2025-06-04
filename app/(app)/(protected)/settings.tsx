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

	const items = [
		{
			id: "manage-sub",
			title: "Manage Subscription",
			onPress: handleManageSubscription,
		},
		{
			id: "sign-out",
			title: "Sign Out",
			onPress: signOut,
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
						onPress={item.onPress}
					>
						<Text className="text-left text-gray-900 text-base w-full">
							{item.title}
						</Text>
					</Button>
				)}
				className="w-full rounded-lg overflow-hidden"
			/>

			{/* Spacer to push content to center */}
			<View className="flex-1" />
		</View>
	);
}
