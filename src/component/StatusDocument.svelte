<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	// Types now based on backend shape (can be moved to a shared types file later)
	type ProjectStatus = 'draft' | 'active' | 'archived';
	type SignerStatus = 'signed' | 'pending' | 'rejected';
	type Status = 'signed' | 'pending' | 'rejected';

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

	// Props (runes mode)
	const props = $props<{ project: Project | undefined }>();

	let orderedSigners = $state<Signer[]>([]);
	let signed = $state<Signer[]>([]);
	let pending = $state<Signer[]>([]);
	let rejected = $state<Signer[]>([]);
	let overallStatus = $state<'success' | 'process' | 'wait' | 'decline'>('wait');
	let select_category = $state<{ label: string; count: number }[]>([]);
	let pendingFiles = $state<
		{
			file: File;
			pending: Signer[];
			rejected: Signer[];
			completed: boolean;
		}[]
	>([]);

	$effect(() => {
		const p = props.project;
		if (!p) {
			orderedSigners = [];
			signed = [];
			pending = [];
			rejected = [];
			overallStatus = 'wait';
			select_category = [
				{ label: m.document_send(), count: 0 },
				{ label: m.document_wait(), count: 0 },
				{ label: m.document_process(), count: 0 },
				{ label: m.document_success(), count: 0 }
			];
			return;
		}

		const ordered =
			p.signers?.slice().sort((a: Signer, b: Signer) => a.position - b.position) ?? [];
		const signedLocal = ordered.filter((s: Signer) => s.signatureStatus === 'signed');
		const pendingLocal = ordered.filter((s: Signer) => s.signatureStatus === 'pending');
		const rejectedLocal = ordered.filter((s: Signer) => s.signatureStatus === 'rejected');

		let overall: typeof overallStatus = 'wait';
		if (rejectedLocal.length > 0) overall = 'decline';
		else if (
			p.summary &&
			p.summary.signaturesCompleted === p.summary.totalSigners &&
			p.summary.totalSigners > 0
		)
			overall = 'success';
		else if (signedLocal.length > 0) overall = 'process';

		orderedSigners = ordered;
		signed = signedLocal;
		pending = pendingLocal;
		rejected = rejectedLocal;
		overallStatus = overall;
		select_category = [
			{ label: m.document_send(), count: p.summary?.totalSigners ?? 0 },
			{ label: m.document_wait(), count: pendingLocal.length },
			{ label: m.document_process(), count: signedLocal.length },
			{
				label: m.document_success(),
				count:
					p.summary?.signaturesCompleted === p.summary?.totalSigners &&
					(p.summary?.totalSigners ?? 0) > 0
						? 1
						: 0
			}
		];

		// Build per-file pending list (only include files that are NOT fully signed)
		const byFile: Record<number, { file: File; signers: Signer[] }> = {};
		for (const f of p.files ?? []) {
			byFile[f.id] = { file: f, signers: [] };
		}
		for (const s of ordered) {
			if (byFile[s.projectFileId]) byFile[s.projectFileId].signers.push(s);
		}
		pendingFiles = Object.values(byFile)
			.map(({ file, signers }) => {
				const pend = signers.filter((s) => s.signatureStatus === 'pending');
				const rej = signers.filter((s) => s.signatureStatus === 'rejected');
				const completed =
					pend.length === 0 &&
					rej.length === 0 &&
					signers.length > 0 &&
					signers.every((s) => s.signatureStatus === 'signed');
				return { file, pending: pend, rejected: rej, completed };
			})
			.filter((g) => !g.completed);
	});

	function signerClasses(status: SignerStatus) {
		switch (status) {
			case 'signed':
				return { dot: 'bg-green-600', text: 'text-green-600', extra: '' };
			case 'pending':
				return { dot: 'border-2 border-green-600 bg-white', text: 'text-gray-700', extra: '' };
			case 'rejected':
				return { dot: 'bg-red-600', text: 'text-red-600', extra: 'line-through' };
		}
	}

	function overallStatusLabel() {
		switch (overallStatus) {
			case 'success':
				return m.document_success();
			case 'process':
				return m.document_process();
			case 'wait':
				return m.document_wait();
			case 'decline':
				return m.decline();
		}
	}

	function overallStatusColor() {
		switch (overallStatus) {
			case 'success':
				return 'text-green-500';
			case 'process':
				return 'text-blue-500';
			case 'wait':
				return 'text-gray-500';
			case 'decline':
				return 'text-red-500';
		}
	}
</script>

{#if props.project}
	<div class="px-30 py-10">
		<div class="mb-6 flex justify-evenly border-b font-medium text-gray-600">
			{#each select_category as item}
				<div class="cursor-default border-b-2 border-transparent pb-2">
					<span>{item.label}</span>
					<span class="ml-1 rounded-full bg-gray-200 px-2 text-xs font-semibold text-gray-700"
						>{item.count}</span
					>
				</div>
			{/each}
		</div>

		<div class="rounded-lg bg-gray-50 p-6 shadow-md">
			<p class="mb-2">
				<strong>{m.document_number()} :</strong>
				{props.project.projectCode ?? props.project.id}
			</p>
			<p class="mb-2"><strong>{m.document_name()} :</strong> {props.project.projectsName}</p>
			<p class="mb-6 font-semibold {overallStatusColor()}">{m.status()} : {overallStatusLabel()}</p>

			{#if orderedSigners.length === 0}
				<p class="text-center text-gray-400 italic">{m.document_notfound()}</p>
			{:else}
				{#each orderedSigners as signer, i (signer.id)}
					{@const cls = signerClasses(signer.signatureStatus)}
					<div class="relative flex flex-row items-center justify-start py-3">
						<div class="mx-5 h-4 w-4 rounded-full {cls.dot}"></div>
						<div>
							<p class="text-sm text-gray-500">Step {i + 1}</p>
							<p class="font-medium {cls.text} {cls.extra}">
								{signer.name} —
								{signer.signatureStatus === 'signed'
									? m.document_success()
									: signer.signatureStatus === 'pending'
										? m.document_wait()
										: m.decline()}
							</p>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		{#if pendingFiles.length > 0}
			<div class="mt-8 rounded-lg bg-white p-6 shadow">
				<h3 class="mb-4 text-lg font-semibold text-gray-700">
					เอกสารที่ยังไม่สมบูรณ์ / Pending Documents
				</h3>
				{#each pendingFiles as group (group.file.id)}
					<div class="mb-5 rounded border border-gray-200 p-4">
						<div class="mb-2 flex items-center justify-between">
							<p class="font-medium text-gray-800">{group.file.fileName}</p>
							<span class="text-xs text-gray-500">
								{group.pending.length} pending{group.rejected.length
									? ` · ${group.rejected.length} rejected`
									: ''}
							</span>
						</div>
						{#if group.rejected.length > 0}
							<div class="mb-2 rounded bg-red-50 p-2 text-xs text-red-600">
								ปฏิเสธ: {group.rejected.map((r) => r.name).join(', ')}
							</div>
						{/if}
						{#if group.pending.length > 0}
							<ul class="space-y-1">
								{#each group.pending as ps (ps.id)}
									<li class="flex items-center text-sm text-gray-600">
										<span class="mr-2 inline-block h-2 w-2 rounded-full border-2 border-green-600"
										></span>
										<span>{ps.position}. {ps.name} ({ps.email})</span>
									</li>
								{/each}
							</ul>
						{:else}
							<p class="text-xs text-gray-400 italic">No pending signers</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<p class="text-center text-gray-400">{m.document_notfound()}</p>
{/if}
