import { AuthUser } from '@/lib/state/authStore';

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { accessToken: string; refreshToken: string; user: AuthUser };

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const authApi = {
	async login({ email, password }: LoginRequest): Promise<LoginResponse> {
		await delay(600);
		const isValid = email.length > 3 && password.length >= 6;
		if (!isValid) {
			throw new Error('Invalid credentials');
		}
		return {
			accessToken: 'mock_access_' + Date.now(),
			refreshToken: 'mock_refresh_' + Date.now(),
			user: { id: 'user_' + Date.now(), email, name: email.split('@')[0] },
		};
	},
};