import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { TrendingUp } from "lucide-react-native";
import { useAppStore } from "@/store/useAppStore";
import { StatCard } from "@/components/shared/StatCard";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterChip } from "@/components/shared/FilterChip";
import { CaskCard } from "@/components/shared/CaskCard";
import { ActivityItem } from "@/components/shared/ActivityItem";

import CaskBottleIcon from "@/assets/images/cask-bottle.png";
import MoneyBagIcon from "@/assets/images/money-bag.png";

export default function PortfolioScreen() {
  const { casks, activities, portfolioStats } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Casks");

  const filters = ["All Casks", "Ready", "Maturing"];

  const filteredCasks = casks.filter((cask) => {
    const matchesSearch = cask.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "All Casks" || cask.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {/* Header */}
          <Text className="text-gray-800 text-2xl font-semibold mb-4">
            Casks Portfolio
          </Text>

          {/* Stats */}
          <View className="flex-row mb-6 space-x-3">
            <StatCard
              iconImage={CaskBottleIcon}
              iconBgColor="#FEF3C7"
              cardBgColor="#FFFBEB"
              borderColor="#FBEFD0"
              title="Total Casks"
              value={portfolioStats.totalCasks.toString()}
            />
            <StatCard
              icon={TrendingUp}
              iconColor="#0891B2"
              iconBgColor="#CFFAFE"
              cardBgColor="#F0F9FF"
              borderColor="#BAE6FD"
              title="Total Value"
              value={portfolioStats.totalValue}
            />
            <StatCard
              iconImage={MoneyBagIcon}
              iconColor="#059669"
              iconBgColor="#CDFFDF"
              cardBgColor="#EFFAF3"
              borderColor="#CDFFDF"
              title="Lifetime Gain"
              value={portfolioStats.lifetimeGain}
              valueColor="text-[#22C55E]"
            />
          </View>

          {/* Search */}
          <SearchInput
            placeholder="Search your casks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="mb-4"
          />

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            <View className="flex-row space-x-3">
              {filters.map((filter) => (
                <FilterChip
                  key={filter}
                  label={filter}
                  active={activeFilter === filter}
                  onPress={() => setActiveFilter(filter)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Casks List */}
          {filteredCasks.map((cask) => (
            <CaskCard
              key={cask.id}
              {...cask}
              borderColor="#E5D19E"
              detailsButtonActive={true}
              onViewDetails={() => {
                // Navigate to cask details
              }}
            />
          ))}

          {/* Recent Activity */}
          <Text className="text-gray-800 text-lg font-semibold mb-4 mt-6">
            Recent Activity
          </Text>

          {activities.slice(0, 2).map((activity) => (
            <ActivityItem
              key={activity.id}
              title={activity.title}
              subtitle={activity.subtitle}
              time={activity.time}
              type={activity.type}
              badge={activity.badge}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
