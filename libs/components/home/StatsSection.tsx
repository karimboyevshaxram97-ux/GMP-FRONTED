import React from 'react';
import { useUiLang } from '../../utils/translations';

const stats = [
	{ num: '500', suffix: '+', label: 'Trusted Agencies' },
	{ num: '50', suffix: '+', label: 'Countries Covered' },
	{ num: '10,000', suffix: '+', label: 'Happy Users' },
	{ num: '1,000', suffix: '+', label: 'Services Available' },
];

const StatsSection = () => {
	const ui = useUiLang();

	return (
		<section className="home-stats">
			<div className="container">
				<div className="home-stats__grid">
					{stats.map((s, i) => (
						<div key={i} className="stat-block">
							<div className="stat-block__num">
								{s.num}
								<span className="stat-block__accent">{s.suffix}</span>
							</div>
							<div className="stat-block__label">{ui(s.label)}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default StatsSection;
