/**
 * FILE: lib/types/repositories.ts
 * PURPOSE: Defines core TypeScript interfaces and types for data structures used in sobriety tracking persistence (StoredDayData, DayDataMap, TimerState, StreakData) and the data repository contract (ISobrietyDataRepository).
 * FUNCTIONS: N/A (Type definitions only)
 * DEPENDENCIES: None
 */
// lib/types/repositories.ts

/**
 * Represents the stored data for a single day, including sobriety status
 * and the precise timestamp when a streak started on this day (if applicable).
 */
export interface StoredDayData {
  sober: boolean;
  streakStartTimestampUTC: number | null;
}

/**
 * Represents the map storing data for all tracked days.
 * Key is the date string (e.g., 'YYYY-MM-DD').
 */
export type DayDataMap = { [date: string]: StoredDayData };

/**
 * Represents the state of the sobriety timer.
 */
export type TimerState = {
  startTime: number | null; // Timestamp when the timer started
  isRunning: boolean;
};

/**
 * Represents the streak data.
 */
export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  // Potentially add lastSoberDate if needed by tests
};

/**
 * Interface for persisting and retrieving sobriety-related data.
 */
export interface ISobrietyDataRepository {
  // Calendar Data
  saveDayStatus(
    date: string,
    isSober: boolean,
    streakStartTimestampUTC: number | null,
  ): Promise<void>;
  loadDayStatus(date: string): Promise<StoredDayData | null>;
  loadAllDayStatus(): Promise<DayDataMap>;

  // Streak Data
  saveStreakData(streakData: StreakData): Promise<void>;
  loadStreakData(): Promise<StreakData | null>;

  // Timer Data
  saveTimerState(timerState: TimerState): Promise<void>;
  loadTimerState(): Promise<TimerState | null>;

  // Settings Data
  saveDrinkCost(cost: number): Promise<void>;
  loadDrinkCost(): Promise<number | null>;
}