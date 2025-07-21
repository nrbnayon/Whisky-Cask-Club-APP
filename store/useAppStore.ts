// store/useAppStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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

interface ChartDataPoint {
  month: string;
  value: number;
}

interface ForecastData {
  year: string;
  value: string;
}

interface CaskDetails {
  bottle?: string;
  packaging?: string;
  volume: string;
  abv?: string;
  years?: string;
  warehouseLocation?: string;
  certificates?: string;
}

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
  totalGain: string;
  status: "Ready" | "Maturing";
  image: string;
  // New dynamic fields
  details: CaskDetails;
  appreciationData: ChartDataPoint[];
  currentAppreciation: string;
  futureForecasts: ForecastData[];
  projectedAppreciation: string;
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

interface Offer {
  id: string;
  title: string;
  description: string;
  type: "cask" | "bottle" | "experience";
  image: string;
  originalPrice: string;
  currentPrice: string;
  location: string;
  rating: number;
  daysLeft: number;
  details: {
    distillery?: string;
    vintage?: string;
    volume?: string;
    abv?: string;
    maturationPeriod?: string;
    caskType?: string;
    bottle?: string;
    packaging?: string;
    certificates?: string;
    duration?: string;
    tastings?: string;
    participants?: string;
    includes?: string;
  };
  badge?: string;
}

interface ReferralStat {
  id: string;
  name: string;
  email: string;
  referredDate: string;
  status: "Completed" | "Pending";
  reward: number;
}

interface RewardHistory {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: "Approved" | "Pending";
  date: string;
}

interface Purchase {
  id: string;
  title: string;
  type: "cask" | "bottle" | "experience";
  image: string;
  location: string;
  rating: number;
  daysLeft: number;
  investmentAmount: string;
  status: "Pending" | "Active" | "Completed" | "Reject";
  submittedDate: string;
  contactMethod?: string;
  expectedReturn?: string;
  offerId: string;
}

