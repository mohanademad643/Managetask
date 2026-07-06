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