import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Box, CircularProgress, Typography } from '@mui/material';
import { updateStorage, updateUserInfo } from '../../libs/auth';
import { userVar } from '../../apollo/store';
import { UserRole } from '../../libs/enums/user.enum';
import { useUiLang } from '../../libs/utils/translations';

// The API redirects OAuth errors here with the backend Message text; map the
// known ones to stable codes the join page can localize.
const toErrorCode = (message: string): string => {
	const normalized = message.toLowerCase();
	if (normalized.includes('different login provider')) return 'email_conflict';
	if (normalized.includes('not configured')) return 'not_configured';
	return 'social_failed';
};

/**
 * OAuth landing page. The API redirects here after the provider dance with
 * ?accessToken=…&refreshToken=… (or ?error=…). Tokens are stored exactly the
 * way password login stores them, then the user is routed by role.
 */
const AuthCallback: NextPage = () => {
	const ui = useUiLang();
	const router = useRouter();

	useEffect(() => {
		if (!router.isReady) return;

		const { accessToken, refreshToken, error } = router.query;

		if (typeof error === 'string' && error) {
			router.replace(`/account/join?socialError=${toErrorCode(error)}`);
			return;
		}

		if (
			typeof accessToken === 'string' &&
			accessToken &&
			typeof refreshToken === 'string' &&
			refreshToken
		) {
			updateStorage({ accessToken, refreshToken });
			updateUserInfo(accessToken);

			const currentUser = userVar();
			if (currentUser.role === UserRole.SUPER_ADMIN) router.replace('/_admin');
			else if (currentUser.role === UserRole.AGENCY_ADMIN) router.replace('/mypage?tab=agency');
			else router.replace('/');
			return;
		}

		router.replace('/account/join?socialError=social_failed');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.isReady]);

	return (
		<>
			<Head>
				<title>GMP — Signing in…</title>
			</Head>
			<Box
				sx={{
					minHeight: '100vh',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 2,
					background: '#f5f7fa',
				}}
			>
				<CircularProgress size={44} sx={{ color: '#1649ff' }} />
				<Typography sx={{ fontSize: 14, fontWeight: 600, color: '#616161' }}>
					{ui('auth.signingYouIn')}
				</Typography>
			</Box>
		</>
	);
};

export default AuthCallback;

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
