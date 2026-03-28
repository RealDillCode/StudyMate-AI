import { router } from 'expo-router';
import { 
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Smartphone,
  Calendar,
  Activity,
  Eye,
  Settings
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
} from 'react-native';

import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { EmployerProfile } from '@/types';

const { width } = Dimensions.get('window');

type DashboardTab = 'overview' | 'employees' | 'productivity' | 'irregularities';

interface EmployeeData {
  id: string;
  name: string;
  department: string;
  status: 'clocked_in' | 'clocked_out' | 'on_break';
  todayHours: number;
  weekHours: number;
  productivityScore: number;
  lastActivity: string;
  irregularities: string[];
}

interface ProductivityMetrics {
  teamAverage: number;
  topPerformer: string;
  focusTime: number;
  distractionTime: number;
  appUsageViolations: number;
}

export default function EmployerDashboardScreen() {
  const { currentProfile } = useUserProfile();
  const employerProfile = currentProfile as EmployerProfile;

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Mock employee data
  const [employees] = useState<EmployeeData[]>([
    {
      id: '1',
      name: 'John Doe',
      department: 'Engineering',
      status: 'clocked_in',
      todayHours: 6.5,
      weekHours: 32.5,
      productivityScore: 85,
      lastActivity: '2 minutes ago',
      irregularities: ['Late clock-in (15 min)', 'Extended break (45 min)']
    },
    {
      id: '2',
      name: 'Jane Smith',
      department: 'Marketing',
      status: 'on_break',
      todayHours: 4.0,
      weekHours: 28.0,
      productivityScore: 92,
      lastActivity: '5 minutes ago',
      irregularities: []
    },
    {
      id: '3',
      name: 'Mike Johnson',
      department: 'Sales',
      status: 'clocked_out',
      todayHours: 8.0,
      weekHours: 40.0,
      productivityScore: 78,
      lastActivity: '1 hour ago',
      irregularities: ['Excessive social media usage', 'Missed scheduled break']
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      department: 'Engineering',
      status: 'clocked_in',
      todayHours: 7.2,
      weekHours: 35.8,
      productivityScore: 88,
      lastActivity: '1 minute ago',
      irregularities: ['Clock-in location mismatch']
    }
  ]);

  const [productivityMetrics] = useState<ProductivityMetrics>({
    teamAverage: 83,
    topPerformer: 'Jane Smith',
    focusTime: 6.2,
    distractionTime: 1.8,
    appUsageViolations: 12
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return Colors.success;
      case 'on_break':
        return Colors.warning;
      case 'clocked_out':
        return Colors.gray[500];
      default:
        return Colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return 'Working';
      case 'on_break':
        return 'On Break';
      case 'clocked_out':
        return 'Clocked Out';
      default:
        return 'Unknown';
    }
  };

  const getProductivityColor = (score: number) => {
    if (score >= 90) return Colors.success;
    if (score >= 75) return Colors.warning;
    return Colors.danger;
  };

  const renderTabButton = (tab: DashboardTab, icon: React.ReactNode, title: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => (
    <>
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Users size={24} color={Colors.primary} />
          <Text style={styles.statNumber}>{employees.length}</Text>
          <Text style={styles.statLabel}>Total Employees</Text>
        </View>
        
        <View style={styles.statCard}>
          <Clock size={24} color={Colors.success} />
          <Text style={styles.statNumber}>{employees.filter(e => e.status === 'clocked_in').length}</Text>
          <Text style={styles.statLabel}>Currently Working</Text>
        </View>
        
        <View style={styles.statCard}>
          <TrendingUp size={24} color={Colors.warning} />
          <Text style={styles.statNumber}>{productivityMetrics.teamAverage}%</Text>
          <Text style={styles.statLabel}>Team Productivity</Text>
        </View>
        
        <View style={styles.statCard}>
          <AlertTriangle size={24} color={Colors.danger} />
          <Text style={styles.statNumber}>{employees.reduce((acc, emp) => acc + emp.irregularities.length, 0)}</Text>
          <Text style={styles.statLabel}>Irregularities</Text>
        </View>
      </View>

      {/* Today's Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <BarChart3 size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Today&apos;s Summary</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Average Focus Time:</Text>
          <Text style={styles.summaryValue}>{productivityMetrics.focusTime}h</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Average Distraction Time:</Text>
          <Text style={styles.summaryValue}>{productivityMetrics.distractionTime}h</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Top Performer:</Text>
          <Text style={styles.summaryValue}>{productivityMetrics.topPerformer}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>App Violations:</Text>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>{productivityMetrics.appUsageViolations}</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Activity size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        
        {employees.slice(0, 3).map((employee) => (
          <View key={employee.id} style={styles.activityItem}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(employee.status) }]} />
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>{employee.name}</Text>
              <Text style={styles.activityDetails}>
                {getStatusText(employee.status)} • {employee.lastActivity}
              </Text>
            </View>
            <Text style={styles.activityHours}>{employee.todayHours}h</Text>
          </View>
        ))}
      </View>
    </>
  );

  const renderEmployeesTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Users size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>Employee Status</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {employees.map((employee) => (
        <View key={employee.id} style={styles.employeeCard}>
          <View style={styles.employeeHeader}>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>{employee.name}</Text>
              <Text style={styles.employeeDepartment}>{employee.department}</Text>
            </View>
            <View style={styles.employeeStatus}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(employee.status) }]} />
              <Text style={styles.statusText}>{getStatusText(employee.status)}</Text>
            </View>
          </View>
          
          <View style={styles.employeeMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Today</Text>
              <Text style={styles.metricValue}>{employee.todayHours}h</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Week</Text>
              <Text style={styles.metricValue}>{employee.weekHours}h</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Productivity</Text>
              <Text style={[styles.metricValue, { color: getProductivityColor(employee.productivityScore) }]}>
                {employee.productivityScore}%
              </Text>
            </View>
          </View>
          
          <Text style={styles.lastActivity}>Last activity: {employee.lastActivity}</Text>
          
          {employee.irregularities.length > 0 && (
            <View style={styles.irregularitiesContainer}>
              <AlertTriangle size={16} color={Colors.danger} />
              <Text style={styles.irregularitiesText}>
                {employee.irregularities.length} irregularit{employee.irregularities.length === 1 ? 'y' : 'ies'}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderProductivityTab = () => (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Team Productivity Overview</Text>
        </View>
        
        <View style={styles.productivityChart}>
          <Text style={styles.chartTitle}>Weekly Productivity Trend</Text>
          <View style={styles.chartPlaceholder}>
            <BarChart3 size={48} color={Colors.gray[400]} />
            <Text style={styles.chartPlaceholderText}>Productivity chart would go here</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Smartphone size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>App Usage Violations</Text>
        </View>
        
        <View style={styles.violationItem}>
          <Text style={styles.violationApp}>Social Media Apps</Text>
          <Text style={styles.violationCount}>8 violations</Text>
        </View>
        
        <View style={styles.violationItem}>
          <Text style={styles.violationApp}>Gaming Apps</Text>
          <Text style={styles.violationCount}>3 violations</Text>
        </View>
        
        <View style={styles.violationItem}>
          <Text style={styles.violationApp}>Entertainment Apps</Text>
          <Text style={styles.violationCount}>1 violation</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Eye size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Focus Metrics</Text>
        </View>
        
        <View style={styles.focusMetric}>
          <Text style={styles.focusLabel}>Average Focus Session</Text>
          <Text style={styles.focusValue}>45 minutes</Text>
        </View>
        
        <View style={styles.focusMetric}>
          <Text style={styles.focusLabel}>Daily Focus Goal Achievement</Text>
          <Text style={styles.focusValue}>78%</Text>
        </View>
        
        <View style={styles.focusMetric}>
          <Text style={styles.focusLabel}>Most Productive Time</Text>
          <Text style={styles.focusValue}>10:00 AM - 12:00 PM</Text>
        </View>
      </View>
    </>
  );

  const renderIrregularitiesTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AlertTriangle size={20} color={Colors.danger} />
        <Text style={styles.sectionTitle}>Time & Attendance Irregularities</Text>
      </View>

      {employees.filter(emp => emp.irregularities.length > 0).map((employee) => (
        <View key={employee.id} style={styles.irregularityCard}>
          <View style={styles.irregularityHeader}>
            <Text style={styles.irregularityName}>{employee.name}</Text>
            <Text style={styles.irregularityDepartment}>{employee.department}</Text>
          </View>
          
          {employee.irregularities.map((irregularity, index) => (
            <View key={index} style={styles.irregularityItem}>
              <AlertTriangle size={16} color={Colors.danger} />
              <Text style={styles.irregularityText}>{irregularity}</Text>
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => Alert.alert('Review', `Review irregularities for ${employee.name}`)}
          >
            <Text style={styles.reviewButtonText}>Review & Take Action</Text>
          </TouchableOpacity>
        </View>
      ))}

      {employees.filter(emp => emp.irregularities.length > 0).length === 0 && (
        <View style={styles.noIrregularities}>
          <Text style={styles.noIrregularitiesText}>No irregularities found today!</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Employer Dashboard</Text>
            <Text style={styles.subtitle}>{employerProfile?.companySettings.companyName || 'Company Name'}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/employer-settings')}
          >
            <Settings size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {renderTabButton('overview', <BarChart3 size={20} color={activeTab === 'overview' ? Colors.white : Colors.primary} />, 'Overview')}
        {renderTabButton('employees', <Users size={20} color={activeTab === 'employees' ? Colors.white : Colors.primary} />, 'Employees')}
        {renderTabButton('productivity', <TrendingUp size={20} color={activeTab === 'productivity' ? Colors.white : Colors.primary} />, 'Productivity')}
        {renderTabButton('irregularities', <AlertTriangle size={20} color={activeTab === 'irregularities' ? Colors.white : Colors.primary} />, 'Irregularities')}
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'employees' && renderEmployeesTab()}
        {activeTab === 'productivity' && renderProductivityTab()}
        {activeTab === 'irregularities' && renderIrregularitiesTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[100],
  },
  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
  },
  tabContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  activeTabButtonText: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 48 - 12) / 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[600],
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[800],
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  refreshText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[800],
  },
  activityDetails: {
    fontSize: 12,
    color: Colors.gray[600],
    marginTop: 2,
  },
  activityHours: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  employeeCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  employeeDepartment: {
    fontSize: 14,
    color: Colors.gray[600],
    marginTop: 2,
  },
  employeeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray[700],
  },
  employeeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.gray[600],
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginTop: 2,
  },
  lastActivity: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 8,
  },
  irregularitiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  irregularitiesText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '500',
  },
  productivityChart: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[700],
    marginBottom: 16,
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    width: '100%',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 8,
  },
  violationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  violationApp: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  violationCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.danger,
  },
  focusMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  focusLabel: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  focusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  irregularityCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  irregularityHeader: {
    marginBottom: 12,
  },
  irregularityName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  irregularityDepartment: {
    fontSize: 14,
    color: Colors.gray[600],
    marginTop: 2,
  },
  irregularityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  irregularityText: {
    fontSize: 14,
    color: Colors.gray[700],
    flex: 1,
  },
  reviewButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  reviewButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  noIrregularities: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noIrregularitiesText: {
    fontSize: 16,
    color: Colors.gray[600],
  },
});