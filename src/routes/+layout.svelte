<script lang="ts">
	import '../app.css';
	import Sidebar from '../component/Sidebar.svelte';
	import Navbar from '../component/Navbar.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { page } from '$app/state';

	let { data, children } = $props();

	const items = [
		{ href: '/main', label: m.home() },
		{ href: '/searchDocument', label: m.search_document() },
		{ href: '/demo', label: 'Demo' },
		{ href: '/demo/paraglide', label: 'Paraglide' }
	];
</script>

<div class="md:flex">
	{#if page.url.pathname !== '/' && page.url.pathname !== '/admin/login_form' && page.url.pathname !== '/searchDocument'}
		<Sidebar
			{items}
			user={{ role: data.user?.role ?? undefined, name: data.user?.name ?? undefined }}
		/>
	{/if}
	<div class="flex min-h-screen flex-1 flex-col">
		{#if page.url.pathname !== '/' && page.url.pathname !== '/admin/login_form' && page.url.pathname !== '/searchDocument'}
			<Navbar user={{ name: data.user?.name ?? undefined, role: data.user?.role ?? undefined }} />
		{/if}
		<main class="flex-1">
			{@render children?.()}
		</main>
	</div>
</div>
