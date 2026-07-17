import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
	Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Paper, Chip, Button, TextField, Select, MenuItem, InputAdornment,
	Dialog, DialogTitle, DialogContent, DialogActions, Typography, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useQuery, useMutation } from '@apollo/client';
import { ADMIN_SERVICES } from '../../../apollo/admin/query';
import { ADMIN_DELETE_SERVICE, ADMIN_UPDATE_SERVICE_STATUS } from '../../../apollo/admin/mutation';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import AppPagination from '../../../libs/components/common/AppPagination';
import { sweetConfirmAlert, sweetMixinSuccessAlert, sweetMixinErrorAlert } from '../../../libs/sweetAlert';
import { useLang } from '../../../libs/utils/lang';
import { useDebounce } from '../../../libs/hooks/useDebounce';
import { SortDirection } from '../../../libs/enums/common.enum';
import { useUiLang } from '../../../libs/utils/translations';

const LIMIT = 10;

const statusColor: any = { ACTIVE: 'success', DRAFT: 'warning', ARCHIVED: 'default', SUSPENDED: 'error' };
const visibilityColor: any = { PUBLIC: 'success', AGENCY_ONLY: 'warning', ARCHIVED: 'default' };

const AdminServices: NextPage = () => {
	const tr = useLang();
	const ui = useUiLang();
	const [page, setPage] = useState(1);
	const [text, setText] = useState('');
	const [serviceType, setServiceType] = useState('');
	const [status, setStatus] = useState('');
	const [detailService, setDetailService] = useState<any | null>(null);

	const debouncedText = useDebounce(text, 350);

	useEffect(() => { setPage(1); }, [debouncedText, serviceType, status]);

	const buildInput = () => ({
		text: debouncedText || undefined,
		serviceType: serviceType || undefined,
		status: status || undefined,
		includeInactive: !status,
		sort: 'CREATED_AT',
		direction: SortDirection.DESC,
		page,
		limit: LIMIT,
	});

	const { data, refetch } = useQuery(ADMIN_SERVICES, {
		variables: { input: buildInput() },
		fetchPolicy: 'network-only',
	});

	const [deleteService] = useMutation(ADMIN_DELETE_SERVICE);
	const [updateService] = useMutation(ADMIN_UPDATE_SERVICE_STATUS);

	const services: any[] = data?.getServices?.list ?? [];
	const total: number = data?.getServices?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / LIMIT));

	const handleDelete = async (id: string, name: string) => {
		const ok = await sweetConfirmAlert(`${ui('admin.permanentlyDelete')} "${name}"? ${ui('admin.thisCannotBeUndone')}`);
		if (!ok) return;
		try {
			await deleteService({ variables: { id } });
			await sweetMixinSuccessAlert(ui('mypage.serviceDeleted'));
			setDetailService(null);
			refetch();
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || ui('mypage.failedToDeleteService'));
		}
	};

	const handleSetStatus = async (id: string, newStatus: string) => {
		const ok = await sweetConfirmAlert(`${newStatus === 'SUSPENDED' ? ui('admin.suspend') : ui('admin.activate')}?`);
		if (!ok) return;
		try {
			await updateService({
				variables: {
					id,
					input: {
						status: newStatus,
						visibility: newStatus === 'SUSPENDED' ? 'ARCHIVED' : 'PUBLIC',
					},
				},
			});
			await sweetMixinSuccessAlert(ui('admin.serviceStatusUpdated'));
			setDetailService(null);
			refetch();
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || ui('admin.failedToUpdate'));
		}
	};

	return (
		<div>
			<div className="page-title">{ui('admin.servicesManagement')}</div>

			<Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
				<TextField
					size="small"
					placeholder={ui('admin.searchByServiceName')}
					value={text}
					onChange={(e) => setText(e.target.value)}
					sx={{ minWidth: 240 }}
					InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
				/>
				<Select size="small" value={serviceType} onChange={(e) => setServiceType(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
					<MenuItem value="">{ui('admin.allTypes')}</MenuItem>
					<MenuItem value="VISA_SERVICES">{ui('mypage.visaServices')}</MenuItem>
					<MenuItem value="STUDY_ABROAD">{ui('mypage.studyAbroad')}</MenuItem>
					<MenuItem value="WORK_ABROAD">{ui('mypage.workAbroad')}</MenuItem>
					<MenuItem value="TRAVEL">{ui('mypage.travel')}</MenuItem>
				</Select>
				<Select size="small" value={status} onChange={(e) => setStatus(e.target.value)} displayEmpty sx={{ minWidth: 130 }}>
					<MenuItem value="">{ui('admin.allStatuses')}</MenuItem>
					<MenuItem value="ACTIVE">{ui('admin.active')}</MenuItem>
					<MenuItem value="DRAFT">{ui('admin.draft')}</MenuItem>
					<MenuItem value="ARCHIVED">{ui('admin.archived')}</MenuItem>
					<MenuItem value="SUSPENDED">{ui('admin.suspended')}</MenuItem>
				</Select>
				<Box sx={{ ml: 'auto', color: '#888', fontSize: 13 }}>{ui('admin.total')}: <b>{total}</b></Box>
			</Box>

			<TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: '#f5f7fa' }}>
							<TableCell><b>{ui('mypage.service')}</b></TableCell>
							<TableCell><b>{ui('admin.type')}</b></TableCell>
							<TableCell><b>{ui('service.destination')}</b></TableCell>
							<TableCell><b>{ui('service.price')}</b></TableCell>
							<TableCell><b>{ui('mypage.applications')}</b></TableCell>
							<TableCell><b>{ui('mypage.status')}</b></TableCell>
							<TableCell><b>{ui('admin.visibility')}</b></TableCell>
							<TableCell><b>{ui('admin.created')}</b></TableCell>
							<TableCell><b>{ui('admin.actions')}</b></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{services.length === 0 ? (
							<TableRow>
								<TableCell colSpan={9} sx={{ textAlign: 'center', py: 5, color: '#aaa' }}>{ui('service.noServicesFound')}</TableCell>
							</TableRow>
						) : services.map((svc: any) => (
							<TableRow key={svc._id} hover>
								<TableCell sx={{ fontWeight: 600, maxWidth: 180 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<span>{tr(svc.name)}</span>
										<InfoOutlinedIcon
											fontSize="small"
											sx={{ color: '#aaa', cursor: 'pointer', '&:hover': { color: '#1649ff' } }}
											onClick={() => setDetailService(svc)}
										/>
									</Box>
								</TableCell>
								<TableCell>
									<Chip label={ui(svc.serviceType) || svc.serviceType?.replace('_', ' ')} size="small" variant="outlined" />
								</TableCell>
								<TableCell sx={{ fontSize: 13 }}>{svc.destinationCountry}</TableCell>
								<TableCell sx={{ fontSize: 13 }}>
									{svc.price != null ? `$${svc.price}` : '—'}
								</TableCell>
								<TableCell sx={{ textAlign: 'center' }}>{svc.currentApplicationCount ?? 0}</TableCell>
								<TableCell>
									<Chip label={ui(svc.status)} size="small" color={statusColor[svc.status] ?? 'default'} />
								</TableCell>
								<TableCell>
									<Chip label={ui(svc.visibility)} size="small" color={visibilityColor[svc.visibility] ?? 'default'} variant="outlined" />
								</TableCell>
								<TableCell sx={{ fontSize: 12, color: '#888' }}>
									{new Date(svc.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
										{svc.status === 'ACTIVE' ? (
											<Button size="small" variant="outlined" color="warning" onClick={() => handleSetStatus(svc._id, 'SUSPENDED')}>{ui('admin.suspend')}</Button>
										) : (
											<Button size="small" variant="outlined" color="success" onClick={() => handleSetStatus(svc._id, 'ACTIVE')}>{ui('admin.activate')}</Button>
										)}
										<Button size="small" variant="outlined" color="error" onClick={() => handleDelete(svc._id, tr(svc.name))}>{ui('admin.delete')}</Button>
									</Box>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<AppPagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} />
			</Box>

			{/* Detail dialog */}
			<Dialog open={!!detailService} onClose={() => setDetailService(null)} maxWidth="sm" fullWidth>
				{detailService && (
					<>
						<DialogTitle sx={{ fontWeight: 700 }}>{tr(detailService.name)}</DialogTitle>
						<DialogContent>
							<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('admin.type')}</Typography>
									<Typography variant="body2">{ui(detailService.serviceType) || detailService.serviceType?.replace('_', ' ')}</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('service.destination')}</Typography>
									<Typography variant="body2">{detailService.destinationCountry}</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('service.price')}</Typography>
									<Typography variant="body2">{detailService.price != null ? `$${detailService.price}` : ui('admin.free')}</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('mypage.status')}</Typography>
									<Box><Chip label={ui(detailService.status)} size="small" color={statusColor[detailService.status] ?? 'default'} /></Box>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('admin.visibility')}</Typography>
									<Box>
										<Chip
											label={ui(detailService.visibility)}
											size="small"
											color={visibilityColor[detailService.visibility] ?? 'default'}
											variant="outlined"
										/>
									</Box>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('agency.views')}</Typography>
									<Typography variant="body2">{detailService.viewCount ?? 0}</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('agency.likes')}</Typography>
									<Typography variant="body2">{detailService.likeCount ?? 0}</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('mypage.applications')}</Typography>
									<Typography variant="body2">{detailService.currentApplicationCount ?? 0}</Typography>
								</Box>
							</Box>
							<Divider sx={{ mb: 2 }} />
							<Typography variant="caption" color="text.secondary">{ui('admin.serviceId')}</Typography>
							<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{detailService._id}</Typography>
						</DialogContent>
						<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
							{detailService.status === 'ACTIVE' ? (
								<Button color="warning" variant="outlined" size="small" onClick={() => handleSetStatus(detailService._id, 'SUSPENDED')}>{ui('admin.suspend')}</Button>
							) : (
								<Button color="success" variant="outlined" size="small" onClick={() => handleSetStatus(detailService._id, 'ACTIVE')}>{ui('admin.activate')}</Button>
							)}
							<Button color="error" variant="outlined" size="small" onClick={() => handleDelete(detailService._id, tr(detailService.name))}>{ui('admin.delete')}</Button>
							<Button onClick={() => setDetailService(null)}>{ui('admin.close')}</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
		</div>
	);
};

export default withLayoutAdmin(AdminServices);

export { i18nStaticProps as getStaticProps } from '../../../libs/i18n';
