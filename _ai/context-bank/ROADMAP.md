# Development Roadmap

## Overview
This roadmap outlines the development plan for the Zero Proof sobriety tracking app, broken down into clear milestones and phases. Each task includes a complexity rating (1-5, where 5 is most complex).

## Phase 1: Static UI Development
Focus on building the core UI components without functionality.

### Milestone 1: Basic App Structure
Objective: Create the foundational structure of the application with basic routing.

Data Flow: 
- User authentication data flows through the Supabase provider
- Basic navigation structure with protected and public routes

Acceptance Criteria:
- Project is set up with Expo and required dependencies
- Navigation structure is implemented using Expo Router
- Placeholder screens for main features are created

Step-by-Step Tasks:
- [x] 1. Set up project with Expo and required dependencies 
  - File: `package.json`
  - [x] 1.1. Initialize Expo project using Expo CLI with TypeScript template
  - [x] 1.2. Install navigation dependencies including Expo Router and related packages
  - [x] 1.3. Set up TypeScript configuration with proper type definitions
    - File: `tsconfig.json`
- [x] 2. Implement basic navigation structure using Expo Router 
  - [x] 2.1. Create root layout component with Supabase provider wrapper
    - File: `app/_layout.tsx`
  - [x] 2.2. Set up authentication flow layouts with public and protected routes
    - File: `app/(app)/_layout.tsx`
  - [x] 2.3. Configure protected and public routes with proper redirects
    - File: `app/(app)/(protected)/_layout.tsx`
    - File: `context/supabase-provider.tsx`
- [x] 3. Create placeholder screens for main features
  - [x] 3.1. Implement Home screen with basic calendar UI placeholder
    - File: `app/(app)/(protected)/index.tsx`
  - [x] 3.2. Implement Authentication screens with form layouts
    - File: `app/(app)/sign-in.tsx`
    - File: `app/(app)/sign-up.tsx`
    - File: `app/(app)/welcome.tsx`

### Milestone 2: Core UI Components
Objective: Design and implement the essential UI components that form the core of the user experience.

Data Flow:
- Calendar data is managed within the CalendarGrid component (now via useCalendarData hook)
- Statistics data is displayed through component-specific props
- Settings data is managed through form components

Acceptance Criteria:
- Calendar activity grid component is implemented and functional
- Statistics display components are implemented
- Settings interface components are created

Step-by-Step Tasks:
- [x] 4. Design and implement calendar activity grid component 
  - [x] 4.1. Create grid layout structure with month/week organization
    - File: `components/ui/calendar/CalendarGrid.tsx`
  - [x] 4.2. Implement day tile components with proper styling
    - File: `components/ui/calendar/DayCell.tsx`
  - [x] 4.3. Add color intensity system for different sobriety states
    - File: `components/ui/calendar/utils.ts`
  - [x] 4.4. Build scrollable container with proper performance handling
    - File: `components/ui/calendar/WeekdayHeader.tsx`
    - File: `components/ui/calendar/types.ts`
- [x] 5. Create statistics display components 
  - [x] 5.1. Implement streak counter component with current and best streak metrics
    - File: `components/ui/statistics/StreakCounter.tsx`
  - [x] 5.2. Create financial savings component that shows money saved based on drink costs
    - File: `components/ui/statistics/SavingsCounter.tsx`
  - [x] 5.3. Create timer display showing days/hours/minutes since last drink
    - File: `components/ui/timer/SobrietyTimer.tsx`


## Phase 2: Frontend Implementation
Add functionality to the static UI components.

### Milestone 3: State Management & Data Handling
Objective: Implement data management solutions for the application.

Data Flow:
- Form data flows through React Hook Form with Zod validation
- User data persists through local storage
- Settings data is stored for offline access
- Calendar and streak data managed through shared context (CalendarDataContext)

Acceptance Criteria:
- Form handling is implemented with React Hook Form and Zod
- Local storage architecture is set up for offline functionality
- Data persistence logic is implemented
- Shared state management is implemented for calendar and timer data

