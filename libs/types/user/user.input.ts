import { UserRole } from '../../enums/user.enum';

// Backend'ning haqiqiy RegisterInput/LoginInput DTO'lariga mos (GPM-SERVER
// apps/gmp-api/src/libs/dto/auth/{register,login}.input.ts) — email emas, phoneNumber talab
// qilinadi; libs/auth/index.ts'dagi logIn/signUp shu shaklni ishlatadi.
export interface RegisterInput {
	phoneNumber: string;
	password: string;
	firstName: string;
	lastName: string;
	role?: UserRole;
}

export interface LoginInput {
	phoneNumber: string;
	password: string;
}

export interface RefreshTokenInput {
	refreshToken: string;
}
