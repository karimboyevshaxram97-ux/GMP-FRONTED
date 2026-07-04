import React from 'react';
import { useReactiveVar } from '@apollo/client';
import { langVar } from '../../../apollo/store';
import { Lang } from '../../enums/lang.enum';
import { setLang } from '../../utils/lang';

const LANGS = [
	{ code: Lang.UZ, flag: '🇺🇿', label: "O'zbek" },
	{ code: Lang.RU, flag: '🇷🇺', label: 'Русский' },
	{ code: Lang.EN, flag: '🇬🇧', label: 'English' },
	{ code: Lang.KO, flag: '🇰🇷', label: '한국어' },
];

const LanguageSwitcher = () => {
	const currentLang = useReactiveVar(langVar);

	return (
		<div className="lang-switcher-float">
			{LANGS.map((lang) => (
				<button
					key={lang.code}
					className={`lang-btn${currentLang === lang.code ? ' active' : ''}`}
					onClick={() => setLang(lang.code)}
					title={lang.label}
					type="button"
				>
					<span className="lang-flag">{lang.flag}</span>
					<span className="lang-code">{lang.code.toUpperCase()}</span>
				</button>
			))}
		</div>
	);
};

export default LanguageSwitcher;
