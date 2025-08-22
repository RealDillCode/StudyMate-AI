import { create } from 'zustand';

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
    await new Promise((r) => setTimeout(r, 300));
    const id = 'sess_' + Date.now();
    const now = new Date().toISOString();
    set({ status: 'active', currentSessionId: id, startedAt: now });
  },
  stopSession: async () => {
    if (get().status !== 'active') return;
    set({ status: 'stopping' });
    await new Promise((r) => setTimeout(r, 300));
    set({ status: 'idle', currentSessionId: null, startedAt: null });
  },
}));