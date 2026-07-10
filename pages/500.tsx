import React from 'react';
import Head from 'next/head';
import ErrorState from '../libs/components/common/ErrorState';
import { useUiLang } from '../libs/utils/translations';

const ServerErrorPage = () => {
	const ui = useUiLang();

	return (
		<>
			<Head>
				<title>500 — GMP</title>
			</Head>
			<ErrorState
				code="500"
				title={ui('errors.serverErrorTitle')}
				description={ui('errors.serverErrorDesc')}
			/>
		</>
	);
};

export default ServerErrorPage;

export { i18nStaticProps as getStaticProps } from '../libs/i18n';
