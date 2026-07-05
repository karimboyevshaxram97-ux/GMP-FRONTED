import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
	Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Paper, Chip, Button, Pagination, TextField, Select, MenuItem, InputAdornment,
	Checkbox, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Divider, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import { useQuery, useMutation } from '@apollo/client';
import { ADMIN_USERS } from '../../../apollo/admin/query';
import { BAN_USER, UNBAN_USER } from '../../../apollo/admin/mutation';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import { sweetConfirmAlert, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { useDebounce } from '../../../libs/hooks/useDebounce';
import { REACT_APP_API_URL } from '../../../libs/config';
import { useUiLang } from '../../../libs/utils/translations';

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

	const handleBan = async (userId: string, isBanned: boolean) => {
		const ok = await sweetConfirmAlert(isBanned ? ui('Unban this user?') : ui('Ban this user?'));
		if (!ok) return;
		if (isBanned) {
			await unbanUser({ variables: { userId } });
		} else {
			await banUser({ variables: { input: { userId } } });
		}
		await sweetMixinSuccessAlert(isBanned ? ui('User unbanned') : ui('User banned'));
		refetch();
	};

	const toggleSelect = (id: string) => {
		setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
	};

	const selectableUsers = users.filter((u) => u.role !== 'SUPER_ADMIN');
	const allSelected = selectableUsers.length > 0 && selectableUsers.every((u) => selected.includes(u._id));

	const toggleAll = () => {
		setSelected(allSelected ? [] : selectableUsers.map((u) => u._id));
	};

	const handleBulkBan = async () => {
		if (!selected.length) return;
		const ok = await sweetConfirmAlert(`${ui('Ban')} ${selected.length} ${ui('selected')}?`);
		if (!ok) return;
		for (const userId of selected) {
			await banUser({ variables: { input: { userId } } });
		}
		await sweetMixinSuccessAlert(`${selected.length} ${ui('users banned')}`);
		setSelected([]);
		refetch();
	};

	const roleColor: any = { SUPER_ADMIN: 'error', AGENCY_ADMIN: 'warning', USER: 'default' };
	const statusColor: any = { ACTIVE: 'success', BANNED: 'error', INACTIVE: 'default' };

	return (
		<div>
			<div className="page-title">{ui('Users Management')}</div>

			<Box className="admin-filter-bar">
				<TextField
					size="small"
					placeholder={ui('Search name / email / phone')}
					value={text}
					onChange={(e) => { setText(e.target.value); setPage(1); }}
					sx={{ minWidth: 240 }}
					InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
				/>
				<Select size="small" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} displayEmpty sx={{ minWidth: 130 }}>
					<MenuItem value="">{ui('All statuses')}</MenuItem>
					<MenuItem value="ACTIVE">{ui('Active')}</MenuItem>
					<MenuItem value="BANNED">{ui('Banned')}</MenuItem>
					<MenuItem value="INACTIVE">{ui('Inactive')}</MenuItem>
				</Select>
				<Select size="small" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} displayEmpty sx={{ minWidth: 130 }}>
					<MenuItem value="">{ui('All roles')}</MenuItem>
					<MenuItem value="USER">{ui('User')}</MenuItem>
					<MenuItem value="AGENCY_ADMIN">{ui('Agency Admin')}</MenuItem>
					<MenuItem value="SUPER_ADMIN">{ui('Super Admin')}</MenuItem>
				</Select>
				<Box className="filter-total">{ui('Total')}: <b>{total}</b></Box>
			</Box>

			{selected.length > 0 && (
				<Box className="admin-bulk-bar">
					<span className="bulk-count">{selected.length} {ui('selected')}</span>
					<Tooltip title={ui('Ban all selected')}>
						<Button size="small" variant="outlined" color="warning" startIcon={<BlockIcon />} onClick={handleBulkBan}>
							{ui('Ban all')}
						</Button>
					</Tooltip>
					<Button size="small" onClick={() => setSelected([])}>{ui('Clear')}</Button>
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
							<TableCell><b>{ui('Name')}</b></TableCell>
							<TableCell><b>{ui('Email')}</b></TableCell>
							<TableCell><b>{ui('Phone')}</b></TableCell>
							<TableCell><b>{ui('Role')}</b></TableCell>
							<TableCell><b>{ui('Status')}</b></TableCell>
							<TableCell><b>{ui('Joined')}</b></TableCell>
							<TableCell><b>{ui('Actions')}</b></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: '#aaa' }}>{ui('No users found')}</TableCell>
							</TableRow>
						) : users.map((user: any) => (
							<TableRow key={user._id} hover selected={selected.includes(user._id)}>
								<TableCell padding="checkbox">
									{user.role !== 'SUPER_ADMIN' && (
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
										<Button size="small" variant="outlined"
											color={user.status === 'BANNED' ? 'success' : 'warning'}
											onClick={() => handleBan(user._id, user.status === 'BANNED')}
										>
											{user.status === 'BANNED' ? ui('Unban') : ui('Ban')}
										</Button>
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
						<DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{ui('User Profile')}</DialogTitle>
						<DialogContent>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
								<Avatar
									src={detailUser.avatar ? `${REACT_APP_API_URL}/uploads/${detailUser.avatar}` : undefined}
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
									<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{ui('Bio')}</Typography>
									<Typography variant="body2">{detailUser.bio}</Typography>
								</Box>
							)}

							<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
								<Box><Typography variant="caption" color="text.secondary">{ui('Email')}</Typography><Typography variant="body2">{detailUser.email || '—'}</Typography></Box>
								<Box><Typography variant="caption" color="text.secondary">{ui('Phone')}</Typography><Typography variant="body2">{detailUser.phoneNumber || '—'}</Typography></Box>
								<Box><Typography variant="caption" color="text.secondary">{ui('Nationality')}</Typography><Typography variant="body2">{detailUser.nationality || '—'}</Typography></Box>
								<Box><Typography variant="caption" color="text.secondary">{ui('Joined')}</Typography><Typography variant="body2">{new Date(detailUser.createdAt).toLocaleDateString()}</Typography></Box>
							</Box>
							<Divider sx={{ mt: 2, mb: 1 }} />
							<Typography variant="caption" color="text.secondary">ID: </Typography>
							<Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{detailUser._id}</Typography>
						</DialogContent>
						<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
							{detailUser.role !== 'SUPER_ADMIN' && (
								<Button size="small" variant="outlined"
									color={detailUser.status === 'BANNED' ? 'success' : 'warning'}
									onClick={() => { handleBan(detailUser._id, detailUser.status === 'BANNED'); setDetailUser(null); }}
								>
									{detailUser.status === 'BANNED' ? ui('Unban') : ui('Ban')}
								</Button>
							)}
							<Button onClick={() => setDetailUser(null)}>{ui('Close')}</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
		</div>
	);
};

export default withLayoutAdmin(AdminUsers);

export { i18nStaticProps as getStaticProps } from '../../../libs/i18n';