interface AppState {
  user: {
    id: string;
    name: string;
    email: string;
    balance?: number;
    avatar?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  theme: "light" | "dark" | "system";
  casks: Cask[];
  activities: Activity[];
  notifications: Notification[];
  offers: Offer[];
  purchases: Purchase[];
  referralData: {
    totalReferrals: number;
    completedReferrals: number;
    totalEarned: number;
    referralCode: string;
    referralStats: ReferralStat[];
    rewardHistory: RewardHistory[];
  };
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
  setOffers: (offers: Offer[]) => void;
  addPurchase: (purchase: Purchase) => void;
  removePurchase: (id: string) => void;
  updatePurchaseStatus: (id: string, status: Purchase["status"]) => void;
  addActivity: (activity: Activity) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  setForgotPasswordEmail: (email: string) => void;
  setOtpVerified: (verified: boolean) => void;
  updateUserProfile: (updates: Partial<AppState["user"]>) => void;
  logout: () => void;
}

// DEFINE YOUR 10 CASKS AS A CONSTANT WITH FULL DYNAMIC DATA
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
    totalGain: "+120%",
    status: "Ready",
    image: "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg",
    details: {
      volume: "500 Litres",
      abv: "63.2%",
      years: "25 Years",
      warehouseLocation: "New York, USA",
    },
    appreciationData: [
      { month: "Jan", value: 4000 },
      { month: "Feb", value: 8000 },
      { month: "Mar", value: 12000 },
      { month: "Apr", value: 10000 },
      { month: "May", value: 14000 },
      { month: "Jun", value: 16000 },
    ],
    currentAppreciation: "29.2%",
    futureForecasts: [
      { year: "2025", value: "$16,800" },
      { year: "2026", value: "$18,200" },
      { year: "2027", value: "$19,800" },
      { year: "2028", value: "$21,500" },
      { year: "2029", value: "$23,400" },
    ],
    projectedAppreciation: "+38.7%",
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
    totalGain: "+85%",
    status: "Maturing",
    image: "https://images.pexels.com/photos/3649262/pexels-photo-3649262.jpeg",
    details: {
      bottle: "6 Bottle",
      packaging: "Premium Gift Box",
      volume: "700ml each",
      certificates: "Authenticity Included",
    },
    appreciationData: [
      { month: "Jan", value: 5000 },
      { month: "Feb", value: 7500 },
      { month: "Mar", value: 9000 },
      { month: "Apr", value: 11000 },
      { month: "May", value: 13500 },
      { month: "Jun", value: 15500 },
    ],
    currentAppreciation: "24.8%",
    futureForecasts: [
      { year: "2025", value: "$16,200" },
      { year: "2026", value: "$17,100" },
      { year: "2027", value: "$18,000" },
    ],
    projectedAppreciation: "+32.1%",
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
    totalGain: "+95%",
    status: "Ready",
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    details: {
      volume: "450 Litres",
      abv: "61.8%",
      years: "23 Years",
      warehouseLocation: "Islay, Scotland",
    },
    appreciationData: [
      { month: "Jan", value: 3500 },
      { month: "Feb", value: 6000 },
      { month: "Mar", value: 8500 },
      { month: "Apr", value: 10200 },
      { month: "May", value: 11800 },
      { month: "Jun", value: 12800 },
    ],
    currentAppreciation: "31.5%",
    futureForecasts: [
      { year: "2025", value: "$13,500" },
      { year: "2026", value: "$14,300" },
      { year: "2027", value: "$15,200" },
      { year: "2028", value: "$16,100" },
    ],
    projectedAppreciation: "+41.2%",
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
    totalGain: "+78%",
    status: "Maturing",
    image: "https://images.pexels.com/photos/279303/pexels-photo-279303.jpeg",
    details: {
      volume: "600 Litres",
      abv: "60.1%",
      years: "19 Years",
      warehouseLocation: "Speyside, Scotland",
    },
    appreciationData: [
      { month: "Jan", value: 2800 },
      { month: "Feb", value: 4200 },
      { month: "Mar", value: 6000 },
      { month: "Apr", value: 7500 },
      { month: "May", value: 8800 },
      { month: "Jun", value: 10000 },
    ],
    currentAppreciation: "26.7%",
    futureForecasts: [
      { year: "2025", value: "$10,600" },
      { year: "2026", value: "$11,300" },
      { year: "2027", value: "$12,000" },
      { year: "2028", value: "$12,800" },
      { year: "2029", value: "$13,600" },
      { year: "2030", value: "$14,500" },
    ],
    projectedAppreciation: "+36.0%",
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
    totalGain: "+92%",
    status: "Ready",
    image: "https://images.pexels.com/photos/1283220/pexels-photo-1283220.jpeg",
    details: {
      volume: "550 Litres",
      abv: "62.0%",
      years: "21 Years",
      warehouseLocation: "Dufftown, Scotland",
    },
    appreciationData: [
      { month: "Jan", value: 3200 },
      { month: "Feb", value: 5800 },
      { month: "Mar", value: 8100 },
      { month: "Apr", value: 10500 },
      { month: "May", value: 11900 },
      { month: "Jun", value: 13200 },
    ],
    currentAppreciation: "28.3%",
    futureForecasts: [
      { year: "2025", value: "$14,000" },
      { year: "2026", value: "$14,900" },
      { year: "2027", value: "$15,800" },
    ],
    projectedAppreciation: "+39.4%",
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
    totalGain: "+105%",
    status: "Maturing",
    image: "https://images.pexels.com/photos/678111/pexels-photo-678111.jpeg",
    details: {
      volume: "480 Litres",
      abv: "64.0%",
      years: "24 Years",
      warehouseLocation: "Orkney, Scotland",
    },
    appreciationData: [
      { month: "Jan", value: 4100 },
      { month: "Feb", value: 6500 },
      { month: "Mar", value: 8900 },
      { month: "Apr", value: 11200 },
      { month: "May", value: 12800 },
      { month: "Jun", value: 14300 },
    ],
    currentAppreciation: "33.1%",
    futureForecasts: [
      { year: "2025", value: "$15,200" },
      { year: "2026", value: "$16,200" },
      { year: "2027", value: "$17,300" },
      { year: "2028", value: "$18,500" },
    ],
    projectedAppreciation: "+42.8%",
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
    totalGain: "+88%",
    status: "Ready",
    image: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg",
    details: {
      volume: "500 Litres",
      abv: "59.5%",
      years: "27 Years",
      warehouseLocation: "Speyside, Scotland",
    },
    appreciationData: [
      { month: "Jan", value: 3000 },
      { month: "Feb", value: 5200 },
      { month: "Mar", value: 7400 },
      { month: "Apr", value: 9100 },
      { month: "May", value: 10500 },
      { month: "Jun", value: 11900 },
    ],
    currentAppreciation: "25.9%",
    futureForecasts: [
      { year: "2025", value: "$12,600" },
      { year: "2026", value: "$13,400" },
      { year: "2027", value: "$14,200" },
      { year: "2028", value: "$15,100" },
      { year: "2029", value: "$16,000" },
    ],
    projectedAppreciation: "+37.3%",
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
    totalGain: "+98%",
    status: "Maturing",
    image: "https://images.pexels.com/photos/5946979/pexels-photo-5946979.jpeg",
    details: {
      volume: "520 Litres",
      abv: "65.3%",
      years: "25 Years",
      warehouseLocation: "Islay, Scotland",
    },
    appreciationData: [
      { month: "Jan", value: 4200 },
      { month: "Feb", value: 6800 },
      { month: "Mar", value: 9200 },
      { month: "Apr", value: 11600 },
      { month: "May", value: 13200 },
      { month: "Jun", value: 14900 },
    ],
    currentAppreciation: "32.7%",
    futureForecasts: [
      { year: "2025", value: "$15,800" },
      { year: "2026", value: "$16,800" },
      { year: "2027", value: "$17,900" },
    ],
    projectedAppreciation: "+43.1%",
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
    totalGain: "+82%",
    status: "Ready",
    image: "https://images.pexels.com/photos/1006960/pexels-photo-1006960.jpeg",
    details: {
      volume: "470 Litres",
      abv: "62.7%",
      years: "22 Years",
      warehouseLocation: "Highlands, Scotland",
    },
    appreciationData: [
      { month: "Jan", value: 3400 },
      { month: "Feb", value: 5900 },
      { month: "Mar", value: 8200 },
      { month: "Apr", value: 10300 },
      { month: "May", value: 12000 },
      { month: "Jun", value: 13700 },
    ],
    currentAppreciation: "27.8%",
    futureForecasts: [
      { year: "2025", value: "$14,500" },
      { year: "2026", value: "$15,400" },
      { year: "2027", value: "$16,400" },
      { year: "2028", value: "$17,500" },
    ],
    projectedAppreciation: "+40.1%",
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
    totalGain: "+76%",
    status: "Maturing",
    image: "https://images.pexels.com/photos/1267318/pexels-photo-1267318.jpeg",
    details: {
      volume: "490 Litres",
      abv: "60.9%",
      years: "20 Years",
      warehouseLocation: "West Highlands, Scotland",
    },
    appreciationData: [
      { month: "Jan", value: 2900 },
      { month: "Feb", value: 4800 },
      { month: "Mar", value: 6700 },
      { month: "Apr", value: 8500 },
      { month: "May", value: 10200 },
      { month: "Jun", value: 12500 },
    ],
    currentAppreciation: "24.1%",
    futureForecasts: [
      { year: "2025", value: "$13,200" },
      { year: "2026", value: "$14,000" },
      { year: "2027", value: "$14,900" },
      { year: "2028", value: "$15,800" },
      { year: "2029", value: "$16,800" },
      { year: "2030", value: "$17,900" },
    ],
    projectedAppreciation: "+34.4%",
  },
];

