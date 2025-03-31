/** * FILE: components/ui/calendar/hooks/useCalendarData.ts
 * PURPOSE: Manages state and logic for the calendar, including data generation, sobriety tracking, streak calculation, and week loading.
 * HOOKS:
 *   - useCalendarData() → { weeks: WeekData[], toggleSoberDay: (dayId: string) => void, loadPastWeeks: () => void, loadFutureWeeks: () => void, currentStreak: number, longestStreak: number, isLoadingInitial: boolean, isLoadingPast: boolean, isLoadingFuture: boolean }: Provides calendar state and interaction logic.
 * FUNCTIONS:
 *   - generateDeterministicInitialWeeks() → WeekData[]: Creates the initial visible weeks.
 *   - recalculateStreaksAndIntensity(weeks: WeekData[]) → { updatedWeeks: WeekData[], currentStreak: number, longestStreak: number }: Processes weeks to update day intensity and calculate streaks.
 * DEPENDENCIES: react, dayjs, ../types, ../utils
*/
import { useState, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'; // Import plugin
import { WeekData, DayData, CalendarData } from '../types';
// Assuming createMockCalendarData is correctly typed and available for initial state
// We might need to adjust the import path based on where testUtils actually lives relative to this hook
// For now, let's assume a placeholder or direct import if possible, otherwise we'll mock it simply.
// Let's use a simple mock structure for now to avoid dependency on testUtils in production code.
// We'll need to import the actual utility or a shared utility later.
// import { generateCalendarData, loadMoreWeeks } from '../utils'; // No longer using random generation
 
import { loadMoreWeeks } from '../utils'; // Re-enable import for loading

dayjs.extend(isSameOrBefore); // Extend dayjs with the plugin
 
// --- Deterministic Initial State Generation ---
const generateDeterministicInitialWeeks = (): WeekData[] => {
  const today = dayjs();
  // const weeksToShow = 9; // 4 past, 1 current, 4 future - Not needed directly, calculated from start/end
  const startDate = today.subtract(4, 'week').startOf('week');
  const endDate = today.add(4, 'week').endOf('week');

  const days: DayData[] = [];
  let currentDate = startDate;

  while (currentDate.isSameOrBefore(endDate, 'day')) {
    const dateStr = currentDate.format('YYYY-MM-DD');
    const dayOfMonth = currentDate.date(); // Get day of the month
    days.push({
      id: dateStr,
      date: dateStr,
      sober: false, // Initialize all days as not sober
      intensity: 0, // Initial intensity is 0
      day: dayOfMonth,
      month: currentDate.month(), // 0-indexed month
      year: currentDate.year(),
      isFirstOfMonth: dayOfMonth === 1, // Check if it's the first day
    });
    currentDate = currentDate.add(1, 'day');
  }

  const weeks: WeekData[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const weekDays = days.slice(i, i + 7);
    if (weekDays.length > 0) {
      // Use the date of the first day of the week as part of the ID
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
const recalculateStreaksAndIntensity = (weeks: WeekData[]): { updatedWeeks: WeekData[], currentStreak: number, longestStreak: number } => {
  if (!weeks || weeks.length === 0) {
    return { updatedWeeks: [], currentStreak: 0, longestStreak: 0 };
  }

  // Flatten weeks into a single array of days, sorted by date
  const allDays: DayData[] = weeks.flatMap(week => week.days).sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

  let currentStreak = 0;
  let longestStreak = 0;
  let streakInProgress = 0;
  const todayStr = dayjs().format('YYYY-MM-DD');
  let finalCurrentStreak = 0;

  // Map through all days to calculate streaks and create new day objects with updated intensity
  const processedDays = allDays.map((day) => {
    // Determine the streak length *before* processing the current day's status
    const streakBeforeProcessing = streakInProgress;

    let newIntensity: number;
    if (day.sober) {
      streakInProgress++;
      newIntensity = Math.min(streakInProgress, 10); // Max intensity is 10
    } else {
      longestStreak = Math.max(longestStreak, streakInProgress);
      streakInProgress = 0; // Reset streak *after* potentially updating longest
      newIntensity = 0;
    }

    // Update the final current streak if this day is today or before today
    // Use the streak length *before* processing today's non-sober status if applicable
    if (dayjs(day.date).isSameOrBefore(todayStr, 'day')) {
      finalCurrentStreak = day.sober ? streakInProgress : streakBeforeProcessing;
    }

    // Return a new DayData object with the updated intensity
    return { ...day, intensity: newIntensity };
  });

  // Final check for the longest streak after the loop
  longestStreak = Math.max(longestStreak, streakInProgress);

  // --- Refactored Reconstruction ---
  // Group the updated allDays back into weeks of 7
  const updatedWeeks: WeekData[] = [];
  if (processedDays.length > 0) {
    for (let i = 0; i < processedDays.length; i += 7) {
      const weekDays = processedDays.slice(i, i + 7);
      if (weekDays.length > 0) { // Ensure we don't add empty weeks if allDays isn't multiple of 7
        // Use the date of the first day of the week for consistent ID generation
        const weekId = `week-${weekDays[0].date}`;
        updatedWeeks.push({
          id: weekId,
          days: weekDays,
        });
      }
    }
  } // Removed extra closing brackets here

  return { updatedWeeks, currentStreak: finalCurrentStreak, longestStreak };
};

export const useCalendarData = () => {
  // Initialize state using generateCalendarData
  const initialData = useMemo(() => {
    // const generated = generateCalendarData(); // Generate initial data (e.g., 5 months around today) - REMOVED
    const deterministicWeeks = generateDeterministicInitialWeeks(); // Use deterministic generation
    const calculated = recalculateStreaksAndIntensity(deterministicWeeks); // Calculate initial streaks (should be 0)
    return calculated;
  }, []);

  const [weeks, setWeeks] = useState<WeekData[]>(initialData.updatedWeeks);
  const [currentStreak, setCurrentStreak] = useState(initialData.currentStreak);
  const [longestStreak, setLongestStreak] = useState(initialData.longestStreak);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false); // Default value
  const [isLoadingPast, setIsLoadingPast] = useState(false); // Default value
  const [isLoadingFuture, setIsLoadingFuture] = useState(false); // Default value

  const toggleSoberDay = useCallback((dayId: string) => { // Changed param to dayId based on likely usage
    setWeeks(currentWeeks => {
      // Find and toggle the day's sober status
      const newWeeks = currentWeeks.map(week => ({
        ...week,
        days: week.days.map(day => {
          if (day.id === dayId) {
            // Cannot change future days (optional rule, implement if needed)
            if (dayjs(day.date).isAfter(dayjs(), 'day')) {
              return day; // Return unchanged day if it's in the future
            }
            return { ...day, sober: !day.sober };
          }
          return day;
        })
      }));

      // Recalculate streaks and intensities
      const { updatedWeeks, currentStreak: newCurrent, longestStreak: newLongest } = recalculateStreaksAndIntensity(newWeeks);

      // Update streaks state
      setCurrentStreak(newCurrent); // Update current streak directly
      setLongestStreak(prevLongest => Math.max(prevLongest, newLongest)); // Update longest streak considering previous max
      return updatedWeeks;
    });
  }, []); // Dependency array is empty as setWeeks is stable

  const loadPastWeeks = useCallback(() => {
    if (isLoadingPast) return; // Prevent multiple loads
    setIsLoadingPast(true);
    // Use setTimeout(0) to defer the synchronous data loading to the next event loop tick.
    // This allows the isLoadingPast state update to render before the potentially blocking
    // loadMoreWeeks and recalculateStreaksAndIntensity functions run.
    // TODO: Replace this with proper async/await handling when loadMoreWeeks becomes asynchronous (e.g., fetching from storage/API).
    setTimeout(() => {
      try {
        // Access weeks via a function argument in setWeeks to ensure fresh state
        setWeeks(currentWeeks => {
          const currentCalendarData: CalendarData = { weeks: currentWeeks };
          const moreData = loadMoreWeeks(currentCalendarData, 'past', 4); // Load 4 more weeks (1 month)
          const { updatedWeeks, currentStreak: newCurrent, longestStreak: newLongest } = recalculateStreaksAndIntensity(moreData.weeks);
          
          // Update streaks state *before* returning updatedWeeks
          setCurrentStreak(newCurrent);
          setLongestStreak(newLongest); // Consider potential race conditions if logic gets complex
          
          return updatedWeeks; // Return the new weeks array for setWeeks
        });
      } catch (error) {
        console.error("Error loading past weeks:", error);
        // Handle error appropriately
      } finally {
        setIsLoadingPast(false); // Set loading false after operations complete
      }
    }, 0); // Delay of 0 pushes execution to the next event loop tick
  }, [weeks, isLoadingPast]); // Add dependencies

  const loadFutureWeeks = useCallback(() => {
    if (isLoadingFuture) return; // Prevent multiple loads
    setIsLoadingFuture(true);
    // Use setTimeout(0) similar to loadPastWeeks to defer synchronous work and allow loading state to render.
    // TODO: Replace with proper async/await when loadMoreWeeks becomes asynchronous.
    setTimeout(() => {
      try {
        setWeeks(currentWeeks => {
          const currentCalendarData: CalendarData = { weeks: currentWeeks };
          const moreData = loadMoreWeeks(currentCalendarData, 'future', 4); // Load 4 more weeks
          // Recalculation might not be strictly needed if future doesn't affect past streaks,
          // but let's keep it for consistency and potential future logic.
          const { updatedWeeks, currentStreak: newCurrent, longestStreak: newLongest } = recalculateStreaksAndIntensity(moreData.weeks);
          
          setCurrentStreak(newCurrent);
          setLongestStreak(newLongest);
          
          return updatedWeeks;
        });
      } catch (error) {
        console.error("Error loading future weeks:", error);
      } finally {
        setIsLoadingFuture(false); // Set loading false after operations complete
      }
    }, 0);
  }, [weeks, isLoadingFuture]); // Add dependencies

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
  };
};