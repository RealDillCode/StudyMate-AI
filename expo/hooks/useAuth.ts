import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

export type UserRole = 'employer' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  companyName: string;
}

export interface Company {
  id: string;
  name: string;
  inviteCode: string;
  settings: {
    workHours: {
      start: string;
      end: string;
    };
    breakSettings: {
      lunchDuration: number; // minutes
      shortBreakDuration: number; // minutes
      pausesClock: boolean;
    };
    geofencing: {
      enabled: boolean;
      locations: Array<{
        id: string;
        name: string;
        latitude: number;
        longitude: number;
        radius: number; // meters
      }>;
    };
    allowedApps: string[];
    blockedCategories: string[];
  };
}

interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AUTH_STORAGE_KEY = '@auth_state';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    company: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load auth state from storage on app start
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        setAuthState({
          ...parsedState,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveAuthState = async (state: Omit<AuthState, 'isLoading'>) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock authentication - replace with real API call
      console.log('Logging in:', email);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data based on email
      const isEmployer = email.includes('admin') || email.includes('employer');
      const companyId = 'company_123';
      
      const mockUser: User = {
        id: 'user_' + Date.now(),
        email,
        name: email.split('@')[0],
        role: isEmployer ? 'employer' : 'employee',
        companyId,
        companyName: 'Demo Company',
      };
      
      const mockCompany: Company = {
        id: companyId,
        name: 'Demo Company',
        inviteCode: 'DEMO123',
        settings: {
          workHours: {
            start: '09:00',
            end: '17:00',
          },
          breakSettings: {
            lunchDuration: 60,
            shortBreakDuration: 15,
            pausesClock: true,
          },
          geofencing: {
            enabled: false,
            locations: [],
          },
          allowedApps: ['com.microsoft.office.outlook', 'com.slack.Slack'],
          blockedCategories: ['Social Media', 'Games', 'Entertainment'],
        },
      };
      
      const newState = {
        user: mockUser,
        company: mockCompany,
        isAuthenticated: true,
      };
      
      setAuthState({ ...newState, isLoading: false });
      await saveAuthState(newState);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const registerEmployer = async (data: {
    email: string;
    password: string;
    name: string;
    companyName: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Registering employer:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const companyId = 'company_' + Date.now();
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newUser: User = {
        id: 'user_' + Date.now(),
        email: data.email,
        name: data.name,
        role: 'employer',
        companyId,
        companyName: data.companyName,
      };
      
      const newCompany: Company = {
        id: companyId,
        name: data.companyName,
        inviteCode,
        settings: {
          workHours: {
            start: '09:00',
            end: '17:00',
          },
          breakSettings: {
            lunchDuration: 60,
            shortBreakDuration: 15,
            pausesClock: true,
          },
          geofencing: {
            enabled: false,
            locations: [],
          },
          allowedApps: [],
          blockedCategories: ['Social Media', 'Games', 'Entertainment'],
        },
      };
      
      const newState = {
        user: newUser,
        company: newCompany,
        isAuthenticated: true,
      };
      
      setAuthState({ ...newState, isLoading: false });
      await saveAuthState(newState);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const joinCompany = async (data: {
    email: string;
    password: string;
    name: string;
    inviteCode: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Joining company with code:', data.inviteCode);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation of invite code
      if (data.inviteCode.toUpperCase() !== 'DEMO123') {
        return { success: false, error: 'Invalid invite code. Please check with your employer.' };
      }
      
      const companyId = 'company_123';
      
      const newUser: User = {
        id: 'user_' + Date.now(),
        email: data.email,
        name: data.name,
        role: 'employee',
        companyId,
        companyName: 'Demo Company',
      };
      
      const mockCompany: Company = {
        id: companyId,
        name: 'Demo Company',
        inviteCode: 'DEMO123',
        settings: {
          workHours: {
            start: '09:00',
            end: '17:00',
          },
          breakSettings: {
            lunchDuration: 60,
            shortBreakDuration: 15,
            pausesClock: true,
          },
          geofencing: {
            enabled: false,
            locations: [],
          },
          allowedApps: ['com.microsoft.office.outlook', 'com.slack.Slack'],
          blockedCategories: ['Social Media', 'Games', 'Entertainment'],
        },
      };
      
      const newState = {
        user: newUser,
        company: mockCompany,
        isAuthenticated: true,
      };
      
      setAuthState({ ...newState, isLoading: false });
      await saveAuthState(newState);
      
      return { success: true };
    } catch (error) {
      console.error('Join company error:', error);
      return { success: false, error: 'Failed to join company. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthState({
        user: null,
        company: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateCompanySettings = async (settings: Partial<Company['settings']>) => {
    if (!authState.company) return;
    
    const updatedCompany = {
      ...authState.company,
      settings: {
        ...authState.company.settings,
        ...settings,
      },
    };
    
    const newState = {
      ...authState,
      company: updatedCompany,
    };
    
    setAuthState({ ...newState, isLoading: false });
    await saveAuthState(newState);
  };

  return {
    ...authState,
    login,
    registerEmployer,
    joinCompany,
    logout,
    updateCompanySettings,
  };
});