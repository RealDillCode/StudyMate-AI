import React, { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Search } from "lucide-react-native";

import { AppUsageItem } from "@/components/AppUsageItem";
import { Colors } from "@/constants/colors";
import { useAppUsage } from "@/hooks/useAppUsage";
import { AppCategory, AppUsage } from "@/types";
import { formatTime } from "@/utils/timeUtils";

export default function AppsScreen() {
  const { 
    appUsage, 
    isLoading, 
    toggleAppStatus,
    getProductiveTime,
    getNonProductiveTime,
  } = useAppUsage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "allowed" | "blocked">("all");
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | "all">("all");
  
  const productiveTime = getProductiveTime();
  const nonProductiveTime = getNonProductiveTime();
  
  // Filter apps based on search query, filter, and category
  const filteredApps = appUsage.filter((app) => {
    const matchesSearch = app.appName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      selectedFilter === "all" || 
      (selectedFilter === "allowed" && app.isWorkApp) || 
      (selectedFilter === "blocked" && !app.isWorkApp);
    const matchesCategory = 
      selectedCategory === "all" || 
      app.appCategory === selectedCategory;
    
    return matchesSearch && matchesFilter && matchesCategory;
  });
  
  const renderAppItem = ({ item }: { item: AppUsage }) => (
    <AppUsageItem 
      app={item} 
      onToggle={() => toggleAppStatus(item.appName)}
      showToggle={true}
    />
  );
  
  const renderHeader = () => (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>App Management</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(productiveTime, 'short')}</Text>
          <Text style={styles.statLabel}>Productive Time</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(nonProductiveTime, 'short')}</Text>
          <Text style={styles.statLabel}>Distracted Time</Text>
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search apps..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedFilter === "all" && styles.filterOptionSelected,
              ]}
              onPress={() => setSelectedFilter("all")}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedFilter === "all" && styles.filterOptionTextSelected,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedFilter === "allowed" && styles.filterOptionSelected,
              ]}
              onPress={() => setSelectedFilter("allowed")}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedFilter === "allowed" && styles.filterOptionTextSelected,
                ]}
              >
                Allowed
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedFilter === "blocked" && styles.filterOptionSelected,
              ]}
              onPress={() => setSelectedFilter("blocked")}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedFilter === "blocked" && styles.filterOptionTextSelected,
                ]}
              >
                Blocked
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Category:</Text>
          <ScrollableCategories
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>
      </View>
      
      <View style={styles.listHeaderContainer}>
        <Text style={styles.listHeaderTitle}>
          {filteredApps.length} {filteredApps.length === 1 ? 'App' : 'Apps'}
        </Text>
        <Text style={styles.listHeaderSubtitle}>
          Tap to toggle allowed/blocked status
        </Text>
      </View>
    </>
  );
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={filteredApps}
        renderItem={renderAppItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No apps found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

// Scrollable categories component
function ScrollableCategories({ 
  selectedCategory, 
  onSelectCategory 
}: { 
  selectedCategory: AppCategory | "all"; 
  onSelectCategory: (category: AppCategory | "all") => void;
}) {
  const categories: (AppCategory | "all")[] = [
    "all",
    "productivity",
    "communication",
    "social",
    "entertainment",
    "games",
    "utilities",
    "other",
  ];
  
  return (
    <View style={styles.categoriesContainer}>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryOption,
              selectedCategory === item && styles.categoryOptionSelected,
            ]}
            onPress={() => onSelectCategory(item)}
          >
            <Text
              style={[
                styles.categoryOptionText,
                selectedCategory === item && styles.categoryOptionTextSelected,
              ]}
            >
              {item === "all" ? "All" : item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[800],
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.gray[200],
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray[600],
    marginTop: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.gray[800],
  },
  filtersContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    marginRight: 8,
  },
  filterOptionSelected: {
    backgroundColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  filterOptionTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  categoriesContainer: {
    height: 40,
  },
  categoryOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    marginRight: 8,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primary,
  },
  categoryOptionText: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  categoryOptionTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  listHeaderContainer: {
    marginBottom: 8,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
  },
});