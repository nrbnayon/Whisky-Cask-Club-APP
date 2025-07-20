// components/shared/NotificationCard.tsx
import { View, Text } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { getCardShadow } from "@/utils/shadows";

interface NotificationCardProps {
  icon?: LucideIcon | null;
  iconColor: string;
  iconBgColor: string;
  title: string;
  message: string;
  time: string;
  isFontAwesome?: boolean;
  fontAwesomeName?: string;
}

export function NotificationCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  message,
  time,
  isFontAwesome = false,
  fontAwesomeName,
}: NotificationCardProps) {
  return (
    <View
      className='bg-white rounded-md p-4 mb-3 border border-gray-100'
      style={getCardShadow("sm")}
    >
      <View className='flex-row'>
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${iconBgColor}`}
        >
          {isFontAwesome && fontAwesomeName ? (
            <FontAwesome5
              name={fontAwesomeName as any}
              size={20}
              color={iconColor}
            />
          ) : (
            Icon && <Icon size={20} color={iconColor} />
          )}
        </View>
        <View className='flex-1'>
          <Text className='text-base font-semibold text-gray-800 mb-1 font-manrope'>
            {title}
          </Text>
          <Text className='text-sm text-gray-600 mb-2 font-manrope leading-5'>
            {message}
          </Text>
          <Text className='text-xs text-gray-400 font-manrope'>{time}</Text>
        </View>
      </View>
    </View>
  );
}
