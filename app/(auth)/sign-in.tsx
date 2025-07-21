// app\(auth)\sign-in.tsx
import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signInSchema, type SignInFormData } from "@/utils/validationSchemas";
import { showToast } from "@/utils/toast";

// Import SVG icons as components
import AppleIcon from "@/assets/images/apple.svg";
import GoogleIcon from "@/assets/images/google.svg";
import { useAppStore } from "@/store/useAppStore";

// Dev mode check - you can also use Constants.expoConfig.extra.isDev or similar
const __DEV__ = process.env.NODE_ENV === "development";

export default function SignInScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword] = useState(false);
  const { setUser } = useAppStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: __DEV__ ? "dev@example.com" : "",
      password: __DEV__ ? "password123" : "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock user data
      setUser({
        id: "1",
        name: "Nayon",
        email: data.email,
      });

      showToast("success", "Welcome back!", "Successfully signed in.");
      router.replace("/(main)" as any);
    } catch (error) {
      console.error("Sign In Failed:", error);
      showToast("error", "Sign In Failed", "Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <View className='flex-1 p-5'>
        {/* Form */}
        <View className='flex-1 justify-center'>
          <Text className='text-black text-3xl font-semibold mb-8'>
            Sign In Now
          </Text>
          {__DEV__ && (
            <View className='mb-4 p-3 bg-yellow-100 rounded-md'>
              <Text className='text-xs text-yellow-800'>
                🚧 DEV MODE: Default credentials loaded
              </Text>
            </View>
          )}
          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, value } }) => (
              <View className='mb-4'>
                <Text className='text-black font-semibold mb-2'>Email</Text>
                <Input
                  placeholder='example@gmail.com'
                  value={value}
                  onChangeText={onChange}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  error={errors.email?.message}
                />
              </View>
            )}
          />

          {/* Custom Password Input */}
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

          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            className='self-end mb-6'
          >
            <Text className='text-primary font-manrope font-medium'>
              Forgot password?
            </Text>
          </TouchableOpacity>

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            className='w-full mb-5'
            size='lg'
          >
            Sign In
          </Button>

          {/* Social Login */}
          <View className='flex-row justify-center items-center mb-8'>
            <TouchableOpacity>
              <GoogleIcon width={40} height={40} />
            </TouchableOpacity>
            <Text className='text-gray-400 font-manrope text-sm mx-2'>OR</Text>
            <TouchableOpacity>
              <AppleIcon width={40} height={40} />
            </TouchableOpacity>
          </View>

          <View className='flex-row justify-center'>
            <Text className='text-gray-600 font-manrope'>
              Don&apos;t have an Account?{" "}
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

// // app\(auth)\sign-in.tsx  --- corrected file
// import { useState } from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { signInSchema, type SignInFormData } from "@/utils/validationSchemas";
// import { showToast } from "@/utils/toast";

// // Import SVG icons as components
// import AppleIcon from "@/assets/images/apple.svg";
// import GoogleIcon from "@/assets/images/google.svg";
// import { useAppStore } from "@/store/useAppStore";

// export default function SignInScreen() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword] = useState(false);
//   const { setUser } = useAppStore();

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<SignInFormData>({
//     resolver: zodResolver(signInSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const onSubmit = async (data: SignInFormData) => {
//     setIsLoading(true);
//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 2000));

//       // Mock user data
//       setUser({
//         id: "1",
//         name: "Nayon",
//         email: data.email,
//       });

//       showToast("success", "Welcome back!", "Successfully signed in.");
//       router.replace("/(main)" as any);
//     } catch (error) {
//       console.error("Sign In Failed:", error);
//       showToast("error", "Sign In Failed", "Please check your credentials.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-surface">
//       <View className="flex-1 px-6">
//         {/* Form */}
//         <View className="flex-1 justify-center">
//           <Text className="text-black text-3xl font-semibold mb-8">
//             Sign In Now
//           </Text>
//           <Controller
//             control={control}
//             name="email"
//             render={({ field: { onChange, value } }) => (
//               <View className="mb-4">
//                 <Text className="text-black font-semibold mb-2">Email</Text>
//                 <Input
//                   placeholder="example@gmail.com"
//                   value={value}
//                   onChangeText={onChange}
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   error={errors.email?.message}
//                 />
//               </View>
//             )}
//           />

//           {/* Custom Password Input */}
//           <Controller
//             control={control}
//             name="password"
//             render={({ field: { onChange, value } }) => (
//               <Input
//                 label="Password"
//                 placeholder="Enter your Password"
//                 value={value}
//                 onChangeText={onChange}
//                 secureTextEntry={!showPassword}
//                 error={errors.password?.message}
//               />
//             )}
//           />

//           <TouchableOpacity
//             onPress={() => router.push("/(auth)/forgot-password")}
//             className="self-end mb-6"
//           >
//             <Text className="text-primary font-manrope font-medium">
//               Forgot password?
//             </Text>
//           </TouchableOpacity>

//           <Button
//             onPress={handleSubmit(onSubmit)}
//             loading={isLoading}
//             className="w-full mb-5"
//             size="lg"
//           >
//             Sign In
//           </Button>

//           {/* Social Login */}
//           <View className="flex-row justify-center items-center mb-8">
//             <TouchableOpacity>
//               <GoogleIcon width={40} height={40} />
//             </TouchableOpacity>
//             <Text className="text-gray-400 font-manrope text-sm mx-2">OR</Text>
//             <TouchableOpacity>
//               <AppleIcon width={40} height={40} />
//             </TouchableOpacity>
//           </View>

//           <View className="flex-row justify-center">
//             <Text className="text-gray-600 font-manrope">
//               Don&apos;t have an Account?{" "}
//             </Text>
//             <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
//               <Text className="text-primary font-manrope font-medium">
//                 Sign Up
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }
