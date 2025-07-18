// store/useAppStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Platform } from "react-native";

// Custom storage for web compatibility
const storage = {
  getItem: async (name: string) => {
    // Check if we're in a web environment by checking for localStorage existence
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      return localStorage.getItem(name);
    }
    // Native environment: Use AsyncStorage
    return await AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string) => {
    // Check if we're in a web environment by checking for localStorage existence
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      localStorage.setItem(name, value);
    } else {
      // Native environment: Use AsyncStorage
      await AsyncStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string) => {
    // Check if we're in a web environment by checking for localStorage existence
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      localStorage.removeItem(name);
    } else {
      // Native environment: Use AsyncStorage
      await AsyncStorage.removeItem(name);
    }
  },
};

interface Cask {
  id: string;
  name: string;
  year: number;
  volume: string;
  abv: string;
  location: string;
  estimatedValue: string;
  gain: string;
  gainPercentage: string;
  status: "Ready" | "Maturing";
  image: string;
}

interface Activity {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: "gain" | "offer" | "reward";
  badge?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "portfolio" | "offer" | "reward" | "event";
  read: boolean;
}

interface AppState {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  theme: "light" | "dark" | "system";
  casks: Cask[];
  activities: Activity[];
  notifications: Notification[];
  portfolioStats: {
    totalValue: string;
    totalCasks: number;
    avgGrowth: string;
    lifetimeGain: string;
  };
  // Forgot password related state
  forgotPasswordEmail: string | null;
  otpVerified: boolean;
  setUser: (user: AppState["user"]) => void;
  setTheme: (theme: AppState["theme"]) => void;
  setCasks: (casks: Cask[]) => void;
  addActivity: (activity: Activity) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  // Forgot password actions
  setForgotPasswordEmail: (email: string) => void;
  setOtpVerified: (verified: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: "system",
      casks: [
        {
          id: "1",
          name: "Macallan",
          year: 1998,
          volume: "500L",
          abv: "63.2%",
          location: "New York, USA",
          estimatedValue: "$15,500",
          gain: "+$1,500",
          gainPercentage: "+9.3%",
          status: "Ready",
          image:
            "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg",
        },
        {
          id: "2",
          name: "Ardbeg",
          year: 1998,
          volume: "500L",
          abv: "63.2%",
          location: "New York, USA",
          estimatedValue: "$15,500",
          gain: "+$1,500",
          gainPercentage: "+2.3%",
          status: "Maturing",
          image:
            "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg",
        },
      ],
      activities: [
        {
          id: "1",
          title: "Macallan 25yr increased by $500",
          subtitle: "2 hours ago",
          time: "2 hours ago",
          type: "gain",
          badge: "+9.3%",
        },
        {
          id: "2",
          title: "New exclusive offer available",
          subtitle: "2 hours ago",
          time: "2 hours ago",
          type: "offer",
          badge: "New",
        },
        {
          id: "3",
          title: "Referral reward earned: $50",
          subtitle: "2 hours ago",
          time: "2 hours ago",
          type: "reward",
          badge: "Reward",
        },
      ],
      notifications: [
        {
          id: "1",
          title: "Portfolio Value Update",
          message: "Your Macallan 25yr cask has increased by £500 (+3.2%)",
          time: "2 hours ago",
          type: "portfolio",
          read: false,
        },
        {
          id: "2",
          title: "New Exclusive Offer",
          message: "Limited time: Rare Ardbeg collection now available",
          time: "2 day ago",
          type: "offer",
          read: false,
        },
        {
          id: "3",
          title: "Referral Reward Earned",
          message:
            "Congratulations! You've earned £50 for referring Sarah Johnson",
          time: "7 day ago",
          type: "reward",
          read: false,
        },
        {
          id: "4",
          title: "Whisky Tasting Event",
          message: "Edinburgh tasting event this weekend - 2 spots remaining",
          time: "1 week ago",
          type: "event",
          read: false,
        },
      ],
      portfolioStats: {
        totalValue: "$12,000",
        totalCasks: 12,
        avgGrowth: "+120%",
        lifetimeGain: "+$120",
      },
      // Forgot password state
      forgotPasswordEmail: null,
      otpVerified: false,
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      setCasks: (casks) => set({ casks }),
      addActivity: (activity) =>
        set((state) => ({
          activities: [activity, ...state.activities],
        })),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      // Forgot password actions
      setForgotPasswordEmail: (email) => set({ forgotPasswordEmail: email }),
      setOtpVerified: (verified) => set({ otpVerified: verified }),
      logout: () =>
        set({
          user: null,
          forgotPasswordEmail: null,
          otpVerified: false,
        }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// // store/useAppStore.ts
// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Custom storage for web compatibility
// const storage = {
//   getItem: async (name: string) => {
//     if (typeof window !== "undefined") {
//       // Web environment: Use localStorage
//       return localStorage.getItem(name);
//     }
//     // Native environment: Use AsyncStorage
//     return await AsyncStorage.getItem(name);
//   },
//   setItem: async (name: string, value: string) => {
//     if (typeof window !== "undefined") {
//       // Web environment: Use localStorage
//       localStorage.setItem(name, value);
//     } else {
//       // Native environment: Use AsyncStorage
//       await AsyncStorage.setItem(name, value);
//     }
//   },
//   removeItem: async (name: string) => {
//     if (typeof window !== "undefined") {
//       // Web environment: Use localStorage
//       localStorage.removeItem(name);
//     } else {
//       // Native environment: Use AsyncStorage
//       await AsyncStorage.removeItem(name);
//     }
//   },
// };

// interface Cask {
//   id: string;
//   name: string;
//   year: number;
//   volume: string;
//   abv: string;
//   location: string;
//   estimatedValue: string;
//   gain: string;
//   gainPercentage: string;
//   status: "Ready" | "Maturing";
//   image: string;
// }

// interface Activity {
//   id: string;
//   title: string;
//   subtitle: string;
//   time: string;
//   type: "gain" | "offer" | "reward";
//   badge?: string;
// }

// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   time: string;
//   type: "portfolio" | "offer" | "reward" | "event";
//   read: boolean;
// }

// interface AppState {
//   user: {
//     id: string;
//     name: string;
//     email: string;
//   } | null;
//   theme: "light" | "dark" | "system";
//   casks: Cask[];
//   activities: Activity[];
//   notifications: Notification[];
//   portfolioStats: {
//     totalValue: string;
//     totalCasks: number;
//     avgGrowth: string;
//     lifetimeGain: string;
//   };
//   setUser: (user: AppState["user"]) => void;
//   setTheme: (theme: AppState["theme"]) => void;
//   setCasks: (casks: Cask[]) => void;
//   addActivity: (activity: Activity) => void;
//   addNotification: (notification: Notification) => void;
//   markNotificationAsRead: (id: string) => void;
//   logout: () => void;
// }

// export const useAppStore = create<AppState>()(
//   persist(
//     (set) => ({
//       user: null,
//       theme: "system",
//       casks: [
//         {
//           id: "1",
//           name: "Macallan",
//           year: 1998,
//           volume: "500L",
//           abv: "63.2%",
//           location: "New York, USA",
//           estimatedValue: "$15,500",
//           gain: "+$1,500",
//           gainPercentage: "+9.3%",
//           status: "Ready",
//           image:
//             "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg",
//         },
//         {
//           id: "2",
//           name: "Ardbeg",
//           year: 1998,
//           volume: "500L",
//           abv: "63.2%",
//           location: "New York, USA",
//           estimatedValue: "$15,500",
//           gain: "+$1,500",
//           gainPercentage: "+2.3%",
//           status: "Maturing",
//           image:
//             "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg",
//         },
//       ],
//       activities: [
//         {
//           id: "1",
//           title: "Macallan 25yr increased by $500",
//           subtitle: "2 hours ago",
//           time: "2 hours ago",
//           type: "gain",
//           badge: "+9.3%",
//         },
//         {
//           id: "2",
//           title: "New exclusive offer available",
//           subtitle: "2 hours ago",
//           time: "2 hours ago",
//           type: "offer",
//           badge: "New",
//         },
//         {
//           id: "3",
//           title: "Referral reward earned: $50",
//           subtitle: "2 hours ago",
//           time: "2 hours ago",
//           type: "reward",
//           badge: "Reward",
//         },
//       ],
//       notifications: [
//         {
//           id: "1",
//           title: "Portfolio Value Update",
//           message: "Your Macallan 25yr cask has increased by £500 (+3.2%)",
//           time: "2 hours ago",
//           type: "portfolio",
//           read: false,
//         },
//         {
//           id: "2",
//           title: "New Exclusive Offer",
//           message: "Limited time: Rare Ardbeg collection now available",
//           time: "2 day ago",
//           type: "offer",
//           read: false,
//         },
//         {
//           id: "3",
//           title: "Referral Reward Earned",
//           message:
//             "Congratulations! You've earned £50 for referring Sarah Johnson",
//           time: "7 day ago",
//           type: "reward",
//           read: false,
//         },
//         {
//           id: "4",
//           title: "Whisky Tasting Event",
//           message: "Edinburgh tasting event this weekend - 2 spots remaining",
//           time: "1 week ago",
//           type: "event",
//           read: false,
//         },
//       ],
//       portfolioStats: {
//         totalValue: "$12,00", // Note: Fix typo here (should be "$12,000")
//         totalCasks: 12,
//         avgGrowth: "+120%",
//         lifetimeGain: "+$120",
//       },
//       setUser: (user) => set({ user }),
//       setTheme: (theme) => set({ theme }),
//       setCasks: (casks) => set({ casks }),
//       addActivity: (activity) =>
//         set((state) => ({
//           activities: [activity, ...state.activities],
//         })),
//       addNotification: (notification) =>
//         set((state) => ({
//           notifications: [notification, ...state.notifications],
//         })),
//       markNotificationAsRead: (id) =>
//         set((state) => ({
//           notifications: state.notifications.map((n) =>
//             n.id === id ? { ...n, read: true } : n
//           ),
//         })),
//       logout: () => set({ user: null }),
//     }),
//     {
//       name: "app-storage",
//       storage: createJSONStorage(() => storage),
//     }
//   )
// );
