// app/(auth)/verify-otp.tsx
import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/utils/toast";
import { useAppStore } from "@/store/useAppStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const { forgotPasswordEmail, setOtpVerified } = useAppStore();

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const intervalRef = useRef<number | null>(null);

  // Timer effect with persistence
  useEffect(() => {
    const startTimer = async () => {
      try {
        const currentTime = Date.now();
        const savedStartTime = await AsyncStorage.getItem("otp_start_time");

        let startTime: number;
        if (savedStartTime) {
          startTime = parseInt(savedStartTime, 10);
        } else {
          startTime = currentTime;
          await AsyncStorage.setItem("otp_start_time", startTime.toString());
        }

        const elapsed = Math.floor((currentTime - startTime) / 1000);
        const remainingTime = Math.max(0, 120 - elapsed);

        setTimer(remainingTime);

        if (remainingTime === 0) {
          setCanResend(true);
          return;
        }

        setCanResend(false);

        // Clear any existing interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
          const now = Date.now();
          const currentElapsed = Math.floor((now - startTime) / 1000);
          const currentRemaining = Math.max(0, 120 - currentElapsed);

          setTimer(currentRemaining);

          if (currentRemaining <= 0) {
            setCanResend(true);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }, 1000);
      } catch (error) {
        console.error("Timer initialization error:", error);
      }
    };

    startTimer();

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Reset timer with new start time
      const newStartTime = Date.now();
      await AsyncStorage.setItem("otp_start_time", newStartTime.toString());
      setTimer(120);
      setCanResend(false);

      // Start new timer
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - newStartTime) / 1000);
        const remaining = Math.max(0, 120 - elapsed);

        setTimer(remaining);

        if (remaining <= 0) {
          setCanResend(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 1000);

      showToast(
        "success",
        "OTP Sent",
        "A new verification code has been sent to your email."
      );
    } catch (error) {
      console.error("Resend OTP error:", error);
      showToast("error", "Failed to resend", "Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 4) {
      showToast(
        "error",
        "Invalid OTP",
        "Please enter the complete 4-digit code."
      );
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo purposes, accept any 4-digit code
      setOtpVerified(true);
      // Clear the timer storage and interval
      await AsyncStorage.removeItem("otp_start_time");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Navigate to reset password
      router.push("/reset-password");
    } catch (error) {
      console.error("Verify OTP error:", error);
      showToast(
        "error",
        "Invalid OTP",
        "Please check your code and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
          <Text className='text-dark text-base leading-6 mb-4'>
            Code has been send to{" "}
            <Text className='text-primary font-medium'>
              {forgotPasswordEmail || "infogma@gmail.com"}
            </Text>
          </Text>

          {/* OTP Input */}
          <View className='flex-row justify-between mb-8 mt-8'>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                className='w-16 h-16 border border-gray-300 rounded-lg text-center text-2xl font-bold bg-white'
                maxLength={1}
                keyboardType='numeric'
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Resend Timer */}
          <View className='items-center mb-8'>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
                <Text className='text-primary font-medium text-base'>
                  Resend Code
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className='text-gray-500 text-base'>
                Resend Code in{" "}
                <Text className='text-primary'>{formatTime(timer)}</Text>
              </Text>
            )}
          </View>
        </View>

        {/* Bottom Button */}
        <View className='pb-8'>
          <Button
            onPress={handleVerifyOTP}
            loading={isLoading}
            className='w-full'
          >
            Verify
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
