import { http } from './http';

export type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface DocItem {
	id: string;
	name: string;
	file: File | null;
	progress: number;
	status: UploadStatus;
	error?: string;
	previewUrl?: string;
	signers: Signer[];
}

export interface Signer {
	id: string;
	name: string;
	email: string;
	order: number;
}

function createDocItem(file: File, idx = 0): DocItem {
	return {
		id: `${Date.now()}-${idx}-${file.name}`,
		name: file.name,
		file,
		progress: 0,
		status: 'pending',
		previewUrl: undefined,
		signers: []
	};
}

function addFiles(existing: DocItem[], files: FileList): DocItem[] {
	const existingNames = new Set(existing.map((d) => d.name));
	const newItems = Array.from(files)
		.filter((f) => !existingNames.has(f.name))
		.map((f, idx) => createDocItem(f, idx));
	return newItems.length ? [...existing, ...newItems] : existing;
}

function seedDocuments(): DocItem[] {
	return [
		{
			id: 'seed-1',
			name: 'Document1.pdf',
			file: null,
			progress: 0,
			status: 'pending',
			previewUrl: undefined,
			signers: []
		},
		{
			id: 'seed-2',
			name: 'Document2.pdf',
			file: null,
			progress: 0,
			status: 'pending',
			previewUrl: undefined,
			signers: []
		},
		{
			id: 'seed-3',
			name: 'Document3.pdf',
			file: null,
			progress: 0,
			status: 'pending',
			previewUrl: undefined,
			signers: []
		}
	];
}

function prepareFormData(doc: DocItem): FormData | null {
	if (!doc.file) return null;
	const fd = new FormData();
	fd.append('file', doc.file, doc.name);
	return fd;
}
async function uploadDocument(
	doc: DocItem,
	endpoint: string = '/documents/projects/files/upload',
	onUpdate?: (updated: DocItem) => void
): Promise<DocItem> {
	if (!doc.file) {
		doc.progress = 100;
		doc.status = 'done';
		onUpdate?.(doc);
		return doc;
	}
	const formData = prepareFormData(doc);
	if (!formData) return doc;
	doc.status = 'uploading';
	doc.progress = 0;
	doc.error = undefined;
	onUpdate?.(doc);
	try {
		await http.post(endpoint, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
			onUploadProgress: (evt) => {
				if (evt.total) {
					doc.progress = Math.round((evt.loaded / evt.total) * 100);
					onUpdate?.(doc);
				}
			}
		});
		doc.progress = 100;
		doc.status = 'done';
	} catch (e: unknown) {
		interface AxiosLikeError {
			message?: string;
			response?: { status?: number };
		}
		const err = (e as AxiosLikeError) || {};
		const status = err.response?.status;
		const message = err.message || 'Upload failed';
		doc.status = 'error';
		doc.error = status ? `HTTP ${status}` : message;
	} finally {
		onUpdate?.(doc);
	}
	return doc;
}

async function uploadAll(
	docs: DocItem[],
	endpoint: string,
	onBatchUpdate: (updated: DocItem[]) => void
): Promise<DocItem[]> {
	await Promise.all(
		docs
			.filter((d) => d.status === 'pending')
			.map((d) => uploadDocument(d, endpoint, () => onBatchUpdate([...docs])))
	);
	onBatchUpdate([...docs]);
	return docs;
}

function allUploaded(docs: DocItem[]): boolean {
	return docs.length > 0 && docs.every((d) => d.status === 'done');
}

function ensurePreviewUrl(doc: DocItem): string | null {
	if (doc.previewUrl) return doc.previewUrl;
	if (!doc.file) return null;
	const url = URL.createObjectURL(doc.file);
	doc.previewUrl = url;
	return url;
}

function addSigner(doc: DocItem, name = '', email = ''): Signer {
	const nextOrder = doc.signers.length + 1;
	const signer: Signer = {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		name,
		email,
		order: nextOrder
	};
	doc.signers = [...doc.signers, signer];
	return signer;
}

function updateSigner(doc: DocItem, signerId: string, data: Partial<Omit<Signer, 'id' | 'order'>>) {
	doc.signers = doc.signers.map((s) => (s.id === signerId ? { ...s, ...data } : s));
}

function removeSigner(doc: DocItem, signerId: string) {
	doc.signers = doc.signers
		.filter((s) => s.id !== signerId)
		.map((s, idx) => ({ ...s, order: idx + 1 }));
}

function reorderSigners(doc: DocItem, fromIndex: number, toIndex: number) {
	const arr = [...doc.signers];
	if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) return;
	const [moved] = arr.splice(fromIndex, 1);
	arr.splice(toIndex, 0, moved);
	doc.signers = arr.map((s, idx) => ({ ...s, order: idx + 1 }));
}
function releasePreviewUrl(doc: DocItem) {
	if (doc.previewUrl) {
		URL.revokeObjectURL(doc.previewUrl);
		doc.previewUrl = undefined;
	}
}

// Keep both named exports (for existing imports) and grouped API style
export const documentApi = {
	createDocItem,
	addFiles,
	seedDocuments,
	prepareFormData,
	uploadDocument,
	uploadAll,
	allUploaded,
	ensurePreviewUrl,
	releasePreviewUrl,
	addSigner,
	updateSigner,
	removeSigner,
	reorderSigners
};

export {
	createDocItem,
	addFiles,
	seedDocuments,
	prepareFormData,
	uploadDocument,
	uploadAll,
	allUploaded,
	ensurePreviewUrl,
	releasePreviewUrl,
	addSigner,
	updateSigner,
	removeSigner,
	reorderSigners
};
