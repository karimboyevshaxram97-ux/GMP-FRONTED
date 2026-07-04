import { ApplicationStatus, PaymentStatus } from '../../enums/application.enum';

export interface Application {
	_id: string;
	service: string;
	agency: string;
	user?: string;
	status: ApplicationStatus;
	paymentStatus: PaymentStatus;
	notes?: string;
	documents?: string[];
	appliedAt: string;
	isReviewEligible?: boolean;
	rejectionReason?: string;
	createdAt: string;
	updatedAt: string;
}
