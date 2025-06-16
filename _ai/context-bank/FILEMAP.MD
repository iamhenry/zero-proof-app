# Documentation Map

This file contains documentation headers extracted from component files to provide a quick reference for the codebase structure.

## Configuration Files

### revenuecat.ts
```
/**
 * FILE: config/revenuecat.ts
 * PURPOSE: RevenueCat SDK configuration and helper functions for in-app purchases
 * FUNCTIONS:
 *   - configureRevenueCat() → void: Initialize RevenueCat SDK with API key
 *   - verifyRevenueCatSetup() → boolean: Verify SDK is properly configured
 *   - identifyUser(userId: string) → void: Associate user with RevenueCat
 *   - getCustomerInfo() → CustomerInfo: Get current user's subscription status
 *   - getOfferings() → Offerings: Get available subscription packages
 *   - makePurchase(packageToPurchase: any) → CustomerInfo: Process a purchase
 *   - restorePurchases() → CustomerInfo: Restore previous purchases
 * DEPENDENCIES: react-native-purchases, react-native Platform
 */
```

### revenuecat-example.ts
```
/**
 * FILE: config/revenuecat-example.ts
 * PURPOSE: Example implementations and patterns for integrating RevenueCat into React Native app components
 * FUNCTIONS:
 *   - initializeRevenueCat() → void: Initialize RevenueCat in app lifecycle
 *   - useSubscriptionStatus() → { isSubscribed: boolean, loading: boolean }: Custom hook for subscription status
 *   - useRevenueCatOfferings() → { packages: PurchasesPackage[], loading: boolean }: Custom hook for available packages
 *   - handlePurchase(packageToPurchase: any) → { success: boolean, customerInfo?: any, error?: any }: Purchase handler with error handling
 *   - handleRestorePurchases() → { success: boolean, customerInfo?: any, error?: any }: Restore purchases handler
 * KEY FEATURES:
 *   - Complete integration examples for subscription management
 *   - Custom React hooks for subscription state and offerings
 *   - Error handling patterns for purchase operations
 *   - Step-by-step integration guide with code examples
 *   - Environment variable configuration guidance
 * DEPENDENCIES: react, react-native-purchases, ./revenuecat
 */
```

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
### SavingsDataContext.tsx
```
/**
 * FILE: context/SavingsDataContext.tsx
 * PURPOSE: Provides context for managing and accessing calculated financial savings data. It interacts with FinancialService to get savings based on sobriety duration and user settings.
 * FUNCTIONS:
 *   - SavingsDataProvider({ children: ReactNode }): JSX.Element -> Context provider managing savings state.
 *   - useSavingsData(): SavingsContextProps -> Hook to consume savings context { totalSavings, isLoading }.
 * KEY FEATURES:
 *   - Fetches financial settings (drink cost) using RepositoryContext.
 *   - Fetches timer state (elapsed days) using TimerStateContext.
 *   - Calculates total savings using FinancialService.
 *   - Provides loading state indication.
 *   - Handles scenarios where settings or timer data might be unavailable.
 * DEPENDENCIES: react, ./RepositoryContext, ./TimerStateContext, ../lib/services/financial-service, ../lib/types/repositories
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

### SubscriptionContext.tsx
```
/**
 * FILE: context/SubscriptionContext.tsx
 * PURPOSE: Centralized subscription state management for tracking active subscription status and 7-day free trial state across the app
 * FUNCTIONS:
 *   - SubscriptionProvider({ children: ReactNode }): JSX.Element -> Context provider managing subscription state
 *   - useSubscription(): SubscriptionContextProps -> Hook to consume subscription context
 *   - checkSubscriptionStatus(): Promise<boolean> -> Verify current subscription status with RevenueCat
 *   - handlePurchaseEvent(customerInfo: any): void -> Process purchase completion events from paywall
 *   - getCachedSubscriptionStatus(): boolean | null -> Get locally cached subscription status
 *   - initializeFreeTrialState(): Promise<void> -> Initialize free trial state from storage
 *   - hasValidFreeTrial(): boolean -> Check if user has an active 7-day free trial
 *   - startFreeTrial(): Promise<void> -> Start a new 7-day free trial period
 * KEY FEATURES:
 *   - Centralized subscription state accessible throughout app
 *   - Tracks active/inactive subscription status
 *   - Manages 7-day free trial state with persistent storage
 *   - Free trial eligibility tracking to prevent multiple trials
 *   - Listens for purchase events from paywall
 *   - Persists subscription state locally with 24-hour cache
 *   - Background sync with RevenueCat for status updates
 *   - Enhanced logging for trial state management
 * DEPENDENCIES: react, AsyncStorage for persistence, react-native-purchases
 */
