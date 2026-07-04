const AUTH_ERROR_PARTS = [
	'user is not active',
	'invalid token',
	'no token provided',
	'unauthorized',
	'auth error',
	'authentication',
	'forbidden',
	'banned',
	'inactive',
];

export const getErrorMessage = (err: any): string => {
	return err?.graphQLErrors?.[0]?.message || err?.message || '';
};

export const isAuthErrorMessage = (message = ''): boolean => {
	const normalized = message.toLowerCase();
	return AUTH_ERROR_PARTS.some((part) => normalized.includes(part));
};

export const toFriendlyError = (errOrMessage: any, fallback = 'Something went wrong!'): string => {
	const message = typeof errOrMessage === 'string' ? errOrMessage : getErrorMessage(errOrMessage);
	const normalized = message.toLowerCase();

	if (!message) return fallback;
	if (normalized.includes('already_exists') || normalized.includes('already exists')) {
		if (normalized.includes('phone')) return 'Bu telefon raqam allaqachon ishlatilgan.';
		return "Bu ma'lumot allaqachon mavjud.";
	}
	if (normalized.includes('not_allowed_request')) {
		return "Bu xizmatga ariza qabul qilish yopilgan yoki limit to'lgan.";
	}
	if (normalized.includes('invalid token') || normalized.includes('no token provided') || normalized.includes('user is not active')) {
		return 'Sessiya muddati tugagan. Iltimos, qayta kiring.';
	}

	return message || fallback;
};

export const applicationErrorMessage = (err: any): string => {
	const message = getErrorMessage(err);
	const normalized = message.toLowerCase();

	if (normalized.includes('already_exists') || normalized.includes('already exists')) {
		return 'Siz bu xizmatga allaqachon ariza topshirgansiz.';
	}
	if (normalized.includes('not_allowed_request')) {
		return "Bu xizmatga ariza qabul qilish yopilgan yoki limit to'lgan.";
	}

	return toFriendlyError(message, 'Failed to submit application');
};
