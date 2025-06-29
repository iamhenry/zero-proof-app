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
  - [x] 8.7.6. Enhance debug logging across key components
    - File: `components/ui/timer/SobrietyTimer.tsx`, `components/ui/statistics/StreakCounter.tsx`, `components/ui/calendar/DayCell.tsx`
  - [x] 8.7.7. Fix conditional timer control to prevent UI resets during calendar interactions
    - File: `context/CalendarDataContext.tsx`, `context/TimerStateContext.tsx`
  - [x] 8.7.8. Optimize initial data loading range calculation
    - File: `context/CalendarDataContext.tsx`
  - [x] 8.7.9. Optimize persistence layer with improved data integrity checks
    - File: `lib/storage/LocalStorageSobrietyRepository.ts`

### Phase 2: Frontend Implementation Bugs
- [x] bug-07. today is april 10, 2025, and it has not been marked as sober. however the timer still indicates a running elpase time as it was (81d, 10h, 38m, 01s). this should not be the case. the user must explicitly toggle the current day in order to keep the timer elapse time running. (screenshot on my desktop). This only occurs the following day when i come back to the app.
  - Fixed in commit 7a84c5c (Apr 21, 2025): Added verification step in TimerStateContext to check if today is actually marked as sober, and enhanced SobrietyTimer to display zero when today is not sober.
- [x] bug-09. Enhanced User Feedback System for Authentication Processes
  - [x] bug-09.1. As a user, I want to receive immediate feedback when authentication actions succeed or fail.
    - Resolution: Implemented comprehensive toast notification system with ToastProvider and ToastContainer for centralized user feedback management.
    - File: Toast notification components and integration in authentication screens
  - [x] bug-09.2. As a user, I want clear notification when email verification is required.
    - Resolution: Added toast notification for email verification in WelcomeScreen to ensure users understand next steps.
    - File: WelcomeScreen with integrated email verification feedback
  - [x] bug-09.3. As a user, I want the signup screen to dismiss automatically after successful submission.
    - Resolution: Enhanced signup flow with automatic screen dismissal upon form submission for improved user flow continuity.
    - File: SignUp component with automatic dismissal functionality


<!-- FIXED -->
- [x] BUG-01. Implement dynamic and performant loading of past and future dates
  - [x] BUG-01.1. As a user, I want to be able to view past and future dates dynamically without performance issues.
- [x] BUG-02. Disable toggle sober day for future dates; only present and past are supported
  - [x] BUG-02.1. As a user, I want to be able to toggle sober days only for present and past dates, ensuring future dates are not editable.
- [x] BUG-03. Resolve display discrepancy between StreakCounter (calendar days) and SobrietyTimer (elapsed time)
  - [x] BUG-03.1. As a user, I want the definition of a "day" used for the streak count to be consistent with the elapsed time timer.
    - Resolution: Added elapsedDays calculation to TimerStateContext and used it in the StreakCounter, ensuring both components use the same definition of days.
    - File: `context/TimerStateContext.tsx`, `components/ui/statistics/StreakCounter.tsx`
- [x] BUG-04. Fix timer UI reset when interacting with past calendar dates
  - [x] BUG-04.1. As a user, I want the timer to remain stable and not reset when interacting with past calendar dates that are not part of my current streak.
    - Resolution: Made the stopTimer() call conditional within toggleSoberDay, only executing it if the recalculated currentStreak was actually zero.
    - File: `context/CalendarDataContext.tsx`
- [x] BUG-05. Fix inconsistent persistence of calendar data on app refresh
  - [x] BUG-05.1. As a user, I want all my marked calendar days to persist correctly when the app is refreshed.
    - Resolution: Updated CalendarDataContext to dynamically calculate date ranges for loaded data based on persisted entries.
    - File: `context/CalendarDataContext.tsx`
- [x] BUG-06. Fix timer scroll functionality when navigating from distant past dates
  - [x] BUG-06.1. As a user, I want to be able to tap the timer component to return to today's date when scrolled far back in the past (e.g., Oct 2024), even if those dates weren't initially loaded.
    - Resolution: Enhanced scroll state management in CalendarGrid with improved handling of programmatic scrolling and coordination between components.
    - File: `components/ui/timer/SobrietyTimer.tsx`, `context/CalendarDataContext.tsx`
