/**
 * FILE: utils.ts
 * CREATED: 2024-07-18 16:32:05
 *
 * PURPOSE:
 * This file provides utility functions for calendar data generation, styling, and manipulation.
 *
 * METHODS:
 * - getToday(): Returns current date with caching for performance
 * - getIntensityColor(): Returns style class based on sobriety streak intensity
 * - getTextColorClass(): Returns text color class based on intensity
 * - getDayStatus(): Determines if a day is today, past, or future
 * - generateCalendarData(): Creates structured calendar data with random streaks
 * - loadMoreWeeks(): Adds additional weeks to existing calendar data
 */

import { DayData, WeekData, CalendarData } from './types';
import dayjs from 'dayjs';

// Cache for today's date to avoid recalculating it repeatedly
let _todayCache: { date: dayjs.Dayjs, lastCalculated: number } = {
  date: dayjs().startOf('day'),
  lastCalculated: Date.now()
};

// Get today's date with caching (recalculate only once per minute)
const getToday = (): dayjs.Dayjs => {
  const now = Date.now();
  // If cache is older than 1 minute, refresh it
  if ((now - _todayCache.lastCalculated) > 60000) {
    _todayCache = {
      date: dayjs().startOf('day'),
      lastCalculated: now
    };
  }
  return _todayCache.date;
};

// Function to get color based on intensity (0-10)
// Intensity 0 means not sober (white background)
// Intensity 1-10 represents the streak length, with higher values for longer streaks
export const getIntensityColor = (intensity: number): string => {
  // Map intensity to a shade of green
  switch (intensity) {
    case 0: return ''; // Not sober - will be white
    case 1: return 'bg-green-50'; // First day of streak
    case 2: return 'bg-green-100'; // 2 days
    case 3: return 'bg-green-200'; // 3 days
    case 4: return 'bg-green-300'; // 4 days
    case 5: return 'bg-green-400'; // 5 days
    case 6: return 'bg-green-500'; // 6 days
    case 7: return 'bg-green-600'; // 7 days
    case 8: return 'bg-green-700'; // 8 days
    case 9: return 'bg-green-800'; // 9 days
    case 10: return 'bg-green-900'; // 10+ days (max intensity)
    default: return ''; // Fallback
  }
};

// Get text color based on intensity
export const getTextColorClass = (intensity: number): string => {
  // For higher intensities (darker backgrounds), use light text
  if (intensity >= 5) {
    return 'text-green-100';
  }
  // For lower intensities (lighter backgrounds), use dark text
  else if (intensity >= 1) {
    return 'text-green-600';
  }
  // For non-sober days, use different text colors based on status
  return 'text-stone-300'; // Default for past days
};

// Cache for day status results
const dayStatusCache: Record<string, 'today' | 'past' | 'future'> = {};

// Determine if a day is today, past, or future
export const getDayStatus = (date: string): 'today' | 'past' | 'future' => {
  // Check cache first
  if (dayStatusCache[date]) {
    return dayStatusCache[date];
  }
  
  const today = getToday();
  const dayDate = dayjs(date).startOf('day');
  
  let status: 'today' | 'past' | 'future';
  
  if (dayDate.isSame(today)) {
    status = 'today';
  } else if (dayDate.isBefore(today)) {
    status = 'past';
  } else {
    status = 'future';
  }
  
  // Store in cache
  dayStatusCache[date] = status;
  
  return status;
};

// Get text color based on day status (for non-sober days)
export const getStatusTextColor = (status: 'today' | 'past' | 'future'): string => {
  switch (status) {
    case 'today':
      return 'text-sky-500';
    case 'past':
      return 'text-stone-300';
    case 'future':
      return 'text-neutral-700';
    default:
      return 'text-stone-300';
  }
};

// Function to generate a single day data
export const generateDayData = (date: dayjs.Dayjs, streakInfo?: {inStreak: boolean, currentStreakLength: number}): DayData => {
  const day = date.date();
  const month = date.month();
  const year = date.year();
  const isFirstOfMonth = day === 1;
  
  let intensity = 0;
  let sober = false;
  
  // If streak info is provided, use it
  if (streakInfo && streakInfo.inStreak) {
    sober = true;
    intensity = Math.min(streakInfo.currentStreakLength, 10);
  }
  
  return {
    id: date.format('YYYY-MM-DD'),
    date: date.format('YYYY-MM-DD'),
    day,
    month,
    year,
    intensity,
    sober,
    isFirstOfMonth
  };
};

// Ensure startDate is aligned to the first day of the week (Sunday = 0)
const alignToWeekStart = (date: dayjs.Dayjs): dayjs.Dayjs => {
  const dayOfWeek = date.day(); // 0 is Sunday, 6 is Saturday
  return date.subtract(dayOfWeek, 'day');
};

