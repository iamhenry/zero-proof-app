import React, { ReactNode } from "react";
import { renderHook, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SubscriptionProvider, useSubscription } from "../SubscriptionContext";

// --- Mocks ---

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
}));

// Mock the RevenueCat config module - this is what our SubscriptionContext actually imports
jest.mock("@/config/revenuecat", () => ({
	getCustomerInfo: jest.fn(),
}));

// Type assertions for mocked modules
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockedRevenueCat = require("@/config/revenuecat") as {
	getCustomerInfo: jest.MockedFunction<() => Promise<any>>;
};

// Test wrapper component
const wrapper = ({ children }: { children: ReactNode }) => (
	<SubscriptionProvider>{children}</SubscriptionProvider>
);

// Mock customer info responses
const createMockCustomerInfo = (
	isActive: boolean,
	expirationDate?: string,
) => ({
	activeSubscriptions: isActive ? ["premium_monthly"] : [],
	allPurchasedProductIdentifiers: isActive ? ["premium_monthly"] : [],
	entitlements: {
		active: isActive
			? { premium: { isActive: true, productIdentifier: "premium_monthly" } }
			: {},
		all: {},
	},
	latestExpirationDate: expirationDate ? new Date(expirationDate) : null,
	originalApplicationVersion: "1.0.0",
	originalPurchaseDate: new Date().toISOString(),
	requestDate: new Date().toISOString(),
});

// Mock customer info responses for trial scenarios
const createMockTrialCustomerInfo = (
	isTrialActive: boolean,
	trialExpirationDate?: string,
	isTrialConverted?: boolean,
) => ({
	activeSubscriptions: isTrialActive ? ["zeroproof.hmoran.com.Weekly"] : [],
	allPurchasedProductIdentifiers: isTrialActive
		? ["zeroproof.hmoran.com.Weekly"]
		: [],
	entitlements: {
		active: isTrialActive
			? {
					premium: {
						isActive: true,
						productIdentifier: "zeroproof.hmoran.com.Weekly",
						willRenew: true,
						expirationDate: trialExpirationDate
							? new Date(trialExpirationDate)
							: null,
					},
				}
			: {},
		all: {},
	},
	latestExpirationDate: trialExpirationDate
		? new Date(trialExpirationDate)
		: null,
	originalApplicationVersion: "1.0.0",
	originalPurchaseDate: new Date().toISOString(),
	requestDate: new Date().toISOString(),
	isTrialConversion: isTrialConverted || false,
});

