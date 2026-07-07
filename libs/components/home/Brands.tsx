import React from 'react';
import { useUiLang } from '../../utils/translations';

// Logolar Simple Icons CDN'dan olinadi: https://cdn.simpleicons.org/<slug>
const BRANDS = [
	{ name: 'Google', slug: 'google' },
	{ name: 'Apple', slug: 'apple' },
	{ name: 'Samsung', slug: 'samsung' },
	{ name: 'LG', slug: 'lg' },
	{ name: 'Naver', slug: 'naver' },
	{ name: 'Kakao', slug: 'kakao' },
	{ name: 'Meta', slug: 'meta' },
	{ name: 'Netflix', slug: 'netflix' },
	{ name: 'Tesla', slug: 'tesla' },
	{ name: 'Hyundai', slug: 'hyundai' },
	{ name: 'Kia', slug: 'kia' },
	{ name: 'Toyota', slug: 'toyota' },
	{ name: 'BMW', slug: 'bmw' },
	{ name: 'Emirates', slug: 'emirates' },
	{ name: 'Visa', slug: 'visa' },
	{ name: 'Mastercard', slug: 'mastercard' },
	{ name: 'PayPal', slug: 'paypal' },
	{ name: 'Airbnb', slug: 'airbnb' },
	{ name: 'Booking.com', slug: 'bookingdotcom' },
	{ name: 'Uber', slug: 'uber' },
	{ name: 'Spotify', slug: 'spotify' },
	{ name: 'Nike', slug: 'nike' },
	{ name: 'Sony', slug: 'sony' },
];

const Brands = () => {
	const ui = useUiLang();

	return (
		<section className="home-brands">
			<div className="container home-brands__header">
				<span className="section-tag">{ui('home.globalBrands')}</span>
				<h2>{ui('home.trustedByLeaders')}</h2>
			</div>

			<div className="home-brands__marquee">
				<div className="home-brands__track">
					{/* Uzluksiz aylanish uchun ro'yxat ikki marta chiziladi */}
					{[...BRANDS, ...BRANDS].map((brand, i) => (
						<div className="brand-item" key={i} aria-hidden={i >= BRANDS.length}>
							<img src={`https://cdn.simpleicons.org/${brand.slug}`} alt={brand.name} loading="lazy" />
							<span>{brand.name}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Brands;
