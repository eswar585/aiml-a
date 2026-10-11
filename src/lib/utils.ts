import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase() || '';
  }
  return '';
}

export type FileKind = 'pdf' | 'ppt' | 'word' | 'image' | 'zip' | 'text' | 'other';

export function getFileKind(filename: string, mimeType?: string): FileKind {
  const ext = getFileExtension(filename);
  if (ext === 'pdf' || mimeType?.includes('pdf')) return 'pdf';
  if (['ppt', 'pptx'].includes(ext) || mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return 'ppt';
  if (['doc', 'docx'].includes(ext) || mimeType?.includes('word') || mimeType?.includes('document')) return 'word';
  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext) || mimeType?.startsWith('image/')) return 'image';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mimeType?.includes('zip')) return 'zip';
  if (['txt', 'md', 'csv', 'json'].includes(ext) || mimeType?.startsWith('text/')) return 'text';
  return 'other';
}

export function getFileBadgeInfo(filename: string) {
  const kind = getFileKind(filename);
  switch (kind) {
    case 'pdf':
      return { label: 'PDF', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900' };
    case 'ppt':
      return { label: 'PPT', bg: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900' };
    case 'word':
      return { label: 'DOC', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900' };
    case 'image':
      return { label: 'IMG', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900' };
    case 'zip':
      return { label: 'ZIP', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900' };
    case 'text':
      return { label: 'TXT', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    default:
      return { label: 'FILE', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900' };
  }
}
