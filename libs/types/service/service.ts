import { ServiceType, ServiceStatus } from '../../enums/service.enum';
import { MeLiked } from '../agency/agency';
import { LocalizedString } from '../localized-string';

export interface Service {
	_id: string;
	name: LocalizedString | string;
	description?: LocalizedString | string;
	agency: string;
	serviceType: ServiceType;
	destinationCountry: string;
	sourceCountries: string[];
	price: number;
	processingTime?: string;
	status: ServiceStatus;
	averageRating: number;
	totalReviews: number;
	viewCount: number;
	likeCount: number;
	tags?: string[];
	maxApplicationCount?: number;
	currentApplicationCount?: number;
	meLiked?: MeLiked[];
	createdAt: string;
	updatedAt: string;
}
