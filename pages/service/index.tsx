import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AppsIcon from '@mui/icons-material/Apps';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import {
	Stack,
	Box,
	Grid,
	Pagination,
	Select,
	MenuItem,
	FormControl,
	Button,
	Chip,
	Slider,
	Skeleton,
} from '@mui/material';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';
import withLayoutMain from '../../libs/components/layout/LayoutHome';
import ServiceCard from '../../libs/components/common/ServiceCard';
import AgencyCard from '../../libs/components/common/AgencyCard';
import { GET_AGENCIES, GET_SERVICES } from '../../apollo/user/query';
import { TOGGLE_LIKE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { ServiceType, ServiceSortField } from '../../libs/enums/service.enum';
import { SortDirection } from '../../libs/enums/common.enum';
import { LikeTargetType } from '../../libs/enums/like.enum';
import { Service } from '../../libs/types/service/service';
import { AgencySortField } from '../../libs/enums/agency.enum';
import { Agency } from '../../libs/types/agency/agency';
import { getServiceTypeLabel } from '../../libs/utils';
import { useUiLang } from '../../libs/utils/translations';

const serviceTypeOptions = [
	{ value: '', label: 'All Services', sub: 'Browse all', icon: <AppsIcon />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', shadow: 'rgba(99,102,241,0.3)' },
	{ value: ServiceType.VISA_SERVICES, label: 'Visa Services', sub: 'Documentation', icon: <BadgeIcon />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', shadow: 'rgba(245,158,11,0.3)' },
	{ value: ServiceType.STUDY_ABROAD, label: 'Study Abroad', sub: 'Education', icon: <SchoolIcon />, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', shadow: 'rgba(34,197,94,0.3)' },
	{ value: ServiceType.WORK_ABROAD, label: 'Work Abroad', sub: 'Career', icon: <WorkIcon />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', shadow: 'rgba(59,130,246,0.3)' },
	{ value: ServiceType.TRAVEL, label: 'Travel', sub: 'Explore world', icon: <FlightTakeoffIcon />, color: '#ec4899', bg: 'rgba(236,72,153,0.1)', shadow: 'rgba(236,72,153,0.3)' },
];

const heroBgMap: Record<string, string> = {
	[ServiceType.STUDY_ABROAD]: '/img/study-bg.jpg',
	[ServiceType.WORK_ABROAD]: '/img/work-bg.jpg',
	[ServiceType.TRAVEL]: '/img/travel-bg.jpg',
	[ServiceType.VISA_SERVICES]: '/img/visa-bg.jpg',
};

const heroTitleMap: Record<string, string> = {
	[ServiceType.STUDY_ABROAD]: 'Study Abroad Programs',
	[ServiceType.WORK_ABROAD]: 'Work Abroad Opportunities',
	[ServiceType.TRAVEL]: 'Travel Packages',
	[ServiceType.VISA_SERVICES]: 'Visa Services',
};

const ServiceList: NextPage = () => {
	const ui = useUiLang();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [search, setSearch] = useState('');
	const [serviceType, setServiceType] = useState('');
	const [country, setCountry] = useState('');
	const [sort, setSort] = useState(ServiceSortField.SERVICE_RANK);
	const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
	const [page, setPage] = useState(1);

	const pushServiceFilters = (filters: { type?: string; text?: string; country?: string }) => {
		const query: Record<string, string> = {};
		if (filters.type) query.type = filters.type;
		if (filters.text) query.text = filters.text;
		if (filters.country) query.country = filters.country;
		router.push({ pathname: '/service', query }, undefined, { shallow: true });
	};

	useEffect(() => {
		const type = typeof router.query.type === 'string' ? router.query.type : '';
		const text = typeof router.query.text === 'string' ? router.query.text : '';
		const queryCountry = typeof router.query.country === 'string' ? router.query.country : '';
		setServiceType(type);
		setSearch(text);
		setCountry(queryCountry);
		setPage(1);
	}, [router.query.type, router.query.text, router.query.country]);

	const { data, loading, refetch } = useQuery(GET_SERVICES, {
		variables: {
			input: {
				text: search || undefined,
				serviceType: serviceType || undefined,
				destinationCountry: country || undefined,
				minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
				maxPrice: priceRange[1],
				sort,
				direction: SortDirection.DESC,
				page,
				limit: 9,
			},
		},
	});

	const { data: agencyData, loading: agenciesLoading, refetch: refetchAgencies } = useQuery(GET_AGENCIES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				serviceType: serviceType || undefined,
				sort: AgencySortField.AGENCY_RANK,
				direction: SortDirection.DESC,
				page: 1,
				limit: 3,
			},
		},
	});

	const [toggleLike] = useMutation(TOGGLE_LIKE);

	const services: Service[] = data?.getServices?.list ?? [];
	const total: number = data?.getServices?.metaCounter?.[0]?.total ?? 0;
	const agencies: Agency[] = agencyData?.getAgencies?.list ?? [];

	const handleServiceLike = async (serviceId: string) => {
		if (!user?._id) { router.push('/account/join'); return; }
		await toggleLike({ variables: { targetId: serviceId, targetType: LikeTargetType.SERVICE } });
		refetch();
	};

	const handleAgencyLike = async (agencyId: string) => {
		if (!user?._id) { router.push('/account/join'); return; }
		await toggleLike({ variables: { targetId: agencyId, targetType: LikeTargetType.AGENCY } });
		refetchAgencies();
	};

	const resetFilters = () => {
		setSort(ServiceSortField.SERVICE_RANK);
		setPriceRange([0, 5000]);
		pushServiceFilters({});
	};

	const heroBg = heroBgMap[serviceType] || '/img/all-service-bg.jpg';
	const heroTitle = heroTitleMap[serviceType] || 'Explore services for every step of your journey';

	return (
		<div className="services-page">
			{/* Hero */}
			<div className="page-hero">
				<div className="hero-bg">
					<img key={heroBg} className="kb-1" src={heroBg} alt="" aria-hidden="true" />
				</div>
				<div className="hero-overlay service-overlay" />
				<Box className="hero-content">
					<div className="hero-badge">
						<VerifiedIcon style={{ fontSize: 14 }} />
						{ui(serviceType ? heroTitleMap[serviceType] : 'Curated migration services')}
					</div>
					<h1>{ui(heroTitle)}</h1>
					<p className="hero-subtitle">
						{serviceType === ServiceType.STUDY_ABROAD && ui('service.findTheBestStudyAbroad')}
						{serviceType === ServiceType.WORK_ABROAD && ui('service.discoverWorkAbroadOpportunitiesMatched')}
						{serviceType === ServiceType.TRAVEL && ui('service.exploreTravelPackagesAndGuided')}
						{serviceType === ServiceType.VISA_SERVICES && ui('service.professionalVisaAssistanceForEvery')}
						{!serviceType && ui('service.searchVisaStudyWorkAnd')}
					</p>
				</Box>
				<div className="scroll-indicator">
					<div className="scroll-dot" />
					<div className="scroll-dot" />
					<div className="scroll-dot" />
					<span className="scroll-text">{ui('agency.scroll')}</span>
				</div>
			</div>

			{/* Content */}
			<Stack className="container">
				<Box className="service-type-strip">
					{serviceTypeOptions.map((option) => (
						<button
							key={option.value}
							className={`type-tab${serviceType === option.value ? ' active' : ''}`}
							style={{ '--tab-color': option.color, '--tab-bg': option.bg, '--tab-shadow': option.shadow } as React.CSSProperties}
							onClick={() => pushServiceFilters({ type: option.value, text: search, country })}
						>
							<span className="type-tab-icon">{option.icon}</span>
							<span className="type-tab-body">
								<span className="type-tab-label">{ui(option.label)}</span>
								<span className="type-tab-sub">{ui(option.sub)}</span>
							</span>
						</button>
					))}
				</Box>

				<Box className="services-layout">
					<Box className="service-filter-panel">
						<Box className="panel-title">
							<TuneIcon />
							<span>{ui('service.filters')}</span>
						</Box>

						<label>{ui('common.sortBy')}</label>
						<FormControl fullWidth size="small">
							<Select value={sort} onChange={(event) => setSort(event.target.value as ServiceSortField)}>
								<MenuItem value={ServiceSortField.SERVICE_RANK}>{ui('service.topRanked')}</MenuItem>
								<MenuItem value={ServiceSortField.PRICE}>{ui('service.price')}</MenuItem>
								<MenuItem value={ServiceSortField.AVERAGE_RATING}>{ui('service.bestRated')}</MenuItem>
								<MenuItem value={ServiceSortField.CREATED_AT}>{ui('service.newestFirst')}</MenuItem>
							</Select>
						</FormControl>

						<label>{ui('service.priceRange')}</label>
						<Box className="price-label">${priceRange[0]} – ${priceRange[1]}</Box>
						<Slider
							value={priceRange}
							onChange={(_, value) => {
								setPriceRange(value as number[]);
								setPage(1);
							}}
							min={0}
							max={5000}
							step={100}
							valueLabelDisplay="auto"
						/>

						<Button fullWidth variant="outlined" onClick={resetFilters}>
							{ui('service.resetFilters')}
						</Button>
					</Box>

					<Box>
						<Box className="service-results-head">
							<Box>
								<span>{ui('service.serviceDirectory')}</span>
								<h2>{search ? `${ui('agency.resultsFor')} "${search}"` : ui('service.availableServices')}</h2>
								<p>{total} {ui('service.servicesFound')}</p>
							</Box>
							{search && <Chip label={search} onDelete={() => pushServiceFilters({ type: serviceType, country })} />}
						</Box>

						<Box className="related-agencies-panel">
							<Box className="related-agencies-head">
								<span>{serviceType ? ui(getServiceTypeLabel(serviceType)) : ui('service.verifiedPartners')}</span>
								<h2>{serviceType ? ui('service.agenciesForThisService') : ui('service.recommendedAgencies')}</h2>
								<p>{serviceType ? ui('service.verifiedAgenciesOfferingThisCategory') : ui('service.verifiedAgenciesAcrossAllService')}</p>
							</Box>
							{agenciesLoading ? (
								<Grid container spacing={2.5}>
									{Array.from({ length: 3 }).map((_, index) => (
										<Grid item xs={12} md={4} key={index}>
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
							) : agencies.length > 0 ? (
								<Grid container spacing={2.5}>
									{agencies.map((agency) => (
										<Grid item xs={12} md={4} key={agency._id}>
											<AgencyCard
												agency={agency}
												onClick={() => router.push(`/agency/${agency._id}`)}
												onLike={() => handleAgencyLike(agency._id)}
											/>
										</Grid>
									))}
								</Grid>
							) : (
								<Box className="related-agencies-empty">{ui('service.noVerifiedAgenciesFoundFor')}</Box>
							)}
						</Box>

						{loading ? (
							<Grid container spacing={2.5}>
								{Array.from({ length: 6 }).map((_, index) => (
									<Grid item xs={12} sm={6} lg={4} key={index}>
										<Box className="service-card" sx={{ p: 2.5 }}>
											<Skeleton height={24} width="40%" />
											<Skeleton height={32} />
											<Skeleton height={20} width="70%" />
											<Skeleton height={38} />
										</Box>
									</Grid>
								))}
							</Grid>
						) : services.length ? (
							<Grid container spacing={2.5}>
								{services.map((service) => (
									<Grid item xs={12} sm={6} lg={4} key={service._id}>
										<ServiceCard service={service} onClick={() => router.push(`/service/detail?id=${service._id}`)} onLike={() => handleServiceLike(service._id)} />
									</Grid>
								))}
							</Grid>
						) : (
							<Box className="empty-services">
								<SearchIcon />
								<h3>{ui('service.noServicesFound')}</h3>
								<p>{ui('service.tryAnotherKeywordServiceType')}</p>
								<Button variant="outlined" onClick={resetFilters}>
									{ui('service.clearFilters')}
								</Button>
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
					</Box>
				</Box>
			</Stack>
		</div>
	);
};

export default withLayoutMain(ServiceList);

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
