<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import Icon from '@iconify/svelte';
	let { onTextChange = $bindable(''), query = $bindable('') } = $props();
</script>

<div class="flex w-full max-w-xl items-center overflow-hidden rounded-full bg-white shadow-md">
	<div class="px-3">
		<Icon icon="mdi:search" class="h-5 w-5" />
	</div>
	<input
		bind:value={onTextChange}
		type="text"
		placeholder={m.placeholder_search()}
		class="flex-1 border-0 px-2 py-2 placeholder-gray-400 focus:ring-0 focus:outline-none"
	/>
	<button
		class="rounded-r-full bg-[#B2BB1E] px-6 py-2 font-medium text-white transition hover:bg-lime-600"
		onclick={() => (query = onTextChange)}
	>
		{m.track()}
	</button>
</div>