```

### TimerStateContext.tsx
```
/**
 * FILE: context/TimerStateContext.tsx
 * PURPOSE: Manages global sobriety timer state (start time, running status, elapsed days) via React Context, handling persistence and testing scenarios.
 * FUNCTIONS:
 *   - TimerStateProvider({ children: ReactNode, forceNotSober?: boolean }): JSX.Element -> Provides timer state context with optional test override.
 *   - useTimerState(): TimerStateContextProps -> Hook to consume timer state and controls { startTime, isRunning, elapsedDays, startTimer, stopTimer, isLoading }.
 *   - startTimer(time: number): void -> Starts or restarts the timer with persistence and debug logging.
 *   - stopTimer(): void -> Stops the timer with persistence and debug logging.
 * KEY FEATURES:
 *   - Persistent timer state across app restarts with robust error handling
 *   - Automatic elapsed days calculation from timer start time
 *   - Regular interval updates for elapsed time display with memory leak prevention
 *   - Comprehensive debug logging for state changes and operations
 *   - Loading state management during initial data retrieval
 *   - Clean interval management to prevent memory leaks
 *   - Optimized performance with proper effect dependencies
 *   - Support for testing scenarios with forceNotSober prop
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
### financial-service.ts
```
/**
 * FILE: lib/services/financial-service.ts
 * PURPOSE: Provides functions for calculating financial savings based on sobriety duration and user-defined cost per drink/day.
 * FUNCTIONS:
 *   - calculateTotalSavings(elapsedDays: number, costPerDay: number): number -> Calculates the total savings.
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

### SettingsDrinkQuantityContainer.tsx
```
/**
 * FILE: components/ui/settings/SettingsDrinkQuantityContainer.tsx
 * PURPOSE: Container component for managing drink quantity input in settings screen.
 * FUNCTIONS:
 *   - SettingsDrinkQuantityContainer({ onSuccess, onCancel }: SettingsDrinkQuantityContainerProps): JSX.Element -> Manages drink quantity input in settings context.
 * KEY FEATURES:
 *   - Settings screen integration with success/cancel callbacks
 *   - Local storage persistence through repository
 *   - Current value retrieval and display
 *   - Form validation with React Hook Form integration
 *   - Loading state management during data fetching and saving
 *   - Error handling with user feedback
 *   - Configures DrinkQuantityInput with "Save" button text
 *   - Touchable cancel option for dismissing without saving
 * DEPENDENCIES: react, ../onboarding/DrinkQuantityInput, @/context/RepositoryContext
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
 * PURPOSE: Displays the estimated financial savings accumulated from sobriety, fetching data from SavingsDataContext.
 * FUNCTIONS:
 *   - SavingsCounter({ className?: string }): JSX.Element -> Renders the savings counter, consuming data from SavingsDataContext.
 * KEY FEATURES:
 *   - Consumes totalSavings and isLoading state from SavingsDataContext.
 *   - Displays formatted currency value of savings.
 *   - Shows a loading indicator while data is being fetched.
 *   - Includes a visual money icon.
 *   - Integrates with SavingsCounterModal for drink quantity updates
 *   - Provides touchable interaction to open settings modal
 * DEPENDENCIES: react, react-native, ./MoneyIcon, @/context/SavingsDataContext, @/lib/utils (for formatCurrency), ./SavingsCounterModal
 */
