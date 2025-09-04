<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	// Accept flexible project shapes from backend
	const props = $props<{ project?: any }>();

	let orderedSigners = $state<any[]>([]);
	let filesById = $state<Record<number, any>>({});
	let overallStatus = $state<'success' | 'process' | 'wait' | 'decline'>('wait');
	let progress = $state<number>(0);

	$effect(() => {
		const p = props.project;
		if (!p) {
			orderedSigners = [];
			filesById = {};
			overallStatus = 'wait';
			progress = 0;
			return;
		}

		// normalize signers locally to avoid reading/writing the same reactive variable inside the effect
		const signers = (p.signers ?? [])
			.slice()
			.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
		const normalized = signers.map((s: any) => ({
			...s,
			name: s.name ?? s.userName ?? s.user_name ?? '',
			email: s.email ?? s.userEmail ?? s.user_email ?? '',
			projectFileId: s.projectFileId ?? s.project_file_id ?? s.projectFileId
		}));

		// build files map locally
		const map: Record<number, any> = {};
		for (const f of p.files ?? []) {
			map[f.id] = f;
		}

		// compute status/progress from normalized signers (do not read orderedSigners here)
		const signedLocal = normalized.filter((s: any) => s.signatureStatus === 'signed');
		const pendingLocal = normalized.filter((s: any) => s.signatureStatus === 'pending');
		const rejectedLocal = normalized.filter((s: any) => s.signatureStatus === 'rejected');

		let newOverall: typeof overallStatus = 'wait';
		if (rejectedLocal.length > 0) newOverall = 'decline';
		else if (
			(p.summary?.signaturesCompleted ?? 0) === (p.summary?.totalSigners ?? 0) &&
			(p.summary?.totalSigners ?? 0) > 0
		)
			newOverall = 'success';
		else if (signedLocal.length > 0) newOverall = 'process';

		const total = p.summary?.totalSigners ?? normalized.length ?? 0;
		const done = p.summary?.signaturesCompleted ?? signedLocal.length ?? 0;
		const newProgress = total > 0 ? Math.round((done / total) * 100) : 0;

		// assign reactive state only once at the end
		orderedSigners = normalized;
		filesById = map;
		overallStatus = newOverall;
		progress = newProgress;
	});

	function statusBadge(status: string) {
		switch (status) {
			case 'signed':
				return 'bg-green-100 text-green-700';
			case 'pending':
				return 'bg-yellow-100 text-yellow-700';
			case 'rejected':
				return 'bg-red-100 text-red-700';
			case 'draft':
				return 'bg-gray-100 text-gray-700';
			case 'active':
				return 'bg-blue-100 text-blue-700';
			case 'archived':
				return 'bg-gray-200 text-gray-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}

	function getProjectName(p: any) {
		return p?.projectName ?? p?.projectsName ?? p?.project_name ?? '';
	}

	function formatDate(d: string | number | null | undefined) {
		if (!d) return '-';
		try {
			return new Date(d).toLocaleString();
		} catch (e) {
			return String(d);
		}
	}
</script>

{#if props.project}
	<div class="mx-auto max-w-4xl p-6">
		<!-- Header / Tracking card -->
		<div class="mb-6 rounded-lg bg-white p-6 shadow-md">
			<div class="flex flex-col items-start justify-between md:flex-row md:items-center">
				<div>
					<h2 class="text-xl font-semibold">{getProjectName(props.project)}</h2>
					<p class="text-sm text-gray-500">
						{m.document_number()}:
						<strong class="ml-1"
							>{props.project.projectNumber ??
								props.project.projectCode ??
								props.project.projectCode ??
								props.project.id}</strong
						>
					</p>
					<p class="text-sm text-gray-500">
						{m.document_name()}:
						<strong class="ml-1"
							>{props.project.projectName ?? props.project.projectsName ?? '-'}</strong
						>
					</p>
				</div>
				<div class="mt-3 text-right md:mt-0">
					<div
						class="mb-2 inline-flex items-center rounded px-3 py-1 text-sm font-medium {statusBadge(
							props.project.status ?? props.project.state ?? 'draft'
						)}"
					>
						{props.project.status ?? props.project.state ?? 'draft'}
					</div>
					<div class="text-xs text-gray-500">
						Created: {formatDate(props.project.created_at ?? props.project.createdAt)}
					</div>
				</div>
			</div>

			<div class="mt-4">
				<div class="flex items-center justify-between">
					<div>
						<div class="text-sm text-gray-500">Tracking Code</div>
						<div class="text-2xl font-bold">
							{props.project.projectCode ?? props.project.projectNumber ?? props.project.id}
						</div>
					</div>
					<div class="w-full md:w-2/5">
						<div class="mb-1 text-sm text-gray-500">Progress</div>
						<div class="h-3 w-full overflow-hidden rounded bg-gray-100">
							<div class="h-3 rounded bg-green-500" style="width: {progress}%"></div>
						</div>
						<div class="mt-1 text-xs text-gray-500">
							{progress}% — {props.project.summary?.signaturesCompleted ?? 0}/{props.project.summary
								?.totalSigners ?? 0} signatures
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Timeline / Signers -->
		<div class="mb-6 rounded-lg bg-white p-6 shadow-md">
			<h3 class="mb-4 text-lg font-semibold">Tracking steps</h3>
			<div class="space-y-4">
				{#each orderedSigners as s, i (s.id)}
					<div class="flex flex-col items-start space-y-3 md:flex-row md:space-y-0 md:space-x-4">
						<div class="flex items-center md:flex-col">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full {s.signatureStatus ===
								'signed'
									? 'bg-green-500 text-white'
									: s.signatureStatus === 'rejected'
										? 'bg-red-500 text-white'
										: 'border-2 border-gray-300 text-gray-700'}"
							>
								{i + 1}
							</div>
							{#if i < orderedSigners.length - 1}
								<div class="mt-2 hidden h-full w-px flex-1 bg-gray-200 md:block"></div>
							{/if}
						</div>
						<div class="flex-1">
							<div class="flex flex-col justify-between md:flex-row md:items-center">
								<div class="break-words">
									<div
										class="font-medium {s.signatureStatus === 'signed'
											? 'text-green-600'
											: s.signatureStatus === 'rejected'
												? 'text-red-600'
												: 'text-gray-700'}"
									>
										{s.name ?? s.userName}
									</div>
									<div class="text-xs text-gray-500">
										{s.email ?? s.userEmail} — {filesById[s.projectFileId]?.fileName ??
											filesById[s.projectFileId]?.file_name ??
											'-'}
									</div>
								</div>
								<div class="mt-2 text-sm md:mt-0">
									<span
										class="rounded px-2 py-1 text-xs font-semibold {statusBadge(s.signatureStatus)}"
										>{s.signatureStatus}</span
									>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Files list -->
		<div class="rounded-lg bg-white p-6 shadow-md">
			<h3 class="mb-4 text-lg font-semibold">Files ({(props.project.files ?? []).length})</h3>
			<div class="space-y-3">
				{#each props.project.files ?? [] as f (f.id)}
					<div class="flex items-center justify-between rounded border p-3">
						<div>
							<div class="font-medium">{f.fileName ?? f.file_name}</div>
							<div class="text-xs text-gray-500">
								{f.description ?? f.contentType ?? ''} • {formatDate(f.created_at ?? f.createdAt)}
							</div>
						</div>
						<div class="text-right">
							<div class="text-sm text-gray-500">Signers:</div>
							<div class="mt-1 flex items-center space-x-2">
								{#each (props.project.signers ?? []).filter((s: any) => s.projectFileId === f.id || s.project_file_id === f.id) as sf (sf.id)}
									<span class="rounded px-2 py-1 text-xs {statusBadge(sf.signatureStatus)}"
										>{sf.name ?? sf.userName} · {sf.signatureStatus}</span
									>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<p class="text-center text-gray-400">{m.document_notfound()}</p>
{/if}
