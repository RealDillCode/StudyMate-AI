import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

import { useAppUsage } from '@/hooks/useAppUsage';
import { useFocusMetrics } from '@/hooks/useFocusMetrics';
import { useWorkSession } from '@/hooks/useWorkSession';

// Create a global app store to share state across the app
export const [AppStoreProvider, useAppStore] = createContextHook(() => {
  const workSessionHook = useWorkSession();
  const appUsageHook = useAppUsage();
  const focusMetricsHook = useFocusMetrics();
  
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  
  // Check if this is the first launch
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem('hasLaunched');
        if (value === null) {
          // First launch
          await AsyncStorage.setItem('hasLaunched', 'true');
          setIsFirstLaunch(true);
        } else {
          // Not first launch
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstLaunch(false);
      }
    };
    
    checkFirstLaunch();
  }, []);
  
  return {
    // Work session state and methods
    ...workSessionHook,
    
    // App usage state and methods
    ...appUsageHook,
    
    // Focus metrics state and methods
    ...focusMetricsHook,
    
    // First launch state
    isFirstLaunch,
  };
});