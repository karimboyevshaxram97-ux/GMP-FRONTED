import { AgencyStatus, AgencyVerificationStatus } from '../../enums/agency.enum';
import { LocalizedString } from '../localized-string';

export interface MeLiked {
	myFavorite: boolean;
}

export interface MeFollowed {
	myFollowing: boolean;
}

export interface Agency {
	_id: string;
	name: LocalizedString | string;
	slug: string;
	logo?: string;
	coverImage?: string;
	description?: LocalizedString | string;
	email: string;
	website?: string;
	phoneNumber?: string;
	address?: string;
	city?: string;
	country?: string;
	latitude?: number;
	longitude?: number;
	operatingCountries: string[];
	status: AgencyStatus;
	verificationStatus: AgencyVerificationStatus;
	totalReviews: number;
	averageRating: number;
	totalServices: number;
	viewCount: number;
	likeCount: number;
	owner: string;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
	createdAt: string;
	updatedAt: string;
}
