// app\(main)\cask\[id].tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, TrendingUp } from "lucide-react-native";
import { useAppStore } from "@/store/useAppStore";
import Svg, {
  Polyline,
  Circle,
  Text as SvgText,
  Line,
} from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

export default function CaskDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { casks } = useAppStore();

  const cask = casks.find((c) => c.id === id);

  if (!cask) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">Cask not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Custom LineChart Component
  const CustomLineChart = () => {
    const data = [4000, 8000, 12000, 10000, 14000, 16000];
    const labels = ["Jan", "Feb", "Mar", "Jun", "Jul", "Aug"];
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const chartWidth = screenWidth - 80;
    const chartHeight = 220;
    const padding = 40;

    const normalizeValue = (value: number) => {
      return (
        ((value - minValue) / (maxValue - minValue)) *
          (chartHeight - padding * 2) +
        padding
      );
    };

    const points = data
      .map((value, index) => {
        const x =
          (index / (data.length - 1)) * (chartWidth - padding * 2) + padding;
        const y = chartHeight - normalizeValue(value);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <View
        className="bg-white rounded-lg"
        style={{ height: chartHeight + 40 }}
      >
        <Svg width={chartWidth} height={chartHeight + 40}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = (i / 4) * (chartHeight - padding * 2) + padding;
            return (
              <Line
                key={i}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            );
          })}

          {/* Y-axis labels */}
          {[20000, 16000, 12000, 8000, 4000, 0].map((value, i) => {
            const y = (i / 5) * (chartHeight - padding * 2) + padding + 5;
            return (
              <SvgText
                key={i}
                x="25"
                y={y.toString()}
                fontSize="12"
                fill="#9CA3AF"
                textAnchor="end"
              >
                {value}
              </SvgText>
            );
          })}

          {/* Line */}
          <Polyline
            points={points}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data points */}
          {data.map((value, index) => {
            const x =
              (index / (data.length - 1)) * (chartWidth - padding * 2) +
              padding;
            const y = chartHeight - normalizeValue(value);
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#8B5CF6"
                stroke="#ffffff"
                strokeWidth="2"
              />
            );
          })}

          {/* X-axis labels */}
          {labels.map((label, index) => {
            const x =
              (index / (labels.length - 1)) * (chartWidth - padding * 2) +
              padding;
            return (
              <SvgText
                key={index}
                x={x.toString()}
                y={(chartHeight + 25).toString()}
                fontSize="12"
                fill="#9CA3AF"
                textAnchor="middle"
              >
                {label}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-gray-800 text-xl font-semibold">
            Casks Details
          </Text>
        </View>

        <View className="px-6 py-4">
          {/* Cask Image */}
          <View
            className="rounded-2xl mb-6 overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Image
              source={{ uri: cask.image }}
              className="w-full h-80"
              resizeMode="cover"
            />
          </View>

          {/* Value Cards */}
          <View className="flex-row mb-6 space-x-3">
            <View className="flex-1 bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <Text className="text-orange-600 text-2xl font-bold mb-1">
                {cask.estimatedValue}
              </Text>
              <Text className="text-gray-600 text-sm">Estimated Value</Text>
            </View>
            <View className="flex-1 bg-green-50 border border-green-200 rounded-2xl p-4">
              <Text className="text-green-600 text-2xl font-bold mb-1">
                +120%
              </Text>
              <Text className="text-gray-600 text-sm">Total Gain</Text>
            </View>
          </View>

          {/* Distillery Information */}
          <View
            className="bg-white rounded-2xl p-5 mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-gray-800 text-lg font-semibold mb-4">
              Distillery Information
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Distillery Name:</Text>
                <Text className="text-gray-800 font-medium">{cask.name}</Text>
              </View>

              {cask.name === "Ardbeg" ? (
                <>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-600">Bottle:</Text>
                    <Text className="text-gray-800 font-medium">6 Bottle</Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-600">Packaging:</Text>
                    <Text className="text-gray-800 font-medium">
                      Premium Gift Box
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-600">Volume:</Text>
                    <Text className="text-gray-800 font-medium">
                      700ml each
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-600">Certificates:</Text>
                    <Text className="text-gray-800 font-medium">
                      Authenticity Included
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-600">Volume:</Text>
                    <Text className="text-gray-800 font-medium">
                      500 Litres
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-600">ABV:</Text>
                    <Text className="text-gray-800 font-medium">
                      {cask.abv}
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-600">Years:</Text>
                    <Text className="text-gray-800 font-medium">
                      {cask.year}
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-600">Warehouse Location:</Text>
                    <Text className="text-gray-800 font-medium">
                      {cask.location}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Appreciation Timeline */}
          <View
            className="bg-white rounded-2xl p-5 mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-gray-800 text-lg font-semibold mb-4">
              Appreciation Timeline
            </Text>

            <View className="mb-4">
              <CustomLineChart />
            </View>

            <View className="bg-green-50 border border-green-200 rounded-xl p-4">
              <Text className="text-green-700 text-sm">
                Your cask has appreciate by{" "}
                <Text className="font-semibold">29.2%</Text> since purchase
              </Text>
            </View>
          </View>

          {/* Future Forecast */}
          <View
            className="bg-white rounded-2xl p-5 mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center mb-4">
              <TrendingUp size={20} color="#374151" />
              <Text className="text-gray-800 text-lg font-semibold ml-2">
                Future Forecast
              </Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row justify-between items-center py-3 bg-gray-50 rounded-lg px-4">
                <Text className="text-gray-600 font-medium">2024</Text>
                <Text className="text-gray-800 font-semibold">
                  {cask.estimatedValue}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-3 bg-gray-50 rounded-lg px-4">
                <Text className="text-gray-600 font-medium">2024</Text>
                <Text className="text-gray-800 font-semibold">
                  {cask.estimatedValue}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-3 bg-gray-50 rounded-lg px-4">
                <Text className="text-gray-600 font-medium">2024</Text>
                <Text className="text-gray-800 font-semibold">
                  {cask.estimatedValue}
                </Text>
              </View>
            </View>

            <View className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
              <Text className="text-green-700 text-sm">
                Projected 5-year appreciation:{" "}
                <Text className="font-semibold">+38.7%</Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
