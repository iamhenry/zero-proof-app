/**
 * FILE: __tests__/settingsSubscriptionProfile/avatar-first-letter.test.tsx
 * PURPOSE: Failing tests for Scenario 1 – Extract and Display First Letter from User Email
 * This suite renders the (future) Avatar component and asserts that it shows the
 * first letter of the authenticated user’s e-mail address in uppercase.
 *
 * EXPECTED RESULT (Green phase): All tests pass once Avatar correctly derives
 * the letter and handles missing e-mail cases.
 */

import React from "react";
import { render, screen } from "@testing-library/react-native";

import Avatar from "@/components/ui/settings/subscriptionProfile/Avatar";
import { withSupabaseProvider } from "./testUtils";

// MARK: – Scenario 1: Extract first letter from user e-mail

describe("Settings Subscription Profile – Avatar", () => {
  it("displays the uppercase first letter of the user email", () => {
    const Wrapper = withSupabaseProvider("henry@example.com");

    render(<Avatar />, { wrapper: Wrapper });

    // The Avatar should render the letter "H" when the e-mail is henry@example.com
    expect(screen.getByText("H")).toBeTruthy();
  });

  it("shows a fallback placeholder when no e-mail is available", () => {
    const Wrapper = withSupabaseProvider(null);

    render(<Avatar />, { wrapper: Wrapper });

    // We expect a test-id placeholder so the UI can still render gracefully.
    expect(screen.getByTestId("avatar-placeholder")).toBeTruthy();
  });
});
