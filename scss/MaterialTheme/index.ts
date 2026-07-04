import { common } from '@mui/material/colors';
import shadow from './shadow';
import typography from './typography';

export const light = {
	palette: {
		type: 'light',
		background: {
			default: '#f5f7fa',
			paper: common.white,
		},
		primary: {
			contrastText: '#ffffff',
			main: '#1649ff',
		},
		secondary: {
			main: '#0a2472',
		},
		text: {
			primary: '#1a1a2e',
			secondary: '#616161',
			dark: common.black,
		},
	},
	components: {
		MuiTypography: {
			styleOverrides: {
				root: { letterSpacing: '0' },
			},
		},
		MuiLink: {
			styleOverrides: {
				root: { color: '#757575', textDecoration: 'none' },
			},
		},
		MuiDivider: {
			styleOverrides: {
				root: { borderColor: '#eee' },
			},
		},
		MuiBox: {
			styleOverrides: {
				root: { padding: '0' },
			},
		},
		MuiContainer: {
			styleOverrides: {
				root: {
					maxWidth: 'inherit',
					padding: '0',
					'@media (min-width: 600px)': { paddingLeft: 0, paddingRight: 0 },
				},
			},
		},
		MuiCssBaseline: {
			styleOverrides: {
				html: { height: '100%' },
				body: { background: '#fff', height: '100%', minHeight: '100%' },
				p: { margin: '0' },
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					color: '#212121',
					minWidth: 'auto',
					lineHeight: '1.2',
					boxShadow: 'none',
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					height: '48px',
					width: '100%',
					backgroundColor: '#fff',
				},
				notchedOutline: {
					padding: '8px',
					top: '-9px',
					border: '1px solid #eee',
				},
			},
		},
		MuiList: {
			styleOverrides: {
				root: { padding: '0' },
			},
		},
		MuiListItem: {
			styleOverrides: {
				root: { padding: '0' },
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: { padding: '0' },
			},
		},
		MuiMenuItem: {
			styleOverrides: {
				root: { padding: '6px 8px' },
			},
		},
		MuiFormControl: {
			styleOverrides: {
				root: { width: '100%' },
			},
		},
		MuiTabPanel: {
			styleOverrides: {
				root: { padding: '0' },
			},
		},
		MuiChip: {
			styleOverrides: {
				root: { border: '1px solid #ddd', color: '#212121' },
			},
		},
	},
	shadow,
	typography,
};
