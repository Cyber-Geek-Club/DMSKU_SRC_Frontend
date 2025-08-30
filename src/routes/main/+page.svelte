<script lang="ts">
	import './mainpage.css';
	import ProjectSearch from '../../component/ProjectSearch.svelte';
	import ProjectList from '../../component/ProjectList.svelte';

	const { data } = $props();
	let searchText = $state('');
</script>

<div class="main-container">
	<ProjectSearch bind:text={searchText} />
	<ProjectList {searchText} projects={data.projects} />
</div>
