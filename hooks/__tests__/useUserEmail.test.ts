/* MARK:
 * Scenario #5 – User email is fetched from Supabase profile
 */
import { renderHook } from "@testing-library/react-hooks";
import { useUserEmail } from "@/hooks/useUserEmail";

// Mock Supabase auth context (pattern from existing repo tests)
jest.mock("@/context/AuthContext", () => ({
	useAuth: () => ({
		session: { user: { email: "user@example.com" } },
	}),
}));

describe("useUserEmail – BDD scenario 5 (Red phase)", () => {
	test("test_EmailHook_ReturnsValidEmail_StringMatches", () => {
		const { result } = renderHook(() => useUserEmail());
		expect(result.current).toBe("user@example.com"); // fails – returns ""
	});

	test("test_EmailHook_ReturnValue_IsNotEmpty", () => {
		const { result } = renderHook(() => useUserEmail());
		expect(result.current.length).toBeGreaterThan(0); // fails
	});

	test("test_EmailHook_EmailContainsAtSymbol", () => {
		const { result } = renderHook(() => useUserEmail());
		expect(result.current.includes("@")).toBe(true); // fails
	});

	test("test_EmailHook_EmailLowercased", () => {
		const { result } = renderHook(() => useUserEmail());
		expect(result.current).toBe(result.current.toLowerCase()); // fails
	});
});
