import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	Stack,
	Box,
	Grid,
	Pagination,
	TextField,
	Select,
	MenuItem,
	InputLabel,
	FormControl,
	Button,
	Chip,
	InputAdornment,
	Skeleton,
} from '@mui/material';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import MapIcon from '@mui/icons-material/Map';
import withLayoutMain from '../../libs/components/layout/LayoutHome';
import AgencyCard from '../../libs/components/common/AgencyCard';
import { GET_AGENCIES } from '../../apollo/user/query';
import { TOGGLE_LIKE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { Agency } from '../../libs/types/agency/agency';
import { AgencyVerificationStatus, AgencySortField } from '../../libs/enums/agency.enum';
import { SortDirection } from '../../libs/enums/common.enum';
import { LikeTargetType } from '../../libs/enums/like.enum';
import { useUiLang } from '../../libs/utils/translations';

const sortOptions = [
	{ label: 'Top ranked', value: AgencySortField.AGENCY_RANK },
	{ label: 'Most services', value: AgencySortField.TOTAL_SERVICES },
	{ label: 'Best rating', value: AgencySortField.AVERAGE_RATING },
	{ label: 'Newest agencies', value: AgencySortField.CREATED_AT },
];

const AgencyHome: NextPage = () => {
	const ui = useUiLang();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [search, setSearch] = useState('');
	const [inputValue, setInputValue] = useState('');
	const [sort, setSort] = useState(AgencySortField.AGENCY_RANK);
	const [page, setPage] = useState(1);

	const { data: featuredData, refetch: refetchFeatured } = useQuery(GET_AGENCIES, {
		fetchPolicy: 'cache-and-network',
		nextFetchPolicy: 'cache-first',
		variables: {
			input: {
				verificationStatus: AgencyVerificationStatus.VERIFIED,
				sort: AgencySortField.AGENCY_RANK,
				direction: SortDirection.DESC,
				page: 1,
				limit: 3,
			},
		},
	});

	const { data, loading, refetch } = useQuery(GET_AGENCIES, {
		fetchPolicy: 'cache-and-network',
		nextFetchPolicy: 'cache-first',
		variables: {
			input: {
				text: search || undefined,
				verificationStatus: AgencyVerificationStatus.VERIFIED,
				sort,
				direction: SortDirection.DESC,
				page,
				limit: 9,
			},
		},
	});

	const [toggleLike] = useMutation(TOGGLE_LIKE);

	const featuredAgencies: Agency[] = featuredData?.getAgencies?.list ?? [];
	const agencies: Agency[] = useMemo(() => data?.getAgencies?.list ?? [], [data?.getAgencies?.list]);
	const total: number = data?.getAgencies?.metaCounter?.[0]?.total ?? 0;

	const handleAgencyLike = async (agencyId: string) => {
		if (!user?._id) { router.push('/account/join'); return; }
		await toggleLike({ variables: { targetId: agencyId, targetType: LikeTargetType.AGENCY } });
		refetch();
		refetchFeatured();
	};

	const visibleCountries = useMemo(() => {
		const countries = new Set<string>();
		agencies.forEach((agency) => agency.operatingCountries?.forEach((country) => countries.add(country)));
		return countries.size;
	}, [agencies]);

	const averageRating = useMemo(() => {
		const ratedAgencies = agencies.filter((agency) => agency.averageRating > 0);
		if (!ratedAgencies.length) return '0.0';
		const totalRating = ratedAgencies.reduce((sum, agency) => sum + agency.averageRating, 0);
		return (totalRating / ratedAgencies.length).toFixed(1);
	}, [agencies]);

	const handleSearch = (event: React.FormEvent) => {
		event.preventDefault();
		setSearch(inputValue.trim());
		setPage(1);
	};

	const handleSortChange = (value: AgencySortField) => {
		setSort(value);
		setPage(1);
	};

	const clearSearch = () => {
		setSearch('');
		setInputValue('');
		setPage(1);
	};

	const goToAgency = (id: string) => router.push(`/agency/${id}`);

	return (
		<div className="agencies-page">
			{/* Ken Burns Hero */}
			<div className="page-hero">
				<div className="hero-bg">
					<img
						className="kb-1"
						src="/img/hero-bg.jpg"
						alt=""
						aria-hidden="true"
					/>
				</div>
				<div className="hero-overlay" />
				<Box className="hero-content">
					<div className="hero-badge">
						<VerifiedIcon style={{ fontSize: 14 }} />
						{ui('Verified agency marketplace')}
					</div>
					<h1>{ui('Find the right migration')}<br />{ui('agency with confidence')}</h1>
					<p className="hero-subtitle">
						{ui('Compare trusted agencies by reviews, services, countries, and profile details before you start your journey.')}
					</p>
					<Box component="form" className="agency-hero-search" onSubmit={handleSearch}>
						<TextField
							fullWidth
							placeholder={ui('Search by agency name or country...')}
							value={inputValue}
							onChange={(event) => setInputValue(event.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							}}
						/>
						<Button type="submit" variant="contained" size="large">
							{ui('Search')}
						</Button>
					</Box>
					<Box className="hero-stats">
						<div className="stat-item">
							<div className="number">{total || '100'}+</div>
							<div className="label">{ui('Agencies listed')}</div>
						</div>
						<div className="stat-divider" />
						<div className="stat-item">
							<div className="number">{visibleCountries || '40'}+</div>
							<div className="label">{ui('Countries covered')}</div>
						</div>
						<div className="stat-divider" />
						<div className="stat-item">
							<div className="number">{averageRating}</div>
							<div className="label">{ui('Average rating')}</div>
						</div>
					</Box>
				</Box>
				<div className="scroll-indicator">
					<div className="scroll-dot" />
					<div className="scroll-dot" />
					<div className="scroll-dot" />
					<span className="scroll-text">{ui('Scroll')}</span>
				</div>
			</div>

			{/* Content below hero */}
			<Stack className="container">
				{featuredAgencies.length > 0 && !search && (
					<Box className="featured-strip">
						<Box className="section-heading">
							<span>{ui('Recommended first')}</span>
							<h2>{ui('Top verified agencies')}</h2>
						</Box>
						<Grid container spacing={2.5}>
							{featuredAgencies.map((agency) => (
								<Grid item xs={12} md={4} key={agency._id}>
									<AgencyCard agency={agency} onClick={() => goToAgency(agency._id)} onLike={() => handleAgencyLike(agency._id)} />
								</Grid>
							))}
						</Grid>
					</Box>
				)}

				<Box className="agency-toolbar">
					<Box>
						<span className="eyebrow">{ui('Agency directory')}</span>
						<h2>{search ? `${ui('Results for')} "${search}"` : ui('All verified agencies')}</h2>
						<p>{total} {ui('agencies found')}</p>
					</Box>
					<Box className="toolbar-actions">
						{search && <Chip label={search} onDelete={clearSearch} />}
						<Chip icon={<VerifiedIcon />} label={ui('Verified only')} className="verified-filter" />
						<Button
							variant="outlined"
							startIcon={<MapIcon />}
							onClick={() => router.push('/agency/map')}
							sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', borderColor: '#1649ff', color: '#1649ff', '&:hover': { background: '#f0f4ff' } }}
						>
							{ui('Map View')}
						</Button>
						<FormControl size="small" sx={{ minWidth: 190 }}>
							<InputLabel>{ui('Sort by')}</InputLabel>
							<Select
								value={sort}
								label={ui('Sort by')}
								onChange={(event) => handleSortChange(event.target.value as AgencySortField)}
							>
								{sortOptions.map((option) => (
									<MenuItem key={option.value} value={option.value}>
										{ui(option.label)}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</Box>

				{loading ? (
					<Grid container spacing={2.5}>
						{Array.from({ length: 6 }).map((_, index) => (
							<Grid item xs={12} sm={6} lg={4} key={index}>
								<Box className="agency-card">
									<Skeleton variant="rectangular" className="card-image" />
									<Box className="card-body">
										<Skeleton height={28} width="70%" />
										<Skeleton height={18} width="95%" />
										<Skeleton height={18} width="55%" />
									</Box>
								</Box>
							</Grid>
						))}
					</Grid>
				) : (
					<>
						{agencies.length > 0 ? (
							<Grid container spacing={2.5}>
								{agencies.map((agency) => (
									<Grid item xs={12} sm={6} lg={4} key={agency._id}>
										<AgencyCard agency={agency} onClick={() => goToAgency(agency._id)} onLike={() => handleAgencyLike(agency._id)} />
									</Grid>
								))}
							</Grid>
						) : (
							<Box className="empty-agencies">
								<SearchIcon />
								<h3>{ui('No agencies found')}</h3>
								<p>{ui('Try another keyword or clear the current search.')}</p>
								{search && (
									<Button variant="outlined" onClick={clearSearch}>
										{ui('Clear search')}
									</Button>
								)}
							</Box>
						)}

						{total > 9 && (
							<Box className="pagination-box">
								<Pagination
									count={Math.ceil(total / 9)}
									page={page}
									onChange={(_, value) => setPage(value)}
									color="primary"
								/>
							</Box>
						)}
					</>
				)}
			</Stack>
		</div>
	);
};

export default withLayoutMain(AgencyHome);
