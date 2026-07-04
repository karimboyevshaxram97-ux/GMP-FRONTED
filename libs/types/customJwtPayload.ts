import { JwtPayload } from 'jwt-decode';
import { UserRole, UserStatus } from '../enums/user.enum';
import { Lang } from '../enums/lang.enum';

export interface CustomJwtPayload extends JwtPayload {
	_id: string;
	email: string;
	role: UserRole;
	status: UserStatus;
	firstName: string;
	lastName: string;
	avatar?: string;
	phoneNumber?: string;
	bio?: string;
	nationality?: string;
	preferredLanguage?: Lang;
}
