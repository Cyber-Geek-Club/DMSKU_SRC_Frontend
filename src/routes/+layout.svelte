<script lang="ts">
	import '../app.css';
	import Sidebar from '../component/Sidebar.svelte';
	import Navbar from '../component/Navbar.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { page } from '$app/state';

	let { children } = $props();

	const items = [
		{ href: '/', label: m.home() },
		{ href: '/searchDocument', label: m.search_document() },
		{ href: '/demo', label: 'Demo' },
		{ href: '/demo/paraglide', label: 'Paraglide' }
	];
</script>

<div class="md:flex">
	{#if page.url.pathname !== '/' && page.url.pathname !== '/admin/login_form' && page.url.pathname !== '/searchDocument'}
		<Sidebar {items} />
	{/if}
	<div class="flex min-h-screen flex-1 flex-col">
		{#if page.url.pathname !== '/' && page.url.pathname !== '/admin/login_form' && page.url.pathname !== '/searchDocument'}
			<Navbar />
		{/if}
		<main class="flex-1">
			{@render children?.()}
		</main>
	</div>
</div>
