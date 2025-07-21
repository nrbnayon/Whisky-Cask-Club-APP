import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Share } from "react-native";
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
import { showToast } from "@/utils/toast";
import { getCardShadow } from "@/utils/shadows";
import { OfferStatsCard } from "@/components/shared/OfferStatsCard";
import * as Clipboard from "expo-clipboard";
// import VerifyMark from "@/assets/images/LightVerify.png";

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
      console.log("referral error::", error);
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
    <View
      className="bg-custom-green rounded-md p-4 mb-3 flex-row items-center justify-between "
      style={[{ backgroundColor: "#CCF0DC" }]}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-green-400 rounded-full items-center justify-center mr-3">
          <Check size={24} color="white" />
          {/* <Image
            source={VerifyMark}
            style={{ width: 50, height: 50 }}
            resizeMode="contain"
          /> */}
        </View>
        <View className="flex-1">
          <Text className="text-gray-800 font-semibold">{name}</Text>
          <Text className="text-gray-600 text-sm">{email}</Text>
          <Text className="text-gray-500 text-xs">Referred: {date}</Text>
        </View>
      </View>
      <View className="items-end">
        <View className="bg-green-50 border border-green-300 rounded-full px-3 py-2 mb-1">
          <Text className="text-green-600 text-xs font-medium">{status}</Text>
        </View>
        <Text className="text-gray-800 font-bold">${reward}</Text>
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
    <View
      className="bg-[#F0F0F0] rounded-md p-4 flex-row items-center justify-between border mt-4"
      style={[
        { borderColor: "#EED2CF" },
        // getCardShadow("sm")
      ]}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center mr-3">
          <Gift size={20} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-800 font-semibold">{title}</Text>
          <Text className="text-gray-600 text-sm">{description}</Text>
        </View>
      </View>
      <View className="items-end">
        <View className="bg-green-50 border border-green-300 rounded-full px-3 py-2 mb-1">
          <Text className="text-green-600 text-xs font-medium">{status}</Text>
        </View>
        <Text className="text-gray-800 font-bold">${amount}</Text>
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
    <View className="flex-row items-start">
      <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3 mt-1">
        <Text className="text-white font-bold text-sm">{step}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 font-medium text-base mb-1">
          {title}
        </Text>
        <Text className="text-gray-600 text-sm leading-5">{description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Header */}
          <Text className="text-gray-800 text-2xl font-semibold mb-6">
            Referral & Rewards
          </Text>

          {/* Stats Cards */}
          <View className="flex-row mb-6 gap-2">
            <OfferStatsCard
              value={referralData.totalReferrals.toString()}
              label="Total Referral"
              valueColor="text-primary"
              backgroundColor="bg-[#F9F8F1]"
              borderColor="border-[#E0D0A7]"
            />
            <OfferStatsCard
              value={referralData.completedReferrals.toString()}
              label="Completed"
              valueColor="text-green-600"
              backgroundColor="bg-green-50"
              borderColor="border-[#9EE2B7]"
            />
            <OfferStatsCard
              value={`$${referralData.totalEarned}`}
              label="Total Earned"
              valueColor="text-[#B87F79]"
              backgroundColor="bg-red-50"
              borderColor="border-[#EED2CF]"
            />
          </View>

          {/* Referral Code Section */}
          <View
            className="bg-white rounded-md p-3"
            style={[{ marginBottom: 16 }, getCardShadow("sm")]}
          >
            <Text className="text-gray-800 text-lg font-semibold mb-4">
              Your Unique Referral Code
            </Text>

            <View
              className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4"
              style={getCardShadow("sm")}
            >
              <Text className="text-primary text-2xl font-bold text-center mb-2">
                {referralData.referralCode}
              </Text>
              <Text className="text-gray-600 text-center text-sm">
                Share this code with friends
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCopyCode}
              className="bg-primary rounded-md py-4 flex-row items-center justify-center"
            >
              <Copy size={20} color="white" />
              <Text className="text-white font-semibold ml-2 text-lg">
                {copiedCode ? "Copied!" : "Copy Referral Code"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Share Via Section */}
          <View
            className="bg-white rounded-md p-4"
            style={[{ marginBottom: 16 }, getCardShadow("sm")]}
          >
            <Text className="text-gray-800 text-lg font-semibold mb-4">
              Share via
            </Text>

            <View className="gap-3">
              {/* First Row */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handleShare("whatsapp")}
                  className="bg-green-500 rounded-md py-4 px-4 flex-row items-center justify-center flex-1"
                >
                  <MessageCircle size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    What&apos;s App
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleShare("email")}
                  className="bg-white border border-gray-300 rounded-md py-4 px-4 flex-row items-center justify-center flex-1"
                >
                  <Mail size={20} color="#374151" />
                  <Text className="text-gray-700 font-semibold ml-2">
                    Email
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Second Row */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handleShare("facebook")}
                  className="bg-blue-600 rounded-md py-4 px-4 flex-row items-center justify-center flex-1"
                >
                  <Facebook size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Facebook
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleShare("twitter")}
                  className="bg-sky-400 rounded-md py-4 px-4 flex-row items-center justify-center flex-1"
                >
                  <Twitter size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Twitter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Referral Statistics */}
          <View
            className="bg-white rounded-md p-4"
            style={[{ marginBottom: 16 }, getCardShadow("sm")]}
          >
            <Text className="text-gray-800 text-lg font-semibold mb-4">
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
          <View
            className="bg-white rounded-md p-3"
            style={[{ marginBottom: 16 }, getCardShadow("sm")]}
          >
            <Text className="text-gray-800 text-lg font-semibold mb-4">
              How it Works
            </Text>

            <View
              className="bg-white rounded-md p-3 border border-[#E0D0A7]"
              // style={getCardShadow("sm")}
              style={{ gap: 16 }}
            >
              <HowItWorksStep
                step={1}
                title="Share your code"
                description="Send your referral code to friends and family"
              />
              <HowItWorksStep
                step={2}
                title="Friend signs up"
                description="They create an account using your code"
              />
              <HowItWorksStep
                step={3}
                title="Both get rewarded"
                description="You both receive £50 credit after their first investment"
              />
            </View>
          </View>

          {/* Reward History */}
          <View
            className="bg-white rounded-md p-3"
            style={[getCardShadow("sm")]}
          >
            <Text className="text-gray-800 text-lg font-semibold">
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
