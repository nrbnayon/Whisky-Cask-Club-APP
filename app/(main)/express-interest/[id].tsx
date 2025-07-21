import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  User,
  CreditCard,
  Mail,
  Phone,
  Milk,
  BottleWine,
  Wine,
} from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppStore } from "@/store/useAppStore";
import { showToast } from "@/utils/toast";
import { getCardShadow } from "@/utils/shadows";

const expressInterestSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  investmentAmount: z.string().min(1, "Investment amount is required"),
  preferredContactMethod: z.enum(["email", "phone"]),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type ExpressInterestFormData = z.infer<typeof expressInterestSchema>;

export default function ExpressInterestScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { offers, user } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const offer = offers.find((o) => o.id === id);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ExpressInterestFormData>({
    resolver: zodResolver(expressInterestSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phoneNumber: "",
      investmentAmount: "",
      preferredContactMethod: "email",
      agreeToTerms: false,
    },
  });

  const preferredContactMethod = watch("preferredContactMethod");
  const agreeToTerms = watch("agreeToTerms");

  if (!offer) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">Offer not found</Text>
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
    const iconProps = { size: 14, color: "white" };
    switch (offer?.type) {
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

  const onSubmit = async (data: ExpressInterestFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to success page with form data
      router.push({
        pathname: "/(main)/express-interest-success/[id]" as any,
        params: {
          id: offer.id,
          investmentAmount: data.investmentAmount,
          email: data.email,
          phone: data.phoneNumber,
        },
      });
    } catch (error) {
      console.error("Express interest error:", error);
      showToast("error", "Failed to submit", "Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleTermsPress = () => {
  //   router.push("/(screen)/terms-conditions" as any);
  // };

  const handlePrivacyPress = () => {
    router.push("/(screen)/privacy-policy" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-5 pb-3">
          <TouchableOpacity
            onPress={() => router.navigate("/(main)/offers" as any)}
            className="mr-2"
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-gray-800 text-xl font-medium">
            Express Interest
          </Text>
        </View>

        <View className="px-5">
          {/* Offer Image */}
          <View
            className="bg-white rounded-md p-3"
            style={[{ marginBottom: 16 }, getCardShadow("sm")]}
          >
            <View className="relative rounded-md overflow-hidden mb-1">
              <Image
                source={{ uri: offer.image }}
                className="w-full h-64"
                resizeMode="cover"
              />

              {/* Badge */}
              <View
                className={`absolute top-4 left-4 ${getBadgeColor()} rounded-full px-3 py-1 flex-row items-center`}
              >
                <Text className="text-white text-sm font-medium mr-1">
                  {getBadgeIcon()}
                </Text>
                <Text className="text-white text-sm font-medium">
                  {offer.badge ||
                    offer.type.charAt(0).toUpperCase() + offer.type.slice(1)}
                </Text>
              </View>

              {/* Days Left */}
              <View className="absolute bottom-4 left-4 bg-red-500 bg-opacity-60 rounded-full px-3 py-1 flex-row items-center">
                <Clock size={14} color="white" />
                <Text className="text-white text-sm font-medium ml-1">
                  {offer.daysLeft} Days left
                </Text>
              </View>
            </View>
            {/* Offer Info */}
            <View className="flex-row items-center justify-between my-2">
              <View className="flex-row items-center">
                <MapPin size={16} color="#9CA3AF" />
                <Text className="text-gray-500 ml-1 mr-4">
                  {offer.location}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text className="text-gray-600 ml-1">{offer.rating}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text
                className="text-xl font-bold text-gray-800 flex-1 pr-2"
                style={{ flexShrink: 1, flexGrow: 1 }}
              >
                {offer.title}
              </Text>
              <View className="items-end">
                {offer.originalPrice &&
                  offer.currentPrice &&
                  offer.originalPrice !== offer.currentPrice && (
                    <Text className="text-gray-400 text-sm line-through">
                      ${offer.originalPrice}
                    </Text>
                  )}

                <Text className="text-primary text-xl font-bold">
                  ${offer.currentPrice || offer.originalPrice}
                </Text>
              </View>
            </View>
          </View>

          {/* Personal Information Section */}
          <View
            className="bg-white rounded-md p-3"
            style={[{ marginBottom: 16 }, getCardShadow("sm")]}
          >
            <View>
              <View className="flex-row items-center mb-4">
                <User size={20} color="#374151" />
                <Text className="text-gray-800 text-lg font-semibold ml-2">
                  Personal Information
                </Text>
              </View>

              <View style={{ gap: 12 }}>
                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Full Name
                  </Text>
                  <Controller
                    control={control}
                    name="fullName"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder="James Wilson"
                        className="bg-white border border-gray-200 rounded-md px-4 py-3 text-gray-800"
                      />
                    )}
                  />
                  {errors.fullName && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.fullName.message}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Email Address
                  </Text>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder="james@gmail.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="bg-white border border-gray-200 rounded-md px-4 py-3 text-gray-800"
                      />
                    )}
                  />
                  {errors.email && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Phone Number
                  </Text>
                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                        className="bg-white border border-gray-200 rounded-md px-4 py-3 text-gray-800"
                      />
                    )}
                  />
                  {errors.phoneNumber && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.phoneNumber.message}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Investment Details Section */}
          <View
            className="bg-white rounded-md p-3"
            style={[{ marginBottom: 16 }, getCardShadow("sm")]}
          >
            <View>
              <View className="flex-row items-center mb-4">
                <CreditCard size={20} color="#374151" />
                <Text className="text-gray-800 text-lg font-semibold ml-2">
                  Investment Details
                </Text>
              </View>

              <View className="space-y-4">
                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Investment Amount
                  </Text>
                  <Controller
                    control={control}
                    name="investmentAmount"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder="Enter amount"
                        keyboardType="numeric"
                        className="bg-white border border-gray-200 rounded-md px-4 py-3 text-gray-800"
                      />
                    )}
                  />
                  {errors.investmentAmount && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.investmentAmount.message}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-gray-700 font-medium my-3">
                    Preferred Contact Method
                  </Text>
                  <View className="flex-row" style={{ gap: 12 }}>
                    <Controller
                      control={control}
                      name="preferredContactMethod"
                      render={({ field: { onChange, value } }) => (
                        <>
                          <TouchableOpacity
                            onPress={() => onChange("email")}
                            className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-md border ${
                              preferredContactMethod === "email"
                                ? "bg-primary border-primary"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <Mail
                              size={18}
                              color={
                                preferredContactMethod === "email"
                                  ? "white"
                                  : "#374151"
                              }
                            />
                            <Text
                              className={`ml-2 font-medium ${
                                preferredContactMethod === "email"
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            >
                              Email
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => onChange("phone")}
                            className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-md border ${
                              preferredContactMethod === "phone"
                                ? "bg-primary border-primary"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <Phone
                              size={18}
                              color={
                                preferredContactMethod === "phone"
                                  ? "white"
                                  : "#374151"
                              }
                            />
                            <Text
                              className={`ml-2 font-medium ${
                                preferredContactMethod === "phone"
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            >
                              Phone
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    />
                  </View>
                  {/* Contact method hint */}
                  {preferredContactMethod && (
                    <Text className="text-gray-500 text-sm mt-2">
                      We&rsquo;ll contact you via{" "}
                      {preferredContactMethod === "email" ? "email" : "phone"}{" "}
                      for follow-up discussions.
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Terms and Conditions */}
          <View className="mb-8">
            <Controller
              control={control}
              name="agreeToTerms"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  className="flex-row items-start"
                >
                  <View
                    className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
                      value
                        ? "bg-primary border-primary"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {value && <Text className="text-white text-xs">✓</Text>}
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-600 leading-5 -mt-0.5">
                      I agree to the{" "}
                      <TouchableOpacity onPress={handlePrivacyPress}>
                        <Text className="text-primary font-medium mt-0.5">
                          Terms & Conditions
                        </Text>
                      </TouchableOpacity>{" "}
                      and{" "}
                      <TouchableOpacity onPress={handlePrivacyPress}>
                        <Text className="text-primary font-medium mt-0.5">
                          Privacy Policy
                        </Text>
                      </TouchableOpacity>
                      .
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            {errors.agreeToTerms && (
              <Text className="text-red-500 text-sm mt-2">
                {errors.agreeToTerms.message}
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={!agreeToTerms || isLoading}
            className={`rounded-md py-4 items-center ${
              agreeToTerms && !isLoading ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <Text className="text-white text-lg font-semibold">
              {isLoading ? "Submitting..." : "Submit Expression of Interest"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
