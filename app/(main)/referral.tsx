import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Copy,
  MessageCircle,
  Mail,
  Facebook,
  Twitter,
  Check,
  Gift,
} from "lucide-react-native";
import { useAppStore } from "@/store/useAppStore";
import { Shadow } from "react-native-shadow-2";
import { showToast } from "@/utils/toast";
import * as Clipboard from "expo-clipboard";

export default function ReferralScreen() {
  const { referralData, user } = useAppStore();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(referralData.referralCode);
      setCopiedCode(true);
      showToast("success", "Copied!", "Referral code copied to clipboard");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.log("referral error::", error)
      showToast("error", "Failed to copy", "Please try again");
    }
  };

  const handleShare = async (platform: string) => {
    const message = `Join Whisky Cask Club with my referral code: ${referralData.referralCode} and start investing in premium whisky casks!`;

    try {
      await Share.share({
        message,
        title: "Join Whisky Cask Club",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const StatCard = ({
    title,
    value,
    bgColor,
    textColor,
  }: {
    title: string;
    value: string | number;
    bgColor: string;
    textColor: string;
  }) => (
    <View className={`flex-1 ${bgColor} rounded-xl p-4 mx-1`}>
      <Text className={`text-2xl font-bold ${textColor} text-center mb-1`}>
        {value}
      </Text>
      <Text className='text-gray-600 text-sm text-center'>{title}</Text>
    </View>
  );

  const ReferralStatItem = ({
    name,
    email,
    date,
    status,
    reward,
  }: {
    name: string;
    email: string;
    date: string;
    status: string;
    reward: number;
  }) => (
    <View className='bg-green-50 rounded-xl p-4 mb-3 flex-row items-center justify-between'>
      <View className='flex-row items-center flex-1'>
        <View className='w-10 h-10 bg-green-500 rounded-full items-center justify-center mr-3'>
          <Check size={20} color='white' />
        </View>
        <View className='flex-1'>
          <Text className='text-gray-800 font-semibold'>{name}</Text>
          <Text className='text-gray-600 text-sm'>{email}</Text>
          <Text className='text-gray-500 text-xs'>Referred: {date}</Text>
        </View>
      </View>
      <View className='items-end'>
        <View className='bg-green-100 border border-green-300 rounded-full px-3 py-1 mb-1'>
          <Text className='text-green-600 text-xs font-medium'>{status}</Text>
        </View>
        <Text className='text-gray-800 font-bold'>${reward}</Text>
      </View>
    </View>
  );

  const RewardHistoryItem = ({
    title,
    description,
    amount,
    status,
  }: {
    title: string;
    description: string;
    amount: number;
    status: string;
  }) => (
    <View className='bg-green-50 rounded-xl p-4 mb-3 flex-row items-center justify-between'>
      <View className='flex-row items-center flex-1'>
        <View className='w-10 h-10 bg-green-500 rounded-full items-center justify-center mr-3'>
          <Gift size={20} color='white' />
        </View>
        <View className='flex-1'>
          <Text className='text-gray-800 font-semibold'>{title}</Text>
          <Text className='text-gray-600 text-sm'>{description}</Text>
        </View>
      </View>
      <View className='items-end'>
        <View className='bg-green-100 border border-green-300 rounded-full px-3 py-1 mb-1'>
          <Text className='text-green-600 text-xs font-medium'>{status}</Text>
        </View>
        <Text className='text-gray-800 font-bold'>${amount}</Text>
      </View>
    </View>
  );

  const HowItWorksStep = ({
    step,
    title,
    description,
  }: {
    step: number;
    title: string;
    description: string;
  }) => (
    <View className='flex-row items-start mb-4'>
      <View className='w-8 h-8 bg-primary rounded-full items-center justify-center mr-3 mt-1'>
        <Text className='text-white font-bold text-sm'>{step}</Text>
      </View>
      <View className='flex-1'>
        <Text className='text-gray-800 font-semibold text-base mb-1'>
          {title}
        </Text>
        <Text className='text-gray-600 text-sm leading-5'>{description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className='px-5 py-4'>
          {/* Header */}
          <Text className='text-gray-800 text-2xl font-semibold mb-6'>
            Referral & Rewards
          </Text>

          {/* Stats Cards */}
          <View className='flex-row mb-6'>
            <StatCard
              title='Total Referral'
              value={referralData.totalReferrals}
              bgColor='bg-orange-50'
              textColor='text-orange-600'
            />
            <StatCard
              title='Completed'
              value={referralData.completedReferrals}
              bgColor='bg-green-50'
              textColor='text-green-600'
            />
            <StatCard
              title='Total Earned'
              value={`$${referralData.totalEarned}`}
              bgColor='bg-red-50'
              textColor='text-red-600'
            />
          </View>

          {/* Referral Code Section */}
          <View className='mb-6'>
            <Text className='text-gray-800 text-lg font-semibold mb-4'>
              Your Unique Referral Code
            </Text>

            <Shadow
              distance={8}
              offset={[0, 4]}
              startColor='rgba(0,0,0,0.1)'
              style={{ width: "100%", marginBottom: 16 }}
            >
              <View className='bg-orange-50 border border-orange-200 rounded-xl p-4'>
                <Text className='text-primary text-2xl font-bold text-center mb-2'>
                  {referralData.referralCode}
                </Text>
                <Text className='text-gray-600 text-center text-sm'>
                  Share this code with friends
                </Text>
              </View>
            </Shadow>

            <TouchableOpacity
              onPress={handleCopyCode}
              className='bg-primary rounded-xl py-4 flex-row items-center justify-center'
            >
              <Copy size={20} color='white' />
              <Text className='text-white font-semibold ml-2 text-lg'>
                {copiedCode ? "Copied!" : "Copy Referral Code"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Share Via Section */}
          <View className='mb-6'>
            <Text className='text-gray-800 text-lg font-semibold mb-4'>
              Share via
            </Text>

            <View className='flex-row flex-wrap'>
              <TouchableOpacity
                onPress={() => handleShare("whatsapp")}
                className='bg-green-500 rounded-xl py-3 px-6 flex-row items-center mr-3 mb-3'
              >
                <MessageCircle size={20} color='white' />
                <Text className='text-white font-semibold ml-2'>
                  What&apos;s App
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleShare("email")}
                className='bg-white border border-gray-300 rounded-xl py-3 px-6 flex-row items-center mr-3 mb-3'
              >
                <Mail size={20} color='#374151' />
                <Text className='text-gray-700 font-semibold ml-2'>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleShare("facebook")}
                className='bg-blue-600 rounded-xl py-3 px-6 flex-row items-center mr-3 mb-3'
              >
                <Facebook size={20} color='white' />
                <Text className='text-white font-semibold ml-2'>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleShare("twitter")}
                className='bg-blue-400 rounded-xl py-3 px-6 flex-row items-center mb-3'
              >
                <Twitter size={20} color='white' />
                <Text className='text-white font-semibold ml-2'>Twitter</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Referral Statistics */}
          <View className='mb-6'>
            <Text className='text-gray-800 text-lg font-semibold mb-4'>
              Referral Statistics
            </Text>

            {referralData.referralStats.map((stat) => (
              <ReferralStatItem
                key={stat.id}
                name={stat.name}
                email={stat.email}
                date={stat.referredDate}
                status={stat.status}
                reward={stat.reward}
              />
            ))}
          </View>

          {/* How It Works */}
          <View className='mb-6'>
            <Text className='text-gray-800 text-lg font-semibold mb-4'>
              How it Works
            </Text>

            <Shadow
              distance={8}
              offset={[0, 4]}
              startColor='rgba(0,0,0,0.1)'
              style={{ width: "100%" }}
            >
              <View className='bg-white rounded-xl p-4'>
                <HowItWorksStep
                  step={1}
                  title='Share your code'
                  description='Send your referral code to friends and family'
                />
                <HowItWorksStep
                  step={2}
                  title='Friend signs up'
                  description='They create an account using your code'
                />
                <HowItWorksStep
                  step={3}
                  title='Both get rewarded'
                  description='You both receive £50 credit after their first investment'
                />
              </View>
            </Shadow>
          </View>

          {/* Reward History */}
          <View className='mb-6'>
            <Text className='text-gray-800 text-lg font-semibold mb-4'>
              Reward History
            </Text>

            {referralData.rewardHistory.map((reward) => (
              <RewardHistoryItem
                key={reward.id}
                title={reward.title}
                description={reward.description}
                amount={reward.amount}
                status={reward.status}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
