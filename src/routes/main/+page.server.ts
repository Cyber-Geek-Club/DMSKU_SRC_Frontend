import type { PageServerLoad } from './$types';
import { config } from '$lib/config';

export const load: PageServerLoad = async ({ request }) => {
	const cookie = request.headers.get('cookie') ?? '';

	try {
		// Build URL with query params
		const url = new URL(`${config.apiBaseUrl}/projects/owner/me`);
		url.searchParams.set('includeRelations', 'true');

		const res = await fetch(url.toString(), {
			method: 'GET',
			headers: { cookie },
			credentials: 'include'
		});
		if (!res.ok) {
			return { projects: [] };
		}
		const data = await res.json();
		return { projects: Array.isArray(data) ? data : (data ?? []) };
	} catch {
		return { projects: [] };
	}
};
