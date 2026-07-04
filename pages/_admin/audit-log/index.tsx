import React, { useState } from 'react';
import { NextPage } from 'next';
import {
	Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Paper, Chip, Pagination,
} from '@mui/material';
import { useQuery } from '@apollo/client';
import { AUDIT_LOGS } from '../../../apollo/admin/query';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import { useUiLang } from '../../../libs/utils/translations';

const LIMIT = 30;

const ACTION_COLOR: Record<string, 'error' | 'warning' | 'success' | 'info' | 'default'> = {
	BAN_USER: 'error',
	DELETE_USER: 'error',
	DELETE_AGENCY: 'error',
	REJECT_AGENCY: 'error',
	SUSPEND_AGENCY: 'warning',
	UNBAN_USER: 'success',
	APPROVE_AGENCY: 'success',
	ACTIVATE_AGENCY: 'success',
};

const ACTION_LABEL: Record<string, string> = {
	BAN_USER: 'Ban User',
	UNBAN_USER: 'Unban User',
	DELETE_USER: 'Delete User',
	APPROVE_AGENCY: 'Approve Agency',
	REJECT_AGENCY: 'Reject Agency',
	SUSPEND_AGENCY: 'Suspend Agency',
	ACTIVATE_AGENCY: 'Activate Agency',
	DELETE_AGENCY: 'Delete Agency',
};

const ACTION_ICON: Record<string, string> = {
	BAN_USER: '🚫',
	UNBAN_USER: '✅',
	DELETE_USER: '🗑',
	APPROVE_AGENCY: '✅',
	REJECT_AGENCY: '❌',
	SUSPEND_AGENCY: '⏸',
	ACTIVATE_AGENCY: '▶',
	DELETE_AGENCY: '🗑',
};

const AuditLogPage: NextPage = () => {
	const ui = useUiLang();
	const [page, setPage] = useState(1);

	const { data } = useQuery(AUDIT_LOGS, {
		variables: { page, limit: LIMIT },
		fetchPolicy: 'network-only',
	});

	const logs: any[] = data?.auditLogs?.list ?? [];
	const total: number = data?.auditLogs?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / LIMIT));

	return (
		<div>
			<div className="page-title">{ui('Audit Log')}</div>
			<Box sx={{ mb: 1, color: '#888', fontSize: 13 }}>{ui('Total actions')}: <b>{total}</b></Box>

			<TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: '#f5f7fa' }}>
							<TableCell><b>{ui('Action')}</b></TableCell>
							<TableCell><b>{ui('Target')}</b></TableCell>
							<TableCell><b>{ui('Target Type')}</b></TableCell>
							<TableCell><b>{ui('Reason')}</b></TableCell>
							<TableCell><b>{ui('Date & Time')}</b></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{logs.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, color: '#aaa' }}>
									{ui('No actions recorded yet')}
								</TableCell>
							</TableRow>
						) : logs.map((log: any) => (
							<TableRow key={log._id} hover>
								<TableCell>
									<Chip
										label={ACTION_LABEL[log.action] ? `${ACTION_ICON[log.action]} ${ui(ACTION_LABEL[log.action])}` : log.action}
										size="small"
										color={ACTION_COLOR[log.action] ?? 'default'}
										sx={{ fontWeight: 600, fontSize: 12 }}
									/>
								</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>{log.targetName || log.targetId}</TableCell>
								<TableCell>
									<Chip
										label={ui(log.targetType)}
										size="small"
										variant="outlined"
										color={log.targetType === 'USER' ? 'primary' : 'warning'}
									/>
								</TableCell>
								<TableCell sx={{ fontSize: 12, color: '#666', maxWidth: 200 }}>
									{log.reason || '—'}
								</TableCell>
								<TableCell sx={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
									{new Date(log.createdAt).toLocaleString()}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" />
			</Box>
		</div>
	);
};

export default withLayoutAdmin(AuditLogPage);
