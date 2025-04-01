# Calendar Interaction BDD Scenarios

Scenario 1: Viewing calendar with activity graph
Given: The user is on the main screen
When: The calendar component loads
Then: The user should see a calendar-style activity graph showing their sobriety progress
And: The graph should display days as color-coded tiles

Acceptance Criteria:
- [ ] Calendar displays as a grid with days of the week as columns
- [ ] Each day is represented by a colored tile
- [ ] The graph resembles GitHub's activity graph style

Scenario 2: Tracking and displaying sober streaks
Given: The user has marked consecutive days as sober
When: Viewing the calendar
Then: Consecutive sober days should appear with progressively darker colors
And: The current streak count should be displayed

Acceptance Criteria:
- [ ] Streak colors darken with each consecutive sober day
- [ ] Current streak count is visible and accurate

Scenario 3: Marking days as sober/not sober
Given: The user is viewing the calendar
When: They tap on a day tile
Then: The day should toggle between sober/not sober states
And: The tile color should update immediately
And: The streak calculations should update accordingly

Acceptance Criteria:
- [ ] Single tap toggles day state
- [ ] Visual feedback is immediate
- [ ] Streak calculations update in real-time
- [ ] Updated day state is saved locally.
- [ ] Saved day state is loaded correctly on app restart.
- [ ] Streak calculations use persisted data after restart.

Scenario 4: Correcting mistaken entries
Given: The user has marked a day incorrectly
When: They tap the day tile again
Then: The day's state should toggle
And: The visual representation should update
And: All streak calculations should adjust accordingly

Acceptance Criteria:
- [ ] Tapping a day twice returns it to original state
- [ ] All related calculations update correctly
- [ ] Visual feedback is immediate
- [ ] Corrected day state is saved locally.
- [ ] Corrected day state is loaded correctly on app restart.
- [ ] Adjusted streak calculations use persisted data after restart.

Scenario 5: Identifying the current day
Given: The user is viewing the calendar
When: The calendar loads
Then: The current day should be visually distinguished
And: It should be clearly identifiable among other days

Acceptance Criteria:
- [ ] Current day has distinct visual styling (outline/label)
- [ ] Current day is easily identifiable at a glance

Scenario 6: Scrolling through calendar
Given: The user is viewing the calendar
When: They scroll vertically
Then: The calendar should load more months seamlessly
And: Weekday headers should remain visible
And: Month markers should indicate month transitions

Acceptance Criteria:
- [ ] Calendar scrolls smoothly without gaps
- [ ] Weekday headers remain fixed
- [ ] Month transitions are clearly marked
- [ ] Data loads automatically during scroll

Implementation Notes:
- Uses day.js for date handling
- Tested with Jest framework
- Components located in app/components/ui/calendar/