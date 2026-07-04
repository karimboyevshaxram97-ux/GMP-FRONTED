import { gql } from '@apollo/client';

export const APPROVE_AGENCY = gql`
	mutation ApproveAgency($input: ApproveAgencyInput!) {
		approveAgency(input: $input) {
			_id
			verificationStatus
		}
	}
`;

export const REJECT_AGENCY = gql`
	mutation RejectAgency($input: RejectAgencyInput!) {
		rejectAgency(input: $input) {
			_id
			verificationStatus
		}
	}
`;

export const SUSPEND_AGENCY = gql`
	mutation SuspendAgency($input: SuspendAgencyInput!) {
		suspendAgency(input: $input) {
			_id
			status
		}
	}
`;

export const ACTIVATE_AGENCY = gql`
	mutation ActivateAgency($agencyId: String!) {
		activateAgency(agencyId: $agencyId) {
			_id
			status
		}
	}
`;

export const BAN_USER = gql`
	mutation BanUser($input: BanUserInput!) {
		banUser(input: $input) {
			_id
			status
		}
	}
`;

export const UNBAN_USER = gql`
	mutation UnbanUser($userId: String!) {
		unbanUser(userId: $userId) {
			_id
			status
		}
	}
`;

export const ADMIN_DELETE_AGENCY = gql`
	mutation AdminDeleteAgency($agencyId: String!) {
		adminDeleteAgency(agencyId: $agencyId) {
			_id
		}
	}
`;

export const ADMIN_DELETE_SERVICE = gql`
	mutation DeleteService($id: String!) {
		deleteService(id: $id)
	}
`;

export const ADMIN_UPDATE_SERVICE_STATUS = gql`
	mutation UpdateService($id: String!, $input: UpdateServiceInput!) {
		updateService(id: $id, input: $input) {
			_id
			status
			visibility
		}
	}
`;

export const UPDATE_SUPPORT_TICKET_STATUS = gql`
	mutation UpdateSupportTicketStatus($input: UpdateSupportTicketStatusInput!) {
		updateSupportTicketStatus(input: $input) {
			_id
			status
			updatedAt
		}
	}
`;

export const APPROVE_REVIEW = gql`
	mutation ApproveReview($reviewId: String!) {
		approveReview(reviewId: $reviewId) {
			_id
			status
		}
	}
`;

export const REJECT_REVIEW = gql`
	mutation RejectReview($reviewId: String!, $reason: String) {
		rejectReview(reviewId: $reviewId, reason: $reason) {
			_id
			status
		}
	}
`;

export const HIDE_REVIEW = gql`
	mutation HideReview($reviewId: String!, $reason: String) {
		hideReview(reviewId: $reviewId, reason: $reason) {
			_id
			status
		}
	}
`;