- [x] bug-08. when refreshing the app or at app launch, The current day is not within the viewport of the screen. Today should be at the center of the screen, which is the expected behavior.

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
  - [x] 9.8 Implement scrollToToday functionality in CalendarDataContext
    - File: `context/CalendarDataContext.tsx`
  - [x] 9.9 Integrate timer with calendar scroll functionality
    - File: `components/ui/timer/SobrietyTimer.tsx`
  - [x] 9.10 Cleanup obsolete or outdated test files
    - Removed: `components/ui/timer/__tests__/SobrietyTimer.persistence.test.ts`
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
  - [x] 10.5. Enhance timer with interactive features (tap to scroll calendar)
    - File: `components/ui/timer/SobrietyTimer.tsx`, `context/CalendarDataContext.tsx`
  - [x] 10.6. Improve timer state management with conditional side effects
    - File: `context/TimerStateContext.tsx`, `context/CalendarDataContext.tsx`
- [x] 11. Implement financial tracking system 
  - [x] 11.1. Create savings calculator based on days sober × drink cost
    - File: `components/ui/settings/hooks/useFinancialSettings.ts`
  - [x] 11.2. Implement financial service for savings calculations
    - File: `lib/services/financial-service.ts` (to be created)
    - Branch Name: `feat/financial-service-implementation`
    - Dependencies: CalendarDataContext for sober day tracking
  - [x] 11.3. Connect SavingsCounter to calculate and display real-time savings
    - File: `components/ui/statistics/SavingsCounter.tsx` (to be updated)
    - Branch Name: `feat/savings-counter-integration`

### Milestone 5: Settings Screen and Drink Quantity Input
Objective: Implement settings screen with drink quantity input functionality.

Data Flow:
- Settings form data managed via React Hook Form
- Drink quantity data persisted via local storage
- Drink quantity impacts financial calculations via SavingsDataContext

Acceptance Criteria:
- Settings screen is implemented with drink quantity input
- Drink quantity data persists across app sessions
- Financial calculations update based on drink quantity

Step-by-Step Tasks:
- [x] 10. Create settings screen with drink quantity input
  - [x] 10.1. Implement DrinkQuantityInput component with validation
    - File: `components/ui/onboarding/DrinkQuantityInput.tsx`
  - [x] 10.2. Create form hook for drink quantity management
    - File: `components/ui/onboarding/hooks/useDrinkQuantityForm.ts`
  - [x] 10.3. Update financial service to use drink quantity data
    - File: `lib/services/FinancialService.ts`
  - [x] 10.4. Enhance SavingsDataContext with drink quantity state management
    - File: `context/SavingsDataContext.tsx`
  - [x] 10.5. Implement OnboardingDrinkQuantityContainer for initial setup
    - File: `components/ui/onboarding/OnboardingDrinkQuantityContainer.tsx`
  - [x] 10.6. Implement SettingsDrinkQuantityContainer for settings updates
    - File: `components/ui/settings/SettingsDrinkQuantityContainer.tsx`
  - [x] 10.7. Create SavingsCounterModal component for quick drink quantity updates
    - File: `components/ui/statistics/SavingsCounterModal.tsx`
  - [x] 10.8. Add comprehensive tests for drink quantity components
    - Files: `components/ui/onboarding/__tests__/`, `components/ui/settings/__tests__/`
  - [x] The savings counter component does not recalculate after the user edits their value in the drink quantity settings modal.

### Milestone 7: Onboarding and Monetization (MVP Focus) ✅ COMPLETED
- Objective: Implement onboarding flow with drink quantity input and a freemium model with 7-day free trial for MVP launch. [100% Complete]
- 🎯 MILESTONE ACHIEVEMENT: Core monetization feature successfully implemented with 7-day free trial functionality, comprehensive BDD test coverage, and production-ready subscription management.
- Data Flow:
  - Onboarding data (e.g., drink quantity) flows through form components to local storage.
  - Drink quantity data feeds into savings calculations for display in the `SavingsCounter`.
  - Trial status and payment data flow through Expo IAP to local state, stored in AsyncStorage.
  - Onboarding completion state is tracked in local storage to prevent re-display.
  - Paywall blocks access to protected screens if the trial has ended.
