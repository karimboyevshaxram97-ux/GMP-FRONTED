import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
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

	const serviceOptions = [
		{ value: '', label: ui('footer.allServices') },
		{ value: 'STUDY_ABROAD', label: ui('mypage.studyAbroad') },
		{ value: 'WORK_ABROAD', label: ui('mypage.workAbroad') },
		{ value: 'TRAVEL', label: ui('mypage.travel') },
		{ value: 'VISA_SERVICES', label: ui('mypage.visaServices') },
	];

	const countryOptions = [
		{ value: '', label: ui('home.allCountries') },
		{ value: 'United States', label: ui('home.unitedStates') },
		{ value: 'United Kingdom', label: ui('home.unitedKingdom') },
		{ value: 'Germany', label: ui('home.germany') },
		{ value: 'Canada', label: ui('home.canada') },
		{ value: 'Australia', label: ui('home.australia') },
		{ value: 'South Korea', label: ui('home.southKorea') },
		{ value: 'Japan', label: ui('home.japan') },
		{ value: 'UAE', label: ui('enum.UAE') },
	];

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
				<div className="home-search__row">
					<div className="home-search__ai-launch">
						<AiSearchAssistant />
					</div>
					<div className="home-search__card">
						<div className="home-search__input-wrap">
							<SearchIcon />
							<input
								placeholder={ui('home.searchServicesAgencies')}
								value={keyword}
								onChange={(e) => setKeyword(e.target.value)}
								onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
							/>
						</div>

						<div className="home-search__select">
						<CategoryOutlinedIcon />
						<Select
							className="home-search__mui-select"
							value={type}
							onChange={(e: SelectChangeEvent) => setType(e.target.value)}
							displayEmpty
							variant="standard"
							disableUnderline
							MenuProps={{ PaperProps: { className: 'home-search-menu' } }}
						>
							{serviceOptions.map((option) => (
								<MenuItem key={option.value || 'all-services'} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</Select>
						</div>

						<div className="home-search__select">
						<PublicOutlinedIcon />
						<Select
							className="home-search__mui-select"
							value={country}
							onChange={(e: SelectChangeEvent) => setCountry(e.target.value)}
							displayEmpty
							variant="standard"
							disableUnderline
							MenuProps={{ PaperProps: { className: 'home-search-menu' } }}
						>
							{countryOptions.map((option) => (
								<MenuItem key={option.value || 'all-countries'} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</Select>
						</div>

						<button className="home-search__btn" onClick={handleSearch}>
							<SearchIcon /> {ui('agency.search')}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SearchSection;
