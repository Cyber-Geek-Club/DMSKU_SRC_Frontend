<script lang="ts">
	import type { DocItem } from '$lib/api/document';
	import { Trash } from '@lucide/svelte';

	let {
		doc,
		expanded = false,
		isUploading = false,
		preview = (() => {}) as (p: { doc: DocItem }) => void,
		remove = (() => {}) as (p: { doc: DocItem }) => void,
		toggle = (() => {}) as (p: { doc: DocItem }) => void,
		addsigner = (() => {}) as (p: { doc: DocItem }) => void,
		updatesigner = (() => {}) as (p: {
			doc: DocItem;
			id: string;
			field: 'name' | 'email';
			value: string;
		}) => void,
		removesigner = (() => {}) as (p: { doc: DocItem; id: string }) => void,
		movesigner = (() => {}) as (p: { doc: DocItem; id: string; dir: -1 | 1 }) => void
	} = $props<{
		doc: DocItem;
		expanded?: boolean;
		isUploading?: boolean;
		preview?: (p: { doc: DocItem }) => void;
		remove?: (p: { doc: DocItem }) => void;
		toggle?: (p: { doc: DocItem }) => void;
		addsigner?: (p: { doc: DocItem }) => void;
		updatesigner?: (p: {
			doc: DocItem;
			id: string;
			field: 'name' | 'email';
			value: string;
		}) => void;
		removesigner?: (p: { doc: DocItem; id: string }) => void;
		movesigner?: (p: { doc: DocItem; id: string; dir: -1 | 1 }) => void;
	}>();

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
			<button class="preview-trigger-btn" type="button" onclick={emitPreview} disabled={!doc.file}
				>Preview</button
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
				{#each doc.signers as signer, i (signer.id)}
					<li class="flex flex-col gap-1 rounded border border-gray-300 bg-white p-2">
						<div class="flex items-center justify-between gap-2">
							<div class="flex items-center gap-2">
								<span
									class="inline-flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-[11px] font-semibold"
									>{signer.order}</span
								>
								<button
									class="rounded border px-1 text-[10px] hover:bg-gray-100 disabled:opacity-30"
									onclick={() => emitMoveSigner(signer.id, -1)}
									disabled={i === 0}
									type="button">↑</button
								>
								<button
									class="rounded border px-1 text-[10px] hover:bg-gray-100 disabled:opacity-30"
									onclick={() => emitMoveSigner(signer.id, 1)}
									disabled={i === doc.signers.length - 1}
									type="button">↓</button
								>
							</div>
							<button
								class="rounded p-1 text-red-600 hover:bg-red-50"
								onclick={() => emitRemoveSigner(signer.id)}
								aria-label={`Remove signer ${i + 1}`}
								type="button">✕</button
							>
						</div>
						<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
							<input
								class="w-full rounded border px-2 py-1 text-xs focus:ring focus:outline-none"
								placeholder="ชื่อ"
								value={signer.name}
								oninput={(e) =>
									emitUpdateSigner(signer.id, 'name', (e.target as HTMLInputElement).value)}
							/>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
