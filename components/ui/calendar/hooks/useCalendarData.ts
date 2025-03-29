import { useState, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'; // Import plugin
import { WeekData, DayData, CalendarData } from '../types';
// Assuming createMockCalendarData is correctly typed and available for initial state
// We might need to adjust the import path based on where testUtils actually lives relative to this hook
// For now, let's assume a placeholder or direct import if possible, otherwise we'll mock it simply.
// Let's use a simple mock structure for now to avoid dependency on testUtils in production code.
// We'll need to import the actual utility or a shared utility later.
import { generateCalendarData, loadMoreWeeks } from '../utils'; // Assuming utils are in the parent directory

dayjs.extend(isSameOrBefore); // Extend dayjs with the plugin

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
    let newIntensity: number;
    if (day.sober) {
      streakInProgress++;
      newIntensity = Math.min(streakInProgress, 10); // Max intensity is 10
    } else {
      longestStreak = Math.max(longestStreak, streakInProgress);
      streakInProgress = 0;
      newIntensity = 0;
    }

    // Update the final current streak if this day is today or before today
    if (dayjs(day.date).isSameOrBefore(todayStr, 'day')) {
      finalCurrentStreak = streakInProgress;
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
    // Determine the week ID prefix logic if needed (e.g., based on year/week number)
    // For simplicity, using index as ID for now.
    for (let i = 0; i < processedDays.length; i += 7) {
      const weekDays = processedDays.slice(i, i + 7);
      if (weekDays.length > 0) { // Ensure we don't add empty weeks if allDays isn't multiple of 7
        updatedWeeks.push({
          id: `week-${Math.floor(i / 7)}`, // Simple week ID based on index
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
    const generated = generateCalendarData(); // Generate initial data (e.g., 5 months around today)
    const calculated = recalculateStreaksAndIntensity(generated.weeks);
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
            // if (dayjs(day.date).isAfter(dayjs(), 'day')) {
            //   return day;
            // }
            return { ...day, sober: !day.sober };
          }
          return day;
        })
      }));

      // Recalculate streaks and intensities
      const { updatedWeeks, currentStreak: newCurrent, longestStreak: newLongest } = recalculateStreaksAndIntensity(newWeeks);

      // Update streaks state
      setCurrentStreak(newCurrent);
      setLongestStreak(newLongest);
      return updatedWeeks;
    });
  }, []); // Dependency array is empty as setWeeks is stable

  const loadPastWeeks = useCallback(() => {
    if (isLoadingPast) return; // Prevent multiple loads
    setIsLoadingPast(true);
    // Simulate async loading if needed, e.g., fetching from backend
    // For now, generate synchronously
    try {
      const currentCalendarData: CalendarData = { weeks };
      const moreData = loadMoreWeeks(currentCalendarData, 'past', 4); // Load 4 more weeks (1 month)
      const { updatedWeeks, currentStreak: newCurrent, longestStreak: newLongest } = recalculateStreaksAndIntensity(moreData.weeks);
      setWeeks(updatedWeeks);
      // Streaks might change if past data affects them, update if necessary
      setCurrentStreak(newCurrent);
      setLongestStreak(newLongest);
    } catch (error) {
      console.error("Error loading past weeks:", error);
      // Handle error appropriately
    } finally {
      setIsLoadingPast(false);
    }
  }, [weeks, isLoadingPast]); // Add dependencies

  const loadFutureWeeks = useCallback(() => {
    if (isLoadingFuture) return; // Prevent multiple loads
    setIsLoadingFuture(true);
    try {
      const currentCalendarData: CalendarData = { weeks };
      const moreData = loadMoreWeeks(currentCalendarData, 'future', 4); // Load 4 more weeks
      // Recalculation might not be strictly needed if future doesn't affect past streaks,
      // but let's keep it for consistency and potential future logic.
      const { updatedWeeks, currentStreak: newCurrent, longestStreak: newLongest } = recalculateStreaksAndIntensity(moreData.weeks);
      setWeeks(updatedWeeks);
      setCurrentStreak(newCurrent);
      setLongestStreak(newLongest);
    } catch (error) {
      console.error("Error loading future weeks:", error);
    } finally {
      setIsLoadingFuture(false);
    }
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