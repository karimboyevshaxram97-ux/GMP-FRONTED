import { i18n } from 'next-i18next';

const AUTH_ERROR_PARTS = [
	'user is not active',
	'invalid token',
	'no token provided',
	'user not found',
	'unauthorized',
	'auth error',
	'authentication',
	'forbidden',
	'banned',
	'inactive',
];

// Non-hook module: translate through the global i18next instance at call time,
// falling back to English before i18n has initialized (SSR/early client).
const tr = (key: string, fallback: string): string => {
	const value = i18n?.t(key, { ns: 'common' });
	return value && value !== key ? value : fallback;
};

export const getErrorMessage = (err: any): string => {
	return err?.graphQLErrors?.[0]?.message || err?.message || '';
};

export const isAuthErrorMessage = (message = ''): boolean => {
	const normalized = message.toLowerCase();
	return AUTH_ERROR_PARTS.some((part) => normalized.includes(part));
};

export const toFriendlyError = (errOrMessage: any, fallback?: string): string => {
	const message = typeof errOrMessage === 'string' ? errOrMessage : getErrorMessage(errOrMessage);
	const normalized = message.toLowerCase();
	const defaultFallback = fallback ?? tr('errors.somethingWentWrong', 'Something went wrong!');

	if (!message) return defaultFallback;
	if (normalized.includes('already_exists') || normalized.includes('already exists')) {
		if (normalized.includes('phone')) return tr('errors.alreadyUsedPhone', 'This phone number is already in use.');
		return tr('errors.alreadyExists', 'This information already exists.');
	}
	if (normalized.includes('not_allowed_request')) {
		return tr('errors.applicationsClosed', 'Applications for this service are closed or the limit has been reached.');
	}
	if (
		normalized.includes('invalid token') ||
		normalized.includes('no token provided') ||
		normalized.includes('user is not active') ||
		normalized.includes('user not found')
	) {
		return tr('errors.sessionExpired', 'Your session has expired. Please sign in again.');
	}
	if (normalized.includes('completed application is required')) {
		return tr('service.reviewRequiresCompletedApplication', 'You can leave a review after your application for this service is completed.');
	}

	return message || defaultFallback;
};

export const applicationErrorMessage = (err: any): string => {
	const message = getErrorMessage(err);
	const normalized = message.toLowerCase();

	if (normalized.includes('already_exists') || normalized.includes('already exists')) {
		return tr('errors.alreadyApplied', 'You have already applied to this service.');
	}
	if (normalized.includes('not_allowed_request')) {
		return tr('errors.applicationsClosed', 'Applications for this service are closed or the limit has been reached.');
	}

	return toFriendlyError(message, tr('errors.failedToSubmitApplication', 'Failed to submit application'));
};
