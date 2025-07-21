import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Plus } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showToast } from "@/utils/toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const cashOutSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a valid positive number",
    })
    .refine((val) => Number(val) <= 100, {
      message: "Amount cannot exceed your balance",
    }),
});

type CashOutFormData = z.infer<typeof cashOutSchema>;

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  brand?: string;
  last4?: string;
  cardHolder?: string;
}

export default function CashOutScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [userBalance] = useState(100.0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CashOutFormData>({
    resolver: zodResolver(cashOutSchema),
    defaultValues: {
      amount: "",
    },
  });

  const watchedAmount = watch("amount");

  useEffect(() => {
    // Load saved payment methods from storage or API
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      // In a real app, this would fetch from your backend/Stripe
      const savedMethods = [
        {
          id: "card_1",
          type: "card" as const,
          brand: "visa",
          last4: "4242",
          cardHolder: "John Max",
        },
      ];
      setPaymentMethods(savedMethods);
      if (savedMethods.length > 0) {
        setSelectedPaymentMethod(savedMethods[0].id);
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  const onSubmit = async (data: CashOutFormData) => {
    if (!selectedPaymentMethod) {
      showToast(
        "error",
        "Payment Method Required",
        "Please select a payment method"
      );
      return;
    }

    setIsLoading(true);
    try {
      // Create payout with Stripe
      const payoutData = {
        amount: Math.round(Number(data.amount) * 100), // Convert to cents
        currency: "usd",
        paymentMethodId: selectedPaymentMethod,
      };

      // Simulate Stripe API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, you would call your backend:
      // const response = await stripeService.createPayout(payoutData);

      showToast(
        "success",
        "Payout Requested",
        `$${data.amount} payout has been initiated and will arrive in 1-2 business days`
      );

      router.back();
    } catch (error) {
      console.error("Payout error:", error);
      showToast(
        "error",
        "Payout Failed",
        "Unable to process payout. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.navigate("/(main)/profile" as any);
  };

  const handleAddCard = () => {
    router.navigate("/(main)/payment/add-account-card" as any);
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = selectedPaymentMethod === method.id;

    if (method.type === "card") {
      return (
        <TouchableOpacity
          key={method.id}
          onPress={() => setSelectedPaymentMethod(method.id)}
          className={`bg-white rounded-md border p-4 flex-row items-center mb-3 ${
            isSelected ? "border-primary" : "border-gray-200"
          }`}
        >
          <View className='w-12 h-8 bg-blue-600 rounded-md mr-3 flex-row items-center justify-center'>
            <Text className='text-white text-xs font-bold uppercase'>
              {method.brand}
            </Text>
          </View>
          <View className='flex-1'>
            <Text className='text-gray-900 text-base font-medium'>
              {method.brand?.toUpperCase()} Card
            </Text>
            <Text className='text-gray-500 text-sm'>
              •••• •••• •••• {method.last4}
            </Text>
          </View>
          {isSelected && (
            <View className='w-5 h-5 bg-blue-500 rounded-md items-center justify-center'>
              <Text className='text-white text-xs'>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={method.id}
        onPress={() => setSelectedPaymentMethod(method.id)}
        className={`bg-white rounded-md border-2 p-4 flex-row items-center mb-3 ${
          isSelected ? "border-blue-500" : "border-gray-200"
        }`}
      >
        <View className='w-12 h-8 bg-gray-600 rounded-md mr-3 flex-row items-center justify-center'>
          <Text className='text-white text-xs font-bold'>BANK</Text>
        </View>
        <View className='flex-1'>
          <Text className='text-gray-900 text-base font-medium'>
            Bank Account
          </Text>
          <Text className='text-gray-500 text-sm'>•••• {method.last4}</Text>
        </View>
        {isSelected && (
          <View className='w-5 h-5 bg-blue-500 rounded-full items-center justify-center'>
            <Text className='text-white text-xs'>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <ScrollView showsVerticalScrollIndicator={false} className='flex-1'>
        {/* Header */}
        <View className='flex-row items-center p-5'>
          <TouchableOpacity onPress={handleGoBack} className='mr-2'>
            <ArrowLeft size={24} color='#374151' />
          </TouchableOpacity>
          <Text className='text-gray-900 text-xl font-semibold'>Cash Out</Text>
        </View>

        <View className='px-5 pt-6'>
          {/* App Balance Section */}
          <View className='bg-white rounded-md p-5 mb-6'>
            <Text className='text-gray-900 text-lg font-semibold mb-4'>
              Available Balance
            </Text>

            <View className='flex-row items-center'>
              {/* User Avatar */}
              <View className='w-12 h-12 bg-gray-300 rounded-full mr-4 overflow-hidden'>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
                  }}
                  className='w-full h-full'
                  resizeMode='cover'
                />
              </View>

              <View className='flex-1'>
                <Text className='text-gray-900 text-lg font-medium mb-1'>
                  John Max
                </Text>
                <Text className='text-green-600 text-2xl font-bold'>
                  ${userBalance.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Withdraw Amount Section */}
          <View className='bg-white rounded-md p-5 mb-6'>
            <Controller
              control={control}
              name='amount'
              render={({ field: { onChange, value } }) => (
                <Input
                  label='Withdraw Amount'
                  placeholder='Enter amount $'
                  value={value}
                  onChangeText={onChange}
                  keyboardType='numeric'
                  error={errors.amount?.message}
                  className='mb-2'
                  inputClassName='py-5 text-lg'
                  labelClassName='text-lg font-semibold mb-3'
                />
              )}
            />

            {watchedAmount && !errors.amount && (
              <View className='bg-blue-50 p-3 rounded-md'>
                <Text className='text-blue-800 text-sm'>
                  You&apos;ll receive ${watchedAmount} in 1-2 business days
                </Text>
              </View>
            )}
          </View>

          {/* Payment Methods Section */}
          <View className='bg-white rounded-md p-5 mb-6'>
            <Text className='text-gray-900 text-lg font-semibold mb-4'>
              Payment Method
            </Text>

            {paymentMethods.length > 0 ? (
              <View className='mb-4'>
                {paymentMethods.map(renderPaymentMethod)}
              </View>
            ) : (
              <View className='py-8 items-center'>
                <Text className='text-gray-500 mb-4'>
                  No payment methods added
                </Text>
              </View>
            )}

            {/* Add Payment Method Button */}
            <TouchableOpacity
              className='flex-row items-center py-4 px-3 border-2 border-dashed border-gray-300 rounded-md'
              onPress={handleAddCard}
            >
              <View className='w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3'>
                <Plus size={20} color='#3B82F6' strokeWidth={2} />
              </View>
              <Text className='text-blue-600 text-base font-medium'>
                Add New Payment Method
              </Text>
            </TouchableOpacity>
          </View>

          {/* Important Note */}
          <View className='bg-amber-50 border border-amber-200 rounded-md p-4 mb-6'>
            <Text className='text-amber-800 text-sm font-medium mb-1'>
              Important Note
            </Text>
            <Text className='text-amber-700 text-sm'>
              Payouts typically arrive within 1-2 business days. Processing fees
              may apply based on your payment method.
            </Text>
          </View>
        </View>

        {/* Bottom Button */}
        <View className='px-5 pb-8'>
          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading || !selectedPaymentMethod || !watchedAmount}
            size='lg'
            className={`py-4 ${
              isLoading || !selectedPaymentMethod || !watchedAmount
                ? "bg-gray-300"
                : "bg-primary"
            }`}
          >
            {isLoading ? "Processing Payout..." : "Request Payout"}
          </Button>

          {!selectedPaymentMethod && paymentMethods.length === 0 && (
            <Text className='text-center text-gray-500 text-sm mt-2'>
              Add a payment method to continue
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// import React, { useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter } from "expo-router";
// import { ArrowLeft, Plus } from "lucide-react-native";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { showToast } from "@/utils/toast";
// import { Input } from "@/components/ui/Input";
// import { Button } from "@/components/ui/Button";

// const cashOutSchema = z.object({
//   amount: z.string().min(1, "Amount is required"),
// });

// type CashOutFormData = z.infer<typeof cashOutSchema>;

// export default function CashOutScreen() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("visa");

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<CashOutFormData>({
//     resolver: zodResolver(cashOutSchema),
//     defaultValues: {
//       amount: "",
//     },
//   });

//   const onSubmit = async (data: CashOutFormData) => {
//     setIsLoading(true);
//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 2000));

//       showToast(
//         "success",
//         "Cash Out Successful",
//         `$${data.amount} has been requested for payout`
//       );
//       router.back();
//     } catch (error) {
//       console.error("Cash out error:", error);
//       showToast("error", "Failed to process", "Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoBack = () => {
//     router.navigate("/(main)/profile" as any);
//   };

//   return (
//     <SafeAreaView className='flex-1 bg-surface'>
//       <ScrollView showsVerticalScrollIndicator={false} className='flex-1'>
//         {/* Header */}
//         <View className='flex-row items-center p-5'>
//           <TouchableOpacity onPress={handleGoBack} className='mr-2'>
//             <ArrowLeft size={24} color='#374151' />
//           </TouchableOpacity>
//           <Text className='text-gray-900 text-xl font-semibold'>Cash Out</Text>
//         </View>

//         <View className='px-5'>
//           {/* App Balance Section */}
//           <Text className='text-gray-900 text-lg font-medium mb-4'>
//             App balance
//           </Text>

//           <View className='flex-row items-center mb-8'>
//             {/* User Avatar */}
//             <View className='w-12 h-12 bg-gray-300 rounded-full mr-4 overflow-hidden'>
//               <Image
//                 source={{
//                   uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
//                 }}
//                 className='w-full h-full'
//                 resizeMode='cover'
//               />
//             </View>

//             <View>
//               <Text className='text-gray-900 text-lg mb-1'>John Max</Text>
//               <Text className='text-gray-600 text-base'>$100.00</Text>
//             </View>
//           </View>

//           {/* Withdraw Amount Section */}
//           <Controller
//             control={control}
//             name='amount'
//             render={({ field: { onChange, value } }) => (
//               <Input
//                 label='Withdraw Amount'
//                 placeholder='$$$'
//                 value={value}
//                 onChangeText={onChange}
//                 keyboardType='numeric'
//                 error={errors.amount?.message}
//                 className='mb-8 bg-surface'
//                 inputClassName='py-5'
//                 labelClassName='text-lg font-medium mb-4'
//               />
//             )}
//           />

//           {/* Payment Info Section */}
//           <Text className='text-gray-900 text-lg font-medium mb-4'>
//             Payment Info
//           </Text>

//           <View style={{ gap: 16 }}>
//             {/* Visa Card Option */}
//             <TouchableOpacity
//               onPress={() => setSelectedPaymentMethod("visa")}
//               className={`bg-white rounded-md border p-4 flex-row items-center ${
//                 selectedPaymentMethod === "visa"
//                   ? "border-blue-500"
//                   : "border-gray-200"
//               }`}
//             >
//               <View className='w-10 h-6 bg-blue-500 rounded mr-3 flex-row items-center justify-center'>
//                 <Text className='text-white text-xs font-bold'>VISA</Text>
//               </View>
//               <Text className='text-gray-900 text-base font-medium flex-1'>
//                 Visa Card
//               </Text>
//             </TouchableOpacity>

//             {/* Add Bank Account Option */}
//             <TouchableOpacity
//               className='flex-row items-center'
//               onPress={() => {
//                 // Navigate to add bank account screen
//               }}
//             >
//               <View className='w-6 h-6 mr-3 flex-row items-center justify-center'>
//                 <Plus size={20} color='#374151' strokeWidth={2} />
//               </View>
//               <Text className='text-gray-900 text-base font-medium flex-1'>
//                 Bank Account
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Bottom Button */}
//         <View className='px-5 mt-10'>
//           <Button
//             onPress={handleSubmit(onSubmit)}
//             disabled={isLoading}
//             size='lg'
//             // textClassName='text-lg'
//           >
//             {isLoading ? "Processing..." : "Request Payout"}
//           </Button>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
