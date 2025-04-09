/**
 * FILE: context/CalendarDataContext.tsx
 * PURPOSE: Provides shared calendar state (weeks, streaks, loading) and interaction logic via React Context.
 * FUNCTIONS:
 *   - CalendarDataProvider({ children: ReactNode }): JSX.Element -> Context provider managing calendar state.
 *   - useCalendarContext(): CalendarContextProps -> Hook to consume the calendar context.
 *   - scrollToToday(): void -> Function to scroll the calendar grid to the current day.
 *   - toggleSoberDay(date: string): Promise<void> -> Toggles sobriety status for a day with conditional timer effects.
 *   - recalculateStreaksAndIntensity(): { updatedWeeks, currentStreak, longestStreak, streakStartDayData } -> Recalculates streak data with data integrity checks.
 * KEY FEATURES:
 *   - Dynamic calendar data generation and loading
 *   - Persistent storage of sobriety status
 *   - Optimized streak calculation with proper streak intensity visualization
 *   - Intelligent timer state management based on calendar interactions
 *   - Infinite scrolling with dynamic past/future week loading
 *   - Reference to the calendar FlatList for programmatic scrolling
 *   - Comprehensive debug logging
 *   - Error handling with graceful fallbacks
 * DEPENDENCIES: react, dayjs, @/components/ui/calendar/types, @/lib/types/repositories, @/context/RepositoryContext, @/context/TimerStateContext, @/components/ui/calendar/utils
 */
import React, {
	createContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
	useContext,
	ReactNode,
	useRef,
	RefObject, // Add RefObject
} from "react";
import { FlatList } from "react-native"; // Add FlatList import
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import minMax from "dayjs/plugin/minMax"; // Import minMax plugin
import {
	WeekData,
	DayData,
	CalendarData,
} from "@/components/ui/calendar/types";
import {
	ISobrietyDataRepository,
	StoredDayData,
	DayDataMap,
	StreakData,
	TimerState,
} from "@/lib/types/repositories";
import { useRepository } from "@/context/RepositoryContext";
import { useTimerState } from "@/context/TimerStateContext";
import { loadMoreWeeks } from "@/components/ui/calendar/utils"; // Assuming utils are still relevant

dayjs.extend(isSameOrBefore);

dayjs.extend(minMax); // Extend dayjs with minMax plugin
// --- Define Context Shape ---
export interface CalendarContextProps {
	weeks: WeekData[];
	toggleSoberDay: (dayId: string) => Promise<void>;
	loadPastWeeks: () => void;
	loadFutureWeeks: () => void;
	currentStreak: number;
	longestStreak: number;
	isLoadingInitial: boolean;
	isLoadingPast: boolean;
	isLoadingFuture: boolean;
	scrollToToday: () => void;
	calendarRef: RefObject<FlatList<WeekData> | null>; // Use specific FlatList type
}

// --- Create Context ---
// Provide a default implementation or throw an error for the default context value
const CalendarContext = createContext<CalendarContextProps | undefined>(
	undefined,
);

// --- Provider Component ---
interface CalendarProviderProps {
	children: ReactNode;
}

