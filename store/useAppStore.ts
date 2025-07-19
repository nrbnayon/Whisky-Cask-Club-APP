
// store/useAppStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native"; // UNCOMMENT THIS LINE

// Custom storage for web compatibility
const storage = {
  getItem: async (name: string) => {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      return localStorage.getItem(name);
    }
    return await AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string) => {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      localStorage.setItem(name, value);
    } else {
      await AsyncStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string) => {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      localStorage.removeItem(name);
    } else {
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
  forgotPasswordEmail: string | null;
  otpVerified: boolean;
  setUser: (user: AppState["user"]) => void;
  setTheme: (theme: AppState["theme"]) => void;
  setCasks: (casks: Cask[]) => void;
  addActivity: (activity: Activity) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  setForgotPasswordEmail: (email: string) => void;
  setOtpVerified: (verified: boolean) => void;
  logout: () => void;
}

// DEFINE YOUR 10 CASKS AS A CONSTANT
const DEFAULT_CASKS: Cask[] = [
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
    image: "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg", // whiskey bottles
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
    image: "https://images.pexels.com/photos/3649262/pexels-photo-3649262.jpeg", // whiskey barrel
  },
  {
    id: "3",
    name: "Lagavulin",
    year: 2001,
    volume: "450L",
    abv: "61.8%",
    location: "Islay, Scotland",
    estimatedValue: "$12,800",
    gain: "+$1,200",
    gainPercentage: "+10.3%",
    status: "Ready",
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg", // scotch in glass
  },
  {
    id: "4",
    name: "Glenlivet",
    year: 2005,
    volume: "600L",
    abv: "60.1%",
    location: "Speyside, Scotland",
    estimatedValue: "$10,000",
    gain: "+$900",
    gainPercentage: "+9.0%",
    status: "Maturing",
    image: "https://images.pexels.com/photos/279303/pexels-photo-279303.jpeg", // whiskey pouring
  },
  {
    id: "5",
    name: "Balvenie",
    year: 2003,
    volume: "550L",
    abv: "62.0%",
    location: "Dufftown, Scotland",
    estimatedValue: "$13,200",
    gain: "+$1,100",
    gainPercentage: "+8.3%",
    status: "Ready",
    image: "https://images.pexels.com/photos/1283220/pexels-photo-1283220.jpeg", // whiskey glass
  },
  {
    id: "6",
    name: "Highland Park",
    year: 2000,
    volume: "480L",
    abv: "64.0%",
    location: "Orkney, Scotland",
    estimatedValue: "$14,300",
    gain: "+$1,300",
    gainPercentage: "+9.1%",
    status: "Maturing",
    image: "https://images.pexels.com/photos/678111/pexels-photo-678111.jpeg", // bottle and glass
  },
  {
    id: "7",
    name: "Glenfiddich",
    year: 1997,
    volume: "500L",
    abv: "59.5%",
    location: "Speyside, Scotland",
    estimatedValue: "$11,900",
    gain: "+$800",
    gainPercentage: "+7.2%",
    status: "Ready",
    image: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg", // whisky shelves
  },
  {
    id: "8",
    name: "Laphroaig",
    year: 1999,
    volume: "520L",
    abv: "65.3%",
    location: "Islay, Scotland",
    estimatedValue: "$14,900",
    gain: "+$1,400",
    gainPercentage: "+10.4%",
    status: "Maturing",
    image: "https://images.pexels.com/photos/5946979/pexels-photo-5946979.jpeg", // whiskey on bar
  },
  {
    id: "9",
    name: "Dalmore",
    year: 2002,
    volume: "470L",
    abv: "62.7%",
    location: "Highlands, Scotland",
    estimatedValue: "$13,700",
    gain: "+$1,000",
    gainPercentage: "+7.9%",
    status: "Ready",
    image: "https://images.pexels.com/photos/1006960/pexels-photo-1006960.jpeg", // aged bottles
  },
  {
    id: "10",
    name: "Oban",
    year: 2004,
    volume: "490L",
    abv: "60.9%",
    location: "West Highlands, Scotland",
    estimatedValue: "$12,500",
    gain: "+$950",
    gainPercentage: "+8.2%",
    status: "Maturing",
    image: "https://images.pexels.com/photos/1267318/pexels-photo-1267318.jpeg", // whisky collection
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: "system",
      casks: DEFAULT_CASKS, 
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
          message: "Congratulations! You've earned £50 for referring Sarah Johnson",
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
      storage: createJSONStorage(() => storage),
      version: 2, // INCREMENT THIS TO FORCE RESET
      // ADD MIGRATION LOGIC
      migrate: (persistedState: any, version: number) => {
        console.log('Migrating from version:', version);
        // If stored data doesn't have all casks, use default
        if (!persistedState?.casks || persistedState.casks.length < 10) {
          console.log('Restoring default casks');
          return {
            ...persistedState,
            casks: DEFAULT_CASKS,
          };
        }
        return persistedState;
      },
      // ADD DEBUG INFO
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrated state casks count:', state?.casks?.length);
      },
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
