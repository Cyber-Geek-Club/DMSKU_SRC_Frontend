<script lang="ts">
	import '$lib/uploadAssets/upload.css';
	import { m } from '$lib/paraglide/messages.js';
	import Input from '$lib/uploadAssets/Input.svelte';
	import { FileUp } from '@lucide/svelte';
	import DocumentItem from '$lib/uploadAssets/DocumentItem.svelte';
	import PreviewModal from '$lib/uploadAssets/PreviewModal.svelte';
	import {
		addFiles,
		type DocItem,
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
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let inputRef: HTMLInputElement | null = null;

	let projectName = $state('');
	let projectNumber = $state('');
	let saving = $state(false);
	let projectId = $state<number | null>(null);
	let currentStatus: 'draft' | 'active' | null = null;

	onMount(async () => {
		try {
			const allRes = await user.getAllUsers();
			const arr = (allRes.data?.data ?? allRes.data ?? []) as any[];
			allUsers = arr
				.map((u) => ({
					id: u.id ?? u.userId ?? u.uid ?? null,
					name: u.name ?? u.fullName ?? u.displayName ?? '',
					email: u.email ?? ''
				}))
				.filter((u) => u.name && u.email);
			console.log('all users', allUsers);
		} catch (e) {
			console.warn('โหลดรายชื่อผู้ใช้ทั้งหมดไม่สำเร็จ', e);
		}

		const params = page?.url?.searchParams ?? new URLSearchParams(window.location.search);
		const editIdStr = params.get('edit');
		if (!editIdStr) return;
		const id = Number(editIdStr);
		if (!id || Number.isNaN(id)) return;
		try {
			const res = await project.getById(id);
			const data = res.data;
			if (!data) return;
			if (data.status !== 'draft') {
				alert('แก้ไขได้เฉพาะโครงการสถานะ draft');
				return;
			}
			projectId = data.id;
			currentStatus = data.status;
			projectName = data.projectsName || '';
			const fileArray = Array.isArray(data.files) ? data.files : [];
			const signerArray = Array.isArray(data.signers) ? data.signers : [];
			const fileIdToSigners: Record<number, typeof signerArray> = {};
			for (const s of signerArray) {
				if (!fileIdToSigners[s.projectFileId]) fileIdToSigners[s.projectFileId] = [];
				fileIdToSigners[s.projectFileId].push(s);
			}
			documents = fileArray.map((f: any, idx: number) => ({
				id: `existing-${f.id}`,
				name: f.fileName || f.description || `File-${f.id}`,
				file: null,
				progress: 100,
				status: 'done',
				previewUrl: undefined,
				projectFileId: f.id,
				signers: (fileIdToSigners[f.id] || []).map((s: any, si: number) => ({
					key: `loaded-${f.id}-${s.userId ?? s.uid ?? s.id ?? si}`,
					userId: s.userId ?? s.uid ?? s.id ?? null,
					name: s.name || '',
					email: s.email || '',
					order: s.position ?? si + 1
				}))
			}));
			documents = [...documents];
		} catch (e) {
			console.error('โหลดโปรเจ็กต์ไม่สำเร็จ', e);
			alert('ไม่สามารถโหลดโปรเจ็กต์สำหรับแก้ไข');
		}
	});

	async function upsertProject(targetStatus: 'draft' | 'active') {
		if (saving) return;
		if (!projectName.trim()) {
			alert('กรุณากรอกชื่อโครงการ');
			return;
		}
		if (targetStatus === 'active' && documents.length === 0) {
			if (!confirm('ยังไม่มีไฟล์ แน่ใจหรือไม่ที่จะสร้างโครงการ (Active)?')) return;
		}
		saving = true;
		try {
			if (!projectId) {
				const createRes =
					targetStatus === 'active'
						? await project.createActive(projectName.trim())
						: await project.createDraft(projectName.trim());
				projectId =
					createRes.data?.id ?? createRes.data?.projectsId ?? createRes.data?.projectId ?? null;
				currentStatus = targetStatus;
				if (!projectId) throw new Error('Project id not returned');
			} else if (currentStatus !== targetStatus) {
				try {
					await project.updateStatus(projectId, targetStatus);
					currentStatus = targetStatus;
				} catch (e) {
					console.warn('อัปเดตสถานะไม่สำเร็จ', e);
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
						projectId,
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
							if (!signer.userId) continue; // must choose a user
							try {
								await projectFile.createFileSigner(projectFileId, signer.userId, signer.order);
								await projectFile.createFileSignature(projectFileId, signer.userId);
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
			alert(targetStatus === 'draft' ? 'บันทึกร่างเสร็จแล้ว' : 'สร้างโครงการ Active เสร็จแล้ว');
			goto('/main');
		} catch (e) {
			console.error('Upsert project error', e);
			alert('บันทึกไม่สำเร็จ');
		} finally {
			saving = false;
		}
	}

	let documents = $state<DocItem[]>([]);
	let allUsers = $state<{ id: number | null; name: string; email: string }[]>([]);
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
		signerKey: string,
		field: 'name' | 'email',
		value: string
	) {
		// basic field update
		updateSigner(doc, signerKey, { [field]: value });
		// attempt to map to a backend user id if both name or email matches a user
		const signer = doc.signers.find((s) => s.key === signerKey);
		if (signer) {
			const match = allUsers.find(
				(u) =>
					(!!signer.email && u.email.toLowerCase() === signer.email.toLowerCase()) ||
					(!!signer.name && u.name.toLowerCase() === signer.name.toLowerCase())
			);
			if (match && match.id != null && match.id !== signer.userId) {
				updateSigner(doc, signerKey, { userId: match.id });
			}
		}
		documents = [...documents];
	}

	function handleRemoveSigner(doc: DocItem, signerKey: string) {
		removeSigner(doc, signerKey);
		documents = [...documents];
	}

	function moveSigner(doc: DocItem, signerKey: string, direction: -1 | 1) {
		const idx = doc.signers.findIndex((s) => s.key === signerKey);
		if (idx === -1) return;
		reorderSigners(doc, idx, idx + direction);
		documents = [...documents];
	}

	function openPreview(doc: DocItem) {
		if (doc.file) {
			const url = ensurePreviewUrl(doc);
			if (!url) return;
			previewTarget = doc;
			previewUrl = url;
			return;
		}
		if (doc.projectFileId) {
			if (doc.previewUrl) {
				previewTarget = doc;
				previewUrl = doc.previewUrl;
				return;
			}
			projectFile
				.downloadProjectFile(doc.projectFileId)
				.then((res) => {
					const blob = res.data as Blob;
					const url = URL.createObjectURL(blob);
					doc.previewUrl = url;
					previewTarget = doc;
					previewUrl = url;
					documents = [...documents];
				})
				.catch((err) => {
					console.error('ดาวน์โหลดไฟล์ไม่สำเร็จ', err);
					alert('ดาวน์โหลดไฟล์ไม่สำเร็จ');
				});
		}
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

	async function removeDocument(id: string) {
		const doc = documents.find((d) => d.id === id);
		if (!doc) return;
		if (doc.projectFileId) {
			if (!confirm('ลบไฟล์นี้ออกจากระบบถาวร?')) return;
			try {
				await projectFile.deleteProjectFile(doc.projectFileId);
			} catch (e) {
				console.error('ลบไฟล์ backend ไม่สำเร็จ', e);
				alert('ลบไฟล์ไม่สำเร็จ');
				return;
			}
		}
		documents = documents.filter((d) => d.id !== id);
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
				onclick={() => upsertProject('draft')}
				disabled={isUploading || saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกโครงร่าง'}</button
			>
			<button
				class="rounded-2xl bg-ku-dark-green px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
				onclick={() => upsertProject('active')}
				disabled={isUploading || saving}>สร้างโครงการ</button
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
					{allUsers}
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
