// app\(main)\cask\[id].tsx
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
  Circle,
  Text as SvgText,
  Line,
  Defs,
  LinearGradient,
  Stop,
  Path,
} from "react-native-svg";
import { Shadow } from "react-native-shadow-2";

const screenWidth = Dimensions.get("window").width;

export default function CaskDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { casks } = useAppStore();

  const cask = casks.find((c) => c.id === id);

  if (!cask) {
    return (
      <SafeAreaView className='flex-1 bg-gray-50'>
        <View className='flex-1 justify-center items-center'>
          <Text className='text-gray-500 text-lg'>Cask not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Custom LineChart Component matching the design
  const CustomLineChart = () => {
    const data = cask.appreciationData.map((d) => d.value);
    const labels = cask.appreciationData.map((d) => d.month);
    const maxValue = Math.max(...data, 0);
    const minValue = Math.min(...data, 0);
    const chartWidth = screenWidth - 40;
    const chartHeight = 240;
    const leftPadding = 35;
    const rightPadding = 25;
    const topPadding = 20;
    const bottomPadding = 50;

    // Calculate Y positions for grid lines and labels
    const yAxisValues = [];
    const step = (maxValue - minValue) / 4;
    for (let i = 0; i <= 4; i++) {
      yAxisValues.push(Math.round(maxValue - step * i));
    }

    // Function to truncate long month names
    const truncateLabel = (label: string) => {
      return label.length > 3 ? label.substring(0, 3) : label;
    };

    // Calculate optimal label display based on number of data points
    const getDisplayLabel = (index: number, label: string) => {
      if (labels.length > 12) {
        // Show only every third label for more than 12 points
        return index % 3 === 0 ? truncateLabel(label) : "";
      } else if (labels.length > 8) {
        // Show only every other label for 9-12 points
        return index % 2 === 0 ? truncateLabel(label) : "";
      }
      return truncateLabel(label);
    };

    const normalizeValue = (value: number) => {
      if (maxValue === minValue) return chartHeight - bottomPadding;
      return (
        ((value - minValue) / (maxValue - minValue)) *
          (chartHeight - topPadding - bottomPadding) +
        topPadding
      );
    };

    // Generate smooth curve path using Catmull-Rom splines
    const generateSmoothPath = () => {
      if (data.length < 2) {
        if (data.length === 1) {
          const x = leftPadding;
          const y = chartHeight - normalizeValue(data[0]);
          return `M ${x} ${y} L ${x} ${y}`;
        }
        return "";
      }

      const points = data.map((value, index) => ({
        x:
          (index / (data.length - 1)) *
            (chartWidth - leftPadding - rightPadding) +
          leftPadding,
        y: chartHeight - normalizeValue(value),
      }));

      let path = `M ${points[0].x} ${points[0].y}`;

      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];

        if (i === 0) {
          const controlPoint1X = current.x + (next.x - current.x) * 0.3;
          const controlPoint1Y = current.y;
          const controlPoint2X = next.x - (next.x - current.x) * 0.3;
          const controlPoint2Y = next.y;

          path += ` C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${next.x} ${next.y}`;
        } else {
          const prev = points[i - 1];
          const controlPoint1X = current.x + (next.x - prev.x) * 0.15;
          const controlPoint1Y = current.y + (next.y - prev.y) * 0.15;
          const controlPoint2X = next.x - (next.x - current.x) * 0.3;
          const controlPoint2Y = next.y - (next.y - current.y) * 0.15;

          path += ` C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${next.x} ${next.y}`;
        }
      }

      return path;
    };

    const smoothPath = generateSmoothPath();

    return (
      <View style={{ height: chartHeight, width: "100%" }}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id='lineGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
              <Stop offset='0%' stopColor='#10B981' stopOpacity='1' />
              <Stop offset='100%' stopColor='#34D399' stopOpacity='1' />
            </LinearGradient>
          </Defs>

          {/* Internal horizontal grid lines */}
          {yAxisValues.map((value, i) => {
            const y =
              (i / 4) * (chartHeight - topPadding - bottomPadding) + topPadding;
            return (
              <Line
                key={i}
                x1={leftPadding}
                y1={y}
                x2={chartWidth - rightPadding}
                y2={y}
                stroke='#F3F4F6'
                strokeWidth='1'
              />
            );
          })}

          {/* Y-axis labels */}
          {yAxisValues.map((value, i) => {
            const y =
              (i / 4) * (chartHeight - topPadding - bottomPadding) +
              topPadding +
              6;
            return (
              <SvgText
                key={i}
                x='30'
                y={y.toString()}
                fontSize='12'
                fill='#9CA3AF'
                textAnchor='end'
              >
                {value >= 1000
                  ? `${(value / 1000).toFixed(0)}k`
                  : value.toString()}
              </SvgText>
            );
          })}

          {/* Y-axis line (left border) */}
          <Line
            x1={leftPadding}
            y1={topPadding}
            x2={leftPadding}
            y2={chartHeight - bottomPadding}
            stroke='#E5E7EB'
            strokeWidth='1'
          />

          {/* X-axis line (bottom border, aligned with y=0) */}
          <Line
            x1={leftPadding}
            y1={chartHeight - normalizeValue(0)}
            x2={chartWidth - rightPadding}
            y2={chartHeight - normalizeValue(0)}
            stroke='#E5E7EB'
            strokeWidth='1'
          />

          {/* Smooth line curve */}
          <Path
            d={smoothPath}
            fill='none'
            stroke='url(#lineGradient)'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
          />

          {/* Data points */}
          {data.map((value, index) => {
            const x =
              (index / (data.length - 1)) *
                (chartWidth - leftPadding - rightPadding) +
              leftPadding;
            const y = chartHeight - normalizeValue(value);
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r='4'
                fill='#10B981'
                stroke='#ffffff'
                strokeWidth='2.5'
              />
            );
          })}

          {/* X-axis labels with proper spacing and rotation */}
          {labels.map((label, index) => {
            const x =
              (index / (labels.length - 1)) *
                (chartWidth - leftPadding - rightPadding) +
              leftPadding;
            const displayLabel = getDisplayLabel(index, label);

            if (!displayLabel) return null;

            // Ensure x position stays within chart bounds
            const clampedX = Math.max(
              leftPadding,
              Math.min(x, chartWidth - rightPadding)
            );

            return (
              <SvgText
                key={index}
                x={clampedX.toString()}
                y={(chartHeight - bottomPadding + 25).toString()}
                fontSize='11'
                fill='#9CA3AF'
                textAnchor='middle'
                transform={`rotate(-45 ${clampedX} ${chartHeight - bottomPadding + 25})`}
              >
                {displayLabel}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    );
  };

  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className='flex-row items-center p-4'>
          <TouchableOpacity onPress={() => router.back()} className='mr-3'>
            <ArrowLeft size={24} color='#374151' />
          </TouchableOpacity>
          <Text className='text-gray-800 text-xl font-medium'>
            Casks Details
          </Text>
        </View>

        <View className='p-4'>
          {/* Cask Image */}
          <Shadow
            distance={42}
            offset={[0, 8]}
            startColor='rgba(0,0,0,0.1)'
            style={{ width: "100%" }}
          >
            <View className='rounded-md mb-3 overflow-hidden bg-white p-4 w-full'>
              <Image
                source={{ uri: cask.image }}
                className='w-full h-80 rounded-md'
                resizeMode='cover'
              />

              {/* Value Cards */}
              <View className='flex-row mt-3'>
                <View className='flex-1 justify-center items-center bg-[#F9F8F1] border border-[#FFE6A4] rounded-md p-4 mr-2'>
                  <Text className='text-orange-600 text-2xl font-bold mb-1'>
                    {cask.estimatedValue}
                  </Text>
                  <Text className='text-gray-600 text-sm'>Estimated Value</Text>
                </View>
                <View className='flex-1 justify-center items-center bg-[#EFFAF3] border border-[#BCFFD4] rounded-md p-4 ml-2'>
                  <Text className='text-green-600 text-2xl font-bold mb-1'>
                    {cask.totalGain}
                  </Text>
                  <Text className='text-gray-600 text-sm'>Total Gain</Text>
                </View>
              </View>
            </View>
          </Shadow>

          {/* Distillery Information */}
          <Shadow
            distance={42}
            offset={[0, 8]}
            startColor='rgba(0,0,0,0.1)'
            style={{ width: "100%" }}
          >
            <View className='bg-white rounded-md p-4 mb-3 w-full'>
              <Text className='text-gray-800 text-lg font-semibold mb-4'>
                Distillery Information
              </Text>

              <View className='space-y-3'>
                <View className='flex-row justify-between py-2'>
                  <Text className='text-gray-600'>Distillery Name:</Text>
                  <Text className='text-gray-800 font-medium'>{cask.name}</Text>
                </View>

                {/* Dynamic details rendering */}
                {cask.details.bottle && (
                  <View className='flex-row justify-between py-2'>
                    <Text className='text-gray-600'>Bottle:</Text>
                    <Text className='text-gray-800 font-medium'>
                      {cask.details.bottle}
                    </Text>
                  </View>
                )}

                {cask.details.packaging && (
                  <View className='flex-row justify-between py-2'>
                    <Text className='text-gray-600'>Packaging:</Text>
                    <Text className='text-gray-800 font-medium'>
                      {cask.details.packaging}
                    </Text>
                  </View>
                )}

                <View className='flex-row justify-between py-2'>
                  <Text className='text-gray-600'>Volume:</Text>
                  <Text className='text-gray-800 font-medium'>
                    {cask.details.volume}
                  </Text>
                </View>

                {cask.details.abv && (
                  <View className='flex-row justify-between py-2'>
                    <Text className='text-gray-600'>ABV:</Text>
                    <Text className='text-gray-800 font-medium'>
                      {cask.details.abv}
                    </Text>
                  </View>
                )}

                {cask.details.years && (
                  <View className='flex-row justify-between py-2'>
                    <Text className='text-gray-600'>Years:</Text>
                    <Text className='text-gray-800 font-medium'>
                      {cask.details.years}
                    </Text>
                  </View>
                )}

                {cask.details.warehouseLocation && (
                  <View className='flex-row justify-between py-2'>
                    <Text className='text-gray-600'>Warehouse Location:</Text>
                    <Text className='text-gray-800 font-medium'>
                      {cask.details.warehouseLocation}
                    </Text>
                  </View>
                )}

                {cask.details.certificates && (
                  <View className='flex-row justify-between py-2'>
                    <Text className='text-gray-600'>Certificates:</Text>
                    <Text className='text-gray-800 font-medium'>
                      {cask.details.certificates}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Shadow>

          {/* Appreciation Timeline */}
          <Shadow
            distance={42}
            offset={[0, 8]}
            startColor='rgba(0,0,0,0.1)'
            style={{ width: "100%" }}
          >
            <View className='bg-white rounded-md p-4 mb-3 w-full'>
              <Text className='text-gray-800 text-lg font-semibold mb-4'>
                Appreciation Timeline
              </Text>

              <View className='w-full'>
                <CustomLineChart />
              </View>

              <View className='bg-green-50 rounded-md p-4 mt-4'>
                <Text className='text-green-700 text-sm'>
                  Your cask has appreciate by{" "}
                  <Text className='font-semibold'>
                    {cask.currentAppreciation}
                  </Text>{" "}
                  since purchase
                </Text>
              </View>
            </View>
          </Shadow>

          {/* Future Forecast */}
          <Shadow
            distance={42}
            offset={[0, 8]}
            startColor='rgba(0,0,0,0.1)'
            style={{ width: "100%" }}
          >
            <View className='bg-white rounded-md p-4 mb-3 w-full'>
              <View className='flex-row items-center mb-4'>
                <TrendingUp size={20} color='#374151' />
                <Text className='text-gray-800 text-lg font-semibold ml-2'>
                  Future Forecast
                </Text>
              </View>

              <View className='space-y-3'>
                {cask.futureForecasts.map((forecast, index) => (
                  <View
                    key={index}
                    className='flex-row justify-between items-center p-4 bg-[#EDEDED] rounded-md my-1'
                  >
                    <Text className='text-gray-600 font-medium'>
                      {forecast.year}
                    </Text>
                    <Text className='text-gray-800 font-semibold'>
                      {forecast.value}
                    </Text>
                  </View>
                ))}
              </View>

              <View className='bg-green-50 rounded-md p-4 mt-4'>
                <Text className='text-green-700 text-sm'>
                  Projected 5-year appreciation:{" "}
                  <Text className='font-semibold'>
                    {cask.projectedAppreciation}
                  </Text>
                </Text>
              </View>
            </View>
          </Shadow>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
