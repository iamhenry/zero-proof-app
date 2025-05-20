## Bug Description
Future calendar dates fail to load when scrolling to the bottom, unless past dates have been loaded first.

## Steps to Reproduce
1. Open the app and navigate to the calendar view (initial view shows current/recent dates, e.g., April/May 2024 in the video).
2. Scroll down towards the future, past the initially loaded dates (e.g., past May, into June 2024).
3. Observe that when you reach the bottom of the currently rendered dates (e.g., around June 15-21 in the video at 0:03), no new future dates are fetched or displayed. The view stops scrolling further down.
4. Now, scroll upwards towards the past, past the initially loaded dates (e.g., past April, March, etc.).
5. Continue scrolling up to trigger the fetching and display of older, past dates (e.g., January 2024, December 2023, as seen from 0:05-0:11 in the video).
6. Once past dates have been loaded, scroll back down towards the future, past the initial set of dates and towards the bottom again (as seen from 0:11-0:15).
7. Observe that this time, upon reaching the bottom of the previously rendered set of future dates (e.g., June 2024), the app now correctly fetches and displays new future dates (e.g., July, August, September 2024, as seen at 0:16).

## Expected Behavior
When scrolling to the bottom of the currently displayed future dates in the calendar, the app should automatically trigger the fetching and display of subsequent future dates, allowing for continuous scrolling into the future. This should happen regardless of whether past dates have been fetched in the current session.

## Actual Behavior
Initially, scrolling to the bottom of the calendar does not trigger the loading of future dates. The calendar appears to "end." However, if the user first scrolls upwards to load past dates, and then scrolls back down to the bottom, the function to load future dates is then correctly triggered, and new future dates are displayed.

## Supplementary Information
- Screenshots/Videos: Video provided, demonstrating the issue clearly.
    - 0:00-0:03: Initial scroll to bottom, no new future dates load.
    - 0:03-0:11: Scroll to top, past dates load successfully.
    - 0:11-0:16: Scroll back to bottom, new future dates now load.
- Frequency: Always (Reproducible every time with the steps above based on the video).
- Related Features: Calendar view, infinite scrolling mechanism, future date fetching logic, past date fetching logic. The issue seems to be with the trigger or state management for fetching future dates specifically on the initial downward scroll, which might be incorrectly dependent on a state modified by fetching past dates.

---

# Bug Report: Calendar Future Dates Loading Issue

## Issue Summary
Future calendar dates fail to load when scrolling to the bottom, unless past dates have been loaded first. This creates a poor user experience where it appears that the calendar "ends" prematurely until the user scrolls up to load past dates.

## Diagnosis Process

### Initial Analysis
When examining the bug report, several hypotheses were formulated:

1. FlatList Content Size Calculation Issue
2. State Management in `isLoadingFuture`
3. Race Condition in Initial Loading
4. Scrolling Threshold Detection Issue
5. Component Mount/Update Lifecycle Issues
6. Data Structure Problems
7. Interaction between `maintainVisibleContentPosition` and `onEndReached`

### Instrumentation Added
To diagnose the issue, we added comprehensive logging to:

1. Track content size changes in the FlatList
2. Monitor the `isLoadingFuture` and `isLoadingPast` state flags
3. Track scroll events and measure distance from the end of content
4. Log when the `onEndReached` callback is triggered
5. Track when `loadFutureWeeks()` is called or skipped

### Key Findings

The logs revealed the root cause:

```
[BUG-DIAGNOSIS] onEndReached triggered with distanceFromEnd: 0
[CalendarGrid:handleEndReached] onEndReached triggered. isProgrammaticScrolling: true isLoadingFuture: false
[CalendarGrid:handleEndReached] Skipping due to programmatic scrolling
```

When the user scrolls to the bottom of the calendar initially, the `onEndReached` event is correctly triggered, but the `handleEndReached` function returns early because `isProgrammaticScrolling` is set to `true`. This flag is set during initial calendar rendering to prevent loading interference during the automatic scroll to today's date.

When past dates are loaded by scrolling up, the component re-renders and `isProgrammaticScrolling` is reset to `false`, which allows `handleEndReached` to successfully call `loadFutureWeeks()` when the user scrolls back down to the bottom.

## Root Cause

The bug is caused by the `isProgrammaticScrolling` flag not being properly reset after the initial automatic scroll to today's date is completed. This flag is designed to prevent loading more data during programmatic scrolling operations, but in this case, it's preventing the `loadFutureWeeks()` function from being called when the user manually scrolls to the bottom of the calendar.

## Proposed Solution

The fix should focus on ensuring the `isProgrammaticScrolling` flag is properly reset after the initial automatic scroll to today's date is completed:

1. Modify the timeout in the `useEffect` hook that performs the initial scroll to today to ensure the `isProgrammaticScrolling` flag is reliably reset.

2. Consider adding an additional safeguard that detects and resets the flag if user-initiated scrolling is detected while the flag is still set to `true`.

3. Add a proper cleanup for the `isProgrammaticScrolling` flag in the `scrollToToday` function to ensure it's reset even if an error occurs.

## Implementation Plan

1. Modify the `useEffect` hook in `CalendarGrid.tsx` that handles the initial scroll to properly reset the `isProgrammaticScrolling` flag using a more reliable approach.

2. Add additional checks in the `handleScroll` function to detect user-initiated scrolling and reset the flag if necessary.

3. Ensure the `scrollToToday` function in `CalendarDataContext.tsx` properly resets the `isProgrammaticScrolling` flag in all cases.

4. Add comprehensive tests to verify the fix across different scrolling scenarios.

## Expected Outcome

After implementing the fix, users should be able to:
1. Open the app and see the calendar with current/recent dates
2. Scroll down to the bottom of the calendar
3. Automatically load and see future dates without having to first scroll up to load past dates

This will provide a seamless infinite scrolling experience in both directions as originally intended. 