// DEFAULT OFFERS DATA
const DEFAULT_OFFERS: Offer[] = [
  {
    id: "1",
    title: "Rare Macallan 30yr Cask",
    description:
      "A highly sought-after single malt matured for three decades, offering exceptional depth, and investment value.",
    type: "cask",
    image: "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg",
    originalPrice: "18,000",
    currentPrice: "15,500",
    location: "New York, USA",
    rating: 4.9,
    daysLeft: 7,
    details: {
      distillery: "Macallan",
      vintage: "1998",
      volume: "500L",
      abv: "63.2%",
      maturationPeriod: "30 Years",
      caskType: "Sherry Hogshead",
    },
    badge: "Cask",
  },
  {
    id: "2",
    title: "Limited Edition Bottle Set",
    description:
      "Collector's set of 6 rare bottles from prestigious distilleries.",
    type: "bottle",
    image: "https://images.pexels.com/photos/3649262/pexels-photo-3649262.jpeg",
    originalPrice: "18,000",
    currentPrice: "15,500",
    location: "New York, USA",
    rating: 4.9,
    daysLeft: 7,
    details: {
      bottle: "6 Bottle",
      packaging: "Premium Gift Box",
      volume: "700ml each",
      certificates: "Authenticity Included",
    },
    badge: "Bottle",
  },
  {
    id: "3",
    title: "Whisky Tasting Experience",
    description:
      "Private tasting with master distiller including rare expressions",
    type: "experience",
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    originalPrice: "800",
    currentPrice: "500",
    location: "New York, USA",
    rating: 4.9,
    daysLeft: 7,
    details: {
      duration: "3 Hours",
      tastings: "12 Premium Whiskies",
      participants: "Up to 8 people",
      includes: "Food Pairing",
    },
    badge: "Experience",
  },
  // Duplicate entries for demonstration
  {
    id: "4",
    title: "Rare Macallan 30yr Cask",
    description:
      "A highly sought-after single malt matured for three decades, offering exceptional depth, and investment value.",
    type: "cask",
    image: "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg",
    originalPrice: "18,000",
    currentPrice: "15,500",
    location: "New York, USA",
    rating: 4.9,
    daysLeft: 7,
    details: {
      distillery: "Macallan",
      vintage: "1998",
      volume: "500L",
      abv: "63.2%",
      maturationPeriod: "30 Years",
      caskType: "Sherry Hogshead",
    },
    badge: "Cask",
  },
  {
    id: "5",
    title: "Limited Edition Bottle Set",
    description:
      "Collector's set of 6 rare bottles from prestigious distilleries.",
    type: "bottle",
    image: "https://images.pexels.com/photos/3649262/pexels-photo-3649262.jpeg",
    originalPrice: "18,000",
    currentPrice: "15,500",
    location: "New York, USA",
    rating: 4.9,
    daysLeft: 7,
    details: {
      bottle: "6 Bottle",
      packaging: "Premium Gift Box",
      volume: "700ml each",
      certificates: "Authenticity Included",
    },
    badge: "Bottle",
  },
  {
    id: "6",
    title: "Whisky Tasting Experience",
    description:
      "Private tasting with master distiller including rare expressions",
    type: "experience",
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    originalPrice: "800",
    currentPrice: "500",
    location: "New York, USA",
    rating: 4.9,
    daysLeft: 7,
    details: {
      duration: "3 Hours",
      tastings: "12 Premium Whiskies",
      participants: "Up to 8 people",
      includes: "Food Pairing",
    },
    badge: "Experience",
  },
];

