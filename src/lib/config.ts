import { z } from 'zod';
import { env } from '$env/dynamic/public';

// Validate public runtime env variables (exposed to the client)
const envSchema = z.object({
	PUBLIC_API_BASE_URL: z.url()
});

const parsed = envSchema.safeParse({ PUBLIC_API_BASE_URL: env.PUBLIC_API_BASE_URL });

if (!parsed.success) {
	// Provide a concise error to avoid leaking internals
	throw new Error('Invalid PUBLIC_* environment variables');
}

export const config = {
	apiBaseUrl: parsed.data.PUBLIC_API_BASE_URL
} as const;

export type AppConfig = typeof config;
