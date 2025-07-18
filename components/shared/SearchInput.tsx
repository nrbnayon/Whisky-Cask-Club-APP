import React from "react";
import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";
import { getCardShadow } from "@/utils/shadows";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder,
  value,
  onChangeText,
  className,
}: SearchInputProps) {
  return (
    <View
      className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 ${className}`}
      style={getCardShadow("sm")}
    >
      <Search size={20} color="#9CA3AF" />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        className="flex-1 ml-3 text-gray-800 font-manrope"
      />
    </View>
  );
}
