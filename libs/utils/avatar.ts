import { REACT_APP_API_URL } from '../config';

/**
 * Resolve an avatar value to an <img> src. Social logins (Google/Kakao/Naver)
 * store the provider's full external URL, while local uploads store just the
 * filename that lives under the API's /uploads directory.
 */
export const avatarSrc = (avatar?: string | null): string => {
	if (!avatar) return '/img/profile/defaultUser.svg';
	if (/^https?:\/\//.test(avatar)) return avatar;
	return `${REACT_APP_API_URL}/uploads/${avatar}`;
};
