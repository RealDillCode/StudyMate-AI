import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react-native";

import { AppUsageItem } from "@/components/AppUsageItem";
import { CircularProgress } from "@/components/CircularProgress";
import { Colors } from "@/constants/colors";
import { useAppUsage } from "@/hooks/useAppUsage";
import { useFocusMetrics } from "@/hooks/useFocusMetrics";
import { useWorkSession } from "@/hooks/useWorkSession";
import { formatTime } from "@/utils/timeUtils";

export default function ReportsScreen() {
  const { workSessions, isLoading: isSessionLoading } = useWorkSession();
  const { focusMetrics, isLoading: isMetricsLoading } = useFocusMetrics();
  const { appUsage, isLoading: isAppUsageLoading } = useAppUsage();
  
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  
  const isLoading = isSessionLoading || isMetricsLoading || isAppUsageLoading;
  
  // Get productive apps
  const productiveApps = appUsage.filter(app => app.isWorkApp);
  
  // Calculate total work time
  const totalWorkTime = workSessions.reduce((total, session) => {
    if (!session.duration) return total;
    return total + session.duration;
  }, 0);
  
  // Calculate total break time
  const totalBreakTime = workSessions.reduce((total, session) => {
    return total + session.breaks.reduce((breakTotal, breakItem) => {
      if (!breakItem.duration) return breakTotal;
      return breakTotal + breakItem.duration;
    }, 0);
  }, 0);
  
  // Calculate effective work time (total work time - break time)
  const effectiveWorkTime = totalWorkTime - totalBreakTime;
  
  // Calculate productive percentage
  const productivePercentage = focusMetrics.productiveTime > 0 
    ? Math.round((focusMetrics.productiveTime / (focusMetrics.productiveTime + focusMetrics.distractedTime)) * 100)
    : 0;
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Productivity Report</Text>
        
        <View style={styles.timeRangeSelector}>
          <TouchableOpacity
            style={[
              styles.timeRangeOption,
              timeRange === 'day' && styles.timeRangeOptionSelected,
            ]}
            onPress={() => setTimeRange('day')}
          >
            <Text
              style={[
                styles.timeRangeOptionText,
                timeRange === 'day' && styles.timeRangeOptionTextSelected,
              ]}
            >
              Day
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.timeRangeOption,
              timeRange === 'week' && styles.timeRangeOptionSelected,
            ]}
            onPress={() => setTimeRange('week')}
          >
            <Text
              style={[
                styles.timeRangeOptionText,
                timeRange === 'week' && styles.timeRangeOptionTextSelected,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.timeRangeOption,
              timeRange === 'month' && styles.timeRangeOptionSelected,
            ]}
            onPress={() => setTimeRange('month')}
          >
            <Text
              style={[
                styles.timeRangeOptionText,
                timeRange === 'month' && styles.timeRangeOptionTextSelected,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.dateArrow}>
          <ChevronLeft size={24} color={Colors.gray[600]} />
        </TouchableOpacity>
        
        <View style={styles.dateContainer}>
          <Calendar size={16} color={Colors.gray[600]} style={styles.dateIcon} />
          <Text style={styles.dateText}>
            {timeRange === 'day' && 'Today'}
            {timeRange === 'week' && 'This Week'}
            {timeRange === 'month' && 'This Month'}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.dateArrow}>
          <ChevronRight size={24} color={Colors.gray[600]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Summary</Text>
        
        <View style={styles.summaryContent}>
          <View style={styles.productivityScoreContainer}>
            <CircularProgress
              progress={productivePercentage}
              size={120}
              progressColor={Colors.secondary}
              showPercentage={true}
            />
            <Text style={styles.productivityScoreLabel}>Productivity</Text>
          </View>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>
                {formatTime(totalWorkTime, 'short')}
              </Text>
              <Text style={styles.summaryStatLabel}>Total Time</Text>
            </View>
            
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>
                {formatTime(effectiveWorkTime, 'short')}
              </Text>
              <Text style={styles.summaryStatLabel}>Effective Time</Text>
            </View>
            
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>
                {formatTime(totalBreakTime, 'short')}
              </Text>
              <Text style={styles.summaryStatLabel}>Break Time</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.timeDistributionContainer}>
        <Text style={styles.sectionTitle}>Time Distribution</Text>
        
        <View style={styles.timeDistributionContent}>
          <View style={styles.timeDistributionChart}>
            <View 
              style={[
                styles.timeDistributionBar, 
                { 
                  backgroundColor: Colors.secondary,
                  flex: focusMetrics.productiveTime,
                }
              ]} 
            />
            <View 
              style={[
                styles.timeDistributionBar, 
                { 
                  backgroundColor: Colors.danger,
                  flex: focusMetrics.distractedTime,
                }
              ]} 
            />
            <View 
              style={[
                styles.timeDistributionBar, 
                { 
                  backgroundColor: Colors.accent,
                  flex: focusMetrics.breakTime,
                }
              ]} 
            />
          </View>
          
          <View style={styles.timeDistributionLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.secondary }]} />
              <Text style={styles.legendText}>Productive</Text>
              <Text style={styles.legendValue}>
                {formatTime(focusMetrics.productiveTime, 'short')}
              </Text>
            </View>
            
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.danger }]} />
              <Text style={styles.legendText}>Distracted</Text>
              <Text style={styles.legendValue}>
                {formatTime(focusMetrics.distractedTime, 'short')}
              </Text>
            </View>
            
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.accent }]} />
              <Text style={styles.legendText}>Breaks</Text>
              <Text style={styles.legendValue}>
                {formatTime(focusMetrics.breakTime, 'short')}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.appUsageContainer}>
        <Text style={styles.sectionTitle}>App Usage</Text>
        
        <View style={styles.appUsageTabs}>
          <TouchableOpacity style={[styles.appUsageTab, styles.appUsageTabSelected]}>
            <Text style={[styles.appUsageTabText, styles.appUsageTabTextSelected]}>
              Productive Apps
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.appUsageTab}>
            <Text style={styles.appUsageTabText}>
              Distracting Apps
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.appList}>
          {productiveApps.slice(0, 3).map(app => (
            <AppUsageItem key={app.id} app={app} />
          ))}
          
          {productiveApps.length === 0 && (
            <View style={styles.emptyAppList}>
              <Text style={styles.emptyAppListText}>No productive apps used</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[100],
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[800],
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[200],
    borderRadius: 8,
    padding: 2,
  },
  timeRangeOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  timeRangeOptionSelected: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timeRangeOptionText: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  timeRangeOptionTextSelected: {
    color: Colors.gray[800],
    fontWeight: '600',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dateArrow: {
    padding: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[800],
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productivityScoreContainer: {
    alignItems: 'center',
  },
  productivityScoreLabel: {
    fontSize: 14,
    color: Colors.gray[600],
    marginTop: 8,
  },
  summaryStats: {
    flex: 1,
    marginLeft: 16,
  },
  summaryStatItem: {
    marginBottom: 12,
  },
  summaryStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  summaryStatLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  timeDistributionContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeDistributionContent: {},
  timeDistributionChart: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  timeDistributionBar: {
    height: '100%',
  },
  timeDistributionLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: Colors.gray[700],
    marginRight: 4,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[800],
  },
  appUsageContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appUsageTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  appUsageTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  appUsageTabSelected: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  appUsageTabText: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  appUsageTabTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  appList: {},
  emptyAppList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyAppListText: {
    fontSize: 14,
    color: Colors.gray[600],
  },
});