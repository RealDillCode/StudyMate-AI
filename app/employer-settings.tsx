import { router } from 'expo-router';
import { 
  Building2, 
  Clock, 
  Coffee, 
  MapPin, 
  Settings, 
  Shield,
  Users,
  Smartphone,
  Bell,
  Plus,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';

import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { EmployerProfile, BreakPolicy, WorkLocation } from '@/types';

type SettingsTab = 'company' | 'employees' | 'locations' | 'apps' | 'notifications';

export default function EmployerSettingsScreen() {
  const { currentProfile, updateProfile } = useUserProfile();
  const employerProfile = currentProfile as EmployerProfile;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState<boolean>(false);

  
  const [settings, setSettings] = useState({
    companyName: employerProfile?.companySettings.companyName || '',
    workHours: {
      start: employerProfile?.companySettings.workPolicies.defaultWorkHours.start || '09:00',
      end: employerProfile?.companySettings.workPolicies.defaultWorkHours.end || '17:00',
    },
    breakPolicies: employerProfile?.companySettings.workPolicies.breakPolicies || [],
    geofencing: {
      enabled: employerProfile?.companySettings.geofencing.enabled || false,
      autoClockIn: employerProfile?.companySettings.geofencing.autoClockIn || false,
      autoClockOut: employerProfile?.companySettings.geofencing.autoClockOut || false,
      radius: employerProfile?.companySettings.geofencing.radius || 100,
      workLocations: employerProfile?.companySettings.geofencing.workLocations || [],
    },
    overtimeRules: {
      enabled: employerProfile?.companySettings.workPolicies.overtimeRules.enabled ?? false,
      maxHoursPerDay: employerProfile?.companySettings.workPolicies.overtimeRules.maxHoursPerDay || 10,
      requireApproval: employerProfile?.companySettings.workPolicies.overtimeRules.requireApproval ?? false,
    },
    clockInGracePeriod: employerProfile?.companySettings.workPolicies.clockInGracePeriod || 15,
    autoClockOut: {
      enabled: employerProfile?.companySettings.workPolicies.autoClockOut.enabled ?? false,
      afterHours: employerProfile?.companySettings.workPolicies.autoClockOut.afterHours || 12,
    },
    appCategories: employerProfile?.companySettings.appCategories || [],
    notifications: employerProfile?.companySettings.notifications || {
      clockReminders: true,
      breakReminders: true,
      focusAlerts: true,
      productivityReports: true,
      scheduleChanges: true,
    },
  });

  // Mock employee data
  const [employees, setEmployees] = useState([
    { id: '1', name: 'John Doe', email: 'john@company.com', department: 'Engineering', status: 'active', role: 'Developer' },
    { id: '2', name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing', status: 'active', role: 'Manager' },
    { id: '3', name: 'Mike Johnson', email: 'mike@company.com', department: 'Sales', status: 'inactive', role: 'Representative' },
  ]);

  // Mock app categories
  const [appCategories, setAppCategories] = useState([
    { category: 'productivity', isAllowed: true, apps: ['Microsoft Office', 'Google Workspace', 'Slack'] },
    { category: 'communication', isAllowed: true, apps: ['Teams', 'Zoom', 'Email'] },
    { category: 'social', isAllowed: false, apps: ['Facebook', 'Instagram', 'Twitter'] },
    { category: 'entertainment', isAllowed: false, apps: ['Netflix', 'YouTube', 'Spotify'] },
    { category: 'games', isAllowed: false, apps: ['Candy Crush', 'Fortnite', 'Among Us'] },
  ]);

  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([
    { id: '1', name: 'Main Office', address: '123 Business St', latitude: 40.7128, longitude: -74.0060, radius: 100, isActive: true },
    { id: '2', name: 'Branch Office', address: '456 Commerce Ave', latitude: 40.7589, longitude: -73.9851, radius: 150, isActive: true },
  ]);

  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    radius: 100,
  });

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
  });

  const handleSave = async () => {
    if (!employerProfile) return;

    try {
      setIsLoading(true);

      const updatedProfile: EmployerProfile = {
        ...employerProfile,
        companySettings: {
          ...employerProfile.companySettings,
          companyName: settings.companyName,
          workPolicies: {
            ...employerProfile.companySettings.workPolicies,
            defaultWorkHours: settings.workHours,
            breakPolicies: settings.breakPolicies,
            overtimeRules: settings.overtimeRules,
            clockInGracePeriod: settings.clockInGracePeriod,
            autoClockOut: settings.autoClockOut,
          },
          geofencing: {
            ...employerProfile.companySettings.geofencing,
            ...settings.geofencing,
            workLocations,
          },
          appCategories: settings.appCategories,
          notifications: settings.notifications,
        },
      };

      await updateProfile(updatedProfile);
      Alert.alert('Success', 'Settings saved successfully');
      router.back();
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addBreakPolicy = () => {
    const newBreakPolicy: BreakPolicy = {
      id: `break_${Date.now()}`,
      type: 'coffee',
      duration: 15,
      isPaid: true,
      pausesClock: false,
      isRequired: false,
      maxPerDay: 2,
    };

    setSettings({
      ...settings,
      breakPolicies: [...settings.breakPolicies, newBreakPolicy],
    });
  };

  const updateBreakPolicy = (index: number, updates: Partial<BreakPolicy>) => {
    const updatedPolicies = [...settings.breakPolicies];
    updatedPolicies[index] = { ...updatedPolicies[index], ...updates };
    setSettings({ ...settings, breakPolicies: updatedPolicies });
  };

  const removeBreakPolicy = (index: number) => {
    const updatedPolicies = settings.breakPolicies.filter((_, i) => i !== index);
    setSettings({ ...settings, breakPolicies: updatedPolicies });
  };

  const addWorkLocation = () => {
    if (!newLocation.name || !newLocation.address) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const location: WorkLocation = {
      id: `location_${Date.now()}`,
      name: newLocation.name,
      address: newLocation.address,
      latitude: newLocation.latitude || 0,
      longitude: newLocation.longitude || 0,
      radius: newLocation.radius,
      isActive: true,
    };

    setWorkLocations([...workLocations, location]);
    setNewLocation({ name: '', address: '', latitude: 0, longitude: 0, radius: 100 });
    setShowLocationModal(false);
  };

  const removeWorkLocation = (id: string) => {
    setWorkLocations(workLocations.filter(loc => loc.id !== id));
  };

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department || !newEmployee.role) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const employee = {
      id: `emp_${Date.now()}`,
      name: newEmployee.name,
      email: newEmployee.email,
      department: newEmployee.department,
      role: newEmployee.role,
      status: 'active',
    };

    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', email: '', department: '', role: '' });
    setShowEmployeeModal(false);
  };

  const toggleEmployeeStatus = (id: string) => {
    setEmployees(employees.map(emp => 
      emp.id === id 
        ? { ...emp, status: emp.status === 'active' ? 'inactive' : 'active' }
        : emp
    ));
  };

  const removeEmployee = (id: string) => {
    Alert.alert(
      'Remove Employee',
      'Are you sure you want to remove this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => {
          setEmployees(employees.filter(emp => emp.id !== id));
        }},
      ]
    );
  };

  const toggleAppCategory = (category: string) => {
    setAppCategories(appCategories.map(cat => 
      cat.category === category 
        ? { ...cat, isAllowed: !cat.isAllowed }
        : cat
    ));
  };

  const renderTabButton = (tab: SettingsTab, icon: React.ReactNode, title: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderBreakPolicy = (policy: BreakPolicy, index: number) => (
    <View key={policy.id} style={styles.breakPolicyCard}>
      <View style={styles.breakPolicyHeader}>
        <Text style={styles.breakPolicyTitle}>
          {policy.type.charAt(0).toUpperCase() + policy.type.slice(1)} Break
        </Text>
        <TouchableOpacity
          onPress={() => removeBreakPolicy(index)}
          style={styles.removeButton}
        >
          <Trash2 size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.breakPolicyRow}>
        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.numberInput}
          value={policy.duration.toString()}
          onChangeText={(text) => 
            updateBreakPolicy(index, { duration: parseInt(text) || 0 })
          }
          keyboardType="numeric"
        />
      </View>

      <View style={styles.breakPolicyRow}>
        <Text style={styles.label}>Max per day</Text>
        <TextInput
          style={styles.numberInput}
          value={policy.maxPerDay.toString()}
          onChangeText={(text) => 
            updateBreakPolicy(index, { maxPerDay: parseInt(text) || 0 })
          }
          keyboardType="numeric"
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Paid break</Text>
        <Switch
          value={policy.isPaid}
          onValueChange={(value) => updateBreakPolicy(index, { isPaid: value })}
          trackColor={{ false: Colors.gray[300], true: Colors.primary }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Pauses clock</Text>
        <Switch
          value={policy.pausesClock}
          onValueChange={(value) => updateBreakPolicy(index, { pausesClock: value })}
          trackColor={{ false: Colors.gray[300], true: Colors.primary }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Required</Text>
        <Switch
          value={policy.isRequired}
          onValueChange={(value) => updateBreakPolicy(index, { isRequired: value })}
          trackColor={{ false: Colors.gray[300], true: Colors.primary }}
        />
      </View>
    </View>
  );

  const renderCompanyTab = () => (
    <>
      {/* Company Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Building2 size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Company Information</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            style={styles.input}
            value={settings.companyName}
            onChangeText={(text) => setSettings({ ...settings, companyName: text })}
            placeholder="Enter company name"
          />
        </View>
      </View>

      {/* Work Hours */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Default Work Hours</Text>
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeInput}>
            <Text style={styles.label}>Start Time</Text>
            <TextInput
              style={styles.input}
              value={settings.workHours.start}
              onChangeText={(text) => 
                setSettings({ 
                  ...settings, 
                  workHours: { ...settings.workHours, start: text } 
                })
              }
              placeholder="09:00"
            />
          </View>

          <View style={styles.timeInput}>
            <Text style={styles.label}>End Time</Text>
            <TextInput
              style={styles.input}
              value={settings.workHours.end}
              onChangeText={(text) => 
                setSettings({ 
                  ...settings, 
                  workHours: { ...settings.workHours, end: text } 
                })
              }
              placeholder="17:00"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Clock-in Grace Period (minutes)</Text>
          <TextInput
            style={styles.input}
            value={settings.clockInGracePeriod.toString()}
            onChangeText={(text) => 
              setSettings({ ...settings, clockInGracePeriod: parseInt(text) || 0 })
            }
            keyboardType="numeric"
            placeholder="15"
          />
        </View>
      </View>

      {/* Break Policies */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Coffee size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Break Policies</Text>
        </View>

        {settings.breakPolicies.map((policy, index) => 
          renderBreakPolicy(policy, index)
        )}

        <Button
          title="Add Break Policy"
          onPress={addBreakPolicy}
          variant="outline"
          style={styles.addButton}
        />
      </View>

      {/* Overtime Rules */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Overtime Rules</Text>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Enable Overtime Tracking</Text>
          <Switch
            value={settings.overtimeRules.enabled}
            onValueChange={(value: boolean) => 
              setSettings({ 
                ...settings, 
                overtimeRules: { ...settings.overtimeRules, enabled: value } 
              })
            }
            trackColor={{ false: Colors.gray['300'], true: Colors.primary }}
          />
        </View>

        {settings.overtimeRules.enabled && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Hours Per Day</Text>
              <TextInput
                style={styles.input}
                value={settings.overtimeRules.maxHoursPerDay.toString()}
                onChangeText={(text) => 
                  setSettings({ 
                    ...settings, 
                    overtimeRules: { 
                      ...settings.overtimeRules, 
                      maxHoursPerDay: parseInt(text) || 8 
                    } 
                  })
                }
                keyboardType="numeric"
                placeholder="10"
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Require Approval</Text>
              <Switch
                value={settings.overtimeRules.requireApproval}
                onValueChange={(value: boolean) => 
                  setSettings({ 
                    ...settings, 
                    overtimeRules: { ...settings.overtimeRules, requireApproval: value } 
                  })
                }
                trackColor={{ false: Colors.gray['300'], true: Colors.primary }}
              />
            </View>
          </>
        )}
      </View>

      {/* Auto Clock Out */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Settings size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Auto Clock Out</Text>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Enable Auto Clock Out</Text>
          <Switch
            value={settings.autoClockOut.enabled}
            onValueChange={(value: boolean) => 
              setSettings({ 
                ...settings, 
                autoClockOut: { ...settings.autoClockOut, enabled: value } 
              })
            }
            trackColor={{ false: Colors.gray['300'], true: Colors.primary }}
          />
        </View>

        {settings.autoClockOut.enabled && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>After Hours of Inactivity</Text>
            <TextInput
              style={styles.input}
              value={settings.autoClockOut.afterHours.toString()}
              onChangeText={(text) => 
                setSettings({ 
                  ...settings, 
                  autoClockOut: { 
                    ...settings.autoClockOut, 
                    afterHours: parseInt(text) || 12 
                  } 
                })
              }
              keyboardType="numeric"
              placeholder="12"
            />
          </View>
        )}
      </View>
    </>
  );

  const renderEmployeesTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Users size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>Employee Management</Text>
        <TouchableOpacity
          style={styles.addIconButton}
          onPress={() => setShowEmployeeModal(true)}
        >
          <Plus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {employees.map((employee) => (
        <View key={employee.id} style={styles.employeeCard}>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{employee.name}</Text>
            <Text style={styles.employeeDetails}>{employee.email}</Text>
            <Text style={styles.employeeDetails}>{employee.department} • {employee.role}</Text>
          </View>
          <View style={styles.employeeActions}>
            <TouchableOpacity
              style={[styles.statusButton, employee.status === 'active' ? styles.activeStatus : styles.inactiveStatus]}
              onPress={() => toggleEmployeeStatus(employee.id)}
            >
              {employee.status === 'active' ? (
                <CheckCircle size={16} color={Colors.white} />
              ) : (
                <XCircle size={16} color={Colors.white} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeEmployee(employee.id)}
            >
              <Trash2 size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderLocationsTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MapPin size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>Work Locations</Text>
        <TouchableOpacity
          style={styles.addIconButton}
          onPress={() => setShowLocationModal(true)}
        >
          <Plus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Enable Geofencing</Text>
        <Switch
          value={settings.geofencing.enabled}
          onValueChange={(value) => 
            setSettings({ 
              ...settings, 
              geofencing: { ...settings.geofencing, enabled: value } 
            })
          }
          trackColor={{ false: Colors.gray[300], true: Colors.primary }}
        />
      </View>

      {settings.geofencing.enabled && (
        <>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Auto Clock In</Text>
            <Switch
              value={settings.geofencing.autoClockIn}
              onValueChange={(value) => 
                setSettings({ 
                  ...settings, 
                  geofencing: { ...settings.geofencing, autoClockIn: value } 
                })
              }
              trackColor={{ false: Colors.gray[300], true: Colors.primary }}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Auto Clock Out</Text>
            <Switch
              value={settings.geofencing.autoClockOut}
              onValueChange={(value) => 
                setSettings({ 
                  ...settings, 
                  geofencing: { ...settings.geofencing, autoClockOut: value } 
                })
              }
              trackColor={{ false: Colors.gray[300], true: Colors.primary }}
            />
          </View>

          {workLocations.map((location) => (
            <View key={location.id} style={styles.locationCard}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationAddress}>{location.address}</Text>
                <Text style={styles.locationDetails}>Radius: {location.radius}m</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeWorkLocation(location.id)}
              >
                <Trash2 size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </View>
  );

  const renderAppsTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Smartphone size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>App Management</Text>
      </View>

      {appCategories.map((category) => (
        <View key={category.category} style={styles.appCategoryCard}>
          <View style={styles.appCategoryHeader}>
            <Text style={styles.appCategoryTitle}>
              {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
            </Text>
            <Switch
              value={category.isAllowed}
              onValueChange={() => toggleAppCategory(category.category)}
              trackColor={{ false: Colors.gray[300], true: Colors.primary }}
            />
          </View>
          <Text style={styles.appList}>
            Apps: {category.apps.join(', ')}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Bell size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>Notification Settings</Text>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Clock Reminders</Text>
        <Switch
          value={settings.notifications.clockReminders}
          onValueChange={(value) => 
            setSettings({ 
              ...settings, 
              notifications: { ...settings.notifications, clockReminders: value } 
            })
          }
          trackColor={{ false: Colors.gray[300], true: Colors.primary }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Break Reminders</Text>
        <Switch
          value={settings.notifications.breakReminders}
          onValueChange={(value) => 
            setSettings({ 
              ...settings, 
              notifications: { ...settings.notifications, breakReminders: value } 
            })
          }
          trackColor={{ false: Colors.gray[300], true: Colors.primary }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Focus Alerts</Text>
        <Switch
          value={settings.notifications.focusAlerts}
          onValueChange={(value) => 
            setSettings({ 
              ...settings, 
              notifications: { ...settings.notifications, focusAlerts: value } 
            })
          }
          trackColor={{ false: Colors.gray[300], true: Colors.primary }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Productivity Reports</Text>
        <Switch
          value={settings.notifications.productivityReports}
          onValueChange={(value) => 
            setSettings({ 
              ...settings, 
              notifications: { ...settings.notifications, productivityReports: value } 
            })
          }
          trackColor={{ false: Colors.gray[300], true: Colors.primary }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Schedule Changes</Text>
        <Switch
          value={settings.notifications.scheduleChanges}
          onValueChange={(value) => 
            setSettings({ 
              ...settings, 
              notifications: { ...settings.notifications, scheduleChanges: value } 
            })
          }
          trackColor={{ false: Colors.gray[300], true: Colors.primary }}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Building2 size={32} color={Colors.primary} />
        <Text style={styles.title}>Employer Dashboard</Text>
        <Text style={styles.subtitle}>Manage your company settings and employees</Text>
      </View>

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {renderTabButton('company', <Building2 size={20} color={activeTab === 'company' ? Colors.white : Colors.primary} />, 'Company')}
        {renderTabButton('employees', <Users size={20} color={activeTab === 'employees' ? Colors.white : Colors.primary} />, 'Employees')}
        {renderTabButton('locations', <MapPin size={20} color={activeTab === 'locations' ? Colors.white : Colors.primary} />, 'Locations')}
        {renderTabButton('apps', <Smartphone size={20} color={activeTab === 'apps' ? Colors.white : Colors.primary} />, 'Apps')}
        {renderTabButton('notifications', <Bell size={20} color={activeTab === 'notifications' ? Colors.white : Colors.primary} />, 'Notifications')}
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'company' && renderCompanyTab()}
        {activeTab === 'employees' && renderEmployeesTab()}
        {activeTab === 'locations' && renderLocationsTab()}
        {activeTab === 'apps' && renderAppsTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}

        <View style={styles.buttonContainer}>
          <Button
            title="Save All Settings"
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>

      {/* Add Employee Modal */}
      <Modal
        visible={showEmployeeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Employee</Text>
            <TouchableOpacity onPress={() => setShowEmployeeModal(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={newEmployee.name}
                onChangeText={(text) => setNewEmployee({ ...newEmployee, name: text })}
                placeholder="Enter employee name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={newEmployee.email}
                onChangeText={(text) => setNewEmployee({ ...newEmployee, email: text })}
                placeholder="Enter email address"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department</Text>
              <TextInput
                style={styles.input}
                value={newEmployee.department}
                onChangeText={(text) => setNewEmployee({ ...newEmployee, department: text })}
                placeholder="Enter department"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role</Text>
              <TextInput
                style={styles.input}
                value={newEmployee.role}
                onChangeText={(text) => setNewEmployee({ ...newEmployee, role: text })}
                placeholder="Enter role"
              />
            </View>

            <Button
              title="Add Employee"
              onPress={addEmployee}
              style={styles.modalButton}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Add Location Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Work Location</Text>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location Name</Text>
              <TextInput
                style={styles.input}
                value={newLocation.name}
                onChangeText={(text) => setNewLocation({ ...newLocation, name: text })}
                placeholder="Enter location name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={newLocation.address}
                onChangeText={(text) => setNewLocation({ ...newLocation, address: text })}
                placeholder="Enter address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Radius (meters)</Text>
              <TextInput
                style={styles.input}
                value={newLocation.radius.toString()}
                onChangeText={(text) => setNewLocation({ ...newLocation, radius: parseInt(text) || 100 })}
                placeholder="100"
                keyboardType="numeric"
              />
            </View>

            <Button
              title="Add Location"
              onPress={addWorkLocation}
              style={styles.modalButton}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[100],
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    marginTop: 4,
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
  addIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    width: 80,
    textAlign: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  breakPolicyCard: {
    backgroundColor: Colors.gray['50'],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  breakPolicyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakPolicyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  breakPolicyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  removeButton: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButton: {
    marginTop: 8,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.gray['50'],
    borderRadius: 12,
    marginBottom: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  employeeDetails: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 2,
  },
  employeeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    padding: 8,
    borderRadius: 8,
  },
  activeStatus: {
    backgroundColor: Colors.success,
  },
  inactiveStatus: {
    backgroundColor: Colors.gray[500],
  },
  deleteButton: {
    backgroundColor: Colors.danger,
    padding: 8,
    borderRadius: 8,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.gray['50'],
    borderRadius: 12,
    marginBottom: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 2,
  },
  locationDetails: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  appCategoryCard: {
    padding: 16,
    backgroundColor: Colors.gray['50'],
    borderRadius: 12,
    marginBottom: 12,
  },
  appCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  appList: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  buttonContainer: {
    marginTop: 24,
  },
  saveButton: {
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  modalClose: {
    fontSize: 16,
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalButton: {
    marginTop: 24,
  },
  tabIcon: {
    // Empty style for icon container
  },
});