/**
 * FILE: lib/storage/LocalStorageSobrietyRepository.ts
 * PURPOSE: Implements the ISobrietyDataRepository interface using AsyncStorage for persistence. Handles loading/saving day status, streak data, timer state, and drink cost. Includes backward compatibility for older day status format.
 * FUNCTIONS:
 *   - loadAllDayStatus() → Promise<DayDataMap>: Loads all day statuses, handling potential format migration.
 *   - saveDayStatus(date, isSober, timestamp) → Promise<void>: Saves status for a specific day.
 *   - loadDayStatus(date) → Promise<StoredDayData | null>: Loads status for a specific day.
 *   - saveStreakData(data) → Promise<void>: Saves streak data.
 *   - loadStreakData() → Promise<StreakData | null>: Loads streak data.
 *   - saveTimerState(state) → Promise<void>: Saves timer state.
 *   - loadTimerState() → Promise<TimerState | null>: Loads timer state.
 *   - saveDrinkCost(cost) → Promise<void>: Saves drink cost setting.
 *   - loadDrinkCost() → Promise<number | null>: Loads drink cost setting.
 *   - saveOnboardingCompletion(completed) → Promise<void>: Saves onboarding completion status.
 *   - loadOnboardingCompletion() → Promise<boolean>: Loads onboarding completion status.
 * KEY FEATURES:
 *   - Robust error handling for all storage operations
 *   - Data migration support for backward compatibility
 *   - Comprehensive debug logging for all storage operations
 *   - Consistent storage key naming convention
 *   - Type safety with proper interface implementation
 *   - Optimized storage operations with minimal data transformations
 *   - Support for structured data with JSON serialization
 * DEPENDENCIES: @react-native-async-storage/async-storage, ../types/repositories
 */
// lib/storage/LocalStorageSobrietyRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ISobrietyDataRepository,
  // DayStatusMap is no longer exported, define the old structure locally for migration
  // DayStatusMap as OldDayStatusMap, // Rename old type for clarity
  TimerState,
  StreakData,
  StoredDayData, // Import the new structure type
  DayDataMap, // Import the new map type
} from '../types/repositories';

// Define the old structure locally for backward compatibility check
type OldBooleanDayStatusMap = { [date: string]: boolean };

// Define AsyncStorage keys
const DAY_STATUS_KEY = '@SobrietyApp:dayStatus';
const STREAK_DATA_KEY = '@SobrietyApp:streakData';
const TIMER_STATE_KEY = '@SobrietyApp:timerState';
const DRINK_COST_KEY = '@SobrietyApp:drinkCost';
const ONBOARDING_COMPLETION_KEY = '@SobrietyApp:onboardingCompleted';

// Debug log the keys at initialization
console.log('[LocalStorageSobrietyRepository] Using AsyncStorage keys:', {
  DAY_STATUS_KEY,
  STREAK_DATA_KEY,
  TIMER_STATE_KEY,
  DRINK_COST_KEY,
  ONBOARDING_COMPLETION_KEY,
});

