# Documentation Map

This file contains documentation headers extracted from component files to provide a quick reference for the codebase structure.

## Repository & Context Files

### CalendarDataContext.tsx
```
/**
 * FILE: context/CalendarDataContext.tsx
 * PURPOSE: Provides shared calendar state (weeks, streaks, loading) and interaction logic via React Context.
 * FUNCTIONS:
 *   - CalendarDataProvider({ children: ReactNode }): JSX.Element -> Context provider managing calendar state.
 *   - useCalendarContext(): CalendarContextProps -> Hook to consume the calendar context.
 *   - scrollToToday(): void -> Function to scroll the calendar grid to the current day.
 * DEPENDENCIES: react, dayjs, @/components/ui/calendar/types, @/lib/types/repositories, @/context/*, @/components/ui/calendar/utils
 */
```

### RepositoryContext.tsx
```
/**
 * FILE: context/RepositoryContext.tsx
 * PURPOSE: Provides a React context for accessing the sobriety data repository instance (LocalStorageSobrietyRepository).
 * FUNCTIONS:
 *   - RepositoryProvider(props: { children: ReactNode }) → JSX.Element: Context provider component.
 *   - useRepository() → ISobrietyDataRepository: Hook to access the repository instance from context.
 * DEPENDENCIES: react, ../lib/types/repositories, ../lib/storage/LocalStorageSobrietyRepository
 */
```

### TimerStateContext.tsx
```
/**
 * FILE: context/TimerStateContext.tsx
 * PURPOSE: Manages global sobriety timer state (start time, running status, elapsed days) via React Context, handling persistence.
 * FUNCTIONS:
 *   - TimerStateProvider({ children: ReactNode }): JSX.Element -> Provides timer state context.
 *   - useTimerState(): TimerStateContextProps -> Hook to consume timer state and controls { startTime, isRunning, elapsedDays, startTimer, stopTimer, isLoading }.
 * DEPENDENCIES: react, ./RepositoryContext, ../lib/types/repositories
 */
```

### LocalStorageSobrietyRepository.ts
```
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
```

### repositories.ts
```
/**
 * FILE: lib/types/repositories.ts
 * PURPOSE: Defines core TypeScript interfaces and types for data structures used in sobriety tracking persistence (StoredDayData, DayDataMap, TimerState, StreakData) and the data repository contract (ISobrietyDataRepository).
 * FUNCTIONS: N/A (Type definitions only)
 * DEPENDENCIES: None
 */
```

## Settings Components

### useFinancialSettings.ts
```
/**
 * FILE: components/ui/settings/hooks/useFinancialSettings.ts
 * PURPOSE: Custom hook to manage financial settings (drink cost), loading/saving via RepositoryContext.
 * FUNCTIONS:
 *   - useFinancialSettings() → { drinkQuantity, setDrinkQuantity, saveSettings, isLoading }: Provides drink cost state and management functions.
 * DEPENDENCIES: react, ../../../../lib/types/repositories, @/context/RepositoryContext
 */
```

## Statistics Components

### StreakCounter.tsx
```
/**
 * FILE: components/ui/statistics/StreakCounter.tsx
 * PURPOSE: Displays the current sobriety streak count with a visual icon.
 * FUNCTIONS:
 *   - StreakCounter({ count: number, className?: string }): JSX.Element -> Renders the streak counter component.
 * DEPENDENCIES: react, react-native, ./StreakIcon
 */
```

### SavingsCounter.tsx
```
/**
 * FILE: components/ui/statistics/SavingsCounter.tsx
 * CREATED: 2025-03-27 14:30:00
 *
 * PURPOSE: Displays the total monetary savings accumulated from sobriety.
 *
 * COMPONENTS:
 * - SavingsCounter(props: SavingsCounterProps) → JSX.Element: Renders the savings display with a money icon and formatted currency.
 *   - props: { amount: string, className?: string }
 */
```

### MoneyIcon.tsx
```
/**
 * FILE: components/ui/statistics/MoneyIcon.tsx
 * CREATED: 2025-03-27 14:30:00
 *
 * PURPOSE: Provides an SVG icon component for money/savings visualization.
 *
 * COMPONENTS:
 * - MoneyIcon(props: MoneyIconProps) → JSX.Element: Renders an SVG money icon with customizable dimensions.
 *   - props: { width?: number, height?: number }
 */
```

### index.ts (statistics)
```
/**
 * FILE: components/ui/statistics/index.ts
 * CREATED: 2025-03-27 14:30:00
 *
 * PURPOSE: Exports statistics-related components for use throughout the application.
 *
 * METHODS:
 * - N/A (export-only file)
 */
```

## Timer Components

### SobrietyTimer.tsx
```
/**
 * FILE: components/ui/timer/SobrietyTimer.tsx
 * PURPOSE: Renders an animated sobriety timer displaying elapsed time (d/h/m/s), using elapsed days from TimerStateContext.
 * FUNCTIONS:
 *   - SobrietyTimer(props: { status?: string }) → JSX.Element: Main timer component with tap interaction to scroll calendar.
 *   - formatUnitValue(value: number) → string: Formats time unit numbers for display.
 *   - calculateElapsedTime(startTime: number | null) → { d: number, h: number, m: number, s: number }: Calculates elapsed time components.
 * DEPENDENCIES: react, react-native, react-native-reanimated, @/context/TimerStateContext, @/context/CalendarDataContext
 */
```

