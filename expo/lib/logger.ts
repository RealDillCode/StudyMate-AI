type LogArg = unknown;

function sanitize(value: unknown): unknown {
	try {
		if (typeof value === 'string') {
			let v = value;
			v = v.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]');
			v = v.replace(/(accessToken|refreshToken|token)"?\s*[:=]\s*"[^"]+"/gi, '$1:"[REDACTED]"');
			v = v.replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [REDACTED]');
			return v;
		}
		if (typeof value === 'object' && value !== null) {
			return JSON.parse(JSON.stringify(value, (_k, val) => {
				if (typeof val === 'string') {
					if (val.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)) return '[REDACTED_EMAIL]';
					if (val.toLowerCase().includes('token')) return '[REDACTED]';
				}
				return val;
			}));
		}
		return value;
	} catch (_e) {
		return value;
	}
}

function mapArgs(args: LogArg[]): unknown[] {
	return args.map(a => sanitize(a));
}

export const logger = {
	info: (...args: LogArg[]) => console.info(...mapArgs(args)),
	warn: (...args: LogArg[]) => console.warn(...mapArgs(args)),
	error: (...args: LogArg[]) => console.error(...mapArgs(args)),
	log: (...args: LogArg[]) => console.log(...mapArgs(args)),
};