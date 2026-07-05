import React, { useEffect } from 'react';
import Head from 'next/head';
import { Stack } from '@mui/material';
import Top from '../Top';
import Footer from '../Footer';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		if (device === 'mobile') {
			return (
				<>
					<Head>
						<title>GMP — Global Migration Platform</title>
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}><Top /></Stack>
						<Stack id={'main'}><Component {...props} /></Stack>
						<Stack id={'footer'}><Footer /></Stack>
					</Stack>
				</>
			);
		}

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
