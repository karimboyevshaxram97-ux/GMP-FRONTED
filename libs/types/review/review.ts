export interface Review {
	_id: string;
	user: string;
	agency?: string;
	service?: string;
	rating: number;
	comment: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateReviewInput {
	agencyId: string;
	serviceId?: string;
	rating: number;
	comment: string;
}
