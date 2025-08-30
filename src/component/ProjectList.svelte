<script lang="ts">
	import './ProjectList.css';
	import { m } from '$lib/paraglide/messages.js';
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';

	// ProjectStatus (raw) may come from backend but UI filtering now derives status from signers.
	// Raw project status (not currently driving UI logic)
	type ProjectStatus = 'draft' | 'active' | 'archived';
	// SignerStatus from backend
	type SignerStatus = 'signed' | 'pending' | 'rejected';
	// Unified status used in UI (currently same literal union)
	type Status = 'signed' | 'pending' | 'rejected';
	type StatusView = { label: string; pillCls: string; dotCls: string };

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
		updated_at: number | string | null;
		created_at: number | string;
		deleted_at: number | string | null;
		files: File[];
		signers: Signer[];
		summary: FileSummary;
	}

	// Active tab now based on derived signer-based statuses
	let active = $state<'all' | SignerStatus>('all');

	let showAddMenu = $state(false);
	let addMenuEl: HTMLElement | null = null;
	let fileInput: HTMLInputElement | null = null;

	function toggleAddMenu(e: MouseEvent) {
		e.stopPropagation();
		showAddMenu = !showAddMenu;
	}

	function handleCreate() {
		showAddMenu = false;
		goto('/createDocument');
	}

	function triggerUpload() {
		goto('/main/upload');
	}

	function handleFile(e: Event) {
		const target = e.target as HTMLInputElement;
		const f = target.files?.[0];
		if (f) {
			console.log('Selected file to upload:', f.name);
		}
		showAddMenu = false;
	}

	function onDocClick(e: MouseEvent) {
		if (addMenuEl && !addMenuEl.contains(e.target as Node)) {
			showAddMenu = false;
		}
	}

	onMount(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('click', onDocClick);
		}
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('click', onDocClick);
		}
	});

	let { searchText, projects = [] as Project[] } = $props();

	const allProjects = $derived(Array.isArray(projects) ? projects : []);

	function deriveProjectStatus(p: Project): SignerStatus {
		// Rule: any rejected -> rejected; else all signed -> signed; else pending
		const signers = p.signers || [];
		if (!signers.length) return 'pending';
		if (signers.some((s) => s.signatureStatus === 'rejected')) return 'rejected';
		return signers.every((s) => s.signatureStatus === 'signed') ? 'signed' : 'pending';
	}

	// Counts for tabs use derived status
	const statusCounts = $derived(
		allProjects.reduce(
			(acc, p) => {
				const d = deriveProjectStatus(p);
				acc[d]++;
				return acc;
			},
			{ signed: 0, pending: 0, rejected: 0 } // rejected count will stay 0 with new rule; kept for UI compatibility
		)
	);

	// Search tokens (AND match)
	const searchTokens = $derived(
		(() => {
			const raw = typeof searchText === 'string' ? searchText.trim().toLowerCase() : '';
			return raw ? raw.split(/\s+/).filter(Boolean) : [];
		})()
	);

	function projectMatches(p: Project, tokens: string[]): boolean {
		if (!tokens.length) return true;
		const parts: string[] = [String(p.id), p.projectsName.toLowerCase()];
		for (const f of p.files || []) parts.push(f.fileName.toLowerCase());
		for (const s of p.signers || []) parts.push(s.name.toLowerCase(), s.email.toLowerCase());
		const haystack = parts.join(' ');
		return tokens.every((t) => haystack.includes(t));
	}

	const statusFiltered = $derived(
		active === 'all' ? allProjects : allProjects.filter((p) => deriveProjectStatus(p) === active)
	);

	const filtered = $derived(statusFiltered.filter((p) => projectMatches(p, searchTokens)));

	function toEpoch(v: number | string | null | undefined): number {
		if (v == null) return 0;
		if (typeof v === 'number') {
			// Assume seconds if looks like 10-digit
			return v < 1e12 ? v * 1000 : v;
		}
		// string
		const numeric = Number(v);
		if (!Number.isNaN(numeric)) return numeric < 1e12 ? numeric * 1000 : numeric;
		// ISO date string fallback
		const d = new Date(v);
		return isNaN(d.getTime()) ? 0 : d.getTime();
	}

	const filteredSorted = $derived(
		[...filtered].sort((a, b) => {
			const diff = toEpoch(b.created_at) - toEpoch(a.created_at);
			if (diff !== 0) return diff;
			return Number(b.id) - Number(a.id);
		})
	);

	const STATUS_MAP: Record<Status, StatusView> = {
		signed: {
			label: m.filter_status_confirmed(),
			pillCls: 'status-pill status-ok',
			dotCls: 'status-dot status-ok-dot'
		},
		pending: {
			label: m.filter_status_pending(),
			pillCls: 'status-pill status-pending',
			dotCls: 'status-dot status-pending-dot'
		},
		rejected: {
			label: m.filter_status_rejected(),
			pillCls: 'status-pill status-bad',
			dotCls: 'status-dot status-bad-dot'
		}
	};

	const getStatus = (s: Status): StatusView => STATUS_MAP[s] ?? STATUS_MAP.pending;

	function formatDateTH(value: number | string): string {
		// Accept: epoch seconds, epoch ms, ISO string
		let ms: number;
		if (typeof value === 'number') {
			ms = value < 1e12 ? value * 1000 : value;
		} else {
			const num = Number(value);
			if (!Number.isNaN(num)) {
				ms = num < 1e12 ? num * 1000 : num;
			} else {
				const parsed = new Date(value).getTime();
				ms = isNaN(parsed) ? Date.now() : parsed;
			}
		}
		const d = new Date(ms);
		return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' });
	}
