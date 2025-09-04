<script lang="ts">
	import '$lib/uploadAssets/upload.css';
	import { m } from '$lib/paraglide/messages.js';
	import Input from '$lib/uploadAssets/Input.svelte';
	import { FileUp } from '@lucide/svelte';
	import UploadFileList from '$lib/uploadAssets/UploadFileList.svelte';
	import PreviewModal from '$lib/uploadAssets/PreviewModal.svelte';
	import { project } from '$lib/api/project';
	import { projectFile } from '$lib/api/projectFile';
	import { user } from '$lib/api/user';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { UserType } from '../../../types/user-types';
	import toast, { Toaster } from 'svelte-french-toast';
	let projectName = $state('');
	let projectNumber = $state('');
	let allUsers: Array<UserType> = $state([]);
	let inputRef: HTMLInputElement | null = $state(null);
	let isUploading = $state(false);
	let isSaving = $state(false);
	let uploadFiles = $state<
		Array<{
			// file may be absent for existing files until preview/download
			file?: File | null;
			fileId?: number;
			fileName?: string;
			fileType?: string;
			signers: Array<{ key: string; name: string }>;
			progress?: number;
			status?: 'pending' | 'uploading' | 'done' | 'error';
			error?: string;
			isExisting?: boolean;
		}>
	>([]);
	let previewFileIdx = $state<number | null>(null);
	let previewUrl = $state<string | null>(null);

	onMount(async () => {
		const { data } = await user.getAllUsers();
		if (data) {
			allUsers = data;
		}
	});

	onMount(async () => {
		if (page.url.search.includes('edit')) {
			const { data } = await project.getById(Number(page.url.search.split('=')[1]));
			console.log(data);
			if (data) {
				projectName = data.projectName;
				projectNumber = data.projectNumber;
			}
			if (data?.files) {
				for (let i = 0; i < data?.files.length; i++) {
					let fileSigners: Array<{ key: string; name: string }> = [];
					if (Array.isArray(data.signers) && data.signers.length) {
						fileSigners = data.signers
							.filter((s: any) => s.projectFileId === data.files[i].id)
							.sort((a: any, b: any) => Number(a.position ?? 0) - Number(b.position ?? 0))
							.map((s: any) => ({
								key: (s.id ?? Math.random()).toString(),
								name: s.userName ?? s.user?.name ?? s.userName ?? ''
							}));
					} else if (Array.isArray(data.files[i].signers) && data.files[i].signers.length) {
						fileSigners = data.files[i].signers.map((s: any) => ({
							key: (s.id ?? Math.random()).toString(),
							name: s.name ?? s.userName ?? ''
						}));
					}

					uploadFiles.push({
						file: undefined,
						fileId: data.files[i].id,
						fileName: data.files[i].fileName,
						fileType: data.files[i].fileType,
						signers: fileSigners,
						progress: 0,
						status: 'done',
						isExisting: true
					});
				}
			}
		}
	});

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			const newFiles = Array.from(input.files).map((file) => ({
				file,
				signers: [],
				progress: 0,
				status: 'pending' as 'pending',
				isExisting: false
			}));
			uploadFiles.push(...newFiles);
			input.value = '';
		}
	}

	function removeFile(idx: number) {
		uploadFiles.splice(idx, 1);
	}

	function addSigner(fileIdx: number) {
		const signers = uploadFiles[fileIdx].signers;
		signers.push({
			key: Math.random().toString(36).slice(2),
			name: ''
		});
	}

	function removeSigner(fileIdx: number, signerIdx: number) {
		uploadFiles[fileIdx].signers.splice(signerIdx, 1);
	}

	function updateSigner(fileIdx: number, signerIdx: number, field: 'name', value: string) {
		uploadFiles[fileIdx].signers[signerIdx][field] = value;
	}

	function moveSigner(fileIdx: number, signerIdx: number, dir: -1 | 1) {
		const signers = uploadFiles[fileIdx].signers;
		const newIdx = signerIdx + dir;
		if (newIdx < 0 || newIdx >= signers.length) return;
		const [moved] = signers.splice(signerIdx, 1);
		signers.splice(newIdx, 0, moved);
	}

	async function previewFile(
		fileObj: {
			file?: File | null;
			fileId?: number;
			fileName?: string;
			fileType?: string;
			signers: Array<{ key: string; name: string }>;
		},
		idx: number
	) {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
			previewFileIdx = null;
		}

		if (fileObj.file) {
			previewFileIdx = idx;
			previewUrl = URL.createObjectURL(fileObj.file);
			return;
		}

		if (fileObj.fileId) {
			try {
				const fileRes = await projectFile.downloadProjectFile(fileObj.fileId);
				if (fileRes.status === 200) {
					const fileBlob = fileRes.data;
					// determine mime
					const mime = fileObj.fileType
						? fileObj.fileType
						: (fileObj.fileName || '').toLowerCase().endsWith('.pdf')
							? 'application/pdf'
							: 'application/octet-stream';
					const file = new File([fileBlob], fileObj.fileName ?? `file-${fileObj.fileId}`, {
						type: mime
					});
					uploadFiles[idx].file = file;
					uploadFiles = [...uploadFiles];
					previewFileIdx = idx;
					previewUrl = URL.createObjectURL(file);
					return;
				} else {
					toast.error(`ไม่สามารถดาวน์โหลดไฟล์: ${fileObj.fileName ?? fileObj.fileId} ได้`);
					return;
				}
			} catch (err) {
				console.error(err);
				toast.error(`เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์`);
				return;
			}
		}

		toast.error('ไม่มีไฟล์ให้แสดง');
	}

	function closePreview() {
		previewFileIdx = null;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = null;
	}

	function checkIsEmpty() {
		if (!projectName && !projectNumber) {
			toast.error('กรุณากรอกชื่อโครงการและเลขที่โครงการ');
			return true;
		} else if (!uploadFiles.length) {
			toast.error('กรุณาอัปโหลดไฟล์อย่างน้อย 1 ไฟล์');
			return true;
		} else if (uploadFiles.some((f) => f.signers.length === 0)) {
			toast.error('กรุณาเพิ่มผู้ลงนามอย่างน้อย 1 คนในแต่ละไฟล์');
			return true;
		} else if (uploadFiles.some((f) => f.signers.some((s) => !s.name.trim()))) {
			toast.error('กรุณากรอกชื่อผู้ลงนามให้ครบถ้วน');
			return true;
		}
		return false;
	}

	async function saveDraft() {
		isUploading = true;
		if (checkIsEmpty()) {
			isUploading = false;
			return;
		}
		try {
			const create_project_res = await project.createDraft(projectName, projectNumber);
			if (create_project_res.status === 201) {
				for (let idx = 0; idx < uploadFiles.length; idx++) {
					const current = uploadFiles[idx];
					if (current.isExisting && current.fileId) {
						// file already exists on server — just create signers using fileId
						for (let i = 0; i < current.signers.length; i++) {
							const signerName = current.signers[i].name;
							const user = allUsers.find((u) => u.name === signerName);
							if (user) {
								await projectFile
									.createFileSigner(current.fileId, user.id, i + 1)
									.then(async (signerRes) => {
										if (signerRes.status === 201) {
											await projectFile.createFileSignature(
												signerRes.data.projectFileId,
												signerRes.data.signerUserId
											);
										} else {
											toast.error(`ไม่สามารถเพิ่มผู้ลงนาม: ${signerName} ได้`);
										}
									});
							} else {
								toast.error(`ไม่พบผู้ใช้: ${signerName}`);
							}
						}
						current.status = 'done';
						uploadFiles = [...uploadFiles];
						continue;
					}

					// new file — ensure a File exists before uploading
					if (!current.file) {
						toast.error(`ไฟล์ "${current.fileName ?? 'unknown'}" ไม่มีข้อมูลสำหรับอัปโหลด`);
						current.status = 'error';
						uploadFiles = [...uploadFiles];
						continue;
					}

					await projectFile
						.uploadProjectFile(
							create_project_res.data.id,
							current.file,
							current.file.type,
							(progress: number) => {
								uploadFiles[idx].progress = progress;
								uploadFiles = [...uploadFiles];
							}
						)
						.then(async (res) => {
							if (res.status === 201) {
								for (let i = 0; i < current.signers.length; i++) {
									const signerName = current.signers[i].name;
									const user = allUsers.find((u) => u.name === signerName);
									if (user) {
										await projectFile
											.createFileSigner(res.data.id, user.id, i + 1)
											.then(async (signerRes) => {
												if (signerRes.status === 201) {
													await projectFile.createFileSignature(
														signerRes.data.projectFileId,
														signerRes.data.signerUserId
													);
												} else {
													toast.error(`ไม่สามารถเพิ่มผู้ลงนาม: ${signerName} ได้`);
												}
											});
									} else {
										toast.error(`ไม่พบผู้ใช้: ${signerName}`);
									}
								}
							}
						});
					uploadFiles[idx].status = 'done';
					uploadFiles = [...uploadFiles];
				}
			}
		} catch (error) {
			toast.error('เกิดข้อผิดพลาดในการบันทึกโครงร่าง');
			console.error(error);
		}
		isUploading = false;
		toast.success('บันทึกโครงร่างเรียบร้อย');
	}

	async function createProject() {
		isUploading = true;
		if (checkIsEmpty()) {
			isUploading = false;
			return;
		}
		try {
			const create_project_res = await project.createActive(projectName, projectNumber);
			if (create_project_res.status === 201) {
				for (let idx = 0; idx < uploadFiles.length; idx++) {
					const current = uploadFiles[idx];
					if (current.isExisting && current.fileId) {
						for (let i = 0; i < current.signers.length; i++) {
							const signerName = current.signers[i].name;
							const user = allUsers.find((u) => u.name === signerName);
							if (user) {
								await projectFile
									.createFileSigner(current.fileId, user.id, i + 1)
									.then(async (signerRes) => {
										if (signerRes.status === 201) {
											await projectFile.createFileSignature(
												signerRes.data.projectFileId,
												signerRes.data.signerUserId
											);
										} else {
											toast.error(`ไม่สามารถเพิ่มผู้ลงนาม: ${signerName} ได้`);
										}
									});
							} else {
								toast.error(`ไม่พบผู้ใช้: ${signerName}`);
							}
						}
						current.status = 'done';
						uploadFiles = [...uploadFiles];
						continue;
					}

					if (!current.file) {
						toast.error(`ไฟล์ "${current.fileName ?? 'unknown'}" ไม่มีข้อมูลสำหรับอัปโหลด`);
						current.status = 'error';
						uploadFiles = [...uploadFiles];
						continue;
					}

					await projectFile
						.uploadProjectFile(
							create_project_res.data.id,
							current.file,
							current.file.type,
							(progress: number) => {
								uploadFiles[idx].progress = progress;
								uploadFiles = [...uploadFiles];
							}
						)
						.then(async (res) => {
							if (res.status === 201) {
								for (let i = 0; i < current.signers.length; i++) {
									const signerName = current.signers[i].name;
									const user = allUsers.find((u) => u.name === signerName);
									if (user) {
										await projectFile
											.createFileSigner(res.data.id, user.id, i + 1)
											.then(async (signerRes) => {
												if (signerRes.status === 201) {
													await projectFile.createFileSignature(
														signerRes.data.projectFileId,
														signerRes.data.signerUserId
													);
												} else {
													toast.error(`ไม่สามารถเพิ่มผู้ลงนาม: ${signerName} ได้`);
												}
											});
									} else {
										toast.error(`ไม่พบผู้ใช้: ${signerName}`);
									}
								}
							}
						});
					uploadFiles[idx].status = 'done';
					uploadFiles = [...uploadFiles];
				}
				toast.success('สร้างโครงการเรียบร้อย');
				goto(`/main`);
			} else {
				toast.error('ไม่สามารถสร้างโครงการได้');
			}
		} catch (error) {
			toast.error('เกิดข้อผิดพลาดในการสร้างโครงการ');
			console.error(error);
		}
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
				disabled={isUploading}
			>
				บันทึกโครงร่าง
			</button>
			<button
				class="rounded-2xl bg-ku-dark-green px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
				onclick={createProject}
				disabled={isUploading}
			>
				สร้างโครงการ
			</button>
		</div>
	</div>
	<div class="upload-list">
		<div class="upload-page-header">
			<h1>{m.upload_related_documents()}</h1>
		</div>
		<div class="list-content">
			<!-- สถานะการอัปโหลดแต่ละไฟล์ไปอยู่ใน UploadFileList -->
			<UploadFileList
				files={uploadFiles}
				{allUsers}
				onRemoveFile={removeFile}
				onAddSigner={addSigner}
				onRemoveSigner={removeSigner}
				onUpdateSigner={updateSigner}
				onMoveSigner={moveSigner}
				onPreview={previewFile}
			/>
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

{#if previewFileIdx !== null && previewUrl}
	<PreviewModal
		doc={{
			name:
				uploadFiles[previewFileIdx].file?.name ?? uploadFiles[previewFileIdx].fileName ?? 'file',
			file: uploadFiles[previewFileIdx].file ?? undefined
		}}
		url={previewUrl}
		close={closePreview}
	/>
{/if}
<Toaster position="top-right" />

<style>
	.upload-button {
		position: relative;
	}
</style>
