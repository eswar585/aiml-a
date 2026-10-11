import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { StudentNavbar } from './StudentNavbar';
import { StudentFooter } from './StudentFooter';
import { GlobalSearchModal } from '../common/GlobalSearch';

export const StudentLayout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Student Navigation Bar */}
      <StudentNavbar onOpenSearch={() => setSearchOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Student Footer */}
      <StudentFooter />

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
