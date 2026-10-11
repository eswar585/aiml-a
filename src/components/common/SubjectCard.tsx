import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  GitBranch,
  Calculator,
  Layers,
  Database,
  Code2,
  BrainCircuit,
  ArrowRight,
  FileText,
  BookmarkCheck,
} from 'lucide-react';
import { Subject } from '../../types';

interface SubjectCardProps {
  subject: Subject;
}

export const getSubjectIcon = (slug: string) => {
  switch (slug) {
    case 'def':
      return BookOpen;
    case 'data-structures':
      return GitBranch;
    case 'dms':
      return Calculator;
    case 'sfcds':
      return Layers;
    case 'dbms':
      return Database;
    case 'oops':
      return Code2;
    case 'ai':
      return BrainCircuit;
    default:
      return FileText;
  }
};

const getSubjectStyles = (slug: string) => {
  switch (slug) {
    case 'ai':
      return {
        gradient: 'from-violet-600/20 via-indigo-600/10 to-transparent',
        border: 'group-hover:border-violet-500/50',
        iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
        badge: 'text-violet-700 bg-violet-50 dark:bg-violet-950/50 dark:text-violet-300',
      };
    case 'dbms':
      return {
        gradient: 'from-blue-600/20 via-cyan-600/10 to-transparent',
        border: 'group-hover:border-blue-500/50',
        iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        badge: 'text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300',
      };
    case 'data-structures':
      return {
        gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent',
        border: 'group-hover:border-emerald-500/50',
        iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        badge: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300',
      };
    case 'oops':
      return {
        gradient: 'from-amber-600/20 via-orange-600/10 to-transparent',
        border: 'group-hover:border-amber-500/50',
        iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        badge: 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300',
      };
    case 'dms':
      return {
        gradient: 'from-cyan-600/20 via-sky-600/10 to-transparent',
        border: 'group-hover:border-cyan-500/50',
        iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
        badge: 'text-cyan-700 bg-cyan-50 dark:bg-cyan-950/50 dark:text-cyan-300',
      };
    case 'sfcds':
      return {
        gradient: 'from-fuchsia-600/20 via-pink-600/10 to-transparent',
        border: 'group-hover:border-fuchsia-500/50',
        iconBg: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
        badge: 'text-fuchsia-700 bg-fuchsia-50 dark:bg-fuchsia-950/50 dark:text-fuchsia-300',
      };
    case 'def':
    default:
      return {
        gradient: 'from-indigo-600/20 via-purple-600/10 to-transparent',
        border: 'group-hover:border-indigo-500/50',
        iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        badge: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-300',
      };
  }
};

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const Icon = getSubjectIcon(subject.slug);
  const styles = getSubjectStyles(subject.slug);

  return (
    <Link
      to={`/subjects/${subject.slug}`}
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${styles.border}`}
    >
      {/* Decorative gradient overlay */}
      <div
        className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br ${styles.gradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`}
      />

      <div>
        {/* Top bar: Icon and Resource counts */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-110 ${styles.iconBg}`}
          >
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border border-transparent ${styles.badge}`}
            >
              {subject.resources_count ?? 0} Materials
            </span>
          </div>
        </div>

        {/* Subject Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
          {subject.subject_name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {subject.description || 'Core academic materials, unit-wise notes, and question papers.'}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium flex items-center gap-1">
          <BookmarkCheck className="w-3.5 h-3.5 text-slate-400" />
          {subject.units_count ?? 5} Units
        </span>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
          Explore
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
};
