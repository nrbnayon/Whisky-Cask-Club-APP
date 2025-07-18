import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gift } from "lucide-react-native";

export default function OffersScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 px-6 py-8">
        <Text className="text-primary-dark text-2xl font-bold mb-8 font-manrope">
          Offers
        </Text>
        
        <View className="flex-1 items-center justify-center">
          <Gift size={64} color="#B8860B" />
          <Text className="text-gray-600 text-lg font-medium mt-4 font-manrope">
            No offers available
          </Text>
          <Text className="text-gray-500 text-center mt-2 font-manrope">
            Check back later for exclusive whisky cask offers
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}