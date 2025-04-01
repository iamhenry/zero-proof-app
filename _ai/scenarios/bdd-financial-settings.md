# Financial Settings BDD Scenarios

Scenario 1: Entering the typical drink quantity
Given: The user is on the Financial Settings screen
When: The user enters a value into the "Typical Drink Quantity" input field (representing a standard period, e.g., per week or month)
And: The user saves the settings
Then: The entered value should be accepted and displayed in the input field

Acceptance Criteria:
- [ ] Input field accepts numeric values for the quantity of drinks for a standard period.
- [ ] A save action (e.g., button press, blur event) triggers the saving process.
- [ ] Visual confirmation of save is provided (optional).

Scenario 2: Persisting the drink quantity locally
Given: The user has entered and saved a typical drink quantity
When: The save action is completed
Then: The entered drink quantity value should be saved to local persistence

Acceptance Criteria:
- [ ] The drink quantity value is successfully written to the designated local storage key.
- [ ] Appropriate data format (e.g., number) is used for storage.

Scenario 3: Loading the saved drink quantity on revisit
Given: The user has previously saved a typical drink quantity
When: The user navigates to the Financial Settings screen
Then: The input field should be pre-populated with the previously saved drink quantity value

Acceptance Criteria:
- [ ] The app reads the drink quantity value from local persistence when the settings screen loads.
- [ ] The input field correctly displays the loaded value.
- [ ] If no value was previously saved, the input field is empty or shows a default placeholder.

Scenario 4: Loading the saved drink quantity after app restart
Given: The user has previously saved a typical drink quantity
When: The user closes and reopens the app
And: The user navigates to the Financial Settings screen
Then: The input field should be pre-populated with the previously saved drink quantity value

Acceptance Criteria:
- [ ] Persisted drink quantity survives app termination and relaunch.
- [ ] The app successfully reads the value from local persistence after restart.
- [ ] The settings screen displays the correct loaded value.

Scenario 5: Using the persisted drink quantity in savings calculations
Given: The user has saved a typical drink quantity
And: A hardcoded cost per drink is defined
And: The user has a history of sober days
When: The app calculates financial savings (e.g., for the SavingsCounter component)
Then: The calculation should use the persisted quantity, the hardcoded cost, and the total number of sober days to determine the savings

Acceptance Criteria:
- [ ] Financial calculation logic reads the drink quantity from local persistence.
- [ ] Financial calculation logic uses the hardcoded cost per drink.
- [ ] Financial calculation logic reads the total number of persisted sober days.
- [ ] Savings displayed reflect a calculation based on these three inputs (total sober days, persisted quantity, hardcoded cost).
- [ ] If no quantity is saved, calculations might use a default value (e.g., 0) or prompt the user.

Scenario 6: Editing the drink quantity recalculates total savings
Given: The user has saved a typical drink quantity
And: The user has a history of sober days
And: The current calculated savings are displayed
When: The user enters a new drink quantity in settings and saves
And: The app recalculates financial savings
Then: The displayed financial savings should update based on the *entire* sober day history, the *new* quantity, and the hardcoded cost

Acceptance Criteria:
- [ ] Saving a new quantity triggers a recalculation of the total savings displayed.
- [ ] The recalculation uses the newly persisted quantity.
- [ ] The recalculation considers the full history of persisted sober days and the hardcoded cost.
- [ ] The displayed savings value updates accurately based on the new inputs.

Implementation Notes:
- Relates to User Story US-26 (inputting quantity) and US-25 (displaying savings).
- Requires local storage implementation (Task 8).
- Assumes a hardcoded cost per drink initially.
- The interpretation of the "Typical Drink Quantity" (e.g., per week, per month) is handled within the calculation logic.
- Input component likely resides in `components/ui/settings/DrinkCostForm.tsx` (to be created) or similar.
- Calculation logic likely resides in `lib/services/financial-service.ts` (to be created).
- Requires access to persisted calendar data (total sober days).