import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Announcement } from '../types';
import { mockStore } from './mockStore';

export const announcementService = {
  async getAnnouncements(publishedOnly = true): Promise<Announcement[]> {
    if (!isSupabaseConfigured()) {
      return mockStore.getAnnouncements(publishedOnly);
    }

    try {
      let query = supabase
        .from('announcements')
        .select('*')
        .order('published_at', { ascending: false });

      if (publishedOnly) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error || !data) {
        return mockStore.getAnnouncements(publishedOnly);
      }
      return data;
    } catch {
      return mockStore.getAnnouncements(publishedOnly);
    }
  },

  async createAnnouncement(
    ann: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Announcement> {
    if (!isSupabaseConfigured()) {
      const created = mockStore.addAnnouncement(ann);
      mockStore.addAuditLog('CREATE_ANNOUNCEMENT', 'announcement', created.id, { title: created.title });
      return created;
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert([ann])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement> {
    if (!isSupabaseConfigured()) {
      const updated = mockStore.updateAnnouncement(id, updates);
      mockStore.addAuditLog('UPDATE_ANNOUNCEMENT', 'announcement', id, updates);
      return updated;
    }

    const { data, error } = await supabase
      .from('announcements')
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

  async deleteAnnouncement(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStore.deleteAnnouncement(id);
      mockStore.addAuditLog('DELETE_ANNOUNCEMENT', 'announcement', id);
      return;
    }

    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
