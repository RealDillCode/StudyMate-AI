import { useCallback, useEffect, useState } from 'react';

import { useAppUsage } from '@/hooks/useAppUsage';
import { useWorkSession } from '@/hooks/useWorkSession';
import { mockFocusMetrics } from '@/mocks/data';
import { FocusMetrics } from '@/types';

export function useFocusMetrics() {
  const [focusMetrics, setFocusMetrics] = useState<FocusMetrics>(mockFocusMetrics);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    workSessions, 
    currentSession, 
    currentBreak 
  } = useWorkSession();
  
  const { 
    appUsage, 
    getProductiveTime, 
    getNonProductiveTime 
  } = useAppUsage();

  // Calculate focus metrics
  useEffect(() => {
    if (workSessions.length === 0 || appUsage.length === 0) {
      setIsLoading(false);
      return;
    }

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

    // Get productive and non-productive time
    const productiveTime = getProductiveTime();
    const distractedTime = getNonProductiveTime();

    // Calculate focus score (0-100)
    // Formula: (productive time / (productive time + distracted time)) * 100
    const totalAppTime = productiveTime + distractedTime;
    const focusScore = totalAppTime > 0 
      ? Math.round((productiveTime / totalAppTime) * 100) 
      : 0;

    // Update focus metrics
    setFocusMetrics({
      focusScore,
      productiveTime,
      distractedTime,
      breakTime: totalBreakTime,
      totalWorkTime,
      appUsage,
    });

    setIsLoading(false);
  }, [workSessions, appUsage, getProductiveTime, getNonProductiveTime]);

  // Get current status (working, on break, not working)
  const getCurrentStatus = useCallback(() => {
    if (currentBreak) {
      return 'on-break';
    } else if (currentSession) {
      return 'working';
    } else {
      return 'not-working';
    }
  }, [currentSession, currentBreak]);

  return {
    focusMetrics,
    isLoading,
    getCurrentStatus,
  };
}