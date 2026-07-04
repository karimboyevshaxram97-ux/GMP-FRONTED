import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useUiLang } from '../../utils/translations';

const STEPS = [
	{
		number: '01',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
		),
		title: 'Search Services',
		desc: 'Browse hundreds of verified visa, study, work, and travel services from trusted agencies worldwide.',
	},
	{
		number: '02',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
				<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
				<circle cx="9" cy="7" r="4" />
				<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
				<path d="M16 3.13a4 4 0 0 1 0 7.75" />
			</svg>
		),
		title: 'Connect with Agencies',
		desc: 'Reach out to verified immigration agencies, ask questions, and compare service offerings in real time.',
	},
	{
		number: '03',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
				<polyline points="14 2 14 8 20 8" />
				<line x1="16" y1="13" x2="8" y2="13" />
				<line x1="16" y1="17" x2="8" y2="17" />
				<polyline points="10 9 9 9 8 9" />
			</svg>
		),
		title: 'Submit Application',
		desc: 'Apply directly through GMP. Track your application status, upload documents, and get real-time updates.',
	},
	{
		number: '04',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
				<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 11 19.79 19.79 0 0 1 1.1 2.38 2 2 0 0 1 3.07 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 14.92z" />
			</svg>
		),
		title: 'Achieve Your Goal',
		desc: 'Complete your journey — study abroad, start a new career, or explore the world with confidence.',
	},
];

const MOCK_CARDS = [
	{ type: 'Study Abroad', country: 'United Kingdom', price: '$2,400', badge: 'Popular', color: '#6366f1' },
	{ type: 'Work Permit', country: 'Germany', price: '$1,200', badge: 'Verified', color: '#0ea5e9' },
	{ type: 'Travel Package', country: 'Japan', price: '$890', badge: 'New', color: '#10b981' },
	{ type: 'Visa Service', country: 'Canada', price: '$350', badge: 'Fast', color: '#f59e0b' },
];

const VideoSection = () => {
	const ui = useUiLang();
	const sectionRef = useRef<HTMLElement>(null);
	const [activeStep, setActiveStep] = useState(0);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setVisible(true);
				}
			},
			{ threshold: 0.2 },
		);
		if (sectionRef.current) observer.observe(sectionRef.current);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!visible) return;
		const interval = setInterval(() => {
			setActiveStep((prev) => (prev + 1) % STEPS.length);
		}, 2200);
		return () => clearInterval(interval);
	}, [visible]);

	return (
		<section className="home-marketing" ref={sectionRef}>
			{/* Background decorations */}
			<div className="hm-orb hm-orb-1" aria-hidden="true" />
			<div className="hm-orb hm-orb-2" aria-hidden="true" />
			<div className="hm-grid-lines" aria-hidden="true" />

			<div className="container">
				{/* Header */}
				<div className={`hm-header${visible ? ' visible' : ''}`}>
					<span className="section-tag">{ui('How It Works')}</span>
					<h2>{ui('Your journey to global opportunities')}</h2>
					<p>{ui('From first search to final destination — GMP guides you every step of the way.')}</p>
				</div>

				{/* Main 2-col layout */}
				<div className={`hm-body${visible ? ' visible' : ''}`}>
					{/* Steps */}
					<div className="hm-steps">
						{STEPS.map((step, index) => (
							<div
								key={index}
								className={`hm-step${activeStep === index ? ' active' : ''}${visible ? ' in' : ''}`}
								style={{ transitionDelay: `${index * 0.12}s` }}
								onClick={() => setActiveStep(index)}
							>
								<div className="step-num">{step.number}</div>
								<div className="step-icon">{step.icon}</div>
								<div className="step-body">
									<h4>{ui(step.title)}</h4>
									<p>{ui(step.desc)}</p>
								</div>
								{index < STEPS.length - 1 && <div className="step-connector" />}
							</div>
						))}
					</div>

					{/* Mock platform preview */}
					<div className="hm-preview">
						<div className="preview-window">
							{/* Browser bar */}
							<div className="browser-bar">
								<div className="browser-dots">
									<span /><span /><span />
								</div>
								<div className="browser-url">gmp.uz/service</div>
							</div>

							{/* Search bar mock */}
							<div className="mock-search">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
									<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
								</svg>
								<span>{ui('Search services by country or type...')}</span>
								<div className="mock-search-btn">{ui('Search')}</div>
							</div>

							{/* Cards grid */}
							<div className="mock-cards">
								{MOCK_CARDS.map((card, i) => (
									<div
										key={i}
										className={`mock-card${visible ? ' in' : ''}`}
										style={{ transitionDelay: `${0.3 + i * 0.1}s` }}
									>
										<div className="card-type-dot" style={{ background: card.color }} />
										<div className="card-info">
											<span className="card-type">{ui(card.type)}</span>
											<span className="card-country">{ui(card.country)}</span>
										</div>
										<div className="card-right">
											<span className="card-badge">{ui(card.badge)}</span>
											<span className="card-price">{card.price}</span>
										</div>
									</div>
								))}
							</div>

							{/* Floating stats badges */}
							<div className="floating-badge badge-tl">
								<span className="fb-num">200+</span>
								<span className="fb-label">{ui('Services')}</span>
							</div>
							<div className="floating-badge badge-br">
								<span className="fb-num">98%</span>
								<span className="fb-label">{ui('Success rate')}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom stats strip */}
				<div className={`hm-stats-strip${visible ? ' visible' : ''}`}>
					<div className="hm-stat">
						<span className="hm-stat-num">10,000+</span>
						<span className="hm-stat-label">{ui('Clients served')}</span>
					</div>
					<div className="hm-stat-sep" />
					<div className="hm-stat">
						<span className="hm-stat-num">50+</span>
						<span className="hm-stat-label">{ui('Verified agencies')}</span>
					</div>
					<div className="hm-stat-sep" />
					<div className="hm-stat">
						<span className="hm-stat-num">30+</span>
						<span className="hm-stat-label">{ui('Destination countries')}</span>
					</div>
					<div className="hm-stat-sep" />
					<div className="hm-stat">
						<span className="hm-stat-num">4.9★</span>
						<span className="hm-stat-label">{ui('Average rating')}</span>
					</div>
					<div className="hm-cta-btn">
						<Link href="/service">{ui('Explore all services')} →</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default VideoSection;
