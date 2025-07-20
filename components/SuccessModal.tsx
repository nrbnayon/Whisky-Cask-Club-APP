import { View, Text, Modal } from "react-native";
import { Check } from "lucide-react-native";
import { Button } from "./ui/Button";
import { shadowStyles } from "@/utils/shadows";

interface SuccessModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
}

export function SuccessModal({ visible, title, onClose }: SuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <View className='flex-1 bg-overlay justify-center items-center px-4'>
        <View
          className='bg-card rounded-3xl p-12 w-full max-w-sm'
          style={shadowStyles.modal}
        >
          {/* Success Icon */}
          <View className='items-center mb-8'>
            <View className='relative'>
              {/* Decorative dots */}
              <View className='absolute -top-4 -left-6 w-5 h-5 bg-primary rounded-full' />
              <View className='absolute -top-4 right-12 w-2 h-2 bg-primary rounded-full' />
              <View className='absolute top-8 -right-8 w-3 h-3 bg-primary rounded-full' />
              <View className='absolute bottom-20 -left-4 w-0.5 h-0.5 bg-primary rounded-full' />
              <View className='absolute bottom-4 -left-4 w-3 h-3 bg-primary rounded-full' />
              <View className='absolute -bottom-6 right-8 w-1.5 h-1.5 bg-primary rounded-full' />
              <View className='absolute -bottom-2 right-16 w-1 h-1 bg-primary rounded-full' />

              {/* Main circle */}
              <View className='w-36 h-36 p-20 bg-primary rounded-full items-center justify-center'>
                <View className='w-16 h-16 bg-card rounded-md items-center justify-center'>
                  <Check size={32} color='#B8860B' strokeWidth={3} />
                </View>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text className='text-primary-dark text-lg font-medium text-center mb-8 leading-6'>
            {title}
          </Text>

          {/* Continue Button */}
          <Button onPress={onClose} className='w-full bg-primary'>
            Continue
          </Button>
        </View>
      </View>
    </Modal>
  );
}
