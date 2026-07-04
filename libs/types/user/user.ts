import { UserRole, UserStatus } from '../../enums/user.enum';
import { Lang } from '../../enums/lang.enum';

export interface User {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: UserRole;
	status: UserStatus;
	preferredLanguage?: Lang;
	avatar?: string;
	bio?: string;
	phoneNumber?: string;
	dateOfBirth?: string;
	nationality?: string;
	emailVerified: boolean;
	lastLoginAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface AuthResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
}
