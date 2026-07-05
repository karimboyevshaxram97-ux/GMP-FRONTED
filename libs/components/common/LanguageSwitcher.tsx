import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, MenuItem } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import { Lang } from '../../enums/lang.enum';
import { normalizeLang, setLang } from '../../utils/lang';

const LANGS: ReadonlyArray<{ code: Lang; native: string }> = [
	{ code: Lang.KO, native: '한국어' },
	{ code: Lang.EN, native: 'English' },
	{ code: Lang.UZ, native: "O'zbekcha" },
	{ code: Lang.RU, native: 'Русский' },
];

/**
 * Header language selector. Shows the active language's native name and lets
 * the user switch; the choice is persisted (localStorage + NEXT_LOCALE cookie)
 * and applied as a client-side locale swap — no full page reload.
 */
const LanguageSwitcher = () => {
	const router = useRouter();
	const [anchor, setAnchor] = useState<null | HTMLElement>(null);
	const current = normalizeLang(router.locale) ?? Lang.KO;
	const active = LANGS.find((l) => l.code === current) ?? LANGS[0];

	const handleSelect = (code: Lang) => {
		setAnchor(null);
		if (code !== current) setLang(code);
	};

	return (
		<>
			<button
				type="button"
				className="lang-switcher"
				onClick={(e) => setAnchor(e.currentTarget)}
				aria-haspopup="menu"
				aria-expanded={Boolean(anchor)}
				aria-label="Change language"
			>
				<LanguageIcon className="lang-switcher__globe" />
				<span className="lang-switcher__label">{active.native}</span>
				<KeyboardArrowDownIcon className="lang-switcher__arrow" />
			</button>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={() => setAnchor(null)}
				sx={{ mt: '6px' }}
				PaperProps={{ sx: { minWidth: 168, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' } }}
			>
				{LANGS.map((lang) => (
					<MenuItem
						key={lang.code}
						selected={lang.code === current}
						onClick={() => handleSelect(lang.code)}
						sx={{
							fontSize: 14,
							fontWeight: lang.code === current ? 700 : 500,
							display: 'flex',
							justifyContent: 'space-between',
							gap: 2,
							py: 1.1,
						}}
					>
						<span>{lang.native}</span>
						{lang.code === current && <CheckIcon sx={{ fontSize: 16, color: '#1649ff' }} />}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default LanguageSwitcher;
