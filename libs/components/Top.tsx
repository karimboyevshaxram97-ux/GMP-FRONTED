import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Stack, Box, Menu, MenuItem, Badge, Divider, Typography, IconButton, Tooltip } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Logout } from '@mui/icons-material';
import { useReactiveVar, useQuery, useMutation } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { REACT_APP_API_URL } from '../config';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { GET_MY_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT } from '../../apollo/user/query';
import { MARK_ALL_NOTIFICATIONS_AS_READ } from '../../apollo/user/mutation';
import { useUiLang } from '../utils/translations';
import { NotificationType } from '../enums/common.enum';

const navLinks = [
	{ label: 'Home', href: '/home', match: (p: string, q: any) => p === '/home' || p === '/' },
	{ label: 'Study', href: '/service?type=STUDY_ABROAD', match: (p: string, q: any) => p === '/service' && q.type === 'STUDY_ABROAD' },
	{ label: 'Work', href: '/service?type=WORK_ABROAD', match: (p: string, q: any) => p === '/service' && q.type === 'WORK_ABROAD' },
	{ label: 'Travel', href: '/service?type=TRAVEL', match: (p: string, q: any) => p === '/service' && q.type === 'TRAVEL' },
	{ label: 'Map', href: '/agency/map', match: (p: string, q: any) => p === '/agency/map' },
	{ label: 'Help', href: '/help', match: (p: string, q: any) => p === '/help' },
];

