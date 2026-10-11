import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { subjectService } from '../../services/subjectService';
import { Subject } from '../../types';
import { SubjectCard } from '../../components/common/SubjectCard';
import { SubjectCardSkeleton } from '../../components/ui/LoadingSkeleton';
import { Sparkles, Search } from 'lucide-react';

export const SubjectsListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('search') || '';
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(queryParam);

  useEffect(() => {
    subjectService
      .getSubjects()
      .then((data) => setSubjects(data))
      .finally(() => setLoading(false));
  }, []);

  const filteredSubjects = subjects.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.subject_name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Curriculum Directory
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            All Core Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore resources across the seven active subjects for B.Tech AIML (II Year, I Semester).
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter subjects..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 7 }).map((_, idx) => <SubjectCardSkeleton key={idx} />)
        ) : filteredSubjects.length > 0 ? (
          filteredSubjects.map((sub) => <SubjectCard key={sub.id} subject={sub} />)
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            No subjects match &ldquo;{search}&rdquo;.
          </div>
        )}
      </div>
    </div>
  );
};
