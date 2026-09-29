import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { GovHeader } from './components/layout/GovHeader';
import { AppSidebar } from './components/layout/AppSidebar';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { OperatorDashboard } from './pages/OperatorDashboard';
import { VerifierDashboard } from './pages/VerifierDashboard';
import { VerificationWorkspace } from './pages/VerificationWorkspace';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { OfficialDashboard } from './pages/OfficialDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DocumentListPage } from './pages/DocumentListPage';
import { BatchListPage } from './pages/BatchListPage';
import { GisMapPage } from './pages/GisMapPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { ReportsPage } from './pages/ReportsPage';
import { api } from './services/api';
import { NotificationItem } from './types';
import { UploadModal } from './components/upload/UploadModal';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // When role changes, reset active doc and go to dashboard
  useEffect(() => {
    setActiveDocId(null);
    setCurrentTab('dashboard');
  }, [user?.role]);

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    loadNotifications();
  };

  const handleOpenDocument = (id: string) => {
    setActiveDocId(id);
  };

  const handleBackFromWorkspace = () => {
    setActiveDocId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Initializing DRISHTI Revenue Platform...</p>
        </div>
      </div>
    );
  }

  // Active Screen Selector
  const renderMainContent = () => {
    // If currently viewing a document workspace
    if (activeDocId) {
      return (
        <VerificationWorkspace
          documentId={activeDocId}
          onBack={handleBackFromWorkspace}
        />
      );
    }

    if (currentTab === 'upload') {
      return (
        <OperatorDashboard
          onOpenDocument={handleOpenDocument}
          onNavigateTab={setCurrentTab}
        />
      );
    }

    if (currentTab === 'batches') {
      return <BatchListPage />;
    }

    if (currentTab === 'documents' || currentTab === 'search') {
      return <DocumentListPage onOpenDocument={handleOpenDocument} />;
    }

    if (currentTab === 'gis') {
      return <GisMapPage onOpenDocument={handleOpenDocument} />;
    }

    if (currentTab === 'audit') {
      return <AuditLogPage />;
    }

    if (currentTab === 'reports') {
      return <ReportsPage />;
    }

    if (currentTab === 'verification' || currentTab === 'my-tasks') {
      return <VerifierDashboard onOpenDocument={handleOpenDocument} />;
    }

    if (currentTab === 'workload') {
      return <SupervisorDashboard />;
    }

    if (currentTab === 'users' || currentTab === 'rules' || currentTab === 'feedback' || currentTab === 'integrations') {
      return <AdminDashboard />;
    }

    // Role-specific default Dashboard
    switch (user?.role) {
      case 'OPERATOR':
        return (
          <OperatorDashboard
            onOpenDocument={handleOpenDocument}
            onNavigateTab={setCurrentTab}
          />
        );
      case 'VERIFIER':
        return <VerifierDashboard onOpenDocument={handleOpenDocument} />;
      case 'SUPERVISOR':
        return <SupervisorDashboard />;
      case 'OFFICIAL':
        return <OfficialDashboard onOpenDocument={handleOpenDocument} />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return (
          <OperatorDashboard
            onOpenDocument={handleOpenDocument}
            onNavigateTab={setCurrentTab}
          />
        );
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Official Government Header */}
      <GovHeader
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadCount}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Role-Specific Sidebar */}
        <AppSidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setActiveDocId(null);
            if (tab === 'upload') {
              setIsUploadOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
        />

        {/* Dynamic Content Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderMainContent()}
          </div>
        </main>
      </div>

      {/* Upload Modal (accessible globally) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(docId) => {
          setActiveDocId(docId);
        }}
      />

      {/* In-App Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onNavigate={(link) => {
          setIsNotificationsOpen(false);
          if (link.startsWith('/verification/')) {
            const id = link.split('/')[2];
            setActiveDocId(id);
          }
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainAppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
