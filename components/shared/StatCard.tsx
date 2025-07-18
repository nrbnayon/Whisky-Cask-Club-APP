import React from "react";
import { View, Text, Image } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { getCardShadow } from "@/utils/shadows";

interface StatCardProps {
  icon?: LucideIcon;
  iconImage?: any;
  iconColor?: string;
  iconBgColor?: string;
  cardBgColor?: string;
  borderColor?: string;
  title?: string;
  value?: string;
  valueColor?: string;
}

export function StatCard({
  icon: Icon,
  iconImage,
  iconColor = "#000000",
  iconBgColor = "#F3F4F6",
  cardBgColor = "#FFFFFF",
  borderColor = "#E5E7EB",
  title = "",
  value = "",
  valueColor = "text-gray-800",
}: StatCardProps) {
  return (
    <View
      className="rounded-lg p-4 flex-1 justify-center items-center mx-1"
      style={[
        {
          backgroundColor: cardBgColor,
          borderWidth: 1,
          borderColor: borderColor,
          // marginHorizontal: 4,
        },
        getCardShadow("sm"),
      ]}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: iconBgColor }}
      >
        {Icon && <Icon size={24} color={iconColor} />}

        {iconImage && (
          <Image
            source={iconImage}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        )}
      </View>

      <Text className="text-xs text-gray-500 mb-1 font-manrope">{title}</Text>
      <Text className={`text-lg font-bold font-manrope ${valueColor}`}>
        {value}
      </Text>
    </View>
  );
}
