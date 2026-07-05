import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Box, Button, TextField, Chip, IconButton, CircularProgress, Select, MenuItem, FormControl, InputLabel, Rating, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Alert from '@mui/material/Alert';
import { useQuery, useMutation, useLazyQuery, useReactiveVar } from '@apollo/client';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MY_APPLICATIONS, MY_FOLLOWING_AGENCIES, MY_CONVERSATIONS, CONVERSATION_MESSAGES, MY_AGENCY, GET_SERVICES_BY_AGENCY, APPLICATIONS_BY_AGENCY, GET_AGENCY } from '../../apollo/user/query';
import { UPDATE_ME, SEND_MESSAGE, MARK_CONVERSATION_AS_READ, CREATE_AGENCY, UPDATE_MY_AGENCY, CREATE_SERVICE, UPDATE_SERVICE, DELETE_SERVICE, UPDATE_APPLICATION_STATUS } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { getJwtToken, refreshAuthTokens } from '../../libs/auth';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { applicationStatusColors, REACT_APP_API_URL } from '../../libs/config';
import { sweetMixinSuccessAlert, sweetMixinErrorAlert, sweetConfirmAlert } from '../../libs/sweetAlert';
import { useLang } from '../../libs/utils/lang';
import { UserRole } from '../../libs/enums/user.enum';
import { ServiceType } from '../../libs/enums/service.enum';
import { toFriendlyError } from '../../libs/utils/errors';
import { useUiLang } from '../../libs/utils/translations';

// ── Helper components ────────────────────────────────────────────────────────

function FollowingAgencyRow({ follow, onOpen }: { follow: any; onOpen: () => void }) {
	const tr = useLang();
	const ui = useUiLang();
	const { data } = useQuery(GET_AGENCY, {
		errorPolicy: 'all',
		variables: { id: follow.agency },
		skip: !follow.agency,
	});
	const agency = data?.getAgency;
	return (
		<Box className="list-row clickable" onClick={onOpen}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
				{agency?.logo
					? <img src={`${REACT_APP_API_URL}/uploads/${agency.logo}`} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
					: <BusinessIcon sx={{ fontSize: 28, color: '#aaa' }} />}
				<div>
					<strong>{agency ? tr(agency.name) : ui('auth.agency')}</strong>
					<span style={{ display: 'block', fontSize: 12, color: '#888' }}>
						{agency?.email || follow.agency}
					</span>
					<span style={{ fontSize: 11, color: '#aaa' }}>
						{ui('mypage.followed')}: {new Date(follow.followedAt).toLocaleDateString()}
					</span>
				</div>
			</Box>
			<Chip label={ui('View')} />
		</Box>
	);
}

function ApplicationRow({ app, onOpen }: { app: any; onOpen: () => void }) {
	const ui = useUiLang();
	return (
		<Box key={app._id} className="list-row">
			<div style={{ flex: 1 }}>
				<strong style={{ display: 'block', cursor: 'pointer', color: '#1649ff' }} onClick={onOpen}>
					{ui('mypage.application')} #{app._id.slice(-6)}
				</strong>
				<span style={{ display: 'block', fontSize: 12, color: '#888' }}>
					{ui('mypage.applied')}: {new Date(app.appliedAt).toLocaleDateString()}
				</span>
				{app.paymentStatus && (
					<span className="payment-badge" data-status={app.paymentStatus}>
						{ui('mypage.payment')}: {ui(app.paymentStatus)}
					</span>
				)}
				{app.notes && <span style={{ display: 'block', fontSize: 12, color: '#666', marginTop: 2 }}>{app.notes}</span>}
			</div>
			<Chip label={app.status} sx={{ bgcolor: applicationStatusColors[app.status] || '#9e9e9e', color: '#fff', fontWeight: 700 }} />
		</Box>
	);
}

