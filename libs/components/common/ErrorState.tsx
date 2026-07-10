import React from 'react';
import Link from 'next/link';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { useUiLang } from '../../utils/translations';

interface ErrorStateProps {
	code?: string;
	title: string;
	description: string;
	onRetry?: () => void;
	homeHref?: string;
}

const ErrorState = ({ code, title, description, onRetry, homeHref = '/home' }: ErrorStateProps) => {
	const ui = useUiLang();

	return (
		<div className="error-state-page">
			<div className="error-state-page__orb error-state-page__orb--1" aria-hidden="true" />
			<div className="error-state-page__orb error-state-page__orb--2" aria-hidden="true" />

			<div className="error-state-page__content">
				{code ? (
					<div className="error-state-page__code">{code}</div>
				) : (
					<div className="error-state-page__icon">
						<ReportProblemOutlinedIcon />
					</div>
				)}

				<h1 className="error-state-page__title">{title}</h1>
				<p className="error-state-page__desc">{description}</p>

				<div className="error-state-page__actions">
					{onRetry && (
						<button type="button" className="error-state-page__btn error-state-page__btn--primary" onClick={onRetry}>
							<RefreshOutlinedIcon />
							{ui('errors.tryAgain')}
						</button>
					)}
					<Link
						href={homeHref}
						className={`error-state-page__btn ${onRetry ? 'error-state-page__btn--secondary' : 'error-state-page__btn--primary'}`}
					>
						<HomeOutlinedIcon />
						{ui('nav.home')}
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ErrorState;
