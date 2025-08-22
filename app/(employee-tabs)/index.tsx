import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { FocusScoreCard } from "@/components/FocusScoreCard";
import { SharedTimerSection } from "@/components/SharedTimerSection";
import { StatusBadge } from "@/components/StatusBadge";
import { Colors } from "@/constants/colors";
import { useAppUsage } from "@/hooks/useAppUsage";
import { useAuth } from "@/hooks/useAuth";
import { useFocusMetrics } from "@/hooks/useFocusMetrics";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useWorkSession } from "@/hooks/useWorkSession";
import { AppUsage } from "@/types";
import { formatDate } from "@/utils/timeUtils";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { 
    currentProfile,
    isLoading: isProfileLoading,
    onboardingComplete,
  } = useUserProfile();
  
  const { 
    isLoading: isSessionLoading 
  } = useWorkSession();
  
  const { 
    focusMetrics, 
    isLoading: isMetricsLoading,
    getCurrentStatus 
  } = useFocusMetrics();
  
  const { 
    appUsage, 
    isLoading: isAppUsageLoading 
  } = useAppUsage();
  
  const [refreshing, setRefreshing] = useState(false);
  
  const isLoading = isProfileLoading || isSessionLoading || isMetricsLoading || isAppUsageLoading;
  const currentStatus = getCurrentStatus();
  
  // Handle onboarding redirect
  useEffect(() => {
    if (!isProfileLoading && (!onboardingComplete || !currentProfile)) {
      router.replace('/onboarding');
    }
  }, [isProfileLoading, onboardingComplete, currentProfile]);
  
  // Get top apps by usage
  const getTopApps = (count: number): AppUsage[] => {
    return [...appUsage]
      .sort((a, b) => b.usageTime - a.usageTime)
      .slice(0, count);
  };
  
  const topApps = getTopApps(3);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // In a real app, this would refresh data from the server
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen is focused
      // In a real app, this would fetch fresh data
    }, [])
  );
  

  
  if (isLoading || !currentProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Welcome back, {user?.name || currentProfile.name}
          </Text>
          <Text style={styles.date}>{formatDate(new Date(), 'date')}</Text>
        </View>
        <StatusBadge status={currentStatus} />
      </View>
      
      <View style={styles.timerContainer}>
        <SharedTimerSection showBreakOptions={false} compact={false} />
      </View>
      
      <View style={styles.focusScoreContainer}>
        <FocusScoreCard focusMetrics={focusMetrics} />
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Top Apps Today</Text>
        {topApps.map((app) => (
          <View key={app.id} style={styles.appItem}>
            <Text style={styles.appName}>{app.appName}</Text>
            <View style={styles.appUsageBar}>
              <View 
                style={[
                  styles.appUsageProgress, 
                  { 
                    width: `${Math.min((app.usageTime / focusMetrics.totalWorkTime) * 100, 100)}%`,
                    backgroundColor: app.isWorkApp ? Colors.secondary : Colors.accent,
                  }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[600],
  },
  timerContainer: {
    marginBottom: 24,
  },
  focusScoreContainer: {
    marginBottom: 24,
  },
  sectionContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 16,
  },
  appItem: {
    marginBottom: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  appUsageBar: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  appUsageProgress: {
    height: '100%',
    borderRadius: 4,
  },
});