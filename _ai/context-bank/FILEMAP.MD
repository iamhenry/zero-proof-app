# Documentation Map

This file contains documentation headers extracted from component files to provide a quick reference for the codebase structure.

## Statistics Components

### StreakCounter.tsx
```
/**
 * FILE: components/ui/statistics/StreakCounter.tsx
 * CREATED: 2025-03-27 14:30:00
 *
 * PURPOSE: Displays the current sobriety streak count with a streak icon.
 *
 * COMPONENTS:
 * - StreakCounter(props: StreakCounterProps) → JSX.Element: Renders the streak display with current and best streak metrics.
 *   - props: { count: number, className?: string }
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
 * FILE: SobrietyTimer.tsx
 * CREATED: 2024-07-18 16:32:05
 *
 * PURPOSE: Implements an animated sobriety timer component that displays elapsed days, hours, minutes, and seconds in a sober state.
 *
 * METHODS:
 * - SobrietyTimer() → JSX.Element: Renders a timer with customizable initial values and animated seconds display
 * - formatUnitValue(value: number) → string: Formats numeric values with leading zeros for consistent display
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
 * UPDATED: 2025-03-31 13:18:00
 *
 * PURPOSE: Implements a scrollable calendar grid component that displays sobriety tracking data.
 * It utilizes the `useCalendarData` hook for state management and data fetching logic.
 *
 * COMPONENTS:
 * - CalendarGrid() → JSX.Element: Renders the main calendar grid UI, including the weekday header and the scrollable list of weeks/days. Relies on `useCalendarData` for data and actions.
 *
 * DEPENDENCIES:
 * - useCalendarData (Hook): Provides calendar state, data, and interaction logic.
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
 * FILE: types.ts
 * CREATED: 2024-07-18 16:32:05
 *
 * PURPOSE: Defines TypeScript interfaces for calendar data structures used throughout the calendar components.
 *
 * METHODS:
 * - N/A (type definitions only)
 */
```

### utils.ts
```
/**
 * FILE: utils.ts
 * CREATED: 2024-07-18 16:32:05
 * UPDATED: 2025-03-31 13:18:00
 *
 * PURPOSE: Provides utility functions for calendar data generation, styling, and manipulation.
 *
 * METHODS:
 * - getToday() → dayjs.Dayjs: Returns current date with caching for performance
 * - getIntensityColor(intensity: number) → string: Returns style class based on sobriety streak intensity
 * - getTextColorClass(intensity: number) → string: Returns text color class based on intensity
 * - getDayStatus(date: string) → 'today' | 'past' | 'future': Determines if a day is today, past, or future
 * - generateCalendarData() → CalendarData: Creates structured calendar data with random streaks
 * - loadMoreWeeks(existingData: CalendarData, direction: 'past' | 'future', count: number) → CalendarData: Adds additional weeks to existing calendar data
 */
```

### useCalendarData.ts
```
/**
 * FILE: components/ui/calendar/hooks/useCalendarData.ts
 * CREATED: 2025-03-29 13:21:00
 * UPDATED: 2025-03-31 13:18:00
 *
 * PURPOSE: Manages state and logic for the calendar, including data generation, sobriety tracking, streak calculation, and week loading.
 *
 * HOOKS:
 * - useCalendarData() → { weeks: WeekData[], toggleSoberDay: (dayId: string) => void, loadPastWeeks: () => void, loadFutureWeeks: () => void, currentStreak: number, longestStreak: number, isLoadingInitial: boolean, isLoadingPast: boolean, isLoadingFuture: boolean }: Provides calendar state and interaction logic.
 * 
 * FUNCTIONS:
 * - generateDeterministicInitialWeeks() → WeekData[]: Creates the initial visible weeks.
 * - recalculateStreaksAndIntensity(weeks: WeekData[]) → { updatedWeeks: WeekData[], currentStreak: number, longestStreak: number }: Processes weeks to update day intensity and calculate streaks.
 * 
 * DEPENDENCIES: react, dayjs, ../types
 */