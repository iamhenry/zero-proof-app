# Timer-Streak Midnight Synchronization Bug

## Bug ID
TIMER-01

## Initial Bug Report and Observation
```md
## Bug Description
App incorrectly displays 21 days in the timer despite May 21 not being toggled on, while the streak counter shows 20 days.

## Steps to Reproduce
1. Run the app in the simulator starting on May 20, 2025, with the streak counter at 20 days.
2. Leave the app running overnight without toggling the sober state for May 21.
3. Observe the app state after midnight on May 21, 2025.

## Expected Behavior
The timer should display 20 days, as May 21 was not toggled on (sober state set to false), and the day cell for May 21 should have the "today" style (blue text) applied.

## Actual Behavior
The timer incorrectly showed 21 days, despite May 21 not being toggled on. The day cell for May 21 did not have the "today" style (blue text) applied. The streak counter component correctly displayed 20 days.
```

## Status
- [ ] Identified
- [ ] Reproduced
- [ ] Fixed
- [ ] Tested
- [ ] Closed

## Priority
High

## Severity
Major

## Description
The timer component displays an incorrect number of elapsed days after midnight transition when the new day is not marked as sober. This creates a discrepancy between the streak counter and timer display.

## Environment
- Platform: iOS
- App Version: Latest
- Date Observed: May 21, 2025
- Device: iOS Simulator

## Steps to Reproduce
1. Run the app in the simulator starting on May 20, 2025
2. Ensure a streak of 20 days is active
3. Leave the app running overnight without marking May 21 as sober
4. Observe the app state after midnight on May 21, 2025

## Expected Behavior
- Timer should display 20 days (matching the streak counter)
- May 21 should show as not sober
- Timer should stop since the streak is broken
- Day cell for May 21 should have "today" styling (blue text)

## Actual Behavior
- Timer incorrectly displays 21 days
- Streak counter correctly shows 20 days
- May 21 shows as not sober
- Timer continues running despite broken streak
- Day cell styling inconsistencies

## Evidence from Logs

### Initial State
```
[StreakCounter:render] Displaying streak count: 21
[SobrietyTimer] Timer state changed: 
    startTime=2025-04-30T07:00:00.000Z 
    isRunning=true 
    elapsedDays=21
    isLoading=false
```

### Verification Failure
```
[TimerContext:load] Loaded state from repo: {"startTime":1747033200000,"isRunning":true}
[TimerContext:load] Verification failed: Persisted running=true, but today (2025-05-21) is not sober in repo. Overriding state.
```

### State Inconsistency
```
[CalendarContext:toggleSoberDay] Recalculation Result: {"currentStreak": 0, "longestStreak": 21, "startDayId": undefined}
[DEBUG:toggleSoberDay] No current streak (newCurrent=0). Calling stopTimer.
[TimerContext:stopTimer] Setting state & persisting: {"startTime":null,"isRunning":false}
```

## Impact
- Users see incorrect streak duration in timer
- Inconsistent feedback between timer and streak counter
- Potential confusion about streak status
- May affect user motivation and trust in the app

## Related Components
1. TimerStateContext
   - Handles timer state management
   - Manages elapsed days calculation
   - Persists timer state

2. CalendarDataContext
   - Manages streak calculations
   - Handles day status toggling
   - Controls timer start/stop based on streak

3. StreakCounter
   - Displays current streak count
   - Updates based on calendar data

## Technical Notes
1. Timer state persistence is working but verification at midnight needs improvement
2. Elapsed days calculation doesn't properly handle midnight transition
3. Verification logic exists but fails to properly reset timer state
4. State synchronization between timer and streak counter needs enhancement

## Next Steps
1. **Investigation Required**
   - Add additional logging around midnight transition
   - Monitor timer state changes during date changes
   - Track streak calculation during midnight transition
   - Verify timer and streak counter synchronization logic

2. **Data Collection Needed**
   - Capture full state before and after midnight
   - Log all timer updates during transition
   - Record streak calculation events
   - Document component re-render sequence

3. **Reproduction Strategy**
   - Create automated test for midnight transition
   - Simulate date changes in development
   - Test various streak scenarios
   - Verify persistence behavior

## Additional Context
This bug specifically manifests during the midnight transition period and involves complex interaction between multiple components managing time-based state. The fix will need to consider both the immediate timer display issue and the broader state management architecture to prevent similar synchronization issues. 