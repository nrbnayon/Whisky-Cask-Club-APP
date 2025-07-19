// app\(main)\_layout.tsx
import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Home, Briefcase, Gift, Users, User } from "lucide-react-native";

// Custom tab bar icon component with rounded background for active state
function CustomTabBarIcon({
  icon: Icon,
  color,
  size,
  focused,
  title,
}: {
  icon: any;
  color: string;
  size: number;
  focused: boolean;
  title: string;
}) {
  if (focused) {
    return (
      <View style={styles.activeTabContainer}>
        <Icon size={20} color="#ffffff" />
        <Text style={styles.activeTabText}>{title}</Text>
      </View>
    );
  }

  return (
    <View style={styles.inactiveTabContainer}>
      <Icon size={20} color={color} />
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
          paddingTop: 20,
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
              icon={Briefcase}
              color={color}
              size={size}
              focused={focused}
              title="Portfolio"
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
              icon={Users}
              color={color}
              size={size}
              focused={focused}
              title="Referral"
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
        name="cask/[id]"
        options={{
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
});
