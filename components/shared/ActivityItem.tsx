import React from "react";
import { View, Text } from "react-native";
// import { getCardShadow } from "@/utils/shadows";

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
  const getIconColor = () => {
    switch (type) {
      case "gain":
        return "bg-green-500";
      case "offer":
        return "bg-[#B8860B]";
      case "reward":
        return "bg-[#E47356]";
      default:
        return "bg-gray-500";
    }
  };

  const getBadgeStyles = () => {
    switch (type) {
      case "gain":
        return {
          container:
            "bg-green-50 border border-green-200 px-4 py-2 rounded-full",
          text: "text-green-600 text-xs font-medium",
        };
      case "offer":
        return {
          container:
            "bg-orange-50 border border-orange-200 px-4 py-2 rounded-full",
          text: "text-orange-600 text-xs font-medium",
        };
      case "reward":
        return {
          container: "bg-red-50 border border-red-200 px-4 py-2 rounded-full",
          text: "text-red-600 text-xs font-medium",
        };
      default:
        return {
          container: "bg-gray-50 border border-gray-200 px-4 py-2 rounded-full",
          text: "text-gray-600 text-xs font-medium",
        };
    }
  };

  const badgeStyles = getBadgeStyles();

  return (
    <View
      className="bg-white rounded-lg p-4 mb-3 border border-[#DBDADA]"
      // style={getCardShadow("sm")}
    >
      <View className="flex-row items-center justify-between gap-1">
        <View className="flex-row items-center flex-1">
          {/* Colored dot indicator */}
          <View className={`w-3 h-3 rounded-full mr-3 ${getIconColor()}`} />

          <View className="flex-1">
            <Text className="text-base font-normal text-gray-900 mb-1.5">
              {title}
            </Text>
            <Text className="text-sm text-gray-500">{time}</Text>
          </View>
        </View>

        {badge && (
          <View className={badgeStyles.container}>
            <Text className={badgeStyles.text}>{badge}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
