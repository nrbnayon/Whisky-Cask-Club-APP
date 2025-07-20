// app/(auth)/reset-password.tsx
import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SuccessModal } from "@/components/SuccessModal";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/utils/validationSchemas";
import { showToast } from "@/utils/toast";
import { useAppStore } from "@/store/useAppStore";

export default function ResetPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { otpVerified } = useAppStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Redirect if OTP not verified
  if (!otpVerified) {
    router.replace("/forgot-password");
    return null;
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      showToast("success", "Successfully", "Reset Password");
      setShowSuccessModal(true);
    } catch (error) {
      console.log("Reset password error::", error);
      showToast("error", "Failed to Reset", "Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Navigate to login
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <View className='flex-1 px-4'>
        {/* Header */}
        <View className='flex-row items-center pt-4 pb-8'>
          <TouchableOpacity onPress={() => router.back()} className='mr-2'>
            <ChevronLeft size={24} color='#1F2937' />
          </TouchableOpacity>
          <Text className='text-dark text-lg font-medium'>Forget Password</Text>
        </View>

        {/* Content */}
        <View className='flex-1 justify-center'>
          <Text className='text-dark text-xl font-semibold mb-8'>
            Create Your New password
          </Text>

          <Controller
            control={control}
            name='password'
            render={({ field: { onChange, value } }) => (
              <Input
                label='New Password'
                placeholder='Enter your Password'
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.password?.message}
                className='mb-4'
              />
            )}
          />

          <Controller
            control={control}
            name='confirmPassword'
            render={({ field: { onChange, value } }) => (
              <Input
                label='Re-type password'
                placeholder='Enter Re-Password'
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </View>

        {/* Bottom Button */}
        <View className='pb-8'>
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            className='w-full'
          >
            Create Now
          </Button>
        </View>
      </View>

      <SuccessModal
        visible={showSuccessModal}
        title='Your password has been reset successfully.'
        onClose={handleSuccessClose}
      />
    </SafeAreaView>
  );
}
