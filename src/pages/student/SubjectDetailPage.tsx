import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subjectService } from '../../services/subjectService';
import { resourceService } from '../../services/resourceService';
import { Subject, Unit, Resource, RESOURCE_CATEGORIES } from '../../types';
import { ResourceCard } from '../../components/common/ResourceCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ResourceCardSkeleton } from '../../components/ui/LoadingSkeleton';
import { getSubjectIcon } from '../../components/common/SubjectCard';
import {
  GraduationCap,
  ArrowLeft,
  Search,
  Filter,
  Layers,
  BookOpen,
  UserCheck,
  FileText,
} from 'lucide-react';

export const SubjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'size'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadSubjectData() {
      if (!slug) return;
      setLoading(true);
      try {
        const sub = await subjectService.getSubjectBySlug(slug);
        if (!sub) {
          if (isMounted) setLoading(false);
          return;
        }

        const [unitsList, resList] = await Promise.all([
          subjectService.getUnits(sub.id),
          resourceService.getResources({ subjectId: sub.id }),
        ]);

        if (isMounted) {
          setSubject(sub);
          setUnits(unitsList);
          setResources(resList);
        }
      } catch (err) {
        console.warn('Failed to load subject resources:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSubjectData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const filteredResources = useMemo(() => {
    let list = [...resources];

    // Filter by Category
    if (selectedCategory !== 'All') {
      list = list.filter((r) => r.category === selectedCategory);
    }

    // Filter by Unit
    if (selectedUnitId !== 'all') {
      list = list.filter((r) => r.unit_id === selectedUnitId);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'size') {
      list.sort((a, b) => b.file_size - a.file_size);
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [resources, selectedCategory, selectedUnitId, searchQuery, sortBy]);

  if (!loading && !subject) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Subject Not Found"
          message={`The requested subject slug "${slug}" does not exist in the curriculum.`}
          actionLabel="Back to All Subjects"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const Icon = slug ? getSubjectIcon(slug) : FileText;

  return (
    <div className="space-y-8 pb-16">
      {/* Subject Header Banner */}
      <section className="bg-gradient-to-b from-indigo-900/10 via-slate-50 to-slate-50 dark:from-indigo-950/40 dark:via-slate-950 dark:to-slate-950 pt-8 pb-8 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/subjects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Subjects
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-sm">
                <Icon className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {subject?.subject_name}
                  </h1>
                  {subject?.official_subject_code && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {subject.official_subject_code}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  {subject?.description ||
                    'Academic syllabus, lecture notes, lab manuals, and question papers.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                    B.Tech AIML • II Year • I Sem
                  </span>
                  {subject?.faculty_name && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Faculty: {subject.faculty_name}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-violet-500" />
                    {units.length} Units Available
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stat Pill */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
              <div className="text-center px-3 border-r border-slate-200 dark:border-slate-800">
                <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {resources.length}
                </div>
                <div className="text-[11px] font-medium text-slate-400">Materials</div>
              </div>
              <div className="text-center px-3">
                <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                  {units.length}
                </div>
                <div className="text-[11px] font-medium text-slate-400">Units</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Materials ({resources.length})
          </button>
          {RESOURCE_CATEGORIES.map((cat) => {
            const count = resources.filter((r) => r.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{cat}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          {/* In-subject Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search within ${subject?.subject_name}...`}
              className="w-full bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Unit Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Units</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unit_title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A–Z</option>
              <option value="size">File Size</option>
            </select>
          </div>
        </div>

        {/* Resource Cards Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ResourceCardSkeleton key={idx} />
              ))}
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResources.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                selectedCategory !== 'All'
                  ? `No ${selectedCategory} Available`
                  : 'No Resources Uploaded Yet'
              }
              message="No resources uploaded yet. Check back later."
              actionLabel={
                selectedCategory !== 'All' || selectedUnitId !== 'all' || searchQuery
                  ? 'Reset All Filters'
                  : undefined
              }
              onAction={() => {
                setSelectedCategory('All');
                setSelectedUnitId('all');
                setSearchQuery('');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
