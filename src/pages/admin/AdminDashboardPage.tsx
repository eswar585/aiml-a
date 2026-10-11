import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subjectService } from '../../services/subjectService';
import { resourceService } from '../../services/resourceService';
import { announcementService } from '../../services/announcementService';
import { mockStore } from '../../services/mockStore';
import { Subject, Resource, Announcement, AdminAuditLog } from '../../types';
import { formatBytes, formatDate } from '../../lib/utils';
import {
  BookOpen,
  Layers,
  FileCheck,
  FileX,
  HardDrive,
  Download,
  Bell,
  Activity,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const [subList, resList, annList] = await Promise.all([
          subjectService.getSubjects(),
          resourceService.getResources({ includeUnpublished: true }),
          announcementService.getAnnouncements(false),
        ]);

        if (isMounted) {
          setSubjects(subList);
          setResources(resList);
          setAnnouncements(annList);
          setAuditLogs(mockStore.getAuditLogs().slice(0, 5));
        }
      } catch (err) {
        console.warn('Dashboard stats error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPublished = resources.filter((r) => r.is_published && !r.archived_at).length;
  const totalUnpublished = resources.filter((r) => !r.is_published || r.archived_at).length;
  const totalStorageBytes = resources.reduce((acc, r) => acc + (r.file_size || 0), 0);
  const totalDownloads = resources.reduce((acc, r) => acc + (r.download_count || 0), 0);
  const totalUnits = subjects.reduce((acc, s) => acc + (s.units_count || 0), 0);

  const recentUploads = [...resources]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Administrative Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics and management controls for AIML Section A portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/resources"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Upload New Resource
          </Link>
        </div>
      </div>

      {/* Real Statistics Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Subjects */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : subjects.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Subjects</div>
          </div>
        </div>

        {/* Units */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : totalUnits}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Units</div>
          </div>
        </div>

        {/* Published Resources */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : totalPublished}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Published Files</div>
          </div>
        </div>

        {/* Unpublished / Draft */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FileX className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : totalUnpublished}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Unpublished / Draft</div>
          </div>
        </div>

        {/* Storage Volume */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white truncate">
              {loading ? '...' : formatBytes(totalStorageBytes)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Storage</div>
          </div>
        </div>

        {/* Total Downloads */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : totalDownloads}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Downloads</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Uploads & Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Uploads */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent Resource Uploads
            </h2>
            <Link
              to="/admin/resources"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Manage all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentUploads.length > 0 ? (
              recentUploads.map((res) => (
                <div key={res.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {res.title}
                    </p>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                      <span>{res.category}</span>
                      <span>•</span>
                      <span>{formatBytes(res.file_size)}</span>
                      <span>•</span>
                      <span>{formatDate(res.created_at)}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      res.is_published
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}
                  >
                    {res.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No uploads recorded yet.</p>
            )}
          </div>
        </div>

        {/* Administrative Audit Log */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Recent Admin Activity Log
              </h2>
            </div>
            <Link
              to="/admin/settings"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Full log
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="py-3 text-xs flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      [{log.action}]
                    </span>
                    <span className="ml-2 text-slate-700 dark:text-slate-300">
                      Target: {log.target_type} ({log.target_id || 'system'})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No audit activity logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
