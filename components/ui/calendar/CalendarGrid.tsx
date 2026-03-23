/**
 * FILE: components/ui/calendar/CalendarGrid.tsx
 * PURPOSE: Renders a scrollable calendar grid showing weeks with corresponding day cells, integrating with CalendarDataContext.
 * FUNCTIONS:
 *   - CalendarGrid(): JSX.Element -> Main component for rendering the calendar grid.
 *   - handleEndReached(): void -> Loads future weeks when end of list is reached, respects programmatic scrolling state.
 *   - handleScroll(event): void -> Handles scroll events, loads past weeks when near top, respects programmatic scrolling.
 *   - renderDayCell(day, index): JSX.Element -> Renders individual day cells with appropriate styling.
 *   - renderWeek({ item }): JSX.Element -> Renders a week row containing 7 day cells.
 *   - handleScrollToIndexFailed(info): void -> Gracefully handles scroll failures with fallback mechanism.
 * KEY FEATURES:
 *   - Integration with CalendarDataContext for data management
 *   - Infinite scrolling with dynamic past/future week loading
 *   - One-time initial scroll to today for better UX
 *   - Fix for memory leak issues in programmatic scrolling
 *   - Optimized FlatList rendering with fixed height calculations
 *   - Smart ref handling for reliable programmatic scrolling
 *   - Prevention of scroll interference during programmatic scrolling
 *   - Enhanced error handling for scroll failures
 *   - Comprehensive debug logging for ref and scroll state
 * DEPENDENCIES: react, react-native, ./WeekdayHeader, ./DayCell, @/context/CalendarDataContext
 */

import React, { useCallback, useEffect } from "react";
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
import { getWeekItemLayout } from "./calendarMetrics";
import dayjs from "dayjs";

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

	// Find the index of today's week for initial rendering
	const initialTodayIndex = React.useMemo(() => {
		if (!weeks || weeks.length === 0) return 0;

		const todayStr = dayjs().format("YYYY-MM-DD");
		let todayIndex = 0;

		for (let i = 0; i < weeks.length; i++) {
			if (weeks[i].days.some((day) => day.id === todayStr)) {
				todayIndex = i;
				console.log(
					`[CalendarGrid] Found today (${todayStr}) at week index: ${i}`,
				);
				break;
			}
		}

		return todayIndex;
	}, [weeks]);

	// Track if we're currently in the middle of programmatic scrolling
	// This prevents loading more weeks during scrollToToday operations
	const [isProgrammaticScrolling, setIsProgrammaticScrolling] =
		React.useState(false);

	// Track if initial position has been applied (one-time, on mount)
	const hasAppliedInitialPositionRef = React.useRef(false);
	const [isInitialPositionReady, setIsInitialPositionReady] =
		React.useState(false);

	// Apply initial position exactly once on mount.
	// The list stays hidden until this settles so the user never sees a startup jump.
	React.useEffect(() => {
		if (hasAppliedInitialPositionRef.current || weeks.length === 0) {
			return;
		}

		if (!calendarRef.current) {
			return;
		}

		let isCancelled = false;
		hasAppliedInitialPositionRef.current = true;
		setIsProgrammaticScrolling(true);

		const initialPositionTimeout = setTimeout(() => {
			if (isCancelled || !calendarRef.current) {
				setIsProgrammaticScrolling(false);
				setIsInitialPositionReady(true);
				return;
			}

			try {
				console.log(
					"[CalendarGrid] Performing one-time initial scroll to today",
				);
				calendarRef.current.scrollToIndex({
					index: initialTodayIndex,
					animated: false,
					viewPosition: 0.5,
				});
			} catch (error) {
				console.error("[CalendarGrid] Initial scroll error:", error);
			} finally {
				setIsProgrammaticScrolling(false);
				setIsInitialPositionReady(true);
			}
		}, 0);

		return () => {
			isCancelled = true;
			clearTimeout(initialPositionTimeout);
		};
	}, [calendarRef, initialTodayIndex, weeks.length]);

	// Log calendarRef to verify it's being properly passed and used
	useEffect(() => {
		console.log(
			`[CalendarGrid] calendarRef availability: ${calendarRef ? "Available" : "Not Available"}`,
		);
		console.log(
			`[CalendarGrid] calendarRef.current: ${calendarRef.current ? "Assigned" : "Not Assigned"}`,
		);
	}, [calendarRef]);

	// Remove local flatlistRef, use the one from context

	// Custom scroll handler to detect when user reaches the top
	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const y = event.nativeEvent.contentOffset.y;

			// Skip loading more weeks if we're in the middle of a programmatic scroll
			if (isProgrammaticScrolling) {
				return;
			}

			// If user scrolls to the top (or close to it), load past weeks
			// Use loading state from hook
			if (y < 20 && !isLoadingPast) {
				loadPastWeeks(); // Call hook function
			}
		},
		[isLoadingPast, loadPastWeeks, isProgrammaticScrolling], // Add dependencies
	);

	// Handle end reached - load more weeks in the future
	const handleEndReached = useCallback(() => {
		// Skip loading more weeks if we're in the middle of a programmatic scroll
		if (isProgrammaticScrolling) {
			return;
		}

		// Use loading state from hook
		if (isLoadingFuture) return;
		loadFutureWeeks(); // Call hook function
	}, [isLoadingFuture, loadFutureWeeks, isProgrammaticScrolling]);

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
				if (calendarRef.current) {
					setIsProgrammaticScrolling(true);
					calendarRef.current.scrollToIndex({
						index: Math.min(info.index, weeks.length - 1),
						animated: false,
						viewPosition: 0.5,
					});

					// Reset the flag after a brief delay
					setTimeout(() => {
						setIsProgrammaticScrolling(false);
						setIsInitialPositionReady(true);
					}, 300);
				} else {
					setIsProgrammaticScrolling(false);
					setIsInitialPositionReady(true);
				}
			}, 100);
		},
		[calendarRef, weeks.length],
	);

	return (
		<View className="flex-1 w-full flex-col">
			{/* Fixed header - position it above the scrollable content */}
			<View className="bg-background pb-2">
				<WeekdayHeader />
			</View>

			{/* Scrollable calendar grid */}
			<FlatList
				ref={(ref) => {
					// This is the correct way to assign a FlatList ref
					if (ref && calendarRef) {
						// Only assign if both ref and calendarRef exist
						// @ts-ignore - Ignore the readonly property error
						calendarRef.current = ref;
						console.log("[CalendarGrid] FlatList ref successfully assigned");
					}
				}}
				onLayout={() => {
					// Add debug to check ref status after layout
					console.log(
						`[CalendarGrid] FlatList onLayout - calendarRef.current: ${calendarRef.current ? "Assigned" : "Not Assigned"}`,
					);
				}}
				testID="calendar-grid-list"
				renderItem={renderWeek}
				data={weeks} // Use weeks from hook
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				onScroll={handleScroll}
				removeClippedSubviews={true}
				windowSize={10}
				initialNumToRender={10}
				maxToRenderPerBatch={10}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.5}
				onScrollToIndexFailed={handleScrollToIndexFailed}
				// Add getItemLayout prop to allow scrolling to unmeasured indexes
				getItemLayout={getWeekItemLayout}
				maintainVisibleContentPosition={{
					minIndexForVisible: 0,
				}}
				className="flex-1"
				style={{ opacity: isInitialPositionReady ? 1 : 0 }}
			/>
		</View>
	);
}
