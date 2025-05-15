## Scenario 1: Integration with Onboarding Flow

Given: The OnboardingDrinkQuantityContainer is rendered as part of the onboarding flow
When: The onboarding flow reaches the drink quantity step
Then: The container renders the DrinkQuantityInput component
And: The "Next" button is initially disabled
And: No "Cancel" button is displayed

Acceptance Criteria:
- [ ] The container properly renders the core DrinkQuantityInput component
- [ ] The container does not show a Cancel button (onboarding mode only)
- [ ] The Next button starts in a disabled state until valid input

## Scenario 2: Persisting drink quantity during onboarding

Given: The user is on the drink quantity step during onboarding
When: The user enters a valid quantity (e.g., "7")
And: The user taps the "Next" button
Then: The entered quantity is saved to persistent storage
And: The onboarding flow advances to the next screen

Acceptance Criteria:
- [ ] The quantity value is successfully saved to the repository when submitted
- [ ] The value persists between app restarts
- [ ] The onboarding flow advances to the next screen after saving

## Scenario 3: Error handling during persistence

Given: The user is on the drink quantity step during onboarding
When: The user enters a valid quantity
And: The user taps the "Next" button
And: An error occurs during the save operation
Then: An appropriate error message is displayed
And: The user remains on the same screen

Acceptance Criteria:
- [ ] Error cases are handled gracefully
- [ ] User is notified of any errors during saving
- [ ] Navigation doesn't proceed if saving fails

## Scenario 4: Passing onboarding reference to container

Given: The OnboardingComponent has a reference to the onboarding swiper
When: The OnboardingDrinkQuantityContainer is rendered as part of onboarding
Then: The container receives the onboarding reference
And: Uses it to navigate after successful submission

Acceptance Criteria:
- [ ] The OnboardingComponent correctly passes the onboarding reference to the container
- [ ] The container uses the reference to call the goNext() method after successful save

## Scenario 5: Retry after save error

Given: The user is on the drink quantity step during onboarding
And: A previous save attempt has failed
When: The user tries to submit again with a valid value
Then: The system attempts to save again
And: If successful, the onboarding advances to the next screen

Acceptance Criteria:
- [ ] Error states are cleared when the user retries
- [ ] Subsequent save attempts work if the error condition is resolved
- [ ] Navigation proceeds once saving succeeds 