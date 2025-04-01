# Sobriety Timer BDD Scenarios

Scenario 1: Displaying timer when streak is active
Given: The user has an active sobriety streak (current day marked sober)
When: The user views the main screen
Then: The sobriety timer should be visible
And: The timer should display the duration of the current streak (days, hours, minutes, seconds)

Acceptance Criteria:
- [ ] Timer component is rendered when `currentStreak > 0`.
- [ ] Timer displays time units: Days, Hours, Minutes, Seconds.
- [ ] Initial timer value matches the calculated duration of the current persisted streak.

Scenario 2: Timer updates in real-time
Given: The sobriety timer is visible and running
When: Time passes
Then: The timer display should update every second, incrementing the seconds count
And: Minutes, hours, and days should increment accordingly

Acceptance Criteria:
- [ ] Seconds display updates continuously.
- [ ] Minutes increment when seconds reach 60.
- [ ] Hours increment when minutes reach 60.
- [ ] Days increment when hours reach 24.

Scenario 3: Timer resets when streak is broken
Given: The user has an active sobriety streak and the timer is running
When: The user marks the current day as not sober (breaking the streak)
Then: The timer should display "Sober 0" or reset to zero
And: The timer might hide depending on visibility rules (See Scenario 4)

Acceptance Criteria:
- [ ] Timer value resets to 0 days, 0 hours, 0 minutes, 0 seconds when the current day is marked non-sober.
- [ ] The persisted timer state reflects the reset (e.g., start time cleared or marked invalid).

Scenario 4: Timer visibility reflects streak state
Given: The user is on the main screen
When: The user's sobriety streak state changes
Then: The timer should only be visible if the current day is marked sober (streak > 0)
And: The timer should be hidden if the current day is not marked sober (streak = 0)

Acceptance Criteria:
- [ ] Timer is visible if the persisted current streak is greater than 0.
- [ ] Timer is hidden if the persisted current streak is 0.

Scenario 5: Timer state persists across app restarts
Given: The user has an active sobriety streak and the timer is running
When: The user closes and reopens the app
Then: The timer should resume displaying the correct elapsed time based on the persisted streak start time
And: The timer's running status should reflect the persisted streak state

Acceptance Criteria:
- [ ] The timer's start time (or equivalent state) is saved locally when a streak begins or continues.
- [ ] The timer's running status (linked to streak validity) is saved locally.
- [ ] On app restart, the timer reads the persisted state.
- [ ] The timer calculates and displays the correct elapsed time based on the saved start time and current time.

Scenario 6: Timer resumes accurately after backgrounding
Given: The user has an active sobriety streak and the timer is running
When: The user backgrounds the app and then brings it back to the foreground
Then: The timer display should update to the correct elapsed time, accounting for the time spent in the background

Acceptance Criteria:
- [ ] Timer accurately reflects elapsed time after the app returns from the background.
- [ ] Background tracking mechanism (if implemented per US-18) ensures timer continuity.
- [ ] Persisted state is potentially updated upon app resume to ensure accuracy.

Implementation Notes:
- Relies on persisted streak data from calendar interactions.
- Requires local storage implementation (Task 8) for persistence.
- May require background task capabilities for US-18.
- Timer display logic is in `components/ui/timer/SobrietyTimer.tsx`.