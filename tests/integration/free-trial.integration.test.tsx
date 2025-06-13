/**
 * FILE: tests/integration/free-trial.integration.test.tsx
 * PURPOSE: Red Phase integration tests for the 7-day free trial feature, based on BDD scenarios in bdd-free-trial.md
 * SCOPE: Cross-component business logic and user journey verification for free trial, referencing unit tests for SubscriptionContext and PaywallScreen
 * DEPENDENCIES: SubscriptionContext, PaywallScreen, AsyncStorage, RevenueCat, Supabase
 * NOTE: Follows strict Red Phase process—tests must fail for missing business logic/integration, not setup errors
 */

import React from "react";
import {
	render,
	waitFor,
	fireEvent,
	renderHook,
	act,
} from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCustomerInfo, getOfferings } from "@/config/revenuecat";
import { SupabaseProvider } from "@/context/supabase-provider";
import { RepositoryProvider } from "@/context/RepositoryContext";
import { TimerStateProvider } from "@/context/TimerStateContext";
import { CalendarDataProvider } from "@/context/CalendarDataContext";
import { SavingsDataProvider } from "@/context/SavingsDataContext";
import {
	SubscriptionProvider,
	useSubscription,
} from "@/context/SubscriptionContext";
// PaywallScreen will be mocked below

// Proper type definitions for our test environment

// Mock the native RevenueCat UI module before any imports that use it
jest.mock("react-native-purchases-ui", () => ({
	Paywall: () => null, // Stub component for integration tests
}));

// Mock PaywallScreen for integration tests
jest.mock("@/components/ui/onboarding/PaywallScreen", () => ({
	__esModule: true,
	default: jest.fn(),
}));

// Mock Expo Router hooks for test environment
jest.mock("expo-router", () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn(),
	}),
	useSegments: () => [],
	useRootNavigationState: () => ({
		key: "test",
		stale: false,
		type: "test",
		index: 0,
		history: [],
		routes: [],
	}),
	SplashScreen: {
		preventAutoHideAsync: jest.fn(),
		hideAsync: jest.fn(),
	},
}));

// Test helper to simulate subscription state - enhanced for complete system state
interface SetupTrialStateParams {
	isActive: boolean;
	daysElapsed: number;
	isConverted?: boolean;
	isCancelled?: boolean;
}

const setupTrialState = ({
	isActive,
	daysElapsed,
	isConverted = false,
	isCancelled = false,
}: SetupTrialStateParams) => {
	const trialStartDate = new Date(
		Date.now() - daysElapsed * 24 * 60 * 60 * 1000,
	);
	const expirationDate = isActive
		? new Date(Date.now() + (7 - daysElapsed) * 24 * 60 * 60 * 1000)
		: new Date(Date.now() - 1000);

	// Mock AsyncStorage responses for subscription state persistence
	mockAsyncStorage.getItem.mockImplementation((key) => {
		if (key === "trialStartDate") {
			return Promise.resolve(trialStartDate.toISOString());
		}
		if (key === "subscription_status") {
			return Promise.resolve(
				JSON.stringify({
					isActive,
					lastVerified: Date.now(),
					cacheExpiry: Date.now() + 24 * 60 * 60 * 1000,
					isTrialActive: isActive,
					trialExpirationDate: expirationDate.getTime(),
					isTrialConverted: isConverted,
					isTrialCancelled: isCancelled,
					isTrialExpired: !isActive && !isConverted,
				}),
			);
		}
		return Promise.resolve(null);
	});

	// Mock complete RevenueCat CustomerInfo response
	mockGetCustomerInfo.mockResolvedValue({
		activeSubscriptions: isActive ? ["zp_weekly_free_trial_offer"] : [],
		entitlements: {
			active: isActive
				? {
						premium: {
							isActive: true,
							expirationDate: expirationDate.toISOString(),
							willRenew: isActive && !isCancelled,
						},
					}
				: {},
			all: {
				premium: {
					isActive: isActive,
					expirationDate: expirationDate.toISOString(),
					willRenew: isActive && !isCancelled,
				},
			},
		},
		allPurchasedProductIdentifiers: ["zp_weekly_free_trial_offer"],
		isTrialConversion: isConverted,
		latestExpirationDate: expirationDate.toISOString(),
	} as any);
};

