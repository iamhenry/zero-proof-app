# BDD Scenarios: Settings Subscription Profile

## Feature: User Profile and Subscription Management in Settings

### Background
Users need to view their subscription status, personal information, and manage their subscription directly from the settings screen. This feature displays the user's avatar (first letter of email), subscription status with a "Pro" badge, email address, and provides access to iOS subscription management.

---

## Scenario 1: Extract and Display First Letter from User Email
Given I am a logged-in user with email "john.doe@example.com"
  And I navigate to the settings screen
When the settings screen loads
Then I should see an avatar displaying the letter "J"
  And the letter should be extracted from my email address
  And the letter should be displayed in uppercase format

### Acceptance Criteria:
* Avatar displays the first letter (uppercase) of the user's email address
* Avatar renders correctly for all email formats (including special characters and numbers)
* Loading state is handled gracefully while fetching user data
* Empty or null email addresses display a default fallback character
* Non-ASCII characters are handled properly (e.g., álex@example.com shows "Á")

### Edge Cases to Consider:
* Empty/Null Conditions - Email address is null, empty string, or undefined
* Boundary Values - Emails starting with numbers, special characters, or unicode
* Connectivity Scenarios - Slow loading of user data from Supabase

---

## Scenario 2: Display Pro Badge Based on Active Subscription Status
Given I am a logged-in user with an active subscription
  And I navigate to the settings screen
When the settings screen loads and checks my subscription status
Then I should see a "Pro" badge displayed with my avatar
  And the badge should only appear if I have active entitlements
  And my subscription status should be verified through RevenueCat

### Acceptance Criteria:
* Pro badge appears only for users with active subscriptions
* Subscription status is verified through RevenueCat integration
* Badge display updates when subscription status changes
* Multiple subscription tiers are handled correctly
* Trial subscriptions display the badge appropriately

### Edge Cases to Consider:
* State Transitions - Subscription expires while user is viewing settings
* Connectivity Scenarios - RevenueCat data is unavailable or slow to load
* Permission Variations - Different subscription tiers, trial states, or grace periods

---

## Scenario 4: Retrieve and Display User Email from Authentication Context
Given I am a logged-in user with email "user@example.com"
  And I navigate to the settings screen
When the settings screen loads
Then I should see my email address retrieved from Supabase authentication
  And the email should be displayed exactly as registered
  And the email data should be fetched from the user context

### Acceptance Criteria:
* Email address is retrieved from Supabase authentication context
* Email is displayed exactly as registered in the system
* Long email addresses are handled gracefully
* Email updates in real-time if authentication context changes
* Email retrieval errors are handled without breaking the interface

### Edge Cases to Consider:
* Boundary Values - Very long email addresses or unusual formats
* Empty/Null Conditions - Missing or corrupted email data in authentication context
* State Transitions - User updates email while viewing settings

---

## Scenario 5: Navigate to iOS Subscription Management via Deep Link
Given I am on the settings screen
  And I can see the "Manage Subscription" option
When I tap on the "Manage Subscription" item
Then the system should open the iOS Settings app using a deep link
  And I should be redirected to the Subscriptions management page
  And the deep link should work regardless of my subscription status

### Acceptance Criteria:
* Deep link successfully opens iOS Settings app
* User is directed specifically to the Subscriptions page
* Deep link functionality works consistently across iOS versions
* Feature works for both subscribed and non-subscribed users
* System handles cases where iOS Settings cannot be opened

### Edge Cases to Consider:
* Permission Variations - iOS Settings access restrictions or parental controls
* Resource Constraints - iOS Settings app fails to open or crashes
* Interruption Patterns - User cancels navigation or immediately returns to app

---

## Scenario 6: Handle Subscription Status Loading and Async Operations
Given I am on the settings screen
  And subscription data is being fetched from RevenueCat
When the subscription status check is in progress
Then the interface should remain functional during loading
  And subscription-dependent elements should wait for verification
  And loading operations should not block other screen functionality

### Acceptance Criteria:
* Interface remains responsive during subscription status loading
* Pro badge waits for subscription verification before displaying
* Loading operations have appropriate timeouts
* Multiple concurrent subscription checks are handled properly
* User can interact with non-subscription elements during loading

### Edge Cases to Consider:
* Connectivity Scenarios - Poor network causing extended loading times
* Resource Constraints - RevenueCat API rate limiting or service errors
* State Transitions - Rapid subscription status changes during loading

---

## Scenario 7: Handle RevenueCat Integration Failures Gracefully
Given I am on the settings screen
  And RevenueCat service is unavailable or returns an error
When the settings screen attempts to verify subscription status
Then the system should gracefully handle the failure
  And core functionality should remain available
  And subscription-dependent features should default to safe states

### Acceptance Criteria:
* Graceful degradation when subscription status cannot be determined
* No application crashes due to RevenueCat integration errors
* Core settings functionality remains intact regardless of subscription errors
* Error states are logged for debugging without user notification
* Subscription management options remain available through fallback methods

### Edge Cases to Consider:
* Connectivity Scenarios - Network interruption during RevenueCat API calls
* Resource Constraints - RevenueCat service downtime, maintenance, or rate limiting
* Concurrency Issues - Multiple simultaneous subscription verification attempts
* State Persistence - Handling cached subscription states during service failures 