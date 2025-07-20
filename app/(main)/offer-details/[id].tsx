// app\(main)\offer-details\[id].tsx
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MapPin, Star, Clock } from "lucide-react-native";
import { useAppStore } from "@/store/useAppStore";
import { Shadow } from "react-native-shadow-2";
// import { showToast } from "@/utils/toast";

export default function OfferDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { offers } = useAppStore();

  const offer = offers.find((o) => o.id === id);

  if (!offer) {
    return (
      <SafeAreaView className='flex-1 bg-surface'>
        <View className='flex-1 justify-center items-center'>
          <Text className='text-gray-500 text-lg'>Offer not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getBadgeColor = () => {
    switch (offer.type) {
      case "cask":
        return "bg-primary";
      case "bottle":
        return "bg-primary";
      case "experience":
        return "bg-primary";
      default:
        return "bg-primary";
    }
  };

  const getBadgeIcon = () => {
    switch (offer.type) {
      case "cask":
        return "🛢️";
      case "bottle":
        return "🍾";
      case "experience":
        return "🥃";
      default:
        return "🛢️";
    }
  };

  const handleExpressInterest = () => {
    router.push(`/(main)/express-interest/${offer.id}` as any);
  };

  const renderDetailItem = (label: string, value: string) => (
    <View className='flex-row justify-between py-3 border-b border-gray-100'>
      <Text className='text-gray-600'>{label}:</Text>
      <Text className='text-gray-800 font-medium'>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className='flex-row items-center p-5'>
          <TouchableOpacity
            onPress={() => router.navigate("/(main)/offers" as any)}
            className='mr-2'
          >
            <ArrowLeft size={24} color='#374151' />
          </TouchableOpacity>
          <Text className='text-gray-800 text-xl font-medium'>
            Offer Details
          </Text>
        </View>

        <View className='px-5 pb-4'>
          {/* Main Image */}
          <Shadow
            distance={8}
            offset={[0, 4]}
            startColor='rgba(0,0,0,0.1)'
            style={{ width: "100%", marginBottom: 24 }}
          >
            <View className='relative rounded-md overflow-hidden'>
              <Image
                source={{ uri: offer.image }}
                className='w-full h-80'
                resizeMode='cover'
              />

              {/* Badge */}
              <View
                className={`absolute top-4 left-4 ${getBadgeColor()} rounded-full px-3 py-1 flex-row items-center`}
              >
                <Text className='text-white text-sm font-medium mr-1'>
                  {getBadgeIcon()}
                </Text>
                <Text className='text-white text-sm font-medium'>
                  {offer.badge ||
                    offer.type.charAt(0).toUpperCase() + offer.type.slice(1)}
                </Text>
              </View>

              {/* Days Left */}
              <View className='absolute bottom-4 left-4 bg-black bg-opacity-60 rounded-full px-3 py-1 flex-row items-center'>
                <Clock size={14} color='white' />
                <Text className='text-white text-sm font-medium ml-1'>
                  {offer.daysLeft} Days left
                </Text>
              </View>
            </View>
          </Shadow>

          {/* Title and Info */}
          <View className='mb-6'>
            <View className='flex-row items-start justify-between mb-2'>
              <Text className='text-2xl font-bold text-gray-800 flex-1 mr-4'>
                {offer.title}
              </Text>
              <Text className='text-2xl font-bold text-primary'>
                {offer.currentPrice}
              </Text>
            </View>

            <View className='flex-row items-center justify-between mb-4'>
              <View className='flex-row items-center'>
                <MapPin size={16} color='#9CA3AF' />
                <Text className='text-gray-500 ml-1'>{offer.location}</Text>
              </View>
              <View className='flex-row items-center'>
                <Star size={16} color='#FFD700' fill='#FFD700' />
                <Text className='text-gray-600 ml-1'>{offer.rating}</Text>
              </View>
            </View>

            {offer.originalPrice !== offer.currentPrice && (
              <Text className='text-lg text-gray-400 line-through mb-2'>
                {offer.originalPrice}
              </Text>
            )}

            <Text className='text-gray-600 leading-6'>{offer.description}</Text>
          </View>

          {/* Details Section */}
          <Shadow
            distance={8}
            offset={[0, 4]}
            startColor='rgba(0,0,0,0.1)'
            style={{ width: "100%", marginBottom: 24 }}
          >
            <View className='bg-white rounded-md p-4'>
              {offer.details.distillery &&
                renderDetailItem("Distillery", offer.details.distillery)}
              {offer.details.vintage &&
                renderDetailItem("Vintage", offer.details.vintage)}
              {offer.details.volume &&
                renderDetailItem("Volume", offer.details.volume)}
              {offer.details.abv && renderDetailItem("ABV", offer.details.abv)}
              {offer.details.maturationPeriod &&
                renderDetailItem(
                  "Maturation Period",
                  offer.details.maturationPeriod
                )}
              {offer.details.caskType &&
                renderDetailItem("Cask Type", offer.details.caskType)}
              {offer.details.bottle &&
                renderDetailItem("Bottle", offer.details.bottle)}
              {offer.details.packaging &&
                renderDetailItem("Packaging", offer.details.packaging)}
              {offer.details.certificates &&
                renderDetailItem("Certificates", offer.details.certificates)}
              {offer.details.duration &&
                renderDetailItem("Duration", offer.details.duration)}
              {offer.details.tastings &&
                renderDetailItem("Tastings", offer.details.tastings)}
              {offer.details.participants &&
                renderDetailItem("Participants", offer.details.participants)}
              {offer.details.includes &&
                renderDetailItem("Includes", offer.details.includes)}
            </View>
          </Shadow>

          {/* Express Interest Button */}
          <TouchableOpacity
            onPress={handleExpressInterest}
            className='bg-primary rounded-md py-4 items-center'
          >
            <Text className='text-white text-lg font-semibold'>
              Expression Interest - {offer.currentPrice}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
