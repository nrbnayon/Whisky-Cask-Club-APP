import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users } from "lucide-react-native";

export default function ReferralScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 p-4">
        <Text className="text-primary-dark text-2xl font-bold mb-8 font-manrope">
          Referral
        </Text>
        
        <View className="flex-1 items-center justify-center">
          <Users size={64} color="#B8860B" />
          <Text className="text-gray-600 text-lg font-medium mt-4 font-manrope">
            Referral Program
          </Text>
          <Text className="text-gray-500 text-center mt-2 font-manrope">
            Invite friends and earn rewards for each successful referral
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}