- Acceptance Criteria:
  - Onboarding flow with 5 screens (heatmap, streak, savings, drink input, paywall) is implemented using `react-native-onboarding-swiper`.
  - Users can input weekly drink quantity during onboarding and edit it in settings.
  - Drink quantity is used to calculate and display savings in the `SavingsCounter`.
  - Onboarding is shown only once per user, tracked via local storage.
  - 3-day free trial with paywall triggers post-trial, integrated with Apple App Store subscriptions via Expo.
  - Paywall blocks access to protected screens (e.g., home screen) if the trial has ended and no subscription is active.
  - Superwall integration is deferred to post-launch.
- Step-by-Step Tasks:
  - [ ] 32. Implement onboarding flow
    - [x] 32.1. Integrate `react-native-onboarding-swiper` for multi-screen flow (ensure `showSkip={false}`)
      - File: `app/(app)/onboarding.tsx`
      - Branch Name: `feat/onboarding-flow`
    - [x] 32.2. Use static images for Screens 1-3 (copy TBD, replaces component reuse)
      - Branch Name: `feat/onboarding-static-images`
    - [x] 32.3. Create reusable placeholder drink quantity input form (Screen 4) using number pad input and Zod validation (defer editing functionality)
      - File: `components/ui/onboarding/DrinkQuantityInput.tsx` (to be created)
      - Branch Name: `feat/onboarding-drink-quantity`
    - [x] 32.4. Design paywall screen (Screen 5) with a simple dismissal button (simulates purchase for now)
      - File: `components/ui/onboarding/PaywallScreen.tsx` (to be created)
      - Branch Name: `feat/onboarding-paywall`
    - [ ] 32.5. Track onboarding completion in local storage to show only once
      - File: `lib/storage/LocalStorageSobrietyRepository.ts` (to be expanded)
      - Branch Name: `feat/onboarding-persistence`
    - [ ] 32.6. Navigate to home screen after user starts trial
      - File: `app/(app)/onboarding.tsx`
      - Branch Name: `feat/onboarding-navigation`
  - [x] 33. Implement drink quantity storage and savings integration (using placeholder input)
    - [x] 33.1. Add form handling with React Hook Form and Zod for the reusable placeholder form
      - File: `components/ui/onboarding/DrinkQuantityInput.tsx`
    - [x] 33.2. Save drink quantity (from placeholder) to AsyncStorage
      - File: `lib/storage/LocalStorageSobrietyRepository.ts` (to be expanded)
      - Branch Name: `feat/local-drink-quantity-storage`
    - [x] 33.3. Connect drink quantity (from placeholder) to savings calculations for display in `SavingsCounter`
      - File: `components/ui/statistics/SavingsCounter.tsx` (to be updated)
      - Branch Name: `feat/savings-drink-quantity-integration`
  - [x] 34 Implement drink quantity management in settings
    - File: `components/ui/settings/SettingsDrinkQuantityContainer.tsx` (to be expanded)
    - Branch Name: `feat/settings-drink-quantity-screen`
  - [x] 35. Implement freemium model with RevenueCat integration (iOS-focused, simplified) ✅ COMPLETED
    - [x] 35.1. Install and Configure RevenueCat SDK (iOS-only)
      - File: `config/revenuecat.ts` (completed)
      - Branch Name: `feat/revenuecat-ios-setup`
      - Dependencies: RevenueCat SDK
      - Tasks:
        1. [x] Install `react-native-purchases` SDK
        2. [x] Enable In-App Purchase capability in Xcode
        3. [x] Configure RevenueCat project and iOS API keys
        4. [x] Create basic configuration service
        5. [x] Add environment variable for API key
        6. [x] Configure offerings in RevenueCat dashboard
        7. [x] Set up products in App Store Connect
        8. [x] Configure RevenueCat UI SDK template for paywall
      - Note: Skip Android setup, webhooks, and server-side validation for now
    - [x] 35.2. Replace PaywallScreen with RevenueCat UI SDK Template
      - File: `components/ui/onboarding/PaywallScreen.tsx` (completed)
      - Branch Name: `feat/revenuecat-ui-paywall`
      - Dependencies: Task 35.1
      - Tasks:
        1. [x] Install RevenueCat UI SDK (`react-native-purchases-ui`)
        2. [x] Replace custom PaywallScreen with RevenueCat template
        3. [x] Configure template with your offerings
        4. [x] Add restore purchases (built into template)
        5. [x] Handle purchase completion callbacks
      - Note: Template handles loading states, error handling, and purchase flows automatically
      - TESTS:
        - working (iphone Physical device with testing account `virtualhenry+appleTester1@gmail.com`):
          - I was able to buy a subscription, the $2.99 a month subscription that's only available right now. I need to add more later.
          - And I was able to restore the purchase successfully.
          - i was not able to test on simulator
            - Both of those tests, I was able to access the protected routes, which is the calendar grade view successfully.
    - [x] 35.3. Implement Basic Subscription State Management ✅ COMPLETED
      - File: `context/SubscriptionContext.tsx` (completed with 7-day trial support)
      - Branch Name: `feat/subscription-state`
      - Dependencies: Task 35.2
      - Purpose: Centralized subscription state management with 7-day free trial functionality and comprehensive trial state tracking.
      - 🎯 FREE TRIAL FEATURES IMPLEMENTED:
        1. [x] 7-day trial state management with async handling
        2. [x] Trial activation and expiration logic
        3. [x] PaywallScreen improvements with proper async operations
        4. [x] BDD scenarios covering complete free trial flows
        5. [x] Integration tests for trial activation and expiration
        6. [x] TDD implementation with comprehensive test coverage
      - Tasks:
        1. Create simple subscription context
        2. Track active subscription status
        3. Listen for purchase events from paywall
        4. Persist subscription state locally
        5. Integrate SubscriptionProvider into app layout
        <!-- So I did a quick test by signing out and signing back in and the onboarding experience does not show which is expected behavior. I also went through the onboarding experience in a second test, accessed the app once I paid, forced closed the app and relaunched it and no onboarding experience was shown which is also working as expected. These are with the changes that are not in stage yet but under the work in progress "changes" panel within the source control panel. -->
        6. Verify context accessibility in app components
           - Integration Requirements:
             - Add `SubscriptionProvider` to `app/_layout.tsx` provider hierarchy
             - Ensure proper provider order (after SupabaseProvider, before app routes)
             - Verify `useSubscription()` hook is accessible throughout app
           - Testing Checklist:
             - [x] Unit tests pass (17 scenarios covered)
             - [x] Provider integrated without app crashes
             - [x] Hook accessible in real app components
             - [x] Subscription state updates correctly on device
             - [x] Cache persists between app sessions
      - Note: Keep it minimal - just track active/inactive status
    - [x] 35.4. Add Route Protection
      - File: `app/(app)/(protected)/_layout.tsx` (enhanced with trial support)
      - Branch Name: `feat/subscription-protection`
      - Dependencies: Task 35.3
      - Purpose: Complete route protection with 7-day free trial integration and comprehensive subscription validation.
      - 🎯 ENHANCED TRIAL PROTECTION:
        1. [x] Check subscription and trial status in protected layout
        2. [x] Handle trial expiration with graceful paywall redirect
        3. [x] Allow access during active trial period
        4. [x] Maintain access for active subscribers
        5. [x] BDD test coverage for protection scenarios
      - Tasks:
        1. [x] Check subscription and trial status in protected layout
        2. [x] Redirect to paywall if subscription inactive and trial expired
        3. [x] Allow access if subscription active or trial active
      - ENHANCEMENT: Complex trial logic implemented with comprehensive state management
    - [x] 36. Display subscription status and management options
      - File: `app/(app)/(protected)/settings.tsx` (to be created/expanded)
      - Branch Name: `feat/subscription-status-display`
      - Dependencies: Task 35.3
      - Purpose: Users need visibility into their subscription status and easy access to manage/cancel subscriptions. This reduces customer support burden and improves user experience by providing transparency about billing and subscription details.
      - Tasks:
        1. Display current subscription tier and renewal date
        2. Show subscription status (active, expired, billing retry)
        3. Add deep link to iOS Settings for subscription management
        4. Include "Manage Subscription" button using RevenueCat's showManageSubscriptions()
        5. Display subscription history and next billing date
      - Note: Focus on transparency and easy subscription management to reduce churn and support requests
    - [x] 37. Write unit test on revenuecat working code
    - [x] 38. Add deeplink for user authentication when the click the verify link in their email upon registering ✅ COMPLETED
      - [x] As a user I want to get taken back to the app upon tapping the "verify" link in my email
      - **Implementation Details:**
        - Created comprehensive deep link service architecture with `DeepLinkService` and `EmailVerificationService`
        - Implemented URL scheme handling for email verification deep links
        - Added robust error handling and toast notifications for user feedback
        - Enhanced Supabase provider integration with automatic sign-in post-verification
        - Created dedicated interfaces (`IDeepLinkService`, `IEmailVerificationService`) for maintainable architecture
        - Added comprehensive BDD test scenarios covering email verification flows
        - Implemented deep link parsing and validation with proper type safety
      - **Files Modified:**
        - `app/_layout.tsx` - Deep link URL handling integration
        - `app/(app)/welcome.tsx` - Enhanced welcome screen with verification feedback
        - `context/supabase-provider.tsx` - Email verification processing
        - `lib/services/DeepLinkService.ts` - Core deep link service implementation
        - `lib/services/EmailVerificationService.ts` - Email verification handling
        - `lib/interfaces/IDeepLinkService.ts` - Service interface definition
        - `lib/interfaces/IEmailVerificationService.ts` - Verification interface
        - `lib/types/DeepLinkTypes.ts` - Type definitions for deep link data structures
        - `lib/services/__tests__/DeepLinkService.test.ts` - Comprehensive unit tests
      - **Key Commits:**
        - `3257e03` - feat(deepLink): Refactor DeepLinkService for improved readability and functionality
        - `2eb732e` - feat: complete green phase - fix contradictory test assertions
        - `6cb7a82` - feat(bdd): Add email verification deep link scenarios
      - **Testing Coverage:** Full BDD scenarios and unit tests implemented for deep link parsing, email verification flows, and error handling

