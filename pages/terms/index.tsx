import React from 'react';
import StaticInfoPage from '../../libs/components/common/StaticInfoPage';

const TermsPage = () => (
	<StaticInfoPage title="Terms of Service" kicker="Legal">
		<p>By using GMP, users and agencies agree to provide accurate information and use the platform responsibly.</p>
		<p>Agencies are responsible for keeping service information, pricing, processing time, and contact details current.</p>
		<h2>Platform Rules</h2>
		<ul>
			<li>False or misleading agency information may be rejected or removed.</li>
			<li>Messages and applications should relate to legitimate service requests.</li>
			<li>Admin actions may restrict accounts, agencies, or services when needed.</li>
		</ul>
	</StaticInfoPage>
);

export default TermsPage;

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
