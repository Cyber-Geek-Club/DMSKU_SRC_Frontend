<script lang="ts">
	import '../app.css';
	import Sidebar from '../component/Sidebar.svelte';
	import Navbar from '../component/Navbar.svelte';
	import { m } from '$lib/paraglide/messages.js';

	let { children } = $props();

	const items = [
		{ href: '/',label: m.home()},
		{ href: '/searchDocument',label: m.search_document()},
		{ href: '/demo',label: 'Demo' },
		{ href: '/demo/paraglide',label: 'Paraglide' }
	];
</script>

<div class="min-h-screen bg-slate-50 md:flex">
  <Sidebar {items}/>
  <div class="flex-1 min-h-screen flex flex-col">
	<Navbar/>
    <main class="flex-1">
      {@render children?.()}
    </main>
  </div>
</div>

