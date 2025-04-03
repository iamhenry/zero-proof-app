# Sobriety Timer BDD Scenarios (Updated for Refactor)

Feature: Sobriety Timer Behavior

  As a user managing my sobriety journey,
  I want the timer to accurately reflect my continuous sober time,
  So that I have a precise measure of my progress based on the updated logic.

  Scenario 1: Displaying Timer Based on Current Day's Sobriety
    Given the user is viewing the main screen
    When the user's sobriety streak state changes
    Then the sobriety timer should be visible and display the calculated duration *only if* the current day is marked sober
    And the timer should be hidden or display zero *if* the current day is not marked sober

    Acceptance Criteria:
    - [ ] Timer component is rendered and active when the current day is marked sober.
    - [ ] Timer component is displays "0d 0h 0m 0s" when the current day is marked not sober.
    - [ ] The displayed duration calculation depends on how the current streak started (See Scenarios 3, 4, 5, 6).

  Scenario 2: Timer Updates in Real-Time
    Given the sobriety timer is visible and running (current day is sober)
    When time passes
    Then the timer display should update every second, incrementing the seconds count
    And minutes, hours, and days should increment accordingly

    Acceptance Criteria:
    - [ ] Seconds display updates continuously.
    - [ ] Minutes increment when seconds reach 60.
    - [ ] Hours increment when minutes reach 60.
    - [ ] Days increment when hours reach 24.

  Scenario 3: Start Timer from Exact Moment (Refines Original Logic - US-T1)
    Given the user has marked yesterday as "not sober"
    And today is currently marked as "not sober"
    When the user marks today as "sober" at exactly 3:15 PM
    Then the sobriety timer should become visible and start counting elapsed time from 3:15 PM today

    Acceptance Criteria:
    - [ ] The timer displays 0d, 0h, 0m, 0s immediately after marking today sober.
    - [ ] After 1 minute, the timer displays 0d, 0h, 1m, 0s (approximately).
    - [ ] The `streakStartTimestampUTC` for today's data is recorded as the exact timestamp (in UTC milliseconds) when it was marked sober.
    - [ ] The timer is visible.

  Scenario 4: Continue Existing Timer (Refines Original Logic - US-T2)
    Given the user has marked yesterday as "sober"
    And the current sober streak started 5 days, 2 hours, 10 minutes ago (based on persisted `streakStartTimestampUTC` or backfill calculation)
    And today is currently marked as "not sober"
    When the user marks today as "sober"
    Then the sobriety timer should update and continue counting from the original start time of the current streak

    Acceptance Criteria:
    - [ ] The timer immediately displays approximately 5d, 2h, 10m, Xs (where X is seconds elapsed since page load/interaction).
    - [ ] The `streakStartTimestampUTC` for today's data remains null or unset.
    - [ ] The timer continues to increment based on the original streak start time.

  Scenario 5: Recalculate Timer with Backfilled Start Day (Midnight Start - US-T3)
    Given the user has marked today as "sober" (streak started today)
    And the user marked yesterday as "not sober"
    And the user marked the day before yesterday as "not sober"
    And the current timer shows a duration starting from today
    When the user backfills yesterday, marking it as "sober"
    Then the sobriety timer should recalculate and display the duration starting from midnight (local time) of yesterday

    Acceptance Criteria:
    - [ ] The timer updates to show approximately 1d, Xh, Ym, Zs (reflecting the time since midnight yesterday).
    - [ ] The `streakStartTimestampUTC` for yesterday's data remains null or unset (as it was backfilled without a specific time).
    - [ ] The timer calculation uses the start of yesterday (00:00:00 local time) as the effective streak start.

  Scenario 6: Recalculate Timer Connecting Streaks via Backfill (Precise Start - US-T3)
    Given the user marked today as "sober" (continuing a streak started today at 9:00 AM)
    And the user marked yesterday as "not sober"
    And the user marked the day before yesterday as "sober" (part of a streak that started that day at 2:00 PM with a recorded `streakStartTimestampUTC`)
    And the current timer shows a duration starting from today
    When the user backfills yesterday, marking it as "sober"
    Then the sobriety timer should recalculate and display the duration starting from midnight of the start day of the earlier streak (day before yesterday)

    Acceptance Criteria:
    - [ ] The timer updates to show approximately 1d, Xh, Ym, Zs (reflecting the time since 2:00 PM the day before yesterday).
    - [ ] The `streakStartTimestampUTC` for the day before yesterday holds the original precise start time.
    - [ ] The timer calculation uses midnight of the start day from the day before yesterday as the effective streak start.

  Scenario 7: Timer Resets to Zero When Today is Not Sober (Replaces Original Scenarios 3 & 4 - US-T4)
    Given the user has an active sobriety streak and the timer is running
    And the user has marked today as "sober"
    When the user marks the current day as "not sober"
    Then the timer should reset all units to zero (0d, 0h, 0m, 0s)

    Acceptance Criteria:
    - [ ] Timer display immediately changes to 0d, 0h, 0m, 0s.
    - [ ] The application state reflects that there is no active timer running for the current day.
    - [ ] The `streakStartTimestampUTC` for today's data is set to null or unset.
    - [ ] The persisted timer state reflects the reset (e.g., relevant timestamp cleared or streak calculation yields zero).

  Scenario 8: Timer State Persists Across App Restarts (Updates Original Scenario 5)
    Given the user has an active sobriety streak (today is sober) and the timer is running
    And the streak start time (either precise `streakStartTimestampUTC` or calculated backfill start) is persisted
    When the user closes and reopens the app
    Then the timer should be visible and resume displaying the correct elapsed time based on the persisted streak start information
    And the timer's running status should reflect that today is marked sober

    Acceptance Criteria:
    - [ ] The relevant streak start information (`streakStartTimestampUTC` if available, or data allowing backfill calculation) is saved locally.
    - [ ] On app restart, the timer reads the persisted state.
    - [ ] The timer calculates and displays the correct elapsed time based on the saved start information and current time.
    - [ ] Timer is visible because today is sober upon reload.

  Scenario 9: Timer Resumes Accurately After Backgrounding (Updates Original Scenario 6)
    Given the user has an active sobriety streak (today is sober) and the timer is running
    When the user backgrounds the app and then brings it back to the foreground
    Then the timer display should update to the correct elapsed time, accounting for the time spent in the background based on the established streak start time

    Acceptance Criteria:
    - [ ] Timer accurately reflects elapsed time after the app returns from the background.
    - [ ] Calculation uses the correct persisted/calculated streak start time.

  Implementation Notes:
  - Relies on persisted streak data (`DayData` including optional `streakStartTimestampUTC`) from calendar interactions.
  - Requires local storage implementation (`LocalStorageSobrietyRepository`) for persistence.
  - Timer display logic is in `components/ui/timer/SobrietyTimer.tsx`.
  - Core calculation logic resides in `useCalendarData` hook or related functions.