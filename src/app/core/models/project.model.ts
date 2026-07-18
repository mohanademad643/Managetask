export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}
export type ViewState = 'loading' | 'error' | 'empty' | 'data';

export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface ProjectMemberMetadata {
  sub: string;
  name: string;
  email: string;
  department?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
}

export interface ProjectMemberResponse {
  member_id: string;
  project_id: string;
  user_id: string;
  role: MemberRole;
  email: string;
  metadata: ProjectMemberMetadata;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  department?: string;
}

export interface EpicUser {
  sub: string;
  name: string;
  email: string;
  department?: string;
}
 
export interface Epic {
  id: string;
  epic_id: string;
  title: string;
  description?: string;
  deadline?: string;
  created_at: string;
  created_by: EpicUser;
  assignee: EpicUser;
}
 
export interface Epic {
  id: string;
  epic_id: string;
  title: string;
  description?: string;
  deadline?: string;
  created_at: string;
  created_by: EpicUser;
  assignee: EpicUser;
}

export interface CreateEpicPayload {
  title: string;
  description?: string;
  assignee_id?: string;
  project_id: string;
  deadline?: string;
}