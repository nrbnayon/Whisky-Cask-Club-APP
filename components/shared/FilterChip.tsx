import React from "react";
import { TouchableOpacity, Text, View, Image } from "react-native";
import { BottleWine, Star, Filter } from "lucide-react-native";
import { cn } from "@/utils/cn";

interface FilterChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  className?: string;
  isIconShow?: boolean;
}

export function FilterChip({
  label,
  active = false,
  onPress,
  className,
  isIconShow = false,
}: FilterChipProps) {
  const renderIcon = () => {
    if (!isIconShow) return null;

    const iconSize = 16;
    const iconColor = active ? "#FFFFFF" : "#6B7280";

    switch (label.toLowerCase()) {
      case "all":
        return (
          <Filter
            size={iconSize}
            color={iconColor}
            style={{ marginRight: 4 }}
          />
        );
      case "cask":
        return (
          <Image
            source={require("@/assets/images/cask-bottle.png")}
            style={{
              width: iconSize,
              height: iconSize,
              tintColor: iconColor,
              marginRight: 4,
            }}
            resizeMode='contain'
          />
        );
      case "bottle":
        return (
          <BottleWine
            size={iconSize}
            color={iconColor}
            style={{ marginRight: 4 }}
          />
        );
      case "experience":
        return (
          <Star size={iconSize} color={iconColor} style={{ marginRight: 4 }} />
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "px-4 py-2 rounded-full mr-2",
        active
          ? "border bg-primary border-primary"
          : "bg-white border border-gray-200",
        className
      )}
    >
      <View className='flex-row items-center justify-center'>
        {renderIcon()}
        <Text
          className={cn(
            "font-manrope font-medium text-sm",
            active ? "text-white" : "text-gray-600"
          )}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
