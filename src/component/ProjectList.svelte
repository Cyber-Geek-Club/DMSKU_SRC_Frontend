<script lang="ts">
	import './ProjectList.css';
	import { m } from '$lib/paraglide/messages.js';
	import Icon from '@iconify/svelte';

	type Status = 'confirmed' | 'pending' | 'rejected';
	type StatusView = { label: string; pillCls: string; dotCls: string };

	interface Project {
		id: string;
		name: string;
		status: Status;
		date: string; // ISO: YYYY-MM-DD
	}

	let active: 'all' | Status = 'all';

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
        {id: '16', name: 'Project Pi', status: 'confirmed', date: '2023-12-01' },
        { id: '17', name: 'Project Rho', status: 'pending', date: '2023-12-05' },
        { id: '18', name: 'Project Sigma', status: 'rejected', date: '2023-12-10' },
        { id: '19', name: 'Project Tau', status: 'confirmed', date: '2023-12-15' },
        { id: '20', name: 'Project Upsilon', status: 'pending', date: '2023-12-20' }

	];

	$: filtered = active === 'all' ? projects : projects.filter((p) => p.status === active);

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
    $: filteredSorted = [...filtered].sort((a, b) => {
	const dateCompare = b.date.localeCompare(a.date);
	if (dateCompare !== 0) return dateCompare;
	return Number(b.id) - Number(a.id);
});
</script>

<div class="container-List">
	<div class="filter-bar">
		<nav class="tabs">
			<button class="tab-item {active === 'all' ? 'active' : ''}" on:click={() => (active = 'all')}
				>{m.filter_status_all()}</button
			>
			<button
				class="tab-item {active === 'confirmed' ? 'active' : ''}"
				on:click={() => (active = 'confirmed')}>{m.filter_status_confirmed()}</button
			>
			<button
				class="tab-item {active === 'pending' ? 'active' : ''}"
				on:click={() => (active = 'pending')}>{m.filter_status_pending()}</button
			>
			<button
				class="tab-item {active === 'rejected' ? 'active' : ''}"
				on:click={() => (active = 'rejected')}>{m.filter_status_rejected()}</button
			>
		</nav>

		<div class="Add-project">
			<button type="button" class="add-button">
				<Icon icon="tabler:file-plus" class="icon-add file" />
				{m.add_project()}
			</button>
		</div>
	</div>

	<div class="project-list no-scrollbar">
		<div class="header">
			<div class="col_list">{m.header_id()}</div>
			<div class="col_list">{m.header_name()}</div>
			<div class="col_list">{m.header_status()}</div>
			<div class="col_list">{m.header_date()}</div>
			<div class="col_list  text-center"></div>
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
