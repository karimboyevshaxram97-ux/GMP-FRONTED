import { makeVar } from '@apollo/client';
import { CustomJwtPayload } from '../libs/types/customJwtPayload';
import { UserRole, UserStatus } from '../libs/enums/user.enum';
import { Lang } from '../libs/enums/lang.enum';

// Always EN on first render (SSR + client initial).
// _app.tsx useEffect restores saved lang after hydration.
export const langVar = makeVar<Lang>(Lang.EN);

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
	preferredLanguage: Lang.EN,
});
