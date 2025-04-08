/**
 * FILE: components/ui/calendar/CalendarGrid.tsx
 * PURPOSE: Renders a scrollable calendar grid for tracking sobriety, supporting infinite scroll.
 * FUNCTIONS:
 *   - CalendarGrid(): JSX.Element -> Renders the main calendar grid with weekday header and scrollable weeks.
 *   - handleEndReached(): void -> Loads more future weeks when scrolling down.
 *   - handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void -> Loads past weeks when scrolling near the top.
 * DEPENDENCIES: react, react-native, ./WeekdayHeader, ./DayCell, @/context/CalendarDataContext
 */

import React, { useCallback } from "react"; // Remove useRef import
import {
	View,
	FlatList,
	NativeSyntheticEvent,
	NativeScrollEvent,
} from "react-native";
import { WeekdayHeader } from "./WeekdayHeader";
import { DayCell } from "./DayCell";
import { WeekData } from "./types";
import { useCalendarContext } from "@/context/CalendarDataContext"; // Import the context hook

export function CalendarGrid() {
	// Use the hook to get calendar data and functions
	const {
		weeks,
		toggleSoberDay,
		loadPastWeeks,
		loadFutureWeeks,
		isLoadingPast, // Use loading states from hook
		isLoadingFuture, // Use loading states from hook
		calendarRef, // Get calendarRef from context
	} = useCalendarContext(); // Use the context hook

	// Remove local flatlistRef, use the one from context

	// Handle end reached - load more weeks in the future
	const handleEndReached = useCallback(() => {
		// Use loading state from hook
		if (isLoadingFuture) return;
		loadFutureWeeks(); // Call hook function
	}, [isLoadingFuture, loadFutureWeeks]);

	// Custom scroll handler to detect when user reaches the top
	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const y = event.nativeEvent.contentOffset.y;

			// If user scrolls to the top (or close to it), load past weeks
			// Use loading state from hook
			if (y < 20 && !isLoadingPast) {
				loadPastWeeks(); // Call hook function
			}
		},
		[isLoadingPast, loadPastWeeks], // Add dependencies
	);

	// Render a day cell with consistent width
	const renderDayCell = useCallback(
		(day: any, index: number) => {
			// console.log(`[CalendarGrid:renderDayCell] Rendering day ${day.id}`); // Log rendering if needed
			return <DayCell key={day.id} day={day} onToggleSober={toggleSoberDay} />;
		},
		[toggleSoberDay],
	);

	// Optimize rendering of each week
	const renderWeek = useCallback(
		({ item }: { item: WeekData }) => {
			return (
				<View className="flex-row gap-1 mb-1">
					{item.days.map(renderDayCell)}
				</View>
			);
		},
		[renderDayCell],
	);

	// For on-error recovery when scrolling to index
	const handleScrollToIndexFailed = useCallback(
		(info: any) => {
			console.warn(
				"[CalendarGrid:handleScrollToIndexFailed] Scroll failed:",
				info,
			);
			setTimeout(() => {
				// Use weeks from hook and calendarRef from context
				calendarRef.current?.scrollToIndex({
					index: Math.min(info.index, weeks.length - 1),
					animated: false,
				});
			}, 100);
		},
		[weeks.length], // Use weeks from hook
	);

	return (
		<View className="flex-1 w-full flex-col">
			{/* Fixed header - position it above the scrollable content */}
			<View className="bg-background pb-2">
				<WeekdayHeader />
			</View>

			{/* Scrollable calendar grid */}
			<FlatList
				ref={calendarRef as React.RefObject<FlatList<WeekData>>} // Assert type to satisfy TS
				testID="calendar-grid-list"
				renderItem={renderWeek}
				data={weeks} // Use weeks from hook
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				onScroll={handleScroll}
				removeClippedSubviews={true}
				windowSize={10}
				initialNumToRender={8}
				maxToRenderPerBatch={10}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.5}
				onScrollToIndexFailed={handleScrollToIndexFailed}
				maintainVisibleContentPosition={{
					minIndexForVisible: 0,
				}}
				className="flex-1"
				contentContainerStyle={{ gap: 1 }}
			/>
		</View>
	);
}
