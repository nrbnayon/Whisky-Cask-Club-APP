import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Eye, MapPin } from "lucide-react-native";
import { getCardShadow } from "@/utils/shadows";

interface CaskCardProps {
  id: string;
  name: string;
  year: number;
  volume: string;
  abv: string;
  location: string;
  estimatedValue: string;
  gain: string;
  gainPercentage: string;
  status: "Ready" | "Maturing";
  image: string;
  borderColor?: string;
  detailsButtonActive?: boolean;
  onViewDetails?: () => void;
}

export function CaskCard({
  name,
  year,
  volume,
  abv,
  location,
  estimatedValue,
  gain,
  gainPercentage,
  status,
  image,
  borderColor = "#D7FBFF",
  detailsButtonActive,
  onViewDetails,
}: CaskCardProps) {
  return (
    <View
      className="rounded-xl p-4 mb-4"
      style={[
        {
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: `${borderColor}`,
        },
        getCardShadow("sm"),
      ]}
    >
      <View className="flex-row items-start">
        <Image
          source={{ uri: image }}
          className="w-20 h-20 object-cover rounded-lg mr-3"
          resizeMode="cover"
        />

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-semibold text-gray-800">{name}</Text>
            <View className="bg-green-50 rounded-full border border-green-300 px-2 py-1 ">
              <Text className="text-xs text-green-600">{gainPercentage}</Text>
            </View>
          </View>

          <Text className="text-sm text-gray-600 mb-1">Year: {year}</Text>
          <Text className="text-sm text-gray-600 mb-2">
            Volume: {volume} - ABV: {abv}
          </Text>

          <View className="flex-row items-center mb-3">
            <MapPin size={12} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 ml-1">{location}</Text>
            <View
              className={`ml-auto px-2 py-1 rounded-full border ${
                status === "Ready"
                  ? "border-green-300 bg-green-50"
                  : "border-orange-300 bg-orange-100"
              }`}
            >
              <Text
                className={`text-xs ${
                  status === "Ready" ? "text-green-600" : "text-orange-600"
                }`}
              >
                {status}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-xs text-gray-500">Estimated Value</Text>
              <Text className="text-base font-semibold text-gray-800">
                {estimatedValue}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500">Gain</Text>
              <Text className="text-base font-semibold text-green-600">
                {gain}
              </Text>
            </View>
          </View>

          {detailsButtonActive && (
            <TouchableOpacity
              onPress={onViewDetails}
              className="w-full py-3 rounded-lg items-center justify-center"
              style={{ backgroundColor: "#D4AF37" }}
            >
              <View className="flex-row items-center">
                <Eye size={16} color="white" />
                <Text className="text-white font-semibold ml-2">
                  View Details
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
