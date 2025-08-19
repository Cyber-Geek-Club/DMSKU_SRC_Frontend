<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
    import Icon from '@iconify/svelte';
    export let query: string;
    let textchange=''
</script>

<div class="flex items-center w-full max-w-xl bg-white rounded-full shadow-md overflow-hidden">
    <div class="px-3">
        <Icon icon="mdi:search" class="w-5 h-5"/>
    </div>
    <input
        bind:value={textchange}
        type="text"
        placeholder={m.placeholder_search()}
        class="flex-1 px-2 py-2 border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
    />
    <button
        class="bg-[#B2BB1E] hover:bg-lime-600 text-white font-medium px-6 py-2 rounded-r-full transition"
        on:click={()=>{
             query = textchange;
        }}
    >
        {m.track()}
    </button>
</div>