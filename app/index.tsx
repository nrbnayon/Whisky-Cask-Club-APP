import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import Logo from "../assets/images/logo.png";

export default function WelcomeScreen() {
  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <View className='flex-1 p-4 justify-center'>
        {/* Logo Section */}
        <View className='items-center mb-10'>
          <View className='rounded-2xl items-center justify-center mb-4 relative'>
            <Image source={Logo} className='w-72' resizeMode='contain' />
          </View>

          <Text className='text-gray-600 text-center text-base leading-6 px-4 font-manrope'>
            Invest in rare casks, aged to perfection. Track, grow, and taste
            your wealth.
          </Text>
        </View>

        {/* Action Buttons */}
        <View className='space-y-4'>
          <View className=''>
            <Button
              onPress={() => router.push("/(auth)/sign-in")}
              className='w-full'
              size='lg'
            >
              Sign In
            </Button>

            <Button
              onPress={() => router.push("/(auth)/sign-up")}
              variant='outline'
              className='w-full mt-4'
              size='lg'
            >
              Sign up
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
