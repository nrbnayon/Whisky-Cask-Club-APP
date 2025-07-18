import React from "react";
import { View, Text } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { getCardShadow } from "@/utils/shadows";

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string;
  valueColor?: string;
}

export function StatCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  value,
  valueColor = "text-gray-800",
}: StatCardProps) {
  return (
    <View
      className="bg-white rounded-xl p-4 flex-1 mx-1 border border-gray-100"
      style={getCardShadow("sm")}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${iconBgColor}`}
      >
        <Icon size={20} color={iconColor} />
      </View>
      <Text className="text-xs text-gray-500 mb-1 font-manrope">{title}</Text>
      <Text className={`text-lg font-bold font-manrope ${valueColor}`}>
        {value}
      </Text>
    </View>
  );
}
