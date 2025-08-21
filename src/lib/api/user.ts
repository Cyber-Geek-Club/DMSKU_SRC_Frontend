import { http } from './http';

export type UserRole = 'guest' | 'club_member' | 'organizer' | 'manager' | 'admin';
export type UserPosition = 'president' | 'member';

export const user = {
	createUser: (
		email: string,
		name: string,
		phoneNumber: string | undefined,
		role: UserRole,
		position: UserPosition
	) => {
		return http.post('/user', { email, name, phoneNumber, role, position });
	},

	getUserData: (email: string) => {
		return http.get('/user', { params: { email } });
	},

	getCountOfUsers: () => {
		return http.get('/user/count');
	}
};
