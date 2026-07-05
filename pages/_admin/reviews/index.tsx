import React, { useState } from 'react';
import { NextPage } from 'next';
import {
	Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Paper, Chip, Rating, Button, FormControl, InputLabel, Select, MenuItem,
	Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { ADMIN_ALL_REVIEWS } from '../../../apollo/admin/query';
import { APPROVE_REVIEW, HIDE_REVIEW, REJECT_REVIEW } from '../../../apollo/admin/mutation';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { toFriendlyError } from '../../../libs/utils/errors';
import { useUiLang } from '../../../libs/utils/translations';

const statusColor: any = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'error', HIDDEN: 'default' };
const statusOptions = ['', 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'];

const AdminReviews: NextPage = () => {
	const ui = useUiLang();
	const [status, setStatus] = useState('');
	const [busyId, setBusyId] = useState('');
	const [reasonAction, setReasonAction] = useState<'REJECT' | 'HIDE' | null>(null);
	const [reasonReview, setReasonReview] = useState<any>(null);
	const [reason, setReason] = useState('');

	const { data, loading, refetch } = useQuery(ADMIN_ALL_REVIEWS, {
		variables: { status: status || null },
		fetchPolicy: 'network-only',
	});
	const [approveReview] = useMutation(APPROVE_REVIEW);
	const [rejectReview] = useMutation(REJECT_REVIEW);
	const [hideReview] = useMutation(HIDE_REVIEW);

	const reviews: any[] = data?.adminReviews ?? [];

	const runAction = async (action: 'APPROVE' | 'REJECT' | 'HIDE', review: any, actionReason?: string) => {
		setBusyId(review._id);
		try {
			if (action === 'APPROVE') {
				await approveReview({ variables: { reviewId: review._id } });
				await sweetMixinSuccessAlert(ui('admin.reviewApproved'));
			}
			if (action === 'REJECT') {
				await rejectReview({ variables: { reviewId: review._id, reason: actionReason || undefined } });
				await sweetMixinSuccessAlert(ui('admin.reviewRejected'));
			}
			if (action === 'HIDE') {
				await hideReview({ variables: { reviewId: review._id, reason: actionReason || undefined } });
				await sweetMixinSuccessAlert(ui('admin.reviewHidden'));
			}
			await refetch();
		} catch (err: any) {
			await sweetMixinErrorAlert(toFriendlyError(err, ui('admin.failedToUpdateReview')));
		} finally {
			setBusyId('');
		}
	};

	const openReasonDialog = (action: 'REJECT' | 'HIDE', review: any) => {
		setReasonAction(action);
		setReasonReview(review);
		setReason('');
	};

	const closeReasonDialog = () => {
		setReasonAction(null);
		setReasonReview(null);
		setReason('');
	};

	const submitReasonAction = async () => {
		if (!reasonAction || !reasonReview) return;
		await runAction(reasonAction, reasonReview, reason.trim());
		closeReasonDialog();
	};

	return (
		<div>
			<div className="page-title">{ui('admin.reviewsModeration')}</div>

			<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2, alignItems: 'center' }}>
				<FormControl size="small" sx={{ minWidth: 180 }}>
					<InputLabel>{ui('mypage.status')}</InputLabel>
					<Select
						label="Status"
						value={status}
						onChange={(e) => setStatus(e.target.value)}
					>
						{statusOptions.map((option) => (
							<MenuItem key={option || 'ALL'} value={option}>
								{option ? ui(option) : ui('admin.allReviews')}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<Button variant="outlined" onClick={() => refetch()} disabled={loading}>
					{ui('admin.refresh')}
				</Button>
			</Box>

			<TableContainer component={Paper} sx={{ borderRadius: 2 }}>
				<Table size="small">
					<TableHead>
						<TableRow sx={{ bgcolor: '#f5f7fa' }}>
							<TableCell><b>{ui('mypage.rating')}</b></TableCell>
							<TableCell><b>{ui('admin.comment')}</b></TableCell>
							<TableCell><b>{ui('auth.agency')}</b></TableCell>
							<TableCell><b>{ui('mypage.service')}</b></TableCell>
							<TableCell><b>{ui('mypage.status')}</b></TableCell>
							<TableCell><b>{ui('admin.date')}</b></TableCell>
							<TableCell align="right"><b>{ui('admin.actions')}</b></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#aaa' }}>{ui('admin.loadingReviews')}</TableCell>
							</TableRow>
						) : reviews.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#aaa' }}>{ui('admin.noReviewsFound')}</TableCell>
							</TableRow>
						) : reviews.map((review: any) => {
							const reviewStatus = review.status || 'PENDING';
							const isBusy = busyId === review._id;

							return (
								<TableRow key={review._id} hover>
									<TableCell>
										<Rating value={review.rating} readOnly size="small" />
									</TableCell>
									<TableCell sx={{ fontSize: 13, maxWidth: 320 }}>
										{review.comment || <span style={{ color: '#aaa' }}>{ui('admin.noComment')}</span>}
									</TableCell>
									<TableCell sx={{ fontSize: 12 }}>{review.agency || '-'}</TableCell>
									<TableCell sx={{ fontSize: 12 }}>{review.service || '-'}</TableCell>
									<TableCell>
										<Chip
											label={ui(reviewStatus)}
											size="small"
											color={statusColor[reviewStatus] ?? 'default'}
										/>
									</TableCell>
									<TableCell sx={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
										{new Date(review.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell align="right">
										<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
											<Button
												size="small"
												variant="contained"
												disabled={isBusy || reviewStatus === 'APPROVED'}
												onClick={() => runAction('APPROVE', review)}
											>
												{ui('mypage.approve')}
											</Button>
											<Button
												size="small"
												color="error"
												variant="outlined"
												disabled={isBusy || reviewStatus === 'REJECTED'}
												onClick={() => openReasonDialog('REJECT', review)}
											>
												{ui('mypage.reject')}
											</Button>
											<Button
												size="small"
												color="inherit"
												variant="outlined"
												disabled={isBusy || reviewStatus === 'HIDDEN'}
												onClick={() => openReasonDialog('HIDE', review)}
											>
												{ui('admin.hide')}
											</Button>
										</Box>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>

			<Dialog open={!!reasonAction} onClose={closeReasonDialog} fullWidth maxWidth="sm">
				<DialogTitle>{reasonAction === 'REJECT' ? ui('admin.rejectReview') : ui('admin.hideReview')}</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						fullWidth
						multiline
						minRows={3}
						label={ui('admin.reason')}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						sx={{ mt: 1 }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeReasonDialog}>{ui('agency.cancel')}</Button>
					<Button variant="contained" onClick={submitReasonAction} disabled={!!busyId}>
						{ui('admin.submit')}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default withLayoutAdmin(AdminReviews);

export { i18nStaticProps as getStaticProps } from '../../../libs/i18n';
