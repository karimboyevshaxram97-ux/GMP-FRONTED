export interface MetaCounter {
	total: number;
}

export interface PaginatedResponse<T> {
	list: T[];
	metaCounter: MetaCounter[];
}

export interface Direction {
	ASC: 'ASC';
	DESC: 'DESC';
}
