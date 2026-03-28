import { Mail, Plus, Search, UserCheck, UserX } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

interface Employee {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
  productivity: number;
  clockedIn: boolean;
}

export default function EmployeesScreen() {
  const { company } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const mockEmployees: Employee[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@company.com',
      status: 'active',
      lastActive: '2 minutes ago',
      productivity: 85,
      clockedIn: true,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      status: 'active',
      lastActive: '5 minutes ago',
      productivity: 92,
      clockedIn: true,
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike@company.com',
      status: 'active',
      lastActive: '1 hour ago',
      productivity: 78,
      clockedIn: false,
    },
    {
      id: '4',
      name: 'Emily Brown',
      email: 'emily@company.com',
      status: 'pending',
      lastActive: 'Never',
      productivity: 0,
      clockedIn: false,
    },
  ];

  const filteredEmployees = mockEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderEmployeeItem = ({ item }: { item: Employee }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeHeader}>
        <View style={styles.employeeAvatar}>
          <Text style={styles.employeeInitials}>
            {item.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeEmail}>{item.email}</Text>
          <Text style={styles.employeeLastActive}>Last active: {item.lastActive}</Text>
        </View>
        <View style={styles.employeeStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          {item.clockedIn && (
            <View style={styles.clockedInBadge}>
              <Text style={styles.clockedInText}>Clocked In</Text>
            </View>
          )}
        </View>
      </View>
      
      {item.status === 'active' && (
        <View style={styles.employeeMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.productivity}%</Text>
            <Text style={styles.metricLabel}>Productivity</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>7.5h</Text>
            <Text style={styles.metricLabel}>Today</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>38.5h</Text>
            <Text style={styles.metricLabel}>This Week</Text>
          </View>
        </View>
      )}
      
      <View style={styles.employeeActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Mail size={16} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
        
        {item.status === 'pending' ? (
          <TouchableOpacity style={[styles.actionButton, styles.approveButton]}>
            <UserCheck size={16} color={Colors.secondary} />
            <Text style={[styles.actionButtonText, { color: Colors.secondary }]}>Approve</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionButton, styles.deactivateButton]}>
            <UserX size={16} color={Colors.danger} />
            <Text style={[styles.actionButtonText, { color: Colors.danger }]}>Deactivate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.secondary;
      case 'inactive': return Colors.gray[500];
      case 'pending': return Colors.warning;
      default: return Colors.gray[500];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Team Management</Text>
        <Text style={styles.subtitle}>{company?.name}</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employees..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.gray[400]}
          />
        </View>
        
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mockEmployees.filter(e => e.status === 'active').length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mockEmployees.filter(e => e.clockedIn).length}</Text>
          <Text style={styles.statLabel}>Clocked In</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mockEmployees.filter(e => e.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <FlatList
        data={filteredEmployees}
        renderItem={renderEmployeeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.gray[900],
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  employeeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  employeeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  employeeInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  employeeEmail: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  employeeLastActive: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  employeeStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clockedInBadge: {
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clockedInText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  employeeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.gray[100],
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.gray[600],
  },
  employeeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: Colors.secondary + '20',
  },
  deactivateButton: {
    backgroundColor: Colors.danger + '20',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
});