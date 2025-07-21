// app\(main)\_layout.tsx
import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Image } from "react-native";
import { Home, Gift, User } from "lucide-react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import CaskBottleIcon from "@/assets/images/cask-bottle.png";

// Custom tab bar icon component with rounded background for active state
export function CustomTabBarIcon({
  icon: Icon,
  color,
  focused,
  title,
  isImage = false,
  imageSource,
  isFontAwesome = false,
  fontAwesomeName,
  isOutline = false,
}: {
  icon?: any;
  color: string;
  size: number;
  focused: boolean;
  title: string;
  isImage?: boolean;
  imageSource?: any;
  isFontAwesome?: boolean;
  fontAwesomeName?: string;
  isOutline?: boolean;
}) {
  if (focused) {
    return (
      <View style={styles.activeTabContainer}>
        {isImage ? (
          <Image
            source={imageSource}
            style={[styles.iconImage, { tintColor: "#ffffff" }]}
            resizeMode='contain'
          />
        ) : isFontAwesome ? (
          <FontAwesome5
            name={fontAwesomeName}
            size={20}
            color='#ffffff'
            solid={!isOutline}
          />
        ) : (
          <Icon size={20} color='#ffffff' />
        )}
        <Text style={styles.activeTabText}>{title}</Text>
      </View>
    );
  }

  return (
    <View style={styles.inactiveTabContainer}>
      {isImage ? (
        <Image
          source={imageSource}
          style={[styles.iconImage, { tintColor: color }]}
          resizeMode='contain'
        />
      ) : isFontAwesome ? (
        <FontAwesome5
          name={fontAwesomeName}
          size={20}
          color={color}
          solid={!isOutline}
        />
      ) : (
        <Icon size={20} color={color} />
      )}
      <Text style={[styles.inactiveTabText, { color }]}>{title}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 90,
          paddingBottom: 20,
          paddingTop: 24,
          paddingLeft: 20,
          paddingRight: 20,
        },
        tabBarActiveTintColor: "#b8860b",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBarIcon
              icon={Home}
              color={color}
              size={size}
              focused={focused}
              title="Home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBarIcon
              color={color}
              size={size}
              focused={focused}
              title="Portfolio"
              isImage={true}
              imageSource={CaskBottleIcon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: "Offers",
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBarIcon
              icon={Gift}
              color={color}
              size={size}
              focused={focused}
              title="Offers"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="referral"
        options={{
          title: "Referral",
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBarIcon
              color={color}
              size={size}
              focused={focused}
              title="Referral"
              isFontAwesome={true}
              fontAwesomeName="users"
              isOutline={true}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBarIcon
              icon={User}
              color={color}
              size={size}
              focused={focused}
              title="Profile"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-purchase"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cask/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="express-interest/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="express-interest-success/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="offer-details/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="payment/payment"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="payment/add-account-card"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeTabContainer: {
    backgroundColor: "#b8860b",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    height: 60,
  },
  activeTabText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  inactiveTabContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minWidth: 70,
  },
  inactiveTabText: {
    fontSize: 12,
    marginTop: 4,
  },
  iconImage: {
    width: 20,
    height: 20,
  },
});
