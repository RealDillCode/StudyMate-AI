import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { mockWorkSessions } from '@/mocks/data';
import { Break, WorkSession } from '@/types';
import { calculateDuration } from '@/utils/timeUtils';

const STORAGE_KEY = 'workSessions';

export function useWorkSession() {
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  const [currentBreak, setCurrentBreak] = useState<Break | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load work sessions from storage
  useEffect(() => {
    const loadWorkSessions = async () => {
      try {
        const storedSessions = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedSessions) {
          const parsedSessions = JSON.parse(storedSessions) as WorkSession[];
          
          // Convert string dates back to Date objects
          const sessionsWithDates = parsedSessions.map(session => ({
            ...session,
            startTime: new Date(session.startTime),
            endTime: session.endTime ? new Date(session.endTime) : null,
            breaks: session.breaks.map(breakItem => ({
              ...breakItem,
              startTime: new Date(breakItem.startTime),
              endTime: breakItem.endTime ? new Date(breakItem.endTime) : null,
            })),
          }));
          
          setWorkSessions(sessionsWithDates);
          
          // Find active session if any
          const activeSession = sessionsWithDates.find(session => session.isActive);
          if (activeSession) {
            setCurrentSession(activeSession);
            
            // Find active break if any
            const activeBreak = activeSession.breaks.find(breakItem => breakItem.isActive);
            if (activeBreak) {
              setCurrentBreak(activeBreak);
            }
          }
        } else {
          // Use mock data for first launch
          setWorkSessions(mockWorkSessions);
        }
      } catch (error) {
        console.error('Failed to load work sessions:', error);
        Alert.alert('Error', 'Failed to load work sessions');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkSessions();
  }, []);

  // Save work sessions to storage
  const saveWorkSessions = useCallback(async (sessions: WorkSession[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save work sessions:', error);
      Alert.alert('Error', 'Failed to save work sessions');
    }
  }, []);

  // Start a new work session
  const startWorkSession = useCallback(() => {
    if (currentSession) {
      Alert.alert('Session in progress', 'You already have an active work session');
      return;
    }

    const newSession: WorkSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: null,
      duration: null,
      isActive: true,
      breaks: [],
    };

    const updatedSessions = [newSession, ...workSessions];
    setWorkSessions(updatedSessions);
    setCurrentSession(newSession);
    saveWorkSessions(updatedSessions);
  }, [currentSession, workSessions, saveWorkSessions]);

  // End the current work session
  const endWorkSession = useCallback(() => {
    if (!currentSession) {
      Alert.alert('No active session', 'You don\'t have an active work session');
      return;
    }

    if (currentBreak) {
      Alert.alert('Break in progress', 'Please end your break before ending your work session');
      return;
    }

    const endTime = new Date();
    const duration = calculateDuration(currentSession.startTime, endTime);

    const updatedSession: WorkSession = {
      ...currentSession,
      endTime,
      duration,
      isActive: false,
    };

    const updatedSessions = workSessions.map(session => 
      session.id === currentSession.id ? updatedSession : session
    );

    setWorkSessions(updatedSessions);
    setCurrentSession(null);
    saveWorkSessions(updatedSessions);
  }, [currentSession, currentBreak, workSessions, saveWorkSessions]);

  // Start a break
  const startBreak = useCallback((type: 'lunch' | 'coffee' | 'personal') => {
    if (!currentSession) {
      Alert.alert('No active session', 'You need to start a work session before taking a break');
      return;
    }

    if (currentBreak) {
      Alert.alert('Break in progress', 'You already have an active break');
      return;
    }

    const newBreak: Break = {
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: null,
      duration: null,
      isActive: true,
      type,
    };

    const updatedSession: WorkSession = {
      ...currentSession,
      breaks: [...currentSession.breaks, newBreak],
    };

    const updatedSessions = workSessions.map(session => 
      session.id === currentSession.id ? updatedSession : session
    );

    setWorkSessions(updatedSessions);
    setCurrentSession(updatedSession);
    setCurrentBreak(newBreak);
    saveWorkSessions(updatedSessions);
  }, [currentSession, currentBreak, workSessions, saveWorkSessions]);

  // End the current break
  const endBreak = useCallback(() => {
    if (!currentSession || !currentBreak) {
      Alert.alert('No active break', 'You don\'t have an active break');
      return;
    }

    const endTime = new Date();
    const duration = calculateDuration(currentBreak.startTime, endTime);

    const updatedBreak: Break = {
      ...currentBreak,
      endTime,
      duration,
      isActive: false,
    };

    const updatedBreaks = currentSession.breaks.map(breakItem => 
      breakItem.id === currentBreak.id ? updatedBreak : breakItem
    );

    const updatedSession: WorkSession = {
      ...currentSession,
      breaks: updatedBreaks,
    };

    const updatedSessions = workSessions.map(session => 
      session.id === currentSession.id ? updatedSession : session
    );

    setWorkSessions(updatedSessions);
    setCurrentSession(updatedSession);
    setCurrentBreak(null);
    saveWorkSessions(updatedSessions);
  }, [currentSession, currentBreak, workSessions, saveWorkSessions]);

  return {
    workSessions,
    currentSession,
    currentBreak,
    isLoading,
    startWorkSession,
    endWorkSession,
    startBreak,
    endBreak,
  };
}