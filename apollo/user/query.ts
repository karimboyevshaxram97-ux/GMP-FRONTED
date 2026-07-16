import { gql } from '@apollo/client';

export const GET_ME = gql`
	query Me {
		me {
			_id
			firstName
			lastName
			email
			avatar
			bio
			phoneNumber
			dateOfBirth
			nationality
			role
			status
			preferredLanguage
			emailVerified
			lastLoginAt
		}
	}
`;

export const GET_AGENCIES = gql`
	query GetAgencies($input: AgenciesInquiryInput!) {
		getAgencies(input: $input) {
			list {
				_id
				name { uz ru en ko }
				slug
				logo
				coverImage
				description { uz ru en ko }
				email
				operatingCountries
				status
				verificationStatus
				totalReviews
				averageRating
				totalServices
				viewCount
				likeCount
				meLiked {
					myFavorite
				}
				meFollowed {
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENCY = gql`
	query GetAgency($id: String!) {
		getAgency(id: $id) {
			_id
			name { uz ru en ko }
			slug
			logo
			coverImage
			description { uz ru en ko }
			email
			website
			phoneNumber
			address
			city
			country
			latitude
			longitude
			operatingCountries
			owner
			status
			verificationStatus
			totalReviews
			averageRating
			totalServices
			viewCount
			likeCount
			meLiked {
				myFavorite
			}
			meFollowed {
				myFollowing
			}
			createdAt
		}
	}
`;

export const GET_AGENCY_BY_SLUG = gql`
	query GetAgencyBySlug($slug: String!) {
		getAgencyBySlug(slug: $slug) {
			_id
			name { uz ru en ko }
			slug
			logo
			coverImage
			description { uz ru en ko }
			email
			website
			phoneNumber
			address
			city
			country
			latitude
			longitude
			operatingCountries
			owner
			status
			verificationStatus
			totalReviews
			averageRating
			totalServices
			viewCount
			likeCount
			meLiked {
				myFavorite
			}
			meFollowed {
				myFollowing
			}
			createdAt
		}
	}
`;

export const GET_SERVICES = gql`
	query GetServices($input: ServicesInquiryInput!) {
		getServices(input: $input) {
			list {
				_id
				name { uz ru en ko }
				description { uz ru en ko }
				agency
				serviceType
				destinationCountry
				sourceCountries
				price
				processingTime
				status
				averageRating
				totalReviews
				viewCount
				likeCount
				meLiked {
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_SERVICE = gql`
	query GetService($id: String!) {
		getService(id: $id) {
			_id
			name { uz ru en ko }
			description { uz ru en ko }
			agency
			serviceType
			destinationCountry
			sourceCountries
			price
			processingTime
			status
			averageRating
			totalReviews
			viewCount
			likeCount
			tags
			maxApplicationCount
			currentApplicationCount
			meLiked {
				myFavorite
			}
		}
	}
`;

export const GET_SERVICES_BY_AGENCY = gql`
	query GetServicesByAgency($agencyId: String!) {
		getServicesByAgency(agencyId: $agencyId) {
			_id
			name { uz ru en ko }
			description { uz ru en ko }
			serviceType
			destinationCountry
			sourceCountries
			price
			processingTime
			status
			averageRating
			totalReviews
			viewCount
			likeCount
			meLiked {
				myFavorite
			}
		}
	}
`;

export const MY_APPLICATIONS = gql`
	query MyApplications {
		myApplications {
			_id
			service
			agency
			status
			paymentStatus
			notes
			appliedAt
			isReviewEligible
		}
	}
`;

export const APPLICATION_DOCUMENTS = gql`
	query ApplicationDocuments($applicationId: String!) {
		applicationDocuments(applicationId: $applicationId) {
			_id
			application
			user
			agency
			kind
			label
			required
			status
			originalName
			mimeType
			size
			rejectionReason
			uploadedAt
			reviewedAt
			createdAt
			updatedAt
		}
	}
`;

export const REVIEWS_BY_AGENCY = gql`
	query ReviewsByAgency($agencyId: String!) {
		reviewsByAgency(agencyId: $agencyId) {
			_id
			user
			agency
			service
			rating
			comment
			createdAt
		}
	}
`;

export const MY_REVIEW_BY_AGENCY = gql`
	query MyReviewByAgency($agencyId: String!) {
		myReviewByAgency(agencyId: $agencyId) {
			_id
			rating
			comment
			status
			createdAt
		}
	}
`;

export const REVIEWS_BY_SERVICE = gql`
	query ReviewsByService($serviceId: String!) {
		reviewsByService(serviceId: $serviceId) {
			_id
			rating
			comment
			createdAt
		}
	}
`;

export const MY_FOLLOWING_AGENCIES = gql`
	query MyFollowingAgencies {
		myFollowingAgencies {
			_id
			agency
			user
			notificationsEnabled
			followedAt
		}
	}
`;

export const MY_CONVERSATIONS = gql`
	query MyConversations {
		myConversations {
			_id
			participants
			agency
			lastMessage
			lastMessageAt
			unreadCount
			status
		}
	}
`;

export const CONVERSATION_MESSAGES = gql`
	query ConversationMessages($conversationId: String!, $limit: Int, $skip: Int) {
		conversationMessages(conversationId: $conversationId, limit: $limit, skip: $skip) {
			_id
			sender
			text
			isRead
			isEdited
			createdAt
		}
	}
`;

export const GET_MY_NOTIFICATIONS = gql`
	query GetMyNotifications($input: NotificationsInquiryInput!) {
		getMyNotifications(input: $input) {
			list {
				_id
				type
				message
				targetId
				isRead
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
	query GetUnreadNotificationCount {
		getUnreadNotificationCount
	}
`;

export const MY_AGENCY = gql`
	query MyAgency {
		myAgency {
			_id
			name { uz ru en ko }
			slug
			logo
			coverImage
			description { uz ru en ko }
			email
			phoneNumber
			website
			address
			city
			country
			latitude
			longitude
			operatingCountries
			status
			verificationStatus
			totalReviews
			averageRating
			totalServices
			viewCount
			likeCount
			createdAt
		}
	}
`;

export const GET_COUNTRIES = gql`
	query Countries {
		countries {
			_id
			name
			code
			flag
			isActive
		}
	}
`;

export const APPLICATIONS_BY_AGENCY = gql`
	query ApplicationsByAgency($agencyId: String!) {
		applicationsByAgency(agencyId: $agencyId) {
			_id
			user
			service
			agency
			status
			paymentStatus
			notes
			priority
			appliedAt
			isReviewEligible
		}
	}
`;

export const GET_AGENCIES_FOR_MAP = gql`
	query GetAgenciesForMap($filter: AgenciesForMapInput!) {
		getAgenciesForMap(filter: $filter) {
			_id
			name { uz ru en ko }
			slug
			logo
			address
			city
			country
			latitude
			longitude
			phoneNumber
			email
			averageRating
			totalReviews
			totalServices
			verificationStatus
		}
	}
`;

export const GET_PHOTOS = gql`
	query GetPhotos($input: PhotosInquiryInput!) {
		getPhotos(input: $input) {
			list {
				_id
				agency
				image
				serviceType
				likeCount
				viewCount
				commentCount
				meLiked {
					myFavorite
				}
				agencyName { uz ru en ko }
				agencyLogo
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_PHOTO_COMMENTS = gql`
	query GetPhotoComments($photoId: String!) {
		getPhotoComments(photoId: $photoId) {
			_id
			text
			parentComment
			likeCount
			meLiked {
				myFavorite
			}
			attachments {
				url
				type
				name
			}
			userName
			userAvatar
			createdAt
		}
	}
`;
