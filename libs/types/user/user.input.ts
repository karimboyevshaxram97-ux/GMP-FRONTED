export interface RegisterInput {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string;
}

export interface LoginInput {
	email: string;
	password: string;
}

export interface RefreshTokenInput {
	refreshToken: string;
}
