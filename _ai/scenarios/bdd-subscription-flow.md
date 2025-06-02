# Subscription Flow Scenarios

## Core Subscription Flow

# Scenario 1: Automatic Subscription Detection on App Launch
  <!-- 
  Context Setting: User opens app after fresh install or returning 
  -->
  Given I am a user with an active subscription in RevenueCat/Apple Connect
    And I have just opened the app
    And I have completed user authentication (sign-in)
  
  When the app loads
  
  Then my subscription status should be automatically detected
    And I should be granted access to premium features
    And my subscription status should be cached locally
    And I should bypass the onboarding flow completely

  ## Acceptance Criteria:
  * Subscription status is verified immediately after authentication
  * Premium features are immediately accessible after verification
  * Local cache is updated with current subscription status
  * User receives visual confirmation of active subscription
  * Onboarding flow is skipped for users with active subscriptions

  ## Edge Cases to Consider:
  * Network connectivity issues during verification
  * Invalid or expired subscription detected
  * Multiple subscription tiers handling
  * Race conditions between local cache and remote verification
  * Authentication completing before subscription verification

# Scenario 2: Local Subscription Status Persistence
  <!-- 
  Context Setting: User has previously verified subscription
  -->
  Given I have previously opened the app with an active subscription
    And my subscription status was cached locally
    And I have completed user authentication (sign-in)
  
  When I open the app again within 24 hours of the last verification
  
  Then I should immediately have access to premium features
    And the app should verify my subscription status in the background
    And I should not see any interruption in service
    And I should bypass the onboarding flow completely

  ## Acceptance Criteria:
  * Immediate access to premium features using cached status (within 24-hour window)
  * Background verification doesn't interrupt user experience
  * Cache expires after 24 hours and requires fresh verification
  * Failed verifications trigger appropriate UI updates
  * Onboarding completion status is remembered independently

  ## Edge Cases to Consider:
  * Cache expiration after 24 hours (requires fresh verification)
  * Subscription expiration during the 24-hour cached period
  * Device time/date manipulation affecting cache validity
  * Multiple device synchronization
  * Onboarding completion cache corruption

# Scenario 3: Successful Purchase Flow
  <!-- 
  Context Setting: User initiates subscription purchase during onboarding
  -->
  Given I am a new user who has just signed in
    And I am viewing the paywall screen during onboarding
    And I have selected a subscription plan
  
  When I complete the purchase through Apple's payment system
    And the purchase is successful
    And RevenueCat confirms the payment data
  
  Then my subscription status should update immediately
    And I should be granted instant access to premium features
    And I should be navigated to the main app interface
    And my onboarding completion should be marked as complete only after successful payment confirmation

  ## Acceptance Criteria:
  * Immediate access to all premium features
  * Proper handling of purchase state persistence
  * Onboarding completion is tracked only after successful in-app purchase payment confirmation
  * Smooth transition from paywall to main app
  * Payment confirmation from RevenueCat/Apple is required before marking onboarding complete

  ## Edge Cases to Consider:
  * Network interruption during purchase
  * Payment processing failures (onboarding remains incomplete)
  * Duplicate purchase attempts
  * Restoration of previous purchases
  * RevenueCat payment confirmation delays or failures

## Feature Access Control

# Scenario 4: Offline Access Management
  <!-- 
  Context Setting: User has no internet connection
  -->
  Given I am a user with a previously verified subscription
    And I have completed the onboarding flow
    And I have no internet connection
  
  When I attempt to use premium features
  
  Then I should have access based on my last known subscription status
    And any new subscription actions should be queued
    And my access should update when connection is restored
    And I should not see onboarding or paywall screens

  ## Acceptance Criteria:
  * Graceful offline handling
  * Proper sync on reconnection
  * Cached subscription state used appropriately
  * Onboarding completion status respected offline

  ## Edge Cases to Consider:
  * Extended offline periods
  * Subscription expiration while offline
  * Failed sync attempts on reconnection
  * Partial connectivity scenarios
  * Cache corruption during offline period

# Scenario 5: Subscription Profile Display
  <!-- 
  Context Setting: User views subscription details
  -->
  Given I am a subscribed user
    And I have completed the onboarding flow
    And I navigate to the settings screen
  
  When I view my subscription profile
  
  Then I should see my subscription type
    And I should see my registered email address
    And I should see a "Pro" badge indicating active subscription
    And I should see a link to manage my subscription in iOS settings

  ## Acceptance Criteria:
  * All subscription details accurately displayed
  * Working deep link to iOS subscription settings
  * Visible Pro badge for active subscriptions
  * Email address matches subscription record

  ## Edge Cases to Consider:
  * Multiple subscription types
  * Subscription management link accessibility
  * Profile data synchronization
  * Display during subscription transitions

