/**
 * FILE: context/SubscriptionContext.tsx
 * PURPOSE: Centralized subscription state management for tracking active subscription status across the app
 * FUNCTIONS:
 *   - SubscriptionProvider({ children: ReactNode }): JSX.Element -> Context provider managing subscription state
 *   - useSubscription(): SubscriptionContextProps -> Hook to consume subscription context
 *   - checkSubscriptionStatus(): Promise<boolean> -> Verify current subscription status with RevenueCat
 *   - handlePurchaseEvent(customerInfo: any): void -> Process purchase completion events from paywall
 *   - getCachedSubscriptionStatus(): boolean | null -> Get locally cached subscription status
 * KEY FEATURES:
 *   - Centralized subscription state accessible throughout app
 *   - Tracks active/inactive subscription status
 *   - Listens for purchase events from paywall
 *   - Persists subscription state locally with 24-hour cache
 *   - Background sync with RevenueCat for status updates
 * DEPENDENCIES: react, AsyncStorage for persistence, react-native-purchases
 */

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCustomerInfo } from "@/config/revenuecat";

// Types and Interfaces
export interface SubscriptionStatus {
	isActive: boolean;
	lastVerified: number | null;
	cacheExpiry: number | null;
	// Enhanced trial support properties
	isTrialActive?: boolean;
	trialExpirationDate?: number | null;
	isTrialConverted?: boolean;
	isTrialCancelled?: boolean;
	isTrialExpired?: boolean;
}

export interface SubscriptionContextProps {
	isSubscriptionActive: boolean;
	isLoading: boolean;
	lastVerified: number | null;
	hasAccess: boolean;
	subscriptionStatus: "active" | "inactive" | "unknown";
	checkSubscriptionStatus: () => Promise<boolean>;
	handlePurchaseEvent: (customerInfo: any) => void;
	getCachedSubscriptionStatus: () => boolean | null;
	refreshSubscriptionStatus: () => Promise<void>;
	// Trial-related properties for BDD scenarios
	isTrialActive?: boolean;
	trialExpirationDate?: Date | null;
	isTrialConverted?: boolean;
	isTrialCancelled?: boolean;
	isTrialExpired?: boolean;
	trialDaysRemaining?: number | null;
	shouldShowPaywall?: boolean;
}

export interface SubscriptionProviderProps {
	children: ReactNode;
}

// Context creation
const SubscriptionContext = createContext<SubscriptionContextProps | null>(
	null,
);

