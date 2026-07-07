import React from 'react';
import { useUiLang } from '../../utils/translations';

const HeroSection = () => {
	const ui = useUiLang();

	return (
		<section className="home-hero">
			{/* Ken Burns animated background */}
			<div className="home-hero__bg">
				<img className="home-hero__bg-img" src="/img/hero-bg.jpg" alt="" aria-hidden="true" />
			</div>
			<div className="home-hero__overlay" />

			{/* Content */}
			<div className="container home-hero__inner">
				<div className="home-hero__left">
					<h1 className="home-hero__title">
						{ui('home.yourJourneyToA')}<br />
						<span className="hero-highlight">{ui('home.newWorld')}</span>
						<br />{ui('home.startsHere')}
					</h1>

					<p className="home-hero__subtitle">
						{ui('home.connectWith500TrustedImmigration')}
					</p>
				</div>
			</div>

			{/* Scroll indicator */}
			<div className="home-hero__scroll">
				<div className="scroll-dots">
					<span />
					<span />
					<span />
				</div>
				<span className="scroll-label">{ui('agency.scroll')}</span>
			</div>
		</section>
	);
};

export default HeroSection;
