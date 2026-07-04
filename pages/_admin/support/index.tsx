import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import {
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	InputAdornment,
	MenuItem,
	Pagination,
	Paper,
	Select,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useMutation, useQuery } from '@apollo/client';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import { ADMIN_SUPPORT_TICKETS } from '../../../apollo/admin/query';
import { UPDATE_SUPPORT_TICKET_STATUS } from '../../../apollo/admin/mutation';
import { useDebounce } from '../../../libs/hooks/useDebounce';
import { sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { useUiLang } from '../../../libs/utils/translations';

const LIMIT = 10;

const statusColor: any = {
	OPEN: 'error',
	IN_PROGRESS: 'warning',
	RESOLVED: 'success',
};

const AdminSupport: NextPage = () => {
	const ui = useUiLang();
	const [page, setPage] = useState(1);
	const [text, setText] = useState('');
	const [status, setStatus] = useState('');
	const [selected, setSelected] = useState<any | null>(null);
	const debouncedText = useDebounce(text, 350);

	const { data, refetch } = useQuery(ADMIN_SUPPORT_TICKETS, {
		variables: {
			input: {
				page,
				limit: LIMIT,
				text: debouncedText || undefined,
				status: status || undefined,
			},
		},
		fetchPolicy: 'network-only',
	});

	const [updateStatus] = useMutation(UPDATE_SUPPORT_TICKET_STATUS);

	useEffect(() => {
		setPage(1);
	}, [debouncedText, status]);

	const tickets: any[] = data?.adminSupportTickets?.list ?? [];
	const total: number = data?.adminSupportTickets?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / LIMIT));

	const handleStatus = async (ticketId: string, nextStatus: string) => {
		await updateStatus({ variables: { input: { ticketId, status: nextStatus } } });
		await sweetMixinSuccessAlert(ui('Support ticket updated'));
		setSelected(null);
		refetch();
	};

	return (
		<div>
			<div className="page-title">{ui('Support Messages')}</div>

			<Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
				<TextField
					size="small"
					placeholder={ui('Search name, email, message')}
					value={text}
					onChange={(e) => setText(e.target.value)}
					sx={{ minWidth: 280 }}
					InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
				/>
				<Select size="small" value={status} onChange={(e) => setStatus(e.target.value)} displayEmpty sx={{ minWidth: 155 }}>
					<MenuItem value="">{ui('All statuses')}</MenuItem>
					<MenuItem value="OPEN">{ui('Open')}</MenuItem>
					<MenuItem value="IN_PROGRESS">{ui('In progress')}</MenuItem>
					<MenuItem value="RESOLVED">{ui('Resolved')}</MenuItem>
				</Select>
				<Box sx={{ ml: 'auto', color: '#888', fontSize: 13 }}>{ui('Total')}: <b>{total}</b></Box>
			</Box>

			<TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: '#f5f7fa' }}>
							<TableCell><b>{ui('Name')}</b></TableCell>
							<TableCell><b>{ui('Email')}</b></TableCell>
							<TableCell><b>{ui('Role')}</b></TableCell>
							<TableCell><b>{ui('Message')}</b></TableCell>
							<TableCell><b>{ui('Status')}</b></TableCell>
							<TableCell><b>{ui('Created')}</b></TableCell>
							<TableCell><b>{ui('Actions')}</b></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{tickets.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: '#aaa' }}>{ui('No support messages found')}</TableCell>
							</TableRow>
						) : tickets.map((ticket) => (
							<TableRow key={ticket._id} hover>
								<TableCell sx={{ fontWeight: 700 }}>{ticket.name}</TableCell>
								<TableCell>{ticket.email}</TableCell>
								<TableCell>{ticket.role || 'GUEST'}</TableCell>
								<TableCell sx={{ maxWidth: 360 }}>
									<Typography noWrap fontSize={13}>{ticket.message}</Typography>
								</TableCell>
								<TableCell>
									<Chip label={ui(ticket.status)} size="small" color={statusColor[ticket.status] ?? 'default'} />
								</TableCell>
								<TableCell sx={{ fontSize: 12, color: '#888' }}>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
								<TableCell>
									<Button size="small" variant="outlined" onClick={() => setSelected(ticket)}>{ui('Open')}</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Pagination count={pageCount} page={page} onChange={(_, value) => setPage(value)} color="primary" />
			</Box>

			<Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
				{selected && (
					<>
						<DialogTitle sx={{ fontWeight: 800 }}>{selected.name}</DialogTitle>
						<DialogContent>
							<Box sx={{ display: 'grid', gap: 1.2, mb: 2 }}>
								<Typography fontSize={13}><b>{ui('Email')}:</b> {selected.email}</Typography>
								{selected.phoneNumber && <Typography fontSize={13}><b>{ui('Phone')}:</b> {selected.phoneNumber}</Typography>}
								<Typography fontSize={13}><b>{ui('Role')}:</b> {ui(selected.role || 'GUEST')}</Typography>
								<Typography fontSize={13}><b>{ui('Status')}:</b> {ui(selected.status)}</Typography>
								<Typography fontSize={13}><b>{ui('Created')}:</b> {new Date(selected.createdAt).toLocaleString()}</Typography>
							</Box>
							<Box sx={{ p: 2, bgcolor: '#f7f9fc', borderRadius: 2, whiteSpace: 'pre-wrap', fontSize: 14 }}>
								{selected.message}
							</Box>
						</DialogContent>
						<DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
							<Button size="small" variant="outlined" color="warning" onClick={() => handleStatus(selected._id, 'IN_PROGRESS')}>
								{ui('In progress')}
							</Button>
							<Button size="small" variant="contained" color="success" onClick={() => handleStatus(selected._id, 'RESOLVED')}>
								{ui('Resolve')}
							</Button>
							<Button onClick={() => setSelected(null)}>{ui('Close')}</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
		</div>
	);
};

export default withLayoutAdmin(AdminSupport);
