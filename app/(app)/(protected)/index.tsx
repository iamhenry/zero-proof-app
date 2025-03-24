import { View, SafeAreaView } from "react-native";
import { H1 } from "@/components/ui/typography";
import { CalendarGrid } from "@/components/ui/calendar";

export default function Home() {
	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 p-3">
				<H1 className="mb-4">Activity</H1>
				<CalendarGrid />
			</View>
		</SafeAreaView>
	);
}