Step-by-Step Tasks:
- [x] 7. Implement form handling with React Hook Form and Zod 
  - [x] 7.1. Set up user registration form with email/password validation
    - File: `app/(app)/sign-up.tsx`
  - [x] 7.2. Implement login form with error handling and validation
    - File: `app/(app)/sign-in.tsx`
  - [x] 7.3. Create reusable form components for all settings inputs
    - File: `components/ui/form.tsx`
- [x] 8. Set up local storage architecture 
  - [x] 8.1. Configure AsyncStorage for storing non-sensitive user preferences
    - File: `lib/storage/LocalStorageSobrietyRepository.ts`
  - [x] 8.2. Implement secure storage for auth tokens and sensitive user data
    - File: `lib/types/repositories.ts`
  - [x] 8.3. Create data persistence logic with proper error handling and fallbacks
    - File: `context/RepositoryContext.tsx`, `context/TimerStateContext.tsx`
  - [x] 8.4. Implement mock AsyncStorage for testing
    - File: `__mocks__/@react-native-async-storage/async-storage.js`
  - [x] 8.5. Create shared context for calendar data management
    - File: `context/CalendarDataContext.tsx` 
  - [x] 8.6. Enhance TimerStateContext with elapsedDays calculation 
    - File: `context/TimerStateContext.tsx`
  
#### Enhancements
- [x] 8.7. Address `useCalendarData` Hook Refinements (Post-Review)
  - [x] 8.7.1. Optimize `recalculateStreaksAndIntensity` for performance: Avoid recalculating the entire dataset on every `toggleSoberDay` call to prevent slowdowns with more loaded data (addresses BUG-01 performance aspect).
    - File: `components/ui/calendar/hooks/useCalendarData.ts`, `context/CalendarDataContext.tsx`
  - [x] 8.7.2. Fix data loading inconsistency: Remove `Math.random()` from `loadMoreWeeks` in `utils.ts` and implement loading logic in `useCalendarData` hook consistently with its deterministic streak calculation (critical for BUG-01 functionality).
    - File: `components/ui/calendar/utils.ts`, `components/ui/calendar/hooks/useCalendarData.ts`
  - [x] 8.7.3. Add missing tests for data generation/loading: Ensure `generateCalendarData` and `loadMoreWeeks` (once fixed) are tested, along with the hook's loading functions.
    - File: `components/ui/calendar/__tests__/utils.test.ts`, `components/ui/calendar/hooks/__tests__/useCalendarData.test.tsx`
  - [x] 8.7.4. Add BDD scenarios for StreakCounter to define expected behavior
    - File: `_ai/scenarios/bdd-streak-counter.md`
  - [x] 8.7.5. Create tests for StreakCounter component
    - File: `components/ui/statistics/__tests__/StreakCounter.test.tsx`

### Bugs
- [x] BUG-03. Resolve display discrepancy between StreakCounter (calendar days) and SobrietyTimer (elapsed time)
  - [x] BUG-03.1. As a user, I want the definition of a "day" used for the streak count to be consistent with the elapsed time timer.
    - Resolution: Added elapsedDays calculation to TimerStateContext and used it in the StreakCounter, ensuring both components use the same definition of days.
    - File: `context/TimerStateContext.tsx`, `components/ui/statistics/StreakCounter.tsx`

<!-- FIXED -->
- [x] BUG-01. Implement dynamic and performant loading of past and future dates
  - [x] BUG-01.1. As a user, I want to be able to view past and future dates dynamically without performance issues.
- [x] BUG-02. Disable toggle sober day for future dates; only present and past are supported
  - [x] BUG-02.1. As a user, I want to be able to toggle sober days only for present and past dates, ensuring future dates are not editable.

### Milestone 4: Core Feature Implementation
Objective: Develop the main functionality of the application including calendar interaction, timer, and financial tracking.

Data Flow:
- Calendar interaction updates local state and storage (managed via CalendarDataContext)
- Timer data persists across app sessions
- Financial data calculations flow through dedicated services

Acceptance Criteria:
- Calendar interaction logic is fully implemented
- Sobriety timer is functional with real-time updates
- Financial tracking system is implemented

