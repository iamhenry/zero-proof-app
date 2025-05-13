## Scenario 1: Initial state of the Drink Quantity Input

Given: The user is on the screen requiring drink quantity input
When: The Drink Quantity Input component is displayed
Then: The input placeholder shows "0"
And: The "Next" button is disabled

Acceptance Criteria:
- [ ] The component renders with the initial value of 0 placeholder displayed.
- [ ] The submit button is initially in a disabled state.

## Scenario 2: Entering a valid positive integer

Given: The Drink Quantity Input component is displayed
And: The input placeholder display shows "0"
When: The user enters a valid positive integer using the numeric keypad (e.g., "7")
Then: The input display updates to show the entered number (e.g., "7")
And: The "Next" button becomes enabled

Acceptance Criteria:
- [ ] The displayed number updates correctly as digits are entered.
- [ ] The submit button transitions to an enabled state when a valid positive number is entered.

## Scenario 3: Entering zero after entering a positive integer

Given: The Drink Quantity Input component is displayed
And: The input display shows a valid positive integer (e.g., "7")
And: The "Next" button is enabled
When: The user clears the input or enters "0"
Then: The input display shows "0"
And: The "Next" button becomes disabled

Acceptance Criteria:
- [ ] Entering 0 or clearing the input results in the display showing "0".
- [ ] The submit button transitions back to a disabled state when the input is 0.

## Scenario 4: Attempting to enter a negative number (via Zod validation)

Given: The Drink Quantity Input component is displayed
When: The user attempts to submit a value that is considered negative by the validation schema (e.g., due to internal handling or initial value)
Then: A validation error message is displayed (e.g., "Please enter a quantity greater than 0")
And: The "Next" button remains disabled

Acceptance Criteria:
- [ ] The component's validation logic prevents submission of negative numbers.
- [ ] An appropriate error message is shown for invalid negative input.
- [ ] The submit button remains disabled for invalid negative input.

## Scenario 5: Submitting a valid positive integer

Given: The Drink Quantity Input component is displayed
And: The input display shows a valid positive integer (e.g., "10")
And: The "Next" button is enabled
When: The user taps the "Next" button
Then: The callback function is called with the entered quantity (e.g., 10)

Acceptance Criteria:
- [ ] Tapping the enabled submit button triggers the `onSubmit` callback.
- [ ] The callback receives the correct, validated numerical quantity.

## Scenario 6: Attempting to submit zero or empty input

Given: The Drink Quantity Input component is displayed
And: The input display shows "0" or is empty
And: The "Next" button is disabled
When: The user taps the "Next" button
Then: The callback function is NOT called

Acceptance Criteria:
- [ ] Tapping the disabled submit button does not trigger the `onSubmit` callback.
- [ ] Submission is prevented when the input is 0 or empty.