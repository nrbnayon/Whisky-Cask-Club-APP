// app/(main)/my-purchase.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, MapPin, Star, Clock, Trash2, Milk, BottleWine, Wine, TriangleAlert as AlertTriangle } from "lucide-react-native";
import { useAppStore } from "@/store/useAppStore";
import { getCardShadow } from "@/utils/shadows";
import { showToast } from "@/utils/toast";

export default function MyPurchaseScreen() {
  const router = useRouter();
  const { purchases, removePurchase } = useAppStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  const handleGoBack = () => {
    router.navigate("/(main)/profile" as any);
  };

  const handleDeletePress = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPurchaseId) return;
    
    setDeletingId(selectedPurchaseId);
    setShowDeleteModal(false);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      removePurchase(selectedPurchaseId);
      showToast("success", "Removed", "Investment removed from your purchases");
    } catch (error) {
      console.error("Error removing purchase:", error);
      showToast("error", "Failed to remove", "Please try again later");
    } finally {
      setDeletingId(null);
      setSelectedPurchaseId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedPurchaseId(null);
  };

  const handleCardTitlePress = (purchase: any) => {
    // Navigate to offer details page
    router.push(`/(main)/offer-details/${purchase.offerId}` as any);
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
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

  const getBadgeIcon = (type: string) => {
    const iconProps = { size: 14, color: "white" };
    switch (type) {
      case "cask":
        return <Milk {...iconProps} />;
      case "bottle":
        return <BottleWine {...iconProps} />;
      case "experience":
        return <Wine {...iconProps} />;
      default:
        return <Wine {...iconProps} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          bg: "bg-green-500",
          text: "text-white",
        };
      case "pending":
        return {
          bg: "bg-yellow-500",
          text: "text-white",
        };
      case "completed":
        return {
          bg: "bg-blue-500",
          text: "text-white",
        };
      case "reject":
        return {
          bg: "bg-red-500",
          text: "text-white",
        };
      default:
        return {
          bg: "bg-gray-500",
          text: "text-white",
        };
    }
  };

  const PurchaseCard = ({ purchase }: { purchase: any }) => {
    const statusColors = getStatusColor(purchase.status);
    const isDeleting = deletingId === purchase.id;

    return (
      <View
        className="bg-white rounded-md overflow-hidden mb-4"
        style={[getCardShadow("sm")]}
      >
        {/* Image Section */}
        <View className="relative">
          <Image
            source={{ uri: purchase.image }}
            className="w-full h-64"
            resizeMode="cover"
          />

          {/* Badge */}
          <View
            className={`absolute top-4 left-4 ${getBadgeColor(
              purchase.type
            )} rounded-full px-3 py-1 flex-row items-center`}
          >
            <View className="mr-1">{getBadgeIcon(purchase.type)}</View>
            <Text className="text-white text-sm font-medium">
              {purchase.type.charAt(0).toUpperCase() + purchase.type.slice(1)}
            </Text>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={() => handleDeletePress(purchase.id)}
            disabled={isDeleting}
            className="absolute top-4 right-4 w-10 h-10 bg-red-100 rounded-full items-center justify-center"
            style={{ opacity: isDeleting ? 0.5 : 1 }}
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>

          {/* Days Left */}
          <View className="absolute bottom-4 left-4 bg-black bg-opacity-60 rounded-full px-3 py-1 flex-row items-center">
            <Clock size={14} color="white" />
            <Text className="text-white text-sm font-medium ml-1">
              {purchase.daysLeft} Days left
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="p-4">
          {/* Location and Rating */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MapPin size={16} color="#9CA3AF" />
              <Text className="text-gray-500 ml-1 text-sm">
                {purchase.location}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text className="text-gray-600 ml-1">{purchase.rating}</Text>
            </View>
          </View>

          {/* Title and Price */}
          <View className="flex-row items-start justify-between mb-4">
            <TouchableOpacity 
              onPress={() => handleCardTitlePress(purchase)}
              className="flex-1 mr-2"
            >
              <Text
              className={`text-lg font-semibold flex-1 mr-2 ${
                purchase.status.toLowerCase() === "active"
                  ? "text-green-600"
                  : "text-gray-800"
              }`}
              numberOfLines={2}
            >
              {purchase.title}
              </Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">
              {purchase.investmentAmount}
            </Text>
          </View>

          {/* Status */}
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-base font-medium">Status:</Text>
            <View
              className={`${statusColors.bg} rounded-full px-6 py-2`}
            >
              <Text className={`${statusColors.text} font-medium`}>
                {purchase.status}
              </Text>
            </View>
          </View>

          {/* Investment Details */}
          {purchase.submittedDate && (
            <View className="mt-4 pt-4 border-t border-gray-100">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Submitted:</Text>
                <Text className="text-gray-800 font-medium">
                  {purchase.submittedDate}
                </Text>
              </View>
              {purchase.contactMethod && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Contact Method:</Text>
                  <Text className="text-gray-800 font-medium">
                    {purchase.contactMethod}
                  </Text>
                </View>
              )}
              {purchase.expectedReturn && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Expected Return:</Text>
                  <Text className="text-green-600 font-medium">
                    {purchase.expectedReturn}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const DeleteConfirmationModal = () => (
    <Modal
      visible={showDeleteModal}
      transparent
      animationType="fade"
      onRequestClose={handleCancelDelete}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          {/* Warning Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center">
              <AlertTriangle size={32} color="#EF4444" />
            </View>
          </View>

          {/* Title and Message */}
          <Text className="text-xl font-bold text-gray-800 text-center mb-2">
            Delete Investment
          </Text>
          <Text className="text-gray-600 text-center mb-6 leading-5">
            Are you sure you want to remove this investment from your tracking? This action cannot be undone.
          </Text>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={handleConfirmDelete}
              className="bg-red-500 rounded-md py-4 items-center"
              disabled={!!deletingId}
            >
              <Text className="text-white font-semibold text-lg">
                {deletingId ? "Removing..." : "Yes, Delete"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancelDelete}
              className="bg-gray-100 rounded-md py-4 items-center"
              disabled={!!deletingId}
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity onPress={handleGoBack} className="mr-2">
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-gray-800 text-xl font-medium">My Purchase</Text>
        </View>

        <View className="px-5">
          {/* Summary Stats */}
          <View className="flex-row mb-6 gap-2">
            <View className="flex-1 bg-white rounded-md p-4 border border-orange-200">
              <Text className="text-2xl font-bold text-orange-600 mb-1">
                {purchases.length}
              </Text>
              <Text className="text-sm text-gray-500">Total Investments</Text>
            </View>
            <View className="flex-1 bg-white rounded-md p-4 border border-green-200">
              <Text className="text-2xl font-bold text-green-600 mb-1">
                {purchases.filter((p) => p.status.toLowerCase() === "active").length}
              </Text>
              <Text className="text-sm text-gray-500">Active</Text>
            </View>
            <View className="flex-1 bg-white rounded-md p-4 border border-yellow-200">
              <Text className="text-2xl font-bold text-blue-600 mb-1">
                {purchases.filter((p) => p.status.toLowerCase() === "pending").length}
              </Text>
              <Text className="text-sm text-gray-500">Pending</Text>
            </View>
          </View>

          {/* Purchases List */}
          {purchases.length > 0 ? (
            purchases.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} />
            ))
          ) : (
            <View className="items-center justify-center py-12 px-4">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Milk size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 text-lg font-medium text-center mb-2">
                No Investments Yet
              </Text>
              <Text className="text-gray-400 text-sm text-center">
                Your investment tracking will appear here once you express interest in offers
              </Text>
              <TouchableOpacity
                onPress={() => router.navigate("/(main)/offers" as any)}
                className="bg-primary rounded-md px-6 py-3 mt-4"
              >
                <Text className="text-white font-semibold">Browse Offers</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <DeleteConfirmationModal />
    </SafeAreaView>
  );
}