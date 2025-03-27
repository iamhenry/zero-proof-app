# Overview

This iOS app empowers individuals aiming to reduce or eliminate alcohol consumption by offering a data-driven accountability tool focused on tracking sobriety streaks, financial savings, and health milestones. Tailored for those struggling with alcohol dependence, it simplifies progress visualization through a scrollable calendar interface (inspired by GitHub’s activity graph) where daily tiles log sobriety status or drink counts. Core features include real-time timers for sobriety duration, customizable savings trackers tied to alcohol expenses, milestone badges for motivation (e.g., 7 days sober), and a personal "why" section for grounding users in their goals.

# User Stories

## Account Management
- [x] As a user, I want to create an account so that my sobriety data can be preserved if I delete and reinstall the app.
- [x] As a user, I want to log in with my credentials so I can access my sobriety data in case I need to reinstall the app.

## Calendar Interaction and Visualization
- [x] As a user, I want to view a calendar-style activity graph (like github activity graph) on the main screen so I can visualize my sobriety progress at a glance.
- [x] As a user, I should see consecutive sober days become a darker color in the UI indicating my sober streak.
- [x] As a user, I want to mark each day as either sober or not sober by tapping on calendar tiles so I can track my progress.
- [x] As a user, I want to tap on a calendar day to mark it as "sober" and have the day's color update immediately on a scale from 1–10, so I receive instant visual confirmation of my progress.
- [x] As a user, I want the darkness of the day to reflect my consecutive streak (with a darker shade indicating a longer streak), so I can quickly assess my ongoing progress.
- [x] As a user, I want to be able to undo or correct a mistaken entry by tapping a day again, ensuring the calendar accurately reflects my progress.
- [x] As a user, I want the current day to be visually distinguished, so I can easily identify and update today's status.
- [x] As a user, I want to scroll vertically through a continuous calendar grid that seamlessly merges weeks from different months without any gaps, so that I can effortlessly review my past, current, and upcoming days in a coherent, uninterrupted view.
- [x] As a user, I want the color intensity of the day cells to reflect the level of activity or data frequency, so that I can quickly see which days had more or less activity.

## Calendar Display and Navigation
- [x] As a user, I want to view a calendar grid with days of the week as columns and consecutive days without gaps, so that I can easily understand the layout of time.
- [x] As a user, I want to see weekday headers (e.g., M, T, W, Th, F, S, S) at the top of the calendar, so that I can identify the days of the week.
- [x] As a user, I want to scroll vertically through the calendar to view different months and years, with the calendar loading more data automatically as I scroll, so that I can access any date range seamlessly.
- [ ] as a user i want to see a button that shows when i've scrolled past the current month that when pressed will take me back to the currrent day (centered to the viewport) so that i can easily get back to the current day without having to manually scroll back

## Timer Functionality
- [ ] As a user, I want to view an active timer showing how long I've been sober in days, hours, and minutes so I can see my real-time progress.
- [ ] As a user, I want to sync the timer so that it reset if I'm not sober that day which breaks the streak. (eg. 5 day sober streak and i missed the 6th day by not tapping the day cell to activate it, the timer show reset)
- [ ] As a user, I want the app to continue tracking my timer in the background so that the timer remains accurate even when I'm not using the app.
- [ ] As a user, the timer should display and track how many days, hours, minutes, and seconds i've been sober and be synced with the calendar component to show the streaks (eg. calendar day cell show 5 day streak, the timer should show 5 days).
- [ ] as a user i should see the timer dispay "Sober 0" if the current day cell is not marked as sober to ensure accuracy
- [ ] as a user i should not see the timer if there are no current streaks or the current day is not marked as sober. Only display the timer if there's an active sober day/s

## Streak Tracker
- [ ] As a user, I want to see my current streak of consecutive sober days so I can stay motivated to maintain it.
- [ ] As a user I want to see another stat showing my longest streak count.

## Calorie Tracker
- [ ] As a user I want to see a single stat showing how many calories i've prevented from being sober so I can stay motivated to maintain it.

## Financial Tracking
- [ ] As a user, I want to input the cost of my typical drink so the app can calculate my financial savings.
- [ ] As a user, I want to see how much money I've saved by not drinking so I can be motivated by the financial benefits.
- [ ] As a user, I want to see a single stat to show how much money I've saved based on a calculation of how much a single drink costs and an average of how drinks I have per week.

## Consumption Tracking
- [ ] As a user, I want to log the number of drinks I consumed on non-sober days so I can track my consumption patterns.

## Social Features
- [ ] As a user, I want to be able to share my current streak what will be shown as a graphic of the calendar activity of the sober days so I can share my progress with my close friends and family.




