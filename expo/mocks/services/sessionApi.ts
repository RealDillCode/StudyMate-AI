const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type StartSessionResponse = { sessionId: string; startedAt: string };
export type StopSessionResponse = { durationSeconds: number };

export const sessionApi = {
	async start(): Promise<StartSessionResponse> {
		await delay(400);
		return { sessionId: 'sess_' + Date.now(), startedAt: new Date().toISOString() };
	},
	async stop(sessionId: string): Promise<StopSessionResponse> {
		await delay(400);
		// Mock fixed duration
		return { durationSeconds: 60 };
	},
};