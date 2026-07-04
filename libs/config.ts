const requiredInProduction = (value: string | undefined, name: string, fallback: string) => {
	if (value) return value;
	if (process.env.NODE_ENV === 'production') {
		throw new Error(`${name} must be set in production`);
	}
	return fallback;
};

export const REACT_APP_API_URL = requiredInProduction(process.env.REACT_APP_API_URL, 'REACT_APP_API_URL', 'http://localhost:3007');
export const REACT_APP_API_GRAPHQL_URL = requiredInProduction(
	process.env.REACT_APP_API_GRAPHQL_URL,
	'REACT_APP_API_GRAPHQL_URL',
	'http://localhost:3007/graphql',
);
export const REACT_APP_API_WS = process.env.REACT_APP_API_WS ?? REACT_APP_API_URL.replace(/^http/, 'ws');
export const REACT_APP_API_GRAPHQL_WS =
	process.env.REACT_APP_API_GRAPHQL_WS ?? REACT_APP_API_GRAPHQL_URL.replace(/^http/, 'ws');
export const REACT_APP_CHAT_WS = process.env.REACT_APP_CHAT_WS ?? REACT_APP_API_WS;

export const serviceTypeLabels: Record<string, string> = {
	STUDY_ABROAD: 'Study Abroad',
	WORK_ABROAD: 'Work Abroad',
	TRAVEL: 'Travel',
	VISA_SERVICES: 'Visa Services',
};

export const applicationStatusColors: Record<string, string> = {
	SUBMITTED: '#ff9800',
	UNDER_REVIEW: '#2196f3',
	APPROVED: '#4caf50',
	ACCEPTED: '#00bcd4',
	REJECTED: '#f44336',
	COMPLETED: '#9c27b0',
	WITHDRAWN: '#9e9e9e',
};

export const applicationStatusLabels: Record<string, string> = {
	SUBMITTED: 'Submitted',
	UNDER_REVIEW: 'Under Review',
	APPROVED: 'Approved',
	ACCEPTED: 'Accepted',
	REJECTED: 'Rejected',
	COMPLETED: 'Completed',
	WITHDRAWN: 'Withdrawn',
};
