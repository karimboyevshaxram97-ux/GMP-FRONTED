import React from 'react';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { useUiLang } from '../../utils/translations';

const CtaBanner = () => {
	const ui = useUiLang();

	return (
		<section className="home-cta">
			<div className="container">
				<div className="home-cta__tag">{ui('home.joinGmpToday')}</div>
				<h2>
					{ui('home.readyToStartYour')}<br />
					{ui('home.globalJourney')}
				</h2>
				<p>
					{ui('home.whetherYoureATravelerSeeking')}
				</p>
				<div className="home-cta__actions">
					<Link href="/account/join">
						<button className="cta-btn cta-btn--white">
							{ui('home.getStartedFree')} <ArrowForwardIcon />
						</button>
					</Link>
					<Link href="/agency">
						<button className="cta-btn cta-btn--outline">
							<BusinessOutlinedIcon /> {ui('home.browseAgencies')}
						</button>
					</Link>
				</div>
			</div>
		</section>
	);
};

export default CtaBanner;