// Mock only true external dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
	getItem: jest.fn(),
	setItem: jest.fn().mockResolvedValue(undefined),
	removeItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/config/revenuecat", () => ({
	getCustomerInfo: jest.fn(),
	getOfferings: jest.fn(),
	configureRevenueCat: jest.fn().mockResolvedValue(undefined),
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
const mockGetOfferings = getOfferings as jest.MockedFunction<
	typeof getOfferings
>;

// Mock PaywallScreen implementation
const MockPaywallScreen = require("@/components/ui/onboarding/PaywallScreen").default as jest.MockedFunction<any>;

// Provider wrapper matching app/_layout.tsx
const TestAppProviders: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => (
	<RepositoryProvider>
		<TimerStateProvider>
			<CalendarDataProvider>
				<SavingsDataProvider>
					<SupabaseProvider>
						<SubscriptionProvider>{children}</SubscriptionProvider>
					</SupabaseProvider>
				</SavingsDataProvider>
			</CalendarDataProvider>
		</TimerStateProvider>
	</RepositoryProvider>
);

// Helper: Render PaywallScreen in full provider context
const renderPaywall = (onDone = jest.fn()) => {
	const PaywallScreen = require("@/components/ui/onboarding/PaywallScreen").default;
	
	return render(
		<TestAppProviders>
			<PaywallScreen onDone={onDone} />
		</TestAppProviders>,
	);
};

// Reference: Unit tests for SubscriptionContext and PaywallScreen cover component-level logic
// This file focuses on cross-component/system behavior per BDD

