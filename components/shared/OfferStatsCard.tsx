import React from "react";
import { View, Text } from "react-native";

interface OfferStatsCardProps {
  value: string;
  label: string;
  valueColor?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export function OfferStatsCard({
  value,
  label,
  valueColor = "text-gray-800",
  backgroundColor = "bg-white",
  borderColor = "border-gray-200",
}: OfferStatsCardProps) {
  return (
    <View
      className={`${backgroundColor} ${borderColor} border rounded-md p-4 flex-1 items-center`}
    >
      <Text className={`text-2xl font-bold ${valueColor} mb-1`}>{value}</Text>
      <Text className='text-sm text-gray-500 text-center'>{label}</Text>
    </View>
  );
}
