import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { subjectService } from '../../services/subjectService';
import { resourceService } from '../../services/resourceService';
import { announcementService } from '../../services/announcementService';
import { Subject, Resource, Announcement } from '../../types';
import { SubjectCard } from '../../components/common/SubjectCard';
import { ResourceCard } from '../../components/common/ResourceCard';
import { AnnouncementCard } from '../../components/common/AnnouncementCard';
import { StudyPlanner } from '../../components/common/StudyPlanner';
import { SubjectCardSkeleton, ResourceCardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  Search,
  Sparkles,
  BookOpen,
  FileQuestion,
  FlaskConical,
  GraduationCap,
  Bell,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [subList, resList, annList] = await Promise.all([
          subjectService.getSubjects(),
          resourceService.getResources({ sortBy: 'newest' }),
          announcementService.getAnnouncements(true),
        ]);

        if (isMounted) {
          setSubjects(subList);
          setRecentResources(resList.slice(0, 6));
          setAnnouncements(annList.slice(0, 3));

          // Load recently viewed from localStorage
          try {
            const viewedIds: string[] = JSON.parse(
              localStorage.getItem('aiml_hub_recently_viewed') || '[]'
            );
            if (viewedIds.length > 0) {
              const viewedItems = resList.filter((r) => viewedIds.includes(r.id));
              setRecentlyViewed(viewedItems.slice(0, 4));
            }
          } catch {}
        }
      } catch (err) {
        console.warn('Failed to load dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/subjects?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900/10 via-slate-50 to-slate-50 dark:from-indigo-950/40 dark:via-slate-950 dark:to-slate-950 pt-10 pb-8 sm:pt-14 sm:pb-12 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            {/* Academic Information Badge */}
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-2xs">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>B.Tech AIML</span>
              <span>•</span>
              <span>II Year</span>
              <span>•</span>
              <span>I Semester</span>
              <span>•</span>
              <span className="font-bold text-indigo-900 dark:text-indigo-200">Section A</span>
              <span>•</span>
              <span>Total subjects: 7</span>
            </div>

            {/* Main Welcome Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                AIML Hub, Section A!
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Your notes, syllabus, and study resources — all in one place.
            </p>

            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="pt-2">
              <div className="relative flex items-center max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-lg shadow-indigo-500/5 border border-slate-200 dark:border-slate-800 p-1.5 transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all 7 subjects: notes, PPTs, syllabus, previous question papers..."
                  className="w-full bg-transparent px-3 py-2.5 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Access Categories */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="text-slate-400 font-medium mr-1">Quick Access:</span>
              <Link
                to="/subjects?category=Syllabus"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Semester Syllabus
              </Link>
              <Link
                to="/papers"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
              >
                <FileQuestion className="w-3.5 h-3.5 text-violet-500" />
                Previous Question Papers
              </Link>
              <Link
                to="/subjects?category=Lab%20Manuals"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
              >
                <FlaskConical className="w-3.5 h-3.5 text-emerald-500" />
                Lab Manuals & Practical
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Important Announcements Banner (if any) */}
        {announcements.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Class Announcements
                </h2>
              </div>
              <Link
                to="/announcements"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {announcements.map((ann) => (
                <AnnouncementCard key={ann.id} announcement={ann} />
              ))}
            </div>
          </section>
        )}

        {/* Seven Core Subjects Section */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Official Curriculum
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                Core Subjects
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Exactly seven active subjects configured for II Year I Semester.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {loading ? (
              Array.from({ length: 7 }).map((_, idx) => <SubjectCardSkeleton key={idx} />)
            ) : subjects.length > 0 ? (
              subjects.map((sub) => <SubjectCard key={sub.id} subject={sub} />)
            ) : (
              <p className="text-sm text-slate-400 col-span-full py-8 text-center">
                No subjects found.
              </p>
            )}
          </div>
        </section>

        {/* Recently Uploaded Resources */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Recently Uploaded Materials
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Latest notes, slides, and academic files added by faculty.
              </p>
            </div>
            <Link
              to="/subjects"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Browse all materials
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => <ResourceCardSkeleton key={idx} />)
            ) : recentResources.length > 0 ? (
              recentResources.map((res) => <ResourceCard key={res.id} resource={res} />)
            ) : (
              <div className="col-span-full text-center py-10 bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No resources uploaded yet. Check back later.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Recently Viewed Resources (if user browsed any in browser) */}
        {recentlyViewed.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Recently Viewed by You
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentlyViewed.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          </section>
        )}

        {/* Study Planner & Revision Checklist Widget */}
        <section className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <StudyPlanner />
        </section>
      </div>
    </div>
  );
};
