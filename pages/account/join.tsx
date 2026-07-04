import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Box, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { logIn, signUp, getJwtToken, updateUserInfo } from '../../libs/auth';
import { UserRole } from '../../libs/enums/user.enum';
import ParticleCanvas from '../../libs/components/common/ParticleCanvas';
import FormBgAnimation from '../../libs/components/common/FormBgAnimation';
import { useUiLang } from '../../libs/utils/translations';

const FEATURES = [
	'Verified & trusted migration agencies',
	'Services across 30+ countries worldwide',
	'Secure documents & application tracking',
	'Study, work, travel and visa services',
];

const STATS = [
	{ num: '200+', label: 'Services' },
	{ num: '50+', label: 'Agencies' },
	{ num: '10k+', label: 'Users' },
];

const Join: NextPage = () => {
	const ui = useUiLang();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [tab, setTab] = useState<'login' | 'register'>('login');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
		const currentUser = userVar();
		if (currentUser?._id) {
			if (currentUser.role === UserRole.SUPER_ADMIN) router.replace('/_admin');
			else if (currentUser.role === UserRole.AGENCY_ADMIN) router.replace('/mypage?tab=agency');
			else router.replace('/');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Blob harakatlarini anime.js bilan animate qilish
	useEffect(() => {
		if (typeof window === 'undefined') return;
		import('animejs').then(({ animate, utils }) => {
			const blobs = ['.jl-blob-1', '.jl-blob-2', '.jl-blob-3'];
			blobs.forEach((selector) => {
				const el = document.querySelector(selector);
				if (!el) return;
				const loop = () => {
					animate(el, {
						translateX: utils.random(-60, 60),
						translateY: utils.random(-60, 60),
						scale: utils.random(0.88, 1.14),
						duration: utils.random(6000, 11000),
						ease: 'inOutQuad',
						onComplete: loop,
					});
				};
				loop();
			});
		});
	}, []);

	const [loginPhone, setLoginPhone] = useState('');
	const [loginPassword, setLoginPassword] = useState('');

	const [regFirstName, setRegFirstName] = useState('');
	const [regLastName, setRegLastName] = useState('');
	const [regPhone, setRegPhone] = useState('');
	const [regPassword, setRegPassword] = useState('');
	const [regRole, setRegRole] = useState<UserRole>(UserRole.USER);
	const isAdminMode = router.query.mode === 'admin';

	useEffect(() => {
		if (isAdminMode) setTab('login');
	}, [isAdminMode]);

	const switchTab = (value: 'login' | 'register') => {
		setTab(value);
		setError('');
	};

	const handleLogin = async (event: React.FormEvent) => {
		event.preventDefault();
		setLoading(true);
		setError('');
		try {
			await logIn(loginPhone, loginPassword);
			const currentUser = userVar();
			if (currentUser.role === UserRole.SUPER_ADMIN) router.push('/_admin');
			else if (currentUser.role === UserRole.AGENCY_ADMIN) router.push('/mypage?tab=agency');
			else router.push('/');
		} catch (err: any) {
			const msg = err?.graphQLErrors?.[0]?.message ?? '';
			if (msg.toLowerCase().includes('banned') || msg.toLowerCase().includes('forbidden')) {
				setError(ui("Sizning hisobingiz bloklangan. Qo'llab-quvvatlash bilan bog'laning."));
			} else {
				setError(ui("Telefon/email yoki parol noto'g'ri."));
			}
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = async (event: React.FormEvent) => {
		event.preventDefault();
		setLoading(true);
		setError('');
		try {
			await signUp({ phoneNumber: regPhone, password: regPassword, firstName: regFirstName, lastName: regLastName, role: regRole });
			if (regRole === UserRole.AGENCY_ADMIN) router.push('/mypage?tab=agency');
			else router.push('/');
		} catch (err: any) {
			const msg = err?.graphQLErrors?.[0]?.message || err?.message || '';
			if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('duplicate')) {
				setError(ui("Bu telefon raqam allaqachon ro'yxatdan o'tgan."));
			} else if (msg) {
				setError(msg);
			} else {
				setError(ui("Ro'yxatdan o'tishda xato. Qayta urinib ko'ring."));
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Head>
				<title>GMP — Sign in / Register</title>
			</Head>

			<div className="join-page">
				<div className="join-card">
				{/* LEFT — dark marketing panel */}
				<div className="join-left">
					<ParticleCanvas />
					<div className="jl-blob jl-blob-1" />
					<div className="jl-blob jl-blob-2" />
					<div className="jl-blob jl-blob-3" />

					<div className="jl-content">
						<div className="jl-brand">
							<span className="jl-brand-dot" />
							GMP
						</div>

						<h1>
							{ui('Your global')}<br />
							<em>{ui('migration')}</em><br />
							{ui('journey starts.')}
						</h1>

						<p className="jl-sub">
							{ui('Connect with verified agencies, explore services in 30+ countries, and manage your entire application in one place.')}
						</p>

						<ul className="jl-features">
							{FEATURES.map((f, i) => (
								<li key={i}>
									<span className="jl-dot" />
									{ui(f)}
								</li>
							))}
						</ul>

						<div className="jl-stats">
							{STATS.map((s, i) => (
								<div className="jl-stat" key={i}>
									<strong>{s.num}</strong>
									<span>{ui(s.label)}</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* RIGHT — form panel */}
				<div className="join-right">
					<FormBgAnimation />
					<div className="jr-inner">
						<div className="jr-logo">GMP</div>

						<div className="jr-heading">
							<p className="jr-eyebrow">{ui('Welcome back')}</p>
							<h2>{isAdminMode ? ui('Admin sign in') : tab === 'login' ? ui('Sign in to your account') : ui('Create your account')}</h2>
						</div>

						<div className="jr-tabs">
							<button className={tab === 'login' ? 'active' : ''} onClick={() => switchTab('login')} type="button">
								{ui('Sign in')}
							</button>
							<button className={tab === 'register' ? 'active' : ''} onClick={() => switchTab('register')} type="button">
								{ui('Register')}
							</button>
						</div>

						{error && <Alert severity="error" className="jr-alert">{error}</Alert>}

						{tab === 'login' && (
							<Box component="form" className="jr-form" onSubmit={handleLogin}>
								<div className="jr-field">
									<label>{ui('Phone number or email')}</label>
									<input
										type="text"
										placeholder="+998901234567 or admin@gmp.com"
										value={loginPhone}
										onChange={(e) => setLoginPhone(e.target.value)}
										required
									/>
								</div>
								<div className="jr-field">
									<label>{ui('Password')}</label>
									<input
										type="password"
										placeholder="Enter your password"
										value={loginPassword}
										onChange={(e) => setLoginPassword(e.target.value)}
										required
									/>
								</div>
								<button type="submit" className="jr-btn" disabled={loading}>
									{loading ? ui('Signing in...') : ui('Sign in')}
								</button>
								<p className="jr-switch">
									{ui('No account?')}{' '}
									<button type="button" onClick={() => switchTab('register')}>{ui('Create one')}</button>
								</p>
								<p className="jr-switch">
									{isAdminMode ? ui('User account?') : ui('Are you an admin?')}{' '}
									<button
										type="button"
										onClick={() => {
											if (isAdminMode) router.push('/account/join');
											else router.push('/account/join?mode=admin');
										}}
									>
										{isAdminMode ? ui('User sign in') : ui('Admin panel')}
									</button>
								</p>
							</Box>
						)}

						{tab === 'register' && (
							<Box component="form" className="jr-form" onSubmit={handleRegister}>
								<div className="jr-roles">
									<div
										className={`jr-role${regRole === UserRole.USER ? ' active' : ''}`}
										onClick={() => setRegRole(UserRole.USER)}
									>
										<PersonIcon />
										<div>
											<strong>{ui('User')}</strong>
											<span>{ui('Apply for services')}</span>
										</div>
									</div>
									<div
										className={`jr-role${regRole === UserRole.AGENCY_ADMIN ? ' active' : ''}`}
										onClick={() => setRegRole(UserRole.AGENCY_ADMIN)}
									>
										<BusinessIcon />
										<div>
											<strong>{ui('Agency')}</strong>
											<span>{ui('Manage services')}</span>
										</div>
									</div>
								</div>

								<div className="jr-grid-2">
									<div className="jr-field">
										<label>{ui('First name')}</label>
										<input placeholder="John" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required />
									</div>
									<div className="jr-field">
										<label>{ui('Last name')}</label>
										<input placeholder="Doe" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} required />
									</div>
								</div>

								<div className="jr-field">
									<label>{ui('Phone number')}</label>
									<input type="tel" placeholder="+998901234567" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
								</div>

								<div className="jr-field">
									<label>{ui('Password')}</label>
									<input type="password" placeholder="Min 8 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
								</div>

								<button type="submit" className="jr-btn" disabled={loading}>
									{loading ? ui('Creating...') : regRole === UserRole.AGENCY_ADMIN ? ui('Create agency account') : ui('Create account')}
								</button>
								<p className="jr-switch">
									{ui('Already registered?')}{' '}
									<button type="button" onClick={() => switchTab('login')}>{ui('Sign in')}</button>
								</p>
							</Box>
						)}
					</div>
				</div>
				</div>{/* join-card */}
			</div>
		</>
	);
};

export default Join;
