import React from 'react';
import { Announcement } from '../../types';
import { formatDate } from '../../lib/utils';
import { Bell, Flame, Calendar } from 'lucide-react';

interface AnnouncementCardProps {
  announcement: Announcement;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 ${
        announcement.is_important
          ? 'border-indigo-300 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-purple-950/30 shadow-sm'
          : 'border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {announcement.is_important ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
              <Flame className="w-3 h-3 text-amber-300" />
              IMPORTANT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <Bell className="w-3 h-3 text-slate-400" />
              NOTICE
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(announcement.published_at)}</span>
        </div>
      </div>

      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5 leading-snug">
        {announcement.title}
      </h4>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
        {announcement.content}
      </p>
    </div>
  );
};
