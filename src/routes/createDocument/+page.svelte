<script lang="ts">
	import { m } from '$lib/paraglide/messages';
    import Icon from '@iconify/svelte';
    import { file } from '../../Tempdata';
    let state = $state(0);
</script>


<div class="flex flex-col h-full bg-[#D9D9D9]">
    {#if state === 1}
    <div class="flex pt-5 justify-evenly items-center text-l ">
        <div class="py-3">
            {m.search_document()}
            <input
                value="teee"
                type="text"
                placeholder={m.placeholder_search()}
                class="flex-1 px-2 py-2 border-0 rounded-xl focus:ring-0 focus:outline-none text-black placeholder-gray-400"
                />
            </div>
            <div class="py-3">
                {m.search_document()}
                <input
                value="teee"
                type="text"
                placeholder={m.placeholder_search()}
                class="flex-1 px-2 py-2 border-0 rounded-xl focus:ring-0 focus:outline-none text-black placeholder-gray-400"
                />
            </div>
        </div>
    {/if}
        
    <div class="flex flex-col  my-5 items-center">
        <div class="flex justify-center items-center w-[90%] py-3 text-white rounded-t-2xl bg-[#006664]">
                {m.search_document()}
        </div>

        <div class="flex mb-10 rounded-b-2xl text-xl pb-10 w-[90%] bg-[#f2f2f2]">
            {#if state===0}
                <div class="flex flex-1 flex-row w-full mt-10 justify-evenly items-center">
                    <button class="flex flex-col justify-center rounded-2xl items-center w-96 h-96 p-20 bg-[#D9D9D9]" 
                        onclick={()=>{state+=1}}
                    >    
                        <Icon icon="mdi:file-upload-outline" class=" w-40 h-40 mb-10"/>   
                        {m.search_document()}
                    </button>
                    <button class="flex flex-col justify-center rounded-2xl items-center w-96 h-96 p-20 bg-[#D9D9D9]"
                        onclick={()=>{alert("unavailable now")}}
                    >
                        <Icon icon="mdi:file-edit-outline" class="w-40 h-40 mb-10"/>
                        {m.search_document()}
                    </button>
                </div>
                
            {:else if state===1}
                <div class="flex flex-1 flex-col w-full justify-start">
                    {#each file[0].Userid as data}
                        <div class="flex flex-row justify-between items-center my-1 p-1 border-b-1 ">
                            <div class="pl-10 flex flex-row items-center">
                                <div class="flex justify-center items-center px-5">
                                    <Icon icon="mdi:file-outline" class="w-9 h-9" color="#006664"/>
                                </div>
                                {data}
                            </div>
                            <div>
                                <button class="p-2 mr-10 justify-end">
                                    <Icon icon="mdi:delete-circle-outline" class="w-9 h-9" color="#c83f3f"/>
                                </button>
                            </div>
                        </div>
                    {/each}
                    <div class="flex py-2 justify-center -mb-5 mt-5 text-m text-white">
                        <div class="flex flex-row items-center bg-[#B2BB1E] p-2 px-5 rounded-full">
                            <button>
                                <Icon icon="mdi:file-upload-outline" class="w-8 h-8" color="#fff"/>    
                            </button>
                            เพิ่มไฟล์
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        {#if state===1}
        <div class="flex flex-col w-[90%] py-2">
            <div class="flex flex-row">
                    โปรดเลือกผู้ที่ต้องเซ็นเอกสาร
                <div class="flex px-2  text-red-300">
                    โปรดเลือกผู้ที่ต้องเซ็นเอกสาร
                </div>
            </div>
            <div class="flex flex-col bg-[#fff] rounded-2xl">
                {#each file[0].Userid as data}
                        <div class="flex flex-row justify-between items-center py-3 border-b-1 last:border-b-0">
                            <div class="pl-10 flex flex-row items-center">
                                <div class="flex justify-center items-center px-5">
                                    <Icon icon="mdi:file-outline" class="w-9 h-9" color="#006664"/>
                                </div>
                                {data}
                            </div>
                            <div>
                                <button class="p-2 mr-10 justify-end">
                                    <Icon icon="mdi:chevron-down" class="w-9 h-9" color="#006664"/>
                                </button>
                            </div>
                        </div>
                    {/each}
            </div>
        </div>
        <div class="flex w-[90%] py-2 justify-end  text-white">
            <button class="flex flex-row  justify-end items-end bg-[#B2BB1E] p-2 px-10 rounded-full">
                ถัดไป
            </button>
        </div>
        {/if}
    </div>

</div>