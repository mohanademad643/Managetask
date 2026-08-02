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
  assignee?: EpicUser;
}
 
export interface Epic {
  id: string;
  epic_id: string;
  title: string;
  description?: string;
  deadline?: string;
  created_at: string;
  created_by: EpicUser;
  assignee?: EpicUser;
}

export interface CreateEpicPayload {
  title: string;
  description?: string;
  assignee_id?: string;
  project_id: string;
  deadline?: string;
}
export interface UpdateEpicPayload {
  title?: string;
  description?: string;
  assignee_id?: string | null;
  deadline?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  total: number;

}
export interface TaskDropEvent {
  task: EpicTask;
  previousStatus: TaskStatus;
  newStatus: TaskStatus;
}
export enum TaskStatus {
  ToDo = 'TO_DO',
  InProgress = 'IN_PROGRESS',
  Blocked = 'BLOCKED',
  InReview = 'IN_REVIEW',
  ReadyForQa = 'READY_FOR_QA',
  Reopened = 'REOPENED',
  ReadyForProduction = 'READY_FOR_PRODUCTION',
  Done = 'DONE',
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  epic_id?: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  created_at: string;
}

export interface CreateTaskPayload {
  project_id: string;
  title: string;
  status?: TaskStatus;
  epic_id?: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
}

export interface EpicTaskUser {
  id: string;
  name: string;
  email: string;
  department?: string;
}

export interface EpicTaskEpicRef {
  id: string;
  title: string;
  epic_id: string;
}

export interface EpicTask {
  id: string;
  project_id: string;
  epic_id: string;
  task_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  created_at: string;
  due_date?: string;
  epic: EpicTaskEpicRef;
  created_by: EpicTaskUser;
  assignee?: EpicTaskUser;
}

export interface TaskStatusConfig {
  status: TaskStatus;
  label: string;
  color: string; 
}
export type DueStatus = 'overdue' | 'today' | 'upcoming';

export interface ColumnData {
  state: ViewState;
  tasks: EpicTask[];
}
export const TASK_STATUS_CONFIGS: TaskStatusConfig[] = [
  { status: TaskStatus.ToDo, label: 'To Do', color: '--color-neutral-600' },
  { status: TaskStatus.InProgress, label: 'In Progress', color: '--color-primary-container' },
  { status: TaskStatus.Blocked, label: 'Blocked', color: '--color-error' },
  { status: TaskStatus.InReview, label: 'In Review', color: '--color-warning' },
  { status: TaskStatus.ReadyForQa, label: 'Ready for QA', color: '--color-primary' },
  { status: TaskStatus.Reopened, label: 'Reopened', color: '--color-error' },
  { status: TaskStatus.ReadyForProduction, label: 'Ready for Production', color: '--color-success' },
  { status: TaskStatus.Done, label: 'Done', color: '--color-success' },
];