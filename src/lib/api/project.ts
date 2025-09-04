import { http } from './http';

export const project = {
	getList: () => http.get('/projects/owner/me'),
	getById: (id: number) => http.get(`/projects/${id}`, { params: { includeRelations: true } }),
	getByCode: (code: string) =>
		http.get(`/projects/code/${code}`, { params: { includeRelations: true } }),
	getQRCode: (id: number, opts?: { format?: 'png' | 'data-url'; scale?: number }) =>
		http.get(`/projects/${id}/qr`, {
			params: { format: opts?.format, scale: opts?.scale },
			responseType: opts?.format === 'png' ? 'arraybuffer' : 'json'
		}),
	createDraft: (projectsName: string, projectNumber: string) =>
		http.post('/projects', { projectsName, projectNumber, type: 'uploaded', status: 'draft' }),
	createActive: (projectsName: string, projectNumber: string) =>
		http.post('/projects', { projectsName, projectNumber, type: 'uploaded', status: 'active' }),
	updateStatus: (projectId: number, status: 'draft' | 'active') =>
		http.put(`/projects/${projectId}`, { status })
};
