import { create } from 'zustand';
import { sessionApi } from '@/mocks/services/sessionApi';

export type SessionStatus = 'idle' | 'starting' | 'active' | 'stopping';

export type SessionState = {
  status: SessionStatus;
  currentSessionId: string | null;
  startedAt: string | null; // ISO string
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'idle',
  currentSessionId: null,
  startedAt: null,
  startSession: async () => {
    if (get().status === 'active' || get().status === 'starting') return;
    set({ status: 'starting' });
    const res = await sessionApi.start();
    set({ status: 'active', currentSessionId: res.sessionId, startedAt: res.startedAt });
  },
  stopSession: async () => {
    if (get().status !== 'active') return;
    set({ status: 'stopping' });
    const id = get().currentSessionId!;
    await sessionApi.stop(id);
    set({ status: 'idle', currentSessionId: null, startedAt: null });
  },
}));