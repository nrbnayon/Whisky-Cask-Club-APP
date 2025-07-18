import React from "react";
import { View, Text } from "react-native";
import { getCardShadow } from "@/utils/shadows";

interface ActivityItemProps {
  title: string;
  subtitle: string;
  time: string;
  type: "gain" | "offer" | "reward";
  badge?: string;
}

export function ActivityItem({
  title,
  subtitle,
  time,
  type,
  badge,
}: ActivityItemProps) {
  const getTypeColor = () => {
    switch (type) {
      case "gain":
        return "border-l-green-500";
      case "offer":
        return "border-l-orange-500";
      case "reward":
        return "border-l-pink-500";
      default:
        return "border-l-gray-300";
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case "gain":
        return "bg-green-100 text-green-600";
      case "offer":
        return "bg-orange-100 text-orange-600";
      case "reward":
        return "bg-pink-100 text-pink-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <View
      className={`bg-white rounded-xl p-4 mb-3 border-l-4 ${getTypeColor()}`}
      style={getCardShadow("sm")}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-800 mb-1 font-manrope">
            {title}
          </Text>
          <Text className="text-sm text-gray-600 font-manrope">{subtitle}</Text>
        </View>
        {badge && (
          <View className={`px-2 py-1 rounded-full ${getBadgeColor()}`}>
            <Text className="text-xs font-medium font-manrope">{badge}</Text>
          </View>
        )}
      </View>
      <Text className="text-xs text-gray-400 mt-2 font-manrope">{time}</Text>
    </View>
  );
}
