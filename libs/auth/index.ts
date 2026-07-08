import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { LOGIN, REFRESH_TOKEN, REGISTER } from '../../apollo/user/mutation';
import { UserRole, UserStatus } from '../enums/user.enum';
import { Lang } from '../enums/lang.enum';
import { getSavedLang, normalizeLang, setLang } from '../utils/lang';

export function getJwtToken(): string {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
	return '';
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

export function getRefreshToken(): string {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('refreshToken') ?? '';
	}
	return '';
}

export const logIn = async (phoneNumber: string, password: string): Promise<void> => {
	try {
		const apolloClient = initializeApollo();
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { phoneNumber: phoneNumber.trim(), password } },
			fetchPolicy: 'network-only',
		});

		const { accessToken, refreshToken } = result?.data?.login ?? {};
		if (!accessToken || !refreshToken) throw new Error('Invalid auth response');
		updateStorage({ accessToken, refreshToken });
		updateUserInfo(accessToken);
		const preferredLanguage = result?.data?.login?.user?.preferredLanguage;
		const lang = normalizeLang(preferredLanguage);
		if (lang) {
			userVar({ ...userVar(), preferredLanguage: lang });
			setLang(lang);
		}
	} catch (err: any) {
		console.warn('login err', err);
		throw err;
	}
};

export const signUp = async (input: {
	phoneNumber: string;
	password: string;
	firstName: string;
	lastName: string;
	role?: UserRole;
}): Promise<void> => {
	try {
		const apolloClient = initializeApollo();
		const result = await apolloClient.mutate({
			mutation: REGISTER,
			variables: {
				input: {
					...input,
					phoneNumber: input.phoneNumber.trim(),
					firstName: input.firstName.trim(),
					lastName: input.lastName.trim(),
				},
			},
			fetchPolicy: 'network-only',
		});
		const { accessToken, refreshToken } = result?.data?.register ?? {};
		if (!accessToken || !refreshToken) throw new Error('Invalid auth response');
		updateStorage({ accessToken, refreshToken });
		updateUserInfo(accessToken);
		const preferredLanguage = result?.data?.register?.user?.preferredLanguage;
		const lang = normalizeLang(preferredLanguage);
		if (lang) {
			userVar({ ...userVar(), preferredLanguage: lang });
			setLang(lang);
		}
	} catch (err: any) {
		console.warn('signUp err', err);
		throw err;
	}
};

export const refreshAuthTokens = async (): Promise<boolean> => {
	const refreshToken = getRefreshToken();
	if (!refreshToken) {
		logOut('/account/join');
		return false;
	}

	try {
		const apolloClient = initializeApollo();
		const result = await apolloClient.mutate({
			mutation: REFRESH_TOKEN,
			variables: { input: { refreshToken } },
			fetchPolicy: 'network-only',
		});
		const data = result?.data?.refreshToken;
		if (!data?.accessToken || !data?.refreshToken) {
			logOut('/account/join');
			return false;
		}
		updateStorage({ accessToken: data.accessToken, refreshToken: data.refreshToken });
		updateUserInfo(data.accessToken);
		const preferredLanguage = data?.user?.preferredLanguage;
		const lang = normalizeLang(preferredLanguage);
		if (lang) {
			userVar({ ...userVar(), preferredLanguage: lang });
			setLang(lang);
		}
		return true;
	} catch (err) {
		console.warn('refresh token err', err);
		logOut('/account/join');
		return false;
	}
};

export const updateStorage = ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => {
	if (!accessToken || !refreshToken) throw new Error('Invalid auth tokens');
	localStorage.setItem('accessToken', accessToken);
	localStorage.setItem('refreshToken', refreshToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: string) => {
	if (!jwtToken) return false;

	let claims: CustomJwtPayload;
	try {
		claims = decodeJWT<CustomJwtPayload>(jwtToken);
	} catch (err) {
		console.warn('Invalid JWT token, logging out:', err);
		logOut('/account/join');
		return false;
	}

	if (claims.status && claims.status !== UserStatus.ACTIVE) {
		logOut('/account/join');
		return false;
	}

	const tokenLang = normalizeLang(claims.preferredLanguage);
	const nextLang = getSavedLang() ?? tokenLang ?? Lang.KO;

	userVar({
		_id: claims._id ?? '',
		email: claims.email ?? '',
		role: claims.role ?? UserRole.USER,
		status: claims.status ?? UserStatus.ACTIVE,
		firstName: claims.firstName ?? '',
		lastName: claims.lastName ?? '',
		avatar: claims.avatar ?? '',
		phoneNumber: claims.phoneNumber ?? '',
		preferredLanguage: nextLang,
	});
	setLang(nextLang);
};

export const logOut = (redirectTo?: string) => {
	localStorage.removeItem('accessToken');
	localStorage.removeItem('refreshToken');
	window.localStorage.setItem('logout', Date.now().toString());

	userVar({
		_id: '',
		email: '',
		role: UserRole.USER,
		status: UserStatus.ACTIVE,
		firstName: '',
		lastName: '',
		avatar: '',
		phoneNumber: '',
		preferredLanguage: Lang.UZ,
	});

	if (redirectTo) window.location.href = redirectTo;
	else window.location.reload();
};
