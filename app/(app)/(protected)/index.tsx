/**
 * FILE: app/(app)/(protected)/index.tsx
 * CREATED: 2025-03-27 14:30:00
 *
 * PURPOSE:
 * Renders the main home screen for authenticated users, displaying key sobriety statistics and the calendar.
 *
 * COMPONENTS:
 * - Home(): The main functional component for the screen.
 * DEPENDENCIES: react-native, @/components/ui/calendar, @/components/ui/timer, @/components/ui/statistics
 */

import { View, SafeAreaView } from "react-native";
import { CalendarGrid } from "@/components/ui/calendar";
import { SobrietyTimer } from "@/components/ui/timer";
import { SavingsCounter, StreakCounter } from "@/components/ui/statistics";

export default function Home() {
	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 p-3">
				<StreakCounter count={14} />
				<SobrietyTimer />
				<SavingsCounter amount="1,200" />
				<CalendarGrid />
			</View>
		</SafeAreaView>
	);
}