export const CalendarDataProvider: React.FC<CalendarProviderProps> = ({
	children,
}) => {
	const repository = useRepository();
	const { startTimer, stopTimer, isRunning: timerIsRunning } = useTimerState(); // Get isRunning state here
	const [weeks, setWeeks] = useState<WeekData[]>([]);
	const [currentStreak, setCurrentStreak] = useState(0);
	const [longestStreak, setLongestStreak] = useState(0);
	const [isLoadingInitial, setIsLoadingInitial] = useState(true);
	const [isLoadingPast, setIsLoadingPast] = useState(false);
	const [isLoadingFuture, setIsLoadingFuture] = useState(false);
	const isInitialMount = useRef(true);
	const calendarRef = useRef<FlatList<WeekData> | null>(null); // Use specific FlatList type

	// --- Logic moved from useCalendarData ---

	// Deterministic Initial State Generation (copied from useCalendarData)
	const generateDeterministicInitialWeeks = useCallback((): WeekData[] => {
		const today = dayjs();
		const startDate = today.subtract(4, "week").startOf("week");
		const endDate = today.add(4, "week").endOf("week");
		const days: DayData[] = [];
		let currentDate = startDate;
		while (currentDate.isSameOrBefore(endDate, "day")) {
			const dateStr = currentDate.format("YYYY-MM-DD");
			const dayOfMonth = currentDate.date();
			days.push({
				id: dateStr,
				date: dateStr,
				sober: false,
				intensity: 0,
				day: dayOfMonth,
				month: currentDate.month(),
				year: currentDate.year(),
				isFirstOfMonth: dayOfMonth === 1,
				streakStartTimestampUTC: null,
			});
			currentDate = currentDate.add(1, "day");
		}
		const weeksArr: WeekData[] = [];
		for (let i = 0; i < days.length; i += 7) {
			const weekDays = days.slice(i, i + 7);
			if (weekDays.length > 0) {
				weeksArr.push({ id: `week-${weekDays[0].date}`, days: weekDays });
			}
		}
		return weeksArr;
	}, []); // Empty dependency array as it relies only on dayjs

	// Recalculate Streaks and Intensity (copied and adapted from useCalendarData)
	const recalculateStreaksAndIntensity = useCallback(
		(
			currentWeeks: WeekData[],
		): {
			updatedWeeks: WeekData[];
			currentStreak: number;
			longestStreak: number;
			streakStartDayData: DayData | null;
		} => {
			try {
				console.log(
					`[DEBUG:recalculate] Entering recalculateStreaksAndIntensity`,
				);
				if (!currentWeeks || currentWeeks.length === 0) {
					return {
						updatedWeeks: [],
						currentStreak: 0,
						longestStreak: 0,
						streakStartDayData: null,
					};
				}

				const allDays: DayData[] = currentWeeks
					.flatMap((week) => week.days)
					.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

				let currentLongestStreak = 0; // Use local variable within recalculate
				let streakInProgress = 0;

				const processedDays = allDays.map((day) => {
					let newIntensity: number;
					if (day.sober) {
						streakInProgress++;
						newIntensity = Math.min(streakInProgress, 10);
					} else {
						currentLongestStreak = Math.max(
							currentLongestStreak,
							streakInProgress,
						);
						streakInProgress = 0;
						newIntensity = 0;
					}
					// Ensure immutability
					return { ...day, intensity: newIntensity };
				});

				currentLongestStreak = Math.max(currentLongestStreak, streakInProgress);

				let finalCurrentStreak = 0;
				let finalStreakStartDayData: DayData | null = null;
				const todayStr = dayjs().format("YYYY-MM-DD");
				const todayIndex = processedDays.findIndex(
					(day) => day.id === todayStr,
				);

				if (todayIndex !== -1 && processedDays[todayIndex].sober) {
					let streakEndingToday = 0;
					let firstDayOfStreakData: DayData | null = null;
					for (let i = todayIndex; i >= 0; i--) {
						if (processedDays[i].sober) {
							streakEndingToday++;
							firstDayOfStreakData = { ...processedDays[i] }; // Keep track of the first day
						} else {
							break;
						}
					}
					finalCurrentStreak = streakEndingToday;
					finalStreakStartDayData = firstDayOfStreakData
						? { ...firstDayOfStreakData }
						: null;
				} else {
					finalCurrentStreak = 0;
					finalStreakStartDayData = null;
				}

				const updatedWeeksResult: WeekData[] = [];
				if (processedDays.length > 0) {
					for (let i = 0; i < processedDays.length; i += 7) {
						const weekDays = processedDays.slice(i, i + 7);
						if (weekDays.length > 0) {
							updatedWeeksResult.push({
								id: `week-${weekDays[0].date}`,
								days: weekDays,
							});
						}
					}
				}

				console.log(
					`[DEBUG:recalculate] Calculated: finalCurrentStreak=${finalCurrentStreak}, currentLongestStreak=${currentLongestStreak}, startDayId=${finalStreakStartDayData?.id}`,
				);
				return {
					updatedWeeks: updatedWeeksResult,
					currentStreak: finalCurrentStreak,
					longestStreak: currentLongestStreak, // Return the calculated longest streak
					streakStartDayData: finalStreakStartDayData,
				};
			} catch (error) {
				console.error("Error during streak/intensity recalculation:", error);
				// Return original weeks on error to avoid breaking UI completely
				return {
					updatedWeeks: currentWeeks,
					currentStreak: 0,
					longestStreak: 0,
					streakStartDayData: null,
				};
			}
		},
		[],
	); // Empty dependency array, relies only on input `currentWeeks`

	// Initial data loading effect (copied and adapted from useCalendarData)
	useEffect(() => {
		const loadInitialData = async () => {
			setIsLoadingInitial(true);
			try {
				const [loadedDayStatus, loadedStreakData] = await Promise.all([
					repository.loadAllDayStatus(),
					repository.loadStreakData(),
				]);

				console.log(
					`[CalendarContext:loadInitialData] Loaded day status with ${
						Object.keys(loadedDayStatus).length
					} days. Keys: ${Object.keys(loadedDayStatus).slice(0, 5).join(", ")}${
						Object.keys(loadedDayStatus).length > 5 ? "..." : ""
					}`,
				);

				console.log(
					`[CalendarContext:loadInitialData] Loaded streak data: ${
						loadedStreakData
							? `current=${loadedStreakData.currentStreak}, longest=${loadedStreakData.longestStreak}`
							: "null"
					}`,
				);

				// --- Determine Date Range from Loaded Data ---
				const loadedDates = Object.keys(loadedDayStatus)
					.map((dateStr) => dayjs(dateStr))
					.sort((a, b) => a.diff(b));
				const today = dayjs();
				const earliestDate =
					loadedDates.length > 0 ? loadedDates[0] : today.subtract(4, "week");
				// Ensure latestDate includes today plus the future buffer, even if no future data exists yet
				const latestBufferDate = today.add(4, "week");
				const latestLoadedDate =
					loadedDates.length > 0 ? loadedDates[loadedDates.length - 1] : today;
				// Use dayjs.max which is now available via plugin
				const latestDate =
					dayjs.max(latestLoadedDate, latestBufferDate) ?? latestBufferDate;

				const startDate = earliestDate.startOf("week");
				const endDate = latestDate.endOf("week");
				console.log(
					`[DEBUG:loadInitialData] Determined date range: ${startDate.format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}`,
				);

				// --- Generate Weeks Based on Determined Range & Merge Loaded Data ---
				const daysInRange: DayData[] = [];
				let currentDate = startDate;
				while (currentDate.isSameOrBefore(endDate, "day")) {
					const dateStr = currentDate.format("YYYY-MM-DD");
					const dayOfMonth = currentDate.date();
					const loadedDay = loadedDayStatus[dateStr];
					let initialSober = false;
					let initialTimestamp = null;

					// Apply loaded status if available
					if (loadedDay) {
						if (typeof loadedDay === "boolean") {
							initialSober = loadedDay;
						} else {
							initialSober = loadedDay.sober;
							initialTimestamp = loadedDay.streakStartTimestampUTC;
						}
					}

					daysInRange.push({
						id: dateStr,
						date: dateStr,
						sober: initialSober, // Use loaded status directly
						intensity: 0, // Intensity calculated later
						day: dayOfMonth,
						month: currentDate.month(),
						year: currentDate.year(),
						isFirstOfMonth: dayOfMonth === 1,
						streakStartTimestampUTC: initialTimestamp, // Use loaded timestamp
					});
					currentDate = currentDate.add(1, "day");
				}

				const weeksWithLoadedStatus: WeekData[] = [];
				for (let i = 0; i < daysInRange.length; i += 7) {
					const weekDays = daysInRange.slice(i, i + 7);
					if (weekDays.length > 0) {
						weeksWithLoadedStatus.push({
							id: `week-${weekDays[0].date}`,
							days: weekDays,
						});
					}
				}
				// --- End Generate Weeks ---

				// <<< Log before recalculation (Keep this log for verification) >>>
				const march1stBefore = weeksWithLoadedStatus
					.flatMap((w) => w.days)
					.find((d) => d.id === "2025-03-01");
				console.log(
					`[DEBUG:loadInitialData] BEFORE recalculate: March 1st status = ${
						march1stBefore
							? JSON.stringify({
									sober: march1stBefore.sober,
									intensity: march1stBefore.intensity, // Intensity will be 0 here, calculated later
									timestamp: march1stBefore.streakStartTimestampUTC,
								})
							: "Not Found"
					}`,
				);
				// <<< End Log >>>

				const {
					updatedWeeks,
					currentStreak: calculatedCurrent,
					longestStreak: calculatedLongest,
					streakStartDayData,
				} = recalculateStreaksAndIntensity(weeksWithLoadedStatus);

				setWeeks(updatedWeeks);

				// Prioritize loaded streak data
				const finalCurrentStreak =
					loadedStreakData?.currentStreak ?? calculatedCurrent;
				const finalLongestStreak =
					loadedStreakData?.longestStreak ?? calculatedLongest;

				setCurrentStreak(finalCurrentStreak);
				setLongestStreak(finalLongestStreak); // Set longest streak from loaded or calculated

				// Timer initialization
				if (finalCurrentStreak > 0 && streakStartDayData) {
					const effectiveStartTimeUTC =
						streakStartDayData.streakStartTimestampUTC ??
						dayjs(streakStartDayData.date).startOf("day").valueOf();
					if (
						typeof effectiveStartTimeUTC === "number" &&
						!isNaN(effectiveStartTimeUTC)
					) {
						startTimer(effectiveStartTimeUTC);
					} else {
						console.error(
							"Invalid timer start timestamp during initialization",
						);
						stopTimer();
					}
				} else {
					stopTimer();
				}
			} catch (error) {
				console.error("Failed to load initial calendar data:", error);
				const deterministicWeeks = generateDeterministicInitialWeeks();
				const calculated = recalculateStreaksAndIntensity(deterministicWeeks);
				setWeeks(calculated.updatedWeeks);
				setCurrentStreak(calculated.currentStreak);
				setLongestStreak(calculated.longestStreak); // Ensure longest streak is set even on error
				stopTimer();
			} finally {
				setIsLoadingInitial(false);
			}
		};
		loadInitialData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		repository,
		startTimer,
		stopTimer,
		generateDeterministicInitialWeeks,
		recalculateStreaksAndIntensity,
	]); // Add generate/recalculate to deps

	// Effect to save streak data (copied and adapted from useCalendarData)
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}
		if (repository && !isLoadingInitial) {
			// Avoid saving during initial load
			const saveData = async () => {
				try {
					// console.log(`[CalendarContext] Saving streak data: Current=${currentStreak}, Longest=${longestStreak}`); // Debug log
					await repository.saveStreakData({ currentStreak, longestStreak });
				} catch (error) {
					console.error(
						"Failed to save streak data via context useEffect:",
						error,
					);
				}
			};
			saveData();
		}
	}, [currentStreak, longestStreak, repository, isLoadingInitial]); // Added isLoadingInitial to deps

	// toggleSoberDay (copied and adapted from useCalendarData)
	const toggleSoberDay = useCallback(
		async (dayId: string) => {
			// Removed incorrect hook call from here
			console.log(
				`[CalendarContext:toggleSoberDay] Initiated for dayId: ${dayId}`,
			);
			const actionTimestamp = dayjs().valueOf();
			const today = dayjs();

			// Use functional update for setWeeks to ensure we operate on the latest state
			setWeeks((prevWeeks) => {
				// Find the day being toggled within the *previous* state
				let dayToToggle: DayData | undefined;
				let weekIndex = -1;
				let dayIndexInWeek = -1;

				for (let i = 0; i < prevWeeks.length; i++) {
					const foundIndex = prevWeeks[i].days.findIndex((d) => d.id === dayId);
					if (foundIndex !== -1) {
						weekIndex = i;
						dayIndexInWeek = foundIndex;
						dayToToggle = prevWeeks[i].days[foundIndex];
						break;
					}
				}

				// --- Validation (using dayToToggle found in prevWeeks) ---
				if (!dayToToggle || dayjs(dayId).isAfter(today, "day")) {
					console.warn(
						`Cannot toggle day ${dayId}: Not found in previous state or is in the future.`,
					);
					return prevWeeks; // Return previous state unchanged
				}

				const newSoberValue = !dayToToggle.sober;
				let newStreakStartTimestampUTC: number | null = null;
				console.log(
					`[CalendarContext:toggleSoberDay] Calculated initial values: newSoberValue=${newSoberValue}, newStreakStartTimestampUTC will be determined next.`,
				);

				// --- Determine Timestamp Logic (using prevWeeks) ---
				const allDaysFlat = prevWeeks
					.flatMap((w) => w.days)
					.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
				const flatDayIndex = allDaysFlat.findIndex((d) => d.id === dayId);

				if (newSoberValue) {
					const prevDayIsSober =
						flatDayIndex > 0 ? allDaysFlat[flatDayIndex - 1].sober : false;
					const isTogglingToday = dayId === today.format("YYYY-MM-DD");
					if (!prevDayIsSober) {
						newStreakStartTimestampUTC = isTogglingToday
							? actionTimestamp
							: null;
					} else {
						newStreakStartTimestampUTC = null;
					}
				} else {
					newStreakStartTimestampUTC = null;
				}
				console.log(
					`[CalendarContext:toggleSoberDay] Determined newStreakStartTimestampUTC: ${newStreakStartTimestampUTC}`,
				);
				// --- End Timestamp Logic ---

				// --- Save Day Status (Async operation - performed outside functional update for clarity) ---
				repository
					.saveDayStatus(dayId, newSoberValue, newStreakStartTimestampUTC)
					.then(() => {
						console.log(
							`[CalendarContext:toggleSoberDay] Saved to repo: dayId=${dayId}, sober=${newSoberValue}, timestamp=${newStreakStartTimestampUTC}`,
						);

						// Verify data was saved correctly by reading it back
						repository.loadDayStatus(dayId).then((savedData) => {
							console.log(
								`[CalendarContext:toggleSoberDay] Verification - Retrieved from repo: dayId=${dayId}, data=${
									savedData ? JSON.stringify(savedData) : "null"
								}`,
							);
						});
					})
					.catch((error) => {
						console.error("Failed to save day status:", error);
					});
				// --- End Save Day Status ---

				// --- Construct Next State (based on prevWeeks) ---
				const nextWeeks = prevWeeks.map((week, wIndex) => {
					if (wIndex === weekIndex) {
						return {
							...week,
							days: week.days.map((day, dIndex) => {
								if (dIndex === dayIndexInWeek) {
									return {
										...day,
										sober: newSoberValue,
										streakStartTimestampUTC: newStreakStartTimestampUTC,
									};
								}
								return day;
							}),
						};
					}
					return week;
				});
				// --- End Construct Next State ---

				// --- Recalculate Streaks (based on nextWeeks) ---
				console.log(
					`[CalendarContext:toggleSoberDay] Recalculating streaks after toggle...`,
				);
				const calculationResult = recalculateStreaksAndIntensity(nextWeeks);
				const {
					updatedWeeks: finalUpdatedWeeks,
					currentStreak: newCurrent,
					longestStreak: calculatedLongest,
					streakStartDayData,
				} = calculationResult;
				console.log("[CalendarContext:toggleSoberDay] Recalculation Result:", {
					currentStreak: newCurrent,
					longestStreak: calculatedLongest,
					startDayId: streakStartDayData?.id,
				}); // Log less verbose result
				// --- End Recalculate Streaks ---

				// --- Update Other State (Current/Longest Streak, Timer) ---
				setCurrentStreak(newCurrent);
				setLongestStreak((prevLongest) => {
					const finalLongest = Math.max(prevLongest, calculatedLongest);
					console.log(
						`[CalendarContext:toggleSoberDay] Setting state: currentStreak=${newCurrent}, longestStreak=${finalLongest}`,
					);
					return finalLongest;
				});

				// Timer Logic - Conditional Start/Stop
				console.log(
					`[DEBUG:toggleSoberDay] Evaluating timer logic: newCurrent=${newCurrent}, timerIsRunning=${timerIsRunning}`,
				);
				if (newCurrent > 0 && streakStartDayData) {
					// Start or ensure timer is running for the current streak
					let effectiveStartTimeUTC: number | null = null;
					const firstDayTimestamp = streakStartDayData.streakStartTimestampUTC;
					const firstDayDate = streakStartDayData.date;
					const fallbackTime = dayjs(firstDayDate).startOf("day").valueOf();
					const isStreakStartingToday =
						firstDayDate === today.format("YYYY-MM-DD");

					// Determine the correct start time based on whether the streak starts today or earlier
					if (firstDayTimestamp !== null && isStreakStartingToday) {
						effectiveStartTimeUTC = firstDayTimestamp; // Use exact timestamp if starting today
					} else {
						effectiveStartTimeUTC = fallbackTime; // Use midnight of the first day otherwise
					}

					if (
						typeof effectiveStartTimeUTC === "number" &&
						!isNaN(effectiveStartTimeUTC)
					) {
						console.log(
							`[DEBUG:toggleSoberDay] Calling startTimer with timestamp: ${effectiveStartTimeUTC}`,
						);
						startTimer(effectiveStartTimeUTC);
					} else {
						console.error(
							"Error: Calculated effectiveStartTimeUTC is invalid. Stopping timer.",
							{ streakStartDayData },
						);
						stopTimer(); // Stop timer if start time is invalid
					}
				} else {
					// Stop timer if there is no current streak
					console.log(
						`[DEBUG:toggleSoberDay] No current streak (newCurrent=${newCurrent}). Calling stopTimer.`,
					);
					stopTimer();
				}
				console.log(
					`[CalendarContext:toggleSoberDay] Timer state after update: isRunning=${newCurrent > 0}`,
				);
				console.log(
					`[DEBUG:toggleSoberDay] After recalculate: newCurrent=${newCurrent}, calculatedLongest=${calculatedLongest}, startDayId=${streakStartDayData?.id}`,
				);
				// --- End Update Other State ---

				console.log(
					`[CalendarContext:toggleSoberDay] Completed for dayId: ${dayId}`,
				);
				// Return the final weeks state for this update cycle
				return finalUpdatedWeeks;
			}); // End functional update for setWeeks
		},
		// Dependencies for the useCallback wrapper
		[repository, recalculateStreaksAndIntensity, startTimer, stopTimer], // Removed weeks and longestStreak from deps as they are handled via functional updates
	);

	// loadPastWeeks (copied and adapted from useCalendarData)
	const loadPastWeeks = useCallback(() => {
		if (isLoadingPast) return;
		setIsLoadingPast(true);
		// Use setTimeout to ensure state update happens after current render cycle
		setTimeout(() => {
			try {
				const currentCalendarData: CalendarData = { weeks }; // Use current state
				const moreData = loadMoreWeeks(currentCalendarData, "past", 4);
				// TODO: Integrate loaded data for new weeks from repository if needed
				const {
					updatedWeeks,
					currentStreak: newCurrent,
					longestStreak: newLongest,
				} = recalculateStreaksAndIntensity(moreData.weeks);

				setWeeks(updatedWeeks); // Update weeks state
				setCurrentStreak(newCurrent); // Update current streak state
				setLongestStreak((prevLongest) => Math.max(prevLongest, newLongest)); // Update longest streak state
			} catch (error) {
				console.error("Error loading past weeks:", error);
			} finally {
				setIsLoadingPast(false); // Ensure loading state is reset
			}
		}, 0);
	}, [weeks, isLoadingPast, recalculateStreaksAndIntensity]); // Added dependencies

	// loadFutureWeeks (copied and adapted from useCalendarData)
	const loadFutureWeeks = useCallback(() => {
		if (isLoadingFuture) return;
		setIsLoadingFuture(true);
		setTimeout(() => {
			try {
				const currentCalendarData: CalendarData = { weeks };
				const moreData = loadMoreWeeks(currentCalendarData, "future", 4);
				// TODO: Integrate loaded data for new weeks from repository if needed
				const {
					updatedWeeks,
					currentStreak: newCurrent,
					longestStreak: newLongest,
				} = recalculateStreaksAndIntensity(moreData.weeks);

				setWeeks(updatedWeeks);
				setCurrentStreak(newCurrent);
				setLongestStreak((prevLongest) => Math.max(prevLongest, newLongest));
			} catch (error) {
				console.error("Error loading future weeks:", error);
			} finally {
				setIsLoadingFuture(false);
			}
		}, 0);
	}, [weeks, isLoadingFuture, recalculateStreaksAndIntensity]); // Added dependencies

	// Function to scroll the calendar grid to the week containing today's date
	const scrollToToday = useCallback(() => {
		if (!calendarRef.current || weeks.length === 0) {
			console.log(
				"[CalendarContext] scrollToToday: Ref not ready or no weeks loaded.",
			);
			return;
		}

		const todayStr = dayjs().format("YYYY-MM-DD");
		let targetWeekIndex = -1;

		for (let i = 0; i < weeks.length; i++) {
			const week = weeks[i];
			if (week.days.some((day) => day.id === todayStr)) {
				targetWeekIndex = i;
				break;
			}
		}

		if (targetWeekIndex !== -1) {
			console.log(
				`[CalendarContext] scrollToToday: Scrolling to week index ${targetWeekIndex}`,
			);
			calendarRef.current.scrollToIndex({
				index: targetWeekIndex,
				animated: true,
				viewPosition: 0.5, // Center the item
			});
		} else {
			console.log(
				"[CalendarContext] scrollToToday: Could not find week containing today.",
			);
		}
	}, [weeks]); // Dependency: weeks array

	// --- Provide Context Value ---
	const value = useMemo(
		() => ({
			weeks,
			toggleSoberDay,
			loadPastWeeks,
			loadFutureWeeks,
			currentStreak,
			longestStreak,
			isLoadingInitial,
			isLoadingPast,
			isLoadingFuture,
			scrollToToday,
			calendarRef, // Add the ref to the context value
		}),
		[
			weeks,
			toggleSoberDay,
			loadPastWeeks,
			loadFutureWeeks,
			currentStreak,
			longestStreak,
			isLoadingInitial,
			isLoadingPast,
			isLoadingFuture,
			scrollToToday,
			calendarRef, // Add ref to dependency array
		],
	);

	return (
		<CalendarContext.Provider value={value}>
			{children}
		</CalendarContext.Provider>
	);
};

// --- Consumer Hook ---
export const useCalendarContext = (): CalendarContextProps => {
	const context = useContext(CalendarContext);
	if (context === undefined) {
		throw new Error(
			"useCalendarContext must be used within a CalendarDataProvider",
		);
	}
	return context;
};
