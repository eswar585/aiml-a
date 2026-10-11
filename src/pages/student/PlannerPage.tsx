import React from 'react';
import { StudyPlanner } from '../../components/common/StudyPlanner';
import { CalendarCheck, Info } from 'lucide-react';

export const PlannerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <CalendarCheck className="w-3.5 h-3.5" />
          Academic Productivity
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Study Planner & Exam Checklist
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Set up personal study goals, revision tasks, and lab completion deadlines for the semester.
        </p>
      </div>

      <div className="flex items-center gap-2 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 shrink-0 text-indigo-500" />
        <span>
          This study checklist is your private personal tool. It does not alter official class records or syllabus entries.
        </span>
      </div>

      <StudyPlanner />
    </div>
  );
};
