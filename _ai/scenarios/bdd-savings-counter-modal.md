# Savings Counter Modal Interaction BDD Scenarios

## UI Interaction Scenarios

Scenario 1: Opening the Settings Modal
Given: The user is on any screen with the SavingsCounter component visible
When: The user taps on the SavingsCounter component
Then: A modal should slide up from the bottom using iOS pageSheet presentation style
And: The modal should display the SettingsDrinkQuantityContainer

Acceptance Criteria:
- [ ] SavingsCounter component is pressable
- [ ] Modal animates smoothly from bottom using 'slide' animation
- [ ] Modal uses iOS pageSheet presentation style
- [ ] SettingsDrinkQuantityContainer is rendered within the modal
- [ ] Safe area insets are properly handled

Scenario 2: Displaying Current Drink Quantity
Given: The user has previously saved a drink quantity value
When: The settings modal is opened
Then: The current drink quantity should be displayed in both the label and input field
And: The value should reflect the most recently saved data

Acceptance Criteria:
- [ ] Current drink quantity is pre-populated in the input field
- [ ] Current drink quantity is displayed in the label/heading
- [ ] Values are consistent with persisted data
- [ ] Handles case where no value has been previously saved (shows appropriate default or placeholder)

Scenario 3: Closing the Settings Modal
Given: The settings modal is open
When: The user performs any of these actions:
  - Swipes down on the modal
  - Taps the close button
  - Taps outside the modal
Then: The modal should dismiss
And: Return to the previous screen state

Acceptance Criteria:
- [ ] Modal responds to swipe gesture
- [ ] Close button is visible and functional
- [ ] Modal dismisses smoothly with animation
- [ ] Previous screen state is preserved

## Data Update Scenarios

Scenario 4: Immediate Savings Update After Save
Given: The settings modal is open with SettingsDrinkQuantityContainer
And: The user has modified the drink quantity value
When: The user taps the save button
Then: The new value should be saved
And: The modal should dismiss
And: The SavingsCounter should immediately update with the new calculation

Acceptance Criteria:
- [ ] Save operation completes successfully
- [ ] Modal dismisses after successful save
- [ ] New savings amount is displayed immediately after recalculation
- [ ] No app reload or navigation is required to see the update

Scenario 5: Handling Save Errors
Given: The settings modal is open
And: The user has modified the drink quantity
When: The save operation fails
Then: An error message should be displayed
And: The modal should remain open
And: The previous savings amount should remain unchanged

Acceptance Criteria:
- [ ] Error message is clearly displayed within the modal
- [ ] Modal stays open on error
- [ ] User can retry the save operation
- [ ] Previous savings amount is preserved until successful save
- [ ] Error state is cleared when user modifies input again

Scenario 6: Loading State Management
Given: The settings modal is open
When: The save operation is in progress
Then: The save button should be disabled
And: A loading indicator should be displayed
And: The modal should prevent dismissal during save

Acceptance Criteria:
- [ ] Save button shows loading state
- [ ] Save button is disabled during operation
- [ ] Modal cannot be dismissed during save operation
- [ ] Loading state is cleared after operation completes
- [ ] User cannot interact with form during save operation

Implementation Notes:
- Relates to User Story US-35 (modal interaction and immediate update)
- Requires coordination between SavingsDataContext and SettingsDrinkQuantityContainer
- Modal should handle safe area insets properly
- Should prevent multiple simultaneous save operations
- Should handle network/storage errors gracefully
- Should maintain proper state management during modal transitions
- Should maintain consistency between displayed values and persisted data 