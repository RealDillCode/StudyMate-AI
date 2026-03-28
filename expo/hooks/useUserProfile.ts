import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

import type { EmployeeProfile, EmployerProfile, UserProfile } from '@/types';

const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  PROFILE_TYPE: 'profile_type',
  ONBOARDING_COMPLETE: 'onboarding_complete',
} as const;

export const [UserProfileProvider, useUserProfile] = createContextHook(() => {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);

  // Load profile from storage on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const [profileData, onboardingData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
      ]);

      if (profileData) {
        const profile = JSON.parse(profileData) as UserProfile;
        // Convert date strings back to Date objects
        profile.createdAt = new Date(profile.createdAt);
        profile.updatedAt = new Date(profile.updatedAt);
        setCurrentProfile(profile);
      }

      setOnboardingComplete(onboardingData === 'true');
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (profile: UserProfile) => {
    try {
      profile.updatedAt = new Date();
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_TYPE, profile.profileType);
      setCurrentProfile(profile);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  const createEmployerProfile = async (data: {
    name: string;
    email: string;
    companyName: string;
    role: string;
    department: string;
  }): Promise<EmployerProfile> => {
    const profile: EmployerProfile = {
      id: `emp_${Date.now()}`,
      name: data.name,
      email: data.email,
      profileType: 'employer',
      role: data.role,
      department: data.department,
      companyId: `comp_${Date.now()}`,
      allowedApps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      workSchedule: {
        workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workHours: {
          start: '09:00',
          end: '17:00',
        },
        breakSchedule: [
          {
            id: 'lunch_default',
            type: 'lunch',
            duration: 60,
            isPaid: false,
            pausesClock: true,
            isRequired: true,
            scheduledTime: '12:00',
            maxPerDay: 1,
          },
          {
            id: 'coffee_default',
            type: 'coffee',
            duration: 15,
            isPaid: true,
            pausesClock: false,
            isRequired: false,
            maxPerDay: 2,
          },
        ],
        isFlexible: false,
        timezone: 'America/New_York',
      },
      companySettings: {
        companyName: data.companyName,
        timezone: 'America/New_York',
        workPolicies: {
          defaultWorkHours: {
            start: '09:00',
            end: '17:00',
          },
          breakPolicies: [
            {
              id: 'lunch_policy',
              type: 'lunch',
              duration: 60,
              isPaid: false,
              pausesClock: true,
              isRequired: true,
              scheduledTime: '12:00',
              maxPerDay: 1,
            },
            {
              id: 'coffee_policy',
              type: 'coffee',
              duration: 15,
              isPaid: true,
              pausesClock: false,
              isRequired: false,
              maxPerDay: 2,
            },
          ],
          overtimeRules: {
            enabled: true,
            maxHoursPerDay: 10,
            requireApproval: true,
          },
          clockInGracePeriod: 15,
          autoClockOut: {
            enabled: true,
            afterHours: 12,
          },
        },
        appCategories: [
          {
            category: 'productivity',
            isAllowed: true,
            specificApps: [],
          },
          {
            category: 'communication',
            isAllowed: true,
            specificApps: [],
          },
          {
            category: 'social',
            isAllowed: false,
            timeRestrictions: {
              maxDailyUsage: 30,
              allowedHours: {
                start: '12:00',
                end: '13:00',
              },
            },
            specificApps: [],
          },
          {
            category: 'entertainment',
            isAllowed: false,
            specificApps: [],
          },
          {
            category: 'games',
            isAllowed: false,
            specificApps: [],
          },
        ],
        geofencing: {
          enabled: false,
          workLocations: [],
          autoClockIn: false,
          autoClockOut: false,
          radius: 100,
          requireLocationPermission: false,
        },
        notifications: {
          clockReminders: true,
          breakReminders: true,
          focusAlerts: true,
          productivityReports: true,
          scheduleChanges: true,
        },
      },
      managedEmployees: [],
      permissions: {
        canManageEmployees: true,
        canViewReports: true,
        canModifyPolicies: true,
        canManageApps: true,
        canSetSchedules: true,
        canViewRealTimeData: true,
      },
    };

    await saveProfile(profile);
    return profile;
  };

  const createEmployeeProfile = async (data: {
    name: string;
    email: string;
    role: string;
    department: string;
    managerId: string;
    companyId: string;
  }): Promise<EmployeeProfile> => {
    const profile: EmployeeProfile = {
      id: `emp_${Date.now()}`,
      name: data.name,
      email: data.email,
      profileType: 'employee',
      role: data.role,
      department: data.department,
      companyId: data.companyId,
      managerId: data.managerId,
      allowedApps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      workSchedule: {
        workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workHours: {
          start: '09:00',
          end: '17:00',
        },
        breakSchedule: [
          {
            id: 'lunch_default',
            type: 'lunch',
            duration: 60,
            isPaid: false,
            pausesClock: true,
            isRequired: true,
            scheduledTime: '12:00',
            maxPerDay: 1,
          },
        ],
        isFlexible: false,
        timezone: 'America/New_York',
      },
      employeeSettings: {
        notifications: {
          clockReminders: true,
          breakReminders: true,
          focusAlerts: true,
          productivityReports: false,
          scheduleChanges: true,
        },
        privacy: {
          shareDetailedReports: false,
          allowRealTimeMonitoring: false,
        },
        personalGoals: {
          dailyFocusTarget: 480, // 8 hours in minutes
          weeklyProductivityGoal: 85, // 85% productivity
        },
      },
    };

    await saveProfile(profile);
    return profile;
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
      setOnboardingComplete(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentProfile) {
      throw new Error('No profile to update');
    }

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date(),
    };

    await saveProfile(updatedProfile);
  };

  const clearProfile = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.removeItem(STORAGE_KEYS.PROFILE_TYPE),
        AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
      ]);
      setCurrentProfile(null);
      setOnboardingComplete(false);
    } catch (error) {
      console.error('Error clearing profile:', error);
      throw error;
    }
  };

  const isEmployer = currentProfile?.profileType === 'employer';
  const isEmployee = currentProfile?.profileType === 'employee';

  return {
    currentProfile,
    isLoading,
    onboardingComplete,
    isEmployer,
    isEmployee,
    createEmployerProfile,
    createEmployeeProfile,
    updateProfile,
    completeOnboarding,
    clearProfile,
    loadProfile,
  };
});