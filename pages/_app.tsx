import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider, useReactiveVar } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { Provider } from 'react-redux';
import { store } from '../store';
import { langVar, socketVar, userVar } from '../apollo/store';
import { Lang } from '../libs/enums/lang.enum';
import { getSavedLang, normalizeLang } from '../libs/utils/lang';
import { getJwtToken } from '../libs/auth';
import { REACT_APP_CHAT_WS } from '../libs/config';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';
import '../scss/pc/general.scss';
import '../scss/pc/homepage/homepage.scss';
import '../scss/pc/account/join.scss';
import '../scss/pc/admin/admin.scss';
import '../scss/pc/agency/agency.scss';
import '../scss/pc/agency/detail.scss';
import '../scss/pc/agency/map.scss';
import '../scss/pc/mypage/mypage.scss';
import '../scss/pc/mypage/messages.scss';
import '../scss/pc/service/service.scss';
import '../scss/pc/help/help.scss';
import '../scss/pc/chat/chat.scss';
import 'leaflet/dist/leaflet.css';
// Tungi rejim: ENG OXIRIDA import qilinadi — dark qoidalari ustun bo'lishi uchun
import '../scss/dark.scss';

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	// First visit always renders Korean (defaultLocale, localeDetection off).
	// A language the user picked earlier (localStorage/cookie) is restored here.
	useEffect(() => {
		const saved = getSavedLang();
		if (saved && saved !== router.locale) {
			router.replace(router.asPath, undefined, { locale: saved, scroll: false });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Keep the Apollo reactive var in sync with the routing locale so
	// non-i18next consumers (backend LocalizedString rendering) follow along.
	useEffect(() => {
		langVar(normalizeLang(router.locale) ?? Lang.KO);
	}, [router.locale]);

	useEffect(() => {
		if (!REACT_APP_CHAT_WS) return;

		const token = getJwtToken();
		const query = token ? `?token=${encodeURIComponent(token)}` : '';
		const ws = new WebSocket(`${REACT_APP_CHAT_WS}${query}`);

		ws.onerror = () => {
			if (socketVar() === ws) socketVar(null);
		};
		ws.onclose = () => {
			if (socketVar() === ws) socketVar(null);
		};
		socketVar(ws);

		return () => {
			if (socketVar() === ws) socketVar(null);
			ws.close();
		};
	}, [user?._id]);

	return (
		<>
			<Provider store={store}>
				<ApolloProvider client={client}>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						<Component {...pageProps} />
					</ThemeProvider>
				</ApolloProvider>
			</Provider>
		</>
	);
};

export default appWithTranslation(App);
