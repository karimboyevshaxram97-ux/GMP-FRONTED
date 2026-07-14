import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Badge, CircularProgress, Select, MenuItem } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import LogoutIcon from '@mui/icons-material/Logout';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { getJwtToken, updateUserInfo, logOut } from '../../auth';
import { UserRole } from '../../enums/user.enum';
import { PLATFORM_STATS } from '../../../apollo/admin/query';
import { GET_ME } from '../../../apollo/user/query';
import { UPDATE_LANGUAGE } from '../../../apollo/user/mutation';
import { initializeApollo } from '../../../apollo/client';
import { Lang } from '../../enums/lang.enum';
import { normalizeLang, setLang, toBackendLang } from '../../utils/lang';
import { useUiLang } from '../../utils/translations';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import FlagIcon from '../common/FlagIcon';

const NAV_SECTIONS = [
	{
		label: 'Overview',
		items: [
			{ icon: <DashboardIcon />, label: 'Dashboard', href: '/admin' },
		],
	},
	{
		label: 'Management',
		items: [
			{ icon: <PeopleIcon />,                  label: 'Users',     href: '/admin/users' },
			{ icon: <BusinessIcon />,                label: 'Agencies',  href: '/admin/agencies', badge: true },
			{ icon: <MiscellaneousServicesIcon />,   label: 'Services',  href: '/admin/services' },
			{ icon: <RateReviewIcon />,              label: 'Reviews',   href: '/admin/reviews' },
			{ icon: <ContactSupportIcon />,          label: 'Support',   href: '/admin/support' },
		],
	},
	{
		label: 'System',
		items: [
			{ icon: <HistoryIcon />, label: 'Audit Log', href: '/admin/audit-log' },
		],
	},
];

