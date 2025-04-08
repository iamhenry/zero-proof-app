# Feature: Timer Tap Scrolls Calendar to Today (US-15)

As a user,
I want to tap the timer component at any time,
And have the calendar automatically scroll to center the current day ('today') in the viewport,
So that I can easily navigate back to the present day regardless of my current scroll position.

## Scenario 1: Tap Timer When Today is Visible
Given: The calendar is displayed
And: The current day ('today') is visible in the viewport
When: The user taps the sobriety timer component
Then: The calendar scroll position should not change significantly
And: The current day ('today') should remain visible and centered

Acceptance Criteria:
- [ ] Verify the calendar's scroll offset remains the same after tapping the timer.
- [ ] Verify the element representing 'today' is still within the visible bounds of the calendar grid.

## Scenario 2: Tap Timer When Scrolled to Past
Given: The calendar is displayed
And: The view is scrolled far into the past, so 'today' is not visible
When: The user taps the sobriety timer component
Then: The calendar should automatically scroll forward
And: The current day ('today') should become visible and centered in the viewport

Acceptance Criteria:
- [ ] Verify the calendar scrolls in the forward direction (towards future dates).
- [ ] Verify the element representing 'today' becomes visible after the scroll animation completes.
- [ ] Verify the week containing 'today' is positioned approximately in the center of the calendar grid viewport.

## Scenario 3: Tap Timer When Scrolled to Future
Given: The calendar is displayed
And: The view is scrolled far into the future, so 'today' is not visible
When: The user taps the sobriety timer component
Then: The calendar should automatically scroll backward
And: The current day ('today') should become visible and centered in the viewport

Acceptance Criteria:
- [ ] Verify the calendar scrolls in the backward direction (towards past dates).
- [ ] Verify the element representing 'today' becomes visible after the scroll animation completes.
- [ ] Verify the week containing 'today' is positioned approximately in the center of the calendar grid viewport.