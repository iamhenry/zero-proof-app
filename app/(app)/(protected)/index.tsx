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
	const initialScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to hold timeout ID
	const backupScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to hold backup timeout ID

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
	// This only happens once when the app first loads, not when navigating to past dates
	useEffect(() => {
		// Clean up any previous timeouts to avoid multiple scrolls
		if (initialScrollTimeoutRef.current) {
			clearTimeout(initialScrollTimeoutRef.current);
			initialScrollTimeoutRef.current = null;
		}

		if (backupScrollTimeoutRef.current) {
			clearTimeout(backupScrollTimeoutRef.current);
			backupScrollTimeoutRef.current = null;
		}

		if (!isLoadingInitial && !initialScrollDoneRef.current) {
			// Only scroll if loading is done AND the initial scroll hasn't happened yet
			// This ensures we only scroll to today on app launch, not when navigating through the calendar
			initialScrollDoneRef.current = true; // Mark initial scroll as initiated

			// Use a longer delay to ensure FlatList has fully rendered
			const initialDelay = 300; // Increased from 100ms to 300ms

			console.log(
				"[Home] Scheduling initial scroll to today with delay:",
				initialDelay,
			);

			initialScrollTimeoutRef.current = setTimeout(() => {
				console.log("[Home] Executing initial scroll to today");
				scrollToToday();

				// Add a backup scroll after another delay in case the first one failed
				backupScrollTimeoutRef.current = setTimeout(() => {
					console.log("[Home] Executing backup scroll to today");
					scrollToToday();
					backupScrollTimeoutRef.current = null;
				}, 500); // Additional 500ms backup scroll

				initialScrollTimeoutRef.current = null;
			}, initialDelay);
		}

		// Cleanup function to clear timeouts
		return () => {
			if (initialScrollTimeoutRef.current) {
				clearTimeout(initialScrollTimeoutRef.current);
				initialScrollTimeoutRef.current = null;
			}

			if (backupScrollTimeoutRef.current) {
				clearTimeout(backupScrollTimeoutRef.current);
				backupScrollTimeoutRef.current = null;
			}
		};
	}, [isLoadingInitial, scrollToToday]);

	// Effect to handle component unmount and cleanup
	useEffect(() => {
		return () => {
			// Reset the ref on unmount so if the component remounts, it will scroll again
			initialScrollDoneRef.current = false;
		};
	}, []);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 p-3">
				<StreakCounter count={elapsedDays} />
				<SobrietyTimer />
				<SavingsCounter />
				<CalendarGrid />
			</View>
		</SafeAreaView>
	);
}