const MyPage: NextPage = () => {
	const router = useRouter();
	const tr = useLang();
	const ui = useUiLang();
	const user = useReactiveVar(userVar);
	const [tab, setTab] = useState(0);
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [bio, setBio] = useState('');
	const [nationality, setNationality] = useState('');

	// Avatar upload
	const avatarInputRef = useRef<HTMLInputElement>(null);
	const [avatarUploading, setAvatarUploading] = useState(false);

	// Agency logo upload
	const logoInputRef = useRef<HTMLInputElement>(null);
	const [logoUploading, setLogoUploading] = useState(false);
	const [localLogo, setLocalLogo] = useState<string | null>(null);

	// Agency cover image upload
	const coverInputRef = useRef<HTMLInputElement>(null);
	const [coverUploading, setCoverUploading] = useState(false);
	const [localCover, setLocalCover] = useState<string | null>(null);

	// Agency info editing
	const [editInfoMode, setEditInfoMode] = useState(false);
	const [editAgencyName, setEditAgencyName] = useState('');
	const [editAgencyDesc, setEditAgencyDesc] = useState('');
	const [editAgencyPhone, setEditAgencyPhone] = useState('');
	const [editAgencyWebsite, setEditAgencyWebsite] = useState('');
	const [editAgencyCountries, setEditAgencyCountries] = useState('');
	const [infoSaving, setInfoSaving] = useState(false);

	// Chat state
	const [activeConversation, setActiveConversation] = useState<any>(null);
	const [messageText, setMessageText] = useState('');
	const [sending, setSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Agency form state
	const [agencyName, setAgencyName] = useState('');
	const [agencyEmail, setAgencyEmail] = useState('');
	const [agencyDesc, setAgencyDesc] = useState('');
	const [agencyPhone, setAgencyPhone] = useState('');
	const [agencyWebsite, setAgencyWebsite] = useState('');
	const [agencyCountries, setAgencyCountries] = useState('');
	const [agencyCity, setAgencyCity] = useState('');
	const [agencyHqCountry, setAgencyHqCountry] = useState('');
	const [agencyAddress, setAgencyAddress] = useState('');
	const [agencyLat, setAgencyLat] = useState('');
	const [agencyLng, setAgencyLng] = useState('');
	const [agencyCreating, setAgencyCreating] = useState(false);
	const [agencyError, setAgencyError] = useState('');

	// Images for the NEW agency (uploaded before the agency exists)
	const newLogoInputRef = useRef<HTMLInputElement>(null);
	const newCoverInputRef = useRef<HTMLInputElement>(null);
	const [newLogo, setNewLogo] = useState<string | null>(null);
	const [newCover, setNewCover] = useState<string | null>(null);
	const [newImgUploading, setNewImgUploading] = useState<'logo' | 'cover' | null>(null);
	const [editingLocation, setEditingLocation] = useState(false);
	const [editCity, setEditCity] = useState('');
	const [editHqCountry, setEditHqCountry] = useState('');
	const [editAddress, setEditAddress] = useState('');
	const [editLat, setEditLat] = useState('');
	const [editLng, setEditLng] = useState('');
	const [locationSaving, setLocationSaving] = useState(false);

	// Service management state
	const [showServiceForm, setShowServiceForm] = useState(false);
	const [editingService, setEditingService] = useState<any>(null);
	const [svcName, setSvcName] = useState('');
	const [svcDesc, setSvcDesc] = useState('');
	const [svcType, setSvcType] = useState<string>(ServiceType.VISA_SERVICES);
	const [svcDest, setSvcDest] = useState('');
	const [svcSources, setSvcSources] = useState('');
	const [svcPrice, setSvcPrice] = useState('');
	const [svcProcessing, setSvcProcessing] = useState('');
	const [svcSaving, setSvcSaving] = useState(false);

	// Applications received (for agency admin)
	const [appStatusFilter, setAppStatusFilter] = useState('');
	const isAgencyAdmin = user?.role === UserRole.AGENCY_ADMIN;

	useEffect(() => {
		if (!user?._id) {
			const jwt = getJwtToken();
			if (!jwt) router.push('/account/join');
		}
		if (user?._id) {
			setFirstName(user.firstName || '');
			setLastName(user.lastName || '');
			setBio(user.bio || '');
			setNationality(user.nationality || '');
		}
	}, [user, router]);

	useEffect(() => {
		if (router.query.tab === 'messages') setTab(3);
		if (router.query.tab === 'agency') setTab(isAgencyAdmin ? 4 : 0);
	}, [router.query.tab, isAgencyAdmin]);

	useEffect(() => {
		if (!isAgencyAdmin && tab > 3) setTab(0);
	}, [isAgencyAdmin, tab]);

	const { data: appData } = useQuery(MY_APPLICATIONS, { skip: !user?._id });
	const { data: followData } = useQuery(MY_FOLLOWING_AGENCIES, { skip: !user?._id });
	const { data: convData, refetch: refetchConversations } = useQuery(MY_CONVERSATIONS, { skip: !user?._id });
	const { data: myAgencyData, refetch: refetchMyAgency } = useQuery(MY_AGENCY, { skip: !user?._id || !isAgencyAdmin });
	const [updateMe] = useMutation(UPDATE_ME);
	const [createAgency] = useMutation(CREATE_AGENCY);
	const [updateMyAgency] = useMutation(UPDATE_MY_AGENCY);
	const [createService] = useMutation(CREATE_SERVICE);
	const [updateService] = useMutation(UPDATE_SERVICE);
	const [deleteService] = useMutation(DELETE_SERVICE);
	const [updateApplicationStatus] = useMutation(UPDATE_APPLICATION_STATUS);

	const myAgency = myAgencyData?.myAgency ?? null;
	const isAgencyVerified = myAgency?.status === 'ACTIVE' && myAgency?.verificationStatus === 'VERIFIED';

	const { data: agencyServicesData, refetch: refetchAgencyServices } = useQuery(GET_SERVICES_BY_AGENCY, {
		variables: { agencyId: myAgency?._id },
		skip: !myAgency?._id,
	});

	const { data: agencyAppsData, refetch: refetchAgencyApps } = useQuery(APPLICATIONS_BY_AGENCY, {
		variables: { agencyId: myAgency?._id },
		skip: !myAgency?._id,
	});

	const [fetchMessages, { data: msgData, loading: msgLoading, refetch: refetchMessages }] = useLazyQuery(CONVERSATION_MESSAGES);
	const [sendMessage] = useMutation(SEND_MESSAGE);
	const [markAsRead] = useMutation(MARK_CONVERSATION_AS_READ);

	const applications = appData?.myApplications ?? [];
	const followings = followData?.myFollowingAgencies ?? [];
	const conversations = convData?.myConversations ?? [];
	const messages = React.useMemo(() => msgData?.conversationMessages ?? [], [msgData?.conversationMessages]);
	const agencyServices: any[] = agencyServicesData?.getServicesByAgency ?? [];
	const agencyApplications: any[] = agencyAppsData?.applicationsByAgency ?? [];

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const openConversation = async (conversation: any) => {
		setActiveConversation(conversation);
		await fetchMessages({ variables: { conversationId: conversation._id, limit: 50, skip: 0 } });
		if (conversation.unreadCount > 0) {
			await markAsRead({ variables: { conversationId: conversation._id } });
			refetchConversations();
		}
	};

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!messageText.trim() || !activeConversation) return;
		setSending(true);
		try {
			await sendMessage({
				variables: {
					input: {
						conversationId: activeConversation._id,
						text: messageText.trim(),
					},
				},
			});
			setMessageText('');
			refetchMessages?.({ conversationId: activeConversation._id, limit: 50, skip: 0 });
		} finally {
			setSending(false);
		}
	};

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setAvatarUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', file);
			const token = getJwtToken();
			const res = await fetch(`${REACT_APP_API_URL}/upload/image?type=avatar`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.message || 'Upload failed');
			}
			const { filename } = await res.json();
			const result = await updateMe({ variables: { input: { avatar: filename } } });
			const updatedUser = result?.data?.updateMe;
			userVar({ ...userVar(), ...updatedUser, avatar: updatedUser?.avatar ?? filename });
			await refreshAuthTokens();
			await sweetMixinSuccessAlert(ui('mypage.avatarUpdated'));
		} catch (err: any) {
			const msg = err?.graphQLErrors?.[0]?.message || err?.message || ui('Failed to upload photo');
			await sweetMixinErrorAlert(msg);
		} finally {
			setAvatarUploading(false);
			if (avatarInputRef.current) avatarInputRef.current.value = '';
		}
	};

	const handleUpdateProfile = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			const result = await updateMe({ variables: { input: { firstName, lastName, bio, nationality } } });
			const updatedUser = result?.data?.updateMe;
			if (updatedUser) userVar({ ...userVar(), ...updatedUser });
			await refreshAuthTokens();
			await sweetMixinSuccessAlert(ui('mypage.profileUpdated'));
		} catch (err: any) {
			await sweetMixinErrorAlert(toFriendlyError(err, ui('Failed to update profile')));
		}
	};

	// Upload a logo/cover image for the agency that is being created (no agency yet)
	const handleNewAgencyImage = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
		const file = e.target.files?.[0];
		if (!file) return;
		setNewImgUploading(type);
		try {
			const formData = new FormData();
			formData.append('file', file);
			const token = getJwtToken();
			const res = await fetch(`${REACT_APP_API_URL}/upload/image?type=${type}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Upload failed');
			const { filename } = await res.json();
			if (type === 'logo') setNewLogo(filename);
			else setNewCover(filename);
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || `Failed to upload ${type}`);
		} finally {
			setNewImgUploading(null);
			if (type === 'logo' && newLogoInputRef.current) newLogoInputRef.current.value = '';
			if (type === 'cover' && newCoverInputRef.current) newCoverInputRef.current.value = '';
		}
	};

	const handleCreateAgency = async (event: React.FormEvent) => {
		event.preventDefault();
		setAgencyError('');
		const countries = agencyCountries.split(',').map((c) => c.trim()).filter(Boolean);
		if (!countries.length) { setAgencyError(ui('At least one operating country is required.')); return; }
		setAgencyCreating(true);
		try {
			await createAgency({
				variables: {
					input: {
						name: { en: agencyName, uz: agencyName, ru: agencyName, ko: agencyName },
						email: agencyEmail,
						description: agencyDesc ? { en: agencyDesc, uz: agencyDesc, ru: agencyDesc, ko: agencyDesc } : undefined,
						phoneNumber: agencyPhone || undefined,
						website: agencyWebsite || undefined,
						operatingCountries: countries,
						logo: newLogo || undefined,
						coverImage: newCover || undefined,
						city: agencyCity || undefined,
						country: agencyHqCountry || undefined,
						address: agencyAddress || undefined,
						latitude: agencyLat ? parseFloat(agencyLat) : undefined,
						longitude: agencyLng ? parseFloat(agencyLng) : undefined,
					},
				},
			});
			setNewLogo(null);
			setNewCover(null);
			await refetchMyAgency();
			await refreshAuthTokens();
			await sweetMixinSuccessAlert(ui('mypage.agencyCreatedPendingAdminApproval'));
		} catch (err: any) {
			setAgencyError(toFriendlyError(err, ui('Failed to create agency. Please try again.')));
		} finally {
			setAgencyCreating(false);
		}
	};

	const handleEditLocation = (agency: any) => {
		setEditCity(agency.city || '');
		setEditHqCountry(agency.country || '');
		setEditAddress(agency.address || '');
		setEditLat(agency.latitude != null ? String(agency.latitude) : '');
		setEditLng(agency.longitude != null ? String(agency.longitude) : '');
		setEditingLocation(true);
	};

	const handleSaveLocation = async (e: React.FormEvent) => {
		e.preventDefault();
		setLocationSaving(true);
		try {
			await updateMyAgency({
				variables: {
					input: {
						city: editCity || undefined,
						country: editHqCountry || undefined,
						address: editAddress || undefined,
						latitude: editLat ? parseFloat(editLat) : undefined,
						longitude: editLng ? parseFloat(editLng) : undefined,
					},
				},
			});
			await refetchMyAgency();
			setEditingLocation(false);
			await sweetMixinSuccessAlert(ui('mypage.locationUpdated'));
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || ui('Failed to update location.'));
		} finally {
			setLocationSaving(false);
		}
	};

	const openServiceForm = (service?: any) => {
		if (service) {
			setEditingService(service);
			setSvcName(service.name?.en || service.name?.uz || '');
			setSvcDesc(service.description?.en || service.description?.uz || '');
			setSvcType(service.serviceType || ServiceType.VISA_SERVICES);
			setSvcDest(service.destinationCountry || '');
			setSvcSources((service.sourceCountries || []).join(', '));
			setSvcPrice(service.price != null ? String(service.price) : '');
			setSvcProcessing(service.processingTime || '');
		} else {
			setEditingService(null);
			setSvcName(''); setSvcDesc(''); setSvcType(ServiceType.VISA_SERVICES);
			setSvcDest(''); setSvcSources(''); setSvcPrice(''); setSvcProcessing('');
		}
		setShowServiceForm(true);
	};

	const handleSaveService = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!myAgency) return;
		setSvcSaving(true);
		try {
			const sourceCountries = svcSources.split(',').map((s) => s.trim()).filter(Boolean);
			const nameObj = { en: svcName, uz: svcName, ru: svcName, ko: svcName };
			const descObj = svcDesc ? { en: svcDesc, uz: svcDesc, ru: svcDesc, ko: svcDesc } : undefined;
			if (editingService) {
				await updateService({
					variables: {
						id: editingService._id,
						input: {
							name: nameObj,
							description: descObj,
							serviceType: svcType,
							destinationCountry: svcDest,
							sourceCountries,
							price: svcPrice ? parseFloat(svcPrice) : undefined,
							processingTime: svcProcessing || undefined,
						},
					},
				});
				await sweetMixinSuccessAlert(ui('mypage.serviceUpdated'));
			} else {
				await createService({
					variables: {
						agencyId: myAgency._id,
						input: { name: nameObj, description: descObj, serviceType: svcType, destinationCountry: svcDest, sourceCountries, price: svcPrice ? parseFloat(svcPrice) : undefined, processingTime: svcProcessing || undefined },
					},
				});
				await sweetMixinSuccessAlert(ui('mypage.serviceCreated'));
			}
			setShowServiceForm(false);
			refetchAgencyServices();
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.graphQLErrors?.[0]?.message || err?.message || ui('Failed to save service'));
		} finally {
			setSvcSaving(false);
		}
	};

	const handleDeleteService = async (serviceId: string, name: string) => {
		const ok = await sweetConfirmAlert(`Delete service "${name}"?`);
		if (!ok) return;
		try {
			await deleteService({ variables: { id: serviceId } });
			await sweetMixinSuccessAlert(ui('mypage.serviceDeleted'));
			refetchAgencyServices();
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || ui('mypage.failedToDeleteService'));
		}
	};

	const handleUpdateAppStatus = async (appId: string, status: string) => {
		try {
			await updateApplicationStatus({ variables: { id: appId, input: { status } } });
			await sweetMixinSuccessAlert(`Status updated to ${status}`);
			refetchAgencyApps();
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || ui('Failed to update status'));
		}
	};

	const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setCoverUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', file);
			const token = getJwtToken();
			const res = await fetch(`${REACT_APP_API_URL}/upload/image?type=cover`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Upload failed');
			const { filename } = await res.json();
			await updateMyAgency({ variables: { input: { coverImage: filename } } });
			setLocalCover(filename);
			refetchMyAgency();
			await sweetMixinSuccessAlert(ui('mypage.coverPhotoUpdated'));
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || ui('Failed to upload cover photo'));
		} finally {
			setCoverUploading(false);
			if (coverInputRef.current) coverInputRef.current.value = '';
		}
	};

	const openInfoEdit = (agency: any) => {
		setEditAgencyName(agency.name?.en || agency.name?.uz || '');
		setEditAgencyDesc(agency.description?.en || agency.description?.uz || '');
		setEditAgencyPhone(agency.phoneNumber || '');
		setEditAgencyWebsite(agency.website || '');
		setEditAgencyCountries((agency.operatingCountries || []).join(', '));
		setEditInfoMode(true);
	};

	const handleSaveAgencyInfo = async (e: React.FormEvent) => {
		e.preventDefault();
		const countries = editAgencyCountries.split(',').map((c) => c.trim()).filter(Boolean);
		if (!countries.length) return sweetMixinErrorAlert(ui('At least one operating country is required'));
		setInfoSaving(true);
		try {
			await updateMyAgency({
				variables: {
					input: {
						name: { en: editAgencyName, uz: editAgencyName, ru: editAgencyName, ko: editAgencyName },
						description: editAgencyDesc ? { en: editAgencyDesc, uz: editAgencyDesc, ru: editAgencyDesc, ko: editAgencyDesc } : undefined,
						phoneNumber: editAgencyPhone || undefined,
						website: editAgencyWebsite || undefined,
						operatingCountries: countries,
					},
				},
			});
			await refetchMyAgency();
			setEditInfoMode(false);
			await sweetMixinSuccessAlert(ui('mypage.agencyInfoUpdated'));
		} catch (err: any) {
			await sweetMixinErrorAlert(toFriendlyError(err, ui('Failed to update agency info')));
		} finally {
			setInfoSaving(false);
		}
	};

	const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setLogoUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', file);
			const token = getJwtToken();
			const res = await fetch(`${REACT_APP_API_URL}/upload/image?type=logo`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.message || 'Upload failed');
			}
			const { filename } = await res.json();
			await updateMyAgency({ variables: { input: { logo: filename } } });
			setLocalLogo(filename);
			refetchMyAgency();
			await sweetMixinSuccessAlert(ui('mypage.logoUpdated'));
		} catch (err: any) {
			const msg = err?.graphQLErrors?.[0]?.message || err?.message || ui('Failed to upload logo');
			await sweetMixinErrorAlert(msg);
		} finally {
			setLogoUploading(false);
			if (logoInputRef.current) logoInputRef.current.value = '';
		}
	};

	const accountRoleLabel = isAgencyAdmin ? ui('mypage.agencyAccount') : ui('mypage.userAccount');

	const menuItems = [
		{ icon: <PersonIcon />, label: ui('mypage.profile'), count: null },
		{ icon: <AssignmentIcon />, label: ui('mypage.applications'), count: applications.length },
		{ icon: <PeopleIcon />, label: ui('agency.following'), count: followings.length },
		{ icon: <ChatIcon />, label: ui('mypage.messages'), count: conversations.filter((c: any) => c.unreadCount > 0).length || conversations.length },
		...(isAgencyAdmin ? [
			{ icon: <BusinessIcon />, label: ui('My Agency'), count: null },
			{ icon: <MiscellaneousServicesIcon />, label: ui('agency.services'), count: agencyServices.length },
			{ icon: <WorkOutlineIcon />, label: ui('Applications Received'), count: agencyApplications.filter((a: any) => a.status === 'SUBMITTED').length || null },
		] : []),
	];

	return (
		<div className="mypage">
			<Box className="mypage-hero-clean">
				<Stack className="container">
					<Box className="mypage-hero-grid">
						<Box className="profile-summary">
							<img
								src={user?.avatar ? `${REACT_APP_API_URL}/uploads/${user.avatar}` : '/img/profile/defaultUser.svg'}
								alt="avatar"
							/>
							<Box>
								<span>{ui('mypage.myAccount')}</span>
								<h1>{user?.firstName || ui('auth.user')} {user?.lastName || ''}</h1>
								<p>{user?.email}</p>
								<div className={`account-role-badge ${isAgencyAdmin ? 'agency' : 'user'}`}>
									{accountRoleLabel}
								</div>
							</Box>
						</Box>
						<Box className="account-stats">
							<div><strong>{applications.length}</strong><span>{ui('mypage.applications')}</span></div>
							<div><strong>{followings.length}</strong><span>{ui('agency.following')}</span></div>
							<div><strong>{conversations.length}</strong><span>{ui('mypage.messages')}</span></div>
						</Box>
					</Box>
				</Stack>
			</Box>

			<Stack className="container">
				<Box className="mypage-layout">
					<Box className="mypage-sidebar">
						<Box className="menu-list">
							{menuItems.map((item, index) => (
								<Box
									key={item.label}
									className={`menu-item ${tab === index ? 'active' : ''}`}
									onClick={() => {
										if (index === 3) { router.push('/mypage/messages'); return; }
										setTab(index); setActiveConversation(null);
									}}
								>
									{item.icon}
									<span>{item.label}</span>
									{item.count !== null && item.count !== 0 && <b>{item.count}</b>}
								</Box>
							))}
						</Box>
					</Box>

					<Box className="mypage-content-card">
						{tab === 0 && (
							<Box className="profile-form">
								<div className="content-head">
									<span>{ui('mypage.personalDetails')}</span>
									<h2>{ui('mypage.editProfile')}</h2>
								</div>

								{/* Avatar upload */}
								<Box className="avatar-upload-section">
									<input
										ref={avatarInputRef}
										type="file"
										accept="image/jpeg,image/png,image/webp"
										style={{ display: 'none' }}
										onChange={handleAvatarChange}
									/>
									<Box
										className="avatar-upload-wrap"
										onClick={() => !avatarUploading && avatarInputRef.current?.click()}
									>
										<img
											src={user?.avatar ? `${REACT_APP_API_URL}/uploads/${user.avatar}` : '/img/profile/defaultUser.svg'}
											alt="avatar"
										/>
										<Box className="avatar-overlay">
											{avatarUploading
												? <CircularProgress size={22} sx={{ color: '#fff' }} />
												: <CameraAltIcon />}
										</Box>
									</Box>
									<p className="avatar-hint">{ui('mypage.clickToChangePhoto')}</p>
								</Box>

								<Box component="form" onSubmit={handleUpdateProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
									<div className="form-grid">
										<TextField label={ui('auth.firstName')} value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
										<TextField label={ui('auth.lastName')} value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
									</div>
									<TextField label={ui('mypage.bio')} value={bio} onChange={(e) => setBio(e.target.value)} fullWidth multiline rows={3} />
									<TextField label={ui('mypage.nationality')} value={nationality} onChange={(e) => setNationality(e.target.value)} fullWidth />
									<Button type="submit" variant="contained">{ui('mypage.saveChanges')}</Button>
								</Box>
							</Box>
						)}

						{tab === 1 && (
							<Box>
								<div className="content-head"><span>{ui('mypage.applicationCenter')}</span><h2>{ui('mypage.myApplications')}</h2></div>
								{applications.length ? applications.map((app: any) => (
									<ApplicationRow key={app._id} app={app} onOpen={() => router.push(`/service/detail?id=${app.service}`)} />
								)) : <Box className="empty-state">{ui('mypage.noApplicationsYet')}</Box>}
							</Box>
						)}

						{tab === 2 && (
							<Box>
								<div className="content-head"><span>{ui('mypage.savedAgencies')}</span><h2>{ui('mypage.followingAgencies')}</h2></div>
								{followings.length ? followings.map((follow: any) => (
									<FollowingAgencyRow key={follow._id} follow={follow} onOpen={() => router.push(`/agency/${follow.agency}`)} />
								)) : <Box className="empty-state">{ui('mypage.notFollowingAnyAgenciesYet')}</Box>}
							</Box>
						)}

						{tab === 3 && (
							<Box className="chat-panel">
								{!activeConversation ? (
									<>
										<div className="content-head"><span>{ui('mypage.conversations')}</span><h2>{ui('mypage.messages')}</h2></div>
										{conversations.length ? conversations.map((conv: any) => (
											<Box
												key={conv._id}
												className={`list-row clickable ${conv.unreadCount > 0 ? 'unread' : ''}`}
												onClick={() => openConversation(conv)}
											>
												<Box className="chat-preview-avatar">
													<ChatIcon />
												</Box>
												<div className="chat-preview-text">
													<strong>{ui('mypage.conversationWithAgency')}</strong>
													<span>{conv.lastMessage || ui('mypage.noMessagesYet')}</span>
												</div>
												{conv.unreadCount > 0 && (
													<Chip label={conv.unreadCount} color="primary" size="small" />
												)}
											</Box>
										)) : <Box className="empty-state">{ui('mypage.noConversationsYetMessageAn')}</Box>}
									</>
								) : (
									<Box className="chat-window">
										<Box className="chat-header">
											<IconButton size="small" onClick={() => setActiveConversation(null)}>
												<ArrowBackIcon />
											</IconButton>
											<strong>{ui('mypage.conversation')}</strong>
										</Box>

										<Box className="chat-messages">
											{msgLoading ? (
												<Box className="chat-loading"><CircularProgress size={28} /></Box>
											) : messages.length === 0 ? (
												<Box className="empty-state">{ui('No messages yet. Say hello!')}</Box>
											) : (
												messages.map((msg: any) => {
													const isMine = msg.sender === user?._id;
													return (
														<Box key={msg._id} className={`chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
															<Box className={`chat-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
																<p>{msg.text}</p>
																<span className="bubble-time">
																	{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
																</span>
															</Box>
														</Box>
													);
												})
											)}
											<div ref={messagesEndRef} />
										</Box>

										<Box component="form" className="chat-input-row" onSubmit={handleSendMessage}>
											<TextField
												fullWidth
												size="small"
												placeholder={ui('mypage.typeAMessage')}
												value={messageText}
												onChange={(e) => setMessageText(e.target.value)}
												onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any); } }}
											/>
											<IconButton type="submit" color="primary" disabled={!messageText.trim() || sending}>
												{sending ? <CircularProgress size={20} /> : <SendIcon />}
											</IconButton>
										</Box>
									</Box>
								)}
							</Box>
						)}
						{tab === 4 && isAgencyAdmin && (
							<Box>
								<div className="content-head"><span>{ui('mypage.agencyManagement')}</span><h2>{ui('My Agency')}</h2></div>

								{myAgency ? (
									<Box>
										{/* ── Cover image ───────────────────────── */}
										<Box className="agency-cover-upload">
											<input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleCoverChange} />
											<Box
												className="agency-cover-banner"
												style={{ backgroundImage: (localCover || myAgency.coverImage) ? `url(${REACT_APP_API_URL}/uploads/${localCover || myAgency.coverImage})` : undefined }}
											>
												{!(localCover || myAgency.coverImage) && (
													<Box className="cover-empty-hint">
														<CameraAltIcon />
														<span>{ui('mypage.noCoverPhoto')}</span>
													</Box>
												)}
												<Button
													className="cover-upload-btn"
													variant="contained"
													size="small"
													startIcon={coverUploading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <CameraAltIcon />}
													onClick={() => !coverUploading && coverInputRef.current?.click()}
													disabled={coverUploading}
												>
													{coverUploading ? ui('mypage.uploading') : (localCover || myAgency.coverImage) ? ui('mypage.changeCoverPhoto') : ui('mypage.addCoverPhoto')}
												</Button>
											</Box>
										</Box>

										{/* ── Logo + basic info ─────────────────── */}
										<Box className="agency-identity-row">
											<Box className="agency-card-logo" onClick={() => !logoUploading && logoInputRef.current?.click()} sx={{ cursor: 'pointer' }} title={ui('mypage.clickToChangeLogo')}>
												<input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleLogoChange} />
												{(localLogo || myAgency.logo) ? <img src={`${REACT_APP_API_URL}/uploads/${localLogo || myAgency.logo}`} alt="logo" /> : <BusinessIcon />}
												<Box className="avatar-overlay">
													{logoUploading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CameraAltIcon fontSize="small" />}
												</Box>
											</Box>
											<Box sx={{ flex: 1 }}>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
													<h3 style={{ margin: 0 }}>{tr(myAgency.name)}</h3>
													<Chip size="small" label={myAgency.verificationStatus} icon={myAgency.verificationStatus === 'VERIFIED' ? <CheckCircleIcon /> : <HourglassEmptyIcon />} color={myAgency.verificationStatus === 'VERIFIED' ? 'success' : myAgency.verificationStatus === 'PENDING' ? 'warning' : 'error'} />
												</Box>
												<p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{myAgency.email}</p>
												<Box className="agency-stats-row" sx={{ mt: 1.5 }}>
													<div><strong>{myAgency.totalServices ?? 0}</strong><span>{ui('agency.services')}</span></div>
													<div><strong>{myAgency.totalReviews ?? 0}</strong><span>{ui('agency.reviews')}</span></div>
													<div><strong>{(myAgency.averageRating ?? 0).toFixed(1)}</strong><span>{ui('mypage.rating')}</span></div>
													<div><strong>{myAgency.viewCount ?? 0}</strong><span>{ui('agency.views')}</span></div>
												</Box>
											</Box>
										</Box>

										{myAgency.verificationStatus === 'PENDING' && (
											<Alert severity="info" sx={{ mt: 2 }}>{ui('mypage.yourAgencyIsPendingAdmin')}</Alert>
										)}

										{/* ── Agency info editing ───────────────── */}
										<Box sx={{ mt: 2, borderTop: '1px solid #e2e8f0', pt: 2 }}>
											<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
												<strong style={{ fontSize: 15 }}>{ui('mypage.agencyInformation')}</strong>
												{!editInfoMode && (
													<Button size="small" startIcon={<EditIcon />} onClick={() => openInfoEdit(myAgency)}>{ui('Edit')}</Button>
												)}
											</Box>

											{editInfoMode ? (
												<Box component="form" className="profile-form" onSubmit={handleSaveAgencyInfo}>
													<TextField label={ui('mypage.agencyName')} value={editAgencyName} onChange={(e) => setEditAgencyName(e.target.value)} fullWidth required />
													<TextField label={ui('mypage.description')} value={editAgencyDesc} onChange={(e) => setEditAgencyDesc(e.target.value)} fullWidth multiline rows={3} />
													<div className="form-grid">
														<TextField label={ui('auth.phoneNumber')} value={editAgencyPhone} onChange={(e) => setEditAgencyPhone(e.target.value)} fullWidth />
														<TextField label={ui('mypage.website')} value={editAgencyWebsite} onChange={(e) => setEditAgencyWebsite(e.target.value)} fullWidth />
													</div>
													<TextField
														label={ui('agency.operatingCountries')}
														value={editAgencyCountries}
														onChange={(e) => setEditAgencyCountries(e.target.value)}
														fullWidth
														required
														helperText={ui('mypage.commaSeparatedUzbekistanTurkeyUae')}
													/>
													<Box sx={{ display: 'flex', gap: 1 }}>
														<Button type="submit" variant="contained" disabled={infoSaving}>{infoSaving ? ui('mypage.saving') : ui('mypage.saveChanges')}</Button>
														<Button variant="text" onClick={() => setEditInfoMode(false)}>{ui('agency.cancel')}</Button>
													</Box>
												</Box>
											) : (
												<Box className="agency-info-display">
													{myAgency.description && <p>{tr(myAgency.description)}</p>}
													{myAgency.phoneNumber && <Box className="info-row"><strong>{ui('help.phone')}:</strong> {myAgency.phoneNumber}</Box>}
													{myAgency.website && <Box className="info-row"><strong>{ui('mypage.website')}:</strong> <a href={myAgency.website} target="_blank" rel="noopener noreferrer">{myAgency.website}</a></Box>}
													{myAgency.operatingCountries?.length > 0 && (
														<Box className="info-row"><strong>{ui('mypage.countries')}:</strong> {myAgency.operatingCountries.join(', ')}</Box>
													)}
													{!myAgency.description && !myAgency.phoneNumber && !myAgency.website && (
														<Box className="empty-state" sx={{ py: 1.5 }}>{ui('mypage.noInfoAddedYetClick')}</Box>
													)}
												</Box>
											)}
										</Box>

										{/* ── Location editing ──────────────────── */}
										<Box sx={{ mt: 2, borderTop: '1px solid #e2e8f0', pt: 2 }}>
											<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
												<strong style={{ fontSize: 15 }}>{ui('mypage.location')}</strong>
												{!editingLocation && (
													<Button size="small" startIcon={<EditIcon />} onClick={() => handleEditLocation(myAgency)}>
														{myAgency.latitude && myAgency.longitude ? ui('Edit') : ui('mypage.addToMap')}
													</Button>
												)}
											</Box>
											{myAgency.city || myAgency.country || myAgency.address ? (
												<Box className="agency-info-display">
													{myAgency.address && <Box className="info-row"><strong>{ui('mypage.address')}:</strong> {myAgency.address}</Box>}
													{(myAgency.city || myAgency.country) && <Box className="info-row"><strong>{ui('mypage.cityCountry')}:</strong> {[myAgency.city, myAgency.country].filter(Boolean).join(', ')}</Box>}
												</Box>
											) : !editingLocation ? (
												<Box className="empty-state" sx={{ py: 1.5 }}>{ui('mypage.noLocationSetClickAdd')}</Box>
											) : null}
											{editingLocation && (
												<Box component="form" className="profile-form" onSubmit={handleSaveLocation}>
													<div className="form-grid">
														<TextField label={ui('mypage.city')} value={editCity} onChange={(e) => setEditCity(e.target.value)} fullWidth />
														<TextField label={ui('mypage.countryHq')} value={editHqCountry} onChange={(e) => setEditHqCountry(e.target.value)} fullWidth />
													</div>
													<TextField label={ui('mypage.address')} value={editAddress} onChange={(e) => setEditAddress(e.target.value)} fullWidth />
													<div className="form-grid">
														<TextField label={ui('mypage.latitude')} type="number" value={editLat} onChange={(e) => setEditLat(e.target.value)} fullWidth helperText="e.g. 41.2995" inputProps={{ step: 'any' }} />
														<TextField label={ui('mypage.longitude')} type="number" value={editLng} onChange={(e) => setEditLng(e.target.value)} fullWidth helperText="e.g. 69.2401" inputProps={{ step: 'any' }} />
													</div>
													<Box sx={{ display: 'flex', gap: 1 }}>
														<Button type="submit" variant="contained" disabled={locationSaving}>{locationSaving ? ui('mypage.saving') : ui('mypage.saveLocation')}</Button>
														<Button variant="text" onClick={() => setEditingLocation(false)}>{ui('agency.cancel')}</Button>
													</Box>
												</Box>
											)}
										</Box>

										{/* ── Actions ───────────────────────────── */}
										<Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', pt: 2 }}>
											<Button variant="outlined" onClick={() => router.push(`/agency/${myAgency._id}`)}>{ui('mypage.viewPublicProfile')}</Button>
											<Button variant="outlined" onClick={() => setTab(3)} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{ui('mypage.messages')}</Button>
										</Box>
									</Box>
								) : (
									<Box component="form" className="profile-form" onSubmit={handleCreateAgency}>
										<p className="form-hint">{ui('mypage.registerYourAgencyOnGmp')}</p>
										{agencyError && <Alert severity="error" sx={{ mb: 2 }}>{agencyError}</Alert>}

										{/* Cover + logo upload */}
										<Box sx={{ mb: 1 }}>
											<input ref={newCoverInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => handleNewAgencyImage(e, 'cover')} />
											<input ref={newLogoInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => handleNewAgencyImage(e, 'logo')} />
											<Box
												onClick={() => newImgUploading === null && newCoverInputRef.current?.click()}
												sx={{
													position: 'relative', height: 150, borderRadius: 2, cursor: 'pointer',
													border: '2px dashed #c7d2fe', overflow: 'hidden',
													display: 'flex', alignItems: 'center', justifyContent: 'center',
													backgroundImage: newCover ? `url(${REACT_APP_API_URL}/uploads/${newCover})` : undefined,
													backgroundSize: 'cover', backgroundPosition: 'center',
													color: '#64748b', fontSize: 13, fontWeight: 600,
												}}
											>
												{newImgUploading === 'cover'
													? <CircularProgress size={22} />
													: !newCover && <span><CameraAltIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> {ui('mypage.addCoverPhoto')}</span>}
											</Box>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: -3.5, ml: 2, position: 'relative', zIndex: 1 }}>
												<Box
													onClick={() => newImgUploading === null && newLogoInputRef.current?.click()}
													sx={{
														width: 64, height: 64, borderRadius: '50%', cursor: 'pointer',
														border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
														background: '#eef3ff', overflow: 'hidden',
														display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1649ff',
													}}
												>
													{newImgUploading === 'logo'
														? <CircularProgress size={18} />
														: newLogo
														? <img src={`${REACT_APP_API_URL}/uploads/${newLogo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
														: <BusinessIcon />}
												</Box>
												<span style={{ fontSize: 12, color: '#64748b', marginTop: 18 }}>
													{newLogo ? ui('mypage.logoAddedClickToChange') : ui('mypage.clickCircleToAddLogo')}
												</span>
											</Box>
										</Box>

										<TextField label={ui('mypage.agencyName')} value={agencyName} onChange={(e) => setAgencyName(e.target.value)} fullWidth required />
										<TextField label={ui('mypage.businessEmail')} type="email" value={agencyEmail} onChange={(e) => setAgencyEmail(e.target.value)} fullWidth required />
										<TextField label={ui('mypage.description')} value={agencyDesc} onChange={(e) => setAgencyDesc(e.target.value)} fullWidth multiline rows={3} />
										<div className="form-grid">
											<TextField label={ui('auth.phoneNumber')} value={agencyPhone} onChange={(e) => setAgencyPhone(e.target.value)} fullWidth />
											<TextField label={ui('mypage.website')} value={agencyWebsite} onChange={(e) => setAgencyWebsite(e.target.value)} fullWidth />
										</div>
										<TextField label={ui('agency.operatingCountries')} value={agencyCountries} onChange={(e) => setAgencyCountries(e.target.value)} fullWidth required helperText={ui('mypage.commaSeparatedUzbekistanTurkeyUae')} />
										<div className="form-grid">
											<TextField label={ui('mypage.city')} value={agencyCity} onChange={(e) => setAgencyCity(e.target.value)} fullWidth />
											<TextField label={ui('mypage.countryHq')} value={agencyHqCountry} onChange={(e) => setAgencyHqCountry(e.target.value)} fullWidth />
										</div>
										<TextField label={ui('mypage.address')} value={agencyAddress} onChange={(e) => setAgencyAddress(e.target.value)} fullWidth />
										<div className="form-grid">
											<TextField label={ui('mypage.latitude')} type="number" value={agencyLat} onChange={(e) => setAgencyLat(e.target.value)} fullWidth helperText="e.g. 41.2995 (for map)" inputProps={{ step: 'any' }} />
											<TextField label={ui('mypage.longitude')} type="number" value={agencyLng} onChange={(e) => setAgencyLng(e.target.value)} fullWidth helperText="e.g. 69.2401 (for map)" inputProps={{ step: 'any' }} />
										</div>
										<Button type="submit" variant="contained" disabled={agencyCreating}>{agencyCreating ? ui('mypage.submitting') : ui('mypage.registerAgency')}</Button>
									</Box>
								)}
							</Box>
						)}
					{/* Tab 5: Agency Services Management */}
						{tab === 5 && isAgencyAdmin && (
							<Box>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
									<div className="content-head" style={{ marginBottom: 0 }}>
										<span>{ui('mypage.serviceCatalog')}</span>
										<h2>{ui('mypage.myServices')}</h2>
									</div>
									{myAgency && isAgencyVerified && (
										<Button variant="contained" startIcon={<AddIcon />} onClick={() => openServiceForm()}>
											{ui('mypage.newService')}
										</Button>
									)}
								</Box>
								{!myAgency ? (
									<Alert severity="warning">{ui('mypage.pleaseRegisterYourAgencyFirst')}</Alert>
								) : !isAgencyVerified ? (
									<Alert severity="info">{ui('mypage.yourAgencyMustBeApproved')}</Alert>
								) : agencyServices.length === 0 ? (
									<Box className="empty-state">{ui('mypage.noServicesYetCreateYour')}</Box>
								) : agencyServices.map((svc: any) => (
									<Box key={svc._id} className="list-row">
										<div style={{ flex: 1 }}>
											<strong>{svc.name?.en || svc.name?.uz || ui('mypage.service')}</strong>
											<span style={{ display: 'block', fontSize: 12, color: '#888' }}>
												{svc.serviceType} · {svc.destinationCountry}{svc.price != null ? ` · $${svc.price}` : ''}
											</span>
										</div>
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<Chip label={svc.status} size="small" color={svc.status === 'ACTIVE' ? 'success' : svc.status === 'DRAFT' ? 'warning' : 'default'} />
											<IconButton size="small" onClick={() => openServiceForm(svc)}><EditIcon fontSize="small" /></IconButton>
											<IconButton size="small" color="error" onClick={() => handleDeleteService(svc._id, svc.name?.en || svc.name?.uz || 'service')}><DeleteIcon fontSize="small" /></IconButton>
										</Box>
									</Box>
								))}
								<Dialog open={showServiceForm} onClose={() => setShowServiceForm(false)} maxWidth="sm" fullWidth>
									<DialogTitle>{editingService ? ui('mypage.editService') : ui('mypage.createNewService')}</DialogTitle>
									<Box component="form" onSubmit={handleSaveService}>
										<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
											<TextField label={ui('mypage.serviceName')} value={svcName} onChange={(e) => setSvcName(e.target.value)} fullWidth required />
											<TextField label={ui('mypage.description')} value={svcDesc} onChange={(e) => setSvcDesc(e.target.value)} fullWidth multiline rows={3} />
											{!editingService && (
												<>
													<FormControl fullWidth required>
														<InputLabel>{ui('mypage.serviceType')}</InputLabel>
														<Select value={svcType} label={ui('mypage.serviceType')} onChange={(e) => setSvcType(e.target.value)}>
															<MenuItem value={ServiceType.VISA_SERVICES}>{ui('mypage.visaServices')}</MenuItem>
															<MenuItem value={ServiceType.STUDY_ABROAD}>{ui('mypage.studyAbroad')}</MenuItem>
															<MenuItem value={ServiceType.WORK_ABROAD}>{ui('mypage.workAbroad')}</MenuItem>
															<MenuItem value={ServiceType.TRAVEL}>{ui('mypage.travel')}</MenuItem>
														</Select>
													</FormControl>
													<TextField label={ui('mypage.destinationCountry')} value={svcDest} onChange={(e) => setSvcDest(e.target.value)} fullWidth required helperText="e.g. United States" />
													<TextField label={ui('mypage.sourceCountries')} value={svcSources} onChange={(e) => setSvcSources(e.target.value)} fullWidth helperText={ui('mypage.commaSeparatedUzbekistanTurkey')} />
												</>
											)}
											<div className="form-grid">
												<TextField label={ui('mypage.priceUsd')} type="number" value={svcPrice} onChange={(e) => setSvcPrice(e.target.value)} fullWidth inputProps={{ min: 0, step: 'any' }} />
												<TextField label={ui('mypage.processingTime')} value={svcProcessing} onChange={(e) => setSvcProcessing(e.target.value)} fullWidth placeholder="e.g. 2-4 weeks" />
											</div>
										</DialogContent>
										<DialogActions sx={{ px: 3, pb: 2 }}>
											<Button onClick={() => setShowServiceForm(false)}>{ui('agency.cancel')}</Button>
											<Button type="submit" variant="contained" disabled={svcSaving}>
												{svcSaving ? ui('mypage.saving') : editingService ? ui('Update') : ui('Create')}
											</Button>
										</DialogActions>
									</Box>
								</Dialog>
							</Box>
						)}

						{/* Tab 6: Applications Received */}
						{tab === 6 && isAgencyAdmin && (
							<Box>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
									<div className="content-head" style={{ marginBottom: 0 }}>
										<span>{ui('mypage.incomingRequests')}</span>
										<h2>{ui('Applications Received')}</h2>
									</div>
									<FormControl size="small" sx={{ minWidth: 160 }}>
										<InputLabel>{ui('mypage.status')}</InputLabel>
										<Select value={appStatusFilter} label={ui('mypage.status')} onChange={(e) => setAppStatusFilter(e.target.value)}>
											<MenuItem value="">{ui('All')}</MenuItem>
											<MenuItem value="SUBMITTED">{ui('mypage.submitted')}</MenuItem>
											<MenuItem value="UNDER_REVIEW">{ui('mypage.underReview')}</MenuItem>
											<MenuItem value="APPROVED">{ui('mypage.approved')}</MenuItem>
											<MenuItem value="REJECTED">{ui('mypage.rejected')}</MenuItem>
											<MenuItem value="COMPLETED">{ui('mypage.completed')}</MenuItem>
										</Select>
									</FormControl>
								</Box>
								{agencyApplications.length === 0 ? (
									<Box className="empty-state">{ui('mypage.noApplicationsReceivedYet')}</Box>
								) : agencyApplications.filter((a: any) => !appStatusFilter || a.status === appStatusFilter).map((app: any) => (
									<Box key={app._id} className="list-row">
										<div style={{ flex: 1 }}>
											<strong>{ui('mypage.application')} #{app._id.slice(-6)}</strong>
											<span style={{ display: 'block', fontSize: 12, color: '#888' }}>{ui('mypage.applied')}: {new Date(app.appliedAt).toLocaleDateString()}</span>
											{app.notes && <span style={{ display: 'block', fontSize: 12, color: '#666' }}>{app.notes}</span>}
										</div>
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
											<Chip label={app.status} size="small" sx={{ bgcolor: applicationStatusColors[app.status] || '#9e9e9e', color: '#fff', fontWeight: 700 }} />
											{app.status === 'SUBMITTED' && (
												<Button size="small" variant="outlined" onClick={() => handleUpdateAppStatus(app._id, 'UNDER_REVIEW')}>{ui('Review')}</Button>
											)}
											{app.status === 'UNDER_REVIEW' && (
												<>
													<Button size="small" variant="outlined" color="success" onClick={() => handleUpdateAppStatus(app._id, 'APPROVED')}>{ui('mypage.approve')}</Button>
													<Button size="small" variant="outlined" color="error" onClick={() => handleUpdateAppStatus(app._id, 'REJECTED')}>{ui('mypage.reject')}</Button>
												</>
											)}
											{app.status === 'APPROVED' && (
												<Button size="small" variant="outlined" color="primary" onClick={() => handleUpdateAppStatus(app._id, 'COMPLETED')}>{ui('mypage.complete')}</Button>
											)}
										</Box>
									</Box>
								))}
							</Box>
						)}
					</Box>
				</Box>
			</Stack>
		</div>
	);
};

export default withLayoutBasic(MyPage);

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
