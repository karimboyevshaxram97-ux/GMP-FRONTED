import type { GetServerSideProps, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const DEFAULT_LOCALE = 'ko';
const NAMESPACES = ['common'];

/**
 * Shared getStaticProps that loads translation resources for the page.
 * Re-export from a page: `export { i18nStaticProps as getStaticProps } from '../libs/i18n';`
 */
export const i18nStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, NAMESPACES)),
	},
});

/** Same as i18nStaticProps but for pages that need getServerSideProps (dynamic routes). */
export const i18nServerSideProps: GetServerSideProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, NAMESPACES)),
	},
});
