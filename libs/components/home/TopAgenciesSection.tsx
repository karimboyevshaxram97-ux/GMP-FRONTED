import React from 'react';
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
	const { data } = useQuery(GET_AGENCIES, {
		fetchPolicy: 'cache-and-network',
		nextFetchPolicy: 'cache-first',
		variables: {
			input: {
				sort: 'AVERAGE_RATING',
				direction: 'DESC',
				page: 1,
				limit: 12,
				status: 'ACTIVE',
				verificationStatus: 'VERIFIED',
			},
		},
	});

	const agencies: any[] = (data?.getAgencies?.list ?? [])
		.filter((agency: any) => agency.coverImage || agency.logo)
		.slice(0, 5);

	if (agencies.length === 0) return null;

	return (
		<section className="top-agencies">
			<div className="container">
				<div className="top-agencies__head">
					<span className="top-agencies__tag">{ui('Verified Partners')}</span>
					<h2>{ui('Top 5 Agencies')}</h2>
					<p>{ui('The highest-rated agencies trusted by the GMP community.')}</p>
				</div>

				<div className="top-agencies__grid">
					{agencies.map((agency, idx) => {
						const name = tr(agency.name) || ui('Agency');
						const image = agency.coverImage || agency.logo;
						const rating = agency.averageRating ?? agency.memberData?.memberRank ?? null;

						return (
							<Link
								key={agency._id}
								href={`/agency/${agency._id}`}
								className="top-agency-card"
								title={name}
							>
								<div className="top-agency-card__avatar">
									<span className="top-agency-card__rank">{idx + 1}</span>
									<img src={`${REACT_APP_API_URL}/uploads/${image}`} alt={name} />
								</div>
								<strong className="top-agency-card__name">{name}</strong>
								{rating != null && (
									<span className="top-agency-card__rating">
										<StarIcon /> {Number(rating).toFixed(1)}
									</span>
								)}
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default TopAgenciesSection;
