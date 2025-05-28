/**
 * FILE: __tests__/settingsSubscriptionProfile/pro-badge-display.test.tsx
 * PURPOSE: Failing tests for Scenario 2 – Display Pro Badge Based on Subscription Status
 */

import React from "react";
import { render, screen } from "@testing-library/react-native";

import ProBadge from "@/components/ui/settings/subscriptionProfile/ProBadge";
import * as SubscriptionHook from "@/components/ui/settings/subscriptionProfile/useSubscriptionStatus";

// Mock the yet-to-be-implemented hook so we can simulate different subscription states.
jest.mock("@/components/ui/settings/subscriptionProfile/useSubscriptionStatus");

describe("Settings Subscription Profile – ProBadge", () => {
  const mockedHook = SubscriptionHook as jest.Mocked<typeof SubscriptionHook>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders the Pro badge when subscription is active", () => {
    mockedHook.useSubscriptionStatus.mockReturnValue({
      status: "active",
      isLoading: false,
      error: null,
    } as any);

    render(<ProBadge />);

    expect(screen.getByText(/pro/i)).toBeTruthy();
  });

  it("does not render the Pro badge when subscription is inactive", () => {
    mockedHook.useSubscriptionStatus.mockReturnValue({
      status: "inactive",
      isLoading: false,
      error: null,
    } as any);

    const { queryByText } = render(<ProBadge />);

    expect(queryByText(/pro/i)).toBeNull();
  });
});