## Bugs
- [ ] Fix midnight transition bug for timer and daycell (see bug report `_ai/bug-report/timer-streak-midnight-sync-bug.md`)
// FIXME:
- [ ] Currently in the onboarding experience, the user can easily swipe past entering the drink quantity. And so when the user completes the onboarding experience and starts the free trial, the drink quantity amount will be zero. And so the savings counter will not be calculating anything and will always show zero.

### Minor Issue Found (In App Purchase Flow):
1. I created a new sandbox Apple tester email account.
2. Signed in to the iOS settings developer settings with the new email account.
3. Registered with that email for the zero proof app.
4. Verified my email in the gmail I received for that tester account.
5. Launch the app, zero proof.
6. Then I was able to bypass the onboarding and it automatically showed me the protected routes and dropped me into the calendar view.
7. I presume this is because I didn't uninstall the app and so the local storage was still persistent.
  

<!-- FIXED -->
- [x] "Scrolling to the bottom on the calendar grid does not fetch new future dates and displays them. But if I scroll to the top and get historical dates, when I scroll back to the very bottom to fetch new dates, it does fetch it. So there seems to be some sort of discrepancy there."
  - [x] why didnt the test catch this?
- [x] RevenueCat paywall only shows red rectangle instead of proper paywall UI
  - Issue: The RevenueCat UI SDK paywall component is not rendering correctly, only displaying a red rectangle
  - File: `components/ui/onboarding/PaywallScreen.tsx`
  - Priority: High (blocks monetization flow)
  - Investigation needed: Check RevenueCat configuration, offerings setup, and component integration
