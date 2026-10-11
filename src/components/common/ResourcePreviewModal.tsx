import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Resource } from '../../types';
import { getFileKind, getFileBadgeInfo, formatBytes, formatDate } from '../../lib/utils';
import { Download, ExternalLink, Calendar, HardDrive, Tag } from 'lucide-react';

export interface ResourcePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  onDownload: (res: Resource) => void;
}

export const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
  isOpen,
  onClose,
  resource,
  onDownload,
}) => {
  if (!resource) return null;

  const fileKind = getFileKind(resource.file_name, resource.mime_type);
  const badgeInfo = getFileBadgeInfo(resource.file_name);
  const fileUrl = resource.public_url || '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeInfo.bg}`}>
            {badgeInfo.label}
          </span>
          <span className="truncate max-w-md">{resource.title}</span>
        </div>
      }
      description={resource.subject?.subject_name || resource.category}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* File Metadata Overview */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>Size: {formatBytes(resource.file_size)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Uploaded: {formatDate(resource.created_at)}</span>
          </div>
          {resource.unit && (
            <>
              <span>•</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {resource.unit.unit_title}
              </span>
            </>
          )}
          {resource.exam_year && (
            <>
              <span>•</span>
              <span className="font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                Year: {resource.exam_year}
              </span>
            </>
          )}
        </div>

        {/* Description & Tags */}
        {resource.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {resource.description}
          </p>
        )}

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Tag className="w-3 h-3 text-slate-400 mr-1" />
            {resource.tags.map((t, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Embedded Viewer Canvas */}
        <div className="w-full h-[450px] sm:h-[550px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/80 overflow-hidden flex items-center justify-center">
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
              className="max-h-full max-w-full object-contain p-2"
            />
          ) : (
            <div className="p-8 text-center max-w-md space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ExternalLink className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                In-browser preview is available for PDF and image documents.
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Presentation slides (.ppt, .pptx) and Word documents (.doc, .docx) can be downloaded directly or opened using external Office viewers.
              </p>
              {fileUrl && (
                <a
                  href={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Try previewing in Google Docs Viewer
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => onDownload(resource)}
            >
              Download File ({formatBytes(resource.file_size)})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
