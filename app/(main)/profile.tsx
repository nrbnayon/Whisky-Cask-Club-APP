// app\(main)\profile.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  User,
  CreditCard,
  FileText,
  LogOut,
  ChevronRight,
  ShoppingCart,
} from "lucide-react-native";
import { useAppStore } from "@/store/useAppStore";

export default function ProfileScreen() {
  const { user, logout } = useAppStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.replace("/" as any);
  };

  const ProfileMenuItem = ({
    icon: Icon,
    title,
    onPress,
    iconColor = "#374151",
    textColor = "text-gray-800",
    showChevron = true,
  }: {
    icon: any;
    title: string;
    onPress: () => void;
    iconColor?: string;
    textColor?: string;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 border-b border-gray-100"
    >
      <Icon size={24} color={iconColor} />
      <Text className={`flex-1 ml-4 text-lg ${textColor}`}>{title}</Text>
      {showChevron && <ChevronRight size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );

  const LogoutModal = () => (
    <Modal
      visible={showLogoutModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLogoutModal(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

          <Text className="text-xl font-semibold text-gray-800 text-center mb-2">
            Log Out
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Are you sure you want to log out?
          </Text>

          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-primary rounded-md py-4 items-center"
            >
              <Text className="text-white font-semibold text-lg">Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowLogoutModal(false)}
              className="bg-gray-100 rounded-md py-4 items-center"
            >
              <Text className="text-gray-700 font-semibold text-lg">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 p-5">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <Text className="text-gray-800 text-2xl font-semibold">
            My Profile
          </Text>
        </View>

        {/* Profile Info */}
        <View className="py-4 flex-row items-center">
          <View className="relative">
            <Image
              source={{
                uri:
                  user?.avatar ||
                  "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg",
              }}
              className="w-16 h-16 rounded-full"
              resizeMode="cover"
            />
            <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full items-center justify-center">
              <View className="w-3 h-3 bg-white rounded-full" />
            </View>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-xl font-semibold text-gray-800 mb-1">
              {user?.name || "John Max"}
            </Text>
            <Text className="text-gray-600">
              Balance: ${user?.balance || 150}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mt-4 rounded-md p-4">
          <ProfileMenuItem
            icon={User}
            title="Edit Profile"
            onPress={() => router.push("/(main)/edit-profile" as any)}
          />
          <ProfileMenuItem
            icon={ShoppingCart}
            title="My Purchase"
            onPress={() => router.push("/(main)/my-purchase" as any)}
          />
          <ProfileMenuItem
            icon={CreditCard}
            title="Payment"
            onPress={() => router.push("/(main)/payment/payment" as any)}
          />
          <ProfileMenuItem
            icon={FileText}
            title="Privacy Policy"
            onPress={() => router.push("/(screen)/privacy-policy" as any)}
          />
          <ProfileMenuItem
            icon={LogOut}
            title="Log Out"
            onPress={() => setShowLogoutModal(true)}
            iconColor="#EF4444"
            textColor="text-red-500"
            showChevron={false}
          />
        </View>
      </View>

      <LogoutModal />
    </SafeAreaView>
  );
}
