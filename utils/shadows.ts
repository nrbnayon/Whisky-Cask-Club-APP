import { Platform, ViewStyle } from "react-native";

// Cross-platform shadow utility with enhanced Android support
export const createShadow = (
  elevation: number,
  shadowColor: string = "#000000",
  shadowOpacity: number = 0.1,
  shadowRadius: number = 4,
  shadowOffsetWidth: number = 0,
  shadowOffsetHeight: number = 2
): ViewStyle => {
  if (Platform.OS === "android") {
    return {
      elevation,
      shadowColor, // This works on Android API 28+
      // For older Android versions, elevation is sufficient
    };
  }

  // iOS shadow properties
  return {
    shadowColor,
    shadowOffset: {
      width: shadowOffsetWidth,
      height: shadowOffsetHeight,
    },
    shadowOpacity,
    shadowRadius,
  };
};

// Enhanced predefined shadow styles with better cross-platform values
export const shadowStyles = {
  none: createShadow(0),
  sm: createShadow(2, "#000000", 0.08, 2, 0, 1),
  default: createShadow(4, "#000000", 0.1, 3, 0, 2),
  md: createShadow(6, "#000000", 0.12, 4, 0, 3),
  lg: createShadow(8, "#000000", 0.15, 6, 0, 4),
  xl: createShadow(12, "#000000", 0.18, 8, 0, 6),
  "2xl": createShadow(16, "#000000", 0.25, 12, 0, 8),
  modal: createShadow(20, "#000000", 0.3, 16, 0, 10),
};

// Helper function for card shadows
export const getCardShadow = (
  level: "sm" | "default" | "md" | "lg" = "default"
) => {
  return shadowStyles[level];
};

// Specific shadow for input components
export const getInputShadow = (): ViewStyle => {
  if (Platform.OS === "android") {
    return {
      elevation: 3,
      shadowColor: "#000000",
    };
  }

  return {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  };
};

// Enhanced shadow for focused states
export const getFocusedShadow = (): ViewStyle => {
  if (Platform.OS === "android") {
    return {
      elevation: 6,
      shadowColor: "#3B82F6", // Primary color
    };
  }

  return {
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  };
};
