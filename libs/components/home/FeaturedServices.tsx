import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Rating } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { GET_SERVICES } from '../../../apollo/user/query';
import { serviceTypeLabels } from '../../config';
import { useLang } from '../../utils/lang';
import { useUiLang } from '../../utils/translations';

const FeaturedServices = () => {
	const tr = useLang();
	const ui = useUiLang();
	const { data, loading } = useQuery(GET_SERVICES, {
		variables: {
			input: {
				sort: 'AVERAGE_RATING',
				direction: 'DESC',
				page: 1,
				limit: 4,
				status: 'ACTIVE',
			},
		},
	});

	const services: any[] = data?.getServices?.list ?? [];

	return (
		<section className="home-featured-services">
			<div className="container">
				<div className="home-featured-services__header">
					<div className="header-left">
						<h2>{ui('Popular Services')}</h2>
						<p>{ui('Hand-picked top-rated services to get you started')}</p>
					</div>
					<Link href="/service" className="view-all-link">
						{ui('View All')} <ArrowForwardIcon />
					</Link>
				</div>

				<div className="home-featured-services__grid">
					{loading
						? Array(4).fill(0).map((_, i) => (
							<div key={i} className="service-card">
								<div className="service-card-body" style={{ gap: 12 }}>
									<div style={{ height: 28, background: '#f0f4ff', borderRadius: 100, width: 110 }} />
									<div style={{ height: 18, background: '#f0f4ff', borderRadius: 6 }} />
									<div style={{ height: 14, background: '#f0f4ff', borderRadius: 6, width: '70%' }} />
								</div>
							</div>
						))
						: services.map((service) => (
							<Link key={service._id} href={`/service/detail?id=${service._id}`} style={{ textDecoration: 'none' }}>
								<div className="service-card">
									<div className="service-card-body">
										<span className="service-type-badge">
											{ui(serviceTypeLabels[service.serviceType] ?? service.serviceType)}
										</span>
										<p className="service-name">{tr(service.name)}</p>
										{service.destinationCountry && (
											<div className="service-meta">
												<LocationOnOutlinedIcon className="meta-icon" />
												{service.destinationCountry}
											</div>
										)}
										{service.processingTime && (
											<div className="service-meta">
												<AccessTimeOutlinedIcon className="meta-icon" />
												{service.processingTime}
											</div>
										)}
										<div className="service-rating-row">
											<Rating value={service.averageRating ?? 0} readOnly size="small" precision={0.5} />
											<span className="review-count">({service.totalReviews})</span>
										</div>
									</div>
									<div className="service-footer">
										<div className="service-price">
											{service.price ? `$${service.price.toLocaleString()}` : ui('Contact Us')}
										</div>
										<span className="service-arrow">
											<ArrowForwardIcon />
										</span>
									</div>
								</div>
							</Link>
						))}
				</div>
			</div>
		</section>
	);
};

export default FeaturedServices;
