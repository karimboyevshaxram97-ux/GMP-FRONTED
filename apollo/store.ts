import { makeVar } from '@apollo/client';
import { CustomJwtPayload } from '../libs/types/customJwtPayload';
import { UserRole, UserStatus } from '../libs/enums/user.enum';
import { Lang } from '../libs/enums/lang.enum';

// Korean is the site default; _app.tsx keeps this in sync with router.locale.
export const langVar = makeVar<Lang>(Lang.KO);

export const socketVar = makeVar<WebSocket | null>(null);

export const userVar = makeVar<CustomJwtPayload>({
	_id: '',
	email: '',
	role: UserRole.USER,
	status: UserStatus.ACTIVE,
	firstName: '',
	lastName: '',
	avatar: '',
	phoneNumber: '',
	preferredLanguage: Lang.KO,
});
