<script lang="ts">
	import type { DocItem } from '$lib/api/document';
	import { Trash } from '@lucide/svelte';

	let {
		doc,
		allUsers = [],
		expanded = false,
		isUploading = false,
		preview = (() => {}) as (p: { doc: DocItem }) => void,
		remove = (() => {}) as (p: { doc: DocItem }) => void,
		toggle = (() => {}) as (p: { doc: DocItem }) => void,
		addsigner = (() => {}) as (p: { doc: DocItem }) => void,
		updatesigner = (() => {}) as (p: {
			doc: DocItem;
			id: string; // signer.key
			field: 'name' | 'email';
			value: string;
		}) => void,
		removesigner = (() => {}) as (p: { doc: DocItem; id: string }) => void,
		movesigner = (() => {}) as (p: { doc: DocItem; id: string; dir: -1 | 1 }) => void
	} = $props<{
		doc: DocItem;
		allUsers?: { id: number | null; name: string; email: string }[];
		expanded?: boolean;
		isUploading?: boolean;
		preview?: (p: { doc: DocItem }) => void;
		remove?: (p: { doc: DocItem }) => void;
		toggle?: (p: { doc: DocItem }) => void;
		addsigner?: (p: { doc: DocItem }) => void;
		updatesigner?: (p: {
			doc: DocItem;
			id: string; // signer.key
			field: 'name' | 'email';
			value: string;
		}) => void;
		removesigner?: (p: { doc: DocItem; id: string }) => void;
		movesigner?: (p: { doc: DocItem; id: string; dir: -1 | 1 }) => void;
	}>();

	type UserOption = { id: number | null; name: string; email: string };
	let openSuggestFor = $state<string | null>(null); // signer.key ที่เปิด dropdown
	let query: Record<string, string> = {}; // เก็บข้อความที่พิมพ์ชื่อ

	function filteredUsers(signerId: string): UserOption[] {
		const q = (query[signerId] || '').trim().toLowerCase();
		if (!q) return [];
		return (allUsers as UserOption[])
			.filter(
				(u: UserOption) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
			)
			.slice(0, 8);
	}

	function chooseUser(signerKey: string, u: UserOption) {
		// update name/email fields
		emitUpdateSigner(signerKey, 'name', u.name);
		emitUpdateSigner(signerKey, 'email', u.email);
		query[signerKey] = u.name;
		openSuggestFor = null;
		// direct userId assignment is handled in parent via updateSigner when saving (not needed here)
	}

	function emitPreview() {
		preview({ doc });
	}
	function emitRemove() {
		remove({ doc });
	}
	function emitToggle() {
		toggle({ doc });
	}
	function emitAddSigner() {
		addsigner({ doc });
	}
	function emitUpdateSigner(id: string, field: 'name' | 'email', value: string) {
		updatesigner({ doc, id, field, value });
	}
	function emitRemoveSigner(id: string) {
		removesigner({ doc, id });
	}
	function emitMoveSigner(id: string, dir: -1 | 1) {
		movesigner({ doc, id, dir });
	}
</script>

