import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { clsx } from "clsx";
import { getCardShadow } from "@/utils/shadows";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "lg",
  loading = false,
  disabled = false,
  className,
  textClassName, // Added prop for Text-specific styling
}: ButtonProps) {
  const baseStyles =
    "flex-row items-center justify-center rounded-[8px] font-medium";

  const variantStyles = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "bg-transparent border border-primary",
    ghost: "bg-transparent",
  };

  const sizeStyles = {
    sm: "px-3 py-2", // Removed text-sm to avoid conflict
    md: "px-4 py-3", // Removed text-base
    lg: "px-6 py-4", // Removed text-lg
  };

  const textSizeStyles = {
    sm: "text-md",
    md: "text-base",
    lg: "text-lg",
  };

  const textColorStyles = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-primary",
    ghost: "text-primary",
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && "opacity-50",
        className
      )}
      style={[
        variant === "primary" || variant === "secondary"
          ? getCardShadow("sm")
          : {},
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost" ? "#b8860b" : "#ffffff"
          }
          size='small'
        />
      ) : (
        <Text
          className={clsx(
            "font-manrope font-semibold",
            textColorStyles[variant],
            textSizeStyles[size],
            textClassName
          )}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
