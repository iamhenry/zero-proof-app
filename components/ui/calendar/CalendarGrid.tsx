import React, { useMemo, useState, useCallback, useRef } from "react";
import {
	View,
	FlatList,
	NativeSyntheticEvent,
	NativeScrollEvent,
} from "react-native";
import { WeekdayHeader } from "./WeekdayHeader";
import { DayCell } from "./DayCell";
import { generateCalendarData, loadMoreWeeks } from "./utils";
import { WeekData, DayData } from "./types";
import dayjs from "dayjs";

export function CalendarGrid() {
	// Generate dynamic calendar data with Day.js - starting 3 months ago
	const initialCalendarData = useMemo(
		() => generateCalendarData(dayjs().subtract(3, "month"), 5),
		[],
	);
	const [calendarData, setCalendarData] = useState(initialCalendarData);
	const isLoadingMore = useRef(false);
	const flatlistRef = useRef<FlatList>(null);

	// For performance optimization
	const listData = useMemo(() => calendarData.weeks, [calendarData]);

	// Function to toggle sober state and recalculate streaks
	const toggleSoberDay = useCallback((dayId: string) => {
		setCalendarData((prevData) => {
			// Only clone the structure we need to modify
			const newData = {
				weeks: [...prevData.weeks],
			};

			// Find the day to toggle
			let targetDay: DayData | null = null;
			let targetWeekIndex = -1;
			let targetDayIndex = -1;

			// Find the day in the weeks array
			for (let i = 0; i < newData.weeks.length; i++) {
				const dayIndex = newData.weeks[i].days.findIndex(
					(day) => day.id === dayId,
				);
				if (dayIndex !== -1) {
					// Create a copy of this week before modifying
					newData.weeks[i] = {
						...newData.weeks[i],
						days: [...newData.weeks[i].days],
					};

					// Reference to the day (we'll replace it later)
					targetDay = newData.weeks[i].days[dayIndex];
					targetWeekIndex = i;
					targetDayIndex = dayIndex;
					break;
				}
			}

			if (targetDay && targetWeekIndex !== -1 && targetDayIndex !== -1) {
				// Create a new day object with toggled state
				const updatedDay = {
					...targetDay,
					sober: !targetDay.sober,
					intensity: !targetDay.sober ? 1 : 0, // Initial intensity when toggled to sober
				};

				// Replace the day with our updated version
				newData.weeks[targetWeekIndex].days[targetDayIndex] = updatedDay;

				// Only recalculate streaks for days on or after this one
				// to improve performance
				let currentStreak = 0;

				// Process days from beginning to end, but only update those on or after the toggled day
				const dateToggledDay = dayjs(dayId);
				let needToUpdateStreak = false;

				for (let w = 0; w < newData.weeks.length; w++) {
					// Create a copy of the week's days array if we're going to modify it
					let weekDaysCopied = false;

					for (let d = 0; d < newData.weeks[w].days.length; d++) {
						const currentDay = newData.weeks[w].days[d];
						const currentDayDate = dayjs(currentDay.date);

						// Only process days chronologically on or before the toggled day
						if (!needToUpdateStreak && currentDayDate.isAfter(dateToggledDay)) {
							continue;
						}

						// Mark that we've reached the toggled day
						if (currentDay.id === dayId) {
							needToUpdateStreak = true;
						}

						// Skip days we don't need to process (those before the toggled day)
						if (!needToUpdateStreak) {
							if (currentDay.sober) {
								// Just count the streak for prior days without modifying them
								currentStreak++;
							} else {
								currentStreak = 0;
							}
							continue;
						}

						// Create a copy of the week's days array if we haven't already
						if (!weekDaysCopied) {
							newData.weeks[w] = {
								...newData.weeks[w],
								days: [...newData.weeks[w].days],
							};
							weekDaysCopied = true;
						}

						// Now process days that need streak recalculation
						if (currentDay.sober) {
							currentStreak++;
							// Create a new day object with updated intensity
							newData.weeks[w].days[d] = {
								...currentDay,
								intensity: Math.min(currentStreak, 10), // Cap intensity at 10
							};
						} else {
							currentStreak = 0;
							// Create a new day object with intensity 0
							if (currentDay.intensity !== 0) {
								newData.weeks[w].days[d] = {
									...currentDay,
									intensity: 0,
								};
							}
						}
					}
				}
			}

			return newData;
		});
	}, []);

	// Handle end reached - load more weeks in the future
	const handleEndReached = useCallback(() => {
		if (isLoadingMore.current) return;

		isLoadingMore.current = true;
		setCalendarData((prevData) => {
			const newData = loadMoreWeeks(prevData, "future");
			setTimeout(() => {
				isLoadingMore.current = false;
			}, 100);
			return newData;
		});
	}, []);

	// Custom scroll handler to detect when user reaches the top
	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const y = event.nativeEvent.contentOffset.y;

			// If user scrolls to the top (or close to it), load past weeks
			if (y < 20 && !isLoadingMore.current) {
				isLoadingMore.current = true;
				setCalendarData((prevData) => {
					const newData = loadMoreWeeks(prevData, "past");

					// After loading past weeks, we need to adjust scroll position
					// to prevent jumping, but we'll do this after render
					setTimeout(() => {
						flatlistRef.current?.scrollToIndex({
							index: 4, // Scroll to the 4th week to maintain position
							animated: false,
						});
						isLoadingMore.current = false;
					}, 100);

					return newData;
				});
			}
		},
		[],
	);

	// Render a day cell with consistent width
	const renderDayCell = useCallback(
		(day: any, index: number) => (
			<DayCell key={day.id} day={day} onToggleSober={toggleSoberDay} />
		),
		[toggleSoberDay],
	);

	// Optimize rendering of each week
	const renderWeek = useCallback(
		({ item }: { item: WeekData }) => {
			// Ensure we have exactly 7 days in the week
			if (item.days.length !== 7) {
				console.warn(
					`Week ${item.id} has ${item.days.length} days instead of 7`,
				);
			}

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
			setTimeout(() => {
				flatlistRef.current?.scrollToIndex({
					index: Math.min(info.index, calendarData.weeks.length - 1),
					animated: false,
				});
			}, 100);
		},
		[calendarData.weeks.length],
	);

	return (
		<View className="flex-1 w-full flex-col">
			{/* Fixed header - position it above the scrollable content */}
			<View className="bg-background pb-2">
				<WeekdayHeader />
			</View>

			{/* Scrollable calendar grid */}
			<FlatList
				ref={flatlistRef}
				testID="calendar-grid-list"
				renderItem={renderWeek}
				data={listData}
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
