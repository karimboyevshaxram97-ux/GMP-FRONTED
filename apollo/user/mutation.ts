import { gql } from '@apollo/client';

export const REGISTER = gql`
	mutation Register($input: RegisterInput!) {
		register(input: $input) {
			accessToken
			refreshToken
			user {
				_id
				firstName
				lastName
				phoneNumber
				role
				status
				preferredLanguage
			}
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			accessToken
			refreshToken
			user {
				_id
				firstName
				lastName
				phoneNumber
				role
				status
				preferredLanguage
			}
		}
	}
`;




export const REFRESH_TOKEN = gql`
	mutation RefreshToken($input: RefreshTokenInput!) {
		refreshToken(input: $input) {
			accessToken
			refreshToken
			user {
				_id
				email
				role
				preferredLanguage
			}
		}
	}
`;

export const LOGOUT = gql`
	mutation Logout {
		logout
	}
`;

export const UPDATE_ME = gql`
	mutation UpdateMe($input: UpdateUserInput!) {
		updateMe(input: $input) {
			_id
			firstName
			lastName
			bio
			avatar
			phoneNumber
			nationality
			preferredLanguage
		}
	}
`;

export const UPDATE_LANGUAGE = gql`
	mutation UpdateLanguage($input: UpdateUserInput!) {
		updateMe(input: $input) {
			_id
			preferredLanguage
		}
	}
`;

export const TOGGLE_LIKE = gql`
	mutation ToggleLike($targetId: String!, $targetType: LikeTargetType!) {
		toggleLike(targetId: $targetId, targetType: $targetType) {
			isLiked
			likeCount
		}
	}
`;

export const FOLLOW_AGENCY = gql`
	mutation FollowAgency($agencyId: String!) {
		followAgency(agencyId: $agencyId) {
			_id
			user
			agency
			notificationsEnabled
		}
	}
`;

export const UNFOLLOW_AGENCY = gql`
	mutation UnfollowAgency($agencyId: String!) {
		unfollowAgency(agencyId: $agencyId)
	}
`;

export const CREATE_APPLICATION = gql`
	mutation CreateApplication($input: CreateApplicationInput!) {
		createApplication(input: $input) {
			_id
			status
			paymentStatus
			appliedAt
		}
	}
`;

export const CREATE_REVIEW = gql`
	mutation CreateReview($input: CreateReviewInput!) {
		createReview(input: $input) {
			_id
			rating
			comment
			createdAt
		}
	}
`;

export const SEND_MESSAGE = gql`
	mutation SendMessage($input: SendMessageInput!) {
		sendMessage(input: $input) {
			_id
			sender
			text
			createdAt
		}
	}
`;

export const CREATE_OR_GET_CONVERSATION = gql`
	mutation CreateOrGetConversation($input: CreateConversationInput!) {
		createOrGetConversation(input: $input) {
			_id
			participants
			agency
			status
			unreadCount
		}
	}
`;

export const MARK_CONVERSATION_AS_READ = gql`
	mutation MarkConversationAsRead($conversationId: String!) {
		markConversationAsRead(conversationId: $conversationId)
	}
`;

export const CREATE_AGENCY = gql`
	mutation CreateAgency($input: CreateAgencyInput!) {
		createAgency(input: $input) {
			_id
			name { uz ru en ko }
			slug
			status
			verificationStatus
		}
	}
`;

export const UPDATE_MY_AGENCY = gql`
	mutation UpdateMyAgency($input: UpdateAgencyInput!) {
		updateMyAgency(input: $input) {
			_id
			name { uz ru en ko }
			description { uz ru en ko }
			logo
			coverImage
			email
			phoneNumber
			website
			operatingCountries
			city
			country
			address
			latitude
			longitude
			verificationStatus
			status
		}
	}
`;

export const EDIT_MESSAGE = gql`
	mutation EditMessage($input: EditMessageInput!) {
		editMessage(input: $input) {
			_id
			text
			isEdited
			editedAt
		}
	}
`;

export const BLOCK_CONVERSATION = gql`
	mutation BlockConversation($conversationId: String!) {
		blockConversation(conversationId: $conversationId) {
			_id
			status
		}
	}
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
	mutation MarkAllNotificationsAsRead {
		markAllNotificationsAsRead
	}
`;

export const CREATE_SERVICE = gql`
	mutation CreateService($agencyId: String!, $input: CreateServiceInput!) {
		createService(agencyId: $agencyId, input: $input) {
			_id
			name { uz ru en ko }
			serviceType
			destinationCountry
			price
			status
		}
	}
`;

export const UPDATE_SERVICE = gql`
	mutation UpdateService($id: String!, $input: UpdateServiceInput!) {
		updateService(id: $id, input: $input) {
			_id
			name { uz ru en ko }
			price
			processingTime
			status
		}
	}
`;

export const DELETE_SERVICE = gql`
	mutation DeleteService($id: String!) {
		deleteService(id: $id)
	}
`;

export const UPDATE_APPLICATION_STATUS = gql`
	mutation UpdateApplicationStatus($id: String!, $input: UpdateApplicationInput!) {
		updateApplicationStatus(id: $id, input: $input) {
			_id
			status
		}
	}
`;

export const RECORD_VIEW = gql`
	mutation RecordView($targetId: String!, $targetType: ViewTargetType!) {
		recordView(targetId: $targetId, targetType: $targetType)
	}
`;

export const CREATE_SUPPORT_TICKET = gql`
	mutation CreateSupportTicket($input: CreateSupportTicketInput!) {
		createSupportTicket(input: $input) {
			_id
			status
			createdAt
		}
	}
`;

export const CREATE_PHOTO = gql`
	mutation CreatePhoto($input: CreatePhotoInput!) {
		createPhoto(input: $input) {
			_id
			image
			serviceType
		}
	}
`;

export const DELETE_PHOTO = gql`
	mutation DeletePhoto($photoId: String!) {
		deletePhoto(photoId: $photoId)
	}
`;

export const CREATE_PHOTO_COMMENT = gql`
	mutation CreatePhotoComment($input: CreatePhotoCommentInput!) {
		createPhotoComment(input: $input) {
			_id
			text
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
