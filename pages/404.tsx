import React from 'react';
import Head from 'next/head';
import ErrorState from '../libs/components/common/ErrorState';
import { useUiLang } from '../libs/utils/translations';

const NotFoundPage = () => {
	const ui = useUiLang();

	return (
		<>
			<Head>
				<title>404 — GMP</title>
			</Head>
			<ErrorState
				code="404"
				title={ui('errors.pageNotFoundTitle')}
				description={ui('errors.pageNotFoundDesc')}
			/>
		</>
	);
};

export default NotFoundPage;

export { i18nStaticProps as getStaticProps } from '../libs/i18n';
