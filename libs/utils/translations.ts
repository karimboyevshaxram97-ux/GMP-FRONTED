import { useCallback } from 'react';
import { useTranslation, i18n } from 'next-i18next';
import { LEGACY_UI_KEYS } from './legacy-ui-keys';

/**
 * UI string translator backed by next-i18next (/public/locales/&lt;lang&gt;/common.json).
 *
 * Accepts either a namespaced translation key ("nav.home") or, for values that
 * arrive dynamically (enum statuses, label arrays), a legacy English string
 * which is resolved through LEGACY_UI_KEYS. Unknown keys fall back to the key
 * itself, matching the behavior of the previous in-repo dictionary.
 */
export function useUiLang(): (key: string) => string {
	const { t } = useTranslation('common');
	return useCallback(
		(key: string) => {
			const legacy = LEGACY_UI_KEYS[key];
			return t(legacy ?? key);
		},
		[t],
	);
}

/**
 * Non-hook translator for module-level code and class components (e.g.
 * sweetAlert helpers, ErrorBoundary) that can't call useUiLang(). Reads
 * through the global next-i18next instance, falling back before it's
 * initialized (SSR/early client).
 */
export const translateStatic = (key: string, fallback: string): string => {
	const value = i18n?.t(key, { ns: 'common' });
	return value && value !== key ? value : fallback;
};
