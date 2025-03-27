import { View, SafeAreaView } from "react-native";
import { H1 } from "@/components/ui/typography";
import { CalendarGrid } from "@/components/ui/calendar";
import { SobrietyTimer } from "@/components/ui/timer";
import { StreakCounter } from "@/components/ui/statistics";

export default function Home() {
	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 p-3">
				{/* <H1 className="mb-4">Activity</H1> */}
				<StreakCounter count={14} />
				<SobrietyTimer />
				<CalendarGrid />
			</View>
		</SafeAreaView>
	);
}
