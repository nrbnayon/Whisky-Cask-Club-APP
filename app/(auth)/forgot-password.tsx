import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/utils/validationSchemas";
import { showToast } from "@/utils/toast";

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

        showToast(
        "success",
        "Reset Link Sent",
        "Check your email for password reset instructions."
      );
    } catch (error) {
      showToast("error", "Failed to Send", "Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* <StatusBar /> */}

      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center pt-4 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-primary-dark text-xl font-semibold">
            Forget Password
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center">
          <Text className="text-primary-dark text-base leading-6 mb-8">
            Select which contact details should we use to reset your password.
          </Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                placeholder="example@gmail.com"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            className="w-full bg-primary mt-8"
          >
            Continue
          </Button>
        </View>
      </View>

    </SafeAreaView>
  );
}
