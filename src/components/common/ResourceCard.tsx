import React, { useState } from 'react';
import { Resource } from '../../types';
import { getFileBadgeInfo, formatBytes, formatDate, getFileKind } from '../../lib/utils';
import { resourceService } from '../../services/resourceService';
import {
  Download,
  Eye,
  Bookmark,
  BookmarkCheck,
  Calendar,
  HardDrive,
} from 'lucide-react';
import { ResourcePreviewModal } from './ResourcePreviewModal';

interface ResourceCardProps {
  resource: Resource;
  onBookmarkChanged?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onBookmarkChanged }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aiml_hub_bookmarks');
      const list = saved ? JSON.parse(saved) : [];
      return list.includes(resource.id);
    } catch {
      return false;
    }
  });

  const badgeInfo = getFileBadgeInfo(resource.file_name);
  const fileKind = getFileKind(resource.file_name, resource.mime_type);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved = localStorage.getItem('aiml_hub_bookmarks');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (isBookmarked) {
        list = list.filter((id) => id !== resource.id);
      } else {
        list.push(resource.id);
      }
      localStorage.setItem('aiml_hub_bookmarks', JSON.stringify(list));
      setIsBookmarked(!isBookmarked);
      if (onBookmarkChanged) onBookmarkChanged();
    } catch (err) {
      console.warn('Bookmark error:', err);
    }
  };

  const handleDownload = async (targetResource: Resource) => {
    resourceService.recordEvent(targetResource.id, 'download');
    const url = targetResource.public_url || '#';

    // Direct download trigger
    const link = document.createElement('a');
    link.href = url;
    link.download = targetResource.file_name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    resourceService.recordEvent(resource.id, 'view');
    // Save to recently viewed
    try {
      const saved = localStorage.getItem('aiml_hub_recently_viewed');
      let list: string[] = saved ? JSON.parse(saved) : [];
      list = [resource.id, ...list.filter((id) => id !== resource.id)].slice(0, 10);
      localStorage.setItem('aiml_hub_recently_viewed', JSON.stringify(list));
    } catch {}
    setIsPreviewOpen(true);
  };

  return (
    <>
      <div className="group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5 transition-all duration-200 hover:shadow-lg hover:border-indigo-400/50 dark:hover:border-indigo-500/30 flex flex-col justify-between">
        <div>
          {/* Header row: File Type Badge, Category, and Bookmark Button */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeInfo.bg}`}
              >
                {badgeInfo.label}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {resource.category}
              </span>
              {resource.unit && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {resource.unit.unit_title.split(':')[0]}
                </span>
              )}
            </div>

            <button
              onClick={toggleBookmark}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Resource Title */}
          <h4
            onClick={handlePreview}
            className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2 mb-1.5"
          >
            {resource.title}
          </h4>

          {/* Short Description */}
          {resource.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {resource.description}
            </p>
          )}

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {resource.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Metadata & Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5" />
              {formatBytes(resource.file_size)}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(resource.created_at)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {['pdf', 'image'].includes(fileKind) && (
              <button
                type="button"
                onClick={handlePreview}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleDownload(resource)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <ResourcePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        resource={resource}
        onDownload={handleDownload}
      />
    </>
  );
};
