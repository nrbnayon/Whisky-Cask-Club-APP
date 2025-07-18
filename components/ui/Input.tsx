import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { clsx } from "clsx";
import { getCardShadow, getFocusedShadow } from "@/utils/shadows";

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  className?: string;
  labelClassName?: string; // Added labelClassName prop
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  error,
  className,
  labelClassName, // Added labelClassName prop
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View className={clsx("mb-4", className)}>
      {label && (
        <Text
          className={clsx(
            "text-black font-semibold mb-2",
            labelClassName // Use labelClassName if provided, otherwise use default
          )}
        >
          {label}
        </Text>
      )}
      <View className="relative">
        {/* Shadow container */}
        <View
          className="w-full"
          style={[
            styles.inputContainer,
            isFocused ? getFocusedShadow() : getCardShadow("sm"),
            {
              borderColor: error
                ? "#EF4444" // error color
                : isFocused
                  ? "#b8860b" // primary color
                  : "#D1D5DB", // gray-300
            },
          ]}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={secureTextEntry && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={clsx(
              "w-full px-4 py-3 font-manrope text-base text-primary-dark",
              secureTextEntry ? "pr-12" : ""
            )}
            style={styles.input}
          />
        </View>
        {secureTextEntry && (
          <TouchableOpacity
            onPress={handleTogglePassword}
            className="absolute right-3 top-3"
          >
            {showPassword ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-error font-manrope text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 8,
    // Base shadow applied dynamically
  },
  input: {
    backgroundColor: "transparent",
    borderWidth: 0, // Remove border from input to avoid double borders
  },
});
