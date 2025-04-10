# Feature: Financial Savings Calculation

As a user, I want to see how much money I've saved based on my sober days,
so that I can track the financial benefits of my sobriety.

## Scenario 1: Calculate Savings with Positive Sober Days
Given: The user has tracked 10 sober days
And: The price per drink is $5
And: The drinks per day rate is 3
When: The financial savings are calculated
Then: The total savings displayed should be $150 (5 * 3 * 10)

Acceptance Criteria:
- [ ] The calculation uses the formula: savings = pricePerDrink × drinksPerDay × totalSoberDays.
- [ ] The result matches the expected value based on the inputs.

## Scenario 2: Calculate Savings with Zero Sober Days
Given: The user has tracked 0 sober days
And: The price per drink is $5
And: The drinks per day rate is 3
When: The financial savings are calculated
Then: The total savings displayed should be $0

Acceptance Criteria:
- [ ] The calculation handles zero sober days correctly.
- [ ] The displayed savings is $0.

## Scenario 3: Savings Counter Updates When a Sober Day is Added
Given: The user is viewing the savings counter showing $150 based on 10 sober days
And: The price per drink is $5
And: The drinks per day rate is 3
When: The user marks an additional day as sober (total 11 sober days)
Then: The savings counter should update in real-time to display $165 (5 * 3 * 11)

Acceptance Criteria:
- [ ] The savings counter listens for changes in the total sober days count.
- [ ] The displayed savings updates immediately when the sober day count increases.
- [ ] The updated value reflects the correct calculation with the new sober day count.

## Scenario 4: Savings Counter Updates When a Sober Day is Removed
Given: The user is viewing the savings counter showing $150 based on 10 sober days
And: The price per drink is $5
And: The drinks per day rate is 3
When: The user unmarks a sober day (total 9 sober days)
Then: The savings counter should update in real-time to display $135 (5 * 3 * 9)

Acceptance Criteria:
- [ ] The savings counter listens for changes in the total sober days count.
- [ ] The displayed savings updates immediately when the sober day count decreases.
- [ ] The updated value reflects the correct calculation with the new sober day count.

## Scenario 5: MVP Hardcoded Values Usage
Given: The application is running in MVP configuration
And: The user has tracked 7 sober days
When: The financial savings are calculated
Then: The calculation must use the hardcoded MVP values for pricePerDrink and drinksPerDay

Acceptance Criteria:
- [ ] The `financial-service.ts` uses predefined constants for `pricePerDrink` during MVP.
- [ ] The `financial-service.ts` uses predefined constants for `drinksPerDay` during MVP.
- [ ] The calculation result is based on these hardcoded values and the current sober day count.