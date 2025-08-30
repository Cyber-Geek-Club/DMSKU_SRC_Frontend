<script lang="ts">
	import '$lib/uploadAssets/upload.css';
	import { m } from '$lib/paraglide/messages.js';
	import Input from '$lib/uploadAssets/Input.svelte';
	import { FileUp } from '@lucide/svelte';
	import DocumentItem from '$lib/uploadAssets/DocumentItem.svelte';
	import PreviewModal from '$lib/uploadAssets/PreviewModal.svelte';
	import {
		seedDocuments,
		addFiles,
		uploadDocument,
		uploadAll as uploadAllDocs,
		type DocItem,
		allUploaded,
		ensurePreviewUrl,
		releasePreviewUrl,
		addSigner,
		updateSigner,
		removeSigner,
		reorderSigners
	} from '$lib/api/document';
	import { project } from '$lib/api/project';
	import { projectFile } from '$lib/api/projectFile';
	import { user } from '$lib/api/user';
	import { goto } from '$app/navigation';

	let inputRef: HTMLInputElement | null = null;

	let projectName = $state('');
	let projectNumber = $state('');
	let savingDraft = $state(false);
	let draftProjectId = $state<number | null>(null);

	async function saveDraft() {
		if (savingDraft) return;
		if (!projectName.trim()) {
			alert('กรุณากรอกชื่อโครงการ');
			return;
		}
		savingDraft = true;
		try {
			if (!draftProjectId) {
				const res = await project.createDraft(projectName.trim());
				draftProjectId = res.data?.id ?? res.data?.projectsId ?? res.data?.projectId ?? null;
				if (!draftProjectId) throw new Error('Project id not returned');
			}
			const emailUserIdCache: Record<string, number> = {};
			async function resolveUserId(email: string): Promise<number | null> {
				if (emailUserIdCache[email]) return emailUserIdCache[email];
				try {
					const res = await user.getUserData(email);
					const uid = res.data?.id ?? res.data?.userId ?? res.data?.data?.id ?? null;
					if (uid) emailUserIdCache[email] = uid;
					return uid;
				} catch (e) {
					console.warn('หา user ไม่เจอสำหรับ email', email, e);
					return null;
				}
			}

			for (const doc of documents) {
				if (!doc.file) continue;
				if (doc.status === 'done') continue;
				try {
					doc.status = 'uploading';
					doc.progress = 0;
					documents = [...documents];
					const uploadRes = await projectFile.uploadProjectFile(
						draftProjectId,
						doc.file,
						doc.name,
						(percent) => {
							doc.progress = percent;
							documents = [...documents];
						}
					);
					const projectFileId =
						uploadRes.data?.id ?? uploadRes.data?.projectFileId ?? uploadRes.data?.fileId;
					if (projectFileId) {
						for (const signer of doc.signers.sort((a, b) => a.order - b.order)) {
							if (!signer.email) continue;
							const userId = await resolveUserId(signer.email);
							if (!userId) continue;
							try {
								await projectFile.createFileSigner(projectFileId, userId, signer.order);
								await projectFile.createFileSignature(projectFileId, userId);
							} catch (e) {
								console.error('สร้าง signer/signature ล้มเหลว', signer, e);
							}
						}
					}
					doc.progress = 100;
					doc.status = 'done';
					documents = [...documents];
				} catch (e) {
					console.error('Upload file failed', e);
					doc.status = 'error';
					documents = [...documents];
				}
			}
			documents = [...documents];
			alert('บันทึกร่าง + อัปโหลดไฟล์เสร็จแล้ว');
			goto(`/main`);
		} catch (err) {
			console.error('Save draft error', err);
			alert('บันทึกร่างไม่สำเร็จ');
		} finally {
			savingDraft = false;
		}
	}

	async function createProject() {
		if (!projectName.trim()) {
			alert('กรุณากรอกชื่อโครงการ');
			return;
		}
		if (documents.length === 0) {
			if (!confirm('ยังไม่มีไฟล์ แน่ใจหรือไม่ที่จะสร้างโครงการ?')) return;
		}
		const notUploaded = documents.filter((d) => d.status !== 'done');
		if (notUploaded.length) {
			if (confirm('ยังมีไฟล์ที่ยังไม่ได้อัปโหลด ต้องการอัปโหลดทั้งหมดก่อนหรือไม่?')) {
				await uploadAll();
			} else if (notUploaded.some((d) => d.status === 'uploading')) {
				alert('กำลังอัปโหลดไฟล์อยู่ กรุณารอให้เสร็จก่อน');
				return;
			}
		}
		console.log('Create project', { projectName, projectNumber, documents });
	}

	let documents = $state<DocItem[]>([]);

	const UPLOAD_ENDPOINT = '/api/upload';

	let isUploading = $state(false);
	let previewTarget = $state<DocItem | null>(null);
	let previewUrl = $state<string | null>(null);
	let expanded = $state<Record<string, boolean>>({});

	function toggleExpand(docId: string) {
		expanded[docId] = !expanded[docId];
		expanded = { ...expanded };
	}

	function handleAddSigner(doc: DocItem) {
		addSigner(doc, '', '');
		documents = [...documents];
	}

	function handleUpdateSigner(
		doc: DocItem,
		signerId: string,
		field: 'name' | 'email',
		value: string
	) {
		updateSigner(doc, signerId, { [field]: value });
		documents = [...documents];
	}

	function handleRemoveSigner(doc: DocItem, signerId: string) {
		removeSigner(doc, signerId);
		documents = [...documents];
	}

	function moveSigner(doc: DocItem, signerId: string, direction: -1 | 1) {
		const idx = doc.signers.findIndex((s) => s.id === signerId);
		if (idx === -1) return;
		reorderSigners(doc, idx, idx + direction);
		documents = [...documents];
	}

	function openPreview(doc: DocItem) {
		const url = ensurePreviewUrl(doc);
		if (!url) return; // seed without file
		previewTarget = doc;
		previewUrl = url;
	}

	function closePreview() {
		if (previewTarget) {
			releasePreviewUrl(previewTarget);
		}
		previewTarget = null;
		previewUrl = null;
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (!files || files.length === 0) return;

		documents = addFiles(documents, files);
		target.value = '';
	}

	function removeDocument(id: string) {
		documents = documents.filter((d) => d.id !== id);
	}

	async function uploadSingle(doc: DocItem) {
		await uploadDocument(doc, UPLOAD_ENDPOINT, () => (documents = [...documents]));
	}

	async function uploadAll() {
		if (isUploading) return;
		isUploading = true;
		await uploadAllDocs(documents, UPLOAD_ENDPOINT, (updated) => (documents = updated));
		isUploading = false;
	}
