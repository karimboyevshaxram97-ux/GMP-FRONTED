import Router from 'next/router';
import { useTranslation } from 'next-i18next';
import { Lang } from '../enums/lang.enum';
import { LocalizedString } from '../types/localized-string';

const LANG_STORAGE_KEY = 'gmp_lang';
const LANG_COOKIE = 'NEXT_LOCALE';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Resolve a backend LocalizedString for the given UI language. */
export function t(str: LocalizedString | string | undefined | null, lang?: Lang | string): string {
	if (!str) return '';
	if (typeof str === 'string') return str;
	const l = lang as keyof LocalizedString;
	return str[l] || str.ko || str.en || str.uz || str.ru || '';
}

/** Hook returning a resolver for backend LocalizedString values in the active locale. */
export function useLang() {
	const { i18n } = useTranslation();
	const lang = normalizeLang(i18n.language) ?? Lang.KO;
	return (str: LocalizedString | string | undefined | null) => t(str, lang);
}

/**
 * Switch the active UI language: persists the choice (localStorage + cookie)
 * and swaps the Next.js routing locale client-side (no full page reload).
 */
export function setLang(lang: Lang) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(LANG_STORAGE_KEY, lang);
	document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=${ONE_YEAR_SECONDS};samesite=lax`;
	if (Router.locale !== lang) {
		Router.replace(Router.asPath, undefined, { locale: lang, scroll: false });
	}
}

/** Language the user explicitly picked earlier, if any (localStorage, then cookie). */
export function getSavedLang(): Lang | null {
	if (typeof window === 'undefined') return null;
	const stored = normalizeLang(localStorage.getItem(LANG_STORAGE_KEY));
	if (stored) return stored;
	const cookie = document.cookie
		.split('; ')
		.find((row) => row.startsWith(`${LANG_COOKIE}=`))
		?.split('=')[1];
	return normalizeLang(cookie);
}

export function normalizeLang(value?: string | null): Lang | null {
	const normalized = value?.toLowerCase();
	if (!normalized) return null;
	return Object.values(Lang).includes(normalized as Lang) ? (normalized as Lang) : null;
}

export function toBackendLang(lang: Lang): string {
	return lang.toUpperCase();
}
