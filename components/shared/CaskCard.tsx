import React from "react";
import { View, Text, Image } from "react-native";
import { MapPin, Eye } from "lucide-react-native";
import { Button } from "../ui/Button";
import { getCardShadow } from "@/utils/shadows";
import { Card } from "../ui/Card";

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
  onViewDetails,
}: CaskCardProps) {
  return (
    <Card className="mb-4" shadowLevel="md">
      <View className="flex-row">
        <Image
          source={{ uri: image }}
          className="w-20 h-20 rounded-lg"
          resizeMode="cover"
          style={getCardShadow("sm")}
        />

        <View className="flex-1 ml-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-semibold text-gray-800 font-manrope">
              {name}
            </Text>
            <View className="bg-gray-100 px-2 py-1 rounded-full">
              <Text className="text-xs text-gray-600 font-manrope">
                {gainPercentage}
              </Text>
            </View>
          </View>

          <Text className="text-sm text-gray-600 mb-1 font-manrope">
            Year: {year}
          </Text>
          <Text className="text-sm text-gray-600 mb-2 font-manrope">
            Volume: {volume} - ABV: {abv}
          </Text>

          <View className="flex-row items-center mb-3">
            <MapPin size={12} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 ml-1 font-manrope">
              {location}
            </Text>
            <View
              className={`ml-auto px-2 py-1 rounded-full ${
                status === "Ready" ? "bg-green-100" : "bg-orange-100"
              }`}
            >
              <Text
                className={`text-xs font-manrope ${
                  status === "Ready" ? "text-green-600" : "text-orange-600"
                }`}
              >
                {status}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-xs text-gray-500 font-manrope">
                Estimated Value
              </Text>
              <Text className="text-base font-semibold text-gray-800 font-manrope">
                {estimatedValue}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 font-manrope">Gain</Text>
              <Text className="text-base font-semibold text-green-600 font-manrope">
                {gain}
              </Text>
            </View>
          </View>

          <Button onPress={onViewDetails} className="w-full" size="sm">
            <View className="flex-row items-center justify-center">
              <Eye size={16} color="white" />
              <Text className="text-white font-semibold ml-2 font-manrope">
                View Details
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </Card>
  );
}
