import { http } from './http';

// NOTE: Backend ใช้ field ชื่อ "projectsName" (มี s) ตามตัวอย่างในเอกสาร
// ฟังก์ชันดั้งเดิม createProject ยังคงไว้ (อาจใช้ที่อื่น) แต่จะส่งทั้งสอง key เพื่อความเข้ากันได้
export const project = {
	getList: () => http.get('/projects/owner/me'),
	createDraft: (projectsName: string) =>
		http.post('/projects', { projectsName, type: 'uploaded', status: 'draft' })
};
