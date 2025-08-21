<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import InputSearch from '../../component/InputSearch.svelte';
	import StatusDocument from '../../component/StatusDocument.svelte';
	import { temp_data } from '../../Tempdata';

	let query = "";

	$:filteredData = temp_data.find(d =>
	query!="" && (d.Userid.toLowerCase().includes(query.toLowerCase()) ||
    d.documentname.toLowerCase().includes(query.toLowerCase()))
  	);

</script>

<div class="flex flex-col h-screen">
	<div class="h-[30%]">
		<div class="flex flex-col h-full justify-center items-center bg-[#007775]">
			<div class="py-3 text-2xl text-white">
				{m.search_document()}
			</div>
			<InputSearch bind:query/>	
		</div>

		<StatusDocument data={filteredData!}/>
	</div>	
</div>