- [x] When I do an onboarding with the existing data and enter a value for the drink quantity and store it into the persistent storage, it doesn't reflect accurately when I tap the day cell. (eg. i entered 7 for weekly drink amount, complete the onboarding, tap day cell, the previous data [14 weekly drinks] is what shows up in the financial counter component)
  - [x] when i refresh the app and enter 21 for weekly amount, this time it will show the amount i had entered before (7 weekly). There's something glitchy about this data storage.
  - [x] The savings counter component does not recalculate after the user edits their value in the drink quantity settings modal.
    - [x] why didnt the test catch this?
- [x] when signing up for a new account, the signup modal sheet does not dismiss and there's not toast to notify the user that they have to verify their email
- [x] how do i handle URL's in supabase in prod when the user has to verify their email. (right now it uses localhost and the site fails because domain doesnt exist even tho they can still verify their email)
  - **Resolution**: Authentication flow resolved in latest build - email verification working correctly despite localhost redirect
- [x] **AUTHENTICATION: Sign-in Error with Valid Credentials** (TestFlight Build 3 - June 17, 2025) ✅ RESOLVED
  - **Issue**: User receives "sign in failed. please check your credentials" error when submitting valid, verified credentials from Supabase database using existing tester account
  - **Resolution**: Authentication issues resolved in latest TestFlight build - users can now successfully sign in with verified credentials
  - **Next Phase**: Implement deep linking for email verification to improve user experience by eliminating localhost redirect

