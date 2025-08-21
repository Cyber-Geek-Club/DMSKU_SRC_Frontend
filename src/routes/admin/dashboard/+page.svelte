<script lang="ts">
	import '$lib/dashboardAssets/dashboard.css';
	import { m } from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import Block from '$lib/dashboardAssets/Block.svelte';
	import { User, ShieldUser, File, FileCheck, FileX } from '@lucide/svelte';

	let { data } = $props();
	let countOfUsers = $state(
		data?.data ?? {
			roles: { admin: 0, manager: 0, organizer: 0, club_member: 0, guest: 0 },
			total: 0
		}
	);
</script>

<main>
	<h1 class="title">{m.dashboard()}</h1>
	<div class="dashboard-container">
		<Block
			title={m.dashboard_totalAdmin()}
			subText={countOfUsers.roles.admin}
			icon={ShieldUser}
			iconProps={{ size: 100 }}
		/>
		<Block
			title={m.dashboard_totalUser()}
			subText={countOfUsers.total}
			icon={User}
			iconProps={{ size: 100 }}
		/>
		<Block title={m.dashboard_totalDocument()} subText={0} icon={File} iconProps={{ size: 100 }} />
		<Block
			title={m.dashboard_totalApproved()}
			subText={0}
			icon={FileCheck}
			iconProps={{ size: 100 }}
		/>
		<Block title={m.dashboard_totalPending()} subText={0} icon={FileX} iconProps={{ size: 100 }} />
	</div>
</main>
