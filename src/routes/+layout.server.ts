import type { LayoutServerLoad } from './$types';
import { config } from '$lib/config';

export const load: LayoutServerLoad = async ({ request }) => {
	const cookie = request.headers.get('cookie') ?? '';

	try {
		const res = await fetch(`${config.apiBaseUrl}/auth/me`, {
			method: 'GET',
			headers: {
				cookie
			},
			credentials: 'include'
		});

		if (!res.ok) {
			return { user: null };
		}
		const user = await res.json();
		const { email, name, role, position } = user.user;
		const formattedUser: {
			email?: string | null;
			name?: string | null;
			role?: string | null;
			position?: string | null;
		} = {
			email: email ?? null,
			name: name ?? null,
			role: role ?? null,
			position: position ?? null
		};
		return { user: formattedUser };
	} catch {
		return { user: null };
	}
};
