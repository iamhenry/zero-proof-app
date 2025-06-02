/**
 * FILE: tests/subscription/SubscriptionContext.integration.test.tsx
 * PURPOSE: Integration test to verify onboarding completion persistence based on BDD scenarios
 * SCOPE: Repository integration for onboarding state management
 * DEPENDENCIES: React Testing Library, Repository layer
 */

import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCustomerInfo } from "@/config/revenuecat";
import { useRepository } from "@/context/RepositoryContext";
import {
	SubscriptionProvider,
	useSubscription,
} from "@/context/SubscriptionContext";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
	getItem: jest.fn(),
	setItem: jest.fn().mockResolvedValue(undefined),
	removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/config/revenuecat", () => ({
	getCustomerInfo: jest.fn(),
	configureRevenueCat: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-router", () => ({
	router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
	useRouter: jest.fn(() => ({
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn(),
	})),
	useSegments: jest.fn(() => ["app", "(protected)"]),
	SplashScreen: {
		preventAutoHideAsync: jest.fn(),
		hideAsync: jest.fn(),
	},
}));

jest.mock("@supabase/supabase-js", () => ({
	createClient: jest.fn(() => ({
		auth: {
			getSession: jest.fn().mockResolvedValue({
				data: { session: { user: { id: "test-user" } } },
			}),
			onAuthStateChange: jest.fn(() => ({
				data: { subscription: { unsubscribe: jest.fn() } },
			})),
		},
	})),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockGetCustomerInfo = getCustomerInfo as jest.MockedFunction<
	typeof getCustomerInfo
>;

// Import the providers needed for testing
import { RepositoryProvider } from "@/context/RepositoryContext";
import { TimerStateProvider } from "@/context/TimerStateContext";
import { CalendarDataProvider } from "@/context/CalendarDataContext";
import { SavingsDataProvider } from "@/context/SavingsDataContext";
import { SupabaseProvider } from "@/context/supabase-provider";

// Provider wrapper that matches the real app structure (without subscription)
const TestProviderWrapper: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => (
	<RepositoryProvider>
		<TimerStateProvider>
			<CalendarDataProvider>
				<SavingsDataProvider>
					<SupabaseProvider>{children}</SupabaseProvider>
				</SavingsDataProvider>
			</CalendarDataProvider>
		</TimerStateProvider>
	</RepositoryProvider>
);

// Enhanced TestProviderWrapper that includes SubscriptionProvider
const TestProviderWrapperWithSubscription: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => (
	<TestProviderWrapper>
		<SubscriptionProvider>{children}</SubscriptionProvider>
	</TestProviderWrapper>
);

describe("User Onboarding Journey Integration", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockAsyncStorage.getItem.mockResolvedValue(null);
		mockAsyncStorage.setItem.mockResolvedValue();
		mockGetCustomerInfo.mockResolvedValue({
			activeSubscriptions: [],
			entitlements: { active: {} },
		} as any);
	});

	describe("Scenario 7: New User First-Time Onboarding Flow", () => {
		it("should load onboarding completion as false for new users", async () => {
			// Given: New user with no stored data
			mockAsyncStorage.getItem.mockResolvedValue(null);

			// When: Repository loads onboarding completion
			const { result } = renderHook(() => useRepository(), {
				wrapper: TestProviderWrapper,
			});

			// Then: Should return false for new users
			await waitFor(async () => {
				const completed = await result.current.loadOnboardingCompletion();
				expect(completed).toBe(false);
			});
		});
	});

	describe("Scenario 8: Returning User Who Previously Completed Onboarding", () => {
		it("should load onboarding completion as true for returning users", async () => {
			// Given: User has previously completed onboarding
			mockAsyncStorage.getItem.mockResolvedValue("true");

			// When: Repository loads onboarding completion
			const { result } = renderHook(() => useRepository(), {
				wrapper: TestProviderWrapper,
			});

			// Then: Should return true for returning users
			await waitFor(async () => {
				const completed = await result.current.loadOnboardingCompletion();
				expect(completed).toBe(true);
			});
		});
	});

	describe("Scenario 9: Existing User With Active Subscription Returning", () => {
		it("should load onboarding completion as true and have subscription access", async () => {
			// Given: User has completed onboarding and has active subscription
			mockAsyncStorage.getItem.mockImplementation((key) => {
				if (key === "@SobrietyApp:onboardingCompleted") {
					return Promise.resolve("true");
				}
				if (key === "subscription_status") {
					return Promise.resolve(
						JSON.stringify({
							isActive: true,
							lastVerified: Date.now(),
							cacheExpiry: Date.now() + 24 * 60 * 60 * 1000,
						}),
					);
				}
				return Promise.resolve(null);
			});

			// When: Both repository and subscription context load
			const { result } = renderHook(
				() => {
					const repository = useRepository();
					const subscription = useSubscription();
					return { repository, subscription };
				},
				{
					wrapper: TestProviderWrapperWithSubscription,
				},
			);

			// Then: Should have both onboarding completion and subscription access
			await waitFor(async () => {
				const completed =
					await result.current.repository.loadOnboardingCompletion();
				expect(completed).toBe(true);
			});

			await waitFor(() => {
				expect(result.current.subscription.isSubscriptionActive).toBe(true);
			});
		});
	});

	describe("Onboarding Completion Persistence", () => {
		it("should save and persist onboarding completion correctly", async () => {
			// Given: User completes onboarding
			mockAsyncStorage.getItem.mockResolvedValue(null);

			// When: Repository saves onboarding completion
			const { result } = renderHook(() => useRepository(), {
				wrapper: TestProviderWrapper,
			});

			await waitFor(async () => {
				await result.current.saveOnboardingCompletion(true);
			});

			// Then: Should save to the correct storage key
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				"@SobrietyApp:onboardingCompleted",
				"true",
			);

			// And: When loading again, should return true
			mockAsyncStorage.getItem.mockResolvedValue("true");

			await waitFor(async () => {
				const completed = await result.current.loadOnboardingCompletion();
				expect(completed).toBe(true);
			});
		});

		it("should handle onboarding completion state transitions", async () => {
			// Given: User starts without onboarding completion
			mockAsyncStorage.getItem.mockResolvedValue(null);

			const { result } = renderHook(() => useRepository(), {
				wrapper: TestProviderWrapper,
			});

			// When: Initially checking completion status
			await waitFor(async () => {
				const completed = await result.current.loadOnboardingCompletion();
				expect(completed).toBe(false); // Should default to false
			});

			// And: User completes onboarding
			await waitFor(async () => {
				await result.current.saveOnboardingCompletion(true);
			});

			// Then: Should save the completion
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				"@SobrietyApp:onboardingCompleted",
				"true",
			);

			// And: Subsequent loads should return true
			mockAsyncStorage.getItem.mockResolvedValue("true");

			await waitFor(async () => {
				const completed = await result.current.loadOnboardingCompletion();
				expect(completed).toBe(true);
			});
		});
	});

	describe("Critical MVP Integration Tests", () => {
		describe("Purchase Flow Integration (Scenario 3)", () => {
			it("should update subscription state after successful purchase", async () => {
				// Given: User starts without subscription and completes purchase
				mockAsyncStorage.getItem.mockImplementation((key) => {
					if (key === "@SobrietyApp:onboardingCompleted") {
						return Promise.resolve(null); // Not completed yet
					}
					return Promise.resolve(null);
				});

				// Mock successful purchase - RevenueCat returns active subscription
				const mockCustomerInfo = {
					activeSubscriptions: ["premium"],
					entitlements: {
						active: {
							premium: { isActive: true },
						},
					},
				};

				// When: Subscription context processes purchase event
				const { result } = renderHook(
					() => {
						const subscription = useSubscription();
						const repository = useRepository();
						return { subscription, repository };
					},
					{
						wrapper: TestProviderWrapperWithSubscription,
					},
				);

				// Simulate purchase completion by calling handlePurchaseEvent
				await waitFor(() => {
					result.current.subscription.handlePurchaseEvent(mockCustomerInfo);
				});

				// Then: Subscription state should be updated
				await waitFor(() => {
					expect(result.current.subscription.isSubscriptionActive).toBe(true);
				});

				// And: Should verify subscription status was cached
				expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
					"subscription_status",
					expect.stringContaining('"isActive":true'),
				);
			});

			it("should handle purchase failure gracefully", async () => {
				// Given: User attempts purchase but it fails
				mockAsyncStorage.getItem.mockResolvedValue(null);

				// Mock failed purchase - no active subscription
				const mockCustomerInfo = {
					activeSubscriptions: [],
					entitlements: { active: {} },
				};

				// When: Subscription context processes failed purchase
				const { result } = renderHook(
					() => {
						const subscription = useSubscription();
						return { subscription };
					},
					{
						wrapper: TestProviderWrapperWithSubscription,
					},
				);

				// Simulate failed purchase
				await waitFor(() => {
					result.current.subscription.handlePurchaseEvent(mockCustomerInfo);
				});

				// Then: Subscription should remain inactive
				await waitFor(() => {
					expect(result.current.subscription.isSubscriptionActive).toBe(false);
				});

				// And: Should cache the inactive status
				expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
					"subscription_status",
					expect.stringContaining('"isActive":false'),
				);
			});
		});

		describe("Subscription Detection on App Launch (Scenario 1)", () => {
			it("should automatically detect active subscription and grant access", async () => {
				// Given: User has active subscription in RevenueCat and completed onboarding
				mockAsyncStorage.getItem.mockImplementation((key) => {
					if (key === "@SobrietyApp:onboardingCompleted") {
						return Promise.resolve("true"); // Previously completed
					}
					if (key === "subscription_status") {
						return Promise.resolve(
							JSON.stringify({
								isActive: true,
								lastVerified: Date.now(),
								cacheExpiry: Date.now() + 24 * 60 * 60 * 1000,
							}),
						);
					}
					return Promise.resolve(null);
				});

				mockGetCustomerInfo.mockResolvedValue({
					activeSubscriptions: ["premium"],
					entitlements: {
						active: {
							premium: { isActive: true },
						},
					},
				} as any);

				// When: App launches and subscription context initializes
				const { result } = renderHook(
					() => {
						const subscription = useSubscription();
						return { subscription };
					},
					{
						wrapper: TestProviderWrapperWithSubscription,
					},
				);

				// Then: Subscription status should be automatically detected from cache
				await waitFor(
					() => {
						expect(result.current.subscription.isSubscriptionActive).toBe(true);
					},
					{ timeout: 3000 },
				);

				// And: Loading state should eventually be false
				await waitFor(() => {
					expect(result.current.subscription.isLoading).toBe(false);
				});
			});

			it("should handle no subscription gracefully on app launch", async () => {
				// Given: User has no active subscription
				mockAsyncStorage.getItem.mockImplementation((key) => {
					if (key === "@SobrietyApp:onboardingCompleted") {
						return Promise.resolve("true"); // Previously completed onboarding
					}
					if (key === "subscription_status") {
						return Promise.resolve(
							JSON.stringify({
								isActive: false,
								lastVerified: Date.now(),
								cacheExpiry: Date.now() + 24 * 60 * 60 * 1000,
							}),
						);
					}
					return Promise.resolve(null);
				});

				mockGetCustomerInfo.mockResolvedValue({
					activeSubscriptions: [],
					entitlements: { active: {} },
				} as any);

				// When: App launches and subscription context initializes
				const { result } = renderHook(
					() => {
						const subscription = useSubscription();
						return { subscription };
					},
					{
						wrapper: TestProviderWrapperWithSubscription,
					},
				);

				// Then: Subscription should be detected as inactive
				await waitFor(() => {
					expect(result.current.subscription.isSubscriptionActive).toBe(false);
				});

				// And: Loading state should eventually be false
				await waitFor(() => {
					expect(result.current.subscription.isLoading).toBe(false);
				});
			});

			it("should handle RevenueCat service errors gracefully", async () => {
				// Given: RevenueCat service is unavailable
				mockAsyncStorage.getItem.mockResolvedValue(null);
				mockGetCustomerInfo.mockRejectedValue(
					new Error("RevenueCat service unavailable"),
				);

				// When: App launches and tries to check subscription
				const { result } = renderHook(
					() => {
						const subscription = useSubscription();
						return { subscription };
					},
					{
						wrapper: TestProviderWrapperWithSubscription,
					},
				);

				// Then: Should handle error gracefully and default to no subscription
				await waitFor(() => {
					expect(result.current.subscription.isSubscriptionActive).toBe(false);
				});

				// And: Loading state should eventually be false
				await waitFor(() => {
					expect(result.current.subscription.isLoading).toBe(false);
				});
			});

			it("should refresh subscription status when explicitly called", async () => {
				// Given: User wants to refresh subscription status
				mockAsyncStorage.getItem.mockResolvedValue(null);
				mockGetCustomerInfo.mockResolvedValue({
					activeSubscriptions: ["premium"],
					entitlements: {
						active: {
							premium: { isActive: true },
						},
					},
				} as any);

				// When: Subscription context refreshes status
				const { result } = renderHook(
					() => {
						const subscription = useSubscription();
						return { subscription };
					},
					{
						wrapper: TestProviderWrapperWithSubscription,
					},
				);

				// Call refresh explicitly
				await waitFor(async () => {
					await result.current.subscription.refreshSubscriptionStatus();
				});

				// Then: Should update subscription state
				await waitFor(() => {
					expect(result.current.subscription.isSubscriptionActive).toBe(true);
				});

				// And: Should verify RevenueCat was called
				expect(mockGetCustomerInfo).toHaveBeenCalled();

				// And: Should cache the updated status
				expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
					"subscription_status",
					expect.stringContaining('"isActive":true'),
				);
			});
		});
	});
});
