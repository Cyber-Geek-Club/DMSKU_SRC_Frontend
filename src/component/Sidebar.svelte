<script lang="ts">
  export let items: { href: string; label: string; icon?: any }[] = [];
</script>

<aside
  class="sticky h-screen left-0 top-0 w-72 bg-[#FDFAF6] text-[#2f2f2f] shadow-lg"
  aria-label="Sidebar navigation" 
>
  <div class="flex items-center justify-center px-4 my-10 text-lg font-bold">
    KMSKU
  </div>

  <nav class="p-2 space-y-1 overflow-y-auto">
    {#each items as item}
      <a
        href={item.href}
        class="flex items-center gap-3 px-3 py-4 justify-center rounded-lg transition
               hover:bg-[#006664] hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
      >
        {#if item.icon}
          <svelte:component this={item.icon} size={20} />

        {/if}
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>
</aside>
