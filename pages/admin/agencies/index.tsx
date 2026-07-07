import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
	Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button,
	Pagination, TextField, Select, MenuItem, InputAdornment, Dialog, DialogTitle,
	DialogContent, DialogActions, Divider, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useQuery, useMutation } from '@apollo/client';
import { ADMIN_AGENCIES } from '../../../apollo/admin/query';
import { APPROVE_AGENCY, REJECT_AGENCY, SUSPEND_AGENCY, ACTIVATE_AGENCY, ADMIN_DELETE_AGENCY } from '../../../apollo/admin/mutation';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import { sweetConfirmAlert, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { REACT_APP_API_URL } from '../../../libs/config';
import { useLang } from '../../../libs/utils/lang';
import { useDebounce } from '../../../libs/hooks/useDebounce';
import { useUiLang } from '../../../libs/utils/translations';

const LIMIT = 10;

const AdminAgencies: NextPage = () => {
	const tr = useLang();
	const ui = useUiLang();
	const [page, setPage] = useState(1);
	const [text, setText] = useState('');
	const [status, setStatus] = useState('');
	const [verificationStatus, setVerificationStatus] = useState('');

	const debouncedText = useDebounce(text, 350);

	const [rejectTarget, setRejectTarget] = useState<string | null>(null);
	const [rejectReason, setRejectReason] = useState('');
	const [detailAgency, setDetailAgency] = useState<any | null>(null);

	const buildInput = () => ({
		text: debouncedText || undefined,
		status: status || undefined,
		verificationStatus: verificationStatus || undefined,
	});

	const { data, refetch } = useQuery(ADMIN_AGENCIES, {
		variables: { page, limit: LIMIT, filter: buildInput() },
		fetchPolicy: 'network-only',
	});

	useEffect(() => {
		setPage(1);
	}, [debouncedText, status, verificationStatus]);

	const [approveAgency] = useMutation(APPROVE_AGENCY);
	const [rejectAgency] = useMutation(REJECT_AGENCY);
	const [suspendAgency] = useMutation(SUSPEND_AGENCY);
	const [activateAgency] = useMutation(ACTIVATE_AGENCY);
	const [deleteAgency] = useMutation(ADMIN_DELETE_AGENCY);

	const agencies: any[] = data?.adminAgencies?.list ?? [];
	const total: number = data?.adminAgencies?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / LIMIT));

	const handleApprove = async (agencyId: string) => {
		const ok = await sweetConfirmAlert(ui('admin.approveThisAgency'));
		if (!ok) return;
		await approveAgency({ variables: { input: { agencyId } } });
		await sweetMixinSuccessAlert(ui('admin.agencyApproved'));
		setDetailAgency(null);
		refetch();
	};

	const openRejectModal = (agencyId: string) => {
		setRejectTarget(agencyId);
		setRejectReason('');
		setDetailAgency(null);
	};

	const handleRejectConfirm = async () => {
		if (!rejectTarget) return;
		await rejectAgency({ variables: { input: { agencyId: rejectTarget, reason: rejectReason || 'Does not meet requirements' } } });
		await sweetMixinSuccessAlert(ui('admin.agencyRejected'));
		setRejectTarget(null);
		refetch();
	};

	const handleSuspend = async (agencyId: string) => {
		const ok = await sweetConfirmAlert(ui('admin.suspendThisAgencyUsersWill'));
		if (!ok) return;
		await suspendAgency({ variables: { input: { agencyId } } });
		await sweetMixinSuccessAlert(ui('admin.agencySuspended'));
		setDetailAgency(null);
		refetch();
	};

	const handleActivate = async (agencyId: string) => {
		const ok = await sweetConfirmAlert(ui('admin.activateThisAgency'));
		if (!ok) return;
		await activateAgency({ variables: { agencyId } });
		await sweetMixinSuccessAlert(ui('admin.agencyActivated'));
		setDetailAgency(null);
		refetch();
	};

	const handleDelete = async (agencyId: string, name: string) => {
		const ok = await sweetConfirmAlert(`${ui('admin.permanentlyDelete')} "${name}"? ${ui('admin.thisCannotBeUndone')}`);
		if (!ok) return;
		await deleteAgency({ variables: { agencyId } });
		await sweetMixinSuccessAlert(ui('admin.agencyDeleted'));
		setDetailAgency(null);
		refetch();
	};

	const statusColor: any = { ACTIVE: 'success', SUSPENDED: 'error', INACTIVE: 'default' };
	const verifColor: any = { VERIFIED: 'success', PENDING: 'warning', REJECTED: 'error' };

	return (
		<div>
			<div className="page-title">{ui('admin.agenciesManagement')}</div>

			<Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
				<TextField
					size="small"
					placeholder={ui('admin.searchByNameEmail')}
					value={text}
					onChange={(e) => setText(e.target.value)}
					sx={{ minWidth: 240 }}
					InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
				/>
				<Select size="small" value={status} onChange={(e) => setStatus(e.target.value)} displayEmpty sx={{ minWidth: 130 }}>
					<MenuItem value="">{ui('admin.allStatuses')}</MenuItem>
					<MenuItem value="ACTIVE">{ui('admin.active')}</MenuItem>
					<MenuItem value="SUSPENDED">{ui('admin.suspended')}</MenuItem>
					<MenuItem value="INACTIVE">{ui('admin.inactive')}</MenuItem>
				</Select>
				<Select size="small" value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)} displayEmpty sx={{ minWidth: 145 }}>
					<MenuItem value="">{ui('admin.allVerifications')}</MenuItem>
					<MenuItem value="PENDING">{ui('admin.pending')}</MenuItem>
					<MenuItem value="VERIFIED">{ui('admin.verified')}</MenuItem>
					<MenuItem value="REJECTED">{ui('mypage.rejected')}</MenuItem>
				</Select>
				<Box sx={{ ml: 'auto', color: '#888', fontSize: 13 }}>{ui('admin.total')}: <b>{total}</b></Box>
			</Box>

			<TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: '#f5f7fa' }}>
							<TableCell><b>{ui('auth.agency')}</b></TableCell>
							<TableCell><b>{ui('help.email')}</b></TableCell>
							<TableCell><b>{ui('agency.services')}</b></TableCell>
							<TableCell><b>{ui('mypage.rating')}</b></TableCell>
							<TableCell><b>{ui('mypage.status')}</b></TableCell>
							<TableCell><b>{ui('admin.verification')}</b></TableCell>
							<TableCell><b>{ui('admin.created')}</b></TableCell>
							<TableCell><b>{ui('admin.actions')}</b></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{agencies.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: '#aaa' }}>{ui('agency.noAgenciesFound')}</TableCell>
							</TableRow>
						) : agencies.map((agency: any) => (
							<TableRow key={agency._id} hover>
								<TableCell sx={{ fontWeight: 600, maxWidth: 160 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										{tr(agency.name)}
										<InfoOutlinedIcon
											fontSize="small"
											sx={{ color: '#aaa', cursor: 'pointer', '&:hover': { color: '#1649ff' } }}
											onClick={() => setDetailAgency(agency)}
										/>
									</Box>
								</TableCell>
								<TableCell sx={{ fontSize: 13 }}>{agency.email}</TableCell>
								<TableCell sx={{ textAlign: 'center' }}>{agency.totalServices ?? 0}</TableCell>
								<TableCell sx={{ textAlign: 'center' }}>{(agency.averageRating ?? 0).toFixed(1)}</TableCell>
								<TableCell>
									<Chip label={ui(agency.status)} size="small" color={statusColor[agency.status] ?? 'default'} />
								</TableCell>
								<TableCell>
									<Chip label={ui(agency.verificationStatus)} size="small" color={verifColor[agency.verificationStatus] ?? 'default'} />
								</TableCell>
								<TableCell sx={{ fontSize: 12, color: '#888' }}>
									{new Date(agency.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
										{agency.verificationStatus === 'PENDING' && (
											<>
												<Button size="small" variant="outlined" color="success" onClick={() => handleApprove(agency._id)}>{ui('mypage.approve')}</Button>
												<Button size="small" variant="outlined" color="error" onClick={() => openRejectModal(agency._id)}>{ui('mypage.reject')}</Button>
											</>
										)}
										{agency.status === 'SUSPENDED' ? (
											<Button size="small" variant="outlined" color="success" onClick={() => handleActivate(agency._id)}>{ui('admin.activate')}</Button>
										) : (
											<Button size="small" variant="outlined" color="warning" onClick={() => handleSuspend(agency._id)}>{ui('admin.suspend')}</Button>
										)}
										<Button size="small" variant="outlined" color="error" onClick={() => handleDelete(agency._id, tr(agency.name))}>{ui('admin.delete')}</Button>
									</Box>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" />
			</Box>

			{/* Agency detail modal */}
			<Dialog open={!!detailAgency} onClose={() => setDetailAgency(null)} maxWidth="sm" fullWidth>
				{detailAgency && (
					<>
					<DialogTitle sx={{ fontWeight: 700, pb: 0 }}>{tr(detailAgency.name)}</DialogTitle>
					<DialogContent>
						{detailAgency.logo && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 1 }}>
								<img
									src={`${REACT_APP_API_URL}/uploads/${detailAgency.logo}`}
									alt="logo"
									style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '1px solid #e8ecf4', flexShrink: 0 }}
								/>
							</Box>
						)}
						<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
							<Chip label={ui(detailAgency.status)} size="small" color={statusColor[detailAgency.status] ?? 'default'} />
							<Chip label={ui(detailAgency.verificationStatus)} size="small" color={verifColor[detailAgency.verificationStatus] ?? 'default'} />
						</Box>
						{tr(detailAgency.description) && (
							<Box sx={{ mb: 2, p: '10px 14px', background: '#f7f9fc', borderRadius: 2 }}>
								<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{ui('mypage.description')}</Typography>
								<Typography variant="body2">{tr(detailAgency.description)}</Typography>
							</Box>
						)}
						<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
							<Box><Typography variant="caption" color="text.secondary">{ui('help.email')}</Typography><Typography variant="body2">{detailAgency.email || '—'}</Typography></Box>
							<Box><Typography variant="caption" color="text.secondary">{ui('help.phone')}</Typography><Typography variant="body2">{detailAgency.phoneNumber || '—'}</Typography></Box>
							<Box><Typography variant="caption" color="text.secondary">{ui('mypage.website')}</Typography><Typography variant="body2">{detailAgency.website || '—'}</Typography></Box>
							<Box><Typography variant="caption" color="text.secondary">{ui('mypage.location')}</Typography><Typography variant="body2">{[detailAgency.city, detailAgency.country].filter(Boolean).join(', ') || '—'}</Typography></Box>
							<Box><Typography variant="caption" color="text.secondary">{ui('admin.servicesReviews')}</Typography><Typography variant="body2">{detailAgency.totalServices ?? 0} {ui('admin.services')} · {detailAgency.totalReviews ?? 0} {ui('agency.reviews2')}</Typography></Box>
							<Box><Typography variant="caption" color="text.secondary">{ui('mypage.rating')}</Typography><Typography variant="body2">{(detailAgency.averageRating ?? 0).toFixed(1)} ★</Typography></Box>
							<Box><Typography variant="caption" color="text.secondary">{ui('admin.registered')}</Typography><Typography variant="body2">{new Date(detailAgency.createdAt).toLocaleDateString()}</Typography></Box>
						</Box>
						{detailAgency.operatingCountries?.length > 0 && (
							<Box sx={{ mb: 2 }}>
								<Typography variant="caption" color="text.secondary">{ui('admin.operatingCountries')}</Typography>
								<Typography variant="body2">{detailAgency.operatingCountries.join(', ')}</Typography>
							</Box>
						)}
						<Divider sx={{ mb: 1.5 }} />
						<Typography variant="caption" color="text.secondary">ID: </Typography>
						<Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{detailAgency._id}</Typography>
					</DialogContent>
						<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
							{detailAgency.verificationStatus === 'PENDING' && (
								<>
									<Button color="success" variant="contained" size="small" onClick={() => handleApprove(detailAgency._id)}>{ui('mypage.approve')}</Button>
									<Button color="error" variant="outlined" size="small" onClick={() => openRejectModal(detailAgency._id)}>{ui('mypage.reject')}</Button>
								</>
							)}
							{detailAgency.status === 'SUSPENDED' ? (
								<Button color="success" variant="outlined" size="small" onClick={() => handleActivate(detailAgency._id)}>{ui('admin.activate')}</Button>
							) : (
								<Button color="warning" variant="outlined" size="small" onClick={() => handleSuspend(detailAgency._id)}>{ui('admin.suspend')}</Button>
							)}
							<Button onClick={() => setDetailAgency(null)}>{ui('admin.close')}</Button>
						</DialogActions>
					</>
				)}
			</Dialog>

			{/* Reject reason modal */}
			<Dialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} maxWidth="sm" fullWidth>
				<DialogTitle>{ui('admin.rejectAgency')}</DialogTitle>
				<DialogContent>
					<TextField
						fullWidth multiline rows={3}
						label={ui('admin.rejectionReason')}
						placeholder={ui('admin.explainWhyThisAgencyIs')}
						value={rejectReason}
						onChange={(e) => setRejectReason(e.target.value)}
						sx={{ mt: 1 }}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setRejectTarget(null)}>{ui('agency.cancel')}</Button>
					<Button variant="contained" color="error" onClick={handleRejectConfirm}>{ui('admin.rejectAgency')}</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default withLayoutAdmin(AdminAgencies);

export { i18nStaticProps as getStaticProps } from '../../../libs/i18n';
