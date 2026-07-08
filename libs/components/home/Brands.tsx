import React from 'react';
import { useRouter } from 'next/router';
import { useUiLang } from '../../utils/translations';

// Mashhur yo'nalish davlatlari — chapga oqadigan lenta.
// Bosilganda o'sha davlat bo'yicha xizmatlar sahifasiga o'tadi.
const COUNTRIES = [
	{ code: 'us', name: 'United States' },
	{ code: 'gb', name: 'United Kingdom' },
	{ code: 'kr', name: 'South Korea' },
	{ code: 'de', name: 'Germany' },
	{ code: 'ca', name: 'Canada' },
	{ code: 'jp', name: 'Japan' },
	{ code: 'au', name: 'Australia' },
	{ code: 'ae', name: 'UAE' },
	{ code: 'tr', name: 'Turkey' },
	{ code: 'fr', name: 'France' },
	{ code: 'it', name: 'Italy' },
	{ code: 'es', name: 'Spain' },
	{ code: 'nl', name: 'Netherlands' },
	{ code: 'se', name: 'Sweden' },
	{ code: 'ch', name: 'Switzerland' },
	{ code: 'sg', name: 'Singapore' },
	{ code: 'my', name: 'Malaysia' },
	{ code: 'cn', name: 'China' },
	{ code: 'pl', name: 'Poland' },
	{ code: 'cz', name: 'Czech Republic' },
	{ code: 'sa', name: 'Saudi Arabia' },
	{ code: 'qa', name: 'Qatar' },
];

const Brands = () => {
	const ui = useUiLang();
	const router = useRouter();

	return (
		<section className="home-brands">
			<div className="home-brands__marquee">
				<div className="home-brands__track">
					{[...COUNTRIES, ...COUNTRIES].map((country, i) => (
						<button
							type="button"
							className="brand-item"
							key={i}
							aria-hidden={i >= COUNTRIES.length}
							tabIndex={i >= COUNTRIES.length ? -1 : 0}
							onClick={() => router.push(`/service?country=${encodeURIComponent(country.name)}`)}
						>
							<img
								className="brand-flag"
								src={`https://flagcdn.com/w40/${country.code}.png`}
								alt=""
								loading="lazy"
								aria-hidden="true"
							/>
							<span>{ui(country.name)}</span>
						</button>
					))}
				</div>
			</div>
		</section>
	);
};

export default Brands;
