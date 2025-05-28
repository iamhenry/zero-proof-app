import React from "react";
import {
	View,
	Text as RNText,
	ActivityIndicator,
	Linking,
} from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useSupabase } from "@/context/supabase-provider";
import { useSubscriptionStatus } from "@/lib/services/useSubscriptionStatus";

const MANAGE_SUBSCRIPTION_URL =
	"itms-services://?action=purchaseManage"; // iOS subscription deeplink

const Avatar: React.FC<{ email?: string }> = ({ email }) => {
	if (email) {
		const initial = email.charAt(0).toUpperCase();
		return (
			<View
				testID="avatar"
				className="h-12 w-12 items-center justify-center rounded-full bg-primary"
			>
				<RNText
					testID="avatar-initial"
					className="text-lg font-semibold text-white"
				>
					{initial}
				</RNText>
			</View>
		);
	}
	return (
		<View
			testID="avatar-fallback"
			className="h-12 w-12 rounded-full bg-muted"
		/>
	);
};

const ProBadge: React.FC = () => (
	<View
		testID="pro-badge"
		className="rounded-md bg-secondary px-2 py-0.5"
	>
		<Text className="text-xs font-semibold text-secondary-foreground">
			PRO
		</Text>
	</View>
);

export const ProfileSection: React.FC = () => {
	const { session } = useSupabase();
	const email = session?.user?.email ?? "";

	const { isLoading, isError, isPro } = useSubscriptionStatus();

	return (
		<View
			testID="profile-section"
			className="w-full items-center gap-y-3 pb-8"
		>
			<Avatar email={email} />

			{isPro && !isLoading && !isError && <ProBadge />}

			<Text className="text-base font-medium" testID="email">
				{email || "Anonymous"}
			</Text>

			{isLoading ? (
				<ActivityIndicator
					size="small"
					testID="subscription-loading"
				/>
			) : isError ? (
				<Text
					testID="subscription-error"
					className="text-xs text-destructive"
				>
					Unable to load subscription status.
				</Text>
			) : null}

			<Button
				testID="manage-subscription-button"
				disabled={isLoading}
				onPress={() => Linking.openURL(MANAGE_SUBSCRIPTION_URL)}
				variant="secondary"
				size="default"
				className="w-full"
			>
				<Text>Manage Subscription</Text>
			</Button>
		</View>
	);
};

export default ProfileSection;