</script>

<div class="container-List">
	<div class="filter-bar">
		<nav class="tabs">
			<button class="tab-item {active === 'all' ? 'active' : ''}" onclick={() => (active = 'all')}>
				{m.filter_status_all()} ({allProjects.length})
			</button>
			<button
				class="tab-item {active === 'signed' ? 'active' : ''}"
				onclick={() => (active = 'signed')}
			>
				{m.filter_status_confirmed()} ({statusCounts.signed})
			</button>
			<button
				class="tab-item {active === 'pending' ? 'active' : ''}"
				onclick={() => (active = 'pending')}
			>
				{m.filter_status_pending()} ({statusCounts.pending})
			</button>
			<button
				class="tab-item {active === 'rejected' ? 'active' : ''}"
				onclick={() => (active = 'rejected')}
			>
				{m.filter_status_rejected()} ({statusCounts.rejected})
			</button>
		</nav>

		<div class="Add-project" bind:this={addMenuEl}>
			<button
				type="button"
				class="add-button"
				onclick={(e) => toggleAddMenu(e)}
				aria-haspopup="true"
				aria-expanded={showAddMenu}
			>
				<Icon icon="tabler:file-plus" class="icon-add file" />
				{m.add_project()}
				<Icon icon={showAddMenu ? 'tabler:chevron-up' : 'tabler:chevron-down'} class="chev" />
			</button>

			{#if showAddMenu}
				<div class="add-menu" role="menu">
					<button type="button" class="menu-item" onclick={() => triggerUpload()} role="menuitem">
						<Icon icon="tabler:cloud-upload" class="menu-icon" />
						อัปโหลดเอกสารที่มีอยู่
					</button>
					<button type="button" class="menu-item" onclick={() => handleCreate()} role="menuitem">
						<Icon icon="tabler:plus" class="menu-icon" />
						สร้างเอกสารใหม่
					</button>
				</div>
			{/if}

			<input
				bind:this={fileInput}
				type="file"
				class="hidden-file-input"
				onchange={(e) => handleFile(e)}
			/>
		</div>
	</div>

	<div class="project-list no-scrollbar">
		<div class="header">
			<div class="col_list">{m.header_id()}</div>
			<div class="col_list">{m.header_name()}</div>
			<div class="col_list">{m.header_status()}</div>
			<div class="col_list">{m.header_date()}</div>
			<div class="col_list text-center"></div>
		</div>

		<div class="project-items">
			{#if filtered.length === 0}
				<div class="empty-state">
					<Icon icon="tabler:file-off" width="72" height="72" class="empty-icon" />
					<p class="empty-text">
						{active === 'all'
							? m.not_found_project()
							: active === 'signed'
								? m.not_found_projects_confirmed()
								: active === 'pending'
									? m.not_found_projects_pending()
									: m.not_found_projects_rejected()}
					</p>
				</div>
			{:else}
				{#each [...filteredSorted] as p (p.id)}
					<div class="project-item">
						<div class="col id">{p.id}</div>

						<div class="col name">{p.projectsName}</div>

						<div class="col">
							{#key p.signers}
								<span class={getStatus(deriveProjectStatus(p)).pillCls}>
									<span class={getStatus(deriveProjectStatus(p)).dotCls}></span>
									{getStatus(deriveProjectStatus(p)).label}
								</span>
							{/key}
						</div>

						<div class="col date">{formatDateTH(p.created_at)}</div>

						<div class="col actions">
							<button class="action-btn" title="ดูรายละเอียด">
								<Icon icon="tabler:eye" class="h-5 w-5" />
							</button>
							<button class="action-btn" title="แก้ไข">
								<Icon icon="tabler:pencil" class="h-5 w-5" />
							</button>
							<button class="action-btn" title="ลบ">
								<Icon icon="tabler:trash" class="h-5 w-5" />
							</button>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
