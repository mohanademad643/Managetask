export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}
export type ViewState = 'loading' | 'error' | 'empty' | 'data';