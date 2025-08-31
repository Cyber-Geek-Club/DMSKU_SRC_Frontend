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
		projectCode?: string;
		updated_at: number | string | null;
		created_at: number | string;
		deleted_at: number | string | null;
		files: File[];
		signers: Signer[];
		summary: FileSummary;
	}

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

	// QR Code Modal state
	let showQR = $state(false);
	let qrLoading = $state(false);
	let qrError = $state<string | null>(null);
	let currentQRProject = $state<Project | null>(null);
	let qrDataUrl = $state<string | null>(null);

	async function openQR(p: Project) {
		showQR = true;
		qrLoading = true;
		qrError = null;
		currentQRProject = p;
		qrDataUrl = null;
		try {
			// fetch data-url JSON (default)
			const { project } = await import('$lib/api/project');
			const res = await project.getQRCode(p.id, { format: 'data-url', scale: 6 });
			// response.data may contain either buffer or json depending on format; we requested json
			qrDataUrl = res.data?.qr || null;
			if (!qrDataUrl) qrError = 'ไม่พบข้อมูล QR';
		} catch (e) {
			qrError = 'โหลด QR ไม่สำเร็จ';
			console.error('QR fetch error', e);
		} finally {
			qrLoading = false;
		}
	}

	function closeQR() {
		showQR = false;
		qrDataUrl = null;
		currentQRProject = null;
	}

	function goToSearch(p: Project) {
		const code = p.projectCode ? encodeURIComponent(p.projectCode) : '';
		goto(`/searchDocument${code ? `?code=${code}` : ''}`);
	}

	async function downloadPNG(p: Project | null) {
		if (!p) return;
		try {
			const { project } = await import('$lib/api/project');
			const res = await project.getQRCode(p.id, { format: 'png', scale: 8 });
			const blob = new Blob([res.data], { type: 'image/png' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `project-${p.id}-qr.png`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (e) {
			console.error('Download QR failed', e);
		}
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
							<button class="action-btn" title="ดูรายละเอียด" onclick={() => goToSearch(p)}>
								<Icon icon="tabler:eye" class="h-5 w-5" />
							</button>
							<button class="action-btn" title="QR Code" onclick={() => openQR(p)}>
								<Icon icon="tabler:qrcode" class="h-5 w-5" />
							</button>
							<button class="action-btn" title="แก้ไข">
								<Icon
									icon="tabler:pencil"
									class="h-5 w-5"
									onclick={() => goto(`/main/upload?edit=${p.id}`)}
								/>
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

	{#if showQR}
		<div
			class="qr-modal-backdrop"
			role="button"
			aria-label="ปิดหน้าต่าง"
			tabindex="0"
			onclick={(e) => e.currentTarget === e.target && closeQR()}
			onkeydown={(e) => (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') && closeQR()}
		>
			<div class="qr-modal" role="dialog" aria-modal="true">
				<div class="qr-header">
					<h3>QR Code</h3>
					<button class="close-btn" onclick={closeQR} aria-label="Close">
						<Icon icon="tabler:x" class="h-5 w-5" />
					</button>
				</div>
				{#if qrLoading}
					<p>กำลังโหลด...</p>
				{:else if qrError}
					<p class="error">{qrError}</p>
				{:else if qrDataUrl}
					<div class="qr-body">
						<img src={qrDataUrl} alt="QR Code" class="qr-image" />
						{#if currentQRProject?.projectCode}
							<p class="qr-code-text">{currentQRProject.projectCode}</p>
						{/if}
						<button class="download-btn" onclick={() => downloadPNG(currentQRProject)}>
							<Icon icon="tabler:download" class="h-5 w-5" /> ดาวน์โหลด PNG
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<style>
		.qr-modal-backdrop {
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.4);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 1000;
		}
		.qr-modal {
			background: #fff;
			padding: 1rem 1.25rem;
			border-radius: 12px;
			width: min(90%, 340px);
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
		}
		.qr-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.qr-image {
			width: 100%;
			height: auto;
			image-rendering: pixelated;
		}
		.qr-body {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			align-items: center;
		}
		.qr-code-text {
			font-family: monospace;
			font-size: 0.85rem;
			background: #f5f5f5;
			padding: 0.25rem 0.5rem;
			border-radius: 4px;
		}
		.close-btn,
		.download-btn {
			background: #f0f0f0;
			border: none;
			cursor: pointer;
			padding: 0.5rem 0.75rem;
			border-radius: 6px;
			display: inline-flex;
			align-items: center;
			gap: 0.35rem;
		}
		.close-btn:hover,
		.download-btn:hover {
			background: #e2e2e2;
		}
		.error {
			color: #c00;
		}
	</style>
</div>
