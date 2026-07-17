const ANONYMOUS_VIEWER_KEY = 'gmp-anonymous-viewer-id';

export const getAnonymousViewerId = (): string | undefined => {
	if (typeof window === 'undefined') return undefined;

	try {
		const existing = window.localStorage.getItem(ANONYMOUS_VIEWER_KEY);
		if (existing) return existing;

		const generated =
			typeof window.crypto?.randomUUID === 'function'
				? window.crypto.randomUUID()
				: `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

		window.localStorage.setItem(ANONYMOUS_VIEWER_KEY, generated);
		return generated;
	} catch {
		return undefined;
	}
};
