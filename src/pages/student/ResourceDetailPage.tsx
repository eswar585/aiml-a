import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import { Resource } from '../../types';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { getFileBadgeInfo, formatBytes, formatDate, getFileKind } from '../../lib/utils';
import {
  ArrowLeft,
  Download,
  Calendar,
  HardDrive,
  Eye,
  Tag,
  ExternalLink,
} from 'lucide-react';

export const ResourceDetailPage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resourceId) return;
    resourceService
      .getResourceById(resourceId)
      .then((data) => {
        if (data) {
          setResource(data);
          resourceService.recordEvent(data.id, 'view');
        }
      })
      .finally(() => setLoading(false));
  }, [resourceId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm text-slate-400">
        Loading resource details...
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Resource Not Found"
          message="The requested study material could not be located or may have been unassigned."
          actionLabel="Back to Subjects"
          onAction={() => (window.location.href = '/subjects')}
        />
      </div>
    );
  }

  const badgeInfo = getFileBadgeInfo(resource.file_name);
  const fileKind = getFileKind(resource.file_name, resource.mime_type);
  const fileUrl = resource.public_url || '';

  const handleDownload = () => {
    resourceService.recordEvent(resource.id, 'download');
    const link = document.createElement('a');
    link.href = fileUrl || '#';
    link.download = resource.file_name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <Link
        to={resource.subject ? `/subjects/${resource.subject.slug}` : '/subjects'}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {resource.subject?.subject_name || 'Subject'}
      </Link>

      {/* Main Resource Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {resource.category}
              </span>
              {resource.unit && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {resource.unit.unit_title}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {resource.title}
            </h1>

            {resource.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {resource.description}
              </p>
            )}
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            className="shrink-0"
          >
            Download File ({formatBytes(resource.file_size)})
          </Button>
        </div>

        {/* Metadata Details */}
        <div className="flex flex-wrap items-center gap-4 py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>Size: {formatBytes(resource.file_size)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Uploaded: {formatDate(resource.created_at)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{resource.view_count} views</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{resource.download_count} downloads</span>
          </div>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {resource.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Document Viewer */}
        <div className="w-full h-[550px] sm:h-[650px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/80 overflow-hidden flex items-center justify-center">
          {fileKind === 'pdf' ? (
            <iframe
              src={fileUrl ? `${fileUrl}#toolbar=0` : ''}
              title={resource.title}
              className="w-full h-full border-none"
            />
          ) : fileKind === 'image' ? (
            <img
              src={fileUrl}
              alt={resource.title}
              className="max-h-full max-w-full object-contain p-4"
            />
          ) : (
            <div className="p-8 text-center max-w-md space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ExternalLink className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Direct In-Browser Preview Not Supported For This Format
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Word (.docx) and presentation (.pptx) documents should be opened via native applications or online office suites.
              </p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleDownload}
              >
                Download Original File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
