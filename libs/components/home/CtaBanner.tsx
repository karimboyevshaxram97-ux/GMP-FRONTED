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
				<div className="home-cta__tag">{ui('Join GMP Today')}</div>
				<h2>
					{ui('Ready to Start Your')}<br />
					{ui('Global Journey?')}
				</h2>
				<p>
					{ui("Whether you're a traveler seeking new horizons or an agency wanting to reach thousands of clients — GMP is the platform where opportunity meets ambition.")}
				</p>
				<div className="home-cta__actions">
					<Link href="/account/join">
						<button className="cta-btn cta-btn--white">
							{ui('Get Started Free')} <ArrowForwardIcon />
						</button>
					</Link>
					<Link href="/agency">
						<button className="cta-btn cta-btn--outline">
							<BusinessOutlinedIcon /> {ui('Browse Agencies')}
						</button>
					</Link>
				</div>
			</div>
		</section>
	);
};

export default CtaBanner;
