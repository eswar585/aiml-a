import React, { useEffect, useState } from 'react';
import { subjectService } from '../../services/subjectService';
import { resourceService } from '../../services/resourceService';
import { Subject, Unit } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const ManageUnitsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  // Unit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Partial<Unit> | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    subjectService.getSubjects().then((subList) => {
      setSubjects(subList);
      if (subList.length > 0) {
        setSelectedSubjectId(subList[0].id);
      }
    });
  }, []);

  const loadUnits = (subjectId: string) => {
    setLoading(true);
    subjectService
      .getUnits(subjectId)
      .then((data) => setUnits(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedSubjectId) {
      loadUnits(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const handleOpenAdd = () => {
    const nextNumber = units.length + 1;
    setEditingUnit({
      subject_id: selectedSubjectId,
      unit_number: nextNumber,
      unit_title: `Unit ${nextNumber}: `,
      description: '',
      display_order: nextNumber,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: Unit) => {
    setEditingUnit({ ...u });
    setIsModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit || !selectedSubjectId) return;

    setSaving(true);
    try {
      if (editingUnit.id) {
        await subjectService.updateUnit(editingUnit.id, {
          unit_number: Number(editingUnit.unit_number),
          unit_title: editingUnit.unit_title,
          description: editingUnit.description,
          display_order: Number(editingUnit.display_order),
        });
        setToastMessage('Unit updated successfully.');
      } else {
        await subjectService.addUnit({
          subject_id: selectedSubjectId,
          unit_number: Number(editingUnit.unit_number) || units.length + 1,
          unit_title: editingUnit.unit_title || 'New Unit',
          description: editingUnit.description,
          display_order: Number(editingUnit.display_order) || units.length + 1,
        });
        setToastMessage('Unit created successfully.');
      }
      setTimeout(() => setToastMessage(null), 3000);
      setIsModalOpen(false);
      loadUnits(selectedSubjectId);
    } catch (err: any) {
      alert(`Error saving unit: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return;
    setDeleting(true);
    try {
      await subjectService.deleteUnit(unitToDelete.id);
      setToastMessage('Unit removed successfully.');
      setTimeout(() => setToastMessage(null), 3000);
      setUnitToDelete(null);
      loadUnits(selectedSubjectId);
    } catch (err: any) {
      alert(`Error deleting unit: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Manage Syllabus Units
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, rename, reorder, and structure the units for each of the seven subjects.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
          disabled={!selectedSubjectId}
        >
          Add Unit to Subject
        </Button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Subject Filter Selector */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-2">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
          Select Subject:
        </span>
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubjectId(sub.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedSubjectId === sub.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {sub.subject_name}
          </button>
        ))}
      </div>

      {/* Units Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Units for {selectedSubject?.subject_name} ({units.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Unit #</th>
                <th className="py-3 px-4">Unit Title</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading units...
                  </td>
                </tr>
              ) : units.length > 0 ? (
                units.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      #{u.display_order}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Unit {u.unit_number}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {u.unit_title}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-sm line-clamp-1">
                      {u.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(u)}
                          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        >
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => setUnitToDelete(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No units created yet for this subject. Click &ldquo;Add Unit&rdquo; to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Unit Modal */}
      {editingUnit && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingUnit.id ? 'Edit Unit' : 'Create New Unit'}
          description={`Configuring unit for ${selectedSubject?.subject_name}.`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveUnit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Unit Number"
                type="number"
                required
                value={editingUnit.unit_number || 1}
                onChange={(e) =>
                  setEditingUnit({ ...editingUnit, unit_number: Number(e.target.value) })
                }
              />
              <Input
                label="Display Order"
                type="number"
                required
                value={editingUnit.display_order || 1}
                onChange={(e) =>
                  setEditingUnit({ ...editingUnit, display_order: Number(e.target.value) })
                }
              />
            </div>

            <Input
              label="Unit Title"
              required
              value={editingUnit.unit_title || ''}
              onChange={(e) =>
                setEditingUnit({ ...editingUnit, unit_title: e.target.value })
              }
              placeholder="e.g. Unit 1: Fundamentals of AI"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Unit Syllabus Topics Summary
              </label>
              <textarea
                rows={3}
                value={editingUnit.description || ''}
                onChange={(e) =>
                  setEditingUnit({ ...editingUnit, description: e.target.value })
                }
                placeholder="Key topics, chapters, and curriculum outcomes..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
                {editingUnit.id ? 'Update Unit' : 'Create Unit'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(unitToDelete)}
        onClose={() => setUnitToDelete(null)}
        onConfirm={handleDeleteUnit}
        title="Delete Unit"
        message={`Are you sure you want to remove "${unitToDelete?.unit_title}"? Any study materials tagged with this unit will be unassigned.`}
        confirmText="Delete Unit"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
};
