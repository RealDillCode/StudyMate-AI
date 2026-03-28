import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/state/authStore';

const getBaseUrl = () => {
	const extra = (Constants?.expoConfig as any)?.extra;
	return extra?.API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
};

export const api = axios.create({
	baseURL: getBaseUrl(),
	headers: { 'Content-Type': 'application/json' },
});

type AnyObject = Record<string, unknown>;

export type ApiResponse<T> = {
	data: T;
	meta?: AnyObject;
};

api.interceptors.request.use((config) => {
	const token = useAuthStore.getState().accessToken;
	if (token) {
		config.headers = config.headers ?? {};
		(config.headers as AnyObject)['Authorization'] = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error?.response?.status === 401) {
			try {
				await useAuthStore.getState().signOut();
			} finally {
				router.replace('/(auth)/sign-in');
			}
		}
		return Promise.reject(error);
	}
);