export class LocalStorageSobrietyRepository
  implements ISobrietyDataRepository
{
  // --- Calendar Data ---

  async loadAllDayStatus(): Promise<DayDataMap> {
    try {
      console.log(`[Repository:loadAllDayStatus] Attempting to load from AsyncStorage with key: ${DAY_STATUS_KEY}`);
      const jsonValue = await AsyncStorage.getItem(DAY_STATUS_KEY);
      const storedData = jsonValue ? JSON.parse(jsonValue) : {};
      
      console.log(`[Repository:loadAllDayStatus] Loaded ${Object.keys(storedData).length} day entries`);
      
      // Check if we need to migrate from old format (just boolean values)
      if (
        Object.keys(storedData).length > 0 &&
        typeof Object.values(storedData)[0] === 'boolean'
      ) {
        const oldStyleMap = storedData as OldBooleanDayStatusMap;
        console.log(`[Repository:loadAllDayStatus] Migrating ${Object.keys(oldStyleMap).length} days from old format`);
        
        const migratedResult: DayDataMap = {};
        for (const [date, soberValue] of Object.entries(oldStyleMap)) {
          migratedResult[date] = { sober: soberValue, streakStartTimestampUTC: null };
        }
        
        // Migrate by saving in the new format
        await AsyncStorage.setItem(DAY_STATUS_KEY, JSON.stringify(migratedResult));
        console.log(`[Repository:loadAllDayStatus] Migration complete, saved to AsyncStorage`);
        
        return migratedResult;
      }
      
      // Return data in new structure
      return storedData as DayDataMap;
    } catch (e) {
      console.error('Failed to load day status.', e);
      return {};
    }
  }

  // Updated to save the full StoredDayData object
  async saveDayStatus(
    date: string,
    isSober: boolean,
    streakStartTimestampUTC: number | null,
  ): Promise<void> {
    try {
      console.log(`[Repository:saveDayStatus] Saving day: ${date}, sober: ${isSober}, timestamp: ${streakStartTimestampUTC}`);
      
      const currentMap = await this.loadAllDayStatus();
      currentMap[date] = { sober: isSober, streakStartTimestampUTC };
      const jsonValue = JSON.stringify(currentMap);
      
      console.log(`[Repository:saveDayStatus] Updated map now has ${Object.keys(currentMap).length} entries`);
      console.log(`[Repository:saveDayStatus] Saving to AsyncStorage with key: ${DAY_STATUS_KEY}`);
      
      await AsyncStorage.setItem(DAY_STATUS_KEY, jsonValue);
      console.log(`[Repository:saveDayStatus] Successfully saved to AsyncStorage`);
    } catch (e) {
      console.error('Failed to save day status.', e);
    }
  }

  // Updated to return the full StoredDayData object
  async loadDayStatus(date: string): Promise<StoredDayData | null> {
    try {
      const currentMap = await this.loadAllDayStatus();
      return currentMap[date] ?? null; // Return null if date not found
    } catch (e) {
      console.error('Failed to load specific day status.', e);
      return null;
    }
  }

  // --- Streak Data ---

  async saveStreakData(streakData: StreakData): Promise<void> {
    try {
      const jsonValue = JSON.stringify(streakData);
      await AsyncStorage.setItem(STREAK_DATA_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to save streak data.', e);
    }
  }

  async loadStreakData(): Promise<StreakData | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STREAK_DATA_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Failed to load streak data.', e);
      return null;
    }
  }

  // --- Timer Data ---

  async saveTimerState(timerState: TimerState): Promise<void> {
    try {
      const jsonValue = JSON.stringify(timerState);
      await AsyncStorage.setItem(TIMER_STATE_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to save timer state.', e);
    }
  }

  async loadTimerState(): Promise<TimerState | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(TIMER_STATE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Failed to load timer state.', e);
      return null;
    }
  }

  // --- Settings Data ---

  async saveDrinkCost(cost: number): Promise<void> {
    try {
      await AsyncStorage.setItem(DRINK_COST_KEY, String(cost));
    } catch (e) {
      console.error('Failed to save drink cost.', e);
    }
  }

  async loadDrinkCost(): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(DRINK_COST_KEY);
      return value != null ? parseFloat(value) : null;
    } catch (e) {
      console.error('Failed to load drink cost.', e);
      return null;
    }
  }

  // --- Onboarding Data ---

  async saveOnboardingCompletion(completed: boolean): Promise<void> {
    try {
      console.log(`[Repository:saveOnboardingCompletion] Saving onboarding completion: ${completed}`);
      await AsyncStorage.setItem(ONBOARDING_COMPLETION_KEY, String(completed));
      console.log(`[Repository:saveOnboardingCompletion] Successfully saved onboarding completion`);
    } catch (e) {
      console.error('Failed to save onboarding completion.', e);
    }
  }

  async loadOnboardingCompletion(): Promise<boolean> {
    try {
      console.log(`[Repository:loadOnboardingCompletion] Loading onboarding completion from key: ${ONBOARDING_COMPLETION_KEY}`);
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETION_KEY);
      const completed = value === 'true';
      console.log(`[Repository:loadOnboardingCompletion] Loaded onboarding completion: ${completed}`);
      return completed;
    } catch (e) {
      console.error('Failed to load onboarding completion.', e);
      return false; // Default to not completed on error
    }
  }
}