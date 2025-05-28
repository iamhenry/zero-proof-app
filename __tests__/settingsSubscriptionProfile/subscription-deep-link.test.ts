/**
 * FILE: __tests__/settingsSubscriptionProfile/subscription-deep-link.test.ts
 * PURPOSE: Failing tests for Scenario 4 - Navigate to iOS Subscription Management via deep link.
 */

import { Linking, Platform } from "react-native";

import { openSubscriptionManagement } from "@/lib/utils/subscriptionDeepLink";

// Mock React Native's Linking API and Platform.OS
afterEach(() => {
  jest.resetAllMocks();
});

jest.mock("react-native", () => {
  const ActualReactNative = jest.requireActual("react-native");
  return {
    ...ActualReactNative,
    Linking: {
      openURL: jest.fn(),
    },
    Platform: { OS: "ios" },
  };
});

describe("Subscription deep link utility", () => {
  it("opens the iOS subscription management URL", () => {
    openSubscriptionManagement();

    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://apps.apple.com/account/subscriptions",
    );
  });
});
