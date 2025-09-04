export interface UserRoles {
	roles: 'guest' | 'club_member' | 'organizer' | 'manager' | 'admin';
}

export interface UserPositions {
	positions: 'president' | 'member' | null;
}

export interface UserType {
	id: number;
	name: string;
	email: string;
	phoneNumber: string | null;
	role: UserRoles['roles'];
	position: UserPositions['positions'];
	createdAt: string;
	updatedAt: string | null;
	deletedAt: string | null;
}
