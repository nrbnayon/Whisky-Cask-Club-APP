import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Eye, MapPin } from "lucide-react-native";
import { Shadow } from "react-native-shadow-2";
// import { getCardShadow } from "@/utils/shadows";

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
    <Shadow
      distance={42}
      offset={[0, 8]}
      startColor="rgba(0,0,0,0.1)"
      style={{ width: "100%" }}
    >
      <View
        className="rounded-md p-4 mb-4"
        style={[
          {
            backgroundColor: "#FFFFFF",
            borderWidth: 1.5,
            borderColor: borderColor,
            // shadowColor: "#0000001A",
            // shadowOffset: {
            //   width: 0,
            //   height: 2,
            // },
            // shadowOpacity: 0.08,
            // shadowRadius: 8,
            // elevation: 0,
          },
          // getCardShadow("sm"),
        ]}
      >
        <View className="flex-row items-start">
          <Image
            source={{ uri: image }}
            className="w-20 h-20 rounded-lg mr-3"
            style={{ width: 80, height: 80 }}
            resizeMode="cover"
          />

          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-2">
              <Text
                className="text-lg font-semibold text-gray-800"
                numberOfLines={1}
              >
                {name}
              </Text>
              <View className="bg-green-50 rounded-full border border-green-300 px-4 py-1 ml-2">
                <Text className="text-sm font-normal text-green-600">
                  {gainPercentage}
                </Text>
              </View>
            </View>

            <Text className="text-sm text-gray-600 mb-1">Year: {year}</Text>
            <Text className="text-sm text-gray-600 mb-3">
              Volume: {volume} - ABV: {abv}
            </Text>

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1 mr-2">
                <MapPin size={14} color="#9CA3AF" />
                <Text
                  className="text-sm text-gray-500 ml-1"
                  numberOfLines={1}
                  style={{ flexShrink: 1 }}
                >
                  {location}
                </Text>
              </View>
              <View
                className={`px-4 py-1 rounded-full border ${
                  status === "Ready"
                    ? "border-green-300 bg-green-50"
                    : "border-orange-300 bg-orange-100"
                }`}
              >
                <Text
                  className={`text-sm font-normal ${
                    status === "Ready" ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {status}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-sm text-gray-500 mb-1">
                  Estimated Value
                </Text>
                <Text className="text-lg font-medium text-gray-800">
                  {estimatedValue}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm text-gray-500 mb-1">Gain</Text>
                <Text className="text-lg font-medium text-green-600">
                  {gain}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {detailsButtonActive && (
          <TouchableOpacity
            onPress={onViewDetails}
            className="w-full py-4 rounded-md items-center justify-center mt-4"
            style={{ backgroundColor: "#B8860B" }}
          >
            <View className="flex-row items-center">
              <Eye size={18} color="white" />
              <Text className="text-white font-semibold ml-2 text-base">
                View Details
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Shadow>
  );
}
