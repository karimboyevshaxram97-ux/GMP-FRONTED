import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUiLang } from '../utils/translations';

const Footer = () => {
	const ui = useUiLang();
	const footerRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
					}
				});
			},
			{ threshold: 0.1 },
		);

		const elements = footerRef.current?.querySelectorAll('.animate-in');
		elements?.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	}, []);

	return (
		<footer className="footer-new" ref={footerRef}>
			{/* Floating background orbs */}
			<div className="footer-orbs" aria-hidden="true">
				<div className="orb orb-1" />
				<div className="orb orb-2" />
				<div className="orb orb-3" />
			</div>

			{/* Animated wave divider */}
			<div className="footer-wave" aria-hidden="true">
				<svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
					<path className="wave-path-1" d="M0,30 C240,55 480,5 720,30 C960,55 1200,5 1440,30 L1440,60 L0,60 Z" />
					<path className="wave-path-2" d="M0,40 C360,15 720,55 1080,30 C1260,18 1380,45 1440,40 L1440,60 L0,60 Z" />
				</svg>
			</div>

			<div className="container">
				{/* Main grid */}
				<div className="footer-top animate-in">
					{/* Brand */}
					<div className="footer-brand-col">
						<div className="footer-logo">
							<span className="logo-text">GMP</span>
							<div className="logo-glow" />
						</div>
						<p className="footer-tagline">
							{ui('footer.globalMigrationPlatformConnectingPeople')}
						</p>
						<div className="footer-socials">
							<a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Twitter / X">
								<svg viewBox="0 0 24 24" fill="currentColor">
									<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
								</svg>
							</a>
							<a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="LinkedIn">
								<svg viewBox="0 0 24 24" fill="currentColor">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
								</svg>
							</a>
							<a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Instagram">
								<svg viewBox="0 0 24 24" fill="currentColor">
									<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
								</svg>
							</a>
							<a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="YouTube">
								<svg viewBox="0 0 24 24" fill="currentColor">
									<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
								</svg>
							</a>
						</div>
					</div>

					{/* Services links */}
					<div className="footer-links-group animate-in delay-1">
						<h4>{ui('agency.services')}</h4>
						<ul>
							<li>
								<Link href="/service?type=VISA_SERVICES">
									<span>{ui('mypage.visaServices')}</span>
								</Link>
							</li>
							<li>
								<Link href="/service?type=STUDY_ABROAD">
									<span>{ui('mypage.studyAbroad')}</span>
								</Link>
							</li>
							<li>
								<Link href="/service?type=WORK_ABROAD">
									<span>{ui('mypage.workAbroad')}</span>
								</Link>
							</li>
							<li>
								<Link href="/service?type=TRAVEL">
									<span>{ui('mypage.travel')}</span>
								</Link>
							</li>
							<li>
								<Link href="/service">
									<span>{ui('footer.allServices')}</span>
								</Link>
							</li>
						</ul>
					</div>

					{/* Company links */}
					<div className="footer-links-group animate-in delay-2">
						<h4>{ui('footer.company')}</h4>
						<ul>
							<li>
								<Link href="/agency">
									<span>{ui('agency.agencies')}</span>
								</Link>
							</li>
							<li>
								<Link href="/agency/map">
									<span>{ui('footer.agencyMap')}</span>
								</Link>
							</li>
							<li>
								<Link href="/about">
									<span>{ui('footer.aboutUs')}</span>
								</Link>
							</li>
							<li>
								<Link href="/contact">
									<span>{ui('footer.contact')}</span>
								</Link>
							</li>
						</ul>
					</div>

					{/* Account links */}
					<div className="footer-links-group animate-in delay-3">
						<h4>{ui('footer.account')}</h4>
						<ul>
							<li>
								<Link href="/account/join">
									<span>{ui('footer.signIn')}</span>
								</Link>
							</li>
							<li>
								<Link href="/account/join">
									<span>{ui('auth.register')}</span>
								</Link>
							</li>
							<li>
								<Link href="/mypage">
									<span>{ui('footer.myProfile')}</span>
								</Link>
							</li>
							<li>
								<Link href="/mypage">
									<span>{ui('mypage.myAgency')}</span>
								</Link>
							</li>
						</ul>
					</div>

					{/* Newsletter */}
					<div className="footer-newsletter animate-in delay-4">
						<h4>{ui('footer.stayUpdated')}</h4>
						<p>{ui('footer.getTheLatestMigrationNews')}</p>
						<form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
							<input type="email" placeholder={ui('footer.yourEmailAddress')} />
							<button type="submit" aria-label={ui('footer.subscribe')}>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
									<line x1="22" y1="2" x2="11" y2="13" />
									<polygon points="22 2 15 22 11 13 2 9 22 2" />
								</svg>
							</button>
						</form>
						<div className="footer-trust-badges">
							<span className="trust-badge">{ui('footer.secure')}</span>
							<span className="trust-badge">{ui('admin.verified')}</span>
							<span className="trust-badge">{ui('service.global')}</span>
						</div>
					</div>
				</div>

				{/* Stats strip */}
				<div className="footer-stats animate-in">
					<div className="fstat">
						<span className="fstat-num">200+</span>
						<span className="fstat-label">{ui('agency.services')}</span>
					</div>
					<div className="fstat-sep" />
					<div className="fstat">
						<span className="fstat-num">50+</span>
						<span className="fstat-label">{ui('agency.agencies')}</span>
					</div>
					<div className="fstat-sep" />
					<div className="fstat">
						<span className="fstat-num">30+</span>
						<span className="fstat-label">{ui('mypage.countries')}</span>
					</div>
					<div className="fstat-sep" />
					<div className="fstat">
						<span className="fstat-num">10k+</span>
						<span className="fstat-label">{ui('footer.clientsServed')}</span>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="footer-bottom-bar">
					<span>© {new Date().getFullYear()} GMP - {ui('footer.globalMigrationPlatformAllRights')}</span>
					<div className="footer-legal-links">
						<Link href="/privacy">{ui('footer.privacyPolicy')}</Link>
						<Link href="/terms">{ui('footer.termsOfService')}</Link>
						<Link href="/cookies">{ui('footer.cookies')}</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
