<script lang="ts">
	export let items: { href: string; label: string; icon?: any }[] = [];
</script>

<aside
	class="sticky inset-y-0 top-0 left-0 w-72 -translate-x-full bg-[#FDFAF6] text-[#2f2f2f] shadow-lg
         transition-transform duration-200 md:sticky md:translate-x-0"
	aria-label="Sidebar navigation"
>
	<div class="my-10 flex items-center justify-center px-4 text-lg font-bold">DMSKU</div>

	<nav class="space-y-1 overflow-y-auto p-2">
		{#each items as item}
			<a
				href={item.href}
				class="flex items-center justify-center gap-3 rounded-lg px-3 py-4 transition
               hover:bg-[#006664] hover:text-white focus:ring-2 focus:ring-slate-600 focus:outline-none"
			>
				{#if item.icon}
					<svelte:component this={item.icon} size={20} />
				{/if}
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>
</aside>
