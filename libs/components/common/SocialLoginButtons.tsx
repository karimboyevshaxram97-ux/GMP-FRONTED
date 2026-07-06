import React from 'react';
import { REACT_APP_API_URL } from '../../config';
import { useUiLang } from '../../utils/translations';

type SocialProvider = 'kakao' | 'naver' | 'google';

const PROVIDERS: ReadonlyArray<{ id: SocialProvider; labelKey: string }> = [
	{ id: 'kakao', labelKey: 'auth.continueWithKakao' },
	{ id: 'naver', labelKey: 'auth.continueWithNaver' },
	{ id: 'google', labelKey: 'auth.continueWithGoogle' },
];

const ICONS: Record<SocialProvider, JSX.Element> = {
	// Kakao speech-bubble mark
	kakao: (
		<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
			<path
				fill="#191919"
				d="M12 3C6.48 3 2 6.54 2 10.9c0 2.8 1.86 5.26 4.66 6.66l-.95 3.52c-.08.31.27.56.54.38l4.21-2.79c.5.05 1.02.08 1.54.08 5.52 0 10-3.54 10-7.85C22 6.54 17.52 3 12 3z"
			/>
		</svg>
	),
	// Naver "N" mark
	naver: (
		<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
			<path fill="#ffffff" d="M4 4h5.2l5.6 8.4V4H20v16h-5.2l-5.6-8.4V20H4z" />
		</svg>
	),
	// Google "G" mark (official four-color)
	google: (
		<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
			<path
				fill="#EA4335"
				d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
			/>
			<path
				fill="#4285F4"
				d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
			/>
			<path
				fill="#FBBC05"
				d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
			/>
			<path
				fill="#34A853"
				d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
			/>
		</svg>
	),
};

/**
 * Social login row for the account join form. Clicking a button performs a
 * full-page redirect to the API's OAuth initiate route; the API redirects
 * back to /auth/callback with tokens (or an error) when the dance is done.
 */
const SocialLoginButtons = () => {
	const ui = useUiLang();

	const startSocialLogin = (provider: SocialProvider): void => {
		window.location.href = `${REACT_APP_API_URL}/auth/${provider}`;
	};

	return (
		<div className="jr-social">
			<div className="jr-social-divider">
				<span>{ui('auth.orContinueWith')}</span>
			</div>
			{PROVIDERS.map((provider) => (
				<button
					key={provider.id}
					type="button"
					className={`jr-social-btn jr-social-btn--${provider.id}`}
					onClick={() => startSocialLogin(provider.id)}
				>
					{ICONS[provider.id]}
					<span>{ui(provider.labelKey)}</span>
				</button>
			))}
		</div>
	);
};

export default SocialLoginButtons;
