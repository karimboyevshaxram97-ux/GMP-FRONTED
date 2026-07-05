/**
 * i18n configuration shared by Next.js (routing) and next-i18next (translations).
 *
 * - Korean (ko) is ALWAYS the initial language: `localeDetection: false` stops
 *   Next.js from reading Accept-Language / NEXT_LOCALE on first visit, so `/`
 *   renders in Korean. A manually chosen language is restored client-side in
 *   _app.tsx from localStorage / the NEXT_LOCALE cookie.
 * - Keys are flat, dot-namespaced strings (e.g. "nav.home"), so the key and
 *   namespace separators are disabled.
 */
/** @type {import('next-i18next').UserConfig} */
module.exports = {
	i18n: {
		defaultLocale: 'ko',
		locales: ['ko', 'en', 'uz', 'ru'],
		localeDetection: false,
	},
	fallbackLng: 'en',
	keySeparator: false,
	nsSeparator: false,
	reloadOnPrerender: process.env.NODE_ENV === 'development',
};
