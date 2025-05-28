/* Placeholder implementation – Red phase
 * Replace with real logic during Green phase.
 */
export type SubscriptionStatus = "active" | "inactive" | "unknown";

export interface UseSubscriptionStatusResult {
	status: SubscriptionStatus;
	loading: boolean;
	error: Error | null;
}

/**
 * Always returns a fixed, non-useful value so tests that expect real
 * subscription state will fail (Red phase by design).
 */
export function useSubscriptionStatus(): UseSubscriptionStatusResult {
	return { status: "unknown", loading: false, error: null };
}

export default useSubscriptionStatus;
