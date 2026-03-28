import { logger } from '@/lib/logger';
import Constants from 'expo-constants';

export function isEnabled(): boolean {
	const extra = (Constants?.expoConfig as any)?.extra;
	const raw = extra?.SCREENTIME_ENABLED ?? process.env.EXPO_PUBLIC_SCREENTIME_ENABLED;
	return raw === '1' || raw === 'true' || raw === true;
}

export async function requestAuthorization(): Promise<boolean> {
	return true;
}

export async function pickApplicationsAndCategories(): Promise<string[]> {
	return ['mock-token'];
}

export async function startWorkLimit(schedule: { start:string; end:string; days:number[] }): Promise<void> {
	logger.info('startWorkLimit', schedule);
}

export async function stopWorkLimit(): Promise<void> {
	logger.info('stopWorkLimit');
}

export function onShieldEvent(cb: (e:{type:'attempt'|'bypass', token?:string, at:string}) => void) {
	return () => {};
}