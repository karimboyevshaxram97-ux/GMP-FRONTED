import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import StarIcon from '@mui/icons-material/Star';
import { GET_AGENCIES } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { useLang } from '../../utils/lang';
import { useUiLang } from '../../utils/translations';

const TopAgenciesSection = () => {
	const tr = useLang();
	const ui = useUiLang();
	const [visible, setVisible] = useState(false);
	const gridRef = useRef<HTMLDivElement>(null);

	const { data } = useQuery(GET_AGENCIES, {
		fetchPolicy: 'cache-and-network',
		nextFetchPolicy: 'cache-first',
		variables: {
			input: {
				sort: 'CREATED_AT',
				direction: 'DESC',
				page: 1,
				limit: 12,
				status: 'ACTIVE',
				verificationStatus: 'VERIFIED',
			},
		},
	});

	const agencies: any[] = (data?.getAgencies?.list ?? [])
		.filter((agency: any) => agency.logo || agency.coverImage)
		.slice(0, 5);

	// agencies bo'sh bo'lganda (dastlabki render) grid hali chizilmagan bo'ladi,
	// shuning uchun ma'lumot kelib grid paydo bo'lgach effektni qayta ishga tushiramiz.
	useEffect(() => {
		if (!gridRef.current) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) setVisible(true);
			},
			{ threshold: 0.2 },
		);
		observer.observe(gridRef.current);
		return () => observer.disconnect();
	}, [agencies.length]);

	if (agencies.length === 0) return null;

	return (
		<section className="top-agencies">
			<div className="container">
				<div className="top-agencies__head">
					<h2>{ui('home.top5Agencies')}</h2>
					<p>{ui('home.theHighestRatedAgenciesTrusted')}</p>
				</div>

				<div className={`top-agencies__grid${visible ? ' in-view' : ''}`} ref={gridRef}>
					{agencies.map((agency) => {
						const name = tr(agency.name) || ui('auth.agency');
						const image = agency.logo || agency.coverImage;
						const rating = agency.averageRating ?? agency.memberData?.memberRank ?? null;

						return (
							<Link
								key={agency._id}
								href={`/agency/${agency._id}`}
								className="top-agency-card"
								title={name}
							>
								<img src={`${REACT_APP_API_URL}/uploads/${image}`} alt={name} />
								<div className="top-agency-card__overlay">
									{rating != null && (
										<span className="top-agency-card__rating">
											<StarIcon /> {Number(rating).toFixed(1)}
										</span>
									)}
									<strong className="top-agency-card__name">{name}</strong>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default TopAgenciesSection;
