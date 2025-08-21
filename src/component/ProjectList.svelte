<script lang="ts">
	import './ProjectList.css';
	import { m } from '$lib/paraglide/messages.js';
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';

	type Status = 'confirmed' | 'pending' | 'rejected';
	type StatusView = { label: string; pillCls: string; dotCls: string };

	interface Project {
		id: string;
		name: string;
		status: Status;
		date: string; // ISO: YYYY-MM-DD
	}

	let active = $state<'all' | Status>('all');

	// dropdown state for Add button
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
		fileInput?.click();
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

	let { searchText } = $props();

	const projects: Project[] = [
		{ id: '1', name: 'Project Alpha', status: 'confirmed', date: '2023-10-01' },
		{ id: '2', name: 'Project Beta', status: 'pending', date: '2023-10-05' },
		{ id: '3', name: 'Project Gamma', status: 'rejected', date: '2023-10-10' },
		{ id: '4', name: 'Project Delta', status: 'confirmed', date: '2023-10-15' },
		{ id: '5', name: 'Project Epsilon', status: 'pending', date: '2023-10-20' },
		{ id: '6', name: 'Project Zeta', status: 'rejected', date: '2023-10-25' },
		{ id: '7', name: 'Project Eta', status: 'confirmed', date: '2023-10-30' },
		{ id: '8', name: 'Project Theta', status: 'pending', date: '2023-10-31' },
		{ id: '9', name: 'Project Iota', status: 'rejected', date: '2023-11-01' },
		{ id: '10', name: 'Project Kappa', status: 'confirmed', date: '2023-11-05' },
		{ id: '11', name: 'Project Lambda', status: 'pending', date: '2023-11-10' },
		{ id: '12', name: 'Project Mu', status: 'rejected', date: '2023-11-15' },
		{ id: '13', name: 'Project Nu', status: 'confirmed', date: '2023-11-20' },
		{ id: '14', name: 'Project Xi', status: 'pending', date: '2023-11-25' },
		{ id: '15', name: 'Project Omicron', status: 'rejected', date: '2023-11-30' },
		{ id: '16', name: 'Project Pi', status: 'confirmed', date: '2023-12-01' },
		{ id: '17', name: 'Project Rho', status: 'pending', date: '2023-12-05' },
		{ id: '18', name: 'Project Sigma', status: 'rejected', date: '2023-12-10' },
		{ id: '19', name: 'Project Tau', status: 'confirmed', date: '2023-12-15' },
		{ id: '20', name: 'Project Upsilon', status: 'pending', date: '2023-12-20' }
	];

	let filtered = $derived(
		(() => {
			const q = typeof searchText === 'string' ? searchText.trim().toLowerCase() : '';
			const base = active === 'all' ? projects : projects.filter((p) => p.status === active);
			if (!q) return base;
			return base.filter((p) => {
				return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
			});
		})()
	);
	let filteredSorted = $derived(
		Array.isArray(filtered)
			? [...filtered].sort((a, b) => {
					const dateCompare = b.date.localeCompare(a.date);
					if (dateCompare !== 0) return dateCompare;
					return Number(b.id) - Number(a.id);
				})
			: []
	);

	const STATUS_MAP = {
		confirmed: {
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
	} as const satisfies Record<Status, StatusView>;

	const getStatus = (s: Status): StatusView => STATUS_MAP[s];

	function formatDateTH(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' });
	}
	// Use $derived instead of legacy `$:` reactive statement (Svelte 5 runes mode)
</script>

<div class="container-List">
	<div class="filter-bar">
		<nav class="tabs">
			<button class="tab-item {active === 'all' ? 'active' : ''}" onclick={() => (active = 'all')}
				>{m.filter_status_all()}</button
			>
			<button
				class="tab-item {active === 'confirmed' ? 'active' : ''}"
				onclick={() => (active = 'confirmed')}>{m.filter_status_confirmed()}</button
			>
			<button
				class="tab-item {active === 'pending' ? 'active' : ''}"
				onclick={() => (active = 'pending')}>{m.filter_status_pending()}</button
			>
			<button
				class="tab-item {active === 'rejected' ? 'active' : ''}"
				onclick={() => (active = 'rejected')}>{m.filter_status_rejected()}</button
			>
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
							: active === 'confirmed'
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

						<div class="col name">{p.name}</div>

						<div class="col">
							<span class={getStatus(p.status).pillCls}>
								<span class={getStatus(p.status).dotCls}></span>
								{getStatus(p.status).label}
							</span>
						</div>

						<div class="col date">{formatDateTH(p.date)}</div>

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
