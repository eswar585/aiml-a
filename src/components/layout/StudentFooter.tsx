import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, GraduationCap, ShieldCheck, Heart } from 'lucide-react';

export const StudentFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Academic Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1.5px] shadow-sm">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-base bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  AIML Hub — Section A
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your Classroom. Your Resources. Your Success.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              A centralized academic study portal built specifically for B.Tech Artificial Intelligence and Machine Learning students (2nd Year, 1st Semester, Section A). Access syllabus, unit-wise notes, lecture presentations, previous question papers, and lab manuals in one organized place.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/60 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                B.Tech AIML • II Year • I Sem
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/60 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Verified Courseware
              </span>
            </div>
          </div>

          {/* Quick Subject Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Core Subjects
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/subjects/def" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  DEF
                </Link>
              </li>
              <li>
                <Link to="/subjects/data-structures" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Data Structures
                </Link>
              </li>
              <li>
                <Link to="/subjects/dms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  DMS
                </Link>
              </li>
              <li>
                <Link to="/subjects/sfcds" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  SFCDS
                </Link>
              </li>
              <li>
                <Link to="/subjects/dbms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  DBMS
                </Link>
              </li>
              <li>
                <Link to="/subjects/oops" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  OOPS
                </Link>
              </li>
              <li>
                <Link to="/subjects/ai" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Artificial Intelligence
                </Link>
              </li>
            </ul>
          </div>

          {/* Resource Types & Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Study Hub
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/announcements" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Class Announcements
                </Link>
              </li>
              <li>
                <Link to="/papers" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Previous Question Papers
                </Link>
              </li>
              <li>
                <Link to="/bookmarks" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Bookmarked Resources
                </Link>
              </li>
              <li>
                <Link to="/planner" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Exam Study Planner
                </Link>
              </li>
              <li>
                <Link to="/subjects" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  All 7 Subjects Directory
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} AIML Hub — Section A. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted for B.Tech AIML Section A</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
