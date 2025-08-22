import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '@/mocks/services/authApi';
import { licenseApi } from '@/mocks/services/licenseApi';

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
      signIn: async (email: string, password: string) => {
        const res = await authApi.login({ email, password });
        set({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          user: res.user,
        });
      },
      signOut: async () => {
        set({ accessToken: null, refreshToken: null, user: null, orgId: null });
        await SecureStore.deleteItemAsync('auth_store');
      },
      redeemCode: async (code: string) => {
        const res = await licenseApi.redeem({ code });
        set({ orgId: res.orgId });
      },
    }),
    {
      name: 'auth_store',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken, orgId: state.orgId }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);