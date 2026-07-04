import { ServiceType, ServiceSortField } from '../../enums/service.enum';
import { SortDirection } from '../../enums/common.enum';

export interface GetServicesInput {
	text?: string;
	serviceType?: ServiceType;
	destinationCountry?: string;
	sourceCountry?: string;
	agencyId?: string;
	status?: string;
	visibility?: string;
	includeInactive?: boolean;
	minPrice?: number;
	maxPrice?: number;
	sort?: ServiceSortField;
	direction?: SortDirection;
	page?: number;
	limit?: number;
}
