<script>
	import './ProjectSearch.css';
	import { m } from '$lib/paraglide/messages.js';
	import Icon from '@iconify/svelte';

	let { text = $bindable('') } = $props();
</script>

<div class="container">
	<div class="search-container">
		<div class="search-bar">
			<Icon icon="mdi:magnify" class="icon-search" />
			<span class="mx-6 h-[48px] w-[1px] bg-[#d9d9d9]"></span>
			<input
				class="search-input"
				type="text"
				bind:value={text}
				placeholder={m.placeholder_search()}
			/>
		</div>
	</div>
</div>
