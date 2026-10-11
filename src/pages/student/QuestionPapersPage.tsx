import React, { useEffect, useState } from 'react';
import { resourceService } from '../../services/resourceService';
import { subjectService } from '../../services/subjectService';
import { Resource, Subject } from '../../types';
import { ResourceCard } from '../../components/common/ResourceCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ResourceCardSkeleton } from '../../components/ui/LoadingSkeleton';
import { FileQuestion, Filter } from 'lucide-react';

export const QuestionPapersPage: React.FC = () => {
  const [papers, setPapers] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      resourceService.getResources({ category: 'Previous Question Papers' }),
      subjectService.getSubjects(),
    ])
      .then(([resList, subList]) => {
        setPapers(resList);
        setSubjects(subList);
      })
      .finally(() => setLoading(false));
  }, []);

  // Collect available examination years from actual uploaded papers
  const availableYears = Array.from(
    new Set(papers.map((p) => p.exam_year).filter(Boolean))
  ) as string[];

  const filteredPapers = papers.filter((p) => {
    if (selectedSubjectId !== 'all' && p.subject_id !== selectedSubjectId) return false;
    if (selectedYear !== 'all' && p.exam_year !== selectedYear) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileQuestion className="w-3.5 h-3.5" />
            Exam Archive
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Previous Question Papers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse university semester and mid-term examination papers organized by subject and year.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject_name}
              </option>
            ))}
          </select>

          {availableYears.length > 0 && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <ResourceCardSkeleton key={idx} />
            ))}
          </div>
        ) : filteredPapers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <ResourceCard key={paper.id} resource={paper} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileQuestion className="w-7 h-7" />}
            title="No Question Papers Found"
            message="No question papers uploaded yet for the selected criteria."
            actionLabel={selectedSubjectId !== 'all' || selectedYear !== 'all' ? 'Reset Filters' : undefined}
            onAction={() => {
              setSelectedSubjectId('all');
              setSelectedYear('all');
            }}
          />
        )}
      </div>
    </div>
  );
};
