import React from 'react';
import StaticInfoPage from '../../libs/components/common/StaticInfoPage';

const PrivacyPage = () => (
	<StaticInfoPage title="Privacy Policy" kicker="Legal">
		<p>GMP stores account, agency, service, application, and messaging data needed to operate the platform.</p>
		<p>Uploaded files and profile images are used only for account, agency, and application workflows.</p>
		<h2>Your Choices</h2>
		<ul>
			<li>You can update your profile from My Page.</li>
			<li>You can contact support for account or data questions.</li>
			<li>Agency data may require admin review before appearing publicly.</li>
		</ul>
	</StaticInfoPage>
);

export default PrivacyPage;
