Feature: Calendar Data Management and Display

  As a user interacting with the calendar,
  I want the calendar data to be managed efficiently by a hook (`useCalendarData`)
  And displayed correctly by the `CalendarGrid` component,
  So that I can track my sobriety accurately and navigate through time smoothly.

  Background:
    Given the `CalendarGrid` component utilizes the `useCalendarData` hook for its data and logic

  Scenario 1: Initial Calendar Load
    Given the `useCalendarData` hook is initialized
    When the `CalendarGrid` component mounts
    Then the initial set of weeks (e.g., 5 weeks centered around the current date) is displayed in the `FlatList`
    And each `DayCell` displays the correct date and initial state (e.g., intensity based on mock data)

    Acceptance Criteria:
    - [ ] Hook provides the initial `weeks` data structure centered around the current date.
    - [ ] Component renders a `FlatList` with the initial weeks from the hook, centered around the current date.
    - [ ] Each rendered `DayCell` corresponds to a day in the `weeks` data.
    - [ ] Initial streaks and intensities are calculated and reflected correctly.

  Scenario 2: Toggle a Day's Sobriety Status (Mark as Sober)
    Given the calendar is displayed with initial data
    And a specific day ("Day X") is currently marked as 'not sober'
    When the user taps on "Day X" in the `CalendarGrid`
    Then the `toggleSoberDay` function from the hook is called with the ID of "Day X"
    And "Day X" visually updates to reflect the 'sober' state (e.g., increased intensity)
    And the sobriety streak potentially increases based on adjacent days
    And the day's intensity is recalculated and updated

    Acceptance Criteria:
    - [ ] Tapping a `DayCell` triggers the `toggleSoberDay` function passed from the hook.
    - [ ] Hook updates the state of the specific day in its internal `weeks` data.
    - [ ] Hook recalculates streaks based on the change.
    - [ ] Hook recalculates day intensities based on the change.
    - [ ] Updated `weeks` data from the hook causes the `CalendarGrid` to re-render the affected `DayCell` with the new state.

  Scenario 3: Toggle a Day's Sobriety Status (Mark as Not Sober)
    Given the calendar is displayed with initial data
    And a specific day ("Day Y") is currently marked as 'sober'
    When the user taps on "Day Y" in the `CalendarGrid`
    Then the `toggleSoberDay` function from the hook is called with the ID of "Day Y"
    And "Day Y" visually updates to reflect the 'not sober' state (e.g., decreased intensity)
    And the sobriety streak potentially breaks or decreases based on adjacent days
    And the day's intensity is recalculated and updated

    Acceptance Criteria:
    - [ ] Tapping a `DayCell` triggers the `toggleSoberDay` function passed from the hook.
    - [ ] Hook updates the state of the specific day in its internal `weeks` data.
    - [ ] Hook recalculates streaks based on the change.
    - [ ] Hook recalculates day intensities based on the change.
    - [ ] Updated `weeks` data from the hook causes the `CalendarGrid` to re-render the affected `DayCell` with the new state.

  Scenario 4: Load More Weeks into the Past
    Given the calendar is displayed with the initial set of weeks
    When the user scrolls the `FlatList` near the top edge
    Then the `CalendarGrid` triggers the `loadPastWeeks` function from the hook
    And the hook fetches or generates older weeks' data
    And the `weeks` data provided by the hook is updated to include the older weeks
    And the `FlatList` displays the newly loaded older weeks prepended to the existing ones

    Acceptance Criteria:
    - [ ] Scrolling near the top triggers `loadPastWeeks` in the hook via the component.
    - [ ] Hook updates its `weeks` data with older calendar information.
    - [ ] Component's `FlatList` renders the newly added past weeks.
    - [ ] Scroll position is maintained or adjusted appropriately after loading.

  Scenario 5: Load More Weeks into the Future
    Given the calendar is displayed with the initial set of weeks
    And the current view does not include future dates beyond the initial load
    When the user scrolls the `FlatList` near the bottom edge
    Then the `CalendarGrid` triggers the `loadFutureWeeks` function from the hook
    And the hook fetches or generates future weeks' data
    And the `weeks` data provided by the hook is updated to include the future weeks
    And the `FlatList` displays the newly loaded future weeks appended to the existing ones

    Acceptance Criteria:
    - [ ] Scrolling near the bottom triggers `loadFutureWeeks` in the hook via the component.
    - [ ] Hook updates its `weeks` data with future calendar information.
    - [ ] Component's `FlatList` renders the newly added future weeks.
    - [ ] Scroll position is maintained or adjusted appropriately after loading.

  Scenario 6: Initial Load with Pre-existing Data (Future State)
    Given the user has previously used the app and saved sobriety data
    And the `useCalendarData` hook is initialized
    When the hook attempts to load initial data (potentially from storage)
    Then the `weeks` data provided by the hook reflects the previously saved state
    And the `CalendarGrid` displays the calendar based on this restored data

    Acceptance Criteria:
    - [ ] Hook attempts to load data from a persistent source on initialization.
    - [ ] If data exists, the hook initializes its state with that data.
    - [ ] If no data exists, the hook initializes with default data (as in Scenario 1).
    - [ ] Component renders based on the data provided by the hook (either restored or default).

  Scenario 7: Saving Data After Toggling a Day (Future State)
    Given the calendar is displayed
    And the `useCalendarData` hook is configured to save data changes
    When the user taps on a `DayCell` triggering `toggleSoberDay`
    And the hook successfully updates the internal state and recalculates streaks/intensity
    Then the hook attempts to save the updated `weeks` data to persistent storage

    Acceptance Criteria:
    - [ ] After internal state update, the hook triggers a save operation.
    - [ ] The save operation targets the configured persistent storage.
    - [ ] (Optional) Feedback is provided on save success or failure (though likely handled elsewhere).

  Scenario 8: Prevent Marking Future Dates as Sober
    Given the calendar is displayed
    And the `useCalendarData` hook is initialized
    When the user views a future date on the calendar
    Then the `Daycell` button for that date should be disabled
    And the user should not be able to toggle the sober state of that date

    Acceptance Criteria:
    - [ ] The `Daycell` button is disabled for future dates
    - [ ] User cannot toggle the sober state of a future date
    - [ ] Visual feedback is provided to indicate the operation is not allowed