</script>

<div class="upload-container">
	<div class="upload-header flex items-center justify-between gap-4">
		<h1 class="text-xl font-semibold">Upload Assets</h1>
	</div>
	<div class="upload-content justify-between">
		<div class="flex gap-8">
			<Input label={m.upload_name_of_project()} bind:value={projectName} />
			<Input label={m.upload_number_of_project()} bind:value={projectNumber} />
		</div>
		<div class="mt-4 flex self-end justify-self-end">
			<button
				class="rounded-2xl border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50"
				onclick={saveDraft}
				disabled={isUploading || savingDraft}
				>{savingDraft ? 'กำลังบันทึก...' : 'บันทึกโครงร่าง'}</button
			>
			<button
				class="rounded-2xl bg-ku-dark-green px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
				onclick={createProject}
				disabled={isUploading || savingDraft}>สร้างโครงการ</button
			>
		</div>
	</div>
	<div class="upload-list">
		<div class="upload-page-header">
			<h1>{m.upload_related_documents()}</h1>
		</div>
		<div class="list-content">
			{#each documents as doc (doc.id)}
				<DocumentItem
					{doc}
					expanded={!!expanded[doc.id]}
					{isUploading}
					preview={({ doc }) => openPreview(doc)}
					remove={({ doc }) => removeDocument(doc.id)}
					toggle={({ doc }) => toggleExpand(doc.id)}
					addsigner={({ doc }) => handleAddSigner(doc)}
					updatesigner={({ doc, id, field, value }) => handleUpdateSigner(doc, id, field, value)}
					removesigner={({ doc, id }) => handleRemoveSigner(doc, id)}
					movesigner={({ doc, id, dir }) => moveSigner(doc, id, dir)}
				/>
			{/each}
			<button class="upload-button" aria-label="Upload Documents" onclick={() => inputRef?.click()}>
				<FileUp class="ml-2 inline-block" />
				{m.upload_button()}
			</button>
			<input
				bind:this={inputRef}
				type="file"
				class="hidden"
				multiple
				onchange={handleFileSelect}
				accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
			/>
		</div>
	</div>
</div>

<PreviewModal doc={previewTarget} url={previewUrl} close={closePreview} />

<style>
	.upload-button {
		position: relative;
	}
</style>
