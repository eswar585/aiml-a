import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';

// Student Layout & Pages
import { StudentLayout } from './components/layout/StudentLayout';
import { HomePage } from './pages/student/HomePage';
import { SubjectsListPage } from './pages/student/SubjectsListPage';
import { SubjectDetailPage } from './pages/student/SubjectDetailPage';
import { AnnouncementsPage } from './pages/student/AnnouncementsPage';
import { QuestionPapersPage } from './pages/student/QuestionPapersPage';
import { BookmarksPage } from './pages/student/BookmarksPage';
import { PlannerPage } from './pages/student/PlannerPage';
import { ResourceDetailPage } from './pages/student/ResourceDetailPage';

// Admin Layout & Pages
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ManageSubjectsPage } from './pages/admin/ManageSubjectsPage';
import { ManageUnitsPage } from './pages/admin/ManageUnitsPage';
import { ManageResourcesPage } from './pages/admin/ManageResourcesPage';
import { ManageAnnouncementsPage } from './pages/admin/ManageAnnouncementsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Student Public Portal Routes */}
            <Route path="/" element={<StudentLayout />}>
              <Route index element={<HomePage />} />
              <Route path="subjects" element={<SubjectsListPage />} />
              <Route path="subjects/:slug" element={<SubjectDetailPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="papers" element={<QuestionPapersPage />} />
              <Route path="bookmarks" element={<BookmarksPage />} />
              <Route path="planner" element={<PlannerPage />} />
              <Route path="resources/:resourceId" element={<ResourceDetailPage />} />
            </Route>

            {/* Admin Authentication Route */}
            <Route path="/admin-login" element={<AdminLoginPage />} />

            {/* Protected Admin Console Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="subjects" element={<ManageSubjectsPage />} />
              <Route path="units" element={<ManageUnitsPage />} />
              <Route path="resources" element={<ManageResourcesPage />} />
              <Route path="announcements" element={<ManageAnnouncementsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
