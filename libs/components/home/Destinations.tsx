import React from 'react';
import Link from 'next/link';
import { useUiLang } from '../../utils/translations';

const destinations = [
	{ name: 'United States', flag: '🇺🇸', count: 85, href: '/service?country=United+States' },
	{ name: 'United Kingdom', flag: '🇬🇧', count: 72, href: '/service?country=United+Kingdom' },
	{ name: 'Germany', flag: '🇩🇪', count: 60, href: '/service?country=Germany' },
	{ name: 'Canada', flag: '🇨🇦', count: 55, href: '/service?country=Canada' },
	{ name: 'South Korea', flag: '🇰🇷', count: 48, href: '/service?country=South+Korea' },
	{ name: 'Australia', flag: '🇦🇺', count: 44, href: '/service?country=Australia' },
	{ name: 'UAE', flag: '🇦🇪', count: 40, href: '/service?country=UAE' },
	{ name: 'Japan', flag: '🇯🇵', count: 36, href: '/service?country=Japan' },
];

const Destinations = () => {
	const ui = useUiLang();

	return (
		<section className="home-destinations">
			<div className="container">
				<div className="home-destinations__header">
					<span className="section-tag">{ui('Explore Destinations')}</span>
					<h2>{ui('Popular Destinations')}</h2>
					<p>{ui("Discover opportunities in the world's most sought-after destinations for study, work, and travel.")}</p>
				</div>

				<div className="home-destinations__grid">
					{destinations.map((dest, i) => (
						<Link key={i} href={dest.href} style={{ textDecoration: 'none' }}>
							<div className="dest-card">
								<span className="dest-card__flag">{dest.flag}</span>
								<div className="dest-card__info">
									<div className="dest-card__name">{ui(dest.name)}</div>
									<div className="dest-card__count">{dest.count} {ui('services')}</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
};

export default Destinations;
