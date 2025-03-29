# Documentation Map

This file contains documentation headers extracted from component files to provide a quick reference for the codebase structure.

## Statistics Components

### StreakCounter.tsx
```
/**
 * FILE: components/ui/statistics/StreakCounter.tsx
 * CREATED: 2025-03-27 14:30:00
 *
 * PURPOSE:
 * This file implements a streak counter component that displays the current sobriety streak count.
 *
 * COMPONENTS:
 * - StreakCounter(props: StreakCounterProps): Renders the streak display with a streak icon.
 *   - props: { count: number, className?: string }
 */
```

### SavingsCounter.tsx
```
/**
 * FILE: components/ui/statistics/SavingsCounter.tsx
 * CREATED: 2025-03-27 14:30:00
 *
 * PURPOSE:
 * This file implements a savings counter component that displays the total monetary savings from sobriety.
 *
 * COMPONENTS:
 * - SavingsCounter(props: SavingsCounterProps): Renders the savings display with a money icon.
 *   - props: { amount: string, className?: string }
 */
```

### MoneyIcon.tsx
```
/**
 * FILE: components/ui/statistics/MoneyIcon.tsx
 * CREATED: 2025-03-27 14:30:00
 *
 * PURPOSE:
 * This file implements an SVG icon component for money/savings visualization.
 *
 * COMPONENTS:
 * - MoneyIcon(props: MoneyIconProps): Renders an SVG money icon.
 *   - props: { width?: number, height?: number }
 */
```

### index.ts (statistics)
```
/**
 * FILE: components/ui/statistics/index.ts
 * CREATED: 2025-03-27 14:30:00
 *
 * PURPOSE:
 * This file exports statistics-related components for use throughout the application.
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
 * PURPOSE:
 * This file implements an animated sobriety timer component that displays elapsed days, hours, minutes, and seconds in a sober state.
 *
 * METHODS:
 * - SobrietyTimer(): Renders a timer with customizable initial values and animated seconds display
 * - formatUnitValue(): Formats numeric values for consistent display
 */
```

### index.ts (timer)
```
/**
 * FILE: index.ts
 * CREATED: 2024-07-18 16:32:05
 *
 * PURPOSE:
 * This file exports the SobrietyTimer component for use throughout the application.
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
 * UPDATED: 2025-03-29 13:21:00
 *
 * PURPOSE:
 * This file implements a scrollable calendar grid component that displays sobriety tracking data.
 * It utilizes the `useCalendarData` hook for state management and data fetching logic.
 *
 * COMPONENTS:
 * - CalendarGrid(): Renders the main calendar grid UI, including the weekday header and the scrollable list of weeks/days. Relies on `useCalendarData` for data and actions.
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
 * PURPOSE:
 * This file implements an optimized day cell component for the calendar grid with memoization for performance.
 *
 * METHODS:
 * - DayCell(): Renders a single day cell with appropriate styling based on sobriety status
 * - handlePress(): Handles press events to toggle sobriety status
 */
```

### WeekdayHeader.tsx
```
/**
 * FILE: WeekdayHeader.tsx
 * CREATED: 2024-07-18 16:32:05
 *
 * PURPOSE:
 * This file implements a fixed header component displaying weekday abbreviations for the calendar grid.
 *
 * METHODS:
 * - WeekdayHeader(): Renders a row of weekday abbreviation labels
 */
```

### index.ts (calendar)
```
/**
 * FILE: index.ts
 * CREATED: 2024-07-18 16:32:05
 *
 * PURPOSE:
 * This file exports the calendar-related components for use throughout the application.
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
 * PURPOSE:
 * This file defines TypeScript interfaces for calendar data structures used throughout the calendar components.
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
```

### useCalendarData.ts
```
/**
 * FILE: components/ui/calendar/hooks/useCalendarData.ts
 * CREATED: 2025-03-29 13:21:00
 *
 * PURPOSE:
 * This file implements a custom React hook (`useCalendarData`) to manage the state and logic for the calendar component.
 * It handles fetching calendar data, managing the current view (month/year), selected date, and loading past/future weeks.
 *
 * HOOKS:
 * - useCalendarData(): Provides calendar state (weeks, currentMonthLabel, selectedDate) and actions (setSelectedDate, loadPastWeeks, loadFutureWeeks).
 *   - Returns: { weeks: CalendarWeek[], currentMonthLabel: string, selectedDate: Dayjs | null, setSelectedDate: (date: Dayjs | null) => void, loadPastWeeks: () => void, loadFutureWeeks: () => void, isLoadingPast: boolean, isLoadingFuture: boolean }
 */