/* MARK:
 * Scenario #6 – openSubscriptionManagement deep-links to RevenueCat manage
 * Scenario #7 – Function gracefully returns false when Linking fails
 */
import { openSubscriptionManagement } from "@/lib/subscription/deepLinkSubscription";
import * as Linking from "react-native/Libraries/Linking/Linking";

// Common mocks (RevenueCat, Platform, etc.)
jest.mock("react-native/Libraries/Linking/Linking");
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
	OS: "ios",
	select: (spec: Record<string, unknown>) => spec.ios,
}));

describe("openSubscriptionManagement – BDD scenarios 6 & 7 (Red phase)", () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	test("test_ManageFlow_Success_ReturnsTrue", async () => {
		(Linking.openURL as jest.Mock).mockResolvedValueOnce(true);
		const result = await openSubscriptionManagement();
		expect(result).toBe(true); // fails – stub always false
	});

	test("test_ManageFlow_Success_OpensCorrectURL", async () => {
		(Linking.openURL as jest.Mock).mockResolvedValueOnce(true);
		await openSubscriptionManagement();
		// Expected deep-link URL based on RevenueCat docs
		expect(Linking.openURL).toHaveBeenCalledWith(
			"https://apps.apple.com/account/subscriptions"
		); // fails – stub never calls
	});

	test("test_ManageFlow_Success_OnlyCalledOnce", async () => {
		(Linking.openURL as jest.Mock).mockResolvedValueOnce(true);
		await openSubscriptionManagement();
		expect(Linking.openURL).toHaveBeenCalledTimes(1); // fails
	});

	test("test_ManageFlow_Failure_ReturnsFalse", async () => {
		(Linking.openURL as jest.Mock).mockRejectedValueOnce(
			new Error("Linking error")
		);
		const result = await openSubscriptionManagement();
		expect(result).toBe(false); // passes setup but future impl should succeed
		// NOTE: once Green phase fixes code, expected outcome will flip.
	});

	test("test_ManageFlow_Failure_ErrorIsHandled_NoThrow", async () => {
		(Linking.openURL as jest.Mock).mockRejectedValueOnce(
			new Error("Linking error")
		);
		await expect(openSubscriptionManagement()).resolves.not.toThrow(); // stub returns false so passes,
		// but later Green phase should still pass after real error handling.
	});
});
