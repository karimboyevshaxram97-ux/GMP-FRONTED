import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
	Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Paper, Chip, Button, Pagination, TextField, Select, MenuItem, InputAdornment,
	Checkbox, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Divider, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation } from '@apollo/client';
import { ADMIN_USERS } from '../../../apollo/admin/query';
import { ADMIN_DELETE_USER, BAN_USER, UNBAN_USER } from '../../../apollo/admin/mutation';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { useDebounce } from '../../../libs/hooks/useDebounce';
import { useUiLang } from '../../../libs/utils/translations';
import { avatarSrc } from '../../../libs/utils/avatar';

const PAGE_SIZE = 10;

const AdminUsers: NextPage = () => {
	const ui = useUiLang();
	const [page, setPage] = useState(1);
	const [text, setText] = useState('');
	const [status, setStatus] = useState('');
	const [role, setRole] = useState('');
	const [selected, setSelected] = useState<string[]>([]);
	const [detailUser, setDetailUser] = useState<any | null>(null);

	const debouncedText = useDebounce(text, 350);

	const { data, refetch } = useQuery(ADMIN_USERS, {
		variables: {
			page,
			limit: PAGE_SIZE,
			filter: {
				text: debouncedText || undefined,
				status: status || undefined,
				role: role || undefined,
			},
		},
		fetchPolicy: 'network-only',
	});

	useEffect(() => {
		setPage(1);
		setSelected([]);
	}, [debouncedText, status, role]);

	const users: any[] = data?.adminUsers?.list ?? [];
	const total: number = data?.adminUsers?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const [banUser] = useMutation(BAN_USER);
	const [unbanUser] = useMutation(UNBAN_USER);
	const [deleteUser] = useMutation(ADMIN_DELETE_USER);

	const handleBan = async (userId: string, isBanned: boolean) => {
		const ok = await sweetConfirmAlert(isBanned ? ui('admin.unbanThisUser') : ui('admin.banThisUser'));
		if (!ok) return;
		try {
			if (isBanned) {
				await unbanUser({ variables: { userId } });
			} else {
				await banUser({ variables: { input: { userId } } });
			}
			await sweetMixinSuccessAlert(isBanned ? ui('admin.userUnbanned') : ui('admin.userBanned'));
			setDetailUser(null);
			await refetch();
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || ui('admin.failedToUpdate'));
		}
	};

	const handleDelete = async (userId: string, name: string) => {
		const ok = await sweetConfirmAlert(`${ui('admin.permanentlyDelete')} "${name}"? ${ui('admin.thisCannotBeUndone')}`);
		if (!ok) return;
		try {
			await deleteUser({ variables: { userId } });
			await sweetMixinSuccessAlert(ui('admin.userDeleted'));
			setDetailUser(null);
			setSelected((prev) => prev.filter((id) => id !== userId));
			await refetch();
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || ui('admin.failedToDeleteUser'));
		}
	};

	const toggleSelect = (id: string) => {
		setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
	};

	const isBulkBanEligible = (user: any) => user.role !== 'SUPER_ADMIN' && user.status !== 'BANNED';
	const selectableUsers = users.filter(isBulkBanEligible);
	const allSelected = selectableUsers.length > 0 && selectableUsers.every((u) => selected.includes(u._id));

	const toggleAll = () => {
		setSelected(allSelected ? [] : selectableUsers.map((u) => u._id));
	};

	const handleBulkBan = async () => {
		if (!selected.length) return;
		const ok = await sweetConfirmAlert(`${ui('admin.ban')} ${selected.length} ${ui('admin.selected')}?`);
		if (!ok) return;
		const targets = selected.filter((userId) => users.some((user) => user._id === userId && isBulkBanEligible(user)));
		const results = await Promise.allSettled(
			targets.map((userId) => banUser({ variables: { input: { userId } } })),
		);
		const successCount = results.filter((result) => result.status === 'fulfilled').length;
		const failedCount = results.length - successCount;
		if (successCount) {
			await sweetMixinSuccessAlert(`${successCount} ${ui('admin.usersBanned')}`);
		}
		if (failedCount) {
			await sweetMixinErrorAlert(`${failedCount} ${ui('admin.failedToUpdate')}`);
		}
		setSelected([]);
		await refetch();
	};

	const roleColor: any = { SUPER_ADMIN: 'error', AGENCY_ADMIN: 'warning', USER: 'default' };
	const statusColor: any = { ACTIVE: 'success', BANNED: 'error', INACTIVE: 'default' };

	return (
		<div>
			<div className="page-title">{ui('admin.usersManagement')}</div>

			<Box className="admin-filter-bar">
				<TextField
					size="small"
					placeholder={ui('admin.searchNameEmailPhone')}
					value={text}
					onChange={(e) => { setText(e.target.value); setPage(1); }}
					sx={{ minWidth: 240 }}
					InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
				/>
				<Select size="small" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} displayEmpty sx={{ minWidth: 130 }}>
					<MenuItem value="">{ui('admin.allStatuses')}</MenuItem>
					<MenuItem value="ACTIVE">{ui('admin.active')}</MenuItem>
					<MenuItem value="BANNED">{ui('admin.banned')}</MenuItem>
					<MenuItem value="INACTIVE">{ui('admin.inactive')}</MenuItem>
				</Select>
				<Select size="small" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} displayEmpty sx={{ minWidth: 130 }}>
					<MenuItem value="">{ui('admin.allRoles')}</MenuItem>
					<MenuItem value="USER">{ui('auth.user')}</MenuItem>
					<MenuItem value="AGENCY_ADMIN">{ui('admin.agencyAdmin')}</MenuItem>
					<MenuItem value="SUPER_ADMIN">{ui('admin.superAdmin')}</MenuItem>
				</Select>
				<Box className="filter-total">{ui('admin.total')}: <b>{total}</b></Box>
			</Box>

			{selected.length > 0 && (
				<Box className="admin-bulk-bar">
					<span className="bulk-count">{selected.length} {ui('admin.selected')}</span>
					<Tooltip title={ui('admin.banAllSelected')}>
						<Button size="small" variant="outlined" color="warning" startIcon={<BlockIcon />} onClick={handleBulkBan}>
							{ui('admin.banAll')}
						</Button>
					</Tooltip>
					<Button size="small" onClick={() => setSelected([])}>{ui('admin.clear')}</Button>
				</Box>
			)}

			<TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: '#f5f7fa' }}>
							<TableCell padding="checkbox">
								<Checkbox
									size="small"
									checked={allSelected}
									indeterminate={selected.length > 0 && !allSelected}
									onChange={toggleAll}
								/>
							</TableCell>
							<TableCell><b>{ui('admin.name')}</b></TableCell>
							<TableCell><b>{ui('help.email')}</b></TableCell>
							<TableCell><b>{ui('help.phone')}</b></TableCell>
							<TableCell><b>{ui('admin.role')}</b></TableCell>
							<TableCell><b>{ui('mypage.status')}</b></TableCell>
							<TableCell><b>{ui('admin.joined')}</b></TableCell>
							<TableCell><b>{ui('admin.actions')}</b></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: '#aaa' }}>{ui('admin.noUsersFound')}</TableCell>
							</TableRow>
						) : users.map((user: any) => (
							<TableRow key={user._id} hover selected={selected.includes(user._id)}>
								<TableCell padding="checkbox">
									{isBulkBanEligible(user) && (
										<Checkbox size="small" checked={selected.includes(user._id)} onChange={() => toggleSelect(user._id)} />
									)}
								</TableCell>
								<TableCell sx={{ fontWeight: 600, cursor: 'pointer', color: '#1649ff' }} onClick={() => setDetailUser(user)}>
									{user.firstName} {user.lastName}
								</TableCell>
								<TableCell sx={{ fontSize: 13 }}>{user.email}</TableCell>
								<TableCell sx={{ fontSize: 13 }}>{user.phoneNumber || '—'}</TableCell>
								<TableCell>
									<Chip label={ui(user.role)} size="small" color={roleColor[user.role] ?? 'default'} />
								</TableCell>
								<TableCell>
									<Chip label={ui(user.status)} size="small" color={statusColor[user.status] ?? 'default'} />
								</TableCell>
								<TableCell sx={{ fontSize: 12, color: '#888' }}>
									{new Date(user.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell>
									{user.role !== 'SUPER_ADMIN' && (
										<Box sx={{ display: 'flex', gap: 0.5 }}>
											<Button size="small" variant="outlined"
												color={user.status === 'BANNED' ? 'success' : 'warning'}
												onClick={() => handleBan(user._id, user.status === 'BANNED')}
											>
												{user.status === 'BANNED' ? ui('admin.unban') : ui('admin.ban')}
											</Button>
											<Button size="small" variant="outlined" color="error" onClick={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`.trim() || user.email)}>
												{ui('admin.delete')}
											</Button>
										</Box>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Pagination count={pageCount} page={page} onChange={(_, v) => { setPage(v); setSelected([]); }} color="primary" />
			</Box>

			{/* User detail modal */}
			<Dialog open={!!detailUser} onClose={() => setDetailUser(null)} maxWidth="xs" fullWidth>
				{detailUser && (
					<>
						<DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{ui('admin.userProfile')}</DialogTitle>
						<DialogContent>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
								<Avatar
									src={detailUser.avatar ? avatarSrc(detailUser.avatar) : undefined}
									sx={{ width: 64, height: 64, fontSize: 26, bgcolor: '#1649ff' }}
								>
									{!detailUser.avatar && detailUser.firstName?.[0]}
								</Avatar>
								<Box>
									<Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
										{detailUser.firstName} {detailUser.lastName}
									</Typography>
									<Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
										<Chip label={ui(detailUser.role)} size="small" color={roleColor[detailUser.role] ?? 'default'} />
										<Chip label={ui(detailUser.status)} size="small" color={statusColor[detailUser.status] ?? 'default'} />
									</Box>
								</Box>
							</Box>

							{detailUser.bio && (
								<Box sx={{ mb: 2, p: '10px 14px', background: '#f7f9fc', borderRadius: 2 }}>
									<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{ui('mypage.bio')}</Typography>
									<Typography variant="body2">{detailUser.bio}</Typography>
								</Box>
							)}

							<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
								<Box><Typography variant="caption" color="text.secondary">{ui('help.email')}</Typography><Typography variant="body2">{detailUser.email || '—'}</Typography></Box>
								<Box><Typography variant="caption" color="text.secondary">{ui('help.phone')}</Typography><Typography variant="body2">{detailUser.phoneNumber || '—'}</Typography></Box>
								<Box><Typography variant="caption" color="text.secondary">{ui('mypage.nationality')}</Typography><Typography variant="body2">{detailUser.nationality || '—'}</Typography></Box>
								<Box><Typography variant="caption" color="text.secondary">{ui('admin.joined')}</Typography><Typography variant="body2">{new Date(detailUser.createdAt).toLocaleDateString()}</Typography></Box>
							</Box>
							<Divider sx={{ mt: 2, mb: 1 }} />
							<Typography variant="caption" color="text.secondary">ID: </Typography>
							<Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{detailUser._id}</Typography>
						</DialogContent>
						<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
							{detailUser.role !== 'SUPER_ADMIN' && (
								<Button size="small" variant="outlined"
									color={detailUser.status === 'BANNED' ? 'success' : 'warning'}
									onClick={() => handleBan(detailUser._id, detailUser.status === 'BANNED')}
								>
									{detailUser.status === 'BANNED' ? ui('admin.unban') : ui('admin.ban')}
								</Button>
							)}
							{detailUser.role !== 'SUPER_ADMIN' && (
								<Button
									size="small"
									variant="outlined"
									color="error"
									startIcon={<DeleteIcon />}
									onClick={() => handleDelete(detailUser._id, `${detailUser.firstName} ${detailUser.lastName}`.trim() || detailUser.email)}
								>
									{ui('admin.deleteUser')}
								</Button>
							)}
							<Button onClick={() => setDetailUser(null)}>{ui('admin.close')}</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
		</div>
	);
};

export default withLayoutAdmin(AdminUsers);

export { i18nStaticProps as getStaticProps } from '../../../libs/i18n';
