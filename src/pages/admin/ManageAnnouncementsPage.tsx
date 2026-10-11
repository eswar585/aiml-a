import React, { useEffect, useState } from 'react';
import { announcementService } from '../../services/announcementService';
import { Announcement } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../lib/utils';
import {
  Bell,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Flame,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';

export const ManageAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Partial<Announcement> | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [annToDelete, setAnnToDelete] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchAnnouncements = () => {
    setLoading(true);
    announcementService
      .getAnnouncements(false)
      .then((data) => setAnnouncements(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setEditingAnn({
      title: '',
      content: '',
      is_important: false,
      is_published: true,
      published_at: new Date().toISOString().slice(0, 16),
      expires_at: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnn({
      ...ann,
      published_at: ann.published_at ? new Date(ann.published_at).toISOString().slice(0, 16) : '',
      expires_at: ann.expires_at ? new Date(ann.expires_at).toISOString().slice(0, 16) : '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn || !editingAnn.title || !editingAnn.content) return;

    setSaving(true);
    try {
      const payload = {
        title: editingAnn.title.trim(),
        content: editingAnn.content.trim(),
        is_important: Boolean(editingAnn.is_important),
        is_published: Boolean(editingAnn.is_published),
        published_at: editingAnn.published_at
          ? new Date(editingAnn.published_at).toISOString()
          : new Date().toISOString(),
        expires_at: editingAnn.expires_at ? new Date(editingAnn.expires_at).toISOString() : null,
      };

      if (editingAnn.id) {
        await announcementService.updateAnnouncement(editingAnn.id, payload);
        setToastMessage('Announcement updated successfully!');
      } else {
        await announcementService.createAnnouncement(payload);
        setToastMessage('Announcement created and published!');
      }

      setTimeout(() => setToastMessage(null), 3000);
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      alert(`Error saving announcement: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (ann: Announcement) => {
    try {
      await announcementService.updateAnnouncement(ann.id, {
        is_published: !ann.is_published,
      });
      fetchAnnouncements();
    } catch (err: any) {
      alert(`Error toggling: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!annToDelete) return;
    setDeleting(true);
    try {
      await announcementService.deleteAnnouncement(annToDelete.id);
      setToastMessage('Announcement deleted.');
      setTimeout(() => setToastMessage(null), 3000);
      setAnnToDelete(null);
      fetchAnnouncements();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Class Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish critical notices, deadline reminders, syllabus changes, and question paper alerts.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          New Announcement
        </Button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Announcements Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Notice Title</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Publication Date</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading announcements...
                  </td>
                </tr>
              ) : announcements.length > 0 ? (
                announcements.map((ann) => (
                  <tr
                    key={ann.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 max-w-sm">
                      <div className="truncate">{ann.title}</div>
                      <div className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                        {ann.content}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {ann.is_important ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                          <Flame className="w-3 h-3 text-amber-500" />
                          High Priority
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500">Normal</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {formatDate(ann.published_at)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {ann.expires_at ? formatDate(ann.expires_at) : 'Never'}
                    </td>

                    <td className="py-3.5 px-4">
                      {ann.is_published ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                          Published
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                          Hidden
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(ann)}
                          title={ann.is_published ? 'Hide from students' : 'Publish'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {ann.is_published ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(ann)}
                          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        >
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => setAnnToDelete(ann)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No announcements created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Announcement Modal */}
      {editingAnn && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAnn.id ? 'Edit Announcement' : 'Create Class Announcement'}
          description="Notify Section A students on the portal dashboard."
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Announcement Title"
              required
              value={editingAnn.title || ''}
              onChange={(e) => setEditingAnn({ ...editingAnn, title: e.target.value })}
              placeholder="e.g. Mid-Term Exam Syllabus & Question Papers Uploaded"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Notice Content
              </label>
              <textarea
                rows={4}
                required
                value={editingAnn.content || ''}
                onChange={(e) => setEditingAnn({ ...editingAnn, content: e.target.value })}
                placeholder="Details of the announcement, deadlines, or links..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Publication Date & Time"
                type="datetime-local"
                value={editingAnn.published_at || ''}
                onChange={(e) => setEditingAnn({ ...editingAnn, published_at: e.target.value })}
              />

              <Input
                label="Expiry Date & Time (Optional)"
                type="datetime-local"
                value={editingAnn.expires_at || ''}
                onChange={(e) => setEditingAnn({ ...editingAnn, expires_at: e.target.value })}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editingAnn.is_important}
                  onChange={(e) =>
                    setEditingAnn({ ...editingAnn, is_important: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Mark as High Priority (Banner Display)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editingAnn.is_published}
                  onChange={(e) =>
                    setEditingAnn({ ...editingAnn, is_published: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Published (Active)
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                {editingAnn.id ? 'Save Changes' : 'Publish Notice'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(annToDelete)}
        onClose={() => setAnnToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete the notice "${annToDelete?.title}"?`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
};
