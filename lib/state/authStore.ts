import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  orgId: string | null;
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  redeemCode: (code: string) => Promise<void>;
  setHydrated: (value: boolean) => void;
};

const secureStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      orgId: null,
      hydrated: false,
      setHydrated: (value: boolean) => set({ hydrated: value }),
      signIn: async (email: string, _password: string) => {
        // Mock sign-in: generate tokens and a user object
        const mockAccess = 'mock_access_' + Date.now();
        const mockRefresh = 'mock_refresh_' + Date.now();
        const mockUser: AuthUser = { id: 'user_' + Date.now(), email, name: email.split('@')[0] };
        set({ accessToken: mockAccess, refreshToken: mockRefresh, user: mockUser });
      },
      signOut: async () => {
        set({ accessToken: null, refreshToken: null, user: null, orgId: null });
        // Also clear persisted values
        await SecureStore.deleteItemAsync('auth_store');
      },
      redeemCode: async (code: string) => {
        // Mock redeem: accept any non-empty code
        if (!code.trim()) return;
        set({ orgId: code.trim().toUpperCase() });
      },
    }),
    {
      name: 'auth_store',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken, orgId: state.orgId }),
      onRehydrateStorage: () => (state) => {
        // Called after state is rehydrated
        state?.setHydrated(true);
      },
    }
  )
);