// app\(auth)\sign-up.tsx
import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { signUpSchema, type SignUpFormData } from "@/utils/validationSchemas";
import { showToast } from "@/utils/toast";
import { useAppStore } from "@/store/useAppStore";

export default function SignUpScreen() {
  const [showPassword] = useState(false);
  const [showConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAppStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
      agreeToPrivacyPolicy: false,
    },
  });

  const agreeToPrivacyPolicy = watch("agreeToPrivacyPolicy");

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful registration
      setUser({
        id: "1",
        name: data.name,
        email: data.email,
      });

      showToast("success", "Account Created!", "Welcome to Whisky Cask Club.");
      router.replace("/(main)" as any);
    } catch (error) {
      console.error("Registration failed:", error);
      showToast("error", "Registration Failed", "Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove custom password toggle since Input component likely has its own

  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <ScrollView className='flex-1 px-4' showsVerticalScrollIndicator={false}>
        <View className='py-6'>
          <Text className='text-black text-3xl font-semibold mb-8'>
            Create a new{"\n"}Account
          </Text>

          <View className='space-y-6'>
            <Controller
              control={control}
              name='name'
              render={({ field: { onChange, value } }) => (
                <Input
                  label='Name'
                  placeholder='Enter your Name'
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name='email'
              render={({ field: { onChange, value } }) => (
                <Input
                  label='Email'
                  placeholder='example@gmail.com'
                  value={value}
                  onChangeText={onChange}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name='password'
              render={({ field: { onChange, value } }) => (
                <Input
                  label='Password'
                  placeholder='Enter your Password'
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showPassword}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name='confirmPassword'
              render={({ field: { onChange, value } }) => (
                <Input
                  label='Confirm Password'
                  placeholder='Confirm your Password'
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showConfirmPassword}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Controller
              control={control}
              name='referralCode'
              render={({ field: { onChange, value } }) => (
                <Input
                  label='Referral Code (Optional)'
                  placeholder='Enter your referral code'
                  value={value}
                  onChangeText={onChange}
                  error={errors.referralCode?.message}
                />
              )}
            />

            <Controller
              control={control}
              name='agreeToPrivacyPolicy'
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  checked={value}
                  onPress={() => onChange(!value)}
                  label='I agree to the privacy policy.'
                  error={errors.agreeToPrivacyPolicy?.message}
                />
              )}
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={!agreeToPrivacyPolicy}
              size='lg'
              className='w-full bg-primary mt-6 '
            >
              Sign Up
            </Button>

            <View className='items-center mt-6 pb-8'>
              <Text className='text-primary-dark text-base'>
                Already have an Account?{" "}
                <Text
                  className='text-primary font-semibold'
                  onPress={() => router.push("/(auth)/sign-in")}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