// Generate calendar data with dynamic dates properly aligned to weeks
export const generateCalendarData = (
  startDate = dayjs().subtract(3, 'month'), 
  months = 5
): CalendarData => {
  // Align the start date to the beginning of the week (Sunday)
  const alignedStartDate = alignToWeekStart(startDate);
  
  // Calculate approximate number of days (ensure we have complete weeks)
  const totalDays = months * 31; // Slightly more than months * 30 to ensure we have enough days
  const totalWeeks = Math.ceil(totalDays / 7);
  
  // Generate weeks directly instead of days first
  const weeks: WeekData[] = [];
  
  // Streak management variables
  let inStreak = false;
  let currentStreakLength = 0;
  let maxStreakLength = 0;
  
  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
    const weekDays: DayData[] = [];
    
    // Generate 7 days for each week
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayOffset = weekIndex * 7 + dayIndex;
      const currentDate = alignedStartDate.add(dayOffset, 'day');
      
      // Randomly determine if this day should start or continue a streak
      if (!inStreak) {
        // 25% chance to start a new streak
        if (Math.random() < 0.25) {
          inStreak = true;
          currentStreakLength = 1;
          maxStreakLength = Math.floor(Math.random() * 12) + 3; // Random streak of 3-14 days
        }
      } else {
        // Continue the streak
        currentStreakLength++;
        
        // End streak if we've reached max length
        if (currentStreakLength >= maxStreakLength) {
          inStreak = false;
        }
      }
      
      weekDays.push(generateDayData(currentDate, { inStreak, currentStreakLength }));
    }
    
    weeks.push({
      id: `week-${weekIndex}`,
      days: weekDays
    });
  }
  
  return { weeks };
};

// Legacy function for backward compatibility
export const generateStaticCalendarData = (): CalendarData => {
  return generateCalendarData();
};

// Get month name for display
export const getMonthName = (month: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month];
};

// Load more weeks to the calendar data (for infinite scrolling)
export const loadMoreWeeks = (
  existingData: CalendarData, 
  direction: 'past' | 'future' = 'future', 
  weeksToLoad: number = 4
): CalendarData => {
  const newData = { ...existingData };
  const weeks = [...newData.weeks];
  
  if (direction === 'future') {
    // Get the last day from the last week
    const lastWeek = weeks[weeks.length - 1];
    const lastDay = lastWeek.days[lastWeek.days.length - 1];
    const lastDate = dayjs(lastDay.date);
    
    // Start date is the day after the last day
    const startDate = lastDate.add(1, 'day');
    
    // Ensure we're generating weeks aligned properly
    // We already know the next day should be the first day of the week (Sunday)
    // since the last day of previous week should be Saturday
    for (let weekIndex = 0; weekIndex < weeksToLoad; weekIndex++) {
      const weekDays: DayData[] = [];
      
      // Generate 7 days for the week
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayOffset = weekIndex * 7 + dayIndex;
        const currentDate = startDate.add(dayOffset, 'day');
        
        // Random streak generation
        const shouldBeSober = Math.random() < 0.3;
        let intensity = 0;
        
        if (shouldBeSober) {
          // Random intensity between 1-10
          intensity = Math.floor(Math.random() * 10) + 1;
        }
        
        weekDays.push({
          id: currentDate.format('YYYY-MM-DD'),
          date: currentDate.format('YYYY-MM-DD'),
          day: currentDate.date(),
          month: currentDate.month(),
          year: currentDate.year(),
          intensity,
          sober: intensity > 0,
          isFirstOfMonth: currentDate.date() === 1
        });
      }
      
      weeks.push({
        id: `week-${weeks.length}`,
        days: weekDays
      });
    }
  } else if (direction === 'past') {
    // Get the first day from the first week
    const firstWeek = weeks[0];
    const firstDay = firstWeek.days[0];
    const firstDate = dayjs(firstDay.date);
    
    // End date is the day before the first day (which should be a Sunday)
    const endDate = firstDate.subtract(1, 'day'); // This should be a Saturday
    
    for (let weekIndex = 0; weekIndex < weeksToLoad; weekIndex++) {
      const weekDays: DayData[] = [];
      
      // Generate 7 days for the week (going backwards)
      for (let dayIndex = 6; dayIndex >= 0; dayIndex--) {
        // Calculate offset: we're going backwards from endDate
        // For first new week: 6 days before endDate to endDate 
        // For second new week: 13 days before endDate to 7 days before endDate
        const dayOffset = weekIndex * 7 + (6 - dayIndex);
        const currentDate = endDate.subtract(dayOffset, 'day');
        
        // Random streak generation
        const shouldBeSober = Math.random() < 0.3;
        let intensity = 0;
        
        if (shouldBeSober) {
          // Random intensity between 1-10
          intensity = Math.floor(Math.random() * 10) + 1;
        }
        
        weekDays.unshift({
          id: currentDate.format('YYYY-MM-DD'),
          date: currentDate.format('YYYY-MM-DD'),
          day: currentDate.date(),
          month: currentDate.month(),
          year: currentDate.year(),
          intensity,
          sober: intensity > 0,
          isFirstOfMonth: currentDate.date() === 1
        });
      }
      
      // Ensure weekDays has 7 days
      if (weekDays.length !== 7) {
        console.warn(`Week does not have 7 days! It has ${weekDays.length} days.`);
      }
      
      weeks.unshift({
        id: `week-${-1 * (weekIndex + 1)}`,
        days: weekDays
      });
    }
  }
  
  newData.weeks = weeks;
  return newData;
}; 