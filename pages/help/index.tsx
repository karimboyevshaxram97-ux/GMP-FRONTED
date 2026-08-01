import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useMutation, useReactiveVar } from '@apollo/client';
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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import withLayoutMain from '../../libs/components/layout/LayoutHome';
import { CREATE_SUPPORT_TICKET } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { useUiLang } from '../../libs/utils/translations';

// Savol-javob matnlari to'rt tilda public/locales/<lang>/common.json ichida (faq.* kalitlari)
const faqs = [
	{ cat: 'faq.cat.gettingStarted', q: 'faq.1.q', a: 'faq.1.a' },
	{ cat: 'faq.cat.gettingStarted', q: 'faq.2.q', a: 'faq.2.a' },
	{ cat: 'faq.cat.applications', q: 'faq.3.q', a: 'faq.3.a' },
	{ cat: 'faq.cat.applications', q: 'faq.4.q', a: 'faq.4.a' },
	{ cat: 'faq.cat.applications', q: 'faq.5.q', a: 'faq.5.a' },
	{ cat: 'faq.cat.documents', q: 'faq.6.q', a: 'faq.6.a' },
	{ cat: 'faq.cat.documents', q: 'faq.7.q', a: 'faq.7.a' },
	{ cat: 'faq.cat.timeline', q: 'faq.8.q', a: 'faq.8.a' },
	{ cat: 'faq.cat.timeline', q: 'faq.9.q', a: 'faq.9.a' },
	{ cat: 'faq.cat.trust', q: 'faq.10.q', a: 'faq.10.a' },
	{ cat: 'faq.cat.trust', q: 'faq.11.q', a: 'faq.11.a' },
	{ cat: 'faq.cat.tracking', q: 'faq.12.q', a: 'faq.12.a' },
	{ cat: 'faq.cat.tracking', q: 'faq.13.q', a: 'faq.13.a' },
	{ cat: 'faq.cat.payments', q: 'faq.14.q', a: 'faq.14.a' },
	{ cat: 'faq.cat.payments', q: 'faq.15.q', a: 'faq.15.a' },
	{ cat: 'faq.cat.agencies', q: 'faq.16.q', a: 'faq.16.a' },
	{ cat: 'faq.cat.agencies', q: 'faq.17.q', a: 'faq.17.a' },
	{ cat: 'faq.cat.account', q: 'faq.18.q', a: 'faq.18.a' },
	{ cat: 'faq.cat.account', q: 'faq.19.q', a: 'faq.19.a' },
	{ cat: 'faq.cat.account', q: 'faq.20.q', a: 'faq.20.a' },
];

