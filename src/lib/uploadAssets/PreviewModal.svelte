<script lang="ts">
	import type { DocItem } from '$lib/api/document';

	let {
		doc = null,
		url = null,
		close = (() => {}) as () => void
	} = $props<{
		doc?: DocItem | null;
		url?: string | null;
		close?: () => void;
	}>();
</script>

{#if url && doc}
	<div class="preview-overlay" role="dialog" aria-modal="true">
		<div class="preview-modal">
			<div class="preview-modal-header">
				<h2 class="preview-modal-title" title={doc.name}>{doc.name}</h2>
				<button class="preview-close-btn" onclick={close}>✕</button>
			</div>
			<div class="preview-modal-body">
				{#if doc.file && doc.file.type.startsWith('image/')}
					<img src={url} alt={doc.name} class="preview-image" />
				{:else if doc.file && doc.file.type === 'application/pdf'}
					<iframe src={url} class="preview-iframe" title={doc.name}></iframe>
				{:else if doc.file}
					<p class="text-sm">ไม่รองรับ preview สำหรับไฟล์นี้ (type: {doc.file.type})</p>
				{:else}
					<p class="text-sm opacity-70">ไม่มีไฟล์จริงสำหรับรายการนี้</p>
				{/if}
			</div>
			<div class="preview-modal-footer">
				<a
					href={url}
					download={doc.name}
					class="preview-download-btn"
					target="_blank"
					rel="noopener noreferrer">Download</a
				>
				<button class="preview-cancel-btn" onclick={close}>Close</button>
			</div>
		</div>
	</div>
{/if}
