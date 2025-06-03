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

	// Computed properties for integration tests
	const hasAccess = isSubscriptionActive;
	const subscriptionStatus: "active" | "inactive" | "unknown" = isLoading
		? "unknown"
		: isSubscriptionActive
			? "active"
			: "inactive";

	const checkSubscriptionStatus = async (): Promise<boolean> => {
		setIsLoading(true);
		try {
			const customerInfo = await getCustomerInfo();
			const isActive =
				customerInfo.activeSubscriptions.length > 0 ||
				Object.keys(customerInfo.entitlements.active).length > 0;

			const now = Date.now();
			setIsSubscriptionActive(isActive);
			setLastVerified(now);

			// Cache the status
			const cacheData: SubscriptionStatus = {
				isActive,
				lastVerified: now,
				cacheExpiry: now + 24 * 60 * 60 * 1000, // 24 hours
			};

			setCachedStatus(cacheData);
			await AsyncStorage.setItem(
				"subscription_status",
				JSON.stringify(cacheData),
			);

			return isActive;
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

		const now = Date.now();
		setIsSubscriptionActive(isActive);
		setLastVerified(now);

		// Cache the status
		const cacheData: SubscriptionStatus = {
			isActive,
			lastVerified: now,
			cacheExpiry: now + 24 * 60 * 60 * 1000, // 24 hours
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

			const now = Date.now();
			setIsSubscriptionActive(isActive);
			setLastVerified(now);

			// Cache the status
			const cacheData: SubscriptionStatus = {
				isActive,
				lastVerified: now,
				cacheExpiry: now + 24 * 60 * 60 * 1000, // 24 hours
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
