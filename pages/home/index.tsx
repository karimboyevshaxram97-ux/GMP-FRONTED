import React from 'react';
import withLayoutMain from '../../libs/components/layout/LayoutHome';
import HeroSection from '../../libs/components/home/HeroSection';
import SearchSection from '../../libs/components/home/SearchSection';
import ServiceTypesSection from '../../libs/components/home/ServiceTypesSection';
import StatsSection from '../../libs/components/home/StatsSection';
import HowItWorks from '../../libs/components/home/HowItWorks';
import FeaturedAgencies from '../../libs/components/home/FeaturedAgencies';
import FeaturedServices from '../../libs/components/home/FeaturedServices';
import Destinations from '../../libs/components/home/Destinations';
import VideoSection from '../../libs/components/home/VideoSection';
import TopAgenciesSection from '../../libs/components/home/TopAgenciesSection';
import CtaBanner from '../../libs/components/home/CtaBanner';

const Homepage = () => (
	<div className="homepage">
		<HeroSection />
		<SearchSection />
		<ServiceTypesSection />
		<StatsSection />
		<HowItWorks />
		<FeaturedAgencies />
		<FeaturedServices />
		<Destinations />
		<VideoSection />
		<TopAgenciesSection />
		<CtaBanner />
	</div>
);

export default withLayoutMain(Homepage);

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
