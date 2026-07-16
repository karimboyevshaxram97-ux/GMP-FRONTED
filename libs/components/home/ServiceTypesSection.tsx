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
		image: '/img/study-bg.jpg',
	},
	{
		key: 'work',
		title: 'Work Abroad',
		desc: 'Find your dream job overseas. Work permits, job placement, and relocation assistance.',
		href: '/service?type=WORK_ABROAD',
		image: '/img/work-bg.jpg',
	},
	{
		key: 'travel',
		title: 'Travel',
		desc: 'Explore the world with curated travel packages. Hotels, tours, and experiences.',
		href: '/service?type=TRAVEL',
		image: '/img/travel-bg.jpg',
	},
	{
		key: 'visa',
		title: 'Visa Services',
		desc: 'Fast, reliable visa processing. Tourist, student, and work visas worldwide.',
		href: '/service?type=VISA_SERVICES',
		image: '/img/visa-bg.jpg',
	},
];

const ServiceTypesSection = () => {
	const ui = useUiLang();

	return (
		<section className="home-service-types">
			<div className="stype-orb stype-orb--1" />
			<div className="stype-orb stype-orb--2" />

			<div className="container">
				<div className="home-service-types__header">
					<span>{ui('home.explore')}</span>
					<h2>{ui('home.exploreOurServices')}</h2>
					<p>{ui('home.everythingYouNeedToMake')}</p>
				</div>

				<div className="home-service-types__grid">
					{serviceTypes.map((s, index) => (
						<Link href={s.href} key={s.key} className={`stype-card stype-card--${s.key}`}>
							<img className="stype-card__image" src={s.image} alt={ui(s.title)} />
							<div className="stype-card__scrim" />
							<div className="stype-card__topline">
								<span>{String(index + 1).padStart(2, '0')}</span>
								<small>GMP</small>
							</div>
							<div className="stype-card__content">
								<h3>{ui(s.title)}</h3>
								<p>{ui(s.desc)}</p>
								<div className="stype-card__link">
									<span>{ui('home.explore')}</span>
									<ArrowForwardIcon />
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
