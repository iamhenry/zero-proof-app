# BDD Scenarios: Email Verification Deep Link

## Scenario 1: Successful email verification via deep link
  Given I have signed up for a new account with my email address
    And I have received a verification email in my inbox
    And the Zero Proof app is installed on my device
  
  When I tap the verification link in the email
    And the link opens the Zero Proof app directly
  
  Then I should see the welcome screen with a success toast that lasts 5 seconds
    And I should be able to tap the sign in button
    And I should be able to sign in manually

  ## Acceptance Criteria:
  - [ ] User bypasses browser entirely - app opens directly from email
  - [ ] Success toast appears immediately on welcome screen
  - [ ] User can sign in manually with their verified email
  - [ ] Verification status is properly updated in Supabase
  - [ ] Deep link works on both iOS and Android

## Scenario 2: Email verification with authentication error
  Given I have signed up for a new account
    And I have received a verification email
    And the verification token has expired or is invalid
  
  When I tap the verification link in the email
    And the Zero Proof app opens
  
  Then I should see the welcome screen with an error toast "Verification failed. Please try again."
    And I should still be able to attempt signing in manually
    And the app should remain stable and functional

  ## Acceptance Criteria:
  - [ ] Error toast clearly indicates verification failure
  - [ ] User can still use the app normally after error
  - [ ] No crashes or broken states from failed verification
  - [ ] User can request a new verification email if needed

## Scenario 3: Deep link when app is not already running
  Given I have a verification email on my device
    And the Zero Proof app is not currently running
  
  When I tap the verification link in the email
  
  Then the Zero Proof app should launch completely
    And I should land on the welcome screen
    And the success toast should appear and last 5 seconds
    And the app should be fully functional

  ## Acceptance Criteria:
  - [ ] App launches successfully from cold start
  - [ ] Deep link callback is processed correctly
  - [ ] Welcome screen loads with proper state
  - [ ] No loading issues or crashes during launch

## Scenario 4: Deep link when app is already running
  Given I have the Zero Proof app open and running
    And I have a verification email
  
  When I tap the verification link in the email
    And the app comes to foreground
  
  Then I should see the welcome screen (already visible)
    And the success toast should appear and last 5 seconds

  ## Acceptance Criteria:
  - [ ] Success toast appears immediately and lasts 5 seconds
  - [ ] Welcome screen remains stable
  - [ ] Deep link callback is processed correctly