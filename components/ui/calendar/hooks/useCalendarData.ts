/**
 * FILE: components/ui/calendar/hooks/useCalendarData.ts
 * PURPOSE: Legacy hook now acting as a compatibility layer to redirect to CalendarDataContext.
 * FUNCTIONS:
 *   - useCalendarData(): CalendarData -> Returns data from CalendarDataContext, maintaining backward compatibility.
 * KEY FEATURES:
 *   - Transitional wrapper for migrated functionality
 *   - All core functionality has been moved to CalendarDataContext
 *   - Provides compatibility for components not yet updated to use context directly
 *   - Will be deprecated in future updates
 * DEPENDENCIES: react, @/context/CalendarDataContext, ../types
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRef } from 'react'; // Import useRef
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'; // Import plugin
import { WeekData, DayData, CalendarData } from '../types'; // Assuming TimerState might be defined elsewhere or not needed directly here
import { ISobrietyDataRepository, StoredDayData, DayDataMap, StreakData, TimerState } from '../../../../lib/types/repositories'; // Import repository interface and updated types
// Assuming createMockCalendarData is correctly typed and available for initial state
import { useRepository } from '@/context/RepositoryContext'; // Import context hook
import { useTimerState } from '@/context/TimerStateContext'; // Import timer state hook

import { loadMoreWeeks } from '../utils'; // Re-enable import for loading

dayjs.extend(isSameOrBefore); // Extend dayjs with the plugin

// --- Deterministic Initial State Generation ---
const generateDeterministicInitialWeeks = (): WeekData[] => {
  const today = dayjs();
  const startDate = today.subtract(4, 'week').startOf('week');
  const endDate = today.add(4, 'week').endOf('week');

  const days: DayData[] = [];
  let currentDate = startDate;

  while (currentDate.isSameOrBefore(endDate, 'day')) {
    const dateStr = currentDate.format('YYYY-MM-DD');
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
      streakStartTimestampUTC: null, // Add default null value
    });
    currentDate = currentDate.add(1, 'day');
  }

  const weeks: WeekData[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const weekDays = days.slice(i, i + 7);
    if (weekDays.length > 0) {
      const weekId = `week-${weekDays[0].date}`;
      weeks.push({
        id: weekId,
        days: weekDays,
      });
    }
  }
  return weeks;
};

// Helper function to recalculate streaks and intensities across all weeks
// Also returns the start date of the current streak if applicable
const recalculateStreaksAndIntensity = (weeks: WeekData[]): {
    updatedWeeks: WeekData[],
    currentStreak: number,
    longestStreak: number,
    streakStartDayData: DayData | null // Return the DayData object instead of just the date string
} => {
    console.log(`[useCalendarData:recalculateStreaks] Recalculating for ${weeks.length} weeks.`);
  try {
    if (!weeks || weeks.length === 0) {
      return { updatedWeeks: [], currentStreak: 0, longestStreak: 0, streakStartDayData: null };
    }

    const allDays: DayData[] = weeks.flatMap(week => week.days).sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

    let longestStreak = 0;
    let streakInProgress = 0;
    let currentStreakStartDay: DayData | null = null;

    // Map through all days to calculate intensity and track running longest streak
    const processedDays = allDays.map((day) => {
      let newIntensity: number;
      if (day.sober) {
        if (streakInProgress === 0) {
          // Start of a new streak, mark this as a potential current streak start
          currentStreakStartDay = day;
        }
        streakInProgress++;
        newIntensity = Math.min(streakInProgress, 10);
      } else {
        longestStreak = Math.max(longestStreak, streakInProgress); // Update longest before reset
        streakInProgress = 0;
        currentStreakStartDay = null; // Reset current streak start day
        newIntensity = 0;
      }
      return { ...day, intensity: newIntensity };
    });

    // Final check for the longest streak after the loop
    longestStreak = Math.max(longestStreak, streakInProgress);

    // --- Determine Final Current Streak and its Start Date (AFTER the loop) ---
    let finalCurrentStreak = 0;
    let finalStreakStartDayData: DayData | null = null; // Store the DayData object
    const todayStr = dayjs().format('YYYY-MM-DD');
    const todayIndex = processedDays.findIndex(day => day.id === todayStr); // Use id for consistency

    // --- Determine Final Current Streak (Option A logic) ---
    if (todayIndex !== -1 && processedDays[todayIndex].sober) {
        // Today exists and is sober, calculate streak ending today
        let streakEndingToday = 0; // Renamed for clarity
        let firstDayOfStreakData: DayData | null = null; // Store the DayData object of the *first* day

        for (let i = todayIndex; i >= 0; i--) {
            // console.log(`[recalculateStreaks] Checking index ${i}: Day ${processedDays[i].id}, Sober: ${processedDays[i].sober}, Timestamp: ${processedDays[i].streakStartTimestampUTC}`); // Keep log commented for now
            if (processedDays[i].sober) {
                streakEndingToday++;
                // Keep track of the actual first day encountered in this backward pass
                // This ensures we get the data (including timestamp) of the actual start day
                firstDayOfStreakData = { ...processedDays[i] }; // Update with the earliest day found so far
            } else {
                break; // Stop when a non-sober day is found
            }
        }
        finalCurrentStreak = streakEndingToday;

        // Now determine the final object to return based *only* on the first day found
        if (firstDayOfStreakData) {
            // The final object to return *is* the data of the first day of the streak.
            // Its streakStartTimestampUTC will either be the specific timestamp if it had one (Scenario 6),
            // or null if it didn't (Scenario 4/5), allowing the fallback in toggleSoberDay to work correctly.
            finalStreakStartDayData = { ...firstDayOfStreakData }; // Create a new object
            // console.log('[recalculateStreaks] Determined first day of streak:', { id: firstDayOfStreakData.id, ts: firstDayOfStreakData.streakStartTimestampUTC }); // Keep log commented
        } else {
             finalStreakStartDayData = null; // Should not happen if finalCurrentStreak > 0, but safety check
        }
    } else {
        // Today does not exist, or today exists but is NOT sober.
        // Per Option A, current streak must be 0 if today is not sober.
        finalCurrentStreak = 0;
        finalStreakStartDayData = null;
    }

    // --- Reconstruct Weeks ---
    const updatedWeeks: WeekData[] = [];
    if (processedDays.length > 0) {
      for (let i = 0; i < processedDays.length; i += 7) {
        const weekDays = processedDays.slice(i, i + 7);
        if (weekDays.length > 0) {
          const weekId = `week-${weekDays[0].date}`;
          updatedWeeks.push({
            id: weekId,
            days: weekDays,
          });
        }
      }
    }
    // Return the calculated final values
    // Return the calculated final values
    return {
        updatedWeeks,
        currentStreak: finalCurrentStreak,
        longestStreak,
        streakStartDayData: finalStreakStartDayData // Return the correctly determined start day data
    };
    console.log('[useCalendarData:recalculateStreaks] Result:', { currentStreak: finalCurrentStreak, longestStreak, streakStartDayId: finalStreakStartDayData?.id });
  } catch (error) {
    console.error("Error during streak/intensity recalculation:", error);
    return { updatedWeeks: weeks, currentStreak: 0, longestStreak: 0, streakStartDayData: null };
  }
};

export const useCalendarData = () => {
  const repository = useRepository();
  const { startTimer, stopTimer, isRunning: isTimerRunning } = useTimerState(); // Removed timerDurationDetails
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingPast, setIsLoadingPast] = useState(false);
  const [isLoadingFuture, setIsLoadingFuture] = useState(false);
  const isInitialMount = useRef(true);

  // Initial data loading effect
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('[useCalendarData:loadInitialData] Starting initial data load...');
      setIsLoadingInitial(true);
      try {
        const [loadedDayStatus, loadedStreakData] = await Promise.all([
          repository.loadAllDayStatus(),
          repository.loadStreakData(),
        ]);
        console.log('[useCalendarData:loadInitialData] Loaded from repo:', { dayStatusCount: Object.keys(loadedDayStatus).length, streakData: loadedStreakData });
        
        // Start with deterministic base weeks
        const baseWeeks = generateDeterministicInitialWeeks();
        
        // Apply loaded data to the base weeks, mapping sober status and timestamps
        const weeksWithLoadedStatus = baseWeeks.map(week => ({
          ...week,
          days: week.days.map(day => {
            // Check if we have data for this day in the repository
            const dayData = loadedDayStatus[day.id];
            // If we have data for this day, use it; otherwise, keep the defaults
            if (dayData) {
              // Handle both data formats: boolean and object with { sober, streakStartTimestampUTC }
              if (typeof dayData === 'boolean') {
                // Old format: just a boolean indicating sober status
                return { ...day, sober: dayData, streakStartTimestampUTC: null };
              } else {
                // New format: object with sober status and streak start timestamp
                return { 
                  ...day, 
                  sober: dayData.sober, 
                  streakStartTimestampUTC: dayData.streakStartTimestampUTC 
                };
              }
            }
            return day;
          }),
        }));
        
        // Calculate streaks and intensity with loaded data
        const { 
          updatedWeeks, 
          currentStreak: calculatedCurrent, 
          longestStreak: calculatedLongest, 
          streakStartDayData 
        } = recalculateStreaksAndIntensity(weeksWithLoadedStatus);
        console.log('[useCalendarData:loadInitialData] Initial calculation result:', { calculatedCurrent, calculatedLongest, streakStartDayId: streakStartDayData?.id });

        // Set the updated weeks with proper sober status and intensity
        setWeeks(updatedWeeks);

        // IMPORTANT: Use loaded streak data if available, otherwise use calculated values
        // If we have streak data from the repository, prioritize it over calculated values
        const finalCurrentStreak = loadedStreakData?.currentStreak !== undefined && loadedStreakData?.currentStreak !== null
          ? loadedStreakData.currentStreak 
          : calculatedCurrent;
          
        const finalLongestStreak = loadedStreakData?.longestStreak !== undefined && loadedStreakData?.longestStreak !== null
          ? loadedStreakData.longestStreak
          : calculatedLongest;
        
        setCurrentStreak(finalCurrentStreak);
        setLongestStreak(finalLongestStreak);
        
        // Initialize timer based on loaded/calculated state
        if (finalCurrentStreak > 0 && streakStartDayData) {
            // Use exact timestamp if available, otherwise use start of day
            const effectiveStartTimeUTC = streakStartDayData.streakStartTimestampUTC ?? 
                                          dayjs(streakStartDayData.date).startOf('day').valueOf();
            
            if (typeof effectiveStartTimeUTC === 'number' && !isNaN(effectiveStartTimeUTC)) {
                startTimer(effectiveStartTimeUTC);
            } else {
                console.error("Invalid timer start timestamp during initialization");
                stopTimer();
            }
        } else {
            stopTimer(); // Ensure timer is stopped if no initial streak
        }
        console.log('[useCalendarData:loadInitialData] Finished initial data load.');
      } catch (error) {
        console.error("Failed to load initial calendar data:", error);
        // Fall back to deterministic default state
        const deterministicWeeks = generateDeterministicInitialWeeks();
        const calculated = recalculateStreaksAndIntensity(deterministicWeeks);
        setWeeks(calculated.updatedWeeks);
        setCurrentStreak(calculated.currentStreak);
        setLongestStreak(calculated.longestStreak);
        stopTimer(); // Stop timer on error
      } finally {
        setIsLoadingInitial(false);
      }
    };
    
    // Execute the data loading function
    loadInitialData();
  }, [repository, startTimer, stopTimer]); // Added timer actions to dependency array

  // Effect to save streak data
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (repository) {
        const saveData = async () => {
            try {
                await repository.saveStreakData({ currentStreak, longestStreak });
            } catch (error) {
                console.error("Failed to save streak data via useEffect:", error);
            }
        };
        saveData();
    }
  }, [currentStreak, longestStreak, repository]);

  const toggleSoberDay = useCallback(async (dayId: string) => {
    console.log(`[useCalendarData:toggleSoberDay] Initiated for dayId: ${dayId}`);
    const actionTimestamp = dayjs().valueOf(); // Capture timestamp at the start
    // Find the day being toggled
    const allDays = weeks.flatMap(w => w.days).sort((a, b) => dayjs(a.date).diff(dayjs(b.date))); // Add sort ensure correct order
    const dayIndex = allDays.findIndex(d => d.id === dayId);

    if (dayIndex === -1 || dayjs(dayId).isAfter(dayjs(), 'day')) {
      console.warn(`Cannot toggle day ${dayId}: Not found or is in the future.`);
      return;
    }

    const currentDayData = allDays[dayIndex];
    const newSoberValue = !currentDayData.sober;
    let newStreakStartTimestampUTC: number | null = null;
    console.log(`[useCalendarData:toggleSoberDay] Calculated initial values: newSoberValue=${newSoberValue}, newStreakStartTimestampUTC=${newStreakStartTimestampUTC}`);

    // Determine the new streakStartTimestampUTC based on the logic
    if (newSoberValue) {
      // Marking as sober
      const prevDayIndex = dayIndex - 1;
      const prevDayIsSober = prevDayIndex >= 0 ? allDays[prevDayIndex].sober : false;
      const isTogglingToday = dayId === dayjs().format('YYYY-MM-DD'); // Check if the toggled day is today

      if (!prevDayIsSober) {
        // Previous day was not sober OR it's the first day ever recorded.
        // This is the start of a *new* segment of sobriety.
        // ONLY assign the exact timestamp if we are toggling *TODAY* (Scenario 3)
        if (isTogglingToday) {
             newStreakStartTimestampUTC = actionTimestamp; // Use captured timestamp for Scenario 3
        } else {
             newStreakStartTimestampUTC = null; // Use null for backfilled days starting a streak segment (Scenario 5)
        }
      } else {
        // Previous day was sober, continue the streak visually
        newStreakStartTimestampUTC = null;
      }
    } else {
      // Marking as NOT sober: Always set timestamp to null
      newStreakStartTimestampUTC = null;
    }

    // --- Save Logic (Moved Before setWeeks) ---
    try {
        // Save the initially calculated status and timestamp BEFORE updating state
        await repository.saveDayStatus(dayId, newSoberValue, newStreakStartTimestampUTC);
        console.log(`[useCalendarData:toggleSoberDay] Saved to repo: dayId=${dayId}, sober=${newSoberValue}, timestamp=${newStreakStartTimestampUTC}`);
    } catch (error) {
      console.error("Failed to save day status:", error);
      // If save fails, should we proceed with state update? For now, yes.
      // Consider adding error handling state if needed.
    }
    // --- End Save Logic ---

    setWeeks(currentWeeks => {
      // Create new weeks array with updated day data (sober status and timestamp)
      const newWeeks = currentWeeks.map(week => ({
        ...week,
        days: week.days.map(day => {
          if (day.id === dayId) {
            // Update both sober status and the timestamp
            return { ...day, sober: newSoberValue, streakStartTimestampUTC: newStreakStartTimestampUTC };
          }
          return day;
        })
      }));

      console.log(`[toggleSoberDay] Toggling day ${dayId} to sober: ${newSoberValue}`);
      // Add log before recalculation within setWeeks
      const calculationResult = recalculateStreaksAndIntensity(newWeeks);
      console.log(`[useCalendarData:toggleSoberDay] Recalculating streaks after toggle...`);
      const streakStartDayData = calculationResult.streakStartDayData; // Use the new name
      console.log('[toggleSoberDay] Recalculation Result:', calculationResult);
      const newCurrent = calculationResult.currentStreak;
      const newLongest = Math.max(longestStreak, calculationResult.longestStreak);

      setCurrentStreak(newCurrent);
      setLongestStreak(newLongest);

      console.log(`[toggleSoberDay] Setting currentStreak: ${newCurrent}, longestStreak: ${newLongest}`);
      console.log(`[useCalendarData:toggleSoberDay] Timer state before update: isRunning=${isTimerRunning}`); // Log current timer state
      // --- Timer Start/Stop Logic ---
      stopTimer(); // Always stop first

      if (newCurrent > 0 && streakStartDayData) {
          let effectiveStartTimeUTC: number | null = null;
          const firstDayTimestamp = streakStartDayData.streakStartTimestampUTC;
          const firstDayDate = streakStartDayData.date;
          const fallbackTime = dayjs(firstDayDate).startOf('day').valueOf();
          const isStreakStartingToday = firstDayDate === dayjs().format('YYYY-MM-DD');


          // Determine the correct start time for the timer
          if (firstDayTimestamp !== null && isStreakStartingToday) {
            // Scenario 3 & potentially others where today starts the streak AND has a specific timestamp: Use the specific timestamp.
            // This is usually the exact time the user toggled 'today' to start the streak.
            effectiveStartTimeUTC = firstDayTimestamp;
          } else {
            // Default Case (including historical streaks being connected): Use midnight of the first day of the streak.
            // This ensures timers for streaks starting in the past begin at the start of that day.
            effectiveStartTimeUTC = fallbackTime;
          }

          // Note: The complex 'Override for Scenario 3' logic previously here is simplified.
          // The actionTimestamp is now primarily handled during the initial setting of streakStartTimestampUTC
          // when a day is first toggled sober (lines 316-339).
          // The logic here focuses solely on *interpreting* the result from recalculateStreaksAndIntensity.



          // Ensure we have a valid timestamp before starting the timer
          if (typeof effectiveStartTimeUTC === 'number' && !isNaN(effectiveStartTimeUTC)) {
              startTimer(effectiveStartTimeUTC);
          } else {
              console.error("Error: Calculated effectiveStartTimeUTC is invalid.", { streakStartDayData });
          }
      } else {
      }
      console.log(`[useCalendarData:toggleSoberDay] Timer state after update: isRunning=${newCurrent > 0}`); // Log intended timer state
      // If newCurrent is 0, the timer remains stopped
      
      return calculationResult.updatedWeeks;
    });
      console.log(`[useCalendarData:toggleSoberDay] Completed for dayId: ${dayId}`);
  }, [weeks, longestStreak, startTimer, stopTimer, repository]);

  const loadPastWeeks = useCallback(() => {
    console.log('[useCalendarData:loadPastWeeks] Called.');
    if (isLoadingPast) return;
    setIsLoadingPast(true);
    setTimeout(() => {
      try {
        setWeeks(currentWeeks => {
          const currentCalendarData: CalendarData = { weeks: currentWeeks };
          const moreData = loadMoreWeeks(currentCalendarData, 'past', 4);
          // TODO: Integrate loaded data for new weeks
          console.log(`[useCalendarData:loadPastWeeks] Loaded ${moreData.weeks.length - currentWeeks.length} more past weeks.`);
          const { updatedWeeks, currentStreak: newCurrent, longestStreak: newLongest } = recalculateStreaksAndIntensity(moreData.weeks);
          setCurrentStreak(newCurrent);
          setLongestStreak(prevLongest => Math.max(prevLongest, newLongest));
          return updatedWeeks;
        });
      } catch (error) {
        console.error("Error loading past weeks:", error);
      } finally {
        setIsLoadingPast(false);
      }
    }, 0);
  }, [weeks, isLoadingPast]);

  const loadFutureWeeks = useCallback(() => {
    console.log('[useCalendarData:loadFutureWeeks] Called.');
    if (isLoadingFuture) return;
    setIsLoadingFuture(true);
    setTimeout(() => {
      try {
        setWeeks(currentWeeks => {
          const currentCalendarData: CalendarData = { weeks: currentWeeks };
          const moreData = loadMoreWeeks(currentCalendarData, 'future', 4);
          // TODO: Integrate loaded data for new weeks
          console.log(`[useCalendarData:loadFutureWeeks] Loaded ${moreData.weeks.length - currentWeeks.length} more future weeks.`);
          const { updatedWeeks, currentStreak: newCurrent, longestStreak: newLongest } = recalculateStreaksAndIntensity(moreData.weeks);
          setCurrentStreak(newCurrent);
          setLongestStreak(prevLongest => Math.max(prevLongest, newLongest));
          return updatedWeeks;
        });
      } catch (error) {
        console.error("Error loading future weeks:", error);
      } finally {
        setIsLoadingFuture(false);
      }
    }, 0);
  }, [weeks, isLoadingFuture]);

  return {
    weeks,
    toggleSoberDay,
    loadPastWeeks,
    loadFutureWeeks,
    currentStreak,
    longestStreak,
    isLoadingInitial,
    isLoadingPast,
    isLoadingFuture,
    // scrollToToday, // Removed since we're now using the context's implementation
    // timerDurationDetails, // Removed timerDurationDetails from return
  };
};