<script lang="ts">
	let {
		className = '',
		onclick = undefined as ((e: MouseEvent) => void) | undefined,
		children
	} = $props();
</script>

<button {onclick} class={`login-button ${className}`}>
	{@render children?.()}
</button>
