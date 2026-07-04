import { AgencyStatus, AgencyVerificationStatus, AgencySortField } from '../../enums/agency.enum';
import { SortDirection } from '../../enums/common.enum';

export interface GetAgenciesInput {
	text?: string;
	status?: AgencyStatus;
	verificationStatus?: AgencyVerificationStatus;
	country?: string;
	sort?: AgencySortField;
	direction?: SortDirection;
	page?: number;
	limit?: number;
}
