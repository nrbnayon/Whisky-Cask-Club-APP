import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { TrendingUp, Package } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { StatCard } from "@/components/shared/StatCard";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterChip } from "@/components/shared/FilterChip";
import { CaskCard } from "@/components/shared/CaskCard";
import { ActivityItem } from "@/components/shared/ActivityItem";

import CaskBottleIcon from "@/assets/images/cask-bottle.png";
import MoneyBagIcon from "@/assets/images/money-bag.png";

export default function PortfolioScreen() {
  const router = useRouter();
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

  console.log("All cask::", filteredCasks.length);

  const handleViewDetails = (caskId: string) => {
    router.push(`/(main)/cask/${caskId}` as any);
  };

  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className='p-4'>
          {/* Header */}
          <Text className='text-gray-800 text-2xl font-semibold mb-4'>
            Casks Portfolio
          </Text>

          {/* Stats */}
          <View className='flex-row mb-6' style={{ gap: 12 }}>
            <StatCard
              iconImage={CaskBottleIcon}
              iconBgColor='#FEF3C7'
              cardBgColor='#FFFBEB'
              borderColor='#FBEFD0'
              title='Total Casks'
              value={portfolioStats.totalCasks.toString()}
            />
            <StatCard
              icon={TrendingUp}
              iconColor='#0891B2'
              iconBgColor='#CFFAFE'
              cardBgColor='#F0F9FF'
              borderColor='#BAE6FD'
              title='Total Value'
              value={portfolioStats.totalValue}
            />
            <StatCard
              iconImage={MoneyBagIcon}
              iconColor='#059669'
              iconBgColor='#CDFFDF'
              cardBgColor='#EFFAF3'
              borderColor='#CDFFDF'
              title='Lifetime Gain'
              value={portfolioStats.lifetimeGain}
              valueColor='text-[#22C55E]'
            />
          </View>

          {/* Search */}
          <SearchInput
            placeholder='Search your casks...'
            value={searchQuery}
            onChangeText={setSearchQuery}
            className='mb-4'
          />

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className='mb-6'
          >
            <View className='flex-row space-x-3'>
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
          {filteredCasks.length > 0 ? (
            filteredCasks.map((cask) => (
              <CaskCard
                key={cask.id}
                {...cask}
                borderColor='#E5D19E'
                detailsButtonActive={true}
                onViewDetails={() => handleViewDetails(cask.id)}
              />
            ))
          ) : (
            <View className='items-center justify-center py-12 px-4'>
              <Package size={48} color='#9CA3AF' />
              <Text className='text-gray-500 text-lg font-medium mt-4 text-center'>
                No Casks Found
              </Text>
              <Text className='text-gray-400 text-sm mt-2 text-center'>
                {searchQuery
                  ? `No casks match your search "${searchQuery}"`
                  : activeFilter !== "All Casks"
                    ? `No ${activeFilter.toLowerCase()} casks available`
                    : "Your portfolio is empty"}
              </Text>
            </View>
          )}

          {/* Recent Activity */}
          <Text className='text-gray-800 text-lg font-semibold mb-4 mt-6'>
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