const HelpPage: NextPage = () => {
	const ui = useUiLang();
	const user = useReactiveVar(userVar);
	const [expanded, setExpanded] = useState<number | false>(false);
	const [search, setSearch] = useState('');
	const [form, setForm] = useState({ name: '', email: '', message: '' });
	const [sent, setSent] = useState(false);
	const [submitError, setSubmitError] = useState('');
	const [createSupportTicket, { loading: sending }] = useMutation(CREATE_SUPPORT_TICKET);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!user?._id) return;
		const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
		setForm((current) => ({
			...current,
			name: current.name || fullName,
			email: current.email || user.email || '',
		}));
	}, [user?._id, user?.firstName, user?.lastName, user?.email]);

	// Qidiruv tanlangan tildagi (tarjima qilingan) matn bo'yicha ishlaydi
	const filtered = faqs.filter(
		(f) =>
			search === '' ||
			ui(f.q).toLowerCase().includes(search.toLowerCase()) ||
			ui(f.a).toLowerCase().includes(search.toLowerCase()),
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
		if (!user?._id) {
			setSubmitError(ui('help.loginRequiredDescription'));
			return;
		}
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
			setSubmitError(err?.graphQLErrors?.[0]?.message || err?.message || ui('help.failedToSendMessage'));
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
					<div className="hero-badge">{ui('help.supportCenter')}</div>
					<h1 className="hero-title">{ui('help.howCanWe')} <span>{ui('help.helpYou')}</span></h1>
					<p className="hero-sub">{ui('help.searchOurKnowledgeBaseOr')}</p>
					<div className="hero-search">
						<SearchIcon className="search-icon" />
						<input
							type="text"
							placeholder={ui('help.searchForAnswers')}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</Container>
			</section>

			{/* ── FAQ ── */}
			<section className="hp-faq">
				<Container maxWidth="lg">
					<div className="hp-section-head">
						<div className="hp-section-tag">FAQ</div>
						<h2>{ui('help.frequentlyAskedQuestions')}</h2>
						<p>{ui('help.quickAnswersToTheMost')}</p>
					</div>

					<div className="faq-list">
						{filtered.length === 0 && (
							<div className="faq-empty">
								<SearchIcon />
								<p>{ui('help.noResultsFoundFor')} &quot;<strong>{search}</strong>&quot;</p>
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
							<div className="hp-section-tag light">{ui('help.contactUs')}</div>
							<h2>{ui('help.stillNeedHelp')}</h2>
							<p>{ui('help.ourSupportTeamTypicallyReplies')}</p>

							<div className="contact-items">
								<div className="contact-item">
									<div className="ci-icon"><EmailOutlinedIcon /></div>
									<div>
										<div className="ci-label">{ui('help.email')}</div>
										<div className="ci-val">support@gmp.com</div>
									</div>
								</div>
								<div className="contact-item">
									<div className="ci-icon"><PhoneOutlinedIcon /></div>
									<div>
										<div className="ci-label">{ui('help.phone')}</div>
										<div className="ci-val">+998 90 123 45 67</div>
									</div>
								</div>
								<div className="contact-item">
									<div className="ci-icon"><LocationOnOutlinedIcon /></div>
									<div>
										<div className="ci-label">{ui('help.office')}</div>
										<div className="ci-val">{ui('help.tashkentUzbekistan')}</div>
									</div>
								</div>
								<div className="contact-item">
									<div className="ci-icon"><AccessTimeIcon /></div>
									<div>
										<div className="ci-label">{ui('help.workingHours')}</div>
										<div className="ci-val">{ui('help.monFri90018')}</div>
									</div>
								</div>
							</div>

							<div className="contact-badges">
								<div className="c-badge"><CheckCircleOutlineIcon /> {ui('help.verifiedAgencies')}</div>
								<div className="c-badge"><ChatBubbleOutlineIcon /> {ui('help.liveSupport')}</div>
							</div>
						</div>

						{/* Right — form */}
						<div className="contact-right">
							<div className="contact-form-head">
								<h3>{ui('help.sendUsAMessage')}</h3>
								<p>{ui('help.wellGetBackToYou')}</p>
							</div>
							{user?._id ? <Box component="form" onSubmit={handleSubmit} className="cf-form">
								<div className="cf-row">
									<div className="cf-field">
										<label>{ui('help.yourName')}</label>
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
										<label>{ui('help.emailAddress')}</label>
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
									<label>{ui('help.message')}</label>
									<textarea
										placeholder={ui('help.describeYourIssueOrQuestion')}
										value={form.message}
										onChange={(e) => setForm({ ...form, message: e.target.value })}
										required
										rows={5}
									/>
								</div>
								{submitError && <Alert severity="error">{submitError}</Alert>}
								<button type="submit" className="cf-submit" disabled={sending}>
									{sending ? ui('agency.sending') : ui('help.sendMessage')}
									<span className="cf-arrow">→</span>
								</button>
							</Box> : (
								<div className="cf-auth-required">
									<div className="cf-auth-required__icon"><LockOutlinedIcon /></div>
									<h4>{ui('help.loginRequiredTitle')}</h4>
									<p>{ui('help.loginRequiredDescription')}</p>
									<Link href="/account/join" className="cf-auth-required__button" passHref>
										{ui('help.loginOrRegister')} <span>→</span>
									</Link>
								</div>
							)}
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
					{ui('help.messageSentWellGetBack')}
				</Alert>
			</Snackbar>
		</div>
	);
};

export default withLayoutMain(HelpPage);

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