// Provider component
export const SubscriptionProvider = ({
	children,
}: SubscriptionProviderProps) => {
	const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [lastVerified, setLastVerified] = useState<number | null>(null);
	const [cachedStatus, setCachedStatus] = useState<SubscriptionStatus | null>(
		null,
	);

	// Trial-related state
	const [trialState, setTrialState] = useState({
		isTrialActive: false,
		trialExpirationDate: null as Date | null,
		isTrialConverted: false,
		isTrialCancelled: false,
		isTrialExpired: false,
		trialDaysRemaining: null as number | null,
	});

	// Helper function to analyze trial status from CustomerInfo
	const analyzeTrialStatus = (customerInfo: any) => {
		// Check if user has trial offer active
		const hasTrialProduct =
			customerInfo.activeSubscriptions?.includes(
				"zeroproof.hmoran.com.Weekly",
			) || false;

		// Check if user ever purchased the trial (for expired trial detection)
		const hasPurchasedTrial =
			customerInfo.allPurchasedProductIdentifiers?.includes(
				"zeroproof.hmoran.com.Weekly",
			) || false;

		const activeEntitlements = customerInfo.entitlements?.active || {};
		const allEntitlements = customerInfo.entitlements?.all || {};
		const premiumEntitlement =
			activeEntitlements.premium || allEntitlements.premium;

		// Get trial conversion status
		const isTrialConverted = customerInfo.isTrialConversion || false;

		// Get expiration date (could be from premium entitlement or latestExpirationDate)
		const trialExpirationDateString =
			premiumEntitlement?.expirationDate ||
			customerInfo.latestExpirationDate ||
			null;

		// Convert to Date object if we have a string
		const trialExpirationDate = trialExpirationDateString
			? new Date(trialExpirationDateString)
			: null;

		// Check if trial is currently active
		// Trial is active if: has trial product AND premium is active AND not yet converted
		const isTrialActive =
			hasTrialProduct && premiumEntitlement?.isActive && !isTrialConverted;

		// Check if trial is cancelled (has expiration but won't renew)
		const isTrialCancelled =
			premiumEntitlement && !premiumEntitlement.willRenew && isTrialActive;

		// Check if trial is expired
		const now = new Date();
		let isTrialExpired = false;

		// Enhanced logic for expired trial detection
		if (!isTrialActive && !isTrialConverted) {
			// Check for expired trial in two ways:

			// Method 1: User has purchase history but trial not active
			if (hasPurchasedTrial) {
				if (trialExpirationDate) {
					// If we have expiration date, check if it's in the past
					const expiryDate = new Date(trialExpirationDate);
					isTrialExpired = expiryDate < now;
				} else {
					// Even without expiration date, if user purchased trial but has no active subscription
					// and no conversion, it's likely an expired trial
					isTrialExpired = true;
				}
			}
			// Method 2: RevenueCat provides expiration date even without purchase history
			else if (trialExpirationDate) {
				const expiryDate = new Date(trialExpirationDate);
				// Trial is expired if expiration date is in the past
				isTrialExpired = expiryDate < now;
			}
		}

		// Calculate days remaining for active trials
		let trialDaysRemaining = null;
		if (isTrialActive && trialExpirationDate) {
			const expiryDate = new Date(trialExpirationDate);
			const diffTime = expiryDate.getTime() - now.getTime();
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			trialDaysRemaining = diffDays > 0 ? diffDays : 0;
		}

		return {
			isTrialActive: !!isTrialActive,
			trialExpirationDate,
			isTrialConverted: !!isTrialConverted,
			isTrialCancelled: !!isTrialCancelled,
			isTrialExpired: !!isTrialExpired,
			trialDaysRemaining,
		};
	};

	// Computed properties for integration tests
	const hasAccess = isSubscriptionActive || trialState.isTrialActive;
	const subscriptionStatus: "active" | "inactive" | "unknown" = isLoading
		? "unknown"
		: isSubscriptionActive || trialState.isTrialActive
			? "active"
			: "inactive";

	// Enhanced paywall logic
	const shouldShowPaywall = !isSubscriptionActive && !trialState.isTrialActive;

	const checkSubscriptionStatus = async (): Promise<boolean> => {
		setIsLoading(true);
		try {
			const customerInfo = await getCustomerInfo();
			const isActive =
				customerInfo.activeSubscriptions.length > 0 ||
				Object.keys(customerInfo.entitlements.active).length > 0;

			// Analyze trial status
			const trialAnalysis = analyzeTrialStatus(customerInfo);

			const now = Date.now();
			setIsSubscriptionActive(isActive);
			setTrialState(trialAnalysis);
			setLastVerified(now);

			// Cache the status with trial information
			const cacheData: SubscriptionStatus = {
				isActive,
				lastVerified: now,
				cacheExpiry: now + 24 * 60 * 60 * 1000, // 24 hours
				isTrialActive: trialAnalysis.isTrialActive,
				trialExpirationDate:
					trialAnalysis.trialExpirationDate?.getTime() || null,
				isTrialConverted: trialAnalysis.isTrialConverted,
				isTrialCancelled: trialAnalysis.isTrialCancelled,
				isTrialExpired: trialAnalysis.isTrialExpired,
			};

			setCachedStatus(cacheData);
			await AsyncStorage.setItem(
				"subscription_status",
				JSON.stringify(cacheData),
			);

			return isActive || trialAnalysis.isTrialActive;
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const handlePurchaseEvent = (customerInfo: any): void => {
		const isActive =
			customerInfo.activeSubscriptions.length > 0 ||
			Object.keys(customerInfo.entitlements.active).length > 0;

		// Analyze trial status from purchase event
		const trialAnalysis = analyzeTrialStatus(customerInfo);

		const now = Date.now();
		setIsSubscriptionActive(isActive);
		setTrialState(trialAnalysis);
		setLastVerified(now);

		// Cache the status with trial information
		const cacheData: SubscriptionStatus = {
			isActive,
			lastVerified: now,
			cacheExpiry: now + 24 * 60 * 60 * 1000, // 24 hours
			isTrialActive: trialAnalysis.isTrialActive,
			trialExpirationDate: trialAnalysis.trialExpirationDate?.getTime() || null,
			isTrialConverted: trialAnalysis.isTrialConverted,
			isTrialCancelled: trialAnalysis.isTrialCancelled,
			isTrialExpired: trialAnalysis.isTrialExpired,
		};

		setCachedStatus(cacheData);
		AsyncStorage.setItem("subscription_status", JSON.stringify(cacheData));
	};

	const getCachedSubscriptionStatus = (): boolean | null => {
		// Use in-memory cached state first
		if (cachedStatus) {
			const now = Date.now();
			// Check if cache is still valid
			if (cachedStatus.cacheExpiry && now < cachedStatus.cacheExpiry) {
				return cachedStatus.isActive;
			}
		}

		return null; // Cache expired or not available
	};

	const refreshSubscriptionStatus = async (): Promise<void> => {
		try {
			const customerInfo = await getCustomerInfo();
			const isActive =
				customerInfo.activeSubscriptions.length > 0 ||
				Object.keys(customerInfo.entitlements.active).length > 0;

			// Analyze trial status
			const trialAnalysis = analyzeTrialStatus(customerInfo);

			const now = Date.now();
			setIsSubscriptionActive(isActive);
			setTrialState(trialAnalysis);
			setLastVerified(now);

			// Cache the status with trial information
			const cacheData: SubscriptionStatus = {
				isActive,
				lastVerified: now,
				cacheExpiry: now + 24 * 60 * 60 * 1000, // 24 hours
				isTrialActive: trialAnalysis.isTrialActive,
				trialExpirationDate:
					trialAnalysis.trialExpirationDate?.getTime() || null,
				isTrialConverted: trialAnalysis.isTrialConverted,
				isTrialCancelled: trialAnalysis.isTrialCancelled,
				isTrialExpired: trialAnalysis.isTrialExpired,
			};

			setCachedStatus(cacheData);
			await AsyncStorage.setItem(
				"subscription_status",
				JSON.stringify(cacheData),
			);
		} catch (error) {
			// Silently handle errors in background refresh
		}
	};

	// Load cached status on mount
	useEffect(() => {
		const loadCachedStatus = async () => {
			try {
				const cachedData = await AsyncStorage.getItem("subscription_status");
				if (cachedData) {
					const parsed: SubscriptionStatus = JSON.parse(cachedData);
					const now = Date.now();

					setCachedStatus(parsed);

					// Check if cache is still valid
					if (parsed.cacheExpiry && now < parsed.cacheExpiry) {
						setIsSubscriptionActive(parsed.isActive);
						setLastVerified(parsed.lastVerified);

						// Restore trial state from cache
						if (parsed.isTrialActive !== undefined) {
							setTrialState({
								isTrialActive: parsed.isTrialActive || false,
								trialExpirationDate: parsed.trialExpirationDate
									? new Date(parsed.trialExpirationDate)
									: null,
								isTrialConverted: parsed.isTrialConverted || false,
								isTrialCancelled: parsed.isTrialCancelled || false,
								isTrialExpired: parsed.isTrialExpired || false,
								trialDaysRemaining: parsed.trialExpirationDate
									? Math.ceil(
											(parsed.trialExpirationDate - now) /
												(1000 * 60 * 60 * 24),
										)
									: null,
							});
						}
					}
				}
			} catch (error) {
				// Ignore cache loading errors
			}
		};

		loadCachedStatus();
	}, []);

	return (
		<SubscriptionContext.Provider
			value={{
				isSubscriptionActive,
				isLoading,
				lastVerified,
				hasAccess,
				subscriptionStatus,
				checkSubscriptionStatus,
				handlePurchaseEvent,
				getCachedSubscriptionStatus,
				refreshSubscriptionStatus,
				// Trial-related properties
				isTrialActive: trialState.isTrialActive,
				trialExpirationDate: trialState.trialExpirationDate,
				isTrialConverted: trialState.isTrialConverted,
				isTrialCancelled: trialState.isTrialCancelled,
				isTrialExpired: trialState.isTrialExpired,
				trialDaysRemaining: trialState.trialDaysRemaining,
				shouldShowPaywall,
			}}
		>
			{children}
		</SubscriptionContext.Provider>
	);
};

// Hook for consuming context
export const useSubscription = () => {
	const context = useContext(SubscriptionContext);
	if (!context) {
		throw new Error(
			"useSubscription must be used within a SubscriptionProvider",
		);
	}
	return context;
};
