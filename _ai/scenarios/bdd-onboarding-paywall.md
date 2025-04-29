## Scenario 1: Display static paywall screen
Given: The user has reached the end of the onboarding experience
When: The paywall screen is displayed
Then: The user should see the static paywall content
And: The user should see the app icon image

Acceptance Criteria:
- [ ] The screen displays the static content as defined in the initial request.
- [ ] The `assets/onboarding/onboarding-app-icon.png` image is visible on the screen.

## Scenario 2: Dismiss onboarding from paywall screen
Given: The user is viewing the paywall screen
And: The "start" or equivalent button is visible
When: The user taps the "start" or equivalent button
Then: The onboarding experience should be dismissed

Acceptance Criteria:
- [ ] Tapping the button triggers the `onDone` callback.
- [ ] The user is no longer viewing the onboarding screens.