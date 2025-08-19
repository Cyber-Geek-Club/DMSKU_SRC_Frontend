<script lang="ts">
	import { Eye, EyeClosed } from '@lucide/svelte';
	let {
		type = 'text',
		placeholder = '',
		value = $bindable(''),
		className = '',
		onchange = (text: string) => console.log(text)
	} = $props();
	let isShown = $state(false);
</script>

<div class="relative w-full">
	<input
		type={isShown ? 'text' : type}
		{placeholder}
		bind:value
		class={`input-field ${className}`}
		oninput={() => onchange(value)}
	/>
	{#if type === 'password'}
		<button class="eye-icon" onclick={() => (isShown = !isShown)}>
			{#if isShown}
				<EyeClosed />
			{:else}
				<Eye />
			{/if}
		</button>
	{/if}
</div>
