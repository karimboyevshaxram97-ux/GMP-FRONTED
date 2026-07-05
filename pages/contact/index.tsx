import React from 'react';
import StaticInfoPage from '../../libs/components/common/StaticInfoPage';

const ContactPage = () => (
	<StaticInfoPage title="Contact" kicker="Support">
		<p>For account, agency verification, application, or service questions, contact the GMP support team.</p>
		<h2>Support</h2>
		<p>Email: support@gmp.com</p>
		<p>Phone: +998 90 123 45 67</p>
		<p>Office: Tashkent, Uzbekistan</p>
	</StaticInfoPage>
);

export default ContactPage;

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
