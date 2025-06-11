import { renderHook, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Purchases } from "react-native-purchases";
import { SubscriptionProvider, useSubscription } from "../SubscriptionContext";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
}));

import { CustomerInfo } from 'react-native-purchases'; // Import for type safety

// Mock react-native-purchases
const mockRNPurchasesGetCustomerInfo = jest.fn();
// This object will be the 'default' export of the mocked 'react-native-purchases'
const mockDefaultPurchases = {
    getCustomerInfo: mockRNPurchasesGetCustomerInfo,
    configure: jest.fn(),
    setLogLevel: jest.fn(),
    addCustomerInfoUpdateListener: jest.fn(() => ({ remove: jest.fn() })),
    // Ensure all methods/properties accessed by config/revenuecat.ts on the default import are here
};

jest.mock('react-native-purchases', () => ({
    __esModule: true, // Important for ES6 module mocking
    default: mockDefaultPurchases,
    LOG_LEVEL: { INFO: "INFO", DEBUG: "DEBUG", WARN: "WARN", ERROR: "ERROR" }, // Mock constants
    // Do not include a named 'Purchases' export here if the primary usage is default
    // Avoid spreading ...mockDefaultPurchases directly into the module root unless that's the import pattern
}));

// We will be testing SubscriptionContext, which uses getCustomerInfo from @/config/revenuecat.
// @/config/revenuecat in turn uses the mocked 'react-native-purchases'.
// So, we control mockRNPurchasesGetCustomerInfo.

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<SubscriptionProvider>{children}</SubscriptionProvider>
);

