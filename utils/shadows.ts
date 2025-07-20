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

// Perfect drop shadow matching: box-shadow: 0px 8px 42px 0px #0000001A;
export const getPerfectDropShadow = (): ViewStyle => {
  if (Platform.OS === "android") {
    return {
      elevation: 8,
      shadowColor: "#000000",
    };
  }

  return {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1, // #0000001A = rgba(0,0,0,0.1)
    shadowRadius: 42,
  };
};

// Enhanced predefined shadow styles with better cross-platform values
export const shadowStyles = {
  none: createShadow(0),
  sm: createShadow(2, "#000000", 0.08, 2, 0, 1),
  default: createShadow(4, "#000000", 0.1, 3, 0, 2),
  md: getPerfectDropShadow(), // Updated to your perfect drop shadow: 0px 8px 42px 0px #0000001A
  lg: createShadow(8, "#000000", 0.15, 6, 0, 4),
  xl: createShadow(12, "#000000", 0.18, 8, 0, 6),
  "2xl": createShadow(16, "#000000", 0.25, 12, 0, 8),
  modal: createShadow(20, "#000000", 0.3, 16, 0, 10),
};

// Dynamic shadow creator that matches your exact specifications
export const createPerfectShadow = (
  offsetX: number = 0,
  offsetY: number = 8,
  blurRadius: number = 42,
  spreadRadius: number = 0, // Note: React Native doesn't support spread, but we can simulate with elevation
  color: string = "#000000",
  opacity: number = 0.1
): ViewStyle => {
  if (Platform.OS === "android") {
    // Calculate elevation based on blur radius and offset
    const calculatedElevation = Math.max(offsetY, Math.round(blurRadius / 5));
    return {
      elevation: calculatedElevation,
      shadowColor: color,
    };
  }

  return {
    shadowColor: color,
    shadowOffset: {
      width: offsetX,
      height: offsetY,
    },
    shadowOpacity: opacity,
    shadowRadius: blurRadius,
  };
};

// Helper function for card shadows
export const getCardShadow = (
  level: "sm" | "default" | "md" | "lg" = "default"
) => {
  return shadowStyles[level];
};

// Enhanced shadow for focused states
export const getFocusedShadow = (color: string = "#3B82F6"): ViewStyle => {
  if (Platform.OS === "android") {
    return {
      elevation: 8,
      shadowColor: color,
    };
  }

  return {
    shadowColor: color,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  };
};

// Utility to convert CSS box-shadow to React Native shadow
export const cssToReactNativeShadow = (
  offsetX: number,
  offsetY: number,
  blurRadius: number,
  spreadRadius: number,
  colorWithOpacity: string
): ViewStyle => {
  // Parse hex color with opacity (e.g., #0000001A)
  const color = colorWithOpacity.substring(0, 7); // #000000
  const opacityHex = colorWithOpacity.substring(7); // 1A
  const opacity = opacityHex ? parseInt(opacityHex, 16) / 255 : 1;

  return createPerfectShadow(
    offsetX,
    offsetY,
    blurRadius,
    spreadRadius,
    color,
    opacity
  );
};

// Usage examples:
export const exampleUsage = {
  // Direct usage of your perfect shadow
  perfectShadow: getPerfectDropShadow(),

  // Using the preset (now 'md' contains your perfect shadow)
  presetShadow: shadowStyles.md,

  // Dynamic creation
  customShadow: createPerfectShadow(0, 8, 42, 0, "#000000", 0.1),

  // From CSS
  fromCSS: cssToReactNativeShadow(0, 8, 42, 0, "#0000001A"),
};
