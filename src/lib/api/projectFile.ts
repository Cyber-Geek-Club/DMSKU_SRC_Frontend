import { http } from './http';
import type { AxiosProgressEvent } from 'axios';

/**
 * Upload a project file with progress callback.
 * @param projectsId project id
 * @param file File object
 * @param description optional description
 * @param onProgress callback(percent 0-100, rawEvent)
 */
function uploadProjectFile(
	projectsId: number,
	file: File,
	description = '',
	onProgress?: (percent: number, evt: AxiosProgressEvent) => void
) {
	const fd = new FormData();
	fd.append('file', file, file.name);
	fd.append('projectsId', String(projectsId));
	fd.append('description', description);
	return http.post('/documents/projects/files/upload', fd, {
		headers: { 'Content-Type': 'multipart/form-data' },
		onUploadProgress: (evt) => {
			if (evt.total) {
				const percent = Math.round((evt.loaded / evt.total) * 100);
				onProgress?.(percent, evt);
			}
		}
	});
}

function createFileSigner(projectFileId: number, signerUserId: number, position: number) {
	return http.post('/documents/signers', { projectFileId, signerUserId, position });
}

function createFileSignature(projectFileId: number, signerUserId: number) {
	return http.post('/documents/signatures', { projectFileId, signerUserId });
}

// Download (as blob) a project file for preview/display. Assumes backend route returns binary
function downloadProjectFile(fileId: number) {
	return http.get(`/documents/files/${fileId}/download`, { responseType: 'blob' });
}

// Delete a project file from backend
function deleteProjectFile(fileId: number) {
	return http.delete(`/documents/files/${fileId}/hard`);
}

export const projectFile = {
	uploadProjectFile,
	createFileSigner,
	createFileSignature,
	downloadProjectFile,
	deleteProjectFile
};

export {
	uploadProjectFile,
	createFileSigner,
	createFileSignature,
	downloadProjectFile,
	deleteProjectFile
};
