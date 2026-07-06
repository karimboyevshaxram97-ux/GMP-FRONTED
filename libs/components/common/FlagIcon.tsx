import React from 'react';
import { Lang } from '../../enums/lang.enum';

// Inline SVG flags: emoji flags don't render on Windows, so we draw them.
// All flags share a 24x16 viewBox (3:2) and are sized via the `size` prop (width).

const FlagKR = () => (
	<g>
		<rect width="24" height="16" fill="#ffffff" />
		<g transform="rotate(-33.7 12 8)">
			<circle cx="12" cy="8" r="3.6" fill="#0047a0" />
			<path d="M8.4 8 A3.6 3.6 0 0 1 15.6 8 Z" fill="#cd2e3a" />
			<circle cx="10.2" cy="8" r="1.8" fill="#cd2e3a" />
			<circle cx="13.8" cy="8" r="1.8" fill="#0047a0" />
		</g>
		<g fill="#000000">
			<g transform="rotate(-33.7 4.6 3.2)">
				<rect x="2.8" y="1.9" width="3.6" height="0.7" />
				<rect x="2.8" y="2.9" width="3.6" height="0.7" />
				<rect x="2.8" y="3.9" width="3.6" height="0.7" />
			</g>
			<g transform="rotate(33.7 19.4 3.2)">
				<rect x="17.6" y="1.9" width="1.6" height="0.7" />
				<rect x="19.6" y="1.9" width="1.6" height="0.7" />
				<rect x="17.6" y="2.9" width="3.6" height="0.7" />
				<rect x="17.6" y="3.9" width="1.6" height="0.7" />
				<rect x="19.6" y="3.9" width="1.6" height="0.7" />
			</g>
			<g transform="rotate(33.7 4.6 12.8)">
				<rect x="2.8" y="11.5" width="3.6" height="0.7" />
				<rect x="2.8" y="12.5" width="1.6" height="0.7" />
				<rect x="4.8" y="12.5" width="1.6" height="0.7" />
				<rect x="2.8" y="13.5" width="3.6" height="0.7" />
			</g>
			<g transform="rotate(-33.7 19.4 12.8)">
				<rect x="17.6" y="11.5" width="1.6" height="0.7" />
				<rect x="19.6" y="11.5" width="1.6" height="0.7" />
				<rect x="17.6" y="12.5" width="1.6" height="0.7" />
				<rect x="19.6" y="12.5" width="1.6" height="0.7" />
				<rect x="17.6" y="13.5" width="1.6" height="0.7" />
				<rect x="19.6" y="13.5" width="1.6" height="0.7" />
			</g>
		</g>
	</g>
);

const FlagEN = () => (
	<g>
		<rect width="24" height="16" fill="#b22234" />
		<g fill="#ffffff">
			<rect y="1.23" width="24" height="1.23" />
			<rect y="3.69" width="24" height="1.23" />
			<rect y="6.15" width="24" height="1.23" />
			<rect y="8.62" width="24" height="1.23" />
			<rect y="11.08" width="24" height="1.23" />
			<rect y="13.54" width="24" height="1.23" />
		</g>
		<rect width="10.2" height="8.62" fill="#3c3b6e" />
		<g fill="#ffffff">
			<circle cx="1.8" cy="1.6" r="0.5" />
			<circle cx="5.1" cy="1.6" r="0.5" />
			<circle cx="8.4" cy="1.6" r="0.5" />
			<circle cx="3.45" cy="3.1" r="0.5" />
			<circle cx="6.75" cy="3.1" r="0.5" />
			<circle cx="1.8" cy="4.6" r="0.5" />
			<circle cx="5.1" cy="4.6" r="0.5" />
			<circle cx="8.4" cy="4.6" r="0.5" />
			<circle cx="3.45" cy="6.1" r="0.5" />
			<circle cx="6.75" cy="6.1" r="0.5" />
			<circle cx="1.8" cy="7.3" r="0.5" />
			<circle cx="5.1" cy="7.3" r="0.5" />
			<circle cx="8.4" cy="7.3" r="0.5" />
		</g>
	</g>
);

const FlagUZ = () => (
	<g>
		<rect width="24" height="5.33" fill="#0099b5" />
		<rect y="5.33" width="24" height="5.33" fill="#ffffff" />
		<rect y="10.67" width="24" height="5.33" fill="#1eb53a" />
		<rect y="5.33" width="24" height="0.45" fill="#ce1126" />
		<rect y="10.22" width="24" height="0.45" fill="#ce1126" />
		<circle cx="4.2" cy="2.67" r="1.9" fill="#ffffff" />
		<circle cx="4.9" cy="2.67" r="1.6" fill="#0099b5" />
		<g fill="#ffffff">
			<circle cx="8.4" cy="3.9" r="0.42" />
			<circle cx="10.3" cy="3.9" r="0.42" />
			<circle cx="12.2" cy="3.9" r="0.42" />
			<circle cx="9.35" cy="2.4" r="0.42" />
			<circle cx="11.25" cy="2.4" r="0.42" />
			<circle cx="10.3" cy="0.9" r="0.42" />
		</g>
	</g>
);

const FlagRU = () => (
	<g>
		<rect width="24" height="5.33" fill="#ffffff" />
		<rect y="5.33" width="24" height="5.33" fill="#0039a6" />
		<rect y="10.67" width="24" height="5.34" fill="#d52b1e" />
	</g>
);

const FLAGS: Record<Lang, () => JSX.Element> = {
	[Lang.KO]: FlagKR,
	[Lang.EN]: FlagEN,
	[Lang.UZ]: FlagUZ,
	[Lang.RU]: FlagRU,
};

interface FlagIconProps {
	lang: Lang;
	size?: number;
	className?: string;
}

const FlagIcon = ({ lang, size = 20, className }: FlagIconProps) => {
	const Flag = FLAGS[lang] ?? FlagKR;
	return (
		<svg
			className={className}
			width={size}
			height={(size * 2) / 3}
			viewBox="0 0 24 16"
			role="img"
			aria-hidden="true"
			style={{ borderRadius: 2, flexShrink: 0, boxShadow: '0 0 0 0.5px rgba(0,0,0,0.15)' }}
		>
			<Flag />
		</svg>
	);
};

export default FlagIcon;
