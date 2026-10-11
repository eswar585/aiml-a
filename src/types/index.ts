export type Role = 'student' | 'admin';

export interface Profile {
  id: string;
  username?: string | null;
  display_name: string;
  role: Role;
  created_at?: string;
  updated_at?: string;
}

export interface Semester {
  id: string;
  academic_year: string;
  year_number: number;
  semester_number: number;
  title: string;
  branch: string;
  section: string;
  display_order: number;
  created_at?: string;
}

export interface Subject {
  id: string;
  semester_id: string;
  slug: string;
  subject_name: string;
  official_subject_code?: string | null;
  description?: string | null;
  faculty_name?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Computed/joined fields:
  units_count?: number;
  resources_count?: number;
}

export interface Unit {
  id: string;
  subject_id: string;
  unit_number: number;
  unit_title: string;
  description?: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export type ResourceCategory =
  | 'Syllabus'
  | 'Unit-wise Notes'
  | 'PPT Presentations'
  | 'Previous Question Papers'
  | 'Assignments'
  | 'Lab Manuals'
  | 'Lab Programs and Practical Materials'
  | 'Important Questions'
  | 'Reference Books and Materials'
  | 'Additional Resources';

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'Syllabus',
  'Unit-wise Notes',
  'PPT Presentations',
  'Previous Question Papers',
  'Assignments',
  'Lab Manuals',
  'Lab Programs and Practical Materials',
  'Important Questions',
  'Reference Books and Materials',
  'Additional Resources',
];

export interface Resource {
  id: string;
  title: string;
  description?: string | null;
  subject_id: string;
  unit_id?: string | null;
  category: ResourceCategory;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  tags: string[];
  uploaded_by?: string | null;
  is_published: boolean;
  archived_at?: string | null;
  exam_year?: string | null;
  faculty_contributor?: string | null;
  download_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields:
  subject?: Subject;
  unit?: Unit;
  public_url?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_important: boolean;
  is_published: boolean;
  published_at: string;
  expires_at?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id?: string | null;
  action: string;
  target_type: string;
  target_id?: string | null;
  details?: Record<string, any> | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
  resource?: Resource;
}

export interface StudyTask {
  id: string;
  title: string;
  subject_slug?: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
}
