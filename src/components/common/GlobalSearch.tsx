import React, { useState, useEffect, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, FileText, ArrowRight, Filter } from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import { subjectService } from '../../services/subjectService';
import { Resource, Subject, RESOURCE_CATEGORIES } from '../../types';
import { getFileBadgeInfo, formatBytes } from '../../lib/utils';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [results, setResults] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      subjectService.getSubjects().then(setSubjects);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setLoading(true);
      resourceService
        .getResources({
          search: searchTerm.trim() || undefined,
          subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
        })
        .then((data) => {
          startTransition(() => {
            setResults(data);
            setLoading(false);
          });
        })
        .catch(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedSubject, selectedCategory, isOpen]);

  // Keyboard shortcut Cmd/Ctrl + K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden flex flex-col max-h-[80vh] animate-fadeIn">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search syllabus, notes, PPTs, lab manuals, question papers..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Subjects (7)</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.subject_name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {RESOURCE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <span className="ml-auto text-[11px] text-slate-400 shrink-0">
            {results.length} material{results.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100 dark:divide-slate-800/50">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Searching academic materials...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                No matching study resources found
              </p>
              <p className="text-xs text-slate-400">
                Try searching by subject name, topic keywords (e.g. &apos;A*&apos;, &apos;Trees&apos;, &apos;SQL&apos;), or reset filters.
              </p>
            </div>
          ) : (
            results.map((res) => {
              const badge = getFileBadgeInfo(res.file_name);
              return (
                <div
                  key={res.id}
                  onClick={() => {
                    onClose();
                    navigate(`/resources/${res.id}`);
                  }}
                  className="pt-2 first:pt-0 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 shrink-0 ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {res.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {res.description || 'No description provided'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {res.subject?.subject_name}
                        </span>
                        <span>•</span>
                        <span>{res.category}</span>
                        <span>•</span>
                        <span>{formatBytes(res.file_size)}</span>
                        {res.unit && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              {res.unit.unit_title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
