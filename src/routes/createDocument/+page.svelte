<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import Icon from '@iconify/svelte';
	import { file } from '../../Tempdata';
	let state = $state(0);
</script>

<div class="flex h-full flex-col bg-[#D9D9D9]">
	{#if state === 1}
		<div class="text-l flex items-center justify-evenly pt-5">
			<div class="py-3">
				{m.search_document()}
				<input
					value="teee"
					type="text"
					placeholder={m.placeholder_search()}
					class="flex-1 rounded-xl border-0 px-2 py-2 text-black placeholder-gray-400 focus:ring-0 focus:outline-none"
				/>
			</div>
			<div class="py-3">
				{m.search_document()}
				<input
					value="teee"
					type="text"
					placeholder={m.placeholder_search()}
					class="flex-1 rounded-xl border-0 px-2 py-2 text-black placeholder-gray-400 focus:ring-0 focus:outline-none"
				/>
			</div>
		</div>
	{/if}

	<div class="my-5 flex h-full flex-col items-center">
		<div
			class="flex w-[90%] items-center justify-center rounded-t-2xl bg-[#006664] py-3 text-white"
		>
			{m.search_document()}
		</div>

		<div class="mb-10 flex h-full w-[90%] rounded-b-2xl bg-[#f2f2f2] pb-10 text-xl">
			{#if state === 0}
				<div class="mt-10 flex w-full flex-1 flex-row items-center justify-evenly">
					<button
						class="flex h-96 w-96 flex-col items-center justify-center rounded-2xl bg-[#D9D9D9] p-20"
						onclick={() => {
							state += 1;
						}}
					>
						<Icon icon="mdi:file-upload-outline" class=" mb-10 h-40 w-40" />
						{m.search_document()}
					</button>
					<button
						class="flex h-96 w-96 flex-col items-center justify-center rounded-2xl bg-[#D9D9D9] p-20"
						onclick={() => {
							alert('unavailable now');
						}}
					>
						<Icon icon="mdi:file-edit-outline" class="mb-10 h-40 w-40" />
						{m.search_document()}
					</button>
				</div>
			{:else if state === 1}
				<div class="flex w-full flex-1 flex-col justify-start">
					{#each file[0].Userid as data}
						<div class="my-1 flex flex-row items-center justify-between border-b-1 p-1">
							<div class="flex flex-row items-center pl-10">
								<div class="flex items-center justify-center px-5">
									<Icon icon="mdi:file-outline" class="h-9 w-9" color="#006664" />
								</div>
								{data}
							</div>
							<div>
								<button class="mr-10 justify-end p-2">
									<Icon icon="mdi:delete-circle-outline" class="h-9 w-9" color="#c83f3f" />
								</button>
							</div>
						</div>
					{/each}
					<div class="text-m mt-5 -mb-5 flex justify-center py-2 text-white">
						<div class="flex flex-row items-center rounded-full bg-[#B2BB1E] p-2 px-5">
							<button>
								<Icon icon="mdi:file-upload-outline" class="h-8 w-8" color="#fff" />
							</button>
							เพิ่มไฟล์
						</div>
					</div>
				</div>
			{/if}
		</div>

		{#if state === 1}
			<div class="flex w-[90%] flex-col py-2">
				<div class="flex flex-row">
					โปรดเลือกผู้ที่ต้องเซ็นเอกสาร
					<div class="flex px-2 text-red-300">โปรดเลือกผู้ที่ต้องเซ็นเอกสาร</div>
				</div>
				<div class="flex flex-col rounded-2xl bg-[#fff]">
					{#each file[0].Userid as data}
						<div class="flex flex-row items-center justify-between border-b-1 py-3 last:border-b-0">
							<div class="flex flex-row items-center pl-10">
								<div class="flex items-center justify-center px-5">
									<Icon icon="mdi:file-outline" class="h-9 w-9" color="#006664" />
								</div>
								{data}
							</div>
							<div>
								<button class="mr-10 justify-end p-2">
									<Icon icon="mdi:chevron-down" class="h-9 w-9" color="#006664" />
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="flex w-[90%] justify-end py-2 text-white">
				<button class="flex flex-row items-end justify-end rounded-full bg-[#B2BB1E] p-2 px-10">
					ถัดไป
				</button>
			</div>
		{/if}
	</div>
</div>
