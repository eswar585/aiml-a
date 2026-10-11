import React, { useEffect, useState, useRef } from 'react';
import { resourceService } from '../../services/resourceService';
import { subjectService } from '../../services/subjectService';
import { Resource, Subject, Unit, RESOURCE_CATEGORIES, ResourceCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatBytes, formatDate, getFileBadgeInfo } from '../../lib/utils';
import {
  UploadCloud,
  FilePlus,
  Trash2,
  Archive,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ManageResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  // Upload / Edit Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editResourceId, setEditResourceId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('Unit-wise Notes');
  const [tagsInput, setTagsInput] = useState('');
  const [examYear, setExamYear] = useState('');
  const [facultyContributor, setFacultyContributor] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Confirmation actions
  const [deleteResourceTarget, setDeleteResourceTarget] = useState<Resource | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resList, subList] = await Promise.all([
        resourceService.getResources({ includeUnpublished: true }),
        subjectService.getSubjects(),
      ]);
      setResources(resList);
      setSubjects(subList);
      if (subList.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subList[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Update units when form's subject changes
  useEffect(() => {
    if (selectedSubjectId) {
      subjectService.getUnits(selectedSubjectId).then(setUnits);
    } else {
      setUnits([]);
    }
  }, [selectedSubjectId]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedUnitId('');
    setSelectedCategory('Unit-wise Notes');
    setTagsInput('');
    setExamYear('');
    setFacultyContributor('');
    setIsPublished(true);
    setSelectedFile(null);
    setUploadProgress(0);
    setFormError(null);
    setIsEditing(false);
    setEditResourceId(null);
  };

  const handleOpenUpload = () => {
    resetForm();
    if (subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
    setIsUploadModalOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    resetForm();
    setIsEditing(true);
    setEditResourceId(res.id);
    setTitle(res.title);
    setDescription(res.description || '');
    setSelectedSubjectId(res.subject_id);
    setSelectedUnitId(res.unit_id || '');
    setSelectedCategory(res.category);
    setTagsInput((res.tags || []).join(', '));
    setExamYear(res.exam_year || '');
    setFacultyContributor(res.faculty_contributor || '');
    setIsPublished(res.is_published);
    setIsUploadModalOpen(true);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'webp', 'zip'];
    if (!ext || !allowed.includes(ext)) {
      setFormError(`File type .${ext} is not supported. Allowed formats: PDF, PPT, Word, Text, Images, ZIP.`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setFormError('File exceeds the 50MB size limit.');
      return;
    }
    setFormError(null);
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }
  };

  const handleSubmitResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Resource title is required.');
      return;
    }

    if (!selectedSubjectId) {
      setFormError('Please select a subject.');
      return;
    }

    if (!isEditing && !selectedFile) {
      setFormError('Please select a file to upload.');
      return;
    }

    const currentSub = subjects.find((s) => s.id === selectedSubjectId);
    const subjectSlug = currentSub?.slug || 'general';

    setSubmitting(true);
    setUploadProgress(25);

    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (isEditing && editResourceId) {
        // Edit metadata (and optionally replace file)
        let updates: Partial<Resource> = {
          title: title.trim(),
          description: description.trim() || null,
          subject_id: selectedSubjectId,
          unit_id: selectedUnitId || null,
          category: selectedCategory,
          tags: parsedTags,
          exam_year: examYear.trim() || null,
          faculty_contributor: facultyContributor.trim() || null,
          is_published: isPublished,
        };

        if (selectedFile) {
          setUploadProgress(50);
          const uploaded = await resourceService.uploadFileToStorage(selectedFile, subjectSlug);
          updates = {
            ...updates,
            file_name: selectedFile.name,
            storage_path: uploaded.storage_path,
            mime_type: uploaded.mime_type,
            file_size: uploaded.file_size,
          };
        }

        await resourceService.updateResource(editResourceId, updates);
        setToastMessage('Resource updated successfully!');
      } else if (selectedFile) {
        setUploadProgress(50);
        // Upload file to Supabase Storage
        const uploaded = await resourceService.uploadFileToStorage(selectedFile, subjectSlug);

        setUploadProgress(85);
        // Save metadata into PostgreSQL
        await resourceService.createResource({
          title: title.trim(),
          description: description.trim() || null,
          subject_id: selectedSubjectId,
          unit_id: selectedUnitId || null,
          category: selectedCategory,
          file_name: selectedFile.name,
          storage_path: uploaded.storage_path,
          mime_type: uploaded.mime_type,
          file_size: uploaded.file_size,
          tags: parsedTags,
          exam_year: examYear.trim() || null,
          faculty_contributor: facultyContributor.trim() || null,
          is_published: isPublished,
        });

        setToastMessage('Resource uploaded and published successfully!');
      }

      setUploadProgress(100);
      setTimeout(() => setToastMessage(null), 3000);
      setIsUploadModalOpen(false);
      resetForm();
      fetchAll();
    } catch (err: any) {
      setFormError(err.message || 'Upload operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (res: Resource) => {
    try {
      await resourceService.updateResource(res.id, {
        is_published: !res.is_published,
      });
      fetchAll();
    } catch (err: any) {
      alert(`Error toggling publication: ${err.message}`);
    }
  };

  const handleArchive = async (res: Resource) => {
    try {
      await resourceService.updateResource(res.id, {
        archived_at: res.archived_at ? null : new Date().toISOString(),
      });
      setToastMessage(res.archived_at ? 'Resource unarchived.' : 'Resource archived.');
      setTimeout(() => setToastMessage(null), 3000);
      fetchAll();
    } catch (err: any) {
      alert(`Error archiving: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteResourceTarget) return;
    setActionLoading(true);
    try {
      await resourceService.deleteResource(deleteResourceTarget.id, deleteResourceTarget.storage_path);
      setToastMessage('Resource deleted permanently.');
      setTimeout(() => setToastMessage(null), 3000);
      setDeleteResourceTarget(null);
      fetchAll();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered resources
  const filteredResources = resources.filter((r) => {
    if (filterSubject !== 'all' && r.subject_id !== filterSubject) return false;
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.file_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Study Resources & Course Materials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload notes, PPTs, syllabus copies, lab manuals, and previous examination question papers.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<FilePlus className="w-4 h-4" />}
          onClick={handleOpenUpload}
        >
          Upload New Resource
        </Button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Search resources by title or file name..."
            className="w-full bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Subjects (7)</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject_name}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {RESOURCE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Title & Details</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Unit</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Format</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading resources...
                  </td>
                </tr>
              ) : filteredResources.length > 0 ? (
                filteredResources.map((res) => {
                  const badge = getFileBadgeInfo(res.file_name);
                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 max-w-xs">
                        <div className="truncate">{res.title}</div>
                        <div className="text-[11px] text-slate-400 font-normal truncate">
                          {res.file_name}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {res.subject?.subject_name}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {res.unit ? res.unit.unit_title.split(':')[0] : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {res.category}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {formatBytes(res.file_size)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {formatDate(res.created_at)}
                      </td>

                      <td className="py-3.5 px-4">
                        {res.archived_at ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Archived
                          </span>
                        ) : res.is_published ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            Published
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(res)}
                            title={res.is_published ? 'Unpublish' : 'Publish'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(res)}
                          >
                            Edit
                          </Button>
                          <button
                            type="button"
                            onClick={() => handleArchive(res)}
                            title={res.archived_at ? 'Restore' : 'Archive'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteResourceTarget(res)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No resources match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload & Edit Resource Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={isEditing ? 'Edit Resource Details' : 'Upload Academic Resource'}
        description="Attach document file to Supabase Storage and configure syllabus metadata."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitResource} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Drag & Drop File Upload Area */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Document File (.pdf, .pptx, .docx, .zip, images)
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                  : selectedFile
                  ? 'border-emerald-400 dark:border-emerald-600/50 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-750 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud
                className={`w-10 h-10 mx-auto mb-2 ${
                  selectedFile ? 'text-emerald-500' : 'text-slate-400'
                }`}
              />
              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Ready to upload ({formatBytes(selectedFile.size)})
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Click to select file or drag and drop here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PDF, PowerPoint, Word, Text, Images, ZIP up to 50MB
                  </p>
                  {isEditing && (
                    <p className="text-[10px] text-indigo-500 mt-2 font-medium">
                      Leave empty to keep existing document file.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <Input
            label="Resource Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Unit 1: Propositional Logic Lecture Notes"
          />

          {/* Subject & Category Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Subject
              </label>
              <select
                required
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Resource Category
              </label>
              <select
                required
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {RESOURCE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unit & Exam Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Unit (Optional)
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">General / Entire Subject</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unit_title}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Examination Year (For PYQs)"
              value={examYear}
              onChange={(e) => setExamYear(e.target.value)}
              placeholder="e.g. 2024, 2023"
            />
          </div>

          {/* Tags & Contributor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tags (Comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Unit 1, Notes, Mid-1, PYQ"
            />

            <Input
              label="Faculty / Contributor Name"
              value={facultyContributor}
              onChange={(e) => setFacultyContributor(e.target.value)}
              placeholder="e.g. Dr. Faculty Name"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Short Summary
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about what this resource contains..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Publish Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              Immediately publish on Student Portal
            </label>
          </div>

          {/* Upload Progress Bar */}
          {submitting && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-indigo-500 font-semibold">
                <span>Uploading and saving metadata...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={submitting}
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
            >
              {isEditing ? 'Save Changes' : 'Upload Resource'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteResourceTarget)}
        onClose={() => setDeleteResourceTarget(null)}
        onConfirm={handleDelete}
        title="Delete Resource Permanently"
        message={`Are you sure you want to permanently delete "${deleteResourceTarget?.title}"? The file will be removed from storage.`}
        confirmText="Delete File"
        isDestructive={true}
        isLoading={actionLoading}
      />
    </div>
  );
};