### index.ts (timer)
```
/**
 * FILE: index.ts
 * CREATED: 2024-07-18 16:32:05
 *
 * PURPOSE: Exports the SobrietyTimer component for use throughout the application.
 *
 * METHODS:
 * - N/A (export-only file)
 */
```

## Calendar Components

### CalendarGrid.tsx
```
/**
 * FILE: components/ui/calendar/CalendarGrid.tsx
 * CREATED: 2024-07-18 16:32:05
 * UPDATED: 2025-04-08 11:37:00
 *
 * PURPOSE: Implements a scrollable calendar grid component that displays sobriety tracking data.
 * It utilizes CalendarDataContext for state management, data, and interaction logic including scrolling.
 *
 * COMPONENTS:
 * - CalendarGrid() → JSX.Element: Renders the main calendar grid UI, including the weekday header and the scrollable list of weeks/days.
 *   Exposes calendarRef via context to enable external scrolling functionality.
 *
 * DEPENDENCIES:
 * - CalendarDataContext: Provides calendar state, data, and interaction logic.
 * - DayCell (Component): Renders individual day cells within the grid.
 * - WeekdayHeader (Component): Displays the header row with weekday names.
 */
```

### DayCell.tsx
```
/**
 * FILE: DayCell.tsx
 * CREATED: 2024-07-18 16:32:05
 *
 * PURPOSE: Implements an optimized day cell component for the calendar grid with memoization for performance.
 *
 * METHODS:
 * - DayCell(props: DayCellProps) → JSX.Element: Renders a single day cell with appropriate styling based on sobriety status
 * - handlePress() → void: Handles press events to toggle sobriety status
 */
```

### WeekdayHeader.tsx
```
/**
 * FILE: WeekdayHeader.tsx
 * CREATED: 2024-07-18 16:32:05
 *
 * PURPOSE: Implements a fixed header component displaying weekday abbreviations for the calendar grid.
 *
 * METHODS:
 * - WeekdayHeader() → JSX.Element: Renders a row of weekday abbreviation labels
 */
```

### index.ts (calendar)
```
/**
 * FILE: index.ts
 * CREATED: 2024-07-18 16:32:05
 *
 * PURPOSE: Exports the calendar-related components for use throughout the application.
 *
 * METHODS:
 * - N/A (export-only file)
 */
```

### types.ts
```
/**
 * FILE: components/ui/calendar/types.ts
 * PURPOSE: Defines TypeScript interfaces for calendar data structures (DayData, WeekData, CalendarData).
 * FUNCTIONS: N/A (Type definitions only)
 * DEPENDENCIES: None
 */
```

### utils.ts
```
/**
 * FILE: components/ui/calendar/utils.ts
 * CREATED: 2024-07-18 16:32:05
 * UPDATED: 2025-03-31 14:51:00
 *
 * PURPOSE: Provides utility functions for calendar data generation, styling, and manipulation.
 *
 * METHODS:
 * - getToday() → dayjs.Dayjs: Returns current date with caching for performance
 * - getIntensityColor(intensity: number) → string: Returns style class based on sobriety streak intensity
 * - getTextColorClass(intensity: number) → string: Returns text color class based on intensity
 * - getDayStatus(date: string) → 'today' | 'past' | 'future': Determines if a day is today, past, or future
 * - generateCalendarData() → CalendarData: Creates structured calendar data with random streaks
 * - loadMoreWeeks(existingData: CalendarData, direction: 'past' | 'future', count: number) → CalendarData: Adds additional weeks to existing calendar data with deterministic sobriety status
 * - getMonthName(month: number) → string: Returns the abbreviated month name
 *
 * DEPENDENCIES: dayjs, ./types
 */
```

### useCalendarData.ts
```
/**
 * FILE: components/ui/calendar/hooks/useCalendarData.ts
 * PURPOSE: Custom hook managing calendar state, including data loading, sobriety toggling, streak calculation, and infinite scrolling (past/future weeks). Integrates with RepositoryContext and TimerStateContext.
 * FUNCTIONS:
 *   - useCalendarData() → { weeks, toggleSoberDay, loadPastWeeks, loadFutureWeeks, currentStreak, longestStreak, isLoadingInitial, isLoadingPast, isLoadingFuture }: Provides calendar state and interaction functions.
 *   - generateDeterministicInitialWeeks() → WeekData[]: Creates initial week structure.
 *   - recalculateStreaksAndIntensity(weeks: WeekData[]) → { updatedWeeks, currentStreak, longestStreak, streakStartDayData }: Calculates streaks and day intensity.
 * DEPENDENCIES: react, dayjs, ../types, ../utils, ../../../../lib/types/repositories, @/context/RepositoryContext, @/context/TimerStateContext
 */
```

## App Layout

### _layout.tsx
```
import "../global.css";

import { Slot } from "expo-router";

import { SupabaseProvider } from "@/context/supabase-provider";
import { RepositoryProvider } from "@/context/RepositoryContext"; // Import the new provider
import { TimerStateProvider } from "@/context/TimerStateContext"; // Import TimerStateProvider

export default function AppLayout() {
	return (
		<RepositoryProvider>
			<TimerStateProvider>
				<SupabaseProvider>
					<Slot />
				</SupabaseProvider>
			</TimerStateProvider>
		</RepositoryProvider>
	);
}
```

## Testing

### async-storage.js
```
// __mocks__/@react-native-async-storage/async-storage.js

// Basic mock implementation for AsyncStorage based on Jest documentation
// https://react-native-async-storage.github.io/async-storage/docs/advanced/jest/
```