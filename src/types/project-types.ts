export interface ProjectStatus {
	status: 'draft' | 'active' | 'archived';
}

export interface ProjectType {
	type: 'uploaded' | 'generated';
}

export interface signatureStatus {
	status: 'pending' | 'signed' | 'rejected';
}

export interface Project {
	id: number;
	projectName: string;
	projectCode: string;
	ownerId: number;
	type: ProjectType['type'];
	status: ProjectStatus['status'];
	createdAt: string;
	updatedAt: string | null;
	deletedAt: string | null;
}

export interface ProjectFile {
	id: number;
	projectId: number;
	fileName: string;
	description: string | null;
	createdAt: string;
	updatedAt: string | null;
	deletedAt: string | null;
}

export interface ProjectSigner {
	id: number;
	projectFileId: number;
	signerUserId: number;
	position: number;
	userName: string;
	userEmail: string;
	signatureStatus: signatureStatus['status'];
	signedAt: string | null;
	createdAt: string;
	updatedAt: string | null;
	deletedAt: string | null;
}

export interface ProjectSummary {
	totalFiles: number;
	totalSigners: number;
	signatureCompleted: number;
}

export interface ProjectWithRelations extends Project {
	files: ProjectFile[];
	signers: ProjectSigner[];
	summary: ProjectSummary;
}
