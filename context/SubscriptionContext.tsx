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
 *   - Tracks active/inactive subscription status, including trial periods
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
import { CustomerInfo, PurchasesEntitlementInfo } from "react-native-purchases";

// Types and Interfaces
export interface SubscriptionStatus {
	isActive: boolean;
	isTrial: boolean; // Added to explicitly track trial status
	lastVerified: number | null;
	cacheExpiry: number | null;
}

export interface SubscriptionContextProps {
	isSubscriptionActive: boolean;
	isTrialActive: boolean; // Added for more clarity on trial state
	isLoading: boolean;
	lastVerified: number | null;
	hasAccess: boolean;
	subscriptionStatus: "active" | "trial" | "inactive" | "unknown"; // Added "trial" state
	checkSubscriptionStatus: () => Promise<boolean>;
	handlePurchaseEvent: (customerInfo: CustomerInfo) => void;
	getCachedSubscriptionStatus: () => Omit<SubscriptionStatus, 'lastVerified' | 'cacheExpiry'> | null;
	refreshSubscriptionStatus: () => Promise<void>;
}

export interface SubscriptionProviderProps {
	children: ReactNode;
}

// Context creation
const SubscriptionContext = createContext<SubscriptionContextProps | null>(
	null,
);

// Helper to determine if any active entitlement is a trial
const checkIsTrial = (entitlements: { [key: string]: PurchasesEntitlementInfo }): boolean => {
	return Object.values(entitlements).some(
		(ent) => ent.isActive && ent.periodType === "TRIAL",
	);
};


// Provider component
export const SubscriptionProvider = ({
	children,
}: SubscriptionProviderProps) => {
	const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
	const [isTrialActive, setIsTrialActive] = useState(false);
	const [isLoading, setIsLoading] = useState(true); // Start with loading true
	const [lastVerified, setLastVerified] = useState<number | null>(null);
	const [cachedStatus, setCachedStatus] = useState<SubscriptionStatus | null>(
		null,
	);

	// Computed properties
	const hasAccess = isSubscriptionActive || isTrialActive; // Access if active OR in trial

	const subscriptionStatus: SubscriptionContextProps["subscriptionStatus"] = isLoading
		? "unknown"
		: isTrialActive
			? "trial"
			: isSubscriptionActive
				? "active"
				: "inactive";

	const updateStateAndCache = async (customerInfo: CustomerInfo) => {
		const activeEntitlements = customerInfo.entitlements.active;
		// Check if there's any active entitlement (premium in this case)
		const premiumEntitlement = activeEntitlements.premium; // Use your specific entitlement ID
		const isActiveOverall = !!premiumEntitlement && premiumEntitlement.isActive;
		const trial = isActiveOverall && premiumEntitlement.periodType === "TRIAL";
		console.log("[SubscriptionContext:updateStateAndCache] customerInfo entitlements active:", JSON.stringify(customerInfo.entitlements.active, null, 2));
		console.log("[SubscriptionContext:updateStateAndCache] premiumEntitlement:", JSON.stringify(premiumEntitlement, null, 2));
		console.log("[SubscriptionContext:updateStateAndCache] isActiveOverall:", isActiveOverall, "isTrial:", trial);

		const now = Date.now();
		// If overall active, then determine if it's trial or regular active
		setIsSubscriptionActive(isActiveOverall && !trial);
		setIsTrialActive(isActiveOverall && trial);
		setLastVerified(now);

		const cacheData: SubscriptionStatus = {
			isActive: isActiveOverall && !trial, // This is true if it's a paid, active sub
			isTrial: trial, // This is true if it's an active trial
			lastVerified: now,
			cacheExpiry: now + 24 * 60 * 60 * 1000, // 24 hours
		};

		setCachedStatus(cacheData);
		await AsyncStorage.setItem(
			"subscription_status",
			JSON.stringify(cacheData),
		);
		// Return true if user has access (either active paid or active trial)
		return isActiveOverall;
	}

	const checkSubscriptionStatus = async (): Promise<boolean> => {
		setIsLoading(true);
		try {
			const customerInfo = await getCustomerInfo();
			return await updateStateAndCache(customerInfo);
		} catch (error) {
			console.error("SubscriptionContext: Error checking subscription status:", error);
			// In case of error, assume no active subscription/trial
			setIsSubscriptionActive(false);
			setIsTrialActive(false);
			setLastVerified(Date.now());
			// Optionally clear or set cache to inactive state here
			// For now, we ensure hasAccess becomes false
			await AsyncStorage.setItem(
				"subscription_status",
				JSON.stringify({ isActive: false, isTrial: false, lastVerified: Date.now(), cacheExpiry: Date.now() + 24 * 60 * 60 * 1000 }),
			);
			return false; // Return false indicating no access
		} finally {
			setIsLoading(false);
		}
	};

	const handlePurchaseEvent = async (customerInfo: CustomerInfo): Promise<void> => {
		// No need to set loading true here as it's an event handler
		await updateStateAndCache(customerInfo);
	};

	const getCachedSubscriptionStatus = (): Omit<SubscriptionStatus, 'lastVerified' | 'cacheExpiry'> | null => {
		if (cachedStatus) {
			const now = Date.now();
			if (cachedStatus.cacheExpiry && now < cachedStatus.cacheExpiry) {
				// Return both isActive and isTrial from cache
				return { isActive: cachedStatus.isActive, isTrial: cachedStatus.isTrial };
			}
		}
		return null;
	};

	const refreshSubscriptionStatus = async (): Promise<void> => {
		setIsLoading(true);
		try {
			const customerInfo = await getCustomerInfo();
			await updateStateAndCache(customerInfo);
		} catch (error) {
			console.error("SubscriptionContext: Error refreshing subscription status:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const loadCachedStatus = async () => {
			setIsLoading(true);
			try {
				const cachedDataString = await AsyncStorage.getItem("subscription_status");
				if (cachedDataString) {
					const parsed: SubscriptionStatus = JSON.parse(cachedDataString);
					const now = Date.now();

					setCachedStatus(parsed);

					if (parsed.cacheExpiry && now < parsed.cacheExpiry) {
						setIsSubscriptionActive(parsed.isActive);
						setIsTrialActive(parsed.isTrial);
						setLastVerified(parsed.lastVerified);
						setIsLoading(false); // Stop loading if valid cache found
					} else {
						// Cache expired, fetch fresh status
						await checkSubscriptionStatus();
					}
				} else {
					// No cache, fetch fresh status
					await checkSubscriptionStatus();
				}
			} catch (error) {
				console.error("SubscriptionContext: Error loading cached status:", error);
				await checkSubscriptionStatus().catch(e => console.error("SubscriptionContext: Initial status check failed:", e));
			} finally {
				// Ensure loading is set to false only after all async operations in this effect are done
				// For simplicity, checkSubscriptionStatus itself handles setting isLoading to false.
				// If cache is valid and used, we set it false above.
			}
		};

		loadCachedStatus();
	}, []);

	return (
		<SubscriptionContext.Provider
			value={{
				isSubscriptionActive,
				isTrialActive,
				isLoading,
				lastVerified,
				hasAccess,
				subscriptionStatus,
				checkSubscriptionStatus,
				handlePurchaseEvent,
				getCachedSubscriptionStatus,
				refreshSubscriptionStatus,
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
