## Scenario 1: Initial state of the Drink Quantity Settings Form

Given: The user navigates to the Settings screen
When: The DrinkQuantityInput component loads in settings mode
Then: The input field is pre-populated with the saved drink quantity value
And: If no value exists, a default placeholder "0" is shown
And: The "Save" button is disabled until a valid value is entered
And: A "Cancel" button is visible

Acceptance Criteria:
- [ ] The component renders with any previously saved value
- [ ] The submit button displays "Save" text (not "Next")
- [ ] The submit button is initially disabled if the value is 0 or invalid
- [ ] A cancel button is visible in settings mode

## Scenario 2: Entering a valid quantity value in settings

Given: The user is on the Settings screen with the DrinkQuantityInput displayed
When: The user enters a valid positive integer (e.g., "5")
Then: The input field displays the entered value
And: The "Save" button becomes enabled

Acceptance Criteria:
- [ ] The displayed value updates as digits are entered
- [ ] The Save button transitions to an enabled state when a valid positive number is entered

## Scenario 3: Saving the drink quantity value

Given: The user has entered a valid drink quantity in settings mode
And: The "Save" button is enabled
When: The user taps the "Save" button
Then: The entered value is saved to persistent storage
And: A success feedback is shown to the user
And: The settings screen closes or navigates back

Acceptance Criteria:
- [ ] The entered value is correctly saved to the repository
- [ ] The user receives visual feedback that the value was saved
- [ ] The component triggers appropriate navigation or screen state change

## Scenario 4: Canceling changes in settings mode

Given: The user has entered a new drink quantity value
When: The user taps the "Cancel" button
Then: The changes are discarded
And: The settings screen closes or navigates back without saving

Acceptance Criteria:
- [ ] No data is saved to persistent storage when canceling
- [ ] The previous value in storage remains unchanged
- [ ] The component triggers appropriate navigation or screen state change

## Scenario 5: Loading existing data when entering settings

Given: The user has previously saved a drink quantity of "8"
When: The user navigates to the Settings screen
Then: The DrinkQuantityInput displays "8" as the current value

Acceptance Criteria:
- [ ] The component correctly fetches and displays the existing value from storage
- [ ] The UI reflects the loaded value immediately upon component mounting
- [ ] The Save button is initially disabled (as no changes have been made yet)

## Scenario 6: Real-time savings calculation update

Given: The user has saved a drink quantity value
And: The SavingsCounter component is visible elsewhere in the app
When: The user changes and saves a new drink quantity in settings
Then: The SavingsCounter immediately reflects the new calculation based on the updated quantity

Acceptance Criteria:
- [ ] Saving a new quantity triggers a recalculation of displayed savings
- [ ] The SavingsCounter component updates without requiring an app reload
- [ ] The calculation uses the newly saved quantity value 