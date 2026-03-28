import { useCallback, useEffect, useState } from 'react';

import { mockAppUsage } from '@/mocks/data';
import { AppUsage } from '@/types';

export function useAppUsage() {
  const [appUsage, setAppUsage] = useState<AppUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allowedApps, setAllowedApps] = useState<string[]>([]);
  const [blockedApps, setBlockedApps] = useState<string[]>([]);

  // Load app usage data
  useEffect(() => {
    // In a real app, this would fetch data from the Screen Time API
    // For now, we'll use mock data
    setAppUsage(mockAppUsage);
    
    // Set initial allowed and blocked apps
    const allowed = mockAppUsage
      .filter(app => app.isWorkApp)
      .map(app => app.appName);
    
    const blocked = mockAppUsage
      .filter(app => !app.isWorkApp)
      .map(app => app.appName);
    
    setAllowedApps(allowed);
    setBlockedApps(blocked);
    setIsLoading(false);
  }, []);

  // Toggle app between allowed and blocked
  const toggleAppStatus = useCallback((appName: string) => {
    if (allowedApps.includes(appName)) {
      // Move from allowed to blocked
      setAllowedApps(allowedApps.filter(name => name !== appName));
      setBlockedApps([...blockedApps, appName]);
      
      // Update app usage data
      setAppUsage(appUsage.map(app => 
        app.appName === appName ? { ...app, isWorkApp: false } : app
      ));
    } else if (blockedApps.includes(appName)) {
      // Move from blocked to allowed
      setBlockedApps(blockedApps.filter(name => name !== appName));
      setAllowedApps([...allowedApps, appName]);
      
      // Update app usage data
      setAppUsage(appUsage.map(app => 
        app.appName === appName ? { ...app, isWorkApp: true } : app
      ));
    }
  }, [allowedApps, blockedApps, appUsage]);

  // Get productive and non-productive app usage
  const getProductiveAppUsage = useCallback(() => {
    return appUsage.filter(app => app.isWorkApp);
  }, [appUsage]);

  const getNonProductiveAppUsage = useCallback(() => {
    return appUsage.filter(app => !app.isWorkApp);
  }, [appUsage]);

  // Calculate total productive and non-productive time
  const getProductiveTime = useCallback(() => {
    return getProductiveAppUsage().reduce((total, app) => total + app.usageTime, 0);
  }, [getProductiveAppUsage]);

  const getNonProductiveTime = useCallback(() => {
    return getNonProductiveAppUsage().reduce((total, app) => total + app.usageTime, 0);
  }, [getNonProductiveAppUsage]);

  return {
    appUsage,
    isLoading,
    allowedApps,
    blockedApps,
    toggleAppStatus,
    getProductiveAppUsage,
    getNonProductiveAppUsage,
    getProductiveTime,
    getNonProductiveTime,
  };
}