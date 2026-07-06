import React from 'react';
import dynamic from 'next/dynamic';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import HeroSection from '../libs/components/home/HeroSection';
import SearchSection from '../libs/components/home/SearchSection';
import ServiceTypesSection from '../libs/components/home/ServiceTypesSection';
import HowItWorks from '../libs/components/home/HowItWorks';
import FeaturedAgencies from '../libs/components/home/FeaturedAgencies';
import FeaturedServices from '../libs/components/home/FeaturedServices';
import Destinations from '../libs/components/home/Destinations';
import VideoSection from '../libs/components/home/VideoSection';
import TopAgenciesSection from '../libs/components/home/TopAgenciesSection';
import CtaBanner from '../libs/components/home/CtaBanner';

// Leaflet requires window — disable SSR
const HomepageMapSection = dynamic(
	() => import('../libs/components/home/HomepageMapSection'),
	{ ssr: false },
);

const Homepage = () => (
	<div className="homepage">
		<HeroSection />
		<SearchSection />
		<ServiceTypesSection />
		<HowItWorks />
		<FeaturedAgencies />
		<FeaturedServices />
		<Destinations />
		<VideoSection />
		<TopAgenciesSection />
		<CtaBanner />
		<HomepageMapSection />
	</div>
);

export default withLayoutMain(Homepage);

export { i18nStaticProps as getStaticProps } from '../libs/i18n';
