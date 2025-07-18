// app\(main)\notifications.tsx
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  TrendingUp,
  Gift,
  Users,
  Calendar,
} from "lucide-react-native";
import { useAppStore } from "@/store/useAppStore";
import { NotificationCard } from "@/components/shared/NotificationCard";

export default function NotificationsScreen() {
  const { notifications } = useAppStore();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "portfolio":
        return { icon: TrendingUp, color: "#10B981", bgColor: "bg-green-100" };
      case "offer":
        return { icon: Gift, color: "#F59E0B", bgColor: "bg-yellow-100" };
      case "reward":
        return { icon: Users, color: "#EF4444", bgColor: "bg-red-100" };
      case "event":
        return { icon: Calendar, color: "#8B5CF6", bgColor: "bg-purple-100" };
      default:
        return { icon: TrendingUp, color: "#6B7280", bgColor: "bg-gray-100" };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>

          <Text className="text-gray-800 text-xl font-semibold font-manrope">
            Notification
          </Text>
        </View>

        {/* Notifications List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-5 py-4"
        >
          {notifications.map((notification) => {
            const iconConfig = getNotificationIcon(notification.type);
            return (
              <NotificationCard
                key={notification.id}
                icon={iconConfig.icon}
                iconColor={iconConfig.color}
                iconBgColor={iconConfig.bgColor}
                title={notification.title}
                message={notification.message}
                time={notification.time}
              />
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