describe("7-Day Free Trial Feature Integration (Red Phase)", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockAsyncStorage.getItem.mockResolvedValue(null);
		mockGetCustomerInfo.mockResolvedValue({
			activeSubscriptions: [],
			entitlements: { active: {}, all: {} },
			allPurchasedProductIdentifiers: [],
			isTrialConversion: false,
			latestExpirationDate: null,
		} as any);
		mockGetOfferings.mockResolvedValue({
			current: {
				availablePackages: [
					{ identifier: "zp_weekly_free_trial_offer" },
				] as any,
			},
			all: { zp_weekly_free_trial_offer: {} as any },
		} as any);

		// Setup PaywallScreen mock implementation
		MockPaywallScreen.mockImplementation(({ onDone }: { onDone?: () => void }) => {
			const React = require("react");
			const { View, TouchableOpacity } = require("react-native");
			const { useSubscription } = require("@/context/SubscriptionContext");
			
			const subscription = useSubscription();
			
			// If user has access, don't show paywall
			if (subscription.hasAccess) {
				return null;
			}
			
			// Mock trial purchase event
			const handleTrialPurchase = () => {
				const mockTrialCustomerInfo = {
					activeSubscriptions: ["zp_weekly_free_trial_offer"],
					entitlements: {
						active: {
							premium: {
								isActive: true,
								expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
								willRenew: true,
							},
						},
						all: {
							premium: {
								isActive: true,
								expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
								willRenew: true,
							},
						},
					},
					allPurchasedProductIdentifiers: ["zp_weekly_free_trial_offer"],
					isTrialConversion: false,
					latestExpirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				};
				
				subscription.handlePurchaseEvent(mockTrialCustomerInfo);
				if (onDone) onDone();
			};
			
			// Mock regular plan purchase
			const handlePlanPurchase = () => {
				const mockPaidCustomerInfo = {
					activeSubscriptions: ["zp_weekly_subscription"],
					entitlements: {
						active: {
							premium: {
								isActive: true,
								expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
								willRenew: true,
							},
						},
						all: {
							premium: {
								isActive: true,
								expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
								willRenew: true,
							},
						},
					},
					allPurchasedProductIdentifiers: ["zp_weekly_subscription"],
					isTrialConversion: false,
					latestExpirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				};
				
				subscription.handlePurchaseEvent(mockPaidCustomerInfo);
				if (onDone) onDone();
			};
			
			return React.createElement(View, { testID: "paywall" }, [
				React.createElement(TouchableOpacity, {
					key: "trial-button",
					testID: "weekly-trial-button",
					onPress: handleTrialPurchase,
				}),
				React.createElement(TouchableOpacity, {
					key: "plan-button", 
					testID: "weekly-plan-button",
					onPress: handlePlanPurchase,
				}),
			]);
		});
	});

	// SCENARIO 1: Trial Initiation from Paywall
	describe("Scenario 1: Trial Initiation from Paywall", () => {
		it("should grant immediate premium access and start trial after selecting free trial offer", async () => {
			// Given: New user viewing paywall with trial offer available
			const onDone = jest.fn();
			const { getByTestId } = renderPaywall(onDone);

			// And: Subscription context is available for user journey
			const { result } = renderHook(() => useSubscription(), {
				wrapper: TestAppProviders,
			});

			// Verify initial state - user has no access
			expect(result.current.hasAccess).toBe(false);
			expect(result.current.shouldShowPaywall).toBe(true);

			// When: User selects weekly plan with free trial
			const weeklyPlanButton = getByTestId("weekly-trial-button");
			fireEvent.press(weeklyPlanButton);

			// And: Purchase completes successfully (simulate RevenueCat purchase event)
			const mockSuccessfulTrialPurchase = {
				activeSubscriptions: ["zp_weekly_free_trial_offer"],
				entitlements: {
					active: {
						premium: {
							isActive: true,
							expirationDate: new Date(
								Date.now() + 7 * 24 * 60 * 60 * 1000,
							).toISOString(),
							willRenew: true,
						},
					},
					all: {
						premium: {
							isActive: true,
							expirationDate: new Date(
								Date.now() + 7 * 24 * 60 * 60 * 1000,
							).toISOString(),
							willRenew: true,
						},
					},
				},
				allPurchasedProductIdentifiers: ["zp_weekly_free_trial_offer"],
				isTrialConversion: false,
				latestExpirationDate: new Date(
					Date.now() + 7 * 24 * 60 * 60 * 1000,
				).toISOString(),
			};

			// When: Purchase event is processed by subscription context
			await act(async () => {
				result.current.handlePurchaseEvent(mockSuccessfulTrialPurchase);
			});

			// Then: User should have immediate premium access (RED PHASE - EXPECTED TO FAIL)
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.isTrialActive).toBe(true);
			expect(result.current.trialDaysRemaining).toBe(7);
			expect(result.current.shouldShowPaywall).toBe(false);

			// And: Trial expiration should be set correctly
			expect(result.current.trialExpirationDate).toBeDefined();

			// And: User should be able to access all premium features
			expect(result.current.subscriptionStatus).toBe("active");
		});
	});

	// SCENARIO 2: Premium Access During Active Trial
	describe("Scenario 2: Premium Access During Active Trial", () => {
		it("should provide full premium access and no paywall during active trial", async () => {
			// Given: User has active 7-day free trial (2 days elapsed)
			setupTrialState({ isActive: true, daysElapsed: 2 });

			// When: User launches app and subscription context loads
			const { result } = renderHook(() => useSubscription(), {
				wrapper: TestAppProviders,
			});

			// Simulate context initialization with cached trial state
			await act(async () => {
				await result.current.checkSubscriptionStatus();
			});

			// Then: User should have full premium access (RED PHASE - EXPECTED TO FAIL)
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.isTrialActive).toBe(true);
			expect(result.current.shouldShowPaywall).toBe(false);
			expect(result.current.subscriptionStatus).toBe("active");

			// And: Trial should show correct remaining days
			expect(result.current.trialDaysRemaining).toBe(5);

			// When: User navigates to premium content (paywall should not appear)
			const { queryByTestId } = renderPaywall();

			// Wait for subscription context to load in PaywallScreen
			await waitFor(() => {
				expect(queryByTestId("paywall")).toBeNull();
			}, { timeout: 3000 });

			// And: User experience should be identical to paid subscriber
			expect(result.current.subscriptionStatus).toBe("active");
		});
	});

	// SCENARIO 3: Trial Conversion to Paid Subscription
	describe("Scenario 3: Trial Conversion to Paid Subscription", () => {
		it("should seamlessly convert trial to paid subscription after 7 days", async () => {
			// Given: User completed 7-day trial, did not cancel
			setupTrialState({ isActive: true, daysElapsed: 7, isConverted: true });

			// When: App launches after trial conversion
			const { result } = renderHook(() => useSubscription(), {
				wrapper: TestAppProviders,
			});

			await act(async () => {
				await result.current.checkSubscriptionStatus();
			});

			// Then: Access remains uninterrupted (RED PHASE - EXPECTED TO FAIL)
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.isTrialActive).toBe(false);
			expect(result.current.isTrialConverted).toBe(true);
			expect(result.current.subscriptionStatus).toBe("active");

			// And: User should not experience any interruption in service
			expect(result.current.shouldShowPaywall).toBe(false);

			// When: User accesses premium features
			const { queryByTestId } = renderPaywall();

			// Wait for subscription context to load in PaywallScreen
			await waitFor(() => {
				expect(queryByTestId("paywall")).toBeNull();
			}, { timeout: 3000 });
		});
	});

	// SCENARIO 4: Trial Cancellation During Trial Period
	describe("Scenario 4: Trial Cancellation During Trial Period", () => {
		it("should maintain access until trial expires, then revoke premium after cancellation", async () => {
			// Given: User cancelled during trial but trial period not yet expired (Day 5 of 7)
			setupTrialState({ isActive: true, daysElapsed: 5, isCancelled: true });

			// When: User uses app during remaining trial period
			const { result } = renderHook(() => useSubscription(), {
				wrapper: TestAppProviders,
			});

			await act(async () => {
				await result.current.checkSubscriptionStatus();
			});

			// Then: User should still have access until natural expiration (RED PHASE - EXPECTED TO FAIL)
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.isTrialActive).toBe(true);
			expect(result.current.isTrialCancelled).toBe(true);
			expect(result.current.trialDaysRemaining).toBe(2);

			// When: Trial period expires (simulate day 8)
			setupTrialState({ isActive: false, daysElapsed: 8, isCancelled: true });

			await act(async () => {
				await result.current.checkSubscriptionStatus();
			});

			// Then: Access should be revoked after natural expiration
			expect(result.current.hasAccess).toBe(false);
			expect(result.current.isTrialActive).toBe(false);
			expect(result.current.shouldShowPaywall).toBe(true);

			// When: User tries to access premium content
			const { getByTestId } = renderPaywall();

			// Then: Paywall should be shown
			expect(getByTestId("paywall")).toBeDefined();
		});
	});

	// SCENARIO 5: Expired Trial Without Conversion
	describe("Scenario 5: Expired Trial Without Conversion", () => {
		it("should block premium access and show paywall after expired trial if not subscribed", async () => {
			// Given: User's trial expired 1 day ago, no paid subscription
			setupTrialState({ isActive: false, daysElapsed: 8, isConverted: false });

			// When: User launches app after trial expiration
			const { result } = renderHook(() => useSubscription(), {
				wrapper: TestAppProviders,
			});

			await act(async () => {
				await result.current.checkSubscriptionStatus();
			});

			// Then: Access should be blocked (RED PHASE - EXPECTED TO FAIL)
			expect(result.current.hasAccess).toBe(false);
			expect(result.current.isTrialActive).toBe(false);
			expect(result.current.isTrialExpired).toBe(true);
			expect(result.current.shouldShowPaywall).toBe(true);
			expect(result.current.subscriptionStatus).toBe("inactive");

			// When: User tries to access premium features
			const { getByTestId } = renderPaywall();

			// Then: Paywall should be displayed
			expect(getByTestId("paywall")).toBeDefined();

			// And: User should be able to purchase new subscription
			const weeklyPlanButton = getByTestId("weekly-plan-button");
			expect(weeklyPlanButton).toBeDefined();
		});
	});

	// SCENARIO 6: Trial State Detection on App Launch
	describe("Scenario 6: Trial State Detection on App Launch", () => {
		it("should restore trial state and premium access on app relaunch during active trial", async () => {
			// Given: User has active trial, closes and reopens app (3 days into trial)
			setupTrialState({ isActive: true, daysElapsed: 3 });

			// When: App launches and subscription context initializes
			const { result } = renderHook(() => useSubscription(), {
				wrapper: TestAppProviders,
			});

			// Simulate the context loading cached state on mount (this happens automatically)
			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Then: Trial state should be restored from cache (RED PHASE - EXPECTED TO FAIL)
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.isTrialActive).toBe(true);
			expect(result.current.trialDaysRemaining).toBe(4);
			expect(result.current.shouldShowPaywall).toBe(false);

			// When: App refreshes subscription status from RevenueCat
			await act(async () => {
				await result.current.checkSubscriptionStatus();
			});

			// Then: State should remain consistent after remote verification
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.isTrialActive).toBe(true);
			expect(result.current.subscriptionStatus).toBe("active");

			// When: User navigates to premium content
			const { queryByTestId } = renderPaywall();

			// Wait for subscription context to load in PaywallScreen
			await waitFor(() => {
				expect(queryByTestId("paywall")).toBeNull();
			}, { timeout: 3000 });
		});
	});

	// SCENARIO 7: Trial User Experience Consistency
	describe("Scenario 7: Trial User Experience Consistency", () => {
		it("should provide identical experience to paid subscriber during trial", async () => {
			// Given: User on active trial (1 day into 7-day trial)
			setupTrialState({ isActive: true, daysElapsed: 1 });

			// When: User uses app normally
			const { result } = renderHook(() => useSubscription(), {
				wrapper: TestAppProviders,
			});

			await act(async () => {
				await result.current.checkSubscriptionStatus();
			});

			// Then: Full premium access should be granted (RED PHASE - EXPECTED TO FAIL)
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.subscriptionStatus).toBe("active");
			expect(result.current.shouldShowPaywall).toBe(false);

			// And: Experience should be identical to paid subscriber
			expect(result.current.isTrialActive).toBe(true);
			expect(result.current.trialDaysRemaining).toBe(6);

			// When: User navigates through app (no trial-specific UI should appear)
			const { queryByText, queryByTestId } = renderPaywall();

			// Wait for subscription context to load in PaywallScreen
			await waitFor(() => {
				expect(queryByTestId("paywall")).toBeNull();
			}, { timeout: 3000 });
			
			// Then: No trial-specific messaging or limitations should be visible
			expect(queryByTestId("trial-status-banner")).toBeNull();

			// And: No prominent trial messaging in UI
			expect(queryByText(/free trial/i)).toBeNull();
			expect(queryByText(/trial expires/i)).toBeNull();

			// And: Full functionality should be available
			expect(result.current.hasAccess).toBe(true);
		});
	});

	// SCENARIO 8: Network Connectivity Edge Cases
	describe("Scenario 8: Network Connectivity Edge Cases", () => {
		it("should maintain premium access and trial state offline, and sync when online", async () => {
			// Given: User has active trial (3 days into trial), device goes offline
			setupTrialState({ isActive: true, daysElapsed: 3 });

			// When: User launches app and subscription context loads from cache
			const { result } = renderHook(() => useSubscription(), {
				wrapper: TestAppProviders,
			});

			// Initial cached state should load
			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Then: Access should be maintained using cached state (RED PHASE - EXPECTED TO FAIL)
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.isTrialActive).toBe(true);
			expect(result.current.subscriptionStatus).toBe("active");

			// When: Device is offline (simulate network failure)
			mockGetCustomerInfo.mockRejectedValue(new Error("Network error"));

			// User tries to refresh subscription status while offline
			await act(async () => {
				try {
					await result.current.checkSubscriptionStatus();
				} catch (error) {
					// Network error expected - should not crash app
				}
			});

			// Then: Access should be maintained using cached state
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.isTrialActive).toBe(true);

			// When: User navigates to premium features while offline
			const { queryByTestId } = renderPaywall();

			// Wait for subscription context to load in PaywallScreen
			await waitFor(() => {
				expect(queryByTestId("paywall")).toBeNull();
			}, { timeout: 3000 });

			// When: Connectivity returns (reset mock to succeed)
			setupTrialState({ isActive: true, daysElapsed: 3 });

			// Sync should work properly
			await act(async () => {
				await result.current.checkSubscriptionStatus();
			});

			// Then: State should sync properly with remote service
			expect(result.current.hasAccess).toBe(true);
			expect(result.current.isTrialActive).toBe(true);
			expect(result.current.trialDaysRemaining).toBe(4);
		});
	});
});
