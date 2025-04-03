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

const DAY_STATUS_KEY = '@SobrietyApp:dayStatus';
const STREAK_DATA_KEY = '@SobrietyApp:streakData';
const TIMER_STATE_KEY = '@SobrietyApp:timerState';
const DRINK_COST_KEY = '@SobrietyApp:drinkCost';

export class LocalStorageSobrietyRepository
  implements ISobrietyDataRepository
{
  // --- Calendar Data ---

  async loadAllDayStatus(): Promise<DayDataMap> {
    try {
      const jsonValue = await AsyncStorage.getItem(DAY_STATUS_KEY);
      if (jsonValue == null) {
        return {};
      }
      const parsedData = JSON.parse(jsonValue);

      // Backward compatibility check
      const firstKey = Object.keys(parsedData)[0];
      if (firstKey && typeof parsedData[firstKey] === 'boolean') {
        // Old format detected: Convert boolean map to StoredDayData map
        const newMap: DayDataMap = {};
        for (const date in parsedData as OldBooleanDayStatusMap) { // Use locally defined old type
          newMap[date] = {
            sober: parsedData[date],
            streakStartTimestampUTC: null, // Default for old data
          };
        }
        // Optionally re-save in the new format immediately? For now, just return converted.
        // const convertedJsonValue = JSON.stringify(newMap);
        // await AsyncStorage.setItem(DAY_STATUS_KEY, convertedJsonValue);
        console.log('Migrated old day status format to new format.');
        return newMap;
      }

      // Assume new format if not boolean
      return parsedData as DayDataMap;
    } catch (e) {
      console.error('Failed to load day status map.', e);
      // Handle potential JSON parsing errors or other issues
      // Check if the error is due to invalid JSON and potentially clear corrupted data
      if (e instanceof SyntaxError) {
        console.warn('Invalid JSON found in AsyncStorage for DAY_STATUS_KEY. Clearing data.');
        await AsyncStorage.removeItem(DAY_STATUS_KEY);
      }
      return {}; // Return empty map on error
    }
  }

  // Updated to save the full StoredDayData object
  async saveDayStatus(
    date: string,
    isSober: boolean,
    streakStartTimestampUTC: number | null,
  ): Promise<void> {
    try {
      const currentMap = await this.loadAllDayStatus();
      currentMap[date] = { sober: isSober, streakStartTimestampUTC };
      const jsonValue = JSON.stringify(currentMap);
      await AsyncStorage.setItem(DAY_STATUS_KEY, jsonValue);
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
}