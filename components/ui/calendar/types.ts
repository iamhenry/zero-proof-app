/**
 * FILE: types.ts
 * CREATED: 2024-07-18 16:32:05
 *
 * PURPOSE:
 * This file defines TypeScript interfaces for calendar data structures used throughout the calendar components.
 *
 * METHODS:
 * - N/A (type definitions only)
 */

export interface DayData {
  id: string;
  date: string;
  day: number;
  month: number;
  year: number;
  sober: boolean;
  intensity: number;
  isFirstOfMonth: boolean;
}

export interface WeekData {
  id: string;
  days: DayData[];
}

export interface CalendarData {
  weeks: WeekData[];
} 