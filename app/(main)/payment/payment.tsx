import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showToast } from "@/utils/toast";

const paymentSchema = z.object({
  cardHolder: z.string().min(1, "Card holder name is required"),
  cardNumber: z.string().min(16, "Card number must be 16 digits"),
  expiryMonth: z.string().min(2, "MM required"),
  expiryYear: z.string().min(2, "YY required"),
  cvv: z.string().min(3, "CVV required"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardHolder: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      showToast("success", "Card Added", "Payment method added successfully");
      router.back();
    } catch (error) {
      console.error("Payment error:", error);
      showToast("error", "Failed to add card", "Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className='flex-row items-center px-5 py-4'>
          <TouchableOpacity onPress={() => router.back()} className='mr-3'>
            <ArrowLeft size={24} color='#374151' />
          </TouchableOpacity>
          <Text className='text-gray-800 text-xl font-medium'>Add Card</Text>
        </View>

        <View className='px-5 pb-4'>
          {/* Credit Card Preview */}
          <View className='bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 mb-8 relative overflow-hidden'>
            {/* Card Background Pattern */}
            <View className='absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16' />
            <View className='absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12' />

            {/* Card Content */}
            <View className='flex-row justify-between items-start mb-6'>
              <Text className='text-white font-semibold text-lg'>
                BANK NAME
              </Text>
              <Text className='text-white font-semibold'>CARD NAME</Text>
            </View>

            {/* Chip */}
            <View className='w-12 h-9 bg-yellow-400 rounded mb-4'>
              <View className='w-8 h-6 bg-yellow-500 rounded m-1' />
            </View>

            {/* Card Number */}
            <Text className='text-white text-xl font-mono tracking-widest mb-4'>
              1234 5678 1234 5678
            </Text>

            {/* Card Details */}
            <View className='flex-row justify-between items-end'>
              <View>
                <Text className='text-white text-xs opacity-80'>01/23</Text>
                <Text className='text-white text-xs opacity-80'>03/27</Text>
                <Text className='text-white font-semibold'>
                  CARDHOLDER NAME
                </Text>
              </View>

              {/* Mastercard Logo */}
              <View className='flex-row'>
                <View className='w-8 h-8 bg-red-500 rounded-full opacity-80' />
                <View className='w-8 h-8 bg-yellow-500 rounded-full opacity-80 -ml-3' />
              </View>
            </View>

            {/* Contactless Symbol */}
            <View className='absolute top-6 right-6'>
              <View className='w-6 h-6 border-2 border-white rounded-full opacity-60' />
              <View className='w-4 h-4 border-2 border-white rounded-full opacity-60 absolute top-1 left-1' />
              <View className='w-2 h-2 border-2 border-white rounded-full opacity-60 absolute top-2 left-2' />
            </View>
          </View>

          {/* Form */}
          <View className='space-y-4'>
            <View>
              <Controller
                control={control}
                name='cardHolder'
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder='Card Holder'
                    className='bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800'
                  />
                )}
              />
              {errors.cardHolder && (
                <Text className='text-red-500 text-sm mt-1'>
                  {errors.cardHolder.message}
                </Text>
              )}
            </View>

            <View>
              <Controller
                control={control}
                name='cardNumber'
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder='Card Number'
                    keyboardType='numeric'
                    maxLength={16}
                    className='bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800'
                  />
                )}
              />
              {errors.cardNumber && (
                <Text className='text-red-500 text-sm mt-1'>
                  {errors.cardNumber.message}
                </Text>
              )}
            </View>

            <View className='flex-row space-x-3'>
              <View className='flex-1'>
                <Controller
                  control={control}
                  name='expiryMonth'
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder='MM/YY'
                      keyboardType='numeric'
                      maxLength={2}
                      className='bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800'
                    />
                  )}
                />
                {errors.expiryMonth && (
                  <Text className='text-red-500 text-sm mt-1'>
                    {errors.expiryMonth.message}
                  </Text>
                )}
              </View>

              <View className='flex-1'>
                <Controller
                  control={control}
                  name='cvv'
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder='CVV'
                      keyboardType='numeric'
                      maxLength={3}
                      secureTextEntry
                      className='bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800'
                    />
                  )}
                />
                {errors.cvv && (
                  <Text className='text-red-500 text-sm mt-1'>
                    {errors.cvv.message}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className={`rounded-xl py-4 items-center mt-8 ${
              isLoading ? "bg-gray-300" : "bg-primary"
            }`}
          >
            <Text className='text-white text-lg font-semibold'>
              {isLoading ? "Adding..." : "Update"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
