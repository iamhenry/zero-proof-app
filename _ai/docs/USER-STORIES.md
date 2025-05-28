# Overview

This iOS app empowers individuals aiming to reduce or eliminate alcohol consumption by offering a data-driven accountability tool focused on tracking sobriety streaks, financial savings, and health milestones. Tailored for those struggling with alcohol dependence, it simplifies progress visualization through a scrollable calendar interface (inspired by GitHub’s activity graph) where daily tiles log sobriety status or drink counts. Core features include real-time timers for sobriety duration, customizable savings trackers tied to alcohol expenses, milestone badges for motivation (e.g., 7 days sober), and a personal "why" section for grounding users in their goals.

# User Stories

## Account Management
- [x] US-01: As a user, I want to create an account so that my sobriety data can be preserved if I delete and reinstall the app.
- [x] US-02: As a user, I want to log in with my credentials so I can access my sobriety data in case I need to reinstall the app.
- [ ] as a user i want to see my subscription type (eg. weekly, monthly, etc) in the settings view with a deeplink to the OS settings to manange my subscriptions
  - [ ] it should have the email address i used to sign up.
  - [ ] a deeplink to the ios subscripton settings screen
  - [ ] a green "Pro" badge to indicate the user has subscribed

## Calendar Interaction and Visualization
- [x] US-03: As a user, I want to view a calendar-style activity graph (like github activity graph) on the main screen so I can visualize my sobriety progress at a glance.
- [x] US-04: As a user, I should see consecutive sober days become a darker color in the UI indicating my sober streak.
- [x] US-05: As a user, I want to mark each day as either sober or not sober by tapping on calendar tiles so I can track my progress.
- [x] US-06: As a user, I want to tap on a calendar day to mark it as "sober" and have the day's color update immediately on a scale from 1–10, so I receive instant visual confirmation of my progress.
- [x] US-07: As a user, I want the darkness of the day to reflect my consecutive streak (with a darker shade indicating a longer streak), so I can quickly assess my ongoing progress.
- [x] US-08: As a user, I want to be able to undo or correct a mistaken entry by tapping a day again, ensuring the calendar accurately reflects my progress.
- [x] US-09: As a user, I want the current day to be visually distinguished, so I can easily identify and update today's status.
- [x] US-10: As a user, I want to scroll vertically through a continuous calendar grid that seamlessly merges weeks from different months without any gaps, so that I can effortlessly review my past, current, and upcoming days in a coherent, uninterrupted view.
- [x] US-11: As a user, I want the color intensity of the day cells to reflect the level of activity or data frequency, so that I can quickly see which days had more or less activity.

## Calendar Display and Navigation
- [x] US-12: As a user, I want to view a calendar grid with days of the week as columns and consecutive days without gaps, so that I can easily understand the layout of time.
- [x] US-13: As a user, I want to see weekday headers (e.g., M, T, W, Th, F, S, S) at the top of the calendar, so that I can identify the days of the week.
- [x] US-14: As a user, I want to scroll vertically through the calendar to view different months and years, with the calendar loading more data automatically as I scroll, so that I can access any date range seamlessly.
- [x] US-15: As a user, I want to tap the timer component at any time, and have the calendar automatically scroll to center the current day ('today') in the viewport, so that I can easily navigate back to the present day regardless of my current scroll position.

## Timer Functionality
- [x] US-16: As a user, I want to view an active timer showing how long I've been sober in days, hours, minutes, and seconds so I can see my real-time progress.
- [x] US-18: As a user, I want the app to continue tracking my timer in the background so that the timer remains accurate even when I'm not using the app (via persistent state).
- [x] US-19: As a user, the timer should display and track how many days, hours, minutes, and seconds I've been sober, accurately reflecting the duration of the current continuous sober streak ending today.
- [x] US-T1 (Refines original Line 35): As a user, if I mark today as sober and the previous day was *not* sober, the timer should start counting elapsed time from the *exact moment* I marked today sober.
 - [x] US-T2 (New - Continuation): As a user, if I mark today as sober and the previous day *was* also sober, the timer should continue counting from the start time established by the current streak.
 - [x] US-T3 (Refines original Line 36): As a user, when I mark past days as sober (backfilling), the timer should recalculate based on the *new continuous streak* ending today. If the first day of this recalculated streak was backfilled (or doesn't have a specific start time recorded), the timer should calculate the duration from the *beginning of that day (midnight local time)*.
- [x] US-T4 (Refines original US-17/US-20/US-21): As a user, if the current day is *not* marked as sober, the timer reflecting the ongoing streak should reset all units to zero (0d, 0h, 0m, 0s), clearly indicating the streak is not active *today*.

## Streak Tracker
- [x] US-22: As a user, I want to see my current streak of consecutive sober days so I can stay motivated to maintain it floating above the calendar.
- [x] US-23: As a user, I want to see another stat showing my longest streak count.



## Financial Tracking
- [x] US-25: As a user, I want to see a single stat showing how much money I've saved based on the total amount of sober days tracked in the app and a predetermined drink consumption rate.
  - [x] US-25.1: The financial counter should update in real-time if I toggle on/off a sober day.
  - [x] US-25.2: The savings calculation should use the formula: savings = pricePerDrink × drinksPerDay × totalSoberDays.
  - [x] US-25.3: For the MVP, the pricePerDrink and drinksPerDay values will be hardcoded constants.
- [ ] US-26: As a user, I want to input the quantity of drinks I typically consume per day so the app can calculate my financial savings more accurately.
  - [x] US-26.1: The settings UI should allow me to enter my typical daily drink consumption.
  - [x] US-26.2: The financial savings calculation should update immediately when I change my drink quantity.
- [x] US-35. As a user, I want to tap on the financial counter to display the screen for the settings that allows me to edit and update the financial counter. And I should be able to save it and it does the recalculation for the financial component.
  - [x] i should be able to cancel the edit
  - [x] i should be able to close the screen
  - [x] the savings counter component should update immediable upon tapping the save button with the updated value

## Onboarding
- [x] US-31: As a first-time user, after logging in and before seeing the home screen, I want to go through a mandatory onboarding flow so that I can understand the app's key features (like the heatmap, streak counter, and savings tracker) and provide my typical weekly drink consumption to personalize my experience. I understand this flow concludes with information about premium features and that I will only need to complete this onboarding once.
- [x] US-32: As a user, during the onboarding flow, I want to enter the drink quantity (the user will enter the amount for the week, which we will then calculate into days; e.g., the user enters 7 for weekly, and we calculate that as 1 drink per day) into a form that will be used to calculate my savings (in the `savings counter` component) for the days I've marked as sober.
  - [x] US-32.1: Note: we currently have hard coded values to calculate the savings amount. This input from the form will replace one of those values so the counter component is more accurate.
- [x] US-33: As a user, I want to see a paywall screen with a simple dismissal button that simulates a purchase, so that I can understand the premium features available in the app.
  - [x] note: this is just for testing. we will enable in app purchase into this paywall screen and the user will be able to start their trial.
- [x] us-34. As a user, I want to be able to see my options for the paywall that will enable me to access all the features of the app. The paywall should be at the end of the onboarding experience.


# Backlog

## Calorie Tracker
- [ ] US-24: As a user, I want to see a single stat showing how many calories I've prevented from being sober so I can stay motivated to maintain it.

## Consumption Tracking
- [ ] US-28: As a user, I want to log the number of drinks I consumed on non-sober days so I can track my consumption patterns.

## Social Features
- [ ] US-29: As a user, I want to be able to share my current streak what will be shown as a graphic of the calendar activity of the sober days so I can share my progress with my close friends and family.

