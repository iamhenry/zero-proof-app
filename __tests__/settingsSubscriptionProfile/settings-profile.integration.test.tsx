/**
 * FILE: __tests__/settingsSubscriptionProfile/settings-profile.integration.test.tsx
 * PURPOSE: High-level failing integration test combining multiple scenarios.
 * Scenarios covered:
 *  - Renders user email & avatar (Scenario 1, 3)
 *  - Shows Pro badge when subscription active (Scenario 2)
 *  - Tapping “Manage Subscription” triggers deep link (Scenario 4)
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import SettingsSubscriptionProfileScreen from "@/components/ui/settings/subscriptionProfile/SettingsSubscriptionProfileScreen";
import { withSupabaseProvider } from "./testUtils";
import * as SubscriptionHook from "@/components/ui/settings/subscriptionProfile/useSubscriptionStatus";
import { Linking } from "react-native";

// Mock useSubscriptionStatus so we can simulate an active user
jest.mock("@/components/ui/settings/subscriptionProfile/useSubscriptionStatus");

// Mock Linking.openURL
jest.mock("react-native", () => {
  const Actual = jest.requireActual("react-native");
  return {
    ...Actual,
    Linking: {
      openURL: jest.fn(),
    },
    Platform: { OS: "ios" },
  };
});

describe("SettingsSubscriptionProfileScreen - integration", () => {
  const mockedHook = SubscriptionHook as jest.Mocked<typeof SubscriptionHook>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders email, avatar, pro badge and handles manage subscription action", () => {
    mockedHook.useSubscriptionStatus.mockReturnValue({
      status: "active",
      isLoading: false,
      error: null,
    } as any);

    const Wrapper = withSupabaseProvider("henry@example.com");

    render(<SettingsSubscriptionProfileScreen />, { wrapper: Wrapper });

    // E-mail displayed
    expect(screen.getByText("henry@example.com")).toBeTruthy();

    // Avatar letter
    expect(screen.getByText("H")).toBeTruthy();

    // Pro badge
    expect(screen.getByText(/pro/i)).toBeTruthy();

    // Manage subscription button triggers deep link
    const manageBtn = screen.getByRole("button", { name: /manage subscription/i });
    fireEvent.press(manageBtn);

    expect(Linking.openURL).toHaveBeenCalled();
  });
});