const withLayoutAdmin = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const ui = useUiLang();
		const reactiveUser = useReactiveVar(userVar);
		const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
		const [currentUser, setCurrentUser] = useState<any>(null);
		const [updateLanguage] = useMutation(UPDATE_LANGUAGE);

		useEffect(() => {
			let mounted = true;

			const verifyAdmin = async () => {
				const jwt = getJwtToken();
				if (!jwt) {
					if (mounted) setIsAdmin(false);
					router.replace('/account/join');
					return;
				}

				updateUserInfo(jwt);

				try {
					const client = initializeApollo();
					const result = await client.query({ query: GET_ME, fetchPolicy: 'network-only' });
					const me = result?.data?.me;
					const ok = !!(me?._id && me.role === UserRole.SUPER_ADMIN);
					if (me) {
						const preferredLanguage = normalizeLang(me.preferredLanguage);
						userVar({ ...userVar(), ...me, preferredLanguage: preferredLanguage ?? Lang.UZ });
						if (preferredLanguage) {
							setLang(preferredLanguage);
						}
					}
					if (!ok) router.replace('/account/join');
					if (mounted) {
						setIsAdmin(ok);
						setCurrentUser(me ? { ...me, preferredLanguage: normalizeLang(me.preferredLanguage) ?? Lang.UZ } : userVar());
					}
				} catch {
					// GET_ME xato bersa (masalan tarmoq xatosi) — client tomonda dekodlangan,
					// imzosi tekshirilmagan JWT claim'iga ishonib ruxsat berish o'rniga rad etamiz.
					router.replace('/account/join');
					if (mounted) setIsAdmin(false);
				}
			};

			verifyAdmin();

			return () => {
				mounted = false;
			};
		}, [router]);

		const { data } = useQuery(PLATFORM_STATS, {
			skip: isAdmin !== true,
			pollInterval: 60000,
		});
		const pendingCount: number = data?.platformStats?.pendingAgencyVerifications ?? 0;
		const selectedLang = (currentUser?.preferredLanguage || reactiveUser?.preferredLanguage || Lang.UZ) as Lang;

		const handleLanguageChange = async (nextLang: Lang) => {
			const previous = selectedLang;
			setLang(nextLang);
			const nextUser = { ...userVar(), preferredLanguage: nextLang };
			userVar(nextUser);
			setCurrentUser((prev: any) => ({ ...(prev ?? {}), preferredLanguage: nextLang }));
			try {
				const result = await updateLanguage({ variables: { input: { preferredLanguage: toBackendLang(nextLang) } } });
				const savedLang = normalizeLang(result?.data?.updateMe?.preferredLanguage) || nextLang;
				userVar({ ...userVar(), preferredLanguage: savedLang });
				setCurrentUser((prev: any) => ({ ...(prev ?? {}), preferredLanguage: savedLang }));
				setLang(savedLang);
				await sweetMixinSuccessAlert(ui('admin.languageUpdated'));
			} catch (err) {
				if (process.env.NODE_ENV !== 'production') console.warn('update language failed', err);
				setLang(previous);
				userVar({ ...userVar(), preferredLanguage: previous });
				setCurrentUser((prev: any) => ({ ...(prev ?? {}), preferredLanguage: previous }));
				await sweetMixinErrorAlert(ui('admin.failedToUpdateLanguage'));
			}
		};

		if (isAdmin === null) {
			return (
				<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f8' }}>
					<CircularProgress sx={{ color: '#1649ff' }} />
				</Box>
			);
		}

		if (!isAdmin) return null;

		const initials = currentUser
			? `${currentUser.firstName?.[0] ?? ''}${currentUser.lastName?.[0] ?? ''}`.toUpperCase() || 'A'
			: 'A';

		return (
			<>
				<Head>
					<title>GMP Admin Panel</title>
				</Head>
				<div className="admin-page">

					{/* ── Sidebar ── */}
					<aside className="admin-sidebar">

						{/* Brand */}
						<div className="sidebar-brand">
							<div className="brand-logo">
								<div className="brand-dot">G</div>
								<h2>GMP Admin</h2>
							</div>
							<div className="brand-sub">{ui('admin.managementPanel')}</div>
						</div>

						<Box className="lang-select-wrap">
							<Select
								fullWidth
								size="small"
								value={selectedLang}
								onChange={(e) => handleLanguageChange(e.target.value as Lang)}
								sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.18)' }, '.MuiSvgIcon-root': { color: '#fff' } }}
							>
								<MenuItem value={Lang.UZ} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<FlagIcon lang={Lang.UZ} size={20} /> UZ — O'zbek
								</MenuItem>
								<MenuItem value={Lang.RU} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<FlagIcon lang={Lang.RU} size={20} /> RU — Русский
								</MenuItem>
								<MenuItem value={Lang.EN} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<FlagIcon lang={Lang.EN} size={20} /> EN — English
								</MenuItem>
								<MenuItem value={Lang.KO} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<FlagIcon lang={Lang.KO} size={20} /> KO — 한국어
								</MenuItem>
							</Select>
						</Box>

						{/* Nav */}
						<nav className="sidebar-nav">
							{NAV_SECTIONS.map((section) => (
								<div key={section.label}>
									<div className="sidebar-section">{ui(section.label)}</div>
									{section.items.map((item) => {
										const isActive = router.pathname === item.href;
										const icon = item.badge && pendingCount > 0
											? <Badge badgeContent={pendingCount} color="error" max={99}>{item.icon}</Badge>
											: item.icon;
										return (
											<Link key={item.href} href={item.href}>
												<div className={`menu-item ${isActive ? 'active' : ''}`}>
													{icon}
													<span className="menu-label">{ui(item.label)}</span>
												</div>
											</Link>
										);
									})}
								</div>
							))}
						</nav>

						{/* Footer */}
						<div className="sidebar-footer">
							<div className="sidebar-user">
								<div className="su-avatar">{initials}</div>
								<div className="su-info">
									<div className="su-name">
										{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Admin'}
									</div>
									<div className="su-role">{ui('admin.superAdmin')}</div>
								</div>
							</div>
							<div className="menu-item danger" onClick={() => logOut()}>
								<LogoutIcon />
								<span className="menu-label">{ui('admin.logout')}</span>
							</div>
						</div>

					</aside>

					{/* ── Content ── */}
					<main className="admin-content">
						<Component {...props} />
					</main>

				</div>
			</>
		);
	};
};

export default withLayoutAdmin;
