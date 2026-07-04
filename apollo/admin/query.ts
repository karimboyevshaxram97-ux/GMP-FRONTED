import { gql } from '@apollo/client';

export const PLATFORM_STATS = gql`
	query PlatformStats {
		platformStats {
			totalUsers
			totalAgencies
			totalServices
			totalApplications
			totalReviews
			activeSubscriptions
			pendingAgencyVerifications
		}
	}
`;

export const ADMIN_USERS = gql`
	query AdminUsers($page: Int, $limit: Int, $filter: AdminUsersFilterInput) {
		adminUsers(page: $page, limit: $limit, filter: $filter) {
			list {
				_id
				firstName
				lastName
				email
				phoneNumber
				role
				status
				avatar
				bio
				nationality
				createdAt
			}
			total
		}
	}
`;

export const ADMIN_AGENCIES = gql`
	query AdminAgencies($page: Int, $limit: Int, $filter: AdminAgenciesFilterInput) {
		adminAgencies(page: $page, limit: $limit, filter: $filter) {
			list {
				_id
				name { uz ru en ko }
				description { uz ru en ko }
				logo
				email
				phoneNumber
				website
				address
				city
				country
				operatingCountries
				status
				verificationStatus
				totalServices
				totalReviews
				averageRating
				createdAt
			}
			total
		}
	}
`;

export const PENDING_VERIFICATIONS = gql`
	query PendingVerifications {
		pendingVerifications {
			_id
			name { uz ru en ko }
			email
			verificationStatus
			createdAt
		}
	}
`;

export const ADMIN_SERVICES = gql`
	query GetServices($input: ServicesInquiryInput!) {
		getServices(input: $input) {
			list {
				_id
				name { uz ru en ko }
				agency
				serviceType
				destinationCountry
				price
				status
				visibility
				averageRating
				totalReviews
				viewCount
				likeCount
				currentApplicationCount
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const ADMIN_ALL_REVIEWS = gql`
	query AdminReviews($status: ReviewStatus) {
		adminReviews(status: $status) {
			_id
			user
			agency
			service
			status
			rating
			comment
			createdAt
		}
	}
`;

export const AUDIT_LOGS = gql`
	query AuditLogs($page: Int, $limit: Int) {
		auditLogs(page: $page, limit: $limit) {
			list {
				_id
				adminId
				action
				targetType
				targetId
				targetName
				reason
				createdAt
			}
			total
		}
	}
`;

export const ADMIN_SUPPORT_TICKETS = gql`
	query AdminSupportTickets($input: SupportTicketsInquiryInput!) {
		adminSupportTickets(input: $input) {
			list {
				_id
				name
				email
				phoneNumber
				role
				message
				status
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;
