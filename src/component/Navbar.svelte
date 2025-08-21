<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	let { user }: { user: { name?: string; role?: string } } = $props();
</script>

<nav class="sticky top-0 flex h-16 bg-[#006664] text-white">
	<div class="mr-10 flex w-full flex-row-reverse items-center">
		{#if user?.name}
			{user.name}
		{:else}
			{m.username()}
		{/if}
	</div>
</nav>
