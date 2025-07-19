import React from "react";
import { View, Text, Image } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { Shadow } from "react-native-shadow-2";

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
    <View style={{ flex: 1 }}>
      <Shadow
        distance={2}
        offset={[0, 1]}
        startColor="rgba(78, 78, 78, 0.1)"
        endColor="rgba(0, 0, 0, 0.01)"
        style={{
          width: "100%",
          borderRadius: 12,
        }}
      >
        <View
          className="rounded-md p-4 justify-center items-center"
          style={{
            backgroundColor: cardBgColor,
            borderWidth: 1,
            borderColor: borderColor,
            minHeight: 120,
          }}
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

          <Text className="text-sm text-gray-500 mb-2 font-medium text-center">
            {title}
          </Text>
          <Text className={`text-xl font-bold ${valueColor} text-center`}>
            {value}
          </Text>
        </View>
      </Shadow>
    </View>
  );
}
