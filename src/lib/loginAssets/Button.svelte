<script lang="ts">
	let { className = '', onclick = () => {}, children } = $props();
</script>

<button onclick={() => onclick()} class={`login-button ${className}`}>
	{@render children?.()}
</button>
