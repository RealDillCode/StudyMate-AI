import { create } from 'zustand';
import { sessionApi } from '@/mocks/services/sessionApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isEnabled as isScreenTimeEnabled, requestAuthorization, startWorkLimit, stopWorkLimit } from '@/lib/services/ScreenTimeService';
import { logger } from '@/lib/logger';
import { captureEvent } from '@/lib/telemetry';

export type SessionStatus = 'idle' | 'starting' | 'active' | 'stopping';

export type SessionEvent = { type: 'bypass'; at: string };

export type CompletedSession = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  events: SessionEvent[];
};

export type SessionState = {
  status: SessionStatus;
  currentSessionId: string | null;
  startedAt: string | null; // ISO string
  events: SessionEvent[];
  screenTimeAuthorized: boolean;
  startSession: () => Promise<void>;
  requestBypass: () => void;
  stopSession: () => Promise<CompletedSession | null>;
};

const STORAGE_KEY = 'optivise:sessions';
const AUTH_REQ_KEY = 'optivise:st_auth_requested';

async function appendCompletedSession(record: CompletedSession): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: CompletedSession[] = existing ? JSON.parse(existing) : [];
    parsed.unshift(record);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch (e) {
    logger.error('Failed to persist session history', e);
  }
}

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'idle',
  currentSessionId: null,
  startedAt: null,
  events: [],
  screenTimeAuthorized: true,
  startSession: async () => {
    if (get().status === 'active' || get().status === 'starting') return;
    set({ status: 'starting' });

    if (isScreenTimeEnabled()) {
      const alreadyRequested = await AsyncStorage.getItem(AUTH_REQ_KEY);
      if (!alreadyRequested) {
        const ok = await requestAuthorization();
        await AsyncStorage.setItem(AUTH_REQ_KEY, '1');
        if (!ok) {
          set({ screenTimeAuthorized: false });
        } else {
          set({ screenTimeAuthorized: true });
        }
      }
      if (get().screenTimeAuthorized) {
        const now = new Date();
        await startWorkLimit({ start: `${now.getHours()}:${now.getMinutes()}`, end: '23:59', days: [0,1,2,3,4,5,6] });
      }
    }

    const res = await sessionApi.start();
    set({ status: 'active', currentSessionId: res.sessionId, startedAt: res.startedAt, events: [] });
    captureEvent({ type: 'session_started', sessionId: res.sessionId, startedAt: res.startedAt });
  },
  requestBypass: () => {
    if (get().status !== 'active') return;
    const newEvent: SessionEvent = { type: 'bypass', at: new Date().toISOString() };
    set({ events: [...get().events, newEvent] });
    captureEvent({ type: 'shield_bypass', at: newEvent.at });
  },
  stopSession: async () => {
    if (get().status !== 'active') return null;
    set({ status: 'stopping' });
    const id = get().currentSessionId!;
    const startedAt = get().startedAt!;
    const stopRes = await sessionApi.stop(id);
    const endedAt = new Date().toISOString();
    const durationSeconds = stopRes.durationSeconds || Math.max(1, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    const record: CompletedSession = { id, startedAt, endedAt, durationSeconds, events: get().events };
    await appendCompletedSession(record);

    if (isScreenTimeEnabled()) {
      await stopWorkLimit();
    }

    set({ status: 'idle', currentSessionId: null, startedAt: null, events: [] });
    captureEvent({ type: 'session_ended', sessionId: id, endedAt, durationSeconds });
    return record;
  },
}));