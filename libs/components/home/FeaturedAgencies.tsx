import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Rating } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import { GET_AGENCIES } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { useLang } from '../../utils/lang';
import { useUiLang } from '../../utils/translations';

const FeaturedAgencies = () => {
	const tr = useLang();
	const ui = useUiLang();
	const { data, loading } = useQuery(GET_AGENCIES, {
		fetchPolicy: 'cache-and-network',
		nextFetchPolicy: 'cache-first',
		variables: {
			input: {
				sort: 'AVERAGE_RATING',
				direction: 'DESC',
				page: 1,
				limit: 4,
				status: 'ACTIVE',
				verificationStatus: 'VERIFIED',
			},
		},
	});

	const agencies: any[] = data?.getAgencies?.list ?? [];

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

				<div className="home-featured-agencies__grid">
					{loading
						? Array(4).fill(0).map((_, i) => (
							<div key={i} className="agency-skeleton">
								<div className="sk-img" />
								<div className="sk-body">
									<div className="sk-line" />
									<div className="sk-line" style={{ width: '75%' }} />
									<div className="sk-line-sm" />
								</div>
							</div>
						))
						: agencies.map((agency) => (
							<Link key={agency._id} href={`/agency/${agency._id}`} style={{ textDecoration: 'none' }}>
								<div className="agency-card">
									<div className="card-image">
										{agency.coverImage || agency.logo ? (
											<img
												src={`${REACT_APP_API_URL}/uploads/${agency.coverImage || agency.logo}`}
												alt={tr(agency.name)}
											/>
										) : (
											<div
												className="card-image__placeholder"
												style={{ background: pickGradient(agency._id || tr(agency.name)) }}
											>
												<span>{(tr(agency.name) || '?').charAt(0).toUpperCase()}</span>
											</div>
										)}
										{agency.verificationStatus === 'VERIFIED' && (
											<div className="verified-badge">
												<VerifiedIcon style={{ fontSize: 13, marginRight: 3 }} />
												{ui('admin.verified')}
											</div>
										)}
									</div>
									<div className="card-body">
										<div className="agency-title-row">
											<h3>{tr(agency.name)}</h3>
											<span>{agency.totalServices} {ui('admin.services')}</span>
										</div>
										<p className="agency-description">
											{tr(agency.description) || ui('home.trustedMigrationAndTravelAgency')}
										</p>
										{agency.operatingCountries?.length > 0 && (
											<div className="country-row">
												<LocationOnOutlinedIcon />
												{agency.operatingCountries.slice(0, 3).join(', ')}
											</div>
										)}
										<div className="rating-row">
											<Rating value={agency.averageRating ?? 0} readOnly size="small" precision={0.5} />
											<span>{(agency.averageRating ?? 0).toFixed(1)} ({agency.totalReviews})</span>
										</div>
										<div className="card-actions">
											<button className="profile-button" style={{ marginLeft: 'auto', background: 'none', border: '1px solid #1649ff', color: '#1649ff', borderRadius: 8, padding: '5px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
												{ui('map.viewProfile')}
											</button>
										</div>
									</div>
								</div>
							</Link>
						))}
				</div>
			</div>
		</section>
	);
};

export default FeaturedAgencies;