// DEFAULT PURCHASES DATA
const DEFAULT_PURCHASES: Purchase[] = [
  {
    id: "1",
    title: "Rare Macallan 30yr Cask",
    type: "cask",
    image: "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg",
    location: "New York, USA",
    rating: 4.9,
    daysLeft: 7,
    investmentAmount: "$13K",
    status: "Pending",
    submittedDate: "2025-01-15",
    contactMethod: "Email",
    expectedReturn: "+15-20%",
    offerId: "1",
  },
  {
    id: "2",
    title: "Rare Macallan 30yr Cask",
    type: "cask",
    image: "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg",
    location: "New York, USA",
    rating: 4.9,
    daysLeft: 7,
    investmentAmount: "$13K",
    status: "Active",
    submittedDate: "2025-01-10",
    contactMethod: "Phone",
    expectedReturn: "+15-20%",
    offerId: "1",
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: "system",
      casks: DEFAULT_CASKS,
      offers: DEFAULT_OFFERS,
      purchases: DEFAULT_PURCHASES,
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
      referralData: {
        totalReferrals: 12,
        completedReferrals: 8,
        totalEarned: 400,
        referralCode: "JAMES2024",
        referralStats: [
          {
            id: "1",
            name: "Sarah Johnson",
            email: "sarah@example.com",
            referredDate: "2025-01-25",
            status: "Completed",
            reward: 50,
          },
          {
            id: "2",
            name: "Emma Wilson",
            email: "emma@example.com",
            referredDate: "2025-03-15",
            status: "Completed",
            reward: 50,
          },
        ],
        rewardHistory: [
          {
            id: "1",
            title: "Referral Bonus",
            description: "Sarah Johnson joined and made first investment",
            amount: 50,
            status: "Approved",
            date: "2025-01-25",
          },
          {
            id: "2",
            title: "Referral Bonus",
            description: "Emma Wilson joined and made first investment",
            amount: 50,
            status: "Approved",
            date: "2025-03-15",
          },
        ],
      },
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
      forgotPasswordEmail: null,
      otpVerified: false,
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      setCasks: (casks) => set({ casks }),
      setOffers: (offers) => set({ offers }),
      addPurchase: (purchase) =>
        set((state) => ({
          purchases: [purchase, ...state.purchases],
        })),
      removePurchase: (id) =>
        set((state) => ({
          purchases: state.purchases.filter((p) => p.id !== id),
        })),
      updatePurchaseStatus: (id, status) =>
        set((state) => ({
          purchases: state.purchases.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        })),
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
      updateUserProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
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
      version: 3, // INCREMENT THIS TO FORCE RESET
      //ADD MIGRATION LOGIC
      migrate: (persistedState: any, version: number) => {
        console.log("Migrating from version:", version);
        // If stored data doesn't have all casks with new structure, use default
        if (
          !persistedState?.casks ||
          persistedState.casks.length < 10 ||
          !persistedState.casks[0]?.appreciationData
        ) {
          console.log("Restoring default casks with new structure");
          return {
            ...persistedState,
            casks: DEFAULT_CASKS,
            offers: DEFAULT_OFFERS,
            purchases: DEFAULT_PURCHASES,
          };
        }
        return persistedState;
      },
      // ADD DEBUG INFO
      onRehydrateStorage: () => (state) => {
        console.log("Rehydrated state casks count:", state?.casks?.length);
      },
    }
  )
);
