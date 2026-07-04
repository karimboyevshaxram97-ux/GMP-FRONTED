import { useReactiveVar } from '@apollo/client';
import { langVar } from '../../apollo/store';
import { Lang } from '../enums/lang.enum';
import { LocalizedString } from '../types/localized-string';

export function t(str: LocalizedString | string | undefined | null, lang?: Lang | string): string {
	if (!str) return '';
	if (typeof str === 'string') return str;
	const l = lang as keyof LocalizedString;
	return str[l] || str.en || str.uz || str.ru || str.ko || '';
}

export function useLang() {
	const lang = useReactiveVar(langVar);
	return (str: LocalizedString | string | undefined | null) => t(str, lang);
}

export function setLang(lang: Lang) {
	if (typeof window !== 'undefined') localStorage.setItem('gmp_lang', lang);
	langVar(lang);
}

export function getSavedLang(): Lang | null {
	if (typeof window === 'undefined') return null;
	return normalizeLang(localStorage.getItem('gmp_lang'));
}

export function normalizeLang(value?: string | null): Lang | null {
	const normalized = value?.toLowerCase();
	if (!normalized) return null;
	return Object.values(Lang).includes(normalized as Lang) ? normalized as Lang : null;
}

export function toBackendLang(lang: Lang): string {
	return lang.toUpperCase();
}