```

### SavingsCounterModal.tsx
```
/**
 * FILE: components/ui/statistics/SavingsCounterModal.tsx
 * PURPOSE: Provides a modal interface for updating drink quantity settings directly from the SavingsCounter component.
 * FUNCTIONS:
 *   - SavingsCounterModal({ visible, onClose, onSuccess }): JSX.Element -> Renders a modal with DrinkQuantityInput for updating drink quantity.
 * KEY FEATURES:
 *   - Integrates with DrinkQuantityInput for consistent form handling
 *   - Manages modal animations and state transitions
 *   - Provides clear success/error callbacks for parent component
 *   - Handles loading and error states during form submission
 *   - Ensures immediate update of savings calculations upon successful submission
 *   - Implements proper cleanup to prevent state updates after unmount
 * DEPENDENCIES: react, react-native, @/components/ui/onboarding/DrinkQuantityInput, @/context/RepositoryContext, @/context/SavingsDataContext
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
 * PURPOSE: Displays an animated sobriety timer (d/h/m/s) using state from TimerStateContext with enhanced calendar navigation.
 * FUNCTIONS:
 *   - SobrietyTimer({ status?: string, forceNotSober?: boolean }): JSX.Element -> Renders the animated timer component with customizable status text and testing support.
 *   - formatUnitValue(value: number): string -> Formats time unit numbers for display.
 *   - calculateElapsedTime(startTime: number | null): { d, h, m, s } -> Calculates time components from a start timestamp.
 * KEY FEATURES:
 *   - Real-time animated display of elapsed sobriety time
 *   - Smooth digit transitions using React Native Reanimated
 *   - Interactive functionality - tapping the timer scrolls calendar to today, with enhanced debugging and error handling
 *   - Integration with TimerStateContext for timer state management and elapsed days tracking
 *   - Integration with CalendarDataContext for robust scrolling functionality
 *   - Comprehensive debug logging for state changes, function availability, and interactions
 *   - Intelligent handling of loading and error states
 *   - Efficient interval-based updates with proper cleanup
 *   - Reliable calendar navigation even when scrolled far into past dates
 *   - Support for testing scenarios with forceNotSober prop
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
 * PURPOSE: Renders a scrollable calendar grid showing weeks with corresponding day cells, integrating with CalendarDataContext.
 * FUNCTIONS:
 *   - CalendarGrid(): JSX.Element -> Main component for rendering the calendar grid.
 *   - handleEndReached(): void -> Loads future weeks when end of list is reached, respects programmatic scrolling state.
 *   - handleScroll(event): void -> Handles scroll events, loads past weeks when near top, respects programmatic scrolling.
 *   - renderDayCell(day, index): JSX.Element -> Renders individual day cells with appropriate styling.
 *   - renderWeek({ item }): JSX.Element -> Renders a week row containing 7 day cells.
 *   - handleScrollToIndexFailed(info): void -> Gracefully handles scroll failures with fallback mechanism.
 * KEY FEATURES:
 *   - Integration with CalendarDataContext for data management
 *   - Infinite scrolling with dynamic past/future week loading
 *   - One-time initial scroll to today for better UX
 *   - Fix for memory leak issues in programmatic scrolling
 *   - Optimized FlatList rendering with fixed height calculations
 *   - Smart ref handling for reliable programmatic scrolling
 *   - Prevention of scroll interference during programmatic scrolling
 *   - Enhanced error handling for scroll failures
 *   - Comprehensive debug logging for ref and scroll state
 * DEPENDENCIES: react, react-native, ./WeekdayHeader, ./DayCell, @/context/CalendarDataContext
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

## Onboarding Components

### OnboardingComponent.tsx
```
/**
 * FILE: components/ui/onboarding/OnboardingComponent.tsx
 * PURPOSE: Implements the main onboarding flow using react-native-onboarding-swiper, managing screen transitions and user progression.
 * FUNCTIONS:
 *   - OnboardingComponent({ onComplete }: OnboardingProps): JSX.Element -> Renders the onboarding flow with multiple screens.
 * KEY FEATURES:
 *   - Multi-screen onboarding flow with swipeable navigation
 *   - Static image display for feature introduction
 *   - Integration with PaywallScreen as final step
 *   - Completion callback handling
 *   - Progress tracking
 *   - Skip functionality disabled
 * DEPENDENCIES: react, react-native-onboarding-swiper, ./PaywallScreen
 */
```

### PaywallScreen.tsx
```
/**
 * FILE: components/ui/onboarding/PaywallScreen.tsx
 * PURPOSE: Implements the paywall screen shown at the end of onboarding, presenting premium features and subscription options with 7-day free trial support.
 * FUNCTIONS:
 *   - PaywallScreen({ onComplete }: PaywallScreenProps): JSX.Element -> Renders the paywall interface with trial management.
 *   - handleStartFreeTrial(): Promise<void> -> Initiates the 7-day free trial period
 *   - handlePurchase(packageId: string): Promise<void> -> Processes subscription purchases
 *   - logPurchaseAttempt(action: string, details: any): void -> Enhanced logging for purchase tracking
 * KEY FEATURES:
 *   - Premium feature showcase
 *   - 7-day free trial with clear messaging and eligibility checking
 *   - Subscription options display with weekly pricing
 *   - Enhanced debugging capabilities with comprehensive logging
 *   - Trial period information with countdown display
 *   - Clear call-to-action buttons for trial vs purchase
 *   - Integration with SubscriptionContext for trial state management
 *   - Integration with onboarding flow
 *   - Error handling for purchase failures
 * DEPENDENCIES: react, react-native, expo-in-app-purchases, @/context/SubscriptionContext
 */
