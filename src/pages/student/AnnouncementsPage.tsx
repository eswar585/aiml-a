import React, { useEffect, useState } from 'react';
import { announcementService } from '../../services/announcementService';
import { Announcement } from '../../types';
import { AnnouncementCard } from '../../components/common/AnnouncementCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Bell, Search } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    announcementService
      .getAnnouncements(true)
      .then((data) => setAnnouncements(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = announcements.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-3.5 h-3.5" />
            Official Bulletin
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Class Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with notes uploads, exam notifications, and deadlines for Section A.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading announcements...</div>
        ) : filtered.length > 0 ? (
          filtered.map((ann) => <AnnouncementCard key={ann.id} announcement={ann} />)
        ) : (
          <EmptyState
            icon={<Bell className="w-6 h-6" />}
            title="No Announcements"
            message={
              search ? 'No announcements match your search query.' : 'No announcements published yet.'
            }
          />
        )}
      </div>
    </div>
  );
};
