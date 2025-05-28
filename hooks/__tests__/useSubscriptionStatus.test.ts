/* MARK:
 * Scenario #3 – Hook returns “active” for subscribed user
 * Scenario #4 – Hook returns “inactive” for free user
 */
import { renderHook, act } from "@testing-library/react-hooks";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

jest.mock("nativewind", () => ({
	styled: (c: any) => c,
	useColorScheme: () => "light",
}));

describe("useSubscriptionStatus – BDD scenarios 3 & 4 (Red phase)", () => {
	test("test_SubscribedUser_StatusIsActive_LoadingFalse", () => {
		const { result } = renderHook(() => useSubscriptionStatus());
		expect(result.current.status).toBe("active"); // fails – returns unknown
		expect(result.current.loading).toBe(false);
	});

	test("test_SubscribedUser_ErrorIsNull", () => {
		const { result } = renderHook(() => useSubscriptionStatus());
		expect(result.current.error).toBeNull();
	});

	test("test_SubscribedUser_StatusUpdates_AfterRefresh", () => {
		const { result, rerender } = renderHook(() => useSubscriptionStatus());
		// Simulate refresh that would set status to active
		act(() => {
			rerender();
		});
		expect(result.current.status).toBe("active"); // fails
	});

	/* -------------------------------------------------------------- */
	test("test_FreeUser_StatusIsInactive_LoadingFalse", () => {
		const { result } = renderHook(() => useSubscriptionStatus());
		expect(result.current.status).toBe("inactive"); // fails – unknown
	});

	test("test_FreeUser_ErrorIsNull", () => {
		const { result } = renderHook(() => useSubscriptionStatus());
		expect(result.current.error).toBeNull();
	});

	test("test_FreeUser_StatusDoesNotChange_AfterRefresh", () => {
		const { result, rerender } = renderHook(() => useSubscriptionStatus());
		act(() => {
			rerender();
		});
		expect(result.current.status).toBe("inactive"); // fails
	});
});
