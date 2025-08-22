import React from "react";
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { SharedTimerSection } from "@/components/SharedTimerSection";
import { StatusBadge } from "@/components/StatusBadge";
import { WorkSessionCard } from "@/components/WorkSessionCard";
import { Colors } from "@/constants/colors";
import { useFocusMetrics } from "@/hooks/useFocusMetrics";
import { useWorkSession } from "@/hooks/useWorkSession";
import { WorkSession } from "@/types";


export default function TimeScreen() {
  const { 
    workSessions, 
    isLoading 
  } = useWorkSession();
  
  const { getCurrentStatus } = useFocusMetrics();
  

  
  const currentStatus = getCurrentStatus();
  
  const renderSessionItem = ({ item }: { item: WorkSession }) => (
    <WorkSessionCard session={item} />
  );
  
  const renderHeader = () => (
    <>
      <View style={styles.headerContainer}>
        <StatusBadge status={currentStatus} />
      </View>
      
      <View style={styles.timerContainer}>
        <SharedTimerSection showBreakOptions={true} compact={true} />
      </View>
      
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Session History</Text>
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
        data={workSessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No work sessions found</Text>
            <Text style={styles.emptySubtext}>
              Start your first work session to begin tracking your time
            </Text>
          </View>
        }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray[100],
  },
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerContainer: {
    marginBottom: 24,
  },
  historyContainer: {
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[800],
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