describe("SubscriptionContext", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset AsyncStorage to clean state
		mockedAsyncStorage.getItem.mockResolvedValue(null);
		mockedAsyncStorage.setItem.mockResolvedValue();
		mockedAsyncStorage.removeItem.mockResolvedValue();
	});

	// MARK: - Scenario: Automatic Subscription Detection on App Launch

	it("should automatically detect active subscription on app launch", async () => {
		// Given: User has active subscription in RevenueCat
		const mockActiveCustomerInfo = createMockCustomerInfo(true);
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockActiveCustomerInfo);

		// When: App loads and subscription status is checked
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: Subscription should be detected as active
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.lastVerified).toBeTruthy();
		expect(mockedRevenueCat.getCustomerInfo).toHaveBeenCalled();
	});

	it("should cache subscription status locally after detection", async () => {
		// Given: User has active subscription
		const mockActiveCustomerInfo = createMockCustomerInfo(true);
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockActiveCustomerInfo);

		// When: Subscription status is verified
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: Subscription status should be cached locally
		expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
			"subscription_status",
			expect.stringContaining('"isActive":true'),
		);
	});

	it("should grant immediate access to premium features when subscription is active", async () => {
		// Given: Active subscription detected
		const mockActiveCustomerInfo = createMockCustomerInfo(true);
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockActiveCustomerInfo);

		// When: Subscription verification completes
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: User should have access to premium features
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.isLoading).toBe(false);
	});

	// MARK: - Scenario: Trial Initiation from Paywall

	it("should detect active free trial and grant immediate access", async () => {
		// Given: User has active 7-day free trial
		const sevenDaysFromNow = new Date(
			Date.now() + 7 * 24 * 60 * 60 * 1000,
		).toISOString();
		const mockTrialCustomerInfo = createMockTrialCustomerInfo(
			true,
			sevenDaysFromNow,
			false,
		);
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockTrialCustomerInfo);

		// When: Subscription status is checked after trial activation
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: User should have access during trial
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.hasAccess).toBe(true);
		expect(result.current.isTrialActive).toBe(true);
		expect(result.current.trialExpirationDate).toBeTruthy();
	});

	it("should treat trial users identically to paid subscribers for access", async () => {
		// Given: User has active trial subscription
		const sevenDaysFromNow = new Date(
			Date.now() + 7 * 24 * 60 * 60 * 1000,
		).toISOString();
		const mockTrialCustomerInfo = createMockTrialCustomerInfo(
			true,
			sevenDaysFromNow,
			false,
		);
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockTrialCustomerInfo);

		// When: App checks subscription status
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: Trial user should have identical access to paid subscriber
		expect(result.current.hasAccess).toBe(true);
		expect(result.current.subscriptionStatus).toBe("active");
		expect(result.current.isSubscriptionActive).toBe(true);
	});

	// MARK: - Scenario: Premium Access During Active Trial

	it("should persist trial access across app sessions", async () => {
		// Given: User has cached active trial status
		const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
		const cachedTrialStatus = {
			isActive: true,
			isTrialActive: true,
			trialExpirationDate: sevenDaysFromNow,
			lastVerified: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
			cacheExpiry: Date.now() + 23 * 60 * 60 * 1000, // 23 hours from now
		};
		mockedAsyncStorage.getItem.mockResolvedValue(
			JSON.stringify(cachedTrialStatus),
		);

		// When: App loads and checks cached status
		const { result } = renderHook(() => useSubscription(), { wrapper });

		// Wait for useEffect to load cached data
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		// Then: Should maintain trial access from cache
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.isTrialActive).toBe(true);
		expect(result.current.hasAccess).toBe(true);
	});

	// MARK: - Scenario: Trial Conversion to Paid Subscription

	it("should detect seamless trial to paid conversion", async () => {
		// Given: User's trial has converted to paid subscription
		const mockConvertedCustomerInfo = createMockTrialCustomerInfo(
			true,
			null,
			true,
		);
		mockConvertedCustomerInfo.activeSubscriptions = ["premium_weekly"];
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(
			mockConvertedCustomerInfo,
		);

		// When: Subscription status is checked after conversion
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: User should maintain uninterrupted access
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.hasAccess).toBe(true);
		expect(result.current.isTrialConverted).toBe(true);
	});

	it("should maintain access during trial to paid transition", async () => {
		// Given: User was on trial and now has paid subscription
		const mockConvertedInfo = createMockTrialCustomerInfo(true, null, true);
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockConvertedInfo);

		// When: Conversion is processed
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			result.current.handlePurchaseEvent(mockConvertedInfo);
		});

		// Then: Access should remain uninterrupted
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.hasAccess).toBe(true);
	});

	// MARK: - Scenario: Trial Cancellation During Trial Period

	it("should maintain access after cancellation until trial expires", async () => {
		// Given: User cancelled trial but it hasn't expired yet
		const twoDaysFromNow = new Date(
			Date.now() + 2 * 24 * 60 * 60 * 1000,
		).toISOString();
		const mockCancelledTrialInfo = createMockTrialCustomerInfo(
			true,
			twoDaysFromNow,
			false,
		);
		mockCancelledTrialInfo.entitlements.active.premium.willRenew = false; // Cancelled
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockCancelledTrialInfo);

		// When: Subscription status is checked
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: Should still have access until expiration
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.hasAccess).toBe(true);
		expect(result.current.isTrialCancelled).toBe(true);
		expect(result.current.trialExpirationDate).toBeTruthy();
	});

	// MARK: - Scenario: Expired Trial Without Conversion

	it("should revoke access when trial expires without conversion", async () => {
		// Given: User had trial that has now expired
		const yesterdayDate = new Date(
			Date.now() - 24 * 60 * 60 * 1000,
		).toISOString();
		const mockExpiredTrialInfo = createMockTrialCustomerInfo(
			false,
			yesterdayDate,
			false,
		);
		mockExpiredTrialInfo.entitlements.active = {}; // No active entitlements
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockExpiredTrialInfo);

		// When: Subscription status is checked after expiration
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: Access should be revoked
		expect(result.current.isSubscriptionActive).toBe(false);
		expect(result.current.hasAccess).toBe(false);
		expect(result.current.isTrialExpired).toBe(true);
	});

	// MARK: - Scenario: hasPurchasedTrial Logic Tests

	it("should detect expired trial when user has trial in allPurchasedProductIdentifiers but not activeSubscriptions", async () => {
		// Given: User previously had trial but it's now expired
		const yesterdayDate = new Date(
			Date.now() - 24 * 60 * 60 * 1000,
		).toISOString();
		const mockExpiredTrialInfo = {
			activeSubscriptions: [], // Trial no longer active
			allPurchasedProductIdentifiers: ["zeroproof.hmoran.com.Weekly"], // But was purchased before
			entitlements: {
				active: {}, // No active entitlements
				all: {
					premium: {
						isActive: false,
						expirationDate: yesterdayDate,
						willRenew: false,
					},
				},
			},
			latestExpirationDate: yesterdayDate,
			isTrialConversion: false,
		};
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockExpiredTrialInfo);

		// When: Subscription status is checked
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: Should detect as expired trial (not just inactive)
		expect(result.current.isSubscriptionActive).toBe(false);
		expect(result.current.hasAccess).toBe(false);
		expect(result.current.isTrialActive).toBe(false);
		expect(result.current.isTrialExpired).toBe(true);
	});

	it("should NOT mark as trial expired for users who never had trial", async () => {
		// Given: User never had any trial
		const mockNeverTrialInfo = {
			activeSubscriptions: [],
			allPurchasedProductIdentifiers: [], // Never purchased trial
			entitlements: {
				active: {},
				all: {},
			},
			latestExpirationDate: null,
			isTrialConversion: false,
		};
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockNeverTrialInfo);

		// When: Subscription status is checked
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: Should NOT be marked as trial expired
		expect(result.current.isSubscriptionActive).toBe(false);
		expect(result.current.hasAccess).toBe(false);
		expect(result.current.isTrialActive).toBe(false);
		expect(result.current.isTrialExpired).toBe(false); // Key difference
	});

	it("should correctly identify expired trial vs never-had-trial users with ambiguous RevenueCat data", async () => {
		// Given: Edge case - RevenueCat might return similar data for both scenarios
		// This user HAD a trial but RevenueCat doesn't provide latestExpirationDate
		const mockAmbiguousExpiredTrialInfo = {
			activeSubscriptions: [], // No active subscriptions
			allPurchasedProductIdentifiers: ["zeroproof.hmoran.com.Weekly"], // BUT they did purchase trial
			entitlements: {
				active: {}, // No active entitlements
				all: {}, // No historical entitlements data
			},
			latestExpirationDate: null, // RevenueCat sometimes doesn't provide this
			isTrialConversion: false,
		};
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(
			mockAmbiguousExpiredTrialInfo,
		);

		// When: Subscription status is checked
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: Should detect as expired trial based on purchase history
		// This test will FAIL without hasPurchasedTrial logic
		expect(result.current.isSubscriptionActive).toBe(false);
		expect(result.current.hasAccess).toBe(false);
		expect(result.current.isTrialActive).toBe(false);
		expect(result.current.isTrialExpired).toBe(true); // Should detect expired trial
	});

	it("should handle edge case where trial is in activeSubscriptions but not allPurchasedProductIdentifiers", async () => {
		// Given: Edge case scenario (shouldn't happen but test defensively)
		const sevenDaysFromNow = new Date(
			Date.now() + 7 * 24 * 60 * 60 * 1000,
		).toISOString();
		const mockEdgeCaseInfo = {
			activeSubscriptions: ["zeroproof.hmoran.com.Weekly"], // Active trial
			allPurchasedProductIdentifiers: [], // But not in purchase history (unusual)
			entitlements: {
				active: {
					premium: {
						isActive: true,
						expirationDate: sevenDaysFromNow,
						willRenew: true,
					},
				},
				all: {
					premium: {
						isActive: true,
						expirationDate: sevenDaysFromNow,
						willRenew: true,
					},
				},
			},
			latestExpirationDate: sevenDaysFromNow,
			isTrialConversion: false,
		};
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockEdgeCaseInfo);

		// When: Subscription status is checked
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: Should still treat as active trial (prioritize activeSubscriptions)
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.hasAccess).toBe(true);
		expect(result.current.isTrialActive).toBe(true);
		expect(result.current.isTrialExpired).toBe(false);
	});

	it("should distinguish between converted trial and expired trial", async () => {
		// Given: User had trial that converted to paid subscription
		const mockConvertedTrialInfo = {
			activeSubscriptions: ["premium_weekly"], // Now has paid subscription
			allPurchasedProductIdentifiers: [
				"zeroproof.hmoran.com.Weekly",
				"premium_weekly",
			], // Trial + paid
			entitlements: {
				active: {
					premium: {
						isActive: true,
						expirationDate: new Date(
							Date.now() + 30 * 24 * 60 * 60 * 1000,
						).toISOString(),
						willRenew: true,
					},
				},
				all: {
					premium: {
						isActive: true,
						expirationDate: new Date(
							Date.now() + 30 * 24 * 60 * 60 * 1000,
						).toISOString(),
						willRenew: true,
					},
				},
			},
			latestExpirationDate: new Date(
				Date.now() + 30 * 24 * 60 * 60 * 1000,
			).toISOString(),
			isTrialConversion: true, // Key: this indicates conversion
		};
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockConvertedTrialInfo);

		// When: Subscription status is checked
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: Should be active subscription, not expired trial
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.hasAccess).toBe(true);
		expect(result.current.isTrialActive).toBe(false); // No longer trial
		expect(result.current.isTrialConverted).toBe(true); // Was converted
		expect(result.current.isTrialExpired).toBe(false); // Not expired, converted
	});

	it("should show paywall after expired trial", async () => {
		// Given: User with expired trial
		const mockExpiredTrialInfo = createMockTrialCustomerInfo(
			false,
			null,
			false,
		);
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockExpiredTrialInfo);

		// When: User tries to access premium features
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: Should indicate paywall is needed
		expect(result.current.hasAccess).toBe(false);
		expect(result.current.shouldShowPaywall).toBe(true);
		expect(result.current.subscriptionStatus).toBe("inactive");
	});

	// MARK: - Scenario: Trial State Detection on App Launch

	it("should accurately detect trial state on app launch", async () => {
		// Given: User with active trial launches app
		const fiveDaysFromNow = new Date(
			Date.now() + 5 * 24 * 60 * 60 * 1000,
		).toISOString();
		const mockTrialInfo = createMockTrialCustomerInfo(
			true,
			fiveDaysFromNow,
			false,
		);
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockTrialInfo);

		// When: App initializes subscription context
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.checkSubscriptionStatus();
		});

		// Then: Should correctly identify trial state
		expect(result.current.isTrialActive).toBe(true);
		expect(result.current.trialDaysRemaining).toBe(5);
		expect(result.current.hasAccess).toBe(true);
	});

	// MARK: - Scenario: Network Connectivity Edge Cases

	it("should maintain trial access during network outages", async () => {
		// Given: User has cached active trial and network fails
		const threeDaysFromNow = Date.now() + 3 * 24 * 60 * 60 * 1000;
		const cachedTrialStatus = {
			isActive: true,
			isTrialActive: true,
			trialExpirationDate: threeDaysFromNow,
			lastVerified: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
			cacheExpiry: Date.now() + 22 * 60 * 60 * 1000, // 22 hours from now
		};
		mockedAsyncStorage.getItem.mockResolvedValue(
			JSON.stringify(cachedTrialStatus),
		);
		mockedRevenueCat.getCustomerInfo.mockRejectedValue(
			new Error("Network error"),
		);

		// When: App tries to verify subscription during outage
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		// Then: Should use cached trial status
		expect(result.current.isTrialActive).toBe(true);
		expect(result.current.hasAccess).toBe(true);
	});

	// MARK: - Scenario: Local Subscription Status Persistence

	it("should use cached subscription status within 24-hour window", async () => {
		// Given: Cached subscription status from within 24 hours
		const twentyThreeHoursAgo = Date.now() - 23 * 60 * 60 * 1000;
		const cachedStatus = {
			isActive: true,
			lastVerified: twentyThreeHoursAgo,
			cacheExpiry: twentyThreeHoursAgo + 24 * 60 * 60 * 1000,
		};
		mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedStatus));

		// When: App loads and checks cached status
		const { result } = renderHook(() => useSubscription(), { wrapper });

		// Wait for useEffect to load cached data
		await act(async () => {
			// Allow useEffect to complete
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const cachedResult = result.current.getCachedSubscriptionStatus();

		// Then: Should return cached active status
		expect(cachedResult).toBe(true);
		expect(result.current.isSubscriptionActive).toBe(true);
	});

	it("should expire cache after 24 hours and require fresh verification", async () => {
		// Given: Cached subscription status from over 24 hours ago
		const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
		const expiredCachedStatus = {
			isActive: true,
			lastVerified: twentyFiveHoursAgo,
			cacheExpiry: twentyFiveHoursAgo + 24 * 60 * 60 * 1000,
		};
		mockedAsyncStorage.getItem.mockResolvedValue(
			JSON.stringify(expiredCachedStatus),
		);

		// When: App checks expired cache
		const { result } = renderHook(() => useSubscription(), { wrapper });

		const cachedResult = result.current.getCachedSubscriptionStatus();

		// Then: Should return null for expired cache
		expect(cachedResult).toBe(null);
	});

	it("should verify subscription in background without interrupting user experience", async () => {
		// Given: Valid cached status and background verification
		const recentTime = Date.now() - 1 * 60 * 60 * 1000; // 1 hour ago
		const cachedStatus = {
			isActive: true,
			lastVerified: recentTime,
			cacheExpiry: recentTime + 24 * 60 * 60 * 1000,
		};
		mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedStatus));
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(
			createMockCustomerInfo(true),
		);

		// When: Background verification occurs
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.refreshSubscriptionStatus();
		});

		// Then: User experience should not be interrupted
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.isLoading).toBe(false);
		expect(mockedRevenueCat.getCustomerInfo).toHaveBeenCalled();
	});

	// MARK: - Scenario: Successful Purchase Flow

	it("should update subscription status immediately after successful purchase", async () => {
		// Given: User completes purchase
		const mockActiveCustomerInfo = createMockCustomerInfo(true);

		// When: Purchase completion is processed
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			result.current.handlePurchaseEvent(mockActiveCustomerInfo);
		});

		// Then: Subscription status should be updated immediately
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.hasAccess).toBe(true);
	});

	it("should grant instant access to premium features after purchase confirmation", async () => {
		// Given: Purchase is confirmed by RevenueCat
		const mockActiveCustomerInfo = createMockCustomerInfo(true);

		// When: Purchase event is handled
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			result.current.handlePurchaseEvent(mockActiveCustomerInfo);
		});

		// Then: Should have immediate premium access
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.isLoading).toBe(false);
	});

	it("should persist purchase confirmation state locally", async () => {
		// Given: Successful purchase confirmation
		const mockActiveCustomerInfo = createMockCustomerInfo(true);

		// When: Purchase is processed
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			result.current.handlePurchaseEvent(mockActiveCustomerInfo);
		});

		// Then: Should save confirmed state to local storage
		expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
			"subscription_status",
			expect.stringContaining('"isActive":true'),
		);
	});

	// MARK: - Scenario: Subscription Sync with RevenueCat

	it("should sync subscription status changes from RevenueCat within 5 minutes", async () => {
		// Given: Subscription status changes in RevenueCat
		const inactiveCustomerInfo = createMockCustomerInfo(false);
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(inactiveCustomerInfo);

		// When: Background sync detects changes
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.refreshSubscriptionStatus();
		});

		// Then: App status should sync with RevenueCat
		expect(result.current.isSubscriptionActive).toBe(false);
		expect(mockedRevenueCat.getCustomerInfo).toHaveBeenCalled();
	});

	it("should update local cache when RevenueCat changes are detected", async () => {
		// Given: RevenueCat status change detected
		const changedCustomerInfo = createMockCustomerInfo(false);
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(changedCustomerInfo);

		// When: Status sync occurs
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			await result.current.refreshSubscriptionStatus();
		});

		// Then: Local cache should be updated
		expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
			"subscription_status",
			expect.stringContaining('"isActive":false'),
		);
	});

	it("should maintain cache-first approach during background sync", async () => {
		// Given: Valid cache and background sync
		const cachedStatus = {
			isActive: true,
			lastVerified: Date.now() - 30 * 60 * 1000, // 30 minutes ago
			cacheExpiry: Date.now() + 23.5 * 60 * 60 * 1000, // expires in 23.5 hours
		};
		mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedStatus));

		// When: App loads with valid cache
		const { result } = renderHook(() => useSubscription(), { wrapper });

		// Wait for useEffect to load cached data
		await act(async () => {
			// Allow useEffect to complete
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const cachedResult = result.current.getCachedSubscriptionStatus();

		// Then: Should prioritize cache for immediate access
		expect(cachedResult).toBe(true);
		expect(result.current.isSubscriptionActive).toBe(true);
	});

	// MARK: - Scenario: Error Handling and Network Issues

	it("should handle network failures during subscription verification gracefully", async () => {
		// Given: Network failure during verification
		mockedRevenueCat.getCustomerInfo.mockRejectedValue(
			new Error("Network error"),
		);

		// When: Subscription check fails
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			try {
				await result.current.checkSubscriptionStatus();
			} catch (error) {
				// Expected to fail
			}
		});

		// Then: Should handle error gracefully
		expect(result.current.isLoading).toBe(false);
		expect(mockedRevenueCat.getCustomerInfo).toHaveBeenCalled();
	});

	it("should retry sync operations after network failures", async () => {
		// Given: Initial network failure followed by success
		mockedRevenueCat.getCustomerInfo
			.mockRejectedValueOnce(new Error("Network error"))
			.mockResolvedValueOnce(createMockCustomerInfo(true));

		// When: Retry occurs after failure
		const { result } = renderHook(() => useSubscription(), { wrapper });

		await act(async () => {
			try {
				await result.current.refreshSubscriptionStatus();
			} catch (error) {
				// First attempt fails
			}
			// Retry
			await result.current.refreshSubscriptionStatus();
		});

		// Then: Should succeed on retry
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(mockedRevenueCat.getCustomerInfo).toHaveBeenCalledTimes(2);
	});

	it("should preserve cached status during sync failures", async () => {
		// Given: Valid cached status and sync failure
		const validCachedStatus = {
			isActive: true,
			lastVerified: Date.now() - 1 * 60 * 60 * 1000,
			cacheExpiry: Date.now() + 23 * 60 * 60 * 1000,
		};
		mockedAsyncStorage.getItem.mockResolvedValue(
			JSON.stringify(validCachedStatus),
		);
		mockedRevenueCat.getCustomerInfo.mockRejectedValue(
			new Error("Sync failed"),
		);

		// When: Sync fails but cache is valid
		const { result } = renderHook(() => useSubscription(), { wrapper });

		// Wait for useEffect to load cached data
		await act(async () => {
			// Allow useEffect to complete
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const cachedResult = result.current.getCachedSubscriptionStatus();

		// Then: Should maintain cached status
		expect(cachedResult).toBe(true);
		expect(result.current.isSubscriptionActive).toBe(true);
	});

	// MARK: - Scenario: Context Hook Usage

	it("should throw error when useSubscription is used outside provider", () => {
		// Given: Hook used outside provider context
		// When: Hook is rendered without provider
		// Then: Should throw descriptive error
		expect(() => {
			renderHook(() => useSubscription());
		}).toThrow("useSubscription must be used within a SubscriptionProvider");
	});

	it("should provide consistent subscription state across multiple consumers", async () => {
		// Given: Multiple components using subscription context
		const mockActiveCustomerInfo = createMockCustomerInfo(true);
		mockedRevenueCat.getCustomerInfo.mockResolvedValue(mockActiveCustomerInfo);

		// Create a component that uses the hook multiple times
		const TestComponent = () => {
			const hook1 = useSubscription();
			const hook2 = useSubscription();

			return {
				hook1,
				hook2,
			};
		};

		// When: Multiple hooks consume the same context
		const { result } = renderHook(() => TestComponent(), { wrapper });

		await act(async () => {
			await result.current.hook1.checkSubscriptionStatus();
		});

		// Then: Both consumers should have consistent state
		expect(result.current.hook1.isSubscriptionActive).toBe(
			result.current.hook2.isSubscriptionActive,
		);
		expect(result.current.hook1.lastVerified).toBe(
			result.current.hook2.lastVerified,
		);
	});
});