# Scenario 6: Subscription Sync with RevenueCat
  <!-- 
  Context Setting: Subscription status changes on RevenueCat
  -->
  Given I have an active subscription
    And I have completed the onboarding flow
    And my subscription status changes in RevenueCat
  
  When the app checks for subscription updates in the background
  
  Then my app subscription status should sync with RevenueCat
    And my local subscription cache should update when changes are detected
    And my app access should adjust accordingly within 5 minutes of RevenueCat changes
    And my 24-hour cache should be updated with the new subscription status
    And I should not be redirected to onboarding flow

  ## Acceptance Criteria:
  * Background sync with RevenueCat detects changes within 5 minutes
  * Local 24-hour cache is updated immediately when changes are detected
  * User access level adjustments happen automatically based on new subscription status
  * Cache-first approach: users get immediate access from cache, sync happens in background
  * Onboarding completion status preserved during subscription changes
  * Background sync does not interrupt user experience

  ## Edge Cases to Consider:
  * Conflicting subscription states between cache and RevenueCat
  * Failed sync operations (cache remains until next successful sync)
  * Rapid subscription status changes within 5-minute window
  * Recovery from sync errors (retry logic)
  * Subscription downgrades or cancellations
  * Network failures during background sync attempts

## Onboarding Flow Management

# Scenario 7: New User First-Time Onboarding Flow
  <!-- 
  Context Setting: Brand new user who has just created account and signed in
  -->
  Given I am a brand new user
    And I have just created an account and signed in successfully
    And I have never completed the onboarding flow before
    And I have no active subscription
  
  When I access the protected area of the app for the first time
  
  Then I should immediately see the onboarding flow
    And I should progress through all onboarding screens (heatmap, streak, savings, drink input)
    And I should see the paywall screen as the final step
    And I should be required to complete a successful in-app purchase to access the main app
    And onboarding should only be marked complete after payment confirmation

  ## Acceptance Criteria:
  * Onboarding flow is triggered immediately after first successful sign-in
  * All onboarding screens are displayed in correct sequence
  * Paywall is presented as the final mandatory step
  * No access to main app features until successful in-app purchase payment confirmation
  * Onboarding completion is tracked only after RevenueCat/Apple confirms successful payment
  * Users who reach paywall but don't complete purchase remain in "onboarding incomplete" state

  ## Edge Cases to Consider:
  * User closes app during onboarding flow (before payment)
  * Network issues during onboarding screens
  * User attempts to navigate away from onboarding
  * App crash or interruption during onboarding (before payment)
  * Multiple device sign-ins for same account
  * Payment failures or cancellations (onboarding remains incomplete)

# Scenario 8: Returning User Who Previously Completed Onboarding
  <!-- 
  Context Setting: User who has completed onboarding before but may not have active subscription
  -->
  Given I am a returning user
    And I have previously completed the onboarding flow with successful payment confirmation
    And I have successfully signed in
    And I do not have an active subscription (expired or cancelled)
  
  When I access the protected area of the app
  
  Then I should bypass the onboarding flow completely
    And I should be directed straight to the paywall screen
    And I should be required to purchase or restore a subscription
    And I should not see the introductory onboarding screens again

  ## Acceptance Criteria:
  * Onboarding flow is completely skipped for users who previously completed payment
  * Direct navigation to paywall without intro screens
  * Paywall provides both purchase and restore options
  * Previous onboarding completion (with payment confirmation) is remembered across app sessions
  * Subscription requirement is still enforced

  ## Edge Cases to Consider:
  * Onboarding completion cache corruption or deletion
  * User deletes and reinstalls app
  * Multiple accounts on same device
  * App updates that might affect onboarding tracking
  * User data migration scenarios
  * Previous payment confirmation records lost or corrupted

# Scenario 9: Existing User With Active Subscription Returning
  <!-- 
  Context Setting: User who has both completed onboarding and has active subscription
  -->
  Given I am an existing user
    And I have previously completed the onboarding flow with successful payment confirmation
    And I have an active subscription in RevenueCat/Apple Connect
    And I have successfully signed in
  
  When I access the protected area of the app
  
  Then I should bypass the onboarding flow completely
    And I should bypass the paywall screen completely
    And I should be granted immediate access to all premium features
    And I should see the main app interface directly

  ## Acceptance Criteria:
  * Complete bypass of both onboarding and paywall flows
  * Immediate access to full app functionality
  * No interruption in user experience
  * Subscription status verified and cached
  * Premium features immediately available
  * Previous payment confirmation ensures onboarding bypass

  ## Edge Cases to Consider:
  * Subscription verification delays
  * Network connectivity during subscription check
  * Subscription expiration between sessions
  * RevenueCat service unavailability
  * Local cache inconsistencies
  * Payment confirmation records verification failures

# Scenario 10: Onboarding Interruption and Recovery
  <!-- 
  Context Setting: User starts onboarding but doesn't complete it
  -->
  Given I am a new user who has signed in
    And I have started the onboarding flow
    And I have progressed through some but not all onboarding screens
    And I have not completed a successful in-app purchase
  
  When I close the app or experience an interruption
    And I return to the app later
  
  Then I should restart the onboarding flow from the beginning
    And I should progress through all onboarding screens again
    And I should ultimately reach the paywall to access the main app
    And my onboarding completion should only be marked when I successfully complete payment

  ## Acceptance Criteria:
  * Onboarding always restarts from the first screen if interrupted before successful payment
  * No partial progress tracking or state management required
  * Simple binary state: payment completed or not completed
  * Paywall requirement is still enforced until successful payment confirmation
  * Onboarding completion only tracked after successful in-app purchase payment confirmation

  ## Edge Cases to Consider:
  * App crash during onboarding screen transitions
  * App updates between onboarding sessions
  * User attempts to manually clear app data
  * Multiple interruptions during onboarding
  * Network interruptions during onboarding (no state to preserve)
  * Payment failures or user cancellations (onboarding remains incomplete)