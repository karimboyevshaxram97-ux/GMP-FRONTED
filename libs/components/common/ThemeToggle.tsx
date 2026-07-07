import React, { useEffect, useState } from 'react';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

const STORAGE_KEY = 'gmp-theme';

// Tungi rejim tugmasi: <html> ga "dark" klassini qo'shadi/olib tashlaydi,
// tanlov localStorage'da saqlanadi (birinchi renderda _document dagi skript o'qiydi).
const ThemeToggle = () => {
	const [dark, setDark] = useState(false);

	useEffect(() => {
		setDark(document.documentElement.classList.contains('dark'));
	}, []);

	const toggle = () => {
		const next = !dark;
		setDark(next);
		document.documentElement.classList.toggle('dark', next);
		try {
			localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
		} catch {
			/* localStorage yopiq bo'lsa jim o'tamiz */
		}
	};

	return (
		<button type="button" className="theme-toggle" onClick={toggle} aria-label={dark ? 'Light mode' : 'Dark mode'}>
			{dark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
		</button>
	);
};

export default ThemeToggle;
