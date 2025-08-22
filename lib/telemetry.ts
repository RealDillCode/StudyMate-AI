import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';
import { logger } from '@/lib/logger';

let initialized = false;

function getDsn(): string | undefined {
	const extra = (Constants?.expoConfig as any)?.extra;
	return extra?.SENTRY_DSN || process.env.EXPO_PUBLIC_SENTRY_DSN;
}

export function initSentry(): void {
	if (initialized) return;
	const dsn = getDsn();
	if (!dsn) {
		logger.warn('Sentry DSN not set; skipping init');
		initialized = true;
		return;
	}
	Sentry.init({
		dsn,
		enableInExpoDevelopment: true,
		debug: false,
		tracesSampleRate: 0.1,
	});
	// Anonymous user
	Sentry.Native.setUser({ id: Constants.installationId ?? 'anon' });
	initialized = true;
}

type TelemetryEvent =
	| { type: 'session_started'; sessionId: string; startedAt: string }
	| { type: 'session_ended'; sessionId: string; endedAt: string; durationSeconds: number }
	| { type: 'shield_bypass'; at: string };

export function captureEvent(evt: TelemetryEvent) {
	if (!initialized) return;
	// Non-PII breadcrumb
	Sentry.Native.addBreadcrumb({ category: 'app', level: 'info', message: evt.type, data: { ...evt } });
	Sentry.Native.captureMessage(evt.type);
}