import { AgencyStatus, AgencyVerificationStatus, AgencySortField } from '../../enums/agency.enum';
import { SortDirection } from '../../enums/common.enum';
import { ServiceType } from '../../enums/service.enum';

export interface GetAgenciesInput {
	text?: string;
	status?: AgencyStatus;
	verificationStatus?: AgencyVerificationStatus;
	country?: string;
	// Backend'ning haqiqiy AgenciesInquiryInput'ida mavjud va to'g'ri ishlaydi
	// (GPM-SERVER apps/gmp-api/src/libs/dto/agency/agencies-inquiry.input.ts) — bu yerda
	// yo'qligi shunchaki tip e'loni to'liq emasligi edi, funksional xato emas.
	serviceType?: ServiceType;
	sort?: AgencySortField;
	direction?: SortDirection;
	page?: number;
	limit?: number;
}
