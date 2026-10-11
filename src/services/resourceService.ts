import { supabase, isSupabaseConfigured, BUCKET_NAME } from '../lib/supabase';
import { Resource } from '../types';
import { mockStore } from './mockStore';

export interface ResourceFilters {
  subjectId?: string;
  unitId?: string;
  category?: string;
  search?: string;
  includeUnpublished?: boolean;
  sortBy?: 'newest' | 'oldest' | 'title' | 'size';
}

export const resourceService = {
  async getResources(filters?: ResourceFilters): Promise<Resource[]> {
    if (!isSupabaseConfigured()) {
      let list = mockStore.getResources({
        subjectId: filters?.subjectId,
        unitId: filters?.unitId,
        category: filters?.category,
        search: filters?.search,
      });

      if (!filters?.includeUnpublished) {
        list = list.filter((r) => r.is_published && !r.archived_at);
      }

      // Sorting
      if (filters?.sortBy === 'oldest') {
        list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } else if (filters?.sortBy === 'title') {
        list.sort((a, b) => a.title.localeCompare(b.title));
      } else if (filters?.sortBy === 'size') {
        list.sort((a, b) => b.file_size - a.file_size);
      } else {
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      return list;
    }

    try {
      let query = supabase
        .from('resources')
        .select(`
          *,
          subject:subjects(id, slug, subject_name),
          unit:units(id, unit_number, unit_title)
        `);

      if (!filters?.includeUnpublished) {
        query = query.eq('is_published', true).is('archived_at', null);
      }

      if (filters?.subjectId) {
        query = query.eq('subject_id', filters.subjectId);
      }

      if (filters?.unitId) {
        query = query.eq('unit_id', filters.unitId);
      }

      if (filters?.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (filters?.sortBy === 'title') {
        query = query.order('title', { ascending: true });
      } else if (filters?.sortBy === 'size') {
        query = query.order('file_size', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error || !data) {
        console.warn('Error fetching resources from Supabase:', error);
        return mockStore.getResources(filters);
      }

      // Attach public storage URL
      return data.map((item: any) => {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(item.storage_path);
        return {
          ...item,
          public_url: urlData?.publicUrl,
        };
      });
    } catch {
      return mockStore.getResources(filters);
    }
  },

  async getResourceById(id: string): Promise<Resource | null> {
    if (!isSupabaseConfigured()) {
      return mockStore.getResourceById(id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          subject:subjects(id, slug, subject_name),
          unit:units(id, unit_number, unit_title)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return mockStore.getResourceById(id) || null;
      }

      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.storage_path);
      return {
        ...data,
        public_url: urlData?.publicUrl,
      };
    } catch {
      return mockStore.getResourceById(id) || null;
    }
  },

  async uploadFileToStorage(
    file: File,
    subjectSlug: string
  ): Promise<{ storage_path: string; mime_type: string; file_size: number; public_url: string }> {
    // Client-side validation: Max 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File exceeds the 50MB limit.');
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniquePath = `semester-1/${subjectSlug}/${Date.now()}-${sanitizedName}`;

    if (!isSupabaseConfigured()) {
      // In demo mode: create an object URL or simulated preview
      const objectUrl = URL.createObjectURL(file);
      return {
        storage_path: uniquePath,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
        public_url: objectUrl,
      };
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniquePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uniquePath);

    return {
      storage_path: uniquePath,
      mime_type: file.type || 'application/octet-stream',
      file_size: file.size,
      public_url: urlData.publicUrl,
    };
  },

  async createResource(
    resourceData: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'download_count' | 'view_count'>
  ): Promise<Resource> {
    if (!isSupabaseConfigured()) {
      const created = mockStore.addResource(resourceData);
      mockStore.addAuditLog('CREATE_RESOURCE', 'resource', created.id, { title: created.title });
      return created;
    }

    const { data, error } = await supabase
      .from('resources')
      .insert([
        {
          title: resourceData.title,
          description: resourceData.description,
          subject_id: resourceData.subject_id,
          unit_id: resourceData.unit_id || null,
          category: resourceData.category,
          file_name: resourceData.file_name,
          storage_path: resourceData.storage_path,
          mime_type: resourceData.mime_type,
          file_size: resourceData.file_size,
          tags: resourceData.tags || [],
          is_published: resourceData.is_published,
          exam_year: resourceData.exam_year || null,
          faculty_contributor: resourceData.faculty_contributor || null,
        },
      ])
      .select()
      .single();

    if (error) {
      // Cleanup uploaded file if DB insertion failed
      try {
        await supabase.storage.from(BUCKET_NAME).remove([resourceData.storage_path]);
      } catch {}
      throw new Error(error.message);
    }

    return data;
  },

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
    if (!isSupabaseConfigured()) {
      const updated = mockStore.updateResource(id, updates);
      mockStore.addAuditLog('UPDATE_RESOURCE', 'resource', id, updates);
      return updated;
    }

    const { data, error } = await supabase
      .from('resources')
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

  async deleteResource(id: string, storagePath?: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStore.deleteResource(id);
      mockStore.addAuditLog('DELETE_RESOURCE', 'resource', id);
      return;
    }

    // Delete DB record
    const { error: dbError } = await supabase.from('resources').delete().eq('id', id);
    if (dbError) throw new Error(dbError.message);

    // Delete file from Storage bucket if path is provided
    if (storagePath) {
      try {
        await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      } catch (e) {
        console.warn('Storage delete warning:', e);
      }
    }
  },

  async recordEvent(resourceId: string, eventType: 'view' | 'download'): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStore.incrementMetric(resourceId, eventType);
      return;
    }

    try {
      await supabase.from('resource_events').insert([
        {
          resource_id: resourceId,
          event_type: eventType,
        },
      ]);
    } catch (e) {
      console.warn('Event recording failed:', e);
    }
  },
};
