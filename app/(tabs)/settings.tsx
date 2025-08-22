import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Bell, Building2, ChevronRight, Clock, Lock, LogOut, MapPin, Shield, Users } from "lucide-react-native";

import { Colors } from "@/constants/colors";
import { useUserProfile } from "@/hooks/useUserProfile";


export default function SettingsScreen() {
  const { currentProfile, isEmployer, clearProfile } = useUserProfile();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  if (!currentProfile) {
    return null;
  }
  
  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await clearProfile();
              router.replace('/onboarding');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileSection}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitials}>
            {currentProfile.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{currentProfile.name}</Text>
          <Text style={styles.profileEmail}>{currentProfile.email}</Text>
          <Text style={styles.profileRole}>
            {currentProfile.role} • {currentProfile.department}
          </Text>
          <Text style={styles.profileType}>
            {isEmployer ? 'Employer Account' : 'Employee Account'}
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Work Schedule</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Clock size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Work Hours</Text>
            <Text style={styles.settingValue}>
              {currentProfile.workSchedule.workHours.start} - {currentProfile.workSchedule.workHours.end}
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.gray[400]} />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Clock size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Work Days</Text>
            <Text style={styles.settingValue}>
              {currentProfile.workSchedule.workDays
                .map(day => day.charAt(0).toUpperCase() + day.slice(1, 3))
                .join(', ')}
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.gray[400]} />
        </View>
      </View>
      
      {/* Employer-specific settings */}
      {isEmployer && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employer Controls</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/employer-settings')}
          >
            <View style={styles.settingIconContainer}>
              <Building2 size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Company Settings</Text>
              <Text style={styles.settingDescription}>
                Configure work policies, breaks, and geofencing
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Users size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Manage Employees</Text>
              <Text style={styles.settingDescription}>
                View and manage employee accounts
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <MapPin size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Work Locations</Text>
              <Text style={styles.settingDescription}>
                Set up geofencing for work locations
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Bell size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Notifications</Text>
            <Text style={styles.settingDescription}>
              Configure app notifications
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.gray[400]} />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Lock size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>App Blocking</Text>
            <Text style={styles.settingDescription}>
              Configure app blocking settings
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.gray[400]} />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Shield size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Privacy</Text>
            <Text style={styles.settingDescription}>
              Manage your privacy settings
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.gray[400]} />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Bell size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Focus Reminders</Text>
            <Text style={styles.settingDescription}>
              Get reminders to stay focused
            </Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: Colors.gray[300], true: `${Colors.primary}80` }}
            thumbColor={Colors.primary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Bell size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Break Reminders</Text>
            <Text style={styles.settingDescription}>
              Get reminders to take breaks
            </Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: Colors.gray[300], true: `${Colors.primary}80` }}
            thumbColor={Colors.primary}
          />
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={isLoading}
      >
        <LogOut size={20} color={Colors.danger} style={styles.logoutIcon} />
        <Text style={styles.logoutText}>
          {isLoading ? 'Logging out...' : 'Log Out'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>Version 1.0.0</Text>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
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
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray[800],
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 2,
  },
  profileType: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[800],
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  settingValue: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.danger,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.gray[500],
    marginBottom: 24,
  },
});