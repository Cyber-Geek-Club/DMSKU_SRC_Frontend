import type { PageServerLoad } from './$types';
import { config } from '$lib/config';

export const load: PageServerLoad = async (event) => {
	const cookie = event.request.headers.get('cookie') ?? '';

	try {
		const userRes = await event.fetch(`${config.apiBaseUrl}/users/count`, {
			headers: {
				cookie
			},
			credentials: 'include'
		});
		if (!userRes.ok) {
			return {
				countOfUsers: {
					role: { admin: 0, manager: 0, organizer: 0, club_member: 0, guest: 0 },
					total: 0
				},
				error: true,
				status: userRes.status
			};
		}

		const data = await userRes.json();
		return {
			data
		};
	} catch (e) {
		console.error('Error fetching user count:', e);
		return {
			countOfUsers: {
				role: { admin: 0, manager: 0, organizer: 0, club_member: 0, guest: 0 },
				total: 0
			},
			error: true
		};
	}
};
