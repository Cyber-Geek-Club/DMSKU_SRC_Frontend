<script lang="ts">
    import { m } from "$lib/paraglide/messages";
    
    export let data: {
        Userid: string;
        documentname: string;
        status: number;
        waituser: string[];
    };

    const select_catagory = [
		{ label: m.doucument_send()},
		{ label: m.doucument_wait() },
		{ label: m.doucument_process()},
		{ label: m.doucument_success() },
	];
</script>


{#if data && data.waituser && data.waituser.length > 0}
    <div class="px-30 py-10">
        <div class="flex justify-evenly text-gray-600 font-medium border-b mb-6">
            {#each select_catagory as item}
                <div class="pb-2 border-b-2 border-transparent hover:border-[#B2BB1E] cursor-pointer">
                    {item.label}
                </div>
            {/each}
        </div>
        
        <div class="bg-gray-50 rounded-lg p-6 shadow-md ">
        <p class="mb-2"><strong>{m.doucument_number()} :</strong> {data.Userid}</p>
            <p class="mb-2"><strong>{m.doucument_name()} :</strong> {data.documentname}</p>
            <p class="mb-6 {data.status==2?'text-green-500':'text-red-500'} font-semibold">{m.status()} : {data.status==2 ?m.doucument_success():data.status==1?m.doucument_process():m.decline()}</p>
            
            {#each data.waituser as user, i}
                <div class="relative flex flex-row py-3  items-center justify-center">
                    <div class="w-4 h-4 
                        {i === data.waituser.length - 1 ? 'bg-green-600' : 'border-2 border-green-600 bg-white'}
                        rounded-full  mx-5">
                    </div>
                    
                    <div>
                        <p class="text-sm text-gray-500">Step {i+1}</p>
                        <p class="font-medium">{m.username()} {user} {m.doucument_wait()}</p>
                    </div>
                </div>
            {/each}
            
        </div>
    </div>
    
{:else}
  <p class="text-center text-gray-400">{m.doucument_notfound()}</p>
{/if}