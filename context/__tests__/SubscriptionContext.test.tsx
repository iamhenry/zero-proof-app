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

		// Then: Subscription status should update immediately
		expect(result.current.isSubscriptionActive).toBe(true);
		expect(result.current.lastVerified).toBeTruthy();
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