<div class="flex flex-col gap-2 rounded-lg bg-white p-3 shadow-md">
	<div class="flex items-start justify-between gap-4">
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="h-6 w-6 shrink-0 rounded border text-xs font-bold text-gray-600 hover:bg-gray-100"
				onclick={emitToggle}
				aria-label={expanded ? 'Collapse signer panel' : 'Expand signer panel'}
			>
				{expanded ? '▾' : '▸'}
			</button>
			<span class="truncate text-sm font-medium" title={doc.name}>{doc.name}</span>
		</div>
		<div class="flex items-center gap-2">
			<button
				class="preview-trigger-btn"
				type="button"
				onclick={emitPreview}
				disabled={!doc.file && !doc.projectFileId}>Preview</button
			>
			{#if doc.status === 'error'}
				<span class="text-xs text-red-600" title={doc.error}>Error</span>
			{:else if doc.status === 'done'}
				<span class="text-xs text-green-600">Done</span>
			{:else if doc.status === 'uploading'}
				<span class="text-xs text-blue-600">{doc.progress}%</span>
			{:else}
				<span class="text-xs text-gray-500">Pending</span>
			{/if}
			<button
				type="button"
				class="rounded p-1 hover:bg-red-50"
				onclick={emitRemove}
				aria-label="Remove document {doc.name}"
				disabled={isUploading && doc.status === 'uploading'}
			>
				<Trash class="cursor-pointer text-red-600 hover:text-red-800" />
			</button>
		</div>
	</div>
	<div class="h-2 w-full rounded bg-gray-200" aria-hidden="true">
		<div
			class="h-full rounded bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-200"
			style={`width: ${doc.progress}%; opacity: ${doc.status === 'pending' ? 0.25 : 1}`}
		></div>
	</div>
	{#if expanded}
		<div class="mt-2 rounded border border-gray-200 bg-gray-50 p-3 text-xs">
			<div class="mb-2 flex items-center gap-4">
				<span class="font-semibold">Signers (ลำดับการเซ็น)</span>
				<button
					class="rounded bg-ku-dark-green px-2 py-1 text-white hover:opacity-90"
					onclick={emitAddSigner}
					type="button"
				>
					+ Add
				</button>
			</div>
			{#if doc.signers.length === 0}
				<p class="text-gray-500 italic">ยังไม่มีผู้เซ็น</p>
			{/if}
			<ul class="flex flex-col gap-2">
				{#each doc.signers as signer, i (signer.key)}
					<li class="flex flex-col gap-1 rounded border border-gray-300 bg-white p-2">
						<div class="flex items-center justify-between gap-2">
							<div class="flex items-center gap-2">
								<span
									class="inline-flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-[11px] font-semibold"
									>{signer.order}</span
								>
								<button
									class="rounded border px-1 text-[10px] hover:bg-gray-100 disabled:opacity-30"
									onclick={() => emitMoveSigner(signer.key, -1)}
									disabled={i === 0}
									type="button">↑</button
								>
								<button
									class="rounded border px-1 text-[10px] hover:bg-gray-100 disabled:opacity-30"
									onclick={() => emitMoveSigner(signer.key, 1)}
									disabled={i === doc.signers.length - 1}
									type="button">↓</button
								>
							</div>
							<button
								class="rounded p-1 text-red-600 hover:bg-red-50"
								onclick={() => emitRemoveSigner(signer.key)}
								aria-label={`Remove signer ${i + 1}`}
								type="button">✕</button
							>
						</div>
						<div class="relative grid grid-cols-1 gap-2 md:grid-cols-2">
							<input
								class="w-full rounded border px-2 py-1 text-xs focus:ring focus:outline-none"
								placeholder="ชื่อผู้เซ็น (เริ่มพิมพ์เพื่อค้นหา)"
								value={signer.name}
								onfocus={() => {
									query[signer.key] = signer.name;
									openSuggestFor = signer.key;
								}}
								oninput={(e) => {
									const val = (e.target as HTMLInputElement).value;
									query[signer.key] = val;
									emitUpdateSigner(signer.key, 'name', val);
									openSuggestFor = signer.key;
								}}
								onblur={() => {
									setTimeout(() => {
										if (openSuggestFor === signer.key) openSuggestFor = null;
									}, 200);
								}}
							/>
							{#if openSuggestFor === signer.key && filteredUsers(signer.key).length > 0}
								<ul
									class="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded border bg-white text-xs shadow"
								>
									{#each filteredUsers(signer.key) as u}
										<li>
											<button
												type="button"
												class="flex w-full cursor-pointer items-center justify-start gap-1 px-2 py-1 text-left hover:bg-gray-100"
												onmousedown={(e) => {
													e.preventDefault();
													chooseUser(signer.key, u);
												}}
											>
												<strong>{u.name}</strong>
												<span class="text-gray-500"> — {u.email}</span>
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
	{/if}
</div>
