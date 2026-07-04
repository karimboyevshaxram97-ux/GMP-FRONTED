import React from 'react';
import StaticInfoPage from '../../libs/components/common/StaticInfoPage';

const AboutPage = () => (
	<StaticInfoPage title="About GMP" kicker="Company">
		<p>GMP helps people compare migration, study, work, travel, and visa services from agencies in one place.</p>
		<p>The platform is built around verified agency profiles, searchable service listings, application tracking, and direct messaging.</p>
		<h2>What We Focus On</h2>
		<ul>
			<li>Clear agency profiles and service information.</li>
			<li>Simple communication between users and agencies.</li>
			<li>Admin verification before agencies appear publicly.</li>
		</ul>
	</StaticInfoPage>
);

export default AboutPage;
