import React, { useEffect } from 'react';
import Head from 'next/head';
import { Stack } from '@mui/material';
import Top from '../Top';
import Footer from '../Footer';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		// Bitta responsive daraxt — mobil/PC farqi CSS orqali (@media).
		return (
			<>
				<Head>
					<title>GMP — Global Migration Platform</title>
				</Head>
				<Stack id="pc-wrap">
					<Stack id={'top'}><Top /></Stack>
					<Stack id={'main'}><Component {...props} /></Stack>
					<Stack id={'footer'}><Footer /></Stack>
				</Stack>
				<Chat />
			</>
		);
	};
};

export default withLayoutMain;
