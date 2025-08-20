<script lang="ts">
	import './dashboard.css';
	import { m } from '$lib/paraglide/messages.js';
	let { title = '', subText = '', icon, iconProps = { size: 50 } } = $props();
</script>

<div class="block">
	{#if icon}
		{@const Icon = icon}
		<Icon {...iconProps} />
	{/if}
	<h2 class="block-title">{title}</h2>
	<div class="block-content">
		<p class="block-subtext">{subText}</p>
	</div>
</div>
