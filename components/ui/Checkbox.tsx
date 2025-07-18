import { TouchableOpacity, View, Text } from "react-native";
import { Check } from "lucide-react-native";
import { cn } from "@/utils/cn";

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  error?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onPress,
  label,
  error,
  className,
}: CheckboxProps) {
  return (
    <View className={cn("mb-4", className)}>
      <TouchableOpacity onPress={onPress} className="flex-row items-center">
        <View
          className={cn(
            "w-5 h-5 border-2 rounded mr-3 items-center justify-center",
            checked ? "bg-primary border-primary" : "border-input bg-card"
          )}
        >
          {checked && <Check size={12} color="white" />}
        </View>
        {label && (
          <Text className="text-primary-dark text-base flex-1">{label}</Text>
        )}
      </TouchableOpacity>
      {error && <Text className="text-error text-sm mt-1 ml-8">{error}</Text>}
    </View>
  );
}
