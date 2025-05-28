/* MARK:
 * Scenario #1 – Subscriber sees premium badge on avatar
 * Scenario #2 – Free user sees upgrade prompt on avatar
 */
import React from "react";
import { render } from "@testing-library/react-native";
import { AvatarSubscriptionProfile } from "@/components/ui/AvatarSubscriptionProfile";

// Required common mocks (pattern copied from repo)
jest.mock("nativewind", () => ({
	styled: (c: any) => c,
	useColorScheme: () => "light",
}));

describe("AvatarSubscriptionProfile – BDD scenarios 1 & 2 (Red phase)", () => {
	/* ---------------------------------------------------------------- */
	test("test_Subscriber_PremiumBadgeDisplayed_ElementIsPresent", () => {
		const { queryByTestId } = render(<AvatarSubscriptionProfile />);
		// EXPECTING a premium badge that does not exist – should fail
		expect(queryByTestId("premium-badge")).not.toBeNull();
	});

	test("test_Subscriber_PremiumBadgeDisplayed_TextMatches", () => {
		const { queryByText } = render(<AvatarSubscriptionProfile />);
		// Should fail – component renders nothing.
		expect(queryByText(/Premium/i)).toBeTruthy();
	});

	test("test_Subscriber_AvatarRenders_AccessibilityLabelPresent", () => {
		const { queryByLabelText } = render(<AvatarSubscriptionProfile />);
		expect(queryByLabelText(/User avatar/i)).toBeTruthy();
	});

	/* ---------------------------------------------------------------- */
	test("test_FreeUser_UpgradePromptDisplayed_ElementIsPresent", () => {
		const { queryByTestId } = render(<AvatarSubscriptionProfile />);
		// Should fail – no upgrade prompt
		expect(queryByTestId("upgrade-avatar")).not.toBeNull();
	});

	test("test_FreeUser_UpgradePromptDisplayed_TextMatches", () => {
		const { queryByText } = render(<AvatarSubscriptionProfile />);
		expect(queryByText(/Upgrade/i)).toBeTruthy();
	});

	test("test_FreeUser_AvatarButton_PressEventNavigatesToPaywall", () => {
		const onPressMock = jest.fn();
		const { getByRole } = render(
			// Futuristic API – does not exist in stub
			// @ts-expect-error intentional for red-phase expectation
			<AvatarSubscriptionProfile onPress={onPressMock} />
		);
		getByRole("button").props.onPress();
		expect(onPressMock).toHaveBeenCalled(); // will never run – fail
	});
});
