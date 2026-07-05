import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useMutation } from '@apollo/client';
import { Box, Container, Snackbar, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import withLayoutMain from '../../libs/components/layout/LayoutHome';
import { CREATE_SUPPORT_TICKET } from '../../apollo/user/mutation';
import { useUiLang } from '../../libs/utils/translations';

const categories = [
	{ icon: '🎓', label: 'Study Abroad', count: 12 },
	{ icon: '💼', label: 'Work Permits', count: 8 },
	{ icon: '✈️', label: 'Travel & Visa', count: 15 },
	{ icon: '🏢', label: 'Agencies', count: 6 },
	{ icon: '📋', label: 'Applications', count: 10 },
	{ icon: '💳', label: 'Payments', count: 5 },
];

const faqs = [
	{
		cat: 'Getting Started',
		q: 'What is GMP and how does it work?',
		a: 'GMP (Global Migration Platform) is an online platform that connects individuals with verified agencies for study abroad, work permits, travel visas, and other international migration services. Browse agencies, compare services, submit your application online, and track everything from your personal dashboard.',
	},
	{
		cat: 'Getting Started',
		q: 'Do I need to create an account to use GMP?',
		a: 'You can browse agencies and services without an account. However, to submit applications, message agencies, track your status, or save favorites, you need to register. Registration is free and takes less than 2 minutes.',
	},
	{
		cat: 'Applications',
		q: 'How do I apply for a service?',
		a: 'Browse our services page, select the service you need, and click "Apply Now". You\'ll need an account to apply. After submitting, the agency will review your application and contact you within 2–3 business days.',
	},
	{
		cat: 'Applications',
		q: 'Can I apply to multiple agencies at the same time?',
		a: 'Yes. You can submit applications to multiple agencies simultaneously. This is recommended — comparing offers lets you choose the best price, timeline, and service quality. All applications are managed from your My Page dashboard.',
	},
	{
		cat: 'Applications',
		q: 'Can I cancel or change my application?',
		a: 'Contact the agency through the messaging system to request changes or cancellations. Cancellation policies vary by agency, so check their terms before applying. Most agencies allow free cancellation before the process officially begins.',
	},
	{
		cat: 'Documents',
		q: 'What documents do I need to prepare?',
		a: 'Required documents vary by service type. For study abroad: passport, diploma, language certificates (IELTS/TOEFL). For work permits: passport, CV, job offer letter, medical certificate. For visas: passport, bank statements, travel insurance, hotel bookings. Your agency will provide a full personalized checklist after you apply.',
	},
	{
		cat: 'Documents',
		q: 'Are my uploaded documents safe and private?',
		a: 'Yes. All documents are encrypted and stored securely. Only the agency you applied to can access your submitted files. GMP does not share your documents with third parties. You can request document deletion at any time from My Page → Settings.',
	},
	{
		cat: 'Timeline',
		q: 'How long does the process take?',
		a: 'Processing times depend on the service and destination country. Tourist visa: 2–4 weeks. Student visa: 4–12 weeks. Work permit: 4 weeks to 6 months. Permanent residency: 6–24 months. Your assigned agency will give you an accurate personalized timeline during the initial consultation.',
	},
	{
		cat: 'Timeline',
		q: 'What happens if my application is delayed?',
		a: 'Delays can happen due to embassy workload, missing documents, or country-specific requirements. Your agency will proactively notify you of any delays and explain next steps. You can also check live status updates from My Page at any time.',
	},
	{
		cat: 'Trust',
		q: 'Are the agencies on GMP verified?',
		a: 'Yes. Every agency undergoes a strict verification process before being listed on GMP. Our admin team reviews government-issued licenses, years of operation, success rates, and client reviews. Agencies with the blue verified badge have passed all checks. We remove agencies that receive repeated complaints.',
	},
	{
		cat: 'Trust',
		q: 'What if I have a problem with an agency?',
		a: 'First, try to resolve it directly through our messaging system. If the issue is not resolved, use the "Report Agency" button on their profile page. Our support team reviews all reports within 48 hours and can mediate disputes, issue warnings, or remove agencies that violate our policies.',
	},
	{
		cat: 'Tracking',
		q: 'How do I track my application status?',
		a: 'Log in and go to My Page → Applications. You can see real-time status for all your applications (Pending, In Review, Documents Required, Approved, Rejected) and read any messages from the agency. You will also receive email and in-app notifications for every status change.',
	},
	{
		cat: 'Tracking',
		q: 'Can I communicate with the agency after applying?',
		a: 'Yes. Every application has a built-in messaging thread between you and the agency. You can send questions, share additional documents, and receive updates directly in the thread. All messages are archived for your records.',
	},
	{
		cat: 'Payments',
		q: 'What payment methods are accepted?',
		a: 'Payment terms are set by each agency and handled directly between you and them. GMP does not process or hold payments. Common methods include bank transfer, PayMe, Click, and Payme. Confirm payment terms with your chosen agency before starting your application.',
	},
	{
		cat: 'Payments',
		q: 'Are there any fees for using GMP?',
		a: 'Creating an account and browsing is completely free. GMP charges no commission on your service fees — the price you see from the agency is the price you pay. Agency service fees vary based on the type and complexity of the service.',
	},
	{
		cat: 'Agencies',
		q: 'How do I register my agency on GMP?',
		a: 'Click "Register", select "Agency" as your account type, and complete your agency profile. Submit your government-issued license, business registration documents, and team information through My Page. Our team will review your application within 3–5 business days and notify you via email.',
	},
	{
		cat: 'Agencies',
		q: 'How can an agency improve its ranking on GMP?',
		a: 'Agency rankings are based on client review score, number of completed applications, response speed, and verification status. Maintaining a high rating, responding to clients quickly, and keeping your profile up to date are the best ways to improve your ranking.',
	},
	{
		cat: 'Account',
		q: 'I forgot my password. How do I reset it?',
		a: 'On the login page, click "Forgot Password" and enter your registered email or phone number. You will receive a reset link within a few minutes. If you don\'t receive it, check your spam folder or contact support@gmp.com.',
	},
	{
		cat: 'Account',
		q: 'How do I delete my account?',
		a: 'Go to My Page → Settings → Account → Delete Account. You will be asked to confirm your password before deletion. Note that deleting your account will permanently remove all your applications, messages, and history. Active applications should be resolved with your agency before deletion.',
	},
	{
		cat: 'Account',
		q: 'Can I change my registered phone number or email?',
		a: 'Yes. Go to My Page → Settings → Profile and update your contact information. You will need to verify the new phone number or email address with a confirmation code before the change takes effect.',
	},
];

const HelpPage: NextPage = () => {
	const ui = useUiLang();
	const [expanded, setExpanded] = useState<number | false>(false);
	const [search, setSearch] = useState('');
	const [form, setForm] = useState({ name: '', email: '', message: '' });
	const [sent, setSent] = useState(false);
	const [submitError, setSubmitError] = useState('');
	const [createSupportTicket, { loading: sending }] = useMutation(CREATE_SUPPORT_TICKET);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const filtered = faqs.filter(
		(f) =>
			search === '' ||
			f.q.toLowerCase().includes(search.toLowerCase()) ||
			f.a.toLowerCase().includes(search.toLowerCase()),
	);

	// ── Cosmos canvas ──────────────────────────────────────────────────
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animId: number;

		const resize = () => {
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
		};
		resize();
		window.addEventListener('resize', resize);

		// ── 3-layer star system ──
		const makeStars = (count: number, minR: number, maxR: number, drift: number, blueChance: number) =>
			Array.from({ length: count }, () => ({
				x: Math.random(),
				y: Math.random(),
				r: Math.random() * (maxR - minR) + minR,
				phase: Math.random() * Math.PI * 2,
				twinkle: Math.random() * 0.7 + 0.15,
				vx: (Math.random() - 0.5) * drift,
				vy: (Math.random() - 0.5) * drift * 0.4,
				hue: Math.random() < blueChance ? 210 + Math.random() * 50 : -1,
			}));

		const farStars  = makeStars(220, 0.15, 0.55, 0.000012, 0.1);
		const midStars  = makeStars(80,  0.55, 1.1,  0.000025, 0.2);
		const nearStars = makeStars(18,  1.1,  2.0,  0.00005,  0.4);

		// ── Vivid nebulae ──
		const nebulae = [
			{ x: 0.08, y: 0.2,  r: 300, hue: 220, sat: 85, phase: 0,   speed: 0.00007 },
			{ x: 0.88, y: 0.65, r: 260, hue: 280, sat: 75, phase: 1.5, speed: 0.00005 },
			{ x: 0.5,  y: 0.85, r: 220, hue: 190, sat: 80, phase: 3,   speed: 0.00009 },
			{ x: 0.28, y: 0.7,  r: 200, hue: 310, sat: 70, phase: 2,   speed: 0.00006 },
			{ x: 0.78, y: 0.18, r: 180, hue: 240, sat: 90, phase: 4.5, speed: 0.00008 },
		];

		// ── Shooting stars ──
		interface Pt { x: number; y: number }
		interface Shooter {
			x: number; y: number;
			vx: number; vy: number;
			trail: Pt[];
			maxTrail: number;
			life: number;
			width: number;
			hue: number;
		}
		const shooters: Shooter[] = [];
		let shootTimer = 0;

		const spawnShooter = () => {
			const angle = (Math.random() * 28 + 12) * Math.PI / 180;
			const speed = Math.random() * 12 + 7;
			shooters.push({
				x: Math.random() * 0.65 + 0.02,
				y: Math.random() * 0.42,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				trail: [],
				maxTrail: Math.floor(Math.random() * 35 + 22),
				life: 1,
				width: Math.random() * 2 + 1.2,
				hue: Math.random() * 70 + 195,
			});
		};

		let t = 0;

		const drawStar = (W: number, H: number, x: number, y: number, r: number, opacity: number, hue: number) => {
			const px = x * W, py = y * H;

			// Soft glow halo
			if (r > 0.6) {
				const glowR = r * (r > 1.2 ? 6 : 4);
				const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
				glow.addColorStop(0, hue >= 0
					? `hsla(${hue},70%,80%,${(opacity * 0.45).toFixed(2)})`
					: `rgba(220,230,255,${(opacity * 0.35).toFixed(2)})`);
				glow.addColorStop(1, 'rgba(0,0,0,0)');
				ctx.beginPath();
				ctx.arc(px, py, glowR, 0, Math.PI * 2);
				ctx.fillStyle = glow;
				ctx.fill();
			}

			// Star core
			ctx.beginPath();
			ctx.arc(px, py, r, 0, Math.PI * 2);
			ctx.fillStyle = hue >= 0
				? `hsla(${hue},60%,92%,${opacity.toFixed(2)})`
				: `rgba(255,255,255,${opacity.toFixed(2)})`;
			ctx.fill();

			// Sparkle cross on big bright stars
			if (r > 1.4 && opacity > 0.55) {
				const len = r * 5.5;
				ctx.save();
				ctx.globalAlpha = opacity * 0.55;
				ctx.strokeStyle = hue >= 0 ? `hsla(${hue},50%,90%,1)` : 'rgba(255,255,255,1)';
				ctx.lineWidth = 0.6;
				ctx.lineCap = 'round';
				ctx.beginPath(); ctx.moveTo(px - len, py); ctx.lineTo(px + len, py); ctx.stroke();
				ctx.beginPath(); ctx.moveTo(px, py - len); ctx.lineTo(px, py + len); ctx.stroke();
				// Diagonal mini lines
				const dlen = len * 0.45;
				ctx.globalAlpha = opacity * 0.25;
				ctx.beginPath(); ctx.moveTo(px - dlen, py - dlen); ctx.lineTo(px + dlen, py + dlen); ctx.stroke();
				ctx.beginPath(); ctx.moveTo(px + dlen, py - dlen); ctx.lineTo(px - dlen, py + dlen); ctx.stroke();
				ctx.restore();
			}
		};

		const drawLayer = (W: number, H: number, stars: ReturnType<typeof makeStars>) => {
			stars.forEach((s) => {
				s.x = ((s.x + s.vx) % 1 + 1) % 1;
				s.y = ((s.y + s.vy) % 1 + 1) % 1;
				const opacity = 0.18 + 0.82 * (0.5 + 0.5 * Math.sin(t * s.twinkle + s.phase));
				drawStar(W, H, s.x, s.y, s.r, opacity, s.hue);
			});
		};

		const draw = () => {
			t += 0.016;
			shootTimer += 0.016;

			const W = canvas.width, H = canvas.height;
			ctx.clearRect(0, 0, W, H);

			// Nebulae
			nebulae.forEach((n) => {
				const nx = n.x + Math.sin(t * n.speed * 1000 + n.phase) * 0.07;
				const ny = n.y + Math.cos(t * n.speed * 800  + n.phase) * 0.045;
				const a  = 0.065 + 0.028 * Math.sin(t * 0.22 + n.phase);
				const grad = ctx.createRadialGradient(nx * W, ny * H, 0, nx * W, ny * H, n.r);
				grad.addColorStop(0,   `hsla(${n.hue},${n.sat}%,55%,${a.toFixed(3)})`);
				grad.addColorStop(0.45,`hsla(${n.hue + 25},${n.sat - 10}%,40%,${(a * 0.45).toFixed(3)})`);
				grad.addColorStop(1,   'hsla(0,0%,0%,0)');
				ctx.beginPath();
				ctx.arc(nx * W, ny * H, n.r, 0, Math.PI * 2);
				ctx.fillStyle = grad;
				ctx.fill();
			});

			// Stars (far → near for correct layering)
			drawLayer(W, H, farStars);
			drawLayer(W, H, midStars);
			drawLayer(W, H, nearStars);

			// Spawn shooter
			if (shootTimer > 2.2 + Math.random() * 2.8) {
				spawnShooter();
				shootTimer = 0;
			}

			// Shooting stars
			for (let i = shooters.length - 1; i >= 0; i--) {
				const s = shooters[i];
				s.trail.push({ x: s.x * W, y: s.y * H });
				if (s.trail.length > s.maxTrail) s.trail.shift();

				s.x += s.vx / W;
				s.y += s.vy / H;
				s.life -= 0.014;

				if (s.life <= 0 || s.x > 1.1 || s.y > 1.1) { shooters.splice(i, 1); continue; }

				// Trail — segment by segment, fading toward tail
				for (let j = 1; j < s.trail.length; j++) {
					const frac = j / s.trail.length;
					const alpha = frac * s.life * 0.95;
					const lw    = frac * s.width * s.life + 0.2;
					ctx.beginPath();
					ctx.moveTo(s.trail[j - 1].x, s.trail[j - 1].y);
					ctx.lineTo(s.trail[j].x,     s.trail[j].y);
					ctx.strokeStyle = frac > 0.7
						? `rgba(255,255,255,${alpha.toFixed(2)})`
						: `hsla(${s.hue},75%,80%,${alpha.toFixed(2)})`;
					ctx.lineWidth = lw;
					ctx.lineCap  = 'round';
					ctx.stroke();
				}

				// Glowing head
				if (s.trail.length > 0) {
					const hd = s.trail[s.trail.length - 1];
					const g1 = ctx.createRadialGradient(hd.x, hd.y, 0, hd.x, hd.y, 10);
					g1.addColorStop(0,   `rgba(255,255,255,${s.life.toFixed(2)})`);
					g1.addColorStop(0.4, `hsla(${s.hue},80%,85%,${(s.life * 0.6).toFixed(2)})`);
					g1.addColorStop(1,   'rgba(0,0,0,0)');
					ctx.beginPath();
					ctx.arc(hd.x, hd.y, 10, 0, Math.PI * 2);
					ctx.fillStyle = g1;
					ctx.fill();
				}
			}

			animId = requestAnimationFrame(draw);
		};

		draw();

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('resize', resize);
		};
	}, []);
	// ──────────────────────────────────────────────────────────────────

	useEffect(() => {
		if (typeof window === 'undefined') return;
		import('animejs').then(({ animate, stagger }) => {
			animate('.hero-badge, .hero-title, .hero-sub, .hero-search', {
				opacity: [0, 1],
				translateY: [-20, 0],
				duration: 650,
				delay: stagger(80, { start: 100 }),
				ease: 'outExpo',
			});
			animate('.cat-card', {
				opacity: [0, 1],
				translateY: [24, 0],
				scale: [0.95, 1],
				duration: 500,
				delay: stagger(55, { start: 400 }),
				ease: 'outExpo',
			});
			animate('.faq-row', {
				opacity: [0, 1],
				translateX: [-20, 0],
				duration: 500,
				delay: stagger(50, { start: 200 }),
				ease: 'outExpo',
			});
			animate('.contact-left, .contact-right', {
				opacity: [0, 1],
				translateY: [30, 0],
				duration: 600,
				delay: stagger(120, { start: 200 }),
				ease: 'outExpo',
			});
		});
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError('');
		try {
			await createSupportTicket({
				variables: {
					input: {
						name: form.name.trim(),
						email: form.email.trim(),
						message: form.message.trim(),
					},
				},
			});
			setSent(true);
			setForm({ name: '', email: '', message: '' });
		} catch (err: any) {
			setSubmitError(err?.graphQLErrors?.[0]?.message || err?.message || ui('Failed to send message'));
		}
	};

	return (
		<div className="help-page">

			{/* ── HERO ── */}
			<section className="hp-hero">
				<canvas ref={canvasRef} className="hero-canvas" />
				<div className="hp-hero-glow glow-1" />
				<div className="hp-hero-glow glow-2" />
				<div className="hp-hero-glow glow-3" />
				<Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
					<div className="hero-badge">{ui('Support Center')}</div>
					<h1 className="hero-title">{ui('How can we')} <span>{ui('help you?')}</span></h1>
					<p className="hero-sub">{ui('Search our knowledge base or browse topics below')}</p>
					<div className="hero-search">
						<SearchIcon className="search-icon" />
						<input
							type="text"
							placeholder={ui('Search for answers...')}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</Container>
			</section>

			{/* ── CATEGORIES ── */}
			<section className="hp-categories">
				<Container maxWidth="lg">
					<div className="cat-grid">
						{categories.map((cat, i) => (
							<div key={i} className="cat-card">
								<div className="cat-emoji">{cat.icon}</div>
								<div className="cat-label">{ui(cat.label)}</div>
								<div className="cat-count">{cat.count} {ui('articles')}</div>
							</div>
						))}
					</div>
				</Container>
			</section>

			{/* ── FAQ ── */}
			<section className="hp-faq">
				<Container maxWidth="lg">
					<div className="hp-section-head">
						<div className="hp-section-tag">FAQ</div>
						<h2>{ui('Frequently Asked Questions')}</h2>
						<p>{ui('Quick answers to the most common questions')}</p>
					</div>

					<div className="faq-list">
						{filtered.length === 0 && (
							<div className="faq-empty">
								<SearchIcon />
								<p>{ui('No results found for')} &quot;<strong>{search}</strong>&quot;</p>
							</div>
						)}
						{filtered.map((faq, i) => (
							<div
								key={i}
								className={`faq-row ${expanded === i ? 'open' : ''}`}
								onClick={() => setExpanded(expanded === i ? false : i)}
							>
								<div className="faq-header">
									<span className="faq-num">{String(i + 1).padStart(2, '0')}</span>
									<span className="faq-cat">{ui(faq.cat)}</span>
									<span className="faq-q">{ui(faq.q)}</span>
									<span className="faq-icon">
										{expanded === i ? <RemoveIcon /> : <AddIcon />}
									</span>
								</div>
								{expanded === i && (
									<div className="faq-body">
										<p>{ui(faq.a)}</p>
									</div>
								)}
							</div>
						))}
					</div>
				</Container>
			</section>

			{/* ── CONTACT ── */}
			<section className="hp-contact">
				<Container maxWidth="lg">
					<div className="contact-wrap">

						{/* Left */}
						<div className="contact-left">
							<div className="hp-section-tag light">{ui('Contact Us')}</div>
							<h2>{ui('Still need help?')}</h2>
							<p>{ui('Our support team typically replies within a few hours.')}</p>

							<div className="contact-items">
								<div className="contact-item">
									<div className="ci-icon"><EmailOutlinedIcon /></div>
									<div>
										<div className="ci-label">{ui('Email')}</div>
										<div className="ci-val">support@gmp.com</div>
									</div>
								</div>
								<div className="contact-item">
									<div className="ci-icon"><PhoneOutlinedIcon /></div>
									<div>
										<div className="ci-label">{ui('Phone')}</div>
										<div className="ci-val">+998 90 123 45 67</div>
									</div>
								</div>
								<div className="contact-item">
									<div className="ci-icon"><LocationOnOutlinedIcon /></div>
									<div>
										<div className="ci-label">{ui('Office')}</div>
										<div className="ci-val">{ui('Tashkent, Uzbekistan')}</div>
									</div>
								</div>
								<div className="contact-item">
									<div className="ci-icon"><AccessTimeIcon /></div>
									<div>
										<div className="ci-label">{ui('Working Hours')}</div>
										<div className="ci-val">{ui('Mon-Fri, 9:00-18:00')}</div>
									</div>
								</div>
							</div>

							<div className="contact-badges">
								<div className="c-badge"><CheckCircleOutlineIcon /> {ui('Verified Agencies')}</div>
								<div className="c-badge"><ChatBubbleOutlineIcon /> {ui('Live Support')}</div>
							</div>
						</div>

						{/* Right — form */}
						<div className="contact-right">
							<div className="contact-form-head">
								<h3>{ui('Send us a message')}</h3>
								<p>{ui("We'll get back to you as soon as possible")}</p>
							</div>
							<Box component="form" onSubmit={handleSubmit} className="cf-form">
								<div className="cf-row">
									<div className="cf-field">
										<label>{ui('Your name')}</label>
										<input
											type="text"
											placeholder="John Doe"
											value={form.name}
											onChange={(e) => setForm({ ...form, name: e.target.value })}
											required
											autoComplete="off"
										/>
									</div>
									<div className="cf-field">
										<label>{ui('Email address')}</label>
										<input
											type="email"
											placeholder="john@example.com"
											value={form.email}
											onChange={(e) => setForm({ ...form, email: e.target.value })}
											required
											autoComplete="off"
										/>
									</div>
								</div>
								<div className="cf-field">
									<label>{ui('Message')}</label>
									<textarea
										placeholder={ui('Describe your issue or question...')}
										value={form.message}
										onChange={(e) => setForm({ ...form, message: e.target.value })}
										required
										rows={5}
									/>
								</div>
								{submitError && <Alert severity="error">{submitError}</Alert>}
								<button type="submit" className="cf-submit" disabled={sending}>
									{sending ? ui('Sending...') : ui('Send Message')}
									<span className="cf-arrow">→</span>
								</button>
							</Box>
						</div>

					</div>
				</Container>
			</section>

			<Snackbar
				open={sent}
				autoHideDuration={4000}
				onClose={() => setSent(false)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert severity="success" onClose={() => setSent(false)} sx={{ borderRadius: 2, fontFamily: 'Poppins' }}>
					{ui("Message sent! We'll get back to you within 24 hours.")}
				</Alert>
			</Snackbar>
		</div>
	);
};

export default withLayoutMain(HelpPage);

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
