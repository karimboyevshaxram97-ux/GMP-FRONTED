import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
	Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Paper, Chip, Button, Pagination, TextField, Select, MenuItem, InputAdornment,
	Dialog, DialogTitle, DialogContent, DialogActions, Typography, Divider, Rating,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useQuery, useMutation } from '@apollo/client';
import { ADMIN_SERVICES } from '../../../apollo/admin/query';
import { ADMIN_DELETE_SERVICE, ADMIN_UPDATE_SERVICE_STATUS } from '../../../apollo/admin/mutation';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
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
		const ok = await sweetConfirmAlert(`${ui('Permanently delete')} "${name}"? ${ui('This cannot be undone.')}`);
		if (!ok) return;
		try {
			await deleteService({ variables: { id } });
			await sweetMixinSuccessAlert(ui('Service deleted'));
			setDetailService(null);
			refetch();
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || ui('Failed to delete service'));
		}
	};

	const handleSetStatus = async (id: string, newStatus: string) => {
		try {
			await updateService({
				variables: {
					id,
					input: {
						status: newStatus,
						visibility: newStatus === 'ARCHIVED' ? 'ARCHIVED' : 'PUBLIC',
					},
				},
			});
			await sweetMixinSuccessAlert(ui('Service status updated'));
			setDetailService(null);
			refetch();
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || ui('Failed to update'));
		}
	};

	return (
		<div>
			<div className="page-title">{ui('Services Management')}</div>

			<Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
				<TextField
					size="small"
					placeholder={ui('Search by service name')}
					value={text}
					onChange={(e) => setText(e.target.value)}
					sx={{ minWidth: 240 }}
					InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
				/>
				<Select size="small" value={serviceType} onChange={(e) => setServiceType(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
					<MenuItem value="">{ui('All types')}</MenuItem>
					<MenuItem value="VISA_SERVICES">{ui('Visa Services')}</MenuItem>
					<MenuItem value="STUDY_ABROAD">{ui('Study Abroad')}</MenuItem>
					<MenuItem value="WORK_ABROAD">{ui('Work Abroad')}</MenuItem>
					<MenuItem value="TRAVEL">{ui('Travel')}</MenuItem>
				</Select>
				<Select size="small" value={status} onChange={(e) => setStatus(e.target.value)} displayEmpty sx={{ minWidth: 130 }}>
					<MenuItem value="">{ui('All statuses')}</MenuItem>
					<MenuItem value="ACTIVE">{ui('Active')}</MenuItem>
					<MenuItem value="DRAFT">{ui('Draft')}</MenuItem>
					<MenuItem value="ARCHIVED">{ui('Archived')}</MenuItem>
					<MenuItem value="SUSPENDED">{ui('Suspended')}</MenuItem>
				</Select>
				<Box sx={{ ml: 'auto', color: '#888', fontSize: 13 }}>{ui('Total')}: <b>{total}</b></Box>
			</Box>

			<TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: '#f5f7fa' }}>
							<TableCell><b>{ui('Service')}</b></TableCell>
							<TableCell><b>{ui('Type')}</b></TableCell>
							<TableCell><b>{ui('Destination')}</b></TableCell>
							<TableCell><b>{ui('Price')}</b></TableCell>
							<TableCell><b>{ui('Rating')}</b></TableCell>
							<TableCell><b>{ui('Applications')}</b></TableCell>
							<TableCell><b>{ui('Status')}</b></TableCell>
							<TableCell><b>{ui('Visibility')}</b></TableCell>
							<TableCell><b>{ui('Created')}</b></TableCell>
							<TableCell><b>{ui('Actions')}</b></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{services.length === 0 ? (
							<TableRow>
								<TableCell colSpan={10} sx={{ textAlign: 'center', py: 5, color: '#aaa' }}>{ui('No services found')}</TableCell>
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
								<TableCell>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 13 }}>
										<Rating value={svc.averageRating ?? 0} precision={0.1} readOnly size="small" />
										<span>({svc.totalReviews ?? 0})</span>
									</Box>
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
										{svc.status !== 'ARCHIVED' && (
											<Button size="small" variant="outlined" color="warning" onClick={() => handleSetStatus(svc._id, 'ARCHIVED')}>{ui('Archive')}</Button>
										)}
										<Button size="small" variant="outlined" color="error" onClick={() => handleDelete(svc._id, tr(svc.name))}>{ui('Delete')}</Button>
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

			{/* Detail dialog */}
			<Dialog open={!!detailService} onClose={() => setDetailService(null)} maxWidth="sm" fullWidth>
				{detailService && (
					<>
						<DialogTitle sx={{ fontWeight: 700 }}>{tr(detailService.name)}</DialogTitle>
						<DialogContent>
							<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('Type')}</Typography>
									<Typography variant="body2">{ui(detailService.serviceType) || detailService.serviceType?.replace('_', ' ')}</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('Destination')}</Typography>
									<Typography variant="body2">{detailService.destinationCountry}</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('Price')}</Typography>
									<Typography variant="body2">{detailService.price != null ? `$${detailService.price}` : ui('Free')}</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('Status')}</Typography>
									<Box><Chip label={ui(detailService.status)} size="small" color={statusColor[detailService.status] ?? 'default'} /></Box>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('Visibility')}</Typography>
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
									<Typography variant="caption" color="text.secondary">{ui('Views')}</Typography>
									<Typography variant="body2">{detailService.viewCount ?? 0}</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('Likes')}</Typography>
									<Typography variant="body2">{detailService.likeCount ?? 0}</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('Applications')}</Typography>
									<Typography variant="body2">{detailService.currentApplicationCount ?? 0}</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">{ui('Rating')}</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
										<Rating value={detailService.averageRating ?? 0} precision={0.1} readOnly size="small" />
										<Typography variant="body2">({detailService.totalReviews ?? 0})</Typography>
									</Box>
								</Box>
							</Box>
							<Divider sx={{ mb: 2 }} />
							<Typography variant="caption" color="text.secondary">{ui('Service ID')}</Typography>
							<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{detailService._id}</Typography>
						</DialogContent>
						<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
							{detailService.status !== 'ARCHIVED' && (
								<Button color="warning" variant="outlined" size="small" onClick={() => handleSetStatus(detailService._id, 'ARCHIVED')}>{ui('Archive')}</Button>
							)}
							<Button color="error" variant="outlined" size="small" onClick={() => handleDelete(detailService._id, tr(detailService.name))}>{ui('Delete')}</Button>
							<Button onClick={() => setDetailService(null)}>{ui('Close')}</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
		</div>
	);
};

export default withLayoutAdmin(AdminServices);

export { i18nStaticProps as getStaticProps } from '../../../libs/i18n';
