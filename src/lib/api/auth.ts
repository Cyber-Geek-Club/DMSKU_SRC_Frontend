import { http } from './http';
import { config } from '$lib/config';

export const auth = {
	loginWithGoogle: () => {
		window.location.href = config.apiBaseUrl + '/auth/google';
	},

	logout: () => {
		return http.post('/auth/logout');
	},

	getMe: () => {
		return http.get('/auth/me');
	}
};
