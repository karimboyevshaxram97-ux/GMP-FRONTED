import React, { useState } from 'react';
import { useRouter } from 'next/router';
import SearchIcon from '@mui/icons-material/Search';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import { useUiLang } from '../../utils/translations';
import AiSearchAssistant from './AiSearchAssistant';

const SearchSection = () => {
	const ui = useUiLang();
	const router = useRouter();
	const [keyword, setKeyword] = useState('');
	const [type, setType] = useState('');
	const [country, setCountry] = useState('');

	const handleSearch = () => {
		const params = new URLSearchParams();
		if (keyword) params.set('text', keyword);
		if (type) params.set('type', type);
		if (country) params.set('country', country);
		const query = params.toString();
		router.push(query ? `/service?${query}` : '/service');
	};

	return (
		<div className="home-search">
			<div className="container">
				<div className="home-search__card">
					<div className="home-search__input-wrap">
						<SearchIcon />
						<input
							placeholder={ui('Search services, agencies...')}
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
						/>
						<AiSearchAssistant />
					</div>

					<div className="home-search__select">
						<CategoryOutlinedIcon />
						<select value={type} onChange={(e) => setType(e.target.value)}>
							<option value="">{ui('All Services')}</option>
							<option value="STUDY_ABROAD">{ui('Study Abroad')}</option>
							<option value="WORK_ABROAD">{ui('Work Abroad')}</option>
							<option value="TRAVEL">{ui('Travel')}</option>
							<option value="VISA_SERVICES">{ui('Visa Services')}</option>
						</select>
					</div>

					<div className="home-search__select">
						<PublicOutlinedIcon />
						<select value={country} onChange={(e) => setCountry(e.target.value)}>
							<option value="">{ui('All Countries')}</option>
							<option value="United States">{ui('United States')}</option>
							<option value="United Kingdom">{ui('United Kingdom')}</option>
							<option value="Germany">{ui('Germany')}</option>
							<option value="Canada">{ui('Canada')}</option>
							<option value="Australia">{ui('Australia')}</option>
							<option value="South Korea">{ui('South Korea')}</option>
							<option value="Japan">{ui('Japan')}</option>
							<option value="UAE">{ui('UAE')}</option>
						</select>
					</div>

					<button className="home-search__btn" onClick={handleSearch}>
						<SearchIcon /> {ui('Search')}
					</button>
				</div>
			</div>
		</div>
	);
};

export default SearchSection;
