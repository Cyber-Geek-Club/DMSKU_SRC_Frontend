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

	// Derive type even when doc.file is absent (backend downloaded blob stored via previewUrl only)
	function inferKind(d: DocItem | null) {
		if (!d) return { isPdf: false, isImage: false };
		const lower = d.name.toLowerCase();
		const isPdf = lower.endsWith('.pdf') || d.file?.type === 'application/pdf';
		const isImage =
			/\.(png|jpe?g|gif|webp|svg)$/.test(lower) || (d.file?.type || '').startsWith('image/');
		return { isPdf, isImage };
	}
	let kind = $state({ isPdf: false, isImage: false });
	$effect(() => {
		kind = inferKind(doc);
	});
</script>

{#if url && doc}
	<div class="preview-overlay" role="dialog" aria-modal="true">
		<div class="preview-modal">
			<div class="preview-modal-header">
				<h2 class="preview-modal-title" title={doc.name}>{doc.name}</h2>
				<button class="preview-close-btn" onclick={close}>✕</button>
			</div>
			<div class="preview-modal-body">
				{#if kind.isImage}
					<img src={url} alt={doc.name} class="preview-image" />
				{:else if kind.isPdf}
					<iframe src={url} class="preview-iframe" title={doc.name}></iframe>
				{:else}
					<p class="text-sm opacity-70">ไม่รองรับ preview สำหรับไฟล์นี้ ดาวน์โหลดเพื่อเปิดดู</p>
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
