// app\(auth)\sign-in.tsx
import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signInSchema, type SignInFormData } from "@/utils/validationSchemas";
import { showToast } from "@/utils/toast";
// import { useAppStore } from "@/store/useAppStore";

export default function SignInScreen() {
  const [isLoading, setIsLoading] = useState(false);
  // const { setUser } = useAppStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock user data
      // setUser({
      //   id: "1",
      //   name: "John Doe",
      //   email: data.email,
      // });

      showToast("success", "Welcome back!", "Successfully signed in.");
      router.replace("/(tabs)");
    } catch (error) {
      showToast("error", "Sign In Failed", "Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <View className='flex-1 px-6'>
        {/* Header */}
        <View className='flex-row items-center pt-4 pb-8'>
          <TouchableOpacity onPress={() => router.back()} className='mr-4'>
            <ChevronLeft size={24} color='#1F2937' />
          </TouchableOpacity>
          <Text className='text-primary-dark text-xl font-semibold font-manrope'>
            Sign In Now
          </Text>
        </View>

        {/* Form */}
        <View className='flex-1 justify-center'>
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
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            className='self-end mb-8'
          >
            <Text className='text-primary font-manrope font-medium'>
              Forgot password?
            </Text>
          </TouchableOpacity>

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            className='w-full mb-8'
          >
            Sign In
          </Button>

          {/* Social Login */}
          <View className='flex-row items-center justify-center mb-6'>
            <View className='flex-1 h-px bg-gray-300' />
            <Text className='mx-4 text-gray-500 font-manrope'>OR</Text>
            <View className='flex-1 h-px bg-gray-300' />
          </View>

          <View className='flex-row justify-center space-x-4 mb-8'>
            <TouchableOpacity className='w-12 h-12 rounded-full bg-gray-100 items-center justify-center'>
              <Text className='text-2xl'>G</Text>
            </TouchableOpacity>
            <TouchableOpacity className='w-12 h-12 rounded-full bg-gray-100 items-center justify-center'>
              <Text className='text-2xl'>🍎</Text>
            </TouchableOpacity>
          </View>

          <View className='flex-row justify-center'>
            <Text className='text-gray-600 font-manrope'>
              Don't have an Account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
              <Text className='text-primary font-manrope font-medium'>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
