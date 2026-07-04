import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomJwtPayload } from '../../libs/types/customJwtPayload';

interface UserState {
	userInfo: CustomJwtPayload | null;
	isAuthenticated: boolean;
}

const initialState: UserState = {
	userInfo: null,
	isAuthenticated: false,
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUser(state, action: PayloadAction<CustomJwtPayload>) {
			state.userInfo = action.payload;
			state.isAuthenticated = true;
		},
		clearUser(state) {
			state.userInfo = null;
			state.isAuthenticated = false;
		},
	},
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
