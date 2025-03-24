import { View } from "react-native";
import { H1 } from "@/components/ui/typography";
import { CalendarGrid } from "@/components/ui/calendar";

export default function Home() {
	return (
		<View className="flex-1 bg-background p-4">
			<H1 className="mb-4">Activity</H1>
			<CalendarGrid />
		</View>
	);
}
