import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showToast } from "@/utils/toast";
import { cardValidation } from "@/utils/validationSchemas";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";

import SimCardIcon from "@/assets/images/simcard.png";
import WIFI from "@/assets/images/WIFI.png";

// Enhanced card validation schema using existing validation utilities
const paymentSchema = z.object({
  cardHolder: z
    .string()
    .min(2, "Cardholder name is required")
    .max(50, "Name is too long"),
  cardNumber: z
    .string()
    .min(13, "Card number must be at least 13 digits")
    .max(19, "Card number is too long")
    .refine((val) => /^[\d\s]+$/.test(val), {
      message: "Card number can only contain digits and spaces",
    })
    .refine((val) => cardValidation.isValidCardNumber(val), {
      message: "Please enter a valid card number",
    }),
  expiryDate: z
    .string()
    .min(5, "Expiry date required")
    .max(5, "Invalid format")
    .refine((val) => /^\d{2}\/\d{2}$/.test(val), {
      message: "Use MM/YY format",
    })
    .refine(
      (val) => {
        const [month, year] = val.split("/");
        return cardValidation.isValidExpiryDate(month, year);
      },
      {
        message: "Card has expired or invalid date",
      }
    ),
  cvv: z
    .string()
    .min(3, "CVV must be 3-4 digits")
    .max(4, "CVV must be 3-4 digits")
    .refine((val) => /^\d+$/.test(val), "CVV must be numeric"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

// Format expiry date using MM/YY format
const formatExpiryDate = (value: string): string => {
  const v = value.replace(/\D/g, "");
  if (v.length >= 2) {
    return v.slice(0, 2) + "/" + v.slice(2, 4);
  }
  return v;
};

export default function AddCard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cardType, setCardType] = useState<string>("unknown");

  // Using the existing payment methods hook
  const { loadPaymentMethods } = usePaymentMethods();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardHolder: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const watchedCardNumber = watch("cardNumber");
  const watchedCardHolder = watch("cardHolder");
  const watchedExpiryDate = watch("expiryDate");

  // Use existing card validation utilities
  useEffect(() => {
    const type = cardValidation.getCardType(watchedCardNumber || "");
    setCardType(type);
  }, [watchedCardNumber]);

  const onSubmit = async (data: PaymentFormData) => {
    // Additional CVV validation using existing utility
    const [, year] = data.expiryDate.split("/");
    if (!cardValidation.isValidCVV(data.cvv, cardType)) {
      showToast("error", "Invalid CVV", "Please check your CVV number");
      return;
    }

    setIsLoading(true);
    try {
      // Format data for processing
      const [expMonth, expYear] = data.expiryDate.split("/");
      const cardData = {
        number: data.cardNumber.replace(/\s/g, ""),
        exp_month: parseInt(expMonth),
        exp_year: parseInt(`20${expYear}`),
        cvc: data.cvv,
        name: data.cardHolder,
        brand: cardType,
      };

      // Simulate Stripe API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful response - in real app, this would be Stripe response
      const mockPaymentMethod = {
        id: "pm_" + Date.now(),
        type: "card",
        card: {
          brand: cardType,
          last4: data.cardNumber.replace(/\s/g, "").slice(-4),
          exp_month: parseInt(expMonth),
          exp_year: parseInt(`20${expYear}`),
        },
        billing_details: {
          name: data.cardHolder,
        },
        created: Date.now(),
      };

      // In real app, save to backend and Stripe
      console.log("Payment method created:", mockPaymentMethod);

      // Refresh payment methods list using existing hook
      await loadPaymentMethods();

      // Show success toast
      showToast(
        "success",
        "Card Added Successfully",
        `${cardType.charAt(0).toUpperCase() + cardType.slice(1)} card ending in ${data.cardNumber.slice(-4)} has been added`
      );

      router.back();
    } catch (error) {
      console.error("Payment method creation error:", error);
      showToast(
        "error",
        "Failed to Add Card",
        "Please verify your card details and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardNumberChange = (value: string) => {
    // Use existing card formatting utility
    const formatted = cardValidation.formatCardNumber(value);
    setValue("cardNumber", formatted);
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    setValue("expiryDate", formatted);
  };

  const handleCVVChange = (value: string) => {
    // Only allow numeric input for CVV
    const numeric = value.replace(/[^0-9]/g, "");
    setValue("cvv", numeric);
  };

  const getCardIcon = () => {
    switch (cardType) {
      case "visa":
        return (
          <View
            style={{
              width: 48,
              height: 32,
              backgroundColor: "#2563eb",
              borderRadius: 6,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
              VISA
            </Text>
          </View>
        );
      case "mastercard":
        return (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: "#ef4444",
                borderRadius: 12,
                opacity: 0.9,
              }}
            />
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: "#eab308",
                borderRadius: 12,
                marginLeft: -12,
                opacity: 0.9,
              }}
            />
          </View>
        );
      case "amex":
        return (
          <View
            style={{
              width: 48,
              height: 32,
              backgroundColor: "#60a5fa",
              borderRadius: 6,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
              AMEX
            </Text>
          </View>
        );
      default:
        return (
          <View
            style={{
              width: 48,
              height: 32,
              backgroundColor: "#9ca3af",
              borderRadius: 6,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
              CARD
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F5" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => router.navigate("/(main)/profile" as any)}
            style={{ marginRight: 12 }}
          >
            <ArrowLeft size={24} color='#374151' />
          </TouchableOpacity>
          <Text
            style={{
              color: "#111827",
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            Add Card
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
          {/* Enhanced Credit Card Preview */}
          <View
            style={{
              backgroundColor: "#007AFF",
              borderRadius: 12,
              padding: 20,
              marginBottom: 32,
              position: "relative",
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
              backgroundImage:
                "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)",
            }}
          >
            {/* Background Elements */}
            <View
              style={{
                position: "absolute",
                top: -80,
                right: -80,
                width: 160,
                height: 160,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 80,
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: -64,
                left: -64,
                width: 128,
                height: 128,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 64,
              }}
            />

            {/* Card Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  opacity: 0.9,
                }}
              >
                BANK NAME
              </Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: "600",
                  opacity: 0.9,
                }}
              >
                CARD NAME
              </Text>
            </View>

            {/* Chip */}
            <View className='flex-row justify-between items-center'>
              <View
                style={{
                  width: 48,
                  height: 36,
                  backgroundColor: "#fbbf24",
                  borderRadius: 6,
                  marginBottom: 8,
                  marginTop: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Image
                  source={SimCardIcon}
                  style={{ width: 50, height: 40 }}
                  resizeMode='contain'
                />
              </View>

              <Image
                source={WIFI}
                style={{ width: 32, height: 32 }}
                resizeMode='contain'
              />
            </View>

            {/* Card Number */}
            <Text
              style={{
                color: "white",
                fontSize: 20,
                fontFamily: "monospace",
                letterSpacing: 2,
                marginBottom: 24,
                marginTop: 8,
              }}
            >
              {watchedCardNumber || "1234 5678 1234 5678"}
            </Text>

            {/* Card Details Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#93c5fd",
                    fontSize: 12,
                    opacity: 0.8,
                    marginBottom: 4,
                  }}
                >
                  01/23
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {watchedExpiryDate || "03/27"}
                </Text>
              </View>

              <View style={{ flex: 2 }}>
                <Text
                  style={{
                    color: "#93c5fd",
                    fontSize: 12,
                    opacity: 0.8,
                    marginBottom: 4,
                    textAlign: "right",
                  }}
                >
                  CARDHOLDER NAME
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: "600",
                    textAlign: "right",
                  }}
                >
                  {(watchedCardHolder || "").toUpperCase() || "CARDHOLDER NAME"}
                </Text>
              </View>

              <View style={{ marginLeft: 16 }}>{getCardIcon()}</View>
            </View>
          </View>

          {/* Form Fields */}
          <View style={{ gap: 16 }}>
            {/* Card Holder Name */}
            <View>
              <Text
                style={{
                  color: "#6b7280",
                  fontWeight: "500",
                  marginBottom: 8,
                  fontSize: 14,
                }}
              >
                Card Holder
              </Text>
              <Controller
                control={control}
                name='cardHolder'
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder='Enter cardholder name'
                    autoCapitalize='words'
                    style={{
                      backgroundColor: "white",
                      borderWidth: 1,
                      borderColor: errors.cardHolder ? "#f87171" : "#d1d5db",
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      color: "#1f2937",
                      fontSize: 16,
                      minHeight: 56,
                    }}
                  />
                )}
              />
              {errors.cardHolder && (
                <Text style={{ color: "#ef4444", fontSize: 14, marginTop: 4 }}>
                  {errors.cardHolder.message}
                </Text>
              )}
            </View>

            {/* Card Number */}
            <View>
              <Text
                style={{
                  color: "#6b7280",
                  fontWeight: "500",
                  marginBottom: 8,
                  fontSize: 14,
                }}
              >
                Card Number
              </Text>
              <Controller
                control={control}
                name='cardNumber'
                render={({ field: { value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={handleCardNumberChange}
                    placeholder='1234 5678 1234 5678'
                    keyboardType='numeric'
                    maxLength={19}
                    style={{
                      backgroundColor: "white",
                      borderWidth: 1,
                      borderColor: errors.cardNumber ? "#f87171" : "#d1d5db",
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      color: "#1f2937",
                      fontSize: 16,
                      fontFamily: "monospace",
                      minHeight: 56,
                    }}
                  />
                )}
              />
              {errors.cardNumber && (
                <Text style={{ color: "#ef4444", fontSize: 14, marginTop: 4 }}>
                  {errors.cardNumber.message}
                </Text>
              )}
            </View>

            {/* Expiry and CVV Row */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Expiry Date */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#6b7280",
                    fontWeight: "500",
                    marginBottom: 8,
                    fontSize: 14,
                  }}
                >
                  MM/YY
                </Text>
                <Controller
                  control={control}
                  name='expiryDate'
                  render={({ field: { value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={handleExpiryChange}
                      placeholder='MM/YY'
                      keyboardType='numeric'
                      maxLength={5}
                      style={{
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: errors.expiryDate ? "#f87171" : "#d1d5db",
                        borderRadius: 8,
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        color: "#1f2937",
                        fontSize: 16,
                        textAlign: "center",
                        minHeight: 56,
                      }}
                    />
                  )}
                />
                {errors.expiryDate && (
                  <Text
                    style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}
                  >
                    {errors.expiryDate.message}
                  </Text>
                )}
              </View>

              {/* CVV */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#6b7280",
                    fontWeight: "500",
                    marginBottom: 8,
                    fontSize: 14,
                  }}
                >
                  CVV
                </Text>
                <Controller
                  control={control}
                  name='cvv'
                  render={({ field: { value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={handleCVVChange}
                      placeholder='CVV'
                      keyboardType='numeric'
                      maxLength={cardType === "amex" ? 4 : 3}
                      secureTextEntry
                      style={{
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: errors.cvv ? "#f87171" : "#d1d5db",
                        borderRadius: 8,
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        color: "#1f2937",
                        fontSize: 16,
                        textAlign: "center",
                        minHeight: 56,
                      }}
                    />
                  )}
                />
                {errors.cvv && (
                  <Text
                    style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}
                  >
                    {errors.cvv.message}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={{
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 32,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              minHeight: 56,
            }}
            className='bg-primary'
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              {isLoading ? "Adding Card..." : "Update"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
