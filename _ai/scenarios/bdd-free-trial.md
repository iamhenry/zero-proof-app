Feature: Free Trial Subscription

  Background:
    Given a user is on the paywall screen
    And the "zp_weekly_free_trial_offer" offering is available with a 7-day free trial

  Scenario: New user starts a 7-day free trial
    When the user selects the weekly plan with the 7-day free trial
    And the purchase is successful
    Then the user should have access to premium features
    And the subscription status should indicate an active trial

  Scenario: User with an active trial converts to a paid subscription
    Given the user has an active 7-day free trial
    When the trial period ends
    And the subscription renews successfully
    Then the user should continue to have access to premium features
    And the subscription status should indicate an active paid subscription

  Scenario: User cancels the trial before it ends
    Given the user has an active 7-day free trial
    When the user cancels the subscription during the trial period
    And the trial period ends
    Then the user should lose access to premium features
    And the paywall should be displayed

  Scenario: Paywall displays free trial information
    Then the paywall UI should clearly display "Free 7-day trial, then $X/week" for the weekly plan
