import React from 'react';
import StaticInfoPage from '../../libs/components/common/StaticInfoPage';

const CookiesPage = () => (
	<StaticInfoPage title="Cookies" kicker="Legal">
		<p>GMP uses browser storage to keep users signed in, remember language preference, and support core app behavior.</p>
		<p>Authentication tokens and language settings are stored locally in the browser.</p>
		<h2>Managing Storage</h2>
		<p>You can clear browser storage or sign out to remove local session data from your device.</p>
	</StaticInfoPage>
);

export default CookiesPage;

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
