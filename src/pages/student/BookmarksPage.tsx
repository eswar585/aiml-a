import React, { useEffect, useState, useCallback } from 'react';
import { resourceService } from '../../services/resourceService';
import { Resource } from '../../types';
import { ResourceCard } from '../../components/common/ResourceCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Bookmark, Trash2, Info } from 'lucide-react';

export const BookmarksPage: React.FC = () => {
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(() => {
    try {
      const saved = localStorage.getItem('aiml_hub_bookmarks');
      const ids: string[] = saved ? JSON.parse(saved) : [];
      if (ids.length === 0) {
        setBookmarkedResources([]);
        setLoading(false);
        return;
      }

      resourceService.getResources().then((all) => {
        const matches = all.filter((r) => ids.includes(r.id));
        setBookmarkedResources(matches);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const clearAllBookmarks = () => {
    if (window.confirm('Are you sure you want to clear all your saved bookmarks?')) {
      localStorage.removeItem('aiml_hub_bookmarks');
      setBookmarkedResources([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-3.5 h-3.5" />
            Quick Access
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Saved Bookmarks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Study materials you have pinned for quick revision and exam access.
          </p>
        </div>

        {bookmarkedResources.length > 0 && (
          <button
            onClick={clearAllBookmarks}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="flex items-center gap-2 p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300">
        <Info className="w-4 h-4 shrink-0" />
        <span>
          Bookmarks are stored locally in your browser. Pin any PDF, note, or presentation using the bookmark icon on its card.
        </span>
      </div>

      {/* Bookmarked Grid */}
      <div>
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading saved bookmarks...</div>
        ) : bookmarkedResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedResources.map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                onBookmarkChanged={loadBookmarks}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Bookmark className="w-7 h-7" />}
            title="No Bookmarks Saved Yet"
            message="Click the bookmark icon on any note, presentation, or syllabus card to save it here for fast revision."
            actionLabel="Explore Subjects"
            onAction={() => (window.location.href = '/subjects')}
          />
        )}
      </div>
    </div>
  );
};