Step-by-Step Tasks:
- [x] 9. Develop calendar interaction logic 
  - [x] 9.1. Implement day status toggling between sober/drinking states
    - File: `components/ui/calendar/CalendarGrid.tsx`, `context/CalendarDataContext.tsx`
  - [x] 9.2. Add streak calculation that updates with calendar changes
    - File: `context/CalendarDataContext.tsx`
  - [x] 9.3. Implement color intensity updates based on streak length
    - File: `components/ui/calendar/DayCell.tsx`, `context/CalendarDataContext.tsx`
  - [x] 9.4. Create continuous scroll behavior (past/future week loading)
    - File: `context/CalendarDataContext.tsx`
  - [x] 9.5 Create useCalendarData hook for state management and data loading (functionality now moved to CalendarDataContext)
    - File: `components/ui/calendar/hooks/useCalendarData.ts`, `context/CalendarDataContext.tsx`
  - [x] 9.6 Create BDD scenarios for useCalendarData hook
    - File: `_ai/scenarios/bdd-useCalendarData-CalendarGrid.md`
  - [x] 9.7 Create BDD scenarios for StreakCounter component
    - File: `_ai/scenarios/bdd-streak-counter.md`
- [x] 10. Create sobriety timer functionality 
  - [x] 10.1. Implement real-time timer updates that tick every second
    - File: `components/ui/timer/SobrietyTimer.tsx`
  - [-] 10.2. ~~Add background processing to keep timer running when app is closed~~ (Decision: Won't Implement)
    - Rationale: Current persistence method (saving start time, calculating elapsed on open) is sufficient, simpler, battery-efficient, and meets the core requirement of showing total time sober. Background processing adds unnecessary complexity.
    - File: `lib/services/timer-service.ts` (will not be created)
  - [x] 10.3. Create timer persistence that survives app restarts
    - File: `context/TimerStateContext.tsx`, `lib/storage/LocalStorageSobrietyRepository.ts`
  - [x] 10.4. Add elapsedDays calculation to TimerStateContext
    - File: `context/TimerStateContext.tsx`
- [ ] 11. Implement financial tracking system 
  - [x] 11.1. Create savings calculator based on days sober × drink cost
    - File: `components/ui/settings/hooks/useFinancialSettings.ts`
  - [ ] 11.2. Implement drink cost management with different drink types and prices
    - File: `app/(app)/(protected)/settings.tsx` (to be expanded)
    - Branch Name: `feat/settings-drink-cost-management`
  - [ ] 11.3. Add statistics aggregation to show total and average savings
    - File: `lib/services/statistics-service.ts` (to be created)
    - Branch Name: `feat/stats-savings-aggregation`

### Milestone 5: Progress Tracking Features
Objective: Build features to track and visualize user progress over time.

Data Flow:
- Streak data flows through dedicated streak service
- Drink logging updates statistics and calendar view
- Progress data is processed for sharing functionality

Acceptance Criteria:
- Streak management system is implemented
- Drink logging system is functional
- Progress sharing feature is implemented

Step-by-Step Tasks:
- [ ] 12. Build streak management system 
  - [ ] 12.1. Implement current streak counter with daily updates
    - File: `lib/services/streak-service.ts` (to be created)
    - Branch Name: `feat/streak-daily-updates`
  - [ ] 12.2. Add longest streak recording that persists across resets
    - File: `lib/services/streak-service.ts` (to be created)
    - Branch Name: `feat/streak-longest-persistent`
  - [ ] 12.3. Create streak reset handling with optional notes for relapse
    - File: `lib/services/streak-service.ts` (to be created)
    - Branch Name: `feat/streak-reset-handling`
- [ ] 13. Develop drink logging system 
  - [ ] 13.1. Create daily drink counter with type and amount tracking
    - File: `components/ui/drink-log/DrinkCounter.tsx` (to be created)
    - Branch Name: `feat/drink-log-daily-counter`
  - [ ] 13.2. Implement consumption pattern tracking to identify trends
    - File: `lib/services/analytics-service.ts` (to be created)
    - Branch Name: `feat/analytics-consumption-patterns`
  - [ ] 13.3. Add entry correction/undo functionality to fix mistakes
    - File: `components/ui/drink-log/LogEditor.tsx` (to be created)
    - File: `lib/services/drink-log-service.ts` (to be created)
    - Branch Name: `feat/drink-log-correction-undo`
- [ ] 14. Create progress sharing feature 
  - [ ] 14.1. Implement calendar graphics generator for social media sharing
    - File: `lib/services/share-service.ts` (to be created)
    - Branch Name: `feat/share-calendar-graphics`
  - [ ] 14.2. Add share functionality with customizable messages and privacy options
    - File: `components/ui/share/ShareButton.tsx` (to be created)
    - File: `components/ui/share/ShareModal.tsx` (to be created)
    - Branch Name: `feat/share-customizable-messages`

## Phase 3: Backend Integration
Connect frontend with Supabase backend services.

### Milestone 6: Authentication & Database
Objective: Set up and integrate Supabase backend services for authentication and data storage.

Data Flow:
- Authentication data flows through Supabase Auth services
- User data is stored in Supabase database tables
- App configuration connects to Supabase backend

Acceptance Criteria:
- Supabase project is configured
- Authentication flow is fully implemented
- Database schema and tables are created

Step-by-Step Tasks:
- [ ] 15. Set up Supabase project configuration 
  - [ ] 15.1. Create Supabase project with proper region and settings
    - File: `config/supabase.ts` (partially implemented)
    - Branch Name: `chore/config-supabase-project-setup`
  - [ ] 15.2. Configure database rules and policies for secure data access
    - File: `config/supabase.ts` (to be expanded)
    - Branch Name: `chore/config-supabase-db-rules`
  - [ ] 15.3. Set up environment variables for API keys and URLs
    - File: `.env` (to be expanded)
    - Branch Name: `chore/config-env-vars`
- [x] 16. Implement authentication flow 
  - [x] 16.1. Create user registration with email verification
    - File: `context/supabase-provider.tsx`
  - [x] 16.2. Implement login/logout functionality with session handling
    - File: `context/supabase-provider.tsx`
  - [x] 16.3. Add password reset with email verification flow
    - File: `context/supabase-provider.tsx`
  - [x] 16.4. Set up session management with token refresh
    - File: `context/supabase-provider.tsx`
- [ ] 17. Create database schema and tables 
  - [ ] 17.1. Design user profiles table with necessary fields
    - File: `lib/types/user-profile.ts` (to be created)
    - Branch Name: `feat/db-schema-user-profiles`
  - [ ] 17.2. Create sobriety records table with date and status fields
    - File: `lib/types/sobriety-record.ts` (to be created)
    - Branch Name: `feat/db-schema-sobriety-records`
  - [ ] 17.3. Implement streak data table for tracking current and historical streaks
    - File: `lib/types/streak-data.ts` (to be created)
    - Branch Name: `feat/db-schema-streak-data`
  - [ ] 17.4. Design financial tracking table with drink costs and savings
    - File: `lib/types/financial-data.ts` (to be created)
    - Branch Name: `feat/db-schema-financial-data`

### Milestone 7: Data Synchronization
Objective: Implement robust data synchronization between local storage and Supabase backend.

Data Flow:
- Local data syncs with server through sync service
- Real-time data flows through Supabase subscriptions
- Offline changes queue for future synchronization

Acceptance Criteria:
- Data sync system is implemented with offline support
- Real-time subscriptions are set up for live updates
- Multi-device support is functional

Step-by-Step Tasks:
- [ ] 18. Implement data sync system 
  - [ ] 18.1. Create bidirectional sync between local storage and Supabase
    - File: `lib/services/sync-service.ts` (to be created)
    - Branch Name: `feat/sync-bidirectional-local-supabase`
  - [ ] 18.2. Implement conflict resolution with timestamp-based strategy
    - File: `lib/services/conflict-resolution.ts` (to be created)
    - Branch Name: `feat/sync-conflict-resolution`
  - [ ] 18.3. Add offline support with change queue and retry mechanism
    - File: `lib/hooks/useOfflineStatus.ts` (to be created)
    - Branch Name: `feat/sync-offline-queue`
- [ ] 19. Set up real-time subscriptions 
  - [ ] 19.1. Implement live updates for streak changes across devices
    - File: `lib/services/subscription-service.ts` (to be created)
    - Branch Name: `feat/sync-realtime-streaks`
  - [ ] 19.2. Add timer synchronization to ensure consistent timing
    - File: `lib/services/subscription-service.ts` (to be created)
    - Branch Name: `feat/sync-realtime-timer`
  - [ ] 19.3. Create multi-device support with data merging
    - File: `lib/services/subscription-service.ts` (to be created)
    - Branch Name: `feat/sync-realtime-multi-device`

### Milestone 8: End-to-End Testing
Objective: Implement E2E tests for critical user flows to ensure integrated functionality.

Data Flow:
- Test runner executes user scenarios against the application build.
- Test results indicate pass/fail for integrated flows.

Acceptance Criteria:
- E2E testing framework (e.g., Maestro) is selected and configured.
- Critical user flows (Auth, Core Sobriety Loop, Settings Persistence, Data Sync) have passing E2E tests.
- E2E tests are integrated into the CI pipeline.

Step-by-Step Tasks:
- [ ] 20. Select and configure E2E testing framework
    - Branch Name: `chore/test-e2e-setup`
- [ ] 21. Implement E2E tests for Authentication flow (Sign up, Sign in, Sign out, Persistence)
    - Branch Name: `test/e2e-auth-flow`
- [ ] 22. Implement E2E tests for Core Sobriety Loop (Calendar interaction, Timer updates, Streak updates, Local Persistence)
    - Branch Name: `test/e2e-core-sobriety-loop`
- [ ] 23. Implement E2E tests for Settings Persistence (Update drink cost, verify savings calculation)
    - Branch Name: `test/e2e-settings-persistence`
- [ ] 24. Implement E2E tests for Data Synchronization (Verify local/backend sync, including offline)
    - Branch Name: `test/e2e-data-sync`
- [ ] 25. Integrate E2E tests into CI pipeline
    - Branch Name: `ci/integrate-e2e-tests`

## Phase 4: UI Polish & Optimization
Enhance user experience with animations and optimizations.

### Milestone 9: Visual Enhancements
Objective: Add visual polish and animations to improve user experience.

Data Flow:
- Animation triggers flow through component state changes
- Loading state data flows through dedicated loading components
- Error data is handled through error components

Acceptance Criteria:
- Animations and transitions are implemented throughout the app
- Loading states and error handling are implemented
- UI is visually polished and consistent

Step-by-Step Tasks:
- [ ] 26. Add animations and transitions
  - [ ] 26.1. Implement smooth animations for calendar day selections
    - File: `components/ui/calendar/CalendarGrid.tsx` (to be expanded)
    - Branch Name: `feat/ui-calendar-animations`
  - [ ] 26.2. Add celebration animations when reaching streak milestones
    - File: `lib/animations/index.ts` (to be created)
    - Branch Name: `feat/ui-streak-celebration-animations`
  - [ ] 26.3. Create smooth timer countdown animations
    - File: `components/ui/timer/SobrietyTimer.tsx` (to be expanded)
    - Branch Name: `feat/ui-timer-animations`
  - [ ] 26.4. Implement fluid page transitions between screens
    - File: `app/(app)/_layout.tsx` (to be expanded)
    - Branch Name: `feat/ui-page-transitions`
- [ ] 27. Implement loading states and error handling
  - [ ] 27.1. Create skeleton screens for data loading states
    - File: `components/ui/loading/Skeleton.tsx` (to be created)
    - Branch Name: `feat/ui-skeleton-loaders`
  - [ ] 27.2. Add user-friendly error messages with retry options
    - File: `components/ui/feedback/ErrorMessage.tsx` (to be created)
    - Branch Name: `feat/ui-error-messages`
  - [ ] 27.3. Implement loading indicators for all async operations
    - File: `components/ui/loading/Spinner.tsx` (to be created)
    - Branch Name: `feat/ui-loading-spinners`

### Milestone 10: Performance Optimization
Objective: Optimize application performance for a smooth user experience.

Data Flow:
- Performance metrics flow through analytics service
- Error data flows through error boundary system
- Cached data flows through optimized storage

Acceptance Criteria:
- App performance is optimized
- Error boundary system is implemented
- Crash reporting and analytics are added

Step-by-Step Tasks:
- [ ] 28. Optimize app performance
  - [ ] 28.1. Implement virtualized rendering for calendar to handle large date ranges
    - File: `components/ui/calendar/CalendarGrid.tsx` (to be optimized)
    - Branch Name: `perf/calendar-virtualization`
  - [ ] 28.2. Improve timer efficiency by optimizing update intervals
    - File: `lib/services/timer-service.ts` (to be created)
    - Branch Name: `perf/timer-efficiency`
  - [ ] 28.3. Create smart caching strategy for frequently accessed data
    - File: `lib/services/cache-service.ts` (to be created)
    - Branch Name: `perf/caching-strategy`
- [ ] 29. Implement error boundary system
  - [ ] 29.1. Add global error boundary with crash recovery
    - File: `components/error-boundary.tsx` (to be created)
    - Branch Name: `feat/error-global-boundary`
  - [ ] 29.2. Implement component-level error boundaries for isolated failures
    - File: `components/error-boundary.tsx` (to be expanded)
    - Branch Name: `feat/error-component-boundaries`
  - [ ] 29.3. Create user-friendly fallback UI components with recovery options
    - File: `components/ui/feedback/ErrorFallback.tsx` (to be created)
    - Branch Name: `feat/ui-error-fallback`
- [ ] 30. Add crash reporting and analytics
  - [ ] 30.1. Set up error logging to capture and report crashes
    - File: `lib/services/analytics-service.ts` (to be created)
    - Branch Name: `feat/analytics-crash-reporting`
  - [ ] 30.2. Implement anonymous usage analytics to track feature usage
    - File: `lib/services/analytics-service.ts` (to be expanded)
    - Branch Name: `feat/analytics-usage-tracking`
  - [ ] 30.3. Add performance monitoring for slow operations
    - File: `lib/services/analytics-service.ts` (to be expanded)
    - Branch Name: `feat/analytics-performance-monitoring`

### Milestone 11: Final Testing & Launch Prep
Objective: Prepare the application for launch on app stores.

Data Flow:
- Testing results flow through QA process
- App store data flows through submission process
- Marketing materials flow through promotion channels

Acceptance Criteria:
- App store materials are prepared
- App passes all testing
- App is ready for submission

Step-by-Step Tasks:
- [ ] 31. App store preparation
  - [ ] 31.1. Create screenshots showing key features on various device sizes
    - File: `assets/store/screenshots/` (to be created)
    - Branch Name: `chore/release-screenshots`
  - [ ] 31.2. Write compelling app description highlighting unique benefits
    - File: `docs/app-store/description.md` (to be created)
    - Branch Name: `docs/release-app-description`
  - [ ] 31.3. Prepare promotional graphics and videos for store listings
    - File: `assets/store/promotional/` (to be created)
    - Branch Name: `chore/release-promo-assets`

---

## Backlog

- [ ] 6. Build settings interface components 
  - [ ] 6.1. Create drink cost configuration form with price inputs and frequency
    - File: `components/ui/settings/DrinkCostForm.tsx` (to be created)
    - Branch Name: `feat/settings-drink-cost-form`
  - [ ] 6.2. Design account management UI with profile edit and password reset
    - File: `components/ui/settings/AccountSection.tsx` (to be created)
    - Branch Name: `feat/settings-account-management-ui`
  - [ ] 6.3. Implement preferences section for app notification settings
    - File: `components/ui/settings/PreferencesSection.tsx` (to be created)
    - File: `app/(app)/(protected)/settings.tsx` (to be expanded)
    - Branch Name: `feat/settings-preferences-notifications`
- [ ] Tapping the timer will take you to the current day (quick way to get back to present day)
    - Branch Name: `feat/timer-tap-to-today`