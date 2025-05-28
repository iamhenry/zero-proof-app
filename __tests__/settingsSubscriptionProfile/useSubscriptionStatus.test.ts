/**
 * FILE: __tests__/settingsSubscriptionProfile/useSubscriptionStatus.test.ts
 * PURPOSE: Failing tests for Scenarios 5 & 6 – Async loading states and error handling
 *           for the custom useSubscriptionStatus hook.
 */

import { renderHook } from "@testing-library/react-hooks";
import { act } from "@testing-library/react-native";

import { useSubscriptionStatus } from "@/components/ui/settings/subscriptionProfile/useSubscriptionStatus";

import Purchases from "react-native-purchases";

jest.mock("react-native-purchases");

const mockPurchases = Purchases as jest.Mocked<typeof Purchases>;

describe("useSubscriptionStatus hook", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // MARK: – Scenario 5.1: Returns active when entitlements exist
  it("returns 'active' status when an entitlement is active", async () => {
    mockPurchases.getCustomerInfo.mockResolvedValue({
      entitlements: { active: { premium: {} } },
    } as any);

    const { result, waitForNextUpdate } = renderHook(() => useSubscriptionStatus());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for async effect
    await waitForNextUpdate();

    expect(result.current.status).toBe("active");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // MARK: – Scenario 5.2: Returns inactive when no entitlements
  it("returns 'inactive' status when no active entitlements are present", async () => {
    mockPurchases.getCustomerInfo.mockResolvedValue({
      entitlements: { active: {} },
    } as any);

    const { result, waitForNextUpdate } = renderHook(() => useSubscriptionStatus());

    await waitForNextUpdate();

    expect(result.current.status).toBe("inactive");
    expect(result.current.error).toBeNull();
  });

  // MARK: – Scenario 6: Handles SDK failure gracefully
  it("sets error state when RevenueCat SDK call fails", async () => {
    const networkError = new Error("Network failure");
    mockPurchases.getCustomerInfo.mockRejectedValue(networkError);

    const { result, waitForNextUpdate } = renderHook(() => useSubscriptionStatus());

    await waitForNextUpdate();

    expect(result.current.error).toBe(networkError);
    expect(result.current.status).toBe("error");
  });
});
