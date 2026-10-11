import React, { useEffect, useState } from 'react';
import { subjectService } from '../../services/subjectService';
import { Subject } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { getSubjectIcon } from '../../components/common/SubjectCard';
import {
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  UserCheck,
  Hash,
} from 'lucide-react';

export const ManageSubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSubjects = () => {
    setLoading(true);
    subjectService
      .getSubjects()
      .then((data) => setSubjects(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleEditClick = (sub: Subject) => {
    setEditingSubject({ ...sub });
    setIsModalOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    setSaving(true);
    try {
      await subjectService.updateSubject(editingSubject.id, {
        subject_name: editingSubject.subject_name,
        official_subject_code: editingSubject.official_subject_code,
        description: editingSubject.description,
        faculty_name: editingSubject.faculty_name,
        display_order: Number(editingSubject.display_order),
        is_active: editingSubject.is_active,
      });

      setToastMessage(`Updated ${editingSubject.subject_name} successfully!`);
      setTimeout(() => setToastMessage(null), 3000);
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err: any) {
      alert(`Error updating subject: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Manage Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure the 7 required subjects, assign official codes, enter full forms, and manage faculty details.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Info notice about abbreviations */}
      <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
        <div>
          <span className="font-semibold">Subject Abbreviations Policy:</span>
          <p className="mt-0.5 text-[11px] text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
            DEF, DMS, and SFCDS are preserved exactly as designated by university instructions. Once their official full names or course codes are confirmed by the department, you can edit and update them here.
          </p>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Official Code</th>
                <th className="py-3.5 px-4">Faculty In-Charge</th>
                <th className="py-3.5 px-4">Units</th>
                <th className="py-3.5 px-4">Materials</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading subjects...
                  </td>
                </tr>
              ) : (
                subjects.map((sub) => {
                  const Icon = getSubjectIcon(sub.slug);
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div>{sub.subject_name}</div>
                          {sub.description && (
                            <div className="text-[11px] text-slate-400 font-normal line-clamp-1 max-w-xs">
                              {sub.description}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {sub.slug}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {sub.official_subject_code ? (
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                            {sub.official_subject_code}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not Assigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {sub.faculty_name || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                        {sub.units_count ?? 5}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-purple-600 dark:text-purple-400">
                        {sub.resources_count ?? 0}
                      </td>

                      <td className="py-3.5 px-4">
                        {sub.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                            <XCircle className="w-3.5 h-3.5" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                          onClick={() => handleEditClick(sub)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Subject Modal */}
      {editingSubject && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Edit Subject: ${editingSubject.subject_name}`}
          description="Update display title, official course code, faculty details, and syllabus summary."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveSubject} className="space-y-4">
            <Input
              label="Subject Name / Full Form"
              required
              value={editingSubject.subject_name}
              onChange={(e) =>
                setEditingSubject({ ...editingSubject, subject_name: e.target.value })
              }
              placeholder="e.g. DEF, DMS, SFCDS, or full official name"
              leftIcon={<FileText className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Course Code (Optional)"
                value={editingSubject.official_subject_code || ''}
                onChange={(e) =>
                  setEditingSubject({ ...editingSubject, official_subject_code: e.target.value })
                }
                placeholder="e.g. 21AIML301"
                leftIcon={<Hash className="w-4 h-4" />}
              />

              <Input
                label="Faculty In-Charge"
                value={editingSubject.faculty_name || ''}
                onChange={(e) =>
                  setEditingSubject({ ...editingSubject, faculty_name: e.target.value })
                }
                placeholder="Faculty Name..."
                leftIcon={<UserCheck className="w-4 h-4" />}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Course Description
              </label>
              <textarea
                rows={3}
                value={editingSubject.description || ''}
                onChange={(e) =>
                  setEditingSubject({ ...editingSubject, description: e.target.value })
                }
                placeholder="Overview of subject syllabus and topics..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editingSubject.is_active}
                  onChange={(e) =>
                    setEditingSubject({ ...editingSubject, is_active: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Subject Active & Visible in Student Portal
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
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
