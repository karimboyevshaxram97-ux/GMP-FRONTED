import React from 'react';
import { useUiLang } from '../../utils/translations';

const steps = [
	{
		num: '01',
		icon: '🔍',
		title: 'Browse & Discover',
		desc: 'Explore hundreds of verified agencies and thousands of services. Filter by country, type, rating, and price to find the perfect match.',
	},
	{
		num: '02',
		icon: '📋',
		title: 'Apply Online',
		desc: 'Submit your application in minutes. Upload documents and track your status in real-time directly from your personal dashboard.',
	},
	{
		num: '03',
		icon: '🌍',
		title: 'Start Your Journey',
		desc: 'Get approved and begin your international adventure. Our partner agencies provide full support every step of the way.',
	},
];

const HowItWorks = () => {
	const ui = useUiLang();

	return (
		<section className="home-how">
			<div className="container">
				<div className="home-how__header">
					<span className="section-tag">{ui('Simple Process')}</span>
					<h2>{ui('How It Works')}</h2>
					<p>{ui('Three simple steps to launch your global journey with confidence.')}</p>
				</div>

				<div className="home-how__steps">
					{steps.map((step, i) => (
						<div key={i} className="how-step">
							<div className="how-step__num">{step.num}</div>
							<span className="how-step__icon">{step.icon}</span>
							<h3>{ui(step.title)}</h3>
							<p>{ui(step.desc)}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;
