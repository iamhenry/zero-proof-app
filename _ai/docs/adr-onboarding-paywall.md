# ADR-00X: Onboarding Paywall Screen Integration

**Date:** 2025-04-29

**Status:** Proposed

## Context

The application requires a static paywall screen to be displayed as the final step of the user onboarding flow (User Story us-34). This screen needs to integrate with the existing `OnboardingComponent`, which utilizes the `react-native-onboarding-swiper` library. The screen must show specific static content, an app icon (`assets/onboarding/onboarding-app-icon.png`), and provide a clear call-to-action (e.g., a "Start" button) that triggers the `onDone` callback passed to the `OnboardingComponent` to dismiss the flow.

## Decision

We will implement the paywall screen as follows:

1.  **Create `PaywallScreen.tsx`:** A new component (`components/ui/onboarding/PaywallScreen.tsx`) will be created to encapsulate the static UI elements of the paywall (text, image `assets/onboarding/onboarding-app-icon.png`, layout). It will *not* contain the final action button itself.
2.  **Integrate into `OnboardingComponent.tsx`:**
    *   A new page object will be added to the `pages` array in `OnboardingComponent.tsx`.
    *   The `PaywallScreen` component will be rendered within the `title` or `subtitle` property of this page object. The `image` property of the page object can be left empty or minimal as the main image is handled within `PaywallScreen`.
    *   The `showSkip` and `showNext` props on the `<Onboarding>` component will be set to `false` for this final page to hide the default navigation buttons.
3.  **Custom Action Button:**
    *   The `DoneButtonComponent` prop of the `<Onboarding>` component will be used.
    *   A small, custom React Native component (e.g., `CustomDoneButton`) will be created and passed to `DoneButtonComponent`. This component will render the desired "Start" (or equivalent) button.
    *   The `CustomDoneButton` will receive props from the `react-native-onboarding-swiper` library, including an `onPress` handler. This handler, when invoked by tapping the custom button, will trigger the main `onDone` callback passed to the `OnboardingComponent`.

## Consequences

*   **Positive:**
    *   Provides good control over the final call-to-action button's UI and placement, aligning better with potential custom styling needs for a paywall.
    *   Leverages the existing library's mechanism for handling the `onDone` event, ensuring proper flow completion.
    *   Keeps the paywall UI logic encapsulated within `PaywallScreen.tsx`.
    *   Clear separation of concerns: `PaywallScreen` handles content display, `CustomDoneButton` handles the final action trigger appearance, and `OnboardingComponent` orchestrates the flow.
    *   Improved testability of the final action button compared to relying solely on library defaults.
*   **Negative:**
    *   Slightly more complex setup than simply using the default library "Done" button (requires creating the small `CustomDoneButton` component).
*   **Neutral:**
    *   Requires modification of `OnboardingComponent.tsx`.
    *   Introduces two new components (`PaywallScreen`, `CustomDoneButton`).

This approach balances flexibility for UI customization with adherence to the underlying library's intended flow control.