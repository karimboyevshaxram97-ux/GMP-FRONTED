import React from 'react';
import Head from 'next/head';
import { Box, Container } from '@mui/material';
import withLayoutBasic from '../layout/LayoutBasic';
import { useUiLang } from '../../utils/translations';

interface StaticInfoPageProps {
	title: string;
	kicker: string;
	children: React.ReactNode;
}

const StaticInfoPage = ({ title, kicker, children }: StaticInfoPageProps) => {
	const ui = useUiLang();
	const translateNode = (node: React.ReactNode): React.ReactNode => {
		if (typeof node === 'string') return ui(node);
		if (Array.isArray(node)) return node.map(translateNode);
		if (React.isValidElement(node)) {
			return React.cloneElement(node, undefined, translateNode(node.props.children));
		}
		return node;
	};

	return (
		<>
			<Head>
				<title>{ui(title)} | GMP</title>
			</Head>
			<Box sx={{ background: '#f6f8fc', minHeight: '70vh', py: { xs: 5, md: 8 } }}>
				<Container maxWidth="md">
					<Box sx={{ background: '#fff', borderRadius: 3, p: { xs: 3, md: 5 }, boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)' }}>
						<Box sx={{ color: '#1649ff', fontWeight: 800, fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase', mb: 1 }}>
							{ui(kicker)}
						</Box>
						<Box component="h1" sx={{ m: 0, mb: 2, color: '#0f172a', fontSize: { xs: 34, md: 44 }, lineHeight: 1.1 }}>
							{ui(title)}
						</Box>
						<Box sx={{ color: '#475569', fontSize: 16, lineHeight: 1.8, '& h2': { color: '#0f172a', mt: 4, mb: 1 }, '& p': { mb: 2 }, '& ul': { pl: 3 } }}>
							{translateNode(children)}
						</Box>
					</Box>
				</Container>
			</Box>
		</>
	);
};

export default withLayoutBasic(StaticInfoPage);
