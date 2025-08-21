<script lang="ts">
	let {
		user,
		items
	}: {
		user: { name?: string; role?: string };
		items: { href: string; label: string; icon?: any }[];
	} = $props();
</script>

<aside
	class="sticky top-0 left-0 h-screen w-72 bg-[#FDFAF6] text-[#2f2f2f] shadow-lg"
	aria-label="Sidebar navigation"
>
	<div class="my-10 flex items-center justify-center px-4 text-lg font-bold">DMSKU</div>
	<nav class="space-y-1 overflow-y-auto p-2">
		{#if user?.role === 'admin'}
			<a
				href="/admin/dashboard"
				class="flex items-center justify-center gap-3 rounded-lg px-3 py-4 transition
				hover:bg-[#006664] hover:text-white focus:ring-2 focus:ring-slate-600 focus:outline-none"
			>
				<span>Admin Dashboard</span>
			</a>
		{/if}
		{#each items as item}
			<a
				href={item.href}
				class="flex items-center justify-center gap-3 rounded-lg px-3 py-4 transition
				hover:bg-[#006664] hover:text-white focus:ring-2 focus:ring-slate-600 focus:outline-none"
			>
				{#if item.icon}
					{@const Icon = item.icon}
					<Icon size={24} />
				{/if}
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>
</aside>