const Top = () => {
	const ui = useUiLang();
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [scrolled, setScrolled] = useState(false);
	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const notifOpen = Boolean(notifAnchor);

	const { data: unreadData, refetch: refetchUnread } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, {
		skip: !user?._id,
		pollInterval: 30000,
	});

	const { data: notifData, refetch: refetchNotifs } = useQuery(GET_MY_NOTIFICATIONS, {
		variables: { input: { page: 1, limit: 10 } },
		skip: !user?._id || !notifOpen,
	});

	const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);

	const unreadCount: number = unreadData?.getUnreadNotificationCount ?? 0;
	const notifications = notifData?.getMyNotifications?.list ?? [];

	const handleNotifOpen = (e: React.MouseEvent<HTMLElement>) => {
		setNotifAnchor(e.currentTarget);
	};

	const handleMarkAllRead = async () => {
		await markAllRead();
		refetchUnread();
		if (notifOpen) refetchNotifs();
	};

	useEffect(() => {
		if (user?._id && notifOpen) refetchNotifs();
	}, [user?._id, notifOpen, refetchNotifs]);

	const handleNotificationClick = (notification: any) => {
		setNotifAnchor(null);
		if (!notification?.targetId) return;

		switch (notification.type) {
			case NotificationType.NEW_SERVICE:
				router.push(`/service/detail?id=${notification.targetId}`);
				break;
			case NotificationType.APPLICATION_RECEIVED:
			case NotificationType.APPLICATION_STATUS_CHANGED:
				router.push('/mypage');
				break;
			case NotificationType.FOLLOW:
			case NotificationType.NEW_REVIEW:
			default:
				router.push(`/agency/${notification.targetId}`);
				break;
		}
	};

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY >= 50);
		if (typeof window !== 'undefined') {
			onScroll();
			window.addEventListener('scroll', onScroll, { passive: true });
			return () => window.removeEventListener('scroll', onScroll);
		}
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		import('animejs').then(({ animate, stagger }) => {
			animate('.logo-box', {
				translateX: [-30, 0],
				duration: 600,
				delay: 500,
				ease: 'outExpo',
			});
			animate('.router-box a', {
				translateY: [-12, 0],
				duration: 500,
				delay: stagger(60, { start: 550 }),
				ease: 'outExpo',
			});
			animate('.join-box, .user-box', {
				translateX: [30, 0],
				duration: 600,
				delay: 600,
				ease: 'outExpo',
			});
		});
	}, []);

	const isActive = (match: (p: string, q: any) => boolean) =>
		match(router.pathname, router.query);

	const isMyPage = router.pathname.startsWith('/mypage');

	if (device === 'mobile') {
		return (
			<Stack className={'top'}>
				<Link href={'/home'}><div>{ui('Home')}</div></Link>
				<Link href={'/service?type=STUDY_ABROAD'}><div>{ui('Study')}</div></Link>
				<Link href={'/service?type=WORK_ABROAD'}><div>{ui('Work')}</div></Link>
				<Link href={'/service?type=TRAVEL'}><div>{ui('Travel')}</div></Link>
				<Link href={'/service?type=VISA_SERVICES'}><div>{ui('Visa')}</div></Link>
				<Link href={'/service'}><div>{ui('All Services')}</div></Link>
				<Link href={'/agency/map'}><div>{ui('Map')}</div></Link>
				{user?._id && <Link href={'/mypage'}><div>{ui('My Page')}</div></Link>}
			</Stack>
		);
	}

	return (
		<div className={'navbar'}>
			<div className={`navbar-main ${scrolled ? 'scrolled' : ''}`}>
				<div className={'container'}>

					{/* LEFT: Logo only */}
					<Box className={'navbar-left'}>
						<Box className={'logo-box'}>
							<Link href={'/home'}>
								<span style={{ color: '#ffffff', fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>GMP</span>
							</Link>
						</Box>
					</Box>

					{/* CENTER: Nav links */}
					<Box className={'router-box'}>
						{navLinks.map((link) => (
							<Link key={link.href} href={link.href}>
								<div className={isActive(link.match) ? 'active' : ''}>{ui(link.label)}</div>
							</Link>
						))}
						{user?._id && (
							<Link href={'/mypage'}>
								<div className={isMyPage ? 'active' : ''}>{ui('My Page')}</div>
							</Link>
						)}
					</Box>

					{/* RIGHT: Login (guest) OR Avatar + notifications (logged in) */}
					{!user?._id ? (
						<Link href={'/account/join'}>
							<div className={'join-box'}>
								<AccountCircleOutlinedIcon />
								<span>{ui('Login / Register')}</span>
							</div>
						</Link>
					) : (
						<Box className={'user-box'}>
							{/* Notification Bell */}
							<Tooltip title={ui('Notifications')}>
								<IconButton className={'notification-icon'} onClick={handleNotifOpen} size="small">
									<Badge badgeContent={unreadCount} color="error" max={99}>
										{unreadCount > 0 ? <NotificationsIcon /> : <NotificationsOutlinedIcon />}
									</Badge>
								</IconButton>
							</Tooltip>

							{/* Notification dropdown */}
							<Menu
								anchorEl={notifAnchor}
								open={notifOpen}
								onClose={() => setNotifAnchor(null)}
								sx={{ mt: '6px' }}
								PaperProps={{ sx: { width: 340, maxHeight: 440, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' } }}
							>
								<Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
									<Typography fontWeight={700} fontSize={14}>{ui('Notifications')}</Typography>
									{unreadCount > 0 && (
										<Typography
											fontSize={12}
											color="primary"
											sx={{ cursor: 'pointer', fontWeight: 600 }}
											onClick={handleMarkAllRead}
										>
											{ui('Mark all read')}
										</Typography>
									)}
								</Box>
								<Divider />
								{notifications.length === 0 ? (
									<Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
										<CheckCircleOutlineIcon sx={{ color: '#ccc', fontSize: 36, mb: 1 }} />
										<Typography fontSize={13} color="text.secondary">{ui('All caught up!')}</Typography>
									</Box>
								) : (
									notifications.map((n: any) => (
										<MenuItem
											key={n._id}
											onClick={() => handleNotificationClick(n)}
											sx={{
												px: 2,
												py: 1.2,
												background: n.isRead ? 'transparent' : 'rgba(22, 73, 255, 0.05)',
												borderLeft: n.isRead ? '3px solid transparent' : '3px solid #1649ff',
												whiteSpace: 'normal',
											}}
										>
											<Box>
												<Typography fontSize={13} fontWeight={n.isRead ? 400 : 600}>{n.message}</Typography>
												<Typography fontSize={11} color="text.secondary" mt={0.3}>
													{new Date(n.createdAt).toLocaleDateString()}
												</Typography>
											</Box>
										</MenuItem>
									))
								)}
							</Menu>

							{/* Avatar */}
							<div className={'login-user'} onClick={(e: any) => setLogoutAnchor(e.currentTarget)}>
								<img
									src={user?.avatar ? `${REACT_APP_API_URL}/uploads/${user.avatar}` : '/img/profile/defaultUser.svg'}
									alt="avatar"
								/>
							</div>
							<Menu
								anchorEl={logoutAnchor}
								open={logoutOpen}
								onClose={() => setLogoutAnchor(null)}
								sx={{ mt: '5px' }}
							>
								<MenuItem onClick={() => { router.push('/mypage'); setLogoutAnchor(null); }}>{ui('My Page')}</MenuItem>
								<MenuItem onClick={() => logOut()}>
									<Logout fontSize="small" style={{ color: '#1649ff', marginRight: 8 }} />
									{ui('Logout')}
								</MenuItem>
							</Menu>
						</Box>
					)}

				</div>
			</div>
		</div>
	);

};

export default Top;
