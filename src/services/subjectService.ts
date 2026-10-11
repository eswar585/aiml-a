import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Subject, Unit } from '../types';
import { mockStore } from './mockStore';

export const subjectService = {
  async getSubjects(): Promise<Subject[]> {
    if (!isSupabaseConfigured()) {
      return mockStore.getSubjects();
    }

    try {
      const { data: subjects, error } = await supabase
        .from('subjects')
        .select(`
          *,
          units:units(id),
          resources:resources(id, is_published, archived_at)
        `)
        .order('display_order', { ascending: true });

      if (error || !subjects) {
        console.warn('Supabase fetch subjects failed, using fallback:', error);
        return mockStore.getSubjects();
      }

      return subjects.map((s: any) => ({
        ...s,
        units_count: s.units ? s.units.length : 0,
        resources_count: s.resources
          ? s.resources.filter((r: any) => r.is_published && !r.archived_at).length
          : 0,
      }));
    } catch (e) {
      console.warn('Error fetching subjects:', e);
      return mockStore.getSubjects();
    }
  },

  async getSubjectBySlug(slug: string): Promise<Subject | null> {
    if (!isSupabaseConfigured()) {
      return mockStore.getSubjectBySlug(slug) || null;
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          units:units(id),
          resources:resources(id, is_published, archived_at)
        `)
        .eq('slug', slug)
        .single();

      if (error || !data) {
        return mockStore.getSubjectBySlug(slug) || null;
      }

      return {
        ...data,
        units_count: data.units ? data.units.length : 0,
        resources_count: data.resources
          ? data.resources.filter((r: any) => r.is_published && !r.archived_at).length
          : 0,
      };
    } catch {
      return mockStore.getSubjectBySlug(slug) || null;
    }
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    if (!isSupabaseConfigured()) {
      const res = mockStore.updateSubject(id, updates);
      mockStore.addAuditLog('UPDATE_SUBJECT', 'subject', id, updates);
      return res;
    }

    const { data, error } = await supabase
      .from('subjects')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getUnits(subjectId: string): Promise<Unit[]> {
    if (!isSupabaseConfigured()) {
      return mockStore.getUnits(subjectId).sort((a, b) => a.display_order - b.display_order);
    }

    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('subject_id', subjectId)
        .order('display_order', { ascending: true });

      if (error || !data) {
        return mockStore.getUnits(subjectId);
      }
      return data;
    } catch {
      return mockStore.getUnits(subjectId);
    }
  },

  async addUnit(unit: Omit<Unit, 'id' | 'created_at' | 'updated_at'>): Promise<Unit> {
    if (!isSupabaseConfigured()) {
      const created = mockStore.addUnit(unit);
      mockStore.addAuditLog('CREATE_UNIT', 'unit', created.id, { title: unit.unit_title });
      return created;
    }

    const { data, error } = await supabase
      .from('units')
      .insert([unit])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateUnit(id: string, updates: Partial<Unit>): Promise<Unit> {
    if (!isSupabaseConfigured()) {
      const updated = mockStore.updateUnit(id, updates);
      mockStore.addAuditLog('UPDATE_UNIT', 'unit', id, updates);
      return updated;
    }

    const { data, error } = await supabase
      .from('units')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteUnit(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStore.deleteUnit(id);
      mockStore.addAuditLog('DELETE_UNIT', 'unit', id);
      return;
    }

    const { error } = await supabase.from('units').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
