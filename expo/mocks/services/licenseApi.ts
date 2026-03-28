const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type RedeemRequest = { code: string };
export type RedeemResponse = { orgId: string };

export const licenseApi = {
	async redeem({ code }: RedeemRequest): Promise<RedeemResponse> {
		await delay(500);
		const trimmed = code.trim().toUpperCase();
		if (!trimmed || trimmed.length < 3) {
			throw new Error('Invalid code');
		}
		return { orgId: trimmed };
	},
};