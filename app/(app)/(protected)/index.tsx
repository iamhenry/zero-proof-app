/**
 * FILE: app/(app)/(protected)/index.tsx
 * PURPOSE: Renders the main home screen for authenticated users, displaying sobriety statistics and the calendar.
 * FUNCTIONS:
 *   - Home(): JSX.Element -> Renders the main screen layout and components.
 * DEPENDENCIES: react-native, @/components/ui/*, @/context/TimerStateContext
 */

import React, { useEffect, useRef } from "react"; // Import useRef
import { View, SafeAreaView } from "react-native";
import { CalendarGrid } from "@/components/ui/calendar";
import { SobrietyTimer } from "@/components/ui/timer";
import { SavingsCounter, StreakCounter } from "@/components/ui/statistics";
import { useTimerState } from "@/context/TimerStateContext"; // Import TimerState context hook
import { useRepository } from "@/context/RepositoryContext";
import { useCalendarContext } from "@/context/CalendarDataContext"; // Import Calendar context hook

export default function Home() {
	const { elapsedDays } = useTimerState(); // Use TimerState context hook
	const repository = useRepository();
	const { isLoadingInitial, scrollToToday } = useCalendarContext(); // Get loading state and scroll function
	const initialScrollDoneRef = useRef(false); // Ref to track initial scroll

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

	// Effect to scroll to today when initial loading is done
	useEffect(() => {
		if (!isLoadingInitial && !initialScrollDoneRef.current) {
			// Only scroll if loading is done AND the initial scroll hasn't happened yet
			initialScrollDoneRef.current = true; // Mark initial scroll as initiated
			// Use setTimeout to ensure FlatList has rendered
			const timerId = setTimeout(() => {
				scrollToToday();
			}, 100); // Small delay (100ms) might be needed

			// Cleanup function for the timeout remains important
			return () => {
				clearTimeout(timerId);
			};
		} else if (isLoadingInitial) {
		} else {
		}
		// No cleanup needed if we didn't schedule a timeout
		return () => {};
	}, [isLoadingInitial, scrollToToday]); // Dependencies remain the same
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
