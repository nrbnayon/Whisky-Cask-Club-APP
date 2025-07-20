import React from "react";
import { View, Text, Image, Platform } from "react-native";
import { LucideIcon } from "lucide-react-native";

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
  // Drop shadow configuration matching your design
  const shadowStyle = Platform.select({
    ios: {
      shadowColor: "#4E4E4E", 
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.1,
      shadowRadius: 42, 
    },
    android: {
      elevation: 2, 
    },
  });

  return (
    <View
      className='rounded-md p-4 justify-center items-center'
      style={[
        {
          backgroundColor: cardBgColor,
          borderWidth: 1,
          borderColor: borderColor,
          minHeight: 120,
        },
        shadowStyle,
      ]}
    >
      <View
        className='w-12 h-12 rounded-full items-center justify-center mb-3'
        style={{ backgroundColor: iconBgColor }}
      >
        {Icon && <Icon size={24} color={iconColor} />}
        {iconImage && (
          <Image
            source={iconImage}
            style={{ width: 24, height: 24 }}
            resizeMode='contain'
          />
        )}
      </View>

      <Text className='text-sm text-gray-500 mb-2 font-medium text-center'>
        {title}
      </Text>
      <Text className={`text-xl font-bold ${valueColor} text-center`}>
        {value}
      </Text>
    </View>
  );
}
