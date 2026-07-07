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
import SocialLoginButtons from '../../libs/components/common/SocialLoginButtons';
import { useUiLang } from '../../libs/utils/translations';

// Error codes /auth/callback forwards via ?socialError= → translation keys
const SOCIAL_ERROR_KEYS: Record<string, string> = {
	email_conflict: 'auth.emailUsedOtherProvider',
	not_configured: 'auth.providerNotConfigured',
	social_failed: 'auth.socialLoginFailed',
};

// How sign-in works for each account type (shown in the left panel)
const FEATURES = [
	'auth.socialQuickStart',
	'auth.socialPersonalOnly',
	'auth.agencyRegisterHint',
	'auth.agencyLoginHint',
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
			if (currentUser.role === UserRole.SUPER_ADMIN) router.replace('/admin');
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

	// Social login failures land back here as /account/join?socialError=<code>
	useEffect(() => {
		const socialError = router.query.socialError;
		if (typeof socialError !== 'string' || !socialError) return;
		setTab('login');
		setError(ui(SOCIAL_ERROR_KEYS[socialError] ?? SOCIAL_ERROR_KEYS.social_failed));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.query.socialError]);

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
			if (currentUser.role === UserRole.SUPER_ADMIN) router.push('/admin');
			else if (currentUser.role === UserRole.AGENCY_ADMIN) router.push('/mypage?tab=agency');
			else router.push('/');
		} catch (err: any) {
			const msg = err?.graphQLErrors?.[0]?.message ?? '';
			if (msg.toLowerCase().includes('banned') || msg.toLowerCase().includes('forbidden')) {
				setError(ui('auth.sizningHisobingizBloklanganQollabQuvvatlash'));
			} else {
				setError(ui('auth.telefonEmailYokiParolNotogri'));
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
				setError(ui('auth.buTelefonRaqamAllaqachonRoyxatdan'));
			} else if (msg) {
				setError(msg);
			} else {
				setError(ui('auth.royxatdanOtishdaXatoQaytaUrinib'));
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
							{ui('auth.yourGlobal')}<br />
							<em>{ui('auth.migration')}</em><br />
							{ui('auth.journeyStarts')}
						</h1>

						<p className="jl-sub">
							{ui('auth.connectWithVerifiedAgenciesExplore')}
						</p>

						<ul className="jl-features">
							{FEATURES.map((f, i) => (
								<li key={i}>
									<span className="jl-dot" />
									{ui(f)}
								</li>
							))}
						</ul>

					</div>
				</div>

				{/* RIGHT — form panel */}
				<div className="join-right">
					<FormBgAnimation />
					<div className="jr-inner">
						<div className="jr-logo">GMP</div>

						<div className="jr-heading">
							<p className="jr-eyebrow">{ui('auth.welcomeBack')}</p>
							<h2>{isAdminMode ? ui('auth.adminSignIn') : tab === 'login' ? ui('auth.signInToYourAccount') : ui('auth.createYourAccount')}</h2>
						</div>

						<div className="jr-tabs">
							<button className={tab === 'login' ? 'active' : ''} onClick={() => switchTab('login')} type="button">
								{ui('auth.signIn')}
							</button>
							<button className={tab === 'register' ? 'active' : ''} onClick={() => switchTab('register')} type="button">
								{ui('auth.register')}
							</button>
						</div>

						{error && <Alert severity="error" className="jr-alert">{error}</Alert>}

						{tab === 'login' && (
							<Box component="form" className="jr-form" onSubmit={handleLogin}>
								<div className="jr-field">
									<label>{ui('auth.phoneNumberOrEmail')}</label>
									<input
										type="text"
										placeholder="+998901234567 or admin@gmp.com"
										value={loginPhone}
										onChange={(e) => setLoginPhone(e.target.value)}
										required
									/>
								</div>
								<div className="jr-field">
									<label>{ui('auth.password')}</label>
									<input
										type="password"
										placeholder="Enter your password"
										value={loginPassword}
										onChange={(e) => setLoginPassword(e.target.value)}
										required
									/>
								</div>
								<button type="submit" className="jr-btn" disabled={loading}>
									{loading ? ui('auth.signingIn') : ui('auth.signIn')}
								</button>
								{!isAdminMode && <SocialLoginButtons />}
								<p className="jr-switch">
									{ui('auth.noAccount')}{' '}
									<button type="button" onClick={() => switchTab('register')}>{ui('auth.createOne')}</button>
								</p>
								<p className="jr-switch">
									{isAdminMode ? ui('auth.userAccount') : ui('auth.areYouAnAdmin')}{' '}
									<button
										type="button"
										onClick={() => {
											if (isAdminMode) router.push('/account/join');
											else router.push('/account/join?mode=admin');
										}}
									>
										{isAdminMode ? ui('auth.userSignIn') : ui('auth.adminPanel')}
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
											<strong>{ui('auth.user')}</strong>
											<span>{ui('auth.applyForServices')}</span>
										</div>
									</div>
									<div
										className={`jr-role${regRole === UserRole.AGENCY_ADMIN ? ' active' : ''}`}
										onClick={() => setRegRole(UserRole.AGENCY_ADMIN)}
									>
										<BusinessIcon />
										<div>
											<strong>{ui('auth.agency')}</strong>
											<span>{ui('auth.manageServices')}</span>
										</div>
									</div>
								</div>

								<div className="jr-grid-2">
									<div className="jr-field">
										<label>{ui('auth.firstName')}</label>
										<input placeholder="John" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required />
									</div>
									<div className="jr-field">
										<label>{ui('auth.lastName')}</label>
										<input placeholder="Doe" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} required />
									</div>
								</div>

								<div className="jr-field">
									<label>{ui('auth.phoneNumber')}</label>
									<input type="tel" placeholder="+998901234567" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
								</div>

								<div className="jr-field">
									<label>{ui('auth.password')}</label>
									<input type="password" placeholder="Min 8 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
								</div>

								<button type="submit" className="jr-btn" disabled={loading}>
									{loading ? ui('auth.creating') : regRole === UserRole.AGENCY_ADMIN ? ui('auth.createAgencyAccount') : ui('auth.createAccount')}
								</button>
								<p className="jr-switch">
									{ui('auth.alreadyRegistered')}{' '}
									<button type="button" onClick={() => switchTab('login')}>{ui('auth.signIn')}</button>
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

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
