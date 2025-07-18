import React from "react";
import { View } from "react-native";
import { cn } from "@/utils/cn";
import { getCardShadow } from "@/utils/shadows";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadowLevel?: "sm" | "default" | "md" | "lg";
}

export function Card({
  children,
  className,
  shadowLevel = "default",
}: CardProps) {
  return (
    <View
      className={cn(
        "bg-white rounded-xl p-4 border border-gray-100",
        className
      )}
      style={getCardShadow(shadowLevel)}
    >
      {children}
    </View>
  );
}
