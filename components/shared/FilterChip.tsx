import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { cn } from "@/utils/cn";

interface FilterChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  className?: string;
}

export function FilterChip({
  label,
  active = false,
  onPress,
  className,
}: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "px-4 py-2 rounded-full border",
        active ? "bg-primary border-primary" : "bg-white border-gray-200",
        className
      )}
    >
      <Text
        className={cn(
          "font-manrope font-medium text-sm",
          active ? "text-white" : "text-gray-600"
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
