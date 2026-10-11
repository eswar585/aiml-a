import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileUp,
  Bell,
  Settings,
  Shield,
  Sparkles,
} from 'lucide-react';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const menuItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Study Resources', path: '/admin/resources', icon: FileUp },
    { label: 'Subjects (7)', path: '/admin/subjects', icon: BookOpen },
    { label: 'Unit Management', path: '/admin/units', icon: Layers },
    { label: 'Announcements', path: '/admin/announcements', icon: Bell },
    { label: 'Admin Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white tracking-wide">
                AIML Admin
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Section A • II Year I Sem</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
            Portal Control
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-2">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-semibold">B.Tech AIML Hub</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Restricted administrative console for verified course managers only.
        </p>
      </div>
    </aside>
  );
};
