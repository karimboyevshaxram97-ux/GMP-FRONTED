import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	Stack,
	Box,
	Grid,
	Pagination,
	Select,
	MenuItem,
	InputLabel,
	FormControl,
	Button,
	Chip,
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

	const handleSortChange = (value: AgencySortField) => {
		setSort(value);
		setPage(1);
	};

	const clearSearch = () => {
		setSearch('');
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
						{ui('agency.verifiedAgencyMarketplace')}
					</div>
					<h1>{ui('agency.findTheRightMigration')}<br />{ui('agency.agencyWithConfidence')}</h1>
					<p className="hero-subtitle">
						{ui('agency.compareTrustedAgenciesByReviews')}
					</p>
				</Box>
				<div className="scroll-indicator">
					<div className="scroll-dot" />
					<div className="scroll-dot" />
					<div className="scroll-dot" />
					<span className="scroll-text">{ui('agency.scroll')}</span>
				</div>
			</div>

			{/* Content below hero */}
			<Stack className="container">
				{featuredAgencies.length > 0 && !search && (
					<Box className="featured-strip">
						<Box className="section-heading">
							<span>{ui('agency.recommendedFirst')}</span>
							<h2>{ui('agency.topVerifiedAgencies')}</h2>
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
						<span className="eyebrow">{ui('agency.agencyDirectory')}</span>
						<h2>{search ? `${ui('agency.resultsFor')} "${search}"` : ui('agency.allVerifiedAgencies')}</h2>
						<p>{total} {ui('agency.agenciesFound')}</p>
					</Box>
					<Box className="toolbar-actions">
						{search && <Chip label={search} onDelete={clearSearch} />}
						<Chip icon={<VerifiedIcon />} label={ui('agency.verifiedOnly')} className="verified-filter" />
						<Button
							variant="outlined"
							startIcon={<MapIcon />}
							onClick={() => router.push('/agency/map')}
							sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', borderColor: '#1649ff', color: '#1649ff', '&:hover': { background: '#f0f4ff' } }}
						>
							{ui('agency.mapView')}
						</Button>
						<FormControl size="small" sx={{ minWidth: 190 }}>
							<InputLabel>{ui('common.sortBy')}</InputLabel>
							<Select
								value={sort}
								label={ui('common.sortBy')}
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
								<h3>{ui('agency.noAgenciesFound')}</h3>
								<p>{ui('agency.tryAnotherKeywordOrClear')}</p>
								{search && (
									<Button variant="outlined" onClick={clearSearch}>
										{ui('agency.clearSearch')}
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

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
