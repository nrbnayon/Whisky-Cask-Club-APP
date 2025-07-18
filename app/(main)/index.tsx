// app\(main)\index.tsx
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Bell, TrendingUp, Package, DollarSign } from "lucide-react-native";
import { useAppStore } from "@/store/useAppStore";
import { StatCard } from "@/components/shared/StatCard";
import { CaskCard } from "@/components/shared/CaskCard";
import { ActivityItem } from "@/components/shared/ActivityItem";

export default function HomeScreen() {
  const { user, casks, activities, portfolioStats } = useAppStore();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-gray-600 text-base font-manrope">
                Good Morning
              </Text>
              <Text className="text-gray-800 text-2xl font-bold font-manrope">
                {user?.name || "James Wilson"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(main)/notifications" as any)}
              className="w-12 h-12 bg-white rounded-full items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Bell size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Profile Summary */}
          <Text className="text-gray-800 text-lg font-semibold mb-4 font-manrope">
            Profile Summary
          </Text>

          {/* Stats */}
          <View className="flex-row mb-6">
            <StatCard
              icon={Package}
              iconColor="#B8860B"
              iconBgColor="bg-yellow-100"
              title="Total Casks"
              value={portfolioStats.totalCasks.toString()}
            />
            <StatCard
              icon={DollarSign}
              iconColor="#3B82F6"
              iconBgColor="bg-blue-100"
              title="Total Value"
              value={portfolioStats.totalValue}
            />
            <StatCard
              icon={TrendingUp}
              iconColor="#10B981"
              iconBgColor="bg-green-100"
              title="Lifetime Gain"
              value={portfolioStats.lifetimeGain}
              valueColor="text-green-600"
            />
          </View>

          {/* Recent Casks */}
          <Text className="text-gray-800 text-lg font-semibold mb-4 font-manrope">
            Recent Casks
          </Text>

          {casks.slice(0, 2).map((cask) => (
            <CaskCard
              key={cask.id}
              {...cask}
              onViewDetails={() => {
                // Navigate to cask details
              }}
            />
          ))}

          {/* Recent Activity */}
          <Text className="text-gray-800 text-lg font-semibold mb-4 mt-6 font-manrope">
            Recent Activity
          </Text>

          {activities.slice(0, 3).map((activity) => (
            <ActivityItem
              key={activity.id}
              title={activity.title}
              subtitle={activity.subtitle}
              time={activity.time}
              type={activity.type}
              badge={activity.badge}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
