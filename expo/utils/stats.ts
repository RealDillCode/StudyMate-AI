import { CompletedSession } from '@/lib/state/sessionStore';

export function toDayKey(d: Date): string {
	return d.toISOString().slice(0,10); // YYYY-MM-DD
}

export function computeFocusStreak(sessions: CompletedSession[]): number {
	const uniqueDays = new Set<string>();
	sessions.forEach(s => {
		uniqueDays.add(toDayKey(new Date(s.startedAt)));
	});
	let streak = 0;
	let cursor = new Date();
	// Count backwards starting today
	while (true) {
		const key = toDayKey(cursor);
		if (uniqueDays.has(key)) {
			streak += 1;
			cursor.setDate(cursor.getDate() - 1);
			continue;
		}
		break;
	}
	return streak;
}

export function computeWeeklyTotals(sessions: CompletedSession[]): { labels: string[]; minutes: number[] } {
	const labels: string[] = [];
	const minutes: number[] = [];
	const totals: Record<string, number> = {};
	const now = new Date();
	for (let i = 6; i >= 0; i--) {
		const d = new Date(now);
		d.setDate(now.getDate() - i);
		const key = toDayKey(d);
		labels.push(key.slice(5)); // MM-DD
		totals[key] = 0;
	}
	sessions.forEach(s => {
		const key = toDayKey(new Date(s.startedAt));
		if (key in totals) {
			totals[key] += Math.round(s.durationSeconds / 60);
		}
	});
	for (const label of labels) {
		const yyyymmdd = `${new Date().getFullYear()}-${label}`;
		minutes.push(totals[yyyymmdd] || 0);
	}
	return { labels, minutes };
}