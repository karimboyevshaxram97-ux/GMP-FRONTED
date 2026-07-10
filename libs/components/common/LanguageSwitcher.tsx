import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, MenuItem } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { Lang } from '../../enums/lang.enum';
import { normalizeLang, setLang } from '../../utils/lang';
import FlagIcon from './FlagIcon';

const LANGS: ReadonlyArray<{ code: Lang; native: string; code3: string }> = [
	{ code: Lang.KO, native: '한국어', code3: 'KOR' },
	{ code: Lang.EN, native: 'English', code3: 'ENG' },
	{ code: Lang.UZ, native: "O'zbekcha", code3: 'UZB' },
	{ code: Lang.RU, native: 'Русский', code3: 'RUS' },
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
				title={active.native}
			>
				<FlagIcon lang={active.code} size={20} className="lang-switcher__flag" />
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
						title={lang.native}
						sx={{
							fontSize: 14,
							fontWeight: lang.code === current ? 700 : 500,
							display: 'flex',
							alignItems: 'center',
							gap: 1.25,
							py: 1.1,
						}}
					>
						<FlagIcon lang={lang.code} size={22} />
						<span style={{ flex: 1, fontWeight: 700, letterSpacing: '0.5px' }}>{lang.code3}</span>
						{lang.code === current && <CheckIcon sx={{ fontSize: 16, color: '#1649ff' }} />}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default LanguageSwitcher;
