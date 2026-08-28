import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Rating } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import { GET_AGENCIES } from '../../../apollo/user/query';
import AppPagination from '../common/AppPagination';
import { REACT_APP_API_URL } from '../../config';
import { useLang } from '../../utils/lang';
import { useUiLang } from '../../utils/translations';

const PAGE_LIMIT = 4;

// Deterministic gradient palette so each agency without an image looks distinct
const PLACEHOLDER_GRADIENTS = [
	'linear-gradient(135deg, #1649ff 0%, #4e7fff 100%)',
	'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
	'linear-gradient(135deg, #059669 0%, #6ee7b7 100%)',
	'linear-gradient(135deg, #db2777 0%, #fb7185 100%)',
	'linear-gradient(135deg, #ea580c 0%, #fbbf24 100%)',
	'linear-gradient(135deg, #0369a1 0%, #38bdf8 100%)',
];

const pickGradient = (key: string) => {
	let hash = 0;
	for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
	return PLACEHOLDER_GRADIENTS[hash % PLACEHOLDER_GRADIENTS.length];
};

// Bento joylashuv: chapda katta karta (profil tugmasi bilan), o'ngda 2 kichik
// karta + pastda bitta gorizontal karta. Sahifa almashganda ham shu tartib.
const FeaturedAgencies = () => {
	const tr = useLang();
	const ui = useUiLang();
	const [page, setPage] = useState(1);
	const [visible, setVisible] = useState(false);
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) setVisible(true);
			},
			{ threshold: 0.2 },
		);
		if (gridRef.current) observer.observe(gridRef.current);
		return () => observer.disconnect();
	}, []);

	const { data, previousData, loading } = useQuery(GET_AGENCIES, {
		fetchPolicy: 'cache-and-network',
		nextFetchPolicy: 'cache-first',
		variables: {
			input: {
				sort: 'AVERAGE_RATING',
				direction: 'DESC',
				page,
				limit: PAGE_LIMIT,
				status: 'ACTIVE',
				verificationStatus: 'VERIFIED',
			},
		},
	});

	const view = data ?? previousData;
	const agencies: any[] = view?.getAgencies?.list ?? [];
	const total: number = view?.getAgencies?.metaCounter?.[0]?.total ?? 0;
	const showSkeletons = loading && agencies.length === 0;

	const renderMedia = (agency: any) => (
		<div className="hfa-media">
			{agency.coverImage || agency.logo ? (
				<>
					<div
						className="hfa-media__backdrop"
						style={{ backgroundImage: `url(${REACT_APP_API_URL}/uploads/${agency.coverImage || agency.logo})` }}
					/>
					<img
						src={`${REACT_APP_API_URL}/uploads/${agency.coverImage || agency.logo}`}
						alt={tr(agency.name)}
						loading="lazy"
					/>
				</>
			) : (
				<div className="hfa-placeholder" style={{ background: pickGradient(agency._id || tr(agency.name)) }}>
					<span>{(tr(agency.name) || '?').charAt(0).toUpperCase()}</span>
				</div>
			)}
			{agency.verificationStatus === 'VERIFIED' && (
				<span className="hfa-verified">
					<VerifiedIcon /> {ui('admin.verified')}
				</span>
			)}
		</div>
	);

	// "tavsif · davlat · davlat" ko'rinishidagi bir qatorli meta
	const metaLine = (agency: any, withDescription: boolean) => {
		const parts: string[] = [];
		if (withDescription) {
			const description = tr(agency.description);
			if (description) parts.push(description);
		}
		parts.push(...(agency.operatingCountries?.slice(0, 2) ?? []));
		return parts.join(' · ') || ui('home.trustedMigrationAndTravelAgency');
	};

	const renderRating = (agency: any, suffix = '') => (
		<div className="hfa-rating">
			<Rating value={agency.averageRating ?? 0} readOnly size="small" precision={0.5} />
			<span>
				{(agency.averageRating ?? 0).toFixed(1)} ({agency.totalReviews ?? 0}){suffix}
			</span>
		</div>
	);

	const [featureAgency, smallOne, smallTwo, wideAgency] = agencies;

	return (
		<section className="home-featured-agencies">
			<div className="container">
				<div className="home-featured-agencies__header">
					<div className="header-left">
						<h2>{ui('home.topRatedAgencies')}</h2>
						<p>{ui('home.verifiedAndTrustedPartnersFor')}</p>
					</div>
					<Link href="/agency" className="view-all-link">
						{ui('home.viewAll')} <ArrowForwardIcon />
					</Link>
				</div>

				<div className={`home-featured-agencies__bento${visible ? ' in-view' : ''}`} ref={gridRef}>
					{showSkeletons ? (
						Array(4).fill(0).map((_, i) => <div key={i} className="agency-skeleton" />)
					) : (
						<>
							{featureAgency && (
								<Link href={`/agency/${featureAgency._id}`} className="hfa-card hfa-card--feature">
									{renderMedia(featureAgency)}
									<div className="hfa-body">
										<div className="hfa-name-row">
											<h3>{tr(featureAgency.name)}</h3>
											<span className="hfa-chip">
												{featureAgency.totalServices ?? 0} {ui('admin.services')}
											</span>
										</div>
										<div className="hfa-meta">{metaLine(featureAgency, true)}</div>
										{renderRating(featureAgency)}
										<span className="hfa-profile-btn">{ui('map.viewProfile')}</span>
									</div>
								</Link>
							)}

							{[smallOne, smallTwo].filter(Boolean).map((agency: any) => (
								<Link key={agency._id} href={`/agency/${agency._id}`} className="hfa-card hfa-card--small">
									{renderMedia(agency)}
									<div className="hfa-body">
										<div className="hfa-name-row">
											<h3>{tr(agency.name)}</h3>
										</div>
										<div className="hfa-meta">{metaLine(agency, false)}</div>
										{renderRating(agency)}
									</div>
								</Link>
							))}

							{wideAgency && (
								<Link href={`/agency/${wideAgency._id}`} className="hfa-card hfa-card--wide">
									{renderMedia(wideAgency)}
									<div className="hfa-body">
										<div className="hfa-name-row">
											<h3>{tr(wideAgency.name)}</h3>
										</div>
										<div className="hfa-meta">{metaLine(wideAgency, true)}</div>
										{renderRating(wideAgency, ` · ${wideAgency.totalServices ?? 0} ${ui('admin.services')}`)}
									</div>
								</Link>
							)}
						</>
					)}
				</div>

				{total > PAGE_LIMIT && (
					<Box className="home-featured-agencies__pagination">
						<AppPagination
							count={Math.ceil(total / PAGE_LIMIT)}
							page={page}
							onChange={(_, value) => setPage(value)}
						/>
					</Box>
				)}
			</div>
		</section>
	);
};

export default FeaturedAgencies;
