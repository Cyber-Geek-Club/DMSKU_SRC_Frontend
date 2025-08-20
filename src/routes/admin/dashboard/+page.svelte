<script lang="ts">
	import '$lib/dashboardAssets/dashboard.css';
	import { m } from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import Block from '$lib/dashboardAssets/Block.svelte';
	import { User, ShieldUser, File, FileCheck, FileX } from '@lucide/svelte';
</script>

<main>
	<h1 class="title">{m.dashboard()}</h1>
	<div class="dashboard-container">
		<Block
			title={m.dashboard_totalAdmin()}
			subText="100"
			icon={ShieldUser}
			iconProps={{ size: 100 }}
		/>
		<Block title={m.dashboard_totalUser()} subText="1" icon={User} iconProps={{ size: 100 }} />
		<Block title={m.dashboard_totalDocument()} subText="20" icon={File} iconProps={{ size: 100 }} />
		<Block
			title={m.dashboard_totalApproved()}
			subText="10"
			icon={FileCheck}
			iconProps={{ size: 100 }}
		/>
		<Block title={m.dashboard_totalPending()} subText="30" icon={FileX} iconProps={{ size: 100 }} />
	</div>
</main>
