import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Muted } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
	const { signOut } = useSupabase();

	return (
		<View className="flex-1 items-center justify-center bg-background p-4 gap-y-4">
			{/* User profile section */}
			<View className="w-full items-center space-y-4 mb-8">
				<Avatar className="h-20 w-20" text="Z" />
				<Badge text="Pro" />
				<Text className="text-xl">zeroproof@gmail.com</Text>
			</View>

			{/* Sign out section */}
			<View className="w-full space-y-4">
				<Button
					className="w-full"
					size="default"
					variant="default"
					onPress={signOut}
				>
					<Text>Sign Out</Text>
				</Button>
			</View>
		</View>
	);
}