## Phase 4: UI Polish & Optimization
Enhance user experience with animations and optimizations.

### Milestone 13: Final Testing & Launch Prep
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
  - [x] 31.1. Create screenshots showing key features on various device sizes
    - File: `assets/store/screenshots/` (to be created)
    - Branch Name: `chore/release-screenshots`
  - [x] 31.2. Write compelling app description highlighting unique benefits
    - File: `docs/app-store/description.md` (to be created)
    - Branch Name: `docs/release-app-description`
  - [x] Enable free trials using revenucat sdk
    - 🎯 7-DAY FREE TRIAL: Successfully implemented with comprehensive BDD test coverage
    - FEATURES: Trial state management, async handling, integration tests
    - COMMIT: a249607 - feat: Implement 7-day free trial for weekly subscription
  - [x] submit to testflight
    - [x] add privacy policy doc (gist)
    - [x] include app website
    - [x] Set up EAS (Expo Application Services) build pipeline for automated iOS TestFlight deployment
      - [x] Configure eas.json with production build profile using Node.js 20.18.0
      - [x] Implement NPM_CONFIG_LEGACY_PEER_DEPS to resolve dependency conflicts
      - [x] Set up m-medium resource class for cost-optimized builds within EAS free tier
      - [x] Configure automated submission to App Store Connect without manual .ipa handling
      - [x] Successfully deploy Zero Proof app to TestFlight for beta testing
      - Reference: Commit 3e2b8c0 - Production-ready iOS distribution pipeline established
  - [ ] Ensure app build is only compatible on iOS
  - [ ] Investigate crashing issue upon immediately installing from test flight.

------------------------

# Backlog

------------------------

#### Editing Drink Quantity Form
- [x] Tapping the timer will take you to the current day (quick way to get back to present day)
    - File: `components/ui/timer/SobrietyTimer.tsx`, `context/CalendarDataContext.tsx`
    - Branch Name: `feat/timer-tap-to-today`
    - Completed: April 16, 2025
- [x] 11.4. (Future Enhancement) Implement drink quantity management in settings
    - File: `app/(app)/(protected)/settings.tsx` (to be expanded)
    - Branch Name: `feat/settings-drink-quantity-management`

---


### Milestone 5: Progress Tracking Features
Objective: Build features to track and visualize user progress over time.

Data Flow:
- Streak logic gradually transitions from Context to dedicated streak service
- Drink logging updates statistics and calendar view
- Progress data is processed for sharing functionality

Acceptance Criteria:
- Streak management system is implemented with proper separation of concerns
- Drink logging system is functional
- Progress sharing feature is implemented

