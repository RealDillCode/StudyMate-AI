import { AlertTriangle, Clock, TrendingUp, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );
}

interface AlertItemProps {
  title: string;
  description: string;
  time: string;
  type: 'warning' | 'info';
}

function AlertItem({ title, description, time, type }: AlertItemProps) {
  const alertColor = type === 'warning' ? Colors.warning : Colors.info;
  
  return (
    <View style={styles.alertItem}>
      <View style={[styles.alertIcon, { backgroundColor: alertColor + '20' }]}>
        <AlertTriangle size={16} color={alertColor} />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertDescription}>{description}</Text>
        <Text style={styles.alertTime}>{time}</Text>
      </View>
    </View>
  );
}

export default function EmployerDashboard() {
  const { company } = useAuth();

  const mockEmployees = [
    { id: '1', name: 'John Smith', status: 'active', clockedIn: true, productivity: 85 },
    { id: '2', name: 'Sarah Johnson', status: 'active', clockedIn: true, productivity: 92 },
    { id: '3', name: 'Mike Davis', status: 'break', clockedIn: true, productivity: 78 },
    { id: '4', name: 'Emily Brown', status: 'offline', clockedIn: false, productivity: 88 },
  ];

  const activeEmployees = mockEmployees.filter(emp => emp.clockedIn).length;
  const avgProductivity = Math.round(mockEmployees.reduce((sum, emp) => sum + emp.productivity, 0) / mockEmployees.length);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.companyName}>{company?.name || 'Your Company'}</Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="Active Employees"
            value={`${activeEmployees}/${mockEmployees.length}`}
            subtitle="Currently clocked in"
            icon={<Users size={20} color={Colors.primary} />}
            color={Colors.primary}
          />
          
          <MetricCard
            title="Avg Productivity"
            value={`${avgProductivity}%`}
            subtitle="Team focus score"
            icon={<TrendingUp size={20} color={Colors.secondary} />}
            color={Colors.secondary}
          />
          
          <MetricCard
            title="Total Hours"
            value="156.5h"
            subtitle="This week"
            icon={<Clock size={20} color={Colors.accent} />}
            color={Colors.accent}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <View style={styles.alertsList}>
            <AlertItem
              title="Late Clock-in"
              description="Mike Davis clocked in 15 minutes late"
              time="2 hours ago"
              type="warning"
            />
            <AlertItem
              title="High Productivity"
              description="Sarah Johnson achieved 95% focus score today"
              time="4 hours ago"
              type="info"
            />
            <AlertItem
              title="Extended Break"
              description="John Smith has been on break for 45 minutes"
              time="1 hour ago"
              type="warning"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Status</Text>
          <View style={styles.employeesList}>
            {mockEmployees.map((employee) => (
              <View key={employee.id} style={styles.employeeItem}>
                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{employee.name}</Text>
                  <Text style={styles.employeeStatus}>
                    {employee.status === 'active' ? '🟢 Active' : 
                     employee.status === 'break' ? '🟡 On Break' : '⚫ Offline'}
                  </Text>
                </View>
                <View style={styles.employeeMetrics}>
                  <Text style={styles.productivityScore}>{employee.productivity}%</Text>
                  <Text style={styles.productivityLabel}>Focus</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  companyName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  metricsGrid: {
    marginBottom: 32,
  },
  metricCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 16,
  },
  alertsList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 4,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  employeesList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 4,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  employeeStatus: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  employeeMetrics: {
    alignItems: 'flex-end',
  },
  productivityScore: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  productivityLabel: {
    fontSize: 12,
    color: Colors.gray[500],
  },
});