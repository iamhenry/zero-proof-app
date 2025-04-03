/**
 * FILE: components/ui/calendar/types.ts
 * PURPOSE: Defines TypeScript interfaces for calendar data structures (DayData, WeekData, CalendarData).
 * FUNCTIONS: N/A (Type definitions only)
 * DEPENDENCIES: None
 */

export interface DayData {
  id: string;
  date: string;
  day: number;
  month: number;
  year: number;
  sober: boolean;
  intensity: number;
  streakStartTimestampUTC: number | null;
  isFirstOfMonth: boolean;
}

export interface WeekData {
  id: string;
  days: DayData[];
}

export interface CalendarData {
  weeks: WeekData[];
}