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
 *   - toggleSoberDay(date: string): Promise<void> -> Toggles sobriety status for a day with conditional timer effects.
 *   - recalculateStreaksAndIntensity(): { updatedWeeks, currentStreak, longestStreak, streakStartDayData } -> Recalculates streak data with data integrity checks.
 * KEY FEATURES:
 *   - Dynamic calendar data generation and loading
 *   - Persistent storage of sobriety status
 *   - Optimized streak calculation with proper streak intensity visualization
 *   - Intelligent timer state management based on calendar interactions
 *   - Infinite scrolling with dynamic past/future week loading
 *   - Reference to the calendar FlatList for programmatic scrolling
 *   - Comprehensive debug logging
 *   - Error handling with graceful fallbacks
 * DEPENDENCIES: react, dayjs, @/components/ui/calendar/types, @/lib/types/repositories, @/context/RepositoryContext, @/context/TimerStateContext, @/components/ui/calendar/utils
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
 *   - startTimer(time: number): void -> Starts or restarts the timer with persistence.
 *   - stopTimer(): void -> Stops the timer with persistence.
 *   - calculateDays(): void -> Calculates elapsed days since timer start.
 * KEY FEATURES:
 *   - Persistent timer state across app restarts
 *   - Automatic elapsed days calculation from timer start time
 *   - Regular interval updates for elapsed time display
 *   - Comprehensive debug logging
 *   - Loading state management during initial data retrieval
 *   - Clean interval management to prevent memory leaks
 *   - Optimized performance with proper effect dependencies
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
 *   - StreakCounter({ count: number, className?: string }): JSX.Element -> Renders the streak counter component with customizable styling.
 * KEY FEATURES:
 *   - Visual representation of the current sobriety streak count
 *   - Integration with TimerStateContext for accurate day counting
 *   - Responsive styling with customizable appearance via className prop
 *   - Enhanced debug logging for state change tracking
 *   - Optimized rendering with consistent visual design
 *   - Accessible text display with proper contrast and sizing
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
 * PURPOSE: Displays an animated sobriety timer (d/h/m/s) using state from TimerStateContext.
 * FUNCTIONS:
 *   - SobrietyTimer({ status?: string }): JSX.Element -> Renders the animated timer component with customizable status text.
 *   - formatUnitValue(value: number): string -> Formats time unit numbers for display.
 *   - calculateElapsedTime(startTime: number | null): { d, h, m, s } -> Calculates time components from a start timestamp.
 * KEY FEATURES:
 *   - Real-time animated display of elapsed sobriety time
 *   - Smooth digit transitions using React Native Reanimated
 *   - Interactive functionality - tapping the timer scrolls calendar to today
 *   - Integration with TimerStateContext for timer state management
 *   - Integration with CalendarDataContext for scrolling functionality
 *   - Intelligent handling of loading states
 *   - Efficient interval-based updates
 *   - Debug logging for state change tracking
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
 * FILE: components/ui/calendar/DayCell.tsx
 * PURPOSE: Renders an optimized, memoized, interactive day cell for the calendar grid.
 * FUNCTIONS:
 *   - DayCell({ day: DayData, onToggleSober?: (dayId: string) => void }): JSX.Element -> Renders a single day cell, optimized with React.memo.
 *   - handlePress(): void -> Handles press events on a day cell to toggle sobriety status with debug logging.
 * KEY FEATURES:
 *   - High-performance rendering with aggressive memoization strategies
 *   - Custom React.memo equality function to prevent unnecessary re-renders
 *   - Intelligent CSS class computation based on sobriety status and streak intensity
 *   - Enhanced debug logging for state change tracing
 *   - Special display handling for first day of month
 *   - Responsive visual feedback with proper color intensity representation
 * DEPENDENCIES: react, react-native, @/components/ui/text, ./types, ./utils
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
 * UPDATED: 2025-04-09 10:57:00
 *
 * PURPOSE: Provides utility functions for calendar data generation, styling, and manipulation.
 *
 * METHODS:
 * - generateCalendarData(startDate: Date, numWeeks: number): CalendarData → Generates calendar data for the specified date range
 * - getWeekNumber(date: Date): number → Returns the ISO week number for a given date
 * - isSameDay(a: Date, b: Date): boolean → Checks if two dates are the same day
 * - formatDay(date: Date): string → Formats a date to a display-friendly day format
 * - getDayIntensity(streak: number): number → Calculates the color intensity from 0-4 based on streak length
 * - recalculateStreaksAndIntensity(days: DayData[]): DayData[] → Updates streak lengths and color intensities for a sequence of days
 * - loadMoreWeeks(calendarData: CalendarData, direction: 'past' | 'future', weeks: number): CalendarData → Deterministically expands calendar data in past or future direction 
 */
```

### useCalendarData.ts
```
/**
 * FILE: components/ui/calendar/hooks/useCalendarData.ts
 * PURPOSE: Custom hook providing calendar data management functionality (now mostly moved to CalendarDataContext).
 * FUNCTIONS:
 *   - useCalendarData(): CalendarDataReturnType -> Hook providing calendar data and operations.
 * DEPENDENCIES: react, dayjs, ../../../../lib/types/repositories, @/context/RepositoryContext, ../types, ../utils
 */
```

## Main App Screens

### index.tsx (Home Screen)
```
/**
 * FILE: app/(app)/(protected)/index.tsx
 * PURPOSE: Renders the main home screen for authenticated users, displaying sobriety statistics and the calendar.
 * FUNCTIONS:
 *   - Home(): JSX.Element -> Renders the main screen layout with sobriety timer, streak counter, savings counter and calendar grid.
 *   - logStoredData(): Promise<void> -> Debug utility that logs stored day status and streak data on component mount.
 * KEY FEATURES:
 *   - Automatic scroll to current day when calendar data finishes loading
 *   - Integration with TimerStateContext to display elapsed days in streak counter
 *   - Integration with CalendarDataContext for calendar data and scrolling functionality
 *   - Diagnostic logging for persistent data debugging
 * DEPENDENCIES: react, react-native, @/components/ui/calendar, @/components/ui/timer, @/components/ui/statistics, @/context/TimerStateContext, @/context/RepositoryContext, @/context/CalendarDataContext
 */
```