import React from "react";
import { View, Text, ActivityIndicator, Button, Linking } from "react-native";
import { useSupabase } from "@/lib/services/useSupabase";
import { useSubscriptionStatus } from "@/lib/services/useSubscriptionStatus";

const ProfileSection: React.FC = () => {
  const { session } = useSupabase();
  const email = session?.user?.email ?? "";
  const initial = email ? email.charAt(0).toUpperCase() : "";
  const { isPro, isLoading, isError } = useSubscriptionStatus();

  return (
    <View testID="profile-section">
      {email ? (
        <View testID="avatar">
          <Text>{initial}</Text>
        </View>
      ) : (
        <View testID="avatar-fallback" />
      )}
      {isPro && !isLoading && !isError && <Text>PRO</Text>}
      <Text>{email}</Text>
      {isLoading ? (
        <ActivityIndicator testID="subscription-loading" />
      ) : (
        <Button
          title="Manage Subscription"
          onPress={() =>
            Linking.openURL("itms-services://?action=purchaseManage")
          }
        />
      )}
    </View>
  );
};

export default ProfileSection;
