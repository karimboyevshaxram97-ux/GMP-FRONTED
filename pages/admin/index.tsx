import React from 'react';
import { NextPage } from 'next';
import { Box, Grid, Divider } from '@mui/material';
import { useQuery } from '@apollo/client';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import RateReviewIcon from '@mui/icons-material/RateReview';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import {
	PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
	BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from 'recharts';
import { PLATFORM_STATS } from '../../apollo/admin/query';
import withLayoutAdmin from '../../libs/components/layout/LayoutAdmin';
import { useUiLang } from '../../libs/utils/translations';

const CustomTooltip = ({ active, payload }: any) => {
	if (!active || !payload?.length) return null;
	const d = payload[0].payload;
	return (
		<div style={{
			background: '#fff',
			border: '1px solid #e8edf5',
			borderRadius: 10,
			padding: '8px 14px',
			boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
			fontSize: 13,
		}}>
			<div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{d.label}</div>
			<div style={{ color: d.color, fontWeight: 800, fontSize: 18 }}>{d.value.toLocaleString()}</div>
		</div>
	);
};

const AdminDashboard: NextPage = () => {
	const ui = useUiLang();
	const { data: statsData } = useQuery(PLATFORM_STATS);
	const stats = statsData?.platformStats;

	const cards = [
		{ label: 'Total Users',           short: 'Users',    value: stats?.totalUsers ?? 0,                 color: '#1649ff', bg: '#eef3ff', icon: <PeopleIcon /> },
		{ label: 'Total Agencies',         short: 'Agencies', value: stats?.totalAgencies ?? 0,              color: '#0d9488', bg: '#f0fdfa', icon: <BusinessIcon /> },
		{ label: 'Total Services',         short: 'Services', value: stats?.totalServices ?? 0,              color: '#c37200', bg: '#fff8e1', icon: <MiscellaneousServicesIcon /> },
		{ label: 'Applications',           short: 'Apps',     value: stats?.totalApplications ?? 0,          color: '#6b21a8', bg: '#f3e8ff', icon: <AssignmentIcon /> },
		{ label: 'Reviews',                short: 'Reviews',  value: stats?.totalReviews ?? 0,               color: '#0369a1', bg: '#e0f2fe', icon: <RateReviewIcon /> },
		{ label: 'Active Subscriptions',   short: 'Subscr.',  value: stats?.activeSubscriptions ?? 0,        color: '#247a3d', bg: '#eaf8ee', icon: <WorkspacePremiumIcon /> },
		{ label: 'Pending Verifications',  short: 'Verif.',   value: stats?.pendingAgencyVerifications ?? 0, color: '#dc2626', bg: '#fef2f2', icon: <PendingActionsIcon /> },
	];

	const total = cards.reduce((s, c) => s + c.value, 0);

	const DonutCenter = ({ viewBox }: any) => {
		const { cx, cy } = viewBox ?? {};
		return (
			<g>
				<text x={cx} y={cy - 8} textAnchor="middle" fontSize="30" fontWeight="900" fill="#0f172a" fontFamily="inherit">
					{total.toLocaleString()}
				</text>
				<text x={cx} y={cy + 13} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="inherit">
					{ui('admin.totalRecords')}
				</text>
			</g>
		);
	};

	return (
		<div>
			<div className="page-title">{ui('admin.dashboard')}</div>

			{/* Stat cards */}
			<Grid container spacing={2} sx={{ mb: 4 }}>
				{cards.map((card) => (
					<Grid item xs={12} sm={6} md={4} key={card.label}>
						<Box className="admin-stat-card">
							<Box className="stat-icon-wrap" style={{ background: card.bg, color: card.color }}>
								{card.icon}
							</Box>
							<Box className="stat-body">
								<div className="stat-value">{card.value.toLocaleString()}</div>
								<div className="stat-label">{ui(card.label)}</div>
							</Box>
						</Box>
					</Grid>
				))}
			</Grid>

			<Divider sx={{ mb: 3 }} />

			{/* Charts */}
			<Grid container spacing={3}>

				{/* Left — Bar chart */}
				<Grid item xs={12} md={7}>
					<Box className="admin-chart-card">
						<div className="chart-title">{ui('admin.platformStatistics')}</div>
						<ResponsiveContainer width="100%" height={290}>
							<BarChart data={cards} margin={{ top: 10, right: 30, left: -16, bottom: 0 }} barCategoryGap="30%">
								<defs>
									{cards.map((c, i) => (
										<linearGradient key={i} id={`bg${i}`} x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor={c.color} stopOpacity={0.95} />
											<stop offset="100%" stopColor={c.color} stopOpacity={0.55} />
										</linearGradient>
									))}
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
								<XAxis
									dataKey="short"
									tick={{ fontSize: 11.5, fill: '#64748b', fontWeight: 600 }}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									tick={{ fontSize: 11, fill: '#94a3b8' }}
									axisLine={false}
									tickLine={false}
									allowDecimals={false}
								/>
								<Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(22,73,255,0.04)', radius: 8 }} />
								<Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={52}>
									{cards.map((_, i) => (
										<Cell key={i} fill={`url(#bg${i})`} />
									))}
									<LabelList
										dataKey="value"
										position="top"
										style={{ fontSize: 12, fontWeight: 800, fill: '#374151' }}
									/>
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</Box>
				</Grid>

				{/* Right — Donut */}
				<Grid item xs={12} md={5}>
					<Box className="admin-chart-card" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
						<div className="chart-title">{ui('admin.distribution')}</div>
						<ResponsiveContainer width="100%" height={220}>
							<PieChart>
								<defs>
									{cards.map((c, i) => (
										<linearGradient key={i} id={`pg${i}`} x1="0" y1="0" x2="1" y2="1">
											<stop offset="0%" stopColor={c.color} stopOpacity={1} />
											<stop offset="100%" stopColor={c.color} stopOpacity={0.65} />
										</linearGradient>
									))}
								</defs>
								<Pie
									data={cards}
									dataKey="value"
									nameKey="label"
									cx="50%"
									cy="50%"
									innerRadius={65}
									outerRadius={95}
									paddingAngle={3}
									labelLine={false}
									label={DonutCenter}
								>
									{cards.map((_, i) => (
										<Cell key={i} fill={`url(#pg${i})`} stroke="none" />
									))}
								</Pie>
								<Tooltip
									formatter={(v: any, n: any) => [v.toLocaleString(), n]}
									contentStyle={{ borderRadius: 10, border: '1px solid #e8edf5', fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
								/>
							</PieChart>
						</ResponsiveContainer>
						<div className="donut-legend">
							{cards.map((c) => (
								<div key={c.label} className="dl-item">
									<span className="dl-dot" style={{ background: c.color }} />
									<span className="dl-name">{ui(c.short)}</span>
									<span className="dl-val" style={{ color: c.color }}>{c.value}</span>
								</div>
							))}
						</div>
					</Box>
				</Grid>

			</Grid>
		</div>
	);
};

export default withLayoutAdmin(AdminDashboard);

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
