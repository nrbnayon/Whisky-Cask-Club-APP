import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@/store/useAppStore";
import { getCardShadow } from "@/utils/shadows";

export default function ProfileScreen() {
  const { user } = useAppStore();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 p-4">
        <Text className="text-primary-dark text-2xl font-bold mb-8 font-manrope">
          Profile
        </Text>
        
        <View 
          className="bg-white rounded-xl p-6 mb-6" 
          style={getCardShadow('md')}
        >
          <Text className="text-gray-600 text-sm mb-2 font-manrope">Name</Text>
          <Text className="text-primary-dark text-lg font-medium mb-4 font-manrope">
            {user?.name}
          </Text>
          
          <Text className="text-gray-600 text-sm mb-2 font-manrope">Email</Text>
          <Text className="text-primary-dark text-lg font-medium font-manrope">
            {user?.email}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}