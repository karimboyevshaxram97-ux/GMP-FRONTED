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

// O'z reklama videongizni qo'yish uchun shu ID ni almashtiring
// (https://youtu.be/XXXXXXXXXXX dagi XXXXXXXXXXX qismi)
const YOUTUBE_VIDEO_ID = 'V72pPDz43KI'; // touropia — "50 Most Beautiful Cities in the World" 4K

const VideoSection = () => {
	const ui = useUiLang();
	const sectionRef = useRef<HTMLElement>(null);
	const [activeStep, setActiveStep] = useState(0);
	const [visible, setVisible] = useState(false);
	const [playing, setPlaying] = useState(false);

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
					<span className="section-tag">{ui('home.howItWorks')}</span>
					<h2>{ui('home.yourJourneyToGlobalOpportunities')}</h2>
					<p>{ui('home.fromFirstSearchToFinal')}</p>
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

					{/* Video showcase (lite YouTube embed — iframe loads only on click) */}
					<div className="hm-preview">
						<div className="hm-video">
							{playing ? (
								<iframe
									src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
									title={ui('home.watchVideo')}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowFullScreen
								/>
							) : (
								<button
									type="button"
									className="hm-video__facade"
									onClick={() => setPlaying(true)}
									aria-label={ui('home.watchVideo')}
								>
									<img
									src={`https://i.ytimg.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`}
									onError={(e) => { e.currentTarget.src = '/img/travel-bg.jpg'; }}
									alt=""
									aria-hidden="true"
								/>
									<span className="hm-video__scrim" />
									<span className="hm-video__play">
										<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
											<path d="M8 5v14l11-7z" />
										</svg>
									</span>
									<span className="hm-video__label">{ui('home.watchVideo')}</span>
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Bottom stats strip */}
				<div className={`hm-stats-strip${visible ? ' visible' : ''}`}>
					<div className="hm-stat">
						<span className="hm-stat-num">10,000+</span>
						<span className="hm-stat-label">{ui('home.clientsServed')}</span>
					</div>
					<div className="hm-stat-sep" />
					<div className="hm-stat">
						<span className="hm-stat-num">50+</span>
						<span className="hm-stat-label">{ui('home.verifiedAgencies')}</span>
					</div>
					<div className="hm-stat-sep" />
					<div className="hm-stat">
						<span className="hm-stat-num">30+</span>
						<span className="hm-stat-label">{ui('home.destinationCountries')}</span>
					</div>
					<div className="hm-stat-sep" />
					<div className="hm-stat">
						<span className="hm-stat-num">4.9★</span>
						<span className="hm-stat-label">{ui('agency.averageRating')}</span>
					</div>
					<div className="hm-cta-btn">
						<Link href="/service">{ui('home.exploreAllServices')} →</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default VideoSection;
