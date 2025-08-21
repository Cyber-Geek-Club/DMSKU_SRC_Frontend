<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	export let data: {
		Userid: string;
		documentname: string;
		status: number;
		waituser: string[];
	};

	const select_catagory = [
		{ label: m.document_send() },
		{ label: m.document_wait() },
		{ label: m.document_process() },
		{ label: m.document_success() }
	];
</script>

{#if data && data.waituser && data.waituser.length > 0}
	<div class="px-30 py-10">
		<div class="mb-6 flex justify-evenly border-b font-medium text-gray-600">
			{#each select_catagory as item}
				<div class="cursor-pointer border-b-2 border-transparent pb-2 hover:border-[#B2BB1E]">
					{item.label}
				</div>
			{/each}
		</div>

		<div class="rounded-lg bg-gray-50 p-6 shadow-md">
			<p class="mb-2"><strong>{m.document_number()} :</strong> {data.Userid}</p>
			<p class="mb-2"><strong>{m.document_name()} :</strong> {data.documentname}</p>
			<p class="mb-6 {data.status == 2 ? 'text-green-500' : 'text-red-500'} font-semibold">
				{m.status()} : {data.status == 2
					? m.document_success()
					: data.status == 1
						? m.document_process()
						: m.decline()}
			</p>

			{#each data.waituser as user, i}
				<div class="relative flex flex-row items-center justify-center py-3">
					<div
						class="h-4 w-4
                        {i === data.waituser.length - 1
							? 'bg-green-600'
							: 'border-2 border-green-600 bg-white'}
                        mx-5 rounded-full"
					></div>

					<div>
						<p class="text-sm text-gray-500">Step {i + 1}</p>
						<p class="font-medium">{m.username()} {user} {m.document_wait()}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<p class="text-center text-gray-400">{m.document_notfound()}</p>
{/if}
