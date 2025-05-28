import { useEffect, useState } from "react";
import { getCustomerInfo } from "@/config/revenuecat";

/**
 * React hook that returns the current subscription state.
 *
 * isLoading – while we’re asking RevenueCat
 * isError   – non-recoverable error while fetching
 * isPro     – user has the “pro” entitlement
 */
export function useSubscriptionStatus() {
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [isPro, setIsPro] = useState(false);

	useEffect(() => {
		let cancelled = false;

		getCustomerInfo()
			.then((info) => {
				if (cancelled) return;
				const proEntitlement =
					info?.entitlements?.active?.pro ?? null;
				setIsPro(Boolean(proEntitlement));
			})
			.catch(() => {
				if (cancelled) return;
				setIsError(true);
				setIsPro(false);
			})
			.finally(() => {
				if (cancelled) return;
				setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	return { isLoading, isError, isPro };
}
