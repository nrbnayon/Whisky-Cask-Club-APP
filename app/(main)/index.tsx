// app\(main)\index.tsx
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Bell, TrendingUp } from "lucide-react-native";
import { useAppStore } from "@/store/useAppStore";
import { StatCard } from "@/components/shared/StatCard";
import { CaskCard } from "@/components/shared/CaskCard";
import { ActivityItem } from "@/components/shared/ActivityItem";

import CaskBottleIcon from "@/assets/images/cask-bottle.png";
import MoneyBagIcon from "@/assets/images/money-bag.png";

export default function HomeScreen() {
  const { user, casks, activities, portfolioStats } = useAppStore();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-gray-700 text-md">Good Morning</Text>
              <Text className="text-gray-800 text-2xl font-semibold">
                {user?.name || "James Wilson"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(screen)/notifications" as any)}
              className="w-12 h-12 bg-[#F0F0F0] rounded-full items-center justify-center"
            >
              <Bell size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Profile Summary */}
          <Text className="text-gray-800 text-lg font-semibold mb-4">
            Profile Summary
          </Text>

          {/* Stats */}
          <View className="flex-row mb-6" style={{ gap: 8 }}>
            <StatCard
              iconImage={CaskBottleIcon}
              iconBgColor="#FEF3C7"
              cardBgColor="#FFFBEB"
              borderColor="#FBEFD0"
              title="Total Casks"
              value={portfolioStats.totalCasks.toString()}
            />
            <StatCard
              icon={TrendingUp}
              iconColor="#0891B2"
              iconBgColor="#CFFAFE"
              cardBgColor="#F0F9FF"
              borderColor="#BAE6FD"
              title="Total Value"
              value={portfolioStats.totalValue}
            />
            <StatCard
              iconImage={MoneyBagIcon}
              iconColor="#059669"
              iconBgColor="#D1FAE5"
              cardBgColor="#ECFDF5"
              borderColor="#A7F3D0"
              title="Lifetime Gain"
              value={portfolioStats.lifetimeGain}
              valueColor="text-green-600"
            />
          </View>

          {/* Recent Casks */}
          <Text className="text-gray-800 text-lg font-medium mb-4">
            Recent Casks
          </Text>

          {casks.slice(0, 5).map((cask) => (
            <CaskCard
              key={cask.id}
              {...cask}
              onViewDetails={() => {
                // Navigate to cask details
              }}
            />
          ))}

          {/* Recent Activity */}
          <Text className="text-gray-800 text-lg font-semibold mb-4 mt-6">
            Recent Activity
          </Text>

          {activities.slice(0, 4).map((activity) => (
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
