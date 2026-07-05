import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

// Leaflet requires window — disable SSR for the entire map view
const AgencyMapView = dynamic(
	() => import('../../libs/components/agency/AgencyMapView'),
	{
		ssr: false,
		loading: () => (
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)', color: '#9ea4b3', fontSize: 15 }}>
				Loading map…
			</div>
		),
	},
);

const AgencyMapPage: NextPage = () => {
	return <AgencyMapView />;
};

export default withLayoutBasic(AgencyMapPage);

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
