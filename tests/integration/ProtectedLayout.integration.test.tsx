/**
 * FILE: tests/integration/ProtectedLayout.integration.test.tsx
 * PURPOSE: Integration tests for route protection based on subscription status
 * SCOPE: Business logic testing - user access capabilities, not UI rendering
 * BDD SCENARIOS: Implements scenarios from bdd-subscription-flow.md
 * DEPENDENCIES: SubscriptionContext, AsyncStorage, RevenueCat integration
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCustomerInfo } from "@/config/revenuecat";

// Test the actual ProtectedLayout component
import ProtectedLayout from "@/app/(app)/(protected)/_layout";
import {
	SubscriptionProvider,
	useSubscription,
} from "@/context/SubscriptionContext";
import { RepositoryProvider } from "@/context/RepositoryContext";

// Mock external dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
	getItem: jest.fn(),
	setItem: jest.fn().mockResolvedValue(undefined),
	removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/config/revenuecat", () => ({
	getCustomerInfo: jest.fn(),
	configureRevenueCat: jest.fn().mockResolvedValue(undefined),
}));

// Mock the OnboardingComponent to avoid complex rendering
jest.mock("@/components/ui/onboarding/OnboardingComponent", () => {
	const { View, TouchableOpacity, Text } = require("react-native");
	return function MockOnboardingComponent({ onDone }: { onDone: () => void }) {
		return (
			<View testID="onboarding-component">
				<TouchableOpacity testID="onboarding-done" onPress={onDone}>
					<Text>Complete Onboarding</Text>
				</TouchableOpacity>
			</View>
		);
	};
});

// Mock expo-router
jest.mock("expo-router", () => {
	const { View, Text } = require("react-native");

	const MockTabsScreen = ({
		name,
		options,
	}: {
		name: string;
		options: any;
	}) => (
		<View testID={`tab-screen-${name}`}>
			<Text>{options.title}</Text>
		</View>
	);

	const MockTabs = ({ children }: { children: React.ReactNode }) => (
		<View testID="main-app-tabs">{children}</View>
	);

	MockTabs.Screen = MockTabsScreen;

	return {
		Tabs: MockTabs,
	};
});

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockGetCustomerInfo = getCustomerInfo as jest.MockedFunction<
	typeof getCustomerInfo
>;

// Test wrapper with all required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<RepositoryProvider>
		<SubscriptionProvider>{children}</SubscriptionProvider>
	</RepositoryProvider>
);

// Simple test component to access subscription state (for context-only tests)
const AccessTestComponent: React.FC<{ onResult: (result: any) => void }> = ({
	onResult,
}) => {
	const subscription = useSubscription();

	React.useEffect(() => {
		onResult({
			hasAccess: subscription.hasAccess,
			isLoading: subscription.isLoading,
			subscriptionStatus: subscription.subscriptionStatus,
		});
	}, [subscription, onResult]);

	return null; // We don't care about rendering
};

describe("Route Protection Integration", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		// Default to clean state
		mockAsyncStorage.getItem.mockResolvedValue(null);
		mockGetCustomerInfo.mockResolvedValue({
			activeSubscriptions: [],
			entitlements: { active: {} },
		} as any);
	});

	describe("Context Business Logic Integration", () => {
		let accessResult: any = null;

		const captureAccessResult = (result: any) => {
			accessResult = result;
		};

		beforeEach(() => {
			accessResult = null;
		});

		// Helper to wait for subscription initialization
		const waitForSubscriptionResult = async () => {
			await waitFor(() => {
				expect(accessResult).not.toBeNull();
			});
			return accessResult;
		};

		describe("SCENARIO 1: New User Without Subscription", () => {
			it("should deny access to users without subscription", async () => {
				// Given: New user with no subscription data
				mockAsyncStorage.getItem.mockResolvedValue(null);
				mockGetCustomerInfo.mockResolvedValue({
					activeSubscriptions: [],
					entitlements: { active: {} },
				} as any);

				// When: User attempts to access protected features
				render(
					<SubscriptionProvider>
						<AccessTestComponent onResult={captureAccessResult} />
					</SubscriptionProvider>,
				);

				// Then: User should be denied access
				const result = await waitForSubscriptionResult();
				expect(result?.hasAccess).toBe(false);
			});
		});

		describe("SCENARIO 2: User With Active Subscription", () => {
			it("should grant access to users with active subscription", async () => {
				// Given: User with active subscription
				mockAsyncStorage.getItem.mockImplementation((key) => {
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
					entitlements: { active: { premium: { isActive: true } } },
				} as any);

				// When: User attempts to access protected features
				render(
					<SubscriptionProvider>
						<AccessTestComponent onResult={captureAccessResult} />
					</SubscriptionProvider>,
				);

				// Then: User should be granted access
				const result = await waitForSubscriptionResult();
				expect(result?.hasAccess).toBe(true);
			});
		});

		describe("SCENARIO 3: User With Expired Cache", () => {
			it("should deny access when cached subscription is expired and no active subscription", async () => {
				// Given: User with expired cache and no active subscription
				const now = Date.now();
				mockAsyncStorage.getItem.mockImplementation((key) => {
					if (key === "subscription_status") {
						return Promise.resolve(
							JSON.stringify({
								isActive: true,
								lastVerified: now - 25 * 60 * 60 * 1000, // 25 hours ago
								cacheExpiry: now - 1 * 60 * 60 * 1000, // 1 hour ago (expired)
							}),
						);
					}
					return Promise.resolve(null);
				});

				mockGetCustomerInfo.mockResolvedValue({
					activeSubscriptions: [],
					entitlements: { active: {} },
				} as any);

				// When: User attempts to access protected features
				render(
					<SubscriptionProvider>
						<AccessTestComponent onResult={captureAccessResult} />
					</SubscriptionProvider>,
				);

				// Then: User should be denied access
				const result = await waitForSubscriptionResult();
				expect(result?.hasAccess).toBe(false);
			});
		});

		describe("SCENARIO 4: Valid Cache Access", () => {
			it("should grant access based on valid cached subscription", async () => {
				// Given: User with valid cached subscription
				const now = Date.now();
				mockAsyncStorage.getItem.mockImplementation((key) => {
					if (key === "subscription_status") {
						return Promise.resolve(
							JSON.stringify({
								isActive: true,
								lastVerified: now - 12 * 60 * 60 * 1000, // 12 hours ago
								cacheExpiry: now + 12 * 60 * 60 * 1000, // 12 hours from now
							}),
						);
					}
					return Promise.resolve(null);
				});

				// When: User attempts to access protected features
				render(
					<SubscriptionProvider>
						<AccessTestComponent onResult={captureAccessResult} />
					</SubscriptionProvider>,
				);

				// Then: User should be granted access based on cache
				const result = await waitForSubscriptionResult();
				expect(result?.hasAccess).toBe(true);
			});
		});

		describe("SCENARIO 5: Offline Access", () => {
			it("should grant access using cached status when RevenueCat is unavailable", async () => {
				// Given: User with valid cache but RevenueCat unavailable
				const now = Date.now();
				mockAsyncStorage.getItem.mockImplementation((key) => {
					if (key === "subscription_status") {
						return Promise.resolve(
							JSON.stringify({
								isActive: true,
								lastVerified: now - 12 * 60 * 60 * 1000,
								cacheExpiry: now + 12 * 60 * 60 * 1000,
							}),
						);
					}
					return Promise.resolve(null);
				});

				mockGetCustomerInfo.mockRejectedValue(new Error("Network unavailable"));

				// When: User attempts to access protected features offline
				render(
					<SubscriptionProvider>
						<AccessTestComponent onResult={captureAccessResult} />
					</SubscriptionProvider>,
				);

				// Then: User should be granted access based on cached status
				const result = await waitForSubscriptionResult();
				expect(result?.hasAccess).toBe(true);
			});
		});

		describe("SCENARIO 6: Cache Corruption Handling", () => {
			it("should deny access when cache is corrupted and no active subscription", async () => {
				// Given: User with corrupted cache
				mockAsyncStorage.getItem.mockImplementation((key) => {
					if (key === "subscription_status") {
						return Promise.resolve("invalid-json-data");
					}
					return Promise.resolve(null);
				});

				mockGetCustomerInfo.mockResolvedValue({
					activeSubscriptions: [],
					entitlements: { active: {} },
				} as any);

				// When: User attempts to access protected features
				render(
					<SubscriptionProvider>
						<AccessTestComponent onResult={captureAccessResult} />
					</SubscriptionProvider>,
				);

				// Then: User should be denied access
				const result = await waitForSubscriptionResult();
				expect(result?.hasAccess).toBe(false);
			});
		});
	});

	describe("ProtectedLayout Component Integration", () => {
		describe("SCENARIO 7: ProtectedLayout Route Protection", () => {
			it("should show onboarding when user has no subscription", async () => {
				// Given: User with no subscription and no onboarding completion
				mockAsyncStorage.getItem.mockImplementation((key) => {
					if (key === "@SobrietyApp:onboardingCompleted") {
						return Promise.resolve(null); // No onboarding completion
					}
					if (key === "subscription_status") {
						return Promise.resolve(null); // No subscription cache
					}
					return Promise.resolve(null);
				});

				mockGetCustomerInfo.mockResolvedValue({
					activeSubscriptions: [],
					entitlements: { active: {} },
				} as any);

				// When: ProtectedLayout renders
				render(
					<TestWrapper>
						<ProtectedLayout />
					</TestWrapper>,
				);

				// Then: Should show onboarding component (not main app)
				await waitFor(() => {
					expect(screen.queryByTestId("onboarding-component")).toBeTruthy();
					expect(screen.queryByTestId("main-app-tabs")).toBeNull();
				});
			});

			it("should show onboarding when user completed onboarding but has no subscription", async () => {
				// Given: User completed onboarding but has no active subscription
				mockAsyncStorage.getItem.mockImplementation((key) => {
					if (key === "@SobrietyApp:onboardingCompleted") {
						return Promise.resolve("true"); // Onboarding completed
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

				// When: ProtectedLayout renders
				render(
					<TestWrapper>
						<ProtectedLayout />
					</TestWrapper>,
				);

				// Then: Should show onboarding (for subscription) even though onboarding was completed
				await waitFor(() => {
					expect(screen.queryByTestId("onboarding-component")).toBeTruthy();
					expect(screen.queryByTestId("main-app-tabs")).toBeNull();
				});
			});

			it("should show main app when user has active subscription", async () => {
				// Given: User with active subscription and completed onboarding
				mockAsyncStorage.getItem.mockImplementation((key) => {
					if (key === "@SobrietyApp:onboardingCompleted") {
						return Promise.resolve("true"); // Onboarding completed
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
					entitlements: { active: { premium: { isActive: true } } },
				} as any);

				// When: ProtectedLayout renders
				render(
					<TestWrapper>
						<ProtectedLayout />
					</TestWrapper>,
				);

				// Then: Should show main app tabs (not onboarding)
				await waitFor(() => {
					expect(screen.queryByTestId("main-app-tabs")).toBeTruthy();
					expect(screen.queryByTestId("onboarding-component")).toBeNull();
				});
			});

			it("should show main app when user has valid cached subscription", async () => {
				// Given: User with valid cached subscription
				const now = Date.now();
				mockAsyncStorage.getItem.mockImplementation((key) => {
					if (key === "@SobrietyApp:onboardingCompleted") {
						return Promise.resolve("true"); // Onboarding completed
					}
					if (key === "subscription_status") {
						return Promise.resolve(
							JSON.stringify({
								isActive: true,
								lastVerified: now - 12 * 60 * 60 * 1000, // 12 hours ago
								cacheExpiry: now + 12 * 60 * 60 * 1000, // 12 hours from now
							}),
						);
					}
					return Promise.resolve(null);
				});

				// Network request not needed due to valid cache
				mockGetCustomerInfo.mockResolvedValue({
					activeSubscriptions: ["premium"],
					entitlements: { active: { premium: { isActive: true } } },
				} as any);

				// When: ProtectedLayout renders
				render(
					<TestWrapper>
						<ProtectedLayout />
					</TestWrapper>,
				);

				// Then: Should show main app based on cached subscription
				await waitFor(() => {
					expect(screen.queryByTestId("main-app-tabs")).toBeTruthy();
					expect(screen.queryByTestId("onboarding-component")).toBeNull();
				});
			});
		});
	});
});
