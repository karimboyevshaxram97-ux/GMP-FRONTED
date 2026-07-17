import React from 'react';
import Box from '@mui/material/Box';
import PaginationItem from '@mui/material/PaginationItem';

interface Props {
	count: number;
	page: number;
	onChange: (_: any, value: number) => void;
	color?: 'primary' | 'secondary' | 'standard';
}

// Always shows exactly 3 (or fewer) consecutive page numbers around the current page.
const AppPagination = ({ count, page, onChange, color = 'primary' }: Props) => {
	if (count <= 1) return null;

	const lo = Math.max(1, Math.min(page - 1, count - 2));
	const hi = Math.min(count, lo + 2);
	const pages = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

	return (
		<Box component="nav" aria-label="pagination navigation">
			<Box component="ul" sx={{ display: 'flex', listStyle: 'none', p: 0, m: 0, alignItems: 'center' }}>
				<li>
					<PaginationItem type="previous" color={color} disabled={page === 1} onClick={() => onChange(null, page - 1)} />
				</li>
				{pages.map((p) => (
					<li key={p}>
						<PaginationItem type="page" page={p} color={color} selected={p === page} onClick={() => onChange(null, p)} />
					</li>
				))}
				<li>
					<PaginationItem type="next" color={color} disabled={page === count} onClick={() => onChange(null, page + 1)} />
				</li>
			</Box>
		</Box>
	);
};

export default AppPagination;
