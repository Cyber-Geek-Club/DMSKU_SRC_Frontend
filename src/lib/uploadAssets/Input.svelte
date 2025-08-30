<script lang="ts">
	import './upload.css';
	import { m } from '$lib/paraglide/messages.js';

	let { label = '', value = $bindable('') } = $props();
</script>

<div class="input-container">
	<h1 class="w-full">{label}</h1>
	<input bind:value type="text" class="" accept=".pdf" />
</div>
