<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import InputSearch from '../../component/InputSearch.svelte';
	import StatusDocument from '../../component/StatusDocument.svelte';
	import { project as projectApi } from '$lib/api/project';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	// Types
	type ProjectStatus = 'draft' | 'active' | 'archived';
	type SignerStatus = 'signed' | 'pending' | 'rejected';
	interface FileSummary {
		totalFiles: number;
		totalSigners: number;
		signaturesCompleted: number;
	}
	interface File {
		id: number;
		projectsId: number;
		fileName: string;
		description: string;
		updated_at: number | string | null;
		created_at: number | string;
		deleted_at: number | string | null;
	}
	interface Signer {
		id: number;
		projectFileId: number;
		signerUserId: number;
		position: number;
		name: string;
		email: string;
		signatureStatus: SignerStatus;
		signedAt: string | number;
	}
	interface Project {
		id: number;
		projectsName: string;
		ownerUserId: number;
		type: 'uploaded' | 'generated';
		status: ProjectStatus;
		projectCode?: string;
		updated_at: number | string | null;
		created_at: number | string;
		deleted_at: number | string | null;
		files: File[];
		signers: Signer[];
		summary: FileSummary;
	}

	let codeSearch = $state('');
	let project = $state<Project | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function loadProjectByCode(code: string) {
		loading = true;
		error = null;
		project = null;
		try {
			const res = await projectApi.getByCode(code);
			if (res.status === 200) {
				project = res.data;
			} else {
				error = `Error: ${res.status} ${res.statusText}`;
			}
		} catch (err: any) {
			error = err?.response?.data?.message || err.message || 'Unknown error';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		const code = page.url.searchParams.get('code') || '';
		if (code) {
			codeSearch = code;
			loadProjectByCode(code.trim());
		}
	});

	function searchNow() {
		loadProjectByCode(codeSearch);
	}
</script>

<div class="flex h-screen flex-col">
	<div class="h-[30%]">
		<div class="flex h-full flex-col items-center justify-center bg-[#007775]">
			<div class="py-3 text-2xl text-white">
				{m.search_document()}
			</div>
			<InputSearch bind:onTextChange={codeSearch} onSearch={() => searchNow()} />
		</div>

		{#if loading}
			<p class="mt-4 text-center text-sm text-gray-500">Loading...</p>
		{:else if error}
			<p class="mt-4 text-center text-sm text-red-500">{error}</p>
		{:else if project}
			<StatusDocument {project} />
		{:else if codeSearch}
			<p class="mt-4 text-center text-sm text-gray-400">{m.document_notfound()}</p>
		{/if}
	</div>
</div>
