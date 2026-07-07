import React from 'react';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useUiLang } from '../../utils/translations';

const serviceTypes = [
	{
		key: 'study',
		title: 'Study Abroad',
		desc: 'Top universities in Europe, Asia, and America. Scholarships and full support included.',
		href: '/service?type=STUDY_ABROAD',
	},
	{
		key: 'work',
		title: 'Work Abroad',
		desc: 'Find your dream job overseas. Work permits, job placement, and relocation assistance.',
		href: '/service?type=WORK_ABROAD',
	},
	{
		key: 'travel',
		title: 'Travel',
		desc: 'Explore the world with curated travel packages. Hotels, tours, and experiences.',
		href: '/service?type=TRAVEL',
	},
	{
		key: 'visa',
		title: 'Visa Services',
		desc: 'Fast, reliable visa processing. Tourist, student, and work visas worldwide.',
		href: '/service?type=VISA_SERVICES',
	},
];

const ServiceTypesSection = () => {
	const ui = useUiLang();

	return (
		<section className="home-service-types">
			{/* background orbs */}
			<div className="stype-orb stype-orb--1" />
			<div className="stype-orb stype-orb--2" />
			<div className="stype-orb stype-orb--3" />

			<div className="container">
				<div className="home-service-types__header">
					<span className="section-tag">{ui('home.whatWeOffer')}</span>
					<h2>{ui('home.exploreOurServices')}</h2>
					<p>{ui('home.everythingYouNeedToMake')}</p>
				</div>

				<div className="home-service-types__grid">
					{serviceTypes.map((s) => (
						<Link href={s.href} key={s.key} style={{ textDecoration: 'none' }}>
							<div className={`stype-card stype-card--${s.key}`}>
								<div className="stype-card__shine" />
								<h3>{ui(s.title)}</h3>
								<p>{ui(s.desc)}</p>
								<div className="stype-card__link">
									{ui('home.explore')} <ArrowForwardIcon />
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
};

export default ServiceTypesSection;
