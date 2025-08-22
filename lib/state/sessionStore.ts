import { create } from 'zustand';
import { sessionApi } from '@/mocks/services/sessionApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  startSession: () => Promise<void>;
  requestBypass: () => void;
  stopSession: () => Promise<CompletedSession | null>;
};

const STORAGE_KEY = 'optivise:sessions';

async function appendCompletedSession(record: CompletedSession): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: CompletedSession[] = existing ? JSON.parse(existing) : [];
    parsed.unshift(record);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch (e) {
    console.error('Failed to persist session history', e);
  }
}

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'idle',
  currentSessionId: null,
  startedAt: null,
  events: [],
  startSession: async () => {
    if (get().status === 'active' || get().status === 'starting') return;
    set({ status: 'starting' });
    const res = await sessionApi.start();
    set({ status: 'active', currentSessionId: res.sessionId, startedAt: res.startedAt, events: [] });
  },
  requestBypass: () => {
    if (get().status !== 'active') return;
    const newEvent: SessionEvent = { type: 'bypass', at: new Date().toISOString() };
    set({ events: [...get().events, newEvent] });
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
    set({ status: 'idle', currentSessionId: null, startedAt: null, events: [] });
    return record;
  },
}));