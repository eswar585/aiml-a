import { Subject, Unit, Resource, Announcement, AdminAuditLog } from '../types';
import { INITIAL_SUBJECTS, INITIAL_UNITS, INITIAL_RESOURCES, INITIAL_ANNOUNCEMENTS } from '../lib/mockData';

const STORAGE_KEYS = {
  SUBJECTS: 'aiml_hub_subjects',
  UNITS: 'aiml_hub_units',
  RESOURCES: 'aiml_hub_resources',
  ANNOUNCEMENTS: 'aiml_hub_announcements',
  LOGS: 'aiml_hub_logs',
  ADMIN_AUTH: 'aiml_hub_admin_session',
  BOOKMARKS: 'aiml_hub_bookmarks',
  RECENTLY_VIEWED: 'aiml_hub_recently_viewed',
  STUDY_TASKS: 'aiml_hub_study_tasks',
};

class MockDataStore {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // Subjects
  getSubjects(): Subject[] {
    const list = this.get<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    const resources = this.getResources();
    const units = this.getUnits();
    return list.map((sub) => ({
      ...sub,
      units_count: units.filter((u) => u.subject_id === sub.id).length,
      resources_count: resources.filter((r) => r.subject_id === sub.id && r.is_published && !r.archived_at).length,
    }));
  }

  getSubjectBySlug(slug: string): Subject | undefined {
    return this.getSubjects().find((s) => s.slug === slug);
  }

  updateSubject(id: string, updates: Partial<Subject>): Subject {
    const list = this.get<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Subject not found');
    list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
    this.set(STORAGE_KEYS.SUBJECTS, list);
    return list[index];
  }

  // Units
  getUnits(subjectId?: string): Unit[] {
    const list = this.get<Unit[]>(STORAGE_KEYS.UNITS, INITIAL_UNITS);
    if (subjectId) return list.filter((u) => u.subject_id === subjectId);
    return list;
  }

  addUnit(unit: Omit<Unit, 'id' | 'created_at' | 'updated_at'>): Unit {
    const list = this.getUnits();
    const newUnit: Unit = {
      ...unit,
      id: 'unit-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.push(newUnit);
    this.set(STORAGE_KEYS.UNITS, list);
    return newUnit;
  }

  updateUnit(id: string, updates: Partial<Unit>): Unit {
    const list = this.getUnits();
    const index = list.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('Unit not found');
    list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
    this.set(STORAGE_KEYS.UNITS, list);
    return list[index];
  }

  deleteUnit(id: string): void {
    const list = this.getUnits().filter((u) => u.id !== id);
    this.set(STORAGE_KEYS.UNITS, list);
  }

  // Resources
  getResources(filter?: { subjectId?: string; unitId?: string; category?: string; search?: string }): Resource[] {
    let list = this.get<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    const subjects = this.getSubjects();
    const units = this.getUnits();

    list = list.map((r) => ({
      ...r,
      subject: subjects.find((s) => s.id === r.subject_id),
      unit: units.find((u) => u.id === r.unit_id),
    }));

    if (filter?.subjectId) {
      list = list.filter((r) => r.subject_id === filter.subjectId);
    }
    if (filter?.unitId) {
      list = list.filter((r) => r.unit_id === filter.unitId);
    }
    if (filter?.category && filter.category !== 'All') {
      list = list.filter((r) => r.category === filter.category);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q)) ||
          r.subject?.subject_name.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getResourceById(id: string): Resource | undefined {
    return this.getResources().find((r) => r.id === id);
  }

  addResource(resource: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'download_count' | 'view_count'>): Resource {
    const list = this.get<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    const newRes: Resource = {
      ...resource,
      id: 'res-' + Date.now(),
      download_count: 0,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(newRes);
    this.set(STORAGE_KEYS.RESOURCES, list);
    return newRes;
  }

  updateResource(id: string, updates: Partial<Resource>): Resource {
    const list = this.get<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Resource not found');
    list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
    this.set(STORAGE_KEYS.RESOURCES, list);
    return list[index];
  }

  deleteResource(id: string): void {
    const list = this.get<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES).filter((r) => r.id !== id);
    this.set(STORAGE_KEYS.RESOURCES, list);
  }

  incrementMetric(id: string, type: 'view' | 'download'): void {
    const list = this.get<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    const item = list.find((r) => r.id === id);
    if (item) {
      if (type === 'view') item.view_count += 1;
      if (type === 'download') item.download_count += 1;
      this.set(STORAGE_KEYS.RESOURCES, list);
    }
  }

  // Announcements
  getAnnouncements(publishedOnly = true): Announcement[] {
    const list = this.get<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    if (publishedOnly) {
      return list.filter((a) => a.is_published);
    }
    return list;
  }

  addAnnouncement(ann: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Announcement {
    const list = this.get<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const newAnn: Announcement = {
      ...ann,
      id: 'ann-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(newAnn);
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, list);
    return newAnn;
  }

  updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement {
    const list = this.get<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Announcement not found');
    list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, list);
    return list[index];
  }

  deleteAnnouncement(id: string): void {
    const list = this.get<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS).filter((a) => a.id !== id);
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, list);
  }

  // Audit Logs
  getAuditLogs(): AdminAuditLog[] {
    return this.get<AdminAuditLog[]>(STORAGE_KEYS.LOGS, [
      {
        id: 'log-1',
        action: 'SYSTEM_INITIALIZE',
        target_type: 'system',
        target_id: 'init',
        details: { note: 'Initial AIML Section A schema seeded' },
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 'log-2',
        action: 'SUBJECT_VERIFIED',
        target_type: 'subject',
        target_id: 'sub-def',
        details: { note: '7 core subjects loaded' },
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ]);
  }

  addAuditLog(action: string, target_type: string, target_id?: string, details?: any): void {
    const list = this.getAuditLogs();
    list.unshift({
      id: 'log-' + Date.now(),
      action,
      target_type,
      target_id,
      details,
      created_at: new Date().toISOString(),
    });
    this.set(STORAGE_KEYS.LOGS, list.slice(0, 50));
  }
}

export const mockStore = new MockDataStore();