describe("SubscriptionContext", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockAsyncStorage.getItem.mockResolvedValue(null);
		mockAsyncStorage.setItem.mockResolvedValue(undefined);
		mockRNPurchasesGetCustomerInfo.mockReset(); // Reset this specific mock
	});

	// No afterEach needed for jest.spyOn if we are not using it.

	describe("Trial Period Handling", () => {
		it("should correctly identify an active trial period", async () => {
			const mockCustomerInfoWithTrial: Partial<CustomerInfo> = { // Use Partial for easier mocking
				entitlements: {
					active: {
						premium: {
							productIdentifier: "zp_weekly_free_trial_offer",
							isSandbox: true,
							isActive: true,
							periodType: "TRIAL",
							latestPurchaseDate: new Date().toISOString(),
							originalPurchaseDate: new Date().toISOString(),
							expirationDate: new Date(
								Date.now() + 7 * 24 * 60 * 60 * 1000,
							).toISOString(),
							store: "APP_STORE",
							unsubscribeDetectedAt: null,
							billingIssueDetectedAt: null,
							ownershipType: "PURCHASED",
						} as any, // Cast to any if properties are missing from actual type
					},
					all: {
						premium: {
							productIdentifier: "zp_weekly_free_trial_offer",
							isSandbox: true,
							isActive: true,
							periodType: "TRIAL",
							latestPurchaseDate: new Date().toISOString(),
							originalPurchaseDate: new Date().toISOString(),
							expirationDate: new Date(
								Date.now() + 7 * 24 * 60 * 60 * 1000,
							).toISOString(),
							store: "APP_STORE",
							unsubscribeDetectedAt: null,
							billingIssueDetectedAt: null,
							ownershipType: "PURCHASED",
						} as any,
					},
				},
				activeSubscriptions: ["zp_weekly_free_trial_offer"],
			};
			mockRNPurchasesGetCustomerInfo.mockResolvedValue(mockCustomerInfoWithTrial as CustomerInfo);

			const { result } = renderHook(() => useSubscription(), { wrapper });

			await act(async () => {
				await result.current.checkSubscriptionStatus();
			});

			expect(result.current.isTrialActive).toBe(true); // Check isTrialActive specifically
			expect(result.current.isSubscriptionActive).toBe(false); // Should not be active paid subscription
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.subscriptionStatus).toBe("trial");
		});

		it("should grant access if user is in trial and entitlement is active", async () => {
			const mockCustomerInfoInTrial: Partial<CustomerInfo> = {
				entitlements: {
					active: {
						"premium": {
							isActive: true,
							periodType: "TRIAL",
							productIdentifier: "zp_weekly_free_trial_offer",
							willRenew: true,
							latestPurchaseDate: "2023-01-01T00:00:00Z",
							originalPurchaseDate: "2023-01-01T00:00:00Z",
							expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
						} as any,
					},
					all: {
						"premium": {
							isActive: true,
							periodType: "TRIAL",
							productIdentifier: "zp_weekly_free_trial_offer",
							willRenew: true,
							latestPurchaseDate: "2023-01-01T00:00:00Z",
							originalPurchaseDate: "2023-01-01T00:00:00Z",
							expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
						} as any,
					}
				},
				activeSubscriptions: ["zp_weekly_free_trial_offer"],
			};
			mockRNPurchasesGetCustomerInfo.mockResolvedValue(mockCustomerInfoInTrial as CustomerInfo);

			const { result } = renderHook(() => useSubscription(), { wrapper });
			await act(async () => {
				await result.current.checkSubscriptionStatus();
			});

			expect(result.current.hasAccess).toBe(true);
			expect(result.current.isTrialActive).toBe(true);
			expect(result.current.subscriptionStatus).toBe("trial");
		});
	});

	describe("Subscription State After Trial", () => {
		it("should maintain access when trial converts to paid subscription", async () => {
			const mockCustomerInfoConverted: Partial<CustomerInfo> = {
				entitlements: {
					active: {
						"premium": {
							isActive: true,
							periodType: "NORMAL",
							productIdentifier: "zp_weekly_standard",
							willRenew: true,
							latestPurchaseDate: new Date().toISOString(),
							originalPurchaseDate: "2023-01-01T00:00:00Z",
							expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
						} as any,
					},
                    all: {
						"premium": {
							isActive: true,
							periodType: "NORMAL",
							productIdentifier: "zp_weekly_standard",
							willRenew: true,
							latestPurchaseDate: new Date().toISOString(),
							originalPurchaseDate: "2023-01-01T00:00:00Z",
							expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
						} as any,
                    }
				},
				activeSubscriptions: ["zp_weekly_standard"],
			};
			mockRNPurchasesGetCustomerInfo.mockResolvedValue(mockCustomerInfoConverted as CustomerInfo);

			const { result } = renderHook(() => useSubscription(), { wrapper });
			await act(async () => {
				await result.current.checkSubscriptionStatus();
			});

			expect(result.current.hasAccess).toBe(true);
			expect(result.current.isTrialActive).toBe(false);
			expect(result.current.isSubscriptionActive).toBe(true);
			expect(result.current.subscriptionStatus).toBe("active");
		});

		it("should revoke access if trial is cancelled and expires", async () => {
			const mockCustomerInfoCancelledTrial: Partial<CustomerInfo> = {
				entitlements: {
					active: {},
                    all: {
						"premium": {
							isActive: false,
							periodType: "TRIAL",
							productIdentifier: "zp_weekly_free_trial_offer",
							willRenew: false,
							latestPurchaseDate: "2023-01-01T00:00:00Z",
							originalPurchaseDate: "2023-01-01T00:00:00Z",
							expirationDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
						} as any,
                    }
				},
				activeSubscriptions: [],
			};
			mockRNPurchasesGetCustomerInfo.mockResolvedValue(mockCustomerInfoCancelledTrial as CustomerInfo);

			const { result } = renderHook(() => useSubscription(), { wrapper });
			await act(async () => {
				await result.current.checkSubscriptionStatus();
			});

			expect(result.current.hasAccess).toBe(false);
			expect(result.current.isTrialActive).toBe(false);
			expect(result.current.isSubscriptionActive).toBe(false);
			expect(result.current.subscriptionStatus).toBe("inactive");
		});
	});

	describe("handlePurchaseEvent with Trial", () => {
		it("should correctly set trial state on purchase event", async () => {
			const mockCustomerInfoTrialPurchase: Partial<CustomerInfo> = {
				entitlements: {
					active: {
						"premium": {
							isActive: true,
							periodType: "TRIAL",
							productIdentifier: "zp_weekly_free_trial_offer",
							expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
						} as any,
					},
                    all: {
                        "premium": {
							isActive: true,
							periodType: "TRIAL",
							productIdentifier: "zp_weekly_free_trial_offer",
							expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
						} as any,
                    }
				},
				activeSubscriptions: ["zp_weekly_free_trial_offer"],
			};
			// Note: handlePurchaseEvent doesn't call getCustomerInfo, it processes the passed object.
			// So, no need to mockRNPurchasesGetCustomerInfo.mockResolvedValue here for this specific test.

			const { result } = renderHook(() => useSubscription(), { wrapper });

			act(() => {
				result.current.handlePurchaseEvent(mockCustomerInfoTrialPurchase as CustomerInfo);
			});

			expect(result.current.isTrialActive).toBe(true);
			expect(result.current.isSubscriptionActive).toBe(false);
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.subscriptionStatus).toBe("trial");
			// Verify AsyncStorage was called to cache this state
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				"subscription_status",
				expect.stringContaining(`"isTrial":true`) // Check for isTrial in cache
			);
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				"subscription_status",
				expect.stringContaining(`"isActive":false`) // Check for isActive:false in cache for trial
			);
		});
	});
});
