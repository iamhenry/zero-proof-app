/**
 * FILE: context/CalendarDataContext.tsx
 * PURPOSE: Provides shared calendar state (weeks, streaks, loading) and interaction logic via React Context.
 * FUNCTIONS:
 *   - CalendarDataProvider({ children: ReactNode }): JSX.Element -> Context provider managing calendar state.
 *   - useCalendarContext(): CalendarContextProps -> Hook to consume the calendar context.
 * DEPENDENCIES: react, dayjs, @/components/ui/calendar/types, @/lib/types/repositories, @/context/*, @/components/ui/calendar/utils
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
} from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
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

// --- Define Context Shape ---
export interface CalendarContextProps {
	// Add export
	weeks: WeekData[];
	toggleSoberDay: (dayId: string) => Promise<void>;
	loadPastWeeks: () => void;
	loadFutureWeeks: () => void;
	currentStreak: number;
	longestStreak: number;
	isLoadingInitial: boolean;
	isLoadingPast: boolean;
	isLoadingFuture: boolean;
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
	const { startTimer, stopTimer } = useTimerState();
	const [weeks, setWeeks] = useState<WeekData[]>([]);
	const [currentStreak, setCurrentStreak] = useState(0);
	const [longestStreak, setLongestStreak] = useState(0);
	const [isLoadingInitial, setIsLoadingInitial] = useState(true);
	const [isLoadingPast, setIsLoadingPast] = useState(false);
	const [isLoadingFuture, setIsLoadingFuture] = useState(false);
	const isInitialMount = useRef(true);

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

				const baseWeeks = generateDeterministicInitialWeeks();

				const weeksWithLoadedStatus = baseWeeks.map((week) => ({
					...week,
					days: week.days.map((day) => {
						const dayData = loadedDayStatus[day.id];
						if (dayData) {
							if (typeof dayData === "boolean") {
								return {
									...day,
									sober: dayData,
									streakStartTimestampUTC: null,
								};
							} else {
								return {
									...day,
									sober: dayData.sober,
									streakStartTimestampUTC: dayData.streakStartTimestampUTC,
								};
							}
						}
						return day;
					}),
				}));

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

				// Timer Logic
				stopTimer();
				if (newCurrent > 0 && streakStartDayData) {
					let effectiveStartTimeUTC: number | null = null;
					const firstDayTimestamp = streakStartDayData.streakStartTimestampUTC;
					const firstDayDate = streakStartDayData.date;
					const fallbackTime = dayjs(firstDayDate).startOf("day").valueOf();
					const isStreakStartingToday =
						firstDayDate === today.format("YYYY-MM-DD");

					if (firstDayTimestamp !== null && isStreakStartingToday) {
						effectiveStartTimeUTC = firstDayTimestamp;
					} else {
						effectiveStartTimeUTC = fallbackTime;
					}

					if (
						typeof effectiveStartTimeUTC === "number" &&
						!isNaN(effectiveStartTimeUTC)
					) {
						startTimer(effectiveStartTimeUTC);
					} else {
						console.error(
							"Error: Calculated effectiveStartTimeUTC is invalid.",
							{ streakStartDayData },
						);
					}
				}
				console.log(
					`[CalendarContext:toggleSoberDay] Timer state after update: isRunning=${newCurrent > 0}`,
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
