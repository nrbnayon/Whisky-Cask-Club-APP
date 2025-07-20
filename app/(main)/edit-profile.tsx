// app\(main)\edit-profile.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, LocationEdit as Edit3 } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppStore } from "@/store/useAppStore";
import { showToast } from "@/utils/toast";
import { Button } from "@/components/ui/Button";

const editProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName || user?.name?.split(" ")[0] || "",
      lastName: user?.lastName || user?.name?.split(" ")[1] || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update user profile
      updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
      });

      showToast(
        "success",
        "Profile Updated",
        "Your profile has been updated successfully"
      );
      // Navigate back to profile tab specifically
      router.navigate("/(main)/profile" as any);
    } catch (error) {
      console.error("Update profile error:", error);
      showToast("error", "Update Failed", "Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    // Navigate back to profile tab specifically
    router.navigate("/(main)/profile" as any);
  };

  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className='flex-row items-center p-5'>
          <TouchableOpacity onPress={handleGoBack} className='mr-2'>
            <ArrowLeft size={24} color='#374151' />
          </TouchableOpacity>
          <Text className='text-gray-800 text-xl font-medium'>
            My Information
          </Text>
        </View>

        <View className='p-5'>
          {/* Profile Picture */}
          <View className='items-center'>
            <View className='relative'>
              <Image
                source={{
                  uri:
                    user?.avatar ||
                    "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg",
                }}
                className='w-32 h-32 rounded-full'
                resizeMode='cover'
              />
              <TouchableOpacity className='absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full items-center justify-center'>
                <Edit3 size={16} color='white' />
              </TouchableOpacity>
            </View>
            <Text className='text-2xl font-bold text-gray-800 mt-4 mb-1'>
              Daniel Austin
            </Text>
            <Text className='text-primary text-lg'>
              daniel_austin@yourdomain.com
            </Text>
          </View>

          <View className="px-5 border border-gray-200 mb-5 mt-5"></View>
          {/* Form */}
          <View style={{ gap: 16 }}>
            <View>
              <Controller
                control={control}
                name='firstName'
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder='First name'
                    className='bg-white border border-gray-200 rounded-md px-4 py-4 text-gray-800 text-lg'
                  />
                )}
              />
              {errors.firstName && (
                <Text className='text-red-500 text-sm mt-1'>
                  {errors.firstName.message}
                </Text>
              )}
            </View>

            <View>
              <Controller
                control={control}
                name='lastName'
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder='Last name'
                    className='bg-white border border-gray-200 rounded-md px-4 py-4 text-gray-800 text-lg'
                  />
                )}
              />
              {errors.lastName && (
                <Text className='text-red-500 text-sm mt-1'>
                  {errors.lastName.message}
                </Text>
              )}
            </View>

            <View>
              <Controller
                control={control}
                name='email'
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder='johnmax@gmail.com'
                    keyboardType='email-address'
                    autoCapitalize='none'
                    className='bg-white border border-gray-200 rounded-md px-4 py-4 text-gray-800 text-lg'
                  />
                )}
              />
              {errors.email && (
                <Text className='text-red-500 text-sm mt-1'>
                  {errors.email.message}
                </Text>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            size='lg'
            className={`items-center mt-10 ${
              isLoading ? "bg-gray-300" : "bg-primary"
            }`}
          >
            <Text className='text-white text-lg font-semibold'>
              {isLoading ? "Updating..." : "Next"}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
