/**
 * FILE: app/(app)/(protected)/index.tsx
 * PURPOSE: Renders the main home screen for authenticated users, displaying sobriety statistics and the calendar.
 * FUNCTIONS:
 *   - Home(): JSX.Element -> Renders the main screen layout and components.
 * DEPENDENCIES: react-native, @/components/ui/*, @/context/TimerStateContext
 */

import { View, SafeAreaView } from "react-native";
import { CalendarGrid } from "@/components/ui/calendar";
import { SobrietyTimer } from "@/components/ui/timer";
import { SavingsCounter, StreakCounter } from "@/components/ui/statistics";
import { useTimerState } from "@/context/TimerStateContext"; // Import TimerState context hook
// import { useCalendarContext } from "@/context/CalendarDataContext"; // No longer needed here for streak count
export default function Home() {
	// const { currentStreak } = useCalendarContext(); // No longer needed here for streak count
	const { elapsedDays } = useTimerState(); // Use TimerState context hook
	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 p-3">
				<StreakCounter count={elapsedDays} />
				<SobrietyTimer />
				<SavingsCounter amount="1,200" />
				<CalendarGrid />
			</View>
		</SafeAreaView>
	);
}
