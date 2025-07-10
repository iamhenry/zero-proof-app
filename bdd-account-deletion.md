# BDD Scenarios: Account Deletion Functionality

## Scenario 1: Successful Account Deletion Flow
  Given the user is on the settings screen
    And they have an active Supabase account
    And they have a stable internet connection
  
  When they tap the "Delete Account" button
    And they see the confirmation modal with warnings about data loss
    And they confirm the deletion by tapping "Delete Account" in the modal
  
  Then their Supabase authentication account is permanently deleted
    And they are immediately logged out of the app
    And they are redirected to the welcome/onboarding screen
    And they see a success toast notification confirming account deletion
    And they cannot log back in with their previous credentials

  ## Acceptance Criteria:
  - [ ] Delete Account button is visible in settings screen following existing UI patterns
  - [ ] Confirmation modal displays clear warnings about permanent data loss
  - [ ] Supabase auth account is permanently deleted from the system
  - [ ] User is immediately logged out and redirected to welcome screen
  - [ ] Success toast notification confirms deletion completion
  - [ ] Previous credentials are no longer valid for login

## Scenario 2: Account Deletion Cancellation
  Given the user is on the settings screen
    And they have tapped the "Delete Account" button
    And the confirmation modal is visible
  
  When they tap "Cancel" or dismiss the modal
  
  Then the modal closes
    And they remain on the settings screen
    And their account remains active and unchanged
    And no deletion process is initiated

  ## Acceptance Criteria:
  - [ ] Cancel button provides clear exit option from deletion flow
  - [ ] Modal can be dismissed without triggering deletion
  - [ ] User remains logged in and on settings screen
  - [ ] Account status remains unchanged after cancellation

## Scenario 3: Network Failure During Account Deletion
  Given the user is on the settings screen
    And they have confirmed account deletion
    And the network connection is lost or unstable
  
  When the deletion request fails due to network issues
  
  Then an error toast notification is displayed
    And the user remains logged in
    And they remain on the settings screen
    And they can retry the deletion when network is restored

  ## Acceptance Criteria:
  - [ ] Network failures are handled gracefully without app crashes
  - [ ] Error toast provides clear feedback about network issues
  - [ ] User session remains active after failed deletion attempt
  - [ ] Retry functionality is available when network is restored

## Scenario 4: Supabase Service Unavailability
  Given the user is on the settings screen
    And they have confirmed account deletion
    And Supabase service is temporarily unavailable
  
  When the deletion request fails due to service unavailability
  
  Then an error toast notification explains the service issue
    And the user remains logged in
    And they are advised to try again later
    And their account remains active and unchanged

  ## Acceptance Criteria:
  - [ ] Service unavailability is detected and handled properly
  - [ ] User-friendly error message explains the temporary issue
  - [ ] Account remains active when deletion cannot be completed
  - [ ] Clear guidance provided for retry attempts

## Scenario 5: Subscription Warning in Confirmation Modal
  Given the user is on the settings screen
    And they have an active subscription
    And they tap the "Delete Account" button
  
  When the confirmation modal appears
  
  Then the modal displays a clear warning about subscription management
    And it explains that deleting the account doesn't cancel subscriptions
    And it provides guidance on canceling subscriptions separately
    And the user must acknowledge this warning before proceeding

  ## Acceptance Criteria:
  - [ ] Subscription warning is prominently displayed in confirmation modal
  - [ ] Clear explanation that account deletion ≠ subscription cancellation
  - [ ] Guidance provided for managing subscriptions separately
  - [ ] User must acknowledge warning before deletion can proceed

## Scenario 6: Local Data Persistence After Account Deletion
  Given the user has local app data (sobriety tracking, settings)
    And they have successfully deleted their account
    And they are logged out of the app
  
  When they check their device storage
  
  Then their local app data remains on the device
    And it will only be removed when the app is uninstalled
    And this behavior is clearly communicated to the user

  ## Acceptance Criteria:
  - [ ] Local data persistence behavior is clearly communicated
  - [ ] User understands data removal requires app uninstall
  - [ ] Account deletion only affects cloud/auth data, not local storage

## App Store Compliance Verification:
- [ ] Account deletion is immediate and permanent
- [ ] No grace period or account recovery options
- [ ] Clear user control over account deletion
- [ ] Transparent communication about data handling
- [ ] Compliance with App Store Review Guidelines 5.1.1(v)