Feature: Streak Counter Display Synchronization

  As a user,
  I want the streak counter to accurately reflect my current sobriety streak based on my tracked data,
  So that I have a consistent view of my progress.

Scenario 1: Displaying the current streak count from application state
  Given the application state indicates a current sobriety streak of 30 days
  When the StreakCounter component is rendered by its parent
  Then the StreakCounter should display the text "30"
  And the StreakIcon component should be visible

  Acceptance Criteria:
  - [ ] The parent component correctly retrieves the current streak count from the application state (e.g., via `useCalendarData`).
  - [ ] The parent component passes the retrieved streak count to the `StreakCounter`'s `count` prop.
  - [ ] The `StreakCounter` displays the number passed via the `count` prop.
  - [ ] The `StreakIcon` is rendered.

Scenario 2: Displaying zero when the current streak is zero
  Given the application state indicates the current sobriety streak is 0 days (e.g., just started or streak broken)
  When the StreakCounter component is rendered by its parent
  Then the StreakCounter should display the text "0"
  And the StreakIcon component should be visible

  Acceptance Criteria:
  - [ ] The parent component correctly retrieves the current streak count (0) from the application state.
  - [ ] The parent component passes 0 to the `StreakCounter`'s `count` prop.
  - [ ] The `StreakCounter` displays "0".
  - [ ] The `StreakIcon` is rendered.

Scenario 3: Updating the streak count when the application state changes
  Given the StreakCounter is displaying "10" based on the current streak
  When the application state updates to reflect a new current streak of 11 days (e.g., after a day passes or data syncs)
  Then the StreakCounter should update to display the text "11"
  And the StreakIcon component should remain visible

  Acceptance Criteria:
  - [ ] The parent component re-renders when the current streak count in the application state changes.
  - [ ] The parent component passes the updated streak count to the `StreakCounter`'s `count` prop.
  - [ ] The `StreakCounter` updates its displayed text to match the new `count` prop value.

Scenario 4: Displaying zero when the streak is reset
  Given the StreakCounter is displaying "15" based on the current streak
  When the application state updates because the streak is broken (current streak becomes 0)
  Then the StreakCounter should update to display the text "0"
  And the StreakIcon component should remain visible

  Acceptance Criteria:
  - [ ] The parent component re-renders when the current streak count resets to 0 in the application state.
  - [ ] The parent component passes 0 to the `StreakCounter`'s `count` prop.
  - [ ] The `StreakCounter` updates its displayed text to "0".