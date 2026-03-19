/**
 * FILE: app/(app)/(protected)/index.tsx
 * PURPOSE: Main home screen displaying calendar, timer, and statistics with interactive features.
 * FUNCTIONS:
 *   - HomeScreen() -> React component rendering the main application screen with calendar and statistics.
 * KEY FEATURES:
 *   - Integration with CalendarDataContext for data management
 *   - Timer component with tap-to-scroll calendar navigation
 *   - Dynamic calendar grid with infinite scrolling
 *   - Statistics display for streaks and financial savings
 *   - Optimized navigation between timer and calendar
 *   - Enhanced scroll handling for improved user experience
 *   - Support for viewing distant past dates with reliable navigation
 * DEPENDENCIES: react, react-native, @/components/ui/calendar/CalendarGrid, @/components/ui/timer/SobrietyTimer, @/components/ui/statistics/StreakCounter, @/components/ui/statistics/SavingsCounter
 */

import React, { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarGrid } from "@/components/ui/calendar";
import { SobrietyTimer } from "@/components/ui/timer";
import { SavingsCounter, StreakCounter } from "@/components/ui/statistics";
import { useTimerState } from "@/context/TimerStateContext"; // Import TimerState context hook
import { useRepository } from "@/context/RepositoryContext";
import { useCalendarContext } from "@/context/CalendarDataContext"; // Import Calendar context hook

export default function Home() {
	const { elapsedDays } = useTimerState(); // Use TimerState context hook
	const repository = useRepository();
	const { isLoadingInitial } = useCalendarContext(); // Get loading state

	// Debug function to log all stored day status on component mount
	useEffect(() => {
		const logStoredData = async () => {
			try {
				console.log("[Home:logStoredData] === DEBUGGING STORED DAY STATUS ===");
				const allDayStatus = await repository.loadAllDayStatus();
				const dayCount = Object.keys(allDayStatus).length;
				console.log(`[Home:logStoredData] Found ${dayCount} days in storage`);

				if (dayCount > 0) {
					// Log a few sample days
					const sampleKeys = Object.keys(allDayStatus).slice(0, 5);
					console.log("[Home:logStoredData] Sample days:");
					sampleKeys.forEach((key) => {
						console.log(
							`[Home:logStoredData] ${key}: ${JSON.stringify(allDayStatus[key])}`,
						);
					});
				}

				// Also log streak data
				const streakData = await repository.loadStreakData();
				console.log(
					`[Home:logStoredData] Streak data: ${streakData ? JSON.stringify(streakData) : "null"}`,
				);
				console.log("[Home:logStoredData] === END DEBUGGING ===");
			} catch (error) {
				console.error(
					"[Home:logStoredData] Error retrieving stored data:",
					error,
				);
			}
		};

		// Call the debug function
		logStoredData();
	}, [repository]);

	// Home waits for initial data only.
	// CalendarGrid owns initial positioning via initialScrollIndex.

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 p-3">
				<StreakCounter count={elapsedDays} />
				<SobrietyTimer />
				<SavingsCounter />
				{!isLoadingInitial && <CalendarGrid />}
			</View>
		</SafeAreaView>
	);
}
