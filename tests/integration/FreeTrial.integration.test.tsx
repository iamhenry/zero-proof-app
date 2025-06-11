import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCustomerInfo } from "@/config/revenuecat";
import { SubscriptionProvider, useSubscription } from "@/context/SubscriptionContext";
import { RepositoryProvider } from "@/context/RepositoryContext"; // Assuming you might need this for onboarding status

// Mocks
jest.mock("@react-native-async-storage/async-storage", () => ({
	getItem: jest.fn(),
	setItem: jest.fn().mockResolvedValue(undefined),
	removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Mock RevenueCat SDK functions used by SubscriptionContext (via config/revenuecat)
// It's crucial this mock is effective for getCustomerInfo called from SubscriptionContext
jest.mock("@/config/revenuecat", () => ({
	getCustomerInfo: jest.fn(),
	configureRevenueCat: jest.fn().mockResolvedValue(undefined), // if called during init
}));

// Mock expo-router if your components/context use it
jest.mock("expo-router", () => ({
	router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
	useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
	useSegments: jest.fn(() => ["app", "(protected)"]), // Adjust as needed
	SplashScreen: { preventAutoHideAsync: jest.fn(), hideAsync: jest.fn() },
}));


const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockGetCustomerInfo = getCustomerInfo as jest.MockedFunction<typeof getCustomerInfo>;

// Wrapper for rendering hooks with necessary providers
const AllProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<RepositoryProvider> {/* If onboarding status is involved */}
		<SubscriptionProvider>{children}</SubscriptionProvider>
	</RepositoryProvider>
);

describe("Free Trial Integration Flow", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Default: No active subscription or trial, onboarding not completed
		mockAsyncStorage.getItem.mockImplementation((key: string) => {
			if (key === "subscription_status") return Promise.resolve(null);
			if (key === "@SobrietyApp:onboardingCompleted") return Promise.resolve("false");
			return Promise.resolve(null);
		});
		mockAsyncStorage.setItem.mockResolvedValue(undefined);

		// Default mock for getCustomerInfo: No active entitlements
		mockGetCustomerInfo.mockResolvedValue({
			entitlements: { active: {}, all: {} },
			activeSubscriptions: [],
			// Add other fields if your SubscriptionContext's type for CustomerInfo is strict
		} as any);
	});

	describe("Scenario: New user starts a free trial", () => {
		it("should grant access when a new user successfully starts a free trial", async () => {
			// Given: A new user (onboarding not completed, no prior subscription)
			// PaywallScreen would normally call handlePurchaseEvent upon successful trial activation

			const { result } = renderHook(() => useSubscription(), { wrapper: AllProvidersWrapper });

			// Wait for initial loading to complete from useEffect's checkSubscriptionStatus
			await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 2000 });
			console.log('[TEST:afterInitialLoad] isTrialActive:', result.current.isTrialActive, 'hasAccess:', result.current.hasAccess, 'status:', result.current.subscriptionStatus);


			// Simulate successful trial activation (as if PaywallScreen called handlePurchaseEvent)
			const trialCustomerInfo = {
				entitlements: {
					active: {
						premium: { // Assuming 'premium' is the entitlement ID
							isActive: true,
							periodType: "TRIAL",
							productIdentifier: "zp_weekly_free_trial_offer",
							willRenew: true, // Or false if it's a non-renewing trial that needs explicit opt-in
							latestPurchaseDate: new Date().toISOString(),
							originalPurchaseDate: new Date().toISOString(),
							expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Trial active for 7 days
						},
					},
					all: { /* ... similar data ... */ }
				},
				activeSubscriptions: ["zp_weekly_free_trial_offer"],
			};

			await act(async () => {
				// Directly call handlePurchaseEvent, simulating a successful purchase from Paywall
				result.current.handlePurchaseEvent(trialCustomerInfo as any);
			});

			// Then: User should have access and subscription status should reflect trial
			await waitFor(() => {
				console.log('[TEST:waitFor] isTrialActive:', result.current.isTrialActive, 'hasAccess:', result.current.hasAccess, 'status:', result.current.subscriptionStatus);
				expect(result.current.isTrialActive).toBe(true);
			});
			// If the above passes, then check hasAccess and subscriptionStatus
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.subscriptionStatus).toBe("trial");

			// And: The subscription status should be cached
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				"subscription_status",
				expect.stringContaining(`"isTrial":true`)
			);
		});
	});

	describe("Scenario: User cancels trial, and it expires", () => {
		it("should revoke access after a cancelled trial expires", async () => {
			// Given: A user had an active trial, but it was cancelled and has now expired
			const expiredTrialCustomerInfo = {
				entitlements: {
					active: {}, // No active entitlements
					all: {
						premium: {
							isActive: false,
							periodType: "TRIAL",
							productIdentifier: "zp_weekly_free_trial_offer",
							willRenew: false, // Cancelled
							latestPurchaseDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // Purchased 8 days ago
							originalPurchaseDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
							expirationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Expired yesterday
						},
					},
				},
				activeSubscriptions: [],
			};
			mockGetCustomerInfo.mockResolvedValue(expiredTrialCustomerInfo as any);

			// Set up cached status to reflect an ongoing trial initially, to see it change
			mockAsyncStorage.getItem.mockImplementation((key: string) => {
				if (key === "subscription_status") {
					return Promise.resolve(JSON.stringify({
						isActive: false, // Not a 'paid' active
						isTrial: true,   // Was a trial
						lastVerified: Date.now() - 2 * 24 * 60 * 60 * 1000, // last verified 2 days ago
						cacheExpiry: Date.now() + 22 * 60 * 60 * 1000, // cache still valid
					}));
				}
				return Promise.resolve(null);
			});


			const { result } = renderHook(() => useSubscription(), { wrapper: AllProvidersWrapper });

			// When: The app checks for subscription status (e.g., on app open or refresh)
			// The useEffect in SubscriptionProvider should call checkSubscriptionStatus on mount if cache is expired or missing.
			// If cache is valid (as set above), we might need an explicit refresh to simulate passage of time & re-fetch.
			await act(async () => {
				await result.current.refreshSubscriptionStatus(); // Or checkSubscriptionStatus()
			});

			// Then: User should lose access
			await waitFor(() => {
				expect(result.current.hasAccess).toBe(false);
				expect(result.current.isTrialActive).toBe(false);
				expect(result.current.isSubscriptionActive).toBe(false);
				expect(result.current.subscriptionStatus).toBe("inactive");
			});

			// And: The new inactive status should be cached
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				"subscription_status",
				expect.stringContaining(`"isActive":false,"isTrial":false`)
			);
		});
	});
});
