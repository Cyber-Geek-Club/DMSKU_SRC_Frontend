<script lang="ts">
	import { Trash, Eye } from '@lucide/svelte';
	import type { UserType } from '../../types/user-types';

	export let files: Array<{
		file?: File | null;
		fileId?: number;
		fileName?: string;
		signers: Array<{ key: string; name: string }>;
		progress?: number;
		status?: 'pending' | 'uploading' | 'done' | 'error';
		error?: string;
		isExisting?: boolean;
	}> = [];
	export let allUsers: Array<UserType> = [];
	export let onRemoveFile = (idx: number) => {};
	export let onAddSigner = (fileIdx: number) => {};
	export let onRemoveSigner = (fileIdx: number, signerIdx: number) => {};
	export let onUpdateSigner = (
		fileIdx: number,
		signerIdx: number,
		field: 'name',
		value: string
	) => {};
	export let onMoveSigner = (fileIdx: number, signerIdx: number, dir: -1 | 1) => {};
	export let onPreview = (
		fileObj: {
			file?: File | null;
			fileId?: number;
			fileName?: string;
			signers: Array<{ key: string; name: string }>;
		},
		idx: number
	) => {};

	let openSuggestFor: { fileIdx: number; signerIdx: number } | null = null;
	function filteredUsers(val: string) {
		return allUsers.filter((u) => u.name.toLowerCase().includes(val.toLowerCase()));
	}

	function chooseUser(fileIdx: number, signerIdx: number, u: UserType) {
		onUpdateSigner(fileIdx, signerIdx, 'name', u.name);
		openSuggestFor = null;
	}
</script>

<div class="flex flex-col gap-4">
	{#each files as fileObj, fileIdx}
		<div class="rounded-lg bg-white p-3 shadow">
			<div class="flex items-center justify-between">
				<span class="font-medium">
					{#if fileObj.file}
						{fileObj.file.name}
					{:else}
						{fileObj.fileName ?? 'Unnamed file'}
					{/if}
					{#if fileObj.isExisting}
						<span class="badge-existing">ไฟล์เดิม</span>
					{:else}
						<span class="badge-new">ไฟล์ใหม่</span>
					{/if}
				</span>
				<div class="flex gap-2">
					<button
						type="button"
						class="rounded p-1 hover:bg-blue-50"
						onclick={() => onPreview(fileObj, fileIdx)}
						aria-label="Preview"
					>
						<Eye class="text-blue-600 hover:text-blue-800" />
					</button>
					<button
						type="button"
						class="rounded p-1 hover:bg-red-50"
						onclick={() => onRemoveFile(fileIdx)}
						aria-label="Remove"
					>
						<Trash class="text-red-600 hover:text-red-800" />
					</button>
				</div>
			</div>

			<div class="mb-2">
				{#if fileObj.status === 'uploading'}
					<div class="mb-1 h-2 w-full rounded bg-gray-200">
						<div
							class="h-full rounded bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-200"
							style={`width: ${fileObj.progress ?? 0}%; opacity: 1`}
						></div>
					</div>
					<span class="text-xs text-blue-600">{fileObj.progress ?? 0}% กำลังอัปโหลด</span>
				{:else if fileObj.status === 'done'}
					<span class="text-xs text-green-600">อัปโหลดสำเร็จ</span>
				{:else if fileObj.status === 'error'}
					<span class="text-xs text-red-600">{fileObj.error ?? 'เกิดข้อผิดพลาด'}</span>
				{:else}
					<span class="text-xs text-gray-500">รออัปโหลด</span>
				{/if}
			</div>
			<div class="mt-2 rounded border bg-gray-50 p-3 text-xs">
				<div class="mb-2 flex items-center gap-4">
					<span class="font-semibold">Signers</span>
					<button
						class="rounded bg-ku-dark-green px-2 py-1 text-white hover:opacity-90"
						onclick={() => onAddSigner(fileIdx)}
						type="button"
					>
						+ Add
					</button>
				</div>
				{#if fileObj.signers.length === 0}
					<p class="text-gray-500 italic">No signers yet</p>
				{/if}
				<ul class="flex flex-col gap-2">
					{#each fileObj.signers as signer, signerIdx (signer.key)}
						<li class="flex flex-col gap-1 rounded border bg-white p-2">
							<div class="flex items-center justify-between gap-2">
								<div class="flex items-center gap-2">
									<span
										class="inline-flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-[11px] font-semibold"
										>{signerIdx + 1}</span
									>
									<button
										class="rounded border px-1 text-[10px] hover:bg-gray-100 disabled:opacity-30"
										onclick={() => onMoveSigner(fileIdx, signerIdx, -1)}
										disabled={signerIdx === 0}
										type="button">↑</button
									>
									<button
										class="rounded border px-1 text-[10px] hover:bg-gray-100 disabled:opacity-30"
										onclick={() => onMoveSigner(fileIdx, signerIdx, 1)}
										disabled={signerIdx === fileObj.signers.length - 1}
										type="button">↓</button
									>
								</div>
								<button
									class="rounded p-1 text-red-600 hover:bg-red-50"
									onclick={() => onRemoveSigner(fileIdx, signerIdx)}
									type="button">✕</button
								>
							</div>
							<div class="relative">
								<input
									class="w-full rounded border px-2 py-1 text-xs focus:ring focus:outline-none"
									placeholder="Signer name (type to search)"
									bind:value={signer.name}
									oninput={(e) => {
										const val = (e.target as HTMLInputElement).value;
										onUpdateSigner(fileIdx, signerIdx, 'name', val);
										openSuggestFor = { fileIdx, signerIdx };
									}}
									onblur={() => {
										setTimeout(() => {
											if (
												openSuggestFor?.fileIdx === fileIdx &&
												openSuggestFor?.signerIdx === signerIdx
											)
												openSuggestFor = null;
										}, 200);
									}}
								/>
								{#if openSuggestFor?.fileIdx === fileIdx && openSuggestFor?.signerIdx === signerIdx && filteredUsers(signer.name).length > 0}
									<ul
										class="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded border bg-white text-xs shadow"
									>
										{#each filteredUsers(signer.name) as u}
											<li>
												<button
													type="button"
													class="flex w-full items-center gap-1 px-2 py-1 text-left hover:bg-gray-100"
													onmousedown={(e) => {
														e.preventDefault();
														chooseUser(fileIdx, signerIdx, u);
													}}
												>
													<strong>{u.name}</strong>
												</button>
											</li>
										{/each}
									</ul>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/each}
</div>

<style>
	.badge-existing {
		display: inline-block;
		margin-left: 0.5em;
		padding: 2px 8px;
		font-size: 0.75em;
		background: #e0e7ff;
		color: #222;
		border-radius: 8px;
		font-weight: 600;
		vertical-align: middle;
	}
	.badge-new {
		display: inline-block;
		margin-left: 0.5em;
		padding: 2px 8px;
		font-size: 0.75em;
		background: #d1fae5;
		color: #222;
		border-radius: 8px;
		font-weight: 600;
		vertical-align: middle;
	}
</style>