```

### DrinkQuantityInput.tsx
```
/**
 * FILE: components/ui/onboarding/DrinkQuantityInput.tsx
 * PURPOSE: Reusable form component for inputting drink quantity with enhanced accessibility and improved visual hierarchy.
 * FUNCTIONS:
 *   - DrinkQuantityInput({ onSubmit, buttonText, defaultValue }: DrinkQuantityInputProps): JSX.Element -> Renders the drink quantity input form.
 * KEY FEATURES:
 *   - Form handling with React Hook Form
 *   - Zod validation for input values (positive integers only)
 *   - Enhanced accessibility with Text component for semantic labeling
 *   - Improved visual hierarchy with optimized label styling
 *   - Customizable button text ("Save" or "Next" depending on context)
 *   - Support for default/initial values
 *   - Clear error message display
 *   - Number pad input optimization
 *   - Concise, user-friendly labels ("How many drinks per week?")
 *   - Reusable across onboarding and settings contexts
 *   - Screen reader compatibility improvements
 * DEPENDENCIES: react, react-hook-form, zod, react-native
 */
```

### OnboardingDrinkQuantityContainer.tsx
```
/**
 * FILE: components/ui/onboarding/OnboardingDrinkQuantityContainer.tsx
 * PURPOSE: Container component for managing drink quantity input during onboarding.
 * FUNCTIONS:
 *   - OnboardingDrinkQuantityContainer({ onComplete }: OnboardingDrinkQuantityContainerProps): JSX.Element -> Manages drink quantity input in onboarding context.
 * KEY FEATURES:
 *   - Integration with onboarding flow
 *   - Local storage persistence of drink quantity
 *   - Error handling with proper fallbacks
 *   - Robust validation and data saving
 *   - Integration with repository for persistence
 *   - Configures DrinkQuantityInput with "Next" button text
 *   - Comprehensive debug logging
 * DEPENDENCIES: react, ./DrinkQuantityInput, @/context/RepositoryContext
 */
```

### Subscription Management System

#### SubscriptionContext.tsx
```
/**
 * FILE: context/SubscriptionContext.tsx
 * PURPOSE: Provides centralized subscription state management across the application to track active subscription status and enable premium feature access control.
 * FUNCTIONS:
 *   - SubscriptionProvider({ children }: SubscriptionProviderProps): JSX.Element -> Context provider for subscription state management.
 *   - useSubscription(): SubscriptionContextType -> Hook providing access to subscription state and management functions.
 * KEY FEATURES:
 *   - Centralized subscription status tracking
 *   - Active subscription state management
 *   - Premium feature access control
 *   - Subscription state persistence
 *   - Real-time subscription status updates
 *   - Context-based state sharing across components
 * DEPENDENCIES: react, react-native
 */
```

## Toast Notification Components

### ToastProvider.tsx
```
/**
 * FILE: components/ui/toast/ToastProvider.tsx
 * PURPOSE: React Context provider for centralized toast notification state management across the application
 * FUNCTIONS:
 *   - ToastProvider({ children: ReactNode }): JSX.Element -> Context provider managing toast notification state
 *   - useToast(): ToastContextProps -> Hook to consume toast context and show notifications
 *   - showToast(message: string, type?: 'success' | 'error' | 'info'): void -> Display toast notification with optional type
 * KEY FEATURES:
 *   - Centralized notification state management
 *   - Support for different notification types (success, error, info)
 *   - Automatic notification dismissal with configurable duration
 *   - Queue management for multiple simultaneous notifications
 * DEPENDENCIES: react, Context API for state management
 */
```

### ToastContainer.tsx
```
/**
 * FILE: components/ui/toast/ToastContainer.tsx
 * PURPOSE: UI component for displaying and managing toast notifications with automatic dismissal and visual styling
 * FUNCTIONS:
 *   - ToastContainer(): JSX.Element -> Renders active toast notifications with proper styling and animations
 * KEY FEATURES:
 *   - Visual representation of toast notifications
 *   - Automatic dismissal timer management
 *   - Type-based styling (success, error, info)
 *   - Non-intrusive overlay positioning
 *   - Animation support for show/hide transitions
 * DEPENDENCIES: react, toast context, React Native styling components
 */
```