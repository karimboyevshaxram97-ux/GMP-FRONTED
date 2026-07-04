import { REACT_APP_API_URL } from './config';

export const getImageUrl = (path?: string, fallback = '/img/default.jpg'): string => {
	if (!path) return fallback;
	if (path.startsWith('http')) return path;
	if (path.startsWith('/uploads/')) return `${REACT_APP_API_URL}${path}`;
	return `${REACT_APP_API_URL}/uploads/${path}`;
};

export const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

export const formatRating = (rating: number): string => {
	return rating.toFixed(1);
};

export const getServiceTypeLabel = (type: string): string => {
	const labels: Record<string, string> = {
		STUDY_ABROAD: 'Study Abroad',
		WORK_ABROAD: 'Work Abroad',
		TRAVEL: 'Travel',
		VISA_SERVICES: 'Visa Services',
	};
	return labels[type] ?? type;
};

export const isLiked = (meLiked?: { myFavorite: boolean }[]): boolean => {
	return meLiked?.[0]?.myFavorite === true;
};

export const isFollowed = (meFollowed?: { myFollowing: boolean }[]): boolean => {
	return meFollowed?.[0]?.myFollowing === true;
};

export const truncateText = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength) + '...';
};