Step-by-Step Tasks:
- [ ] 12. Refactor and enhance streak management system 
  - [ ] 12.1. Extract streak calculation logic to dedicated service
    - File: `lib/services/streak-service.ts` (to be created)
    - Branch Name: `refactor/extract-streak-service`
    - Rationale: Separate business logic from UI state management for better testability and maintainability
    - Approach: Incrementally extract pure calculation functions first while maintaining compatibility
    - Signs refactoring is needed: Context exceeding 500 lines, difficulty testing, duplicate logic
  - [ ] 12.2. Implement daily updates with notifications (post-MVP)
    - File: `lib/services/streak-service.ts`
    - Branch Name: `feat/streak-daily-updates`
    - Depends on: Task 12.1 completion
  - [ ] 12.3. Add longest streak recording that persists across resets
    - File: `lib/services/streak-service.ts`
    - Branch Name: `feat/streak-longest-persistent`
    - Note: Core functionality exists, enhancement adds more detailed historical tracking
  - [ ] 12.4. Create streak reset handling with optional notes for relapse (post-MVP)
    - File: `lib/services/streak-service.ts`
    - Branch Name: `feat/streak-reset-handling`
    - Depends on: Task 12.1 completion
  - [ ] 12.5. Implement selective service extraction for key business logic
  - [ ] 12.5.1. Extract streak calculation logic to dedicated service
    - File: `lib/services/streak-service.ts` (to be created)
    - Branch Name: `refactor/extract-streak-service`
    - Approach: Incrementally extract pure calculation functions first while maintaining compatibility
    - Rationale: Prepare architecture for upcoming Supabase integration (dependency for Milestone 6)
  - [ ] 12.5.2. Create foundation for sync service architecture  
    - File: `lib/services/sync-service.ts` (to be created)
    - Branch Name: `refactor/sync-service-foundation`
    - Approach: Define interfaces and basic structure without implementation details
    - Rationale: Establish patterns for later remote storage integration
- [ ] 13. Develop drink logging system 
  - [ ] 13.1. Create daily drink counter with type and amount tracking
    - File: `components/ui/drink-log/DrinkCounter.tsx` (to be created)
    - Branch Name: `feat/drink-log-daily-counter`
  - [ ] 13.2. Implement consumption pattern tracking to identify trends (post-MVP)
    - File: `lib/services/analytics-service.ts` (to be created)
    - Branch Name: `feat/analytics-consumption-patterns`
  - [ ] 13.3. Add entry correction/undo functionality to fix mistakes
    - File: `components/ui/drink-log/LogEditor.tsx` (to be created)
    - File: `lib/services/drink-log-service.ts` (to be created)
    - Branch Name: `feat/drink-log-correction-undo`
- [ ] 14. Create progress sharing feature (post-MVP)
  - [ ] 14.1. Implement calendar graphics generator for social media sharing
    - File: `lib/services/share-service.ts` (to be created)
    - Branch Name: `feat/share-calendar-graphics`
  - [ ] 14.2. Add share functionality with customizable messages and privacy options
    - File: `components/ui/share/ShareButton.tsx` (to be created)
    - File: `components/ui/share/ShareModal.tsx` (to be created)
    - Branch Name: `feat/share-customizable-messages`

### Refactoring Guidelines for Streak Service:

1. Staged Approach:
   - First extract pure calculation functions (`recalculateStreaksAndIntensity`)
   - Update Contexts to use the service while maintaining the same API
   - Gradually add new streak-related features to the service, not the Context

2. When to Prioritize This Refactoring:
   - Context files exceeding 500 lines (already true for CalendarDataContext)
   - Duplicated streak logic appearing in multiple places
   - Need to add complex new streak features
   - Difficulty writing tests for streak-related functionality
   
3. Architecture Pattern:
   - Components → Contexts (UI state) → Services (business logic) → Repositories (data)
   - Contexts should only manage component state and service calls
   - Services should contain pure business logic independent of UI

---

## Phase 3: Backend Integration
Connect frontend with Supabase backend services.

### Milestone 8: Authentication & Database
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
    - Dependencies: Task 12.5 (Service foundation)
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

### Milestone 9: Data Synchronization
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
  - [ ] 18.0.1. Implement full SyncService using previously established foundation
    - File: `lib/services/sync-service.ts` (to be expanded)
    - Branch Name: `feat/complete-sync-service`
    - Rationale: Leverage the foundation created in Task 12.5.2 for robust sync implementation
    - Dependencies: Task 12.5 (Service foundation)
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

### Milestone 10: End-to-End Testing
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

### Milestone 11: Visual Enhancements
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
  - [x] 26.3. Create smooth timer countdown animations
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

### Milestone 12: Performance Optimization
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

### RevenueCat 
- [ ] implement the RevenueCat Customer Center (https://www.revenuecat.com/docs/tools/customer-center)
  - [ ] This allows them to have and manage subscriptions without leaving the app.
  - [ ] It also has the ability to ask a few questions if a user decides to cancel.

---