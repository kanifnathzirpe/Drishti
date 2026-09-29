import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  UploadCloud,
  Layers,
  FileText,
  CheckSquare,
  Users,
  Sliders,
  MapPin,
  ClipboardList,
  Search,
  BrainCircuit,
  BarChart3,
  Network,
  AlertTriangle,
} from 'lucide-react';

interface AppSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const getNavItems = () => {
    switch (user?.role) {
      case 'OPERATOR':
        return [
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'upload', label: t('uploadDocuments'), icon: UploadCloud },
          { id: 'batches', label: t('batches'), icon: Layers },
          { id: 'documents', label: t('documents'), icon: FileText },
          { id: 'gis', label: t('gisMap'), icon: MapPin },
          { id: 'search', label: t('search'), icon: Search },
        ];

      case 'VERIFIER':
        return [
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'verification', label: t('verificationQueue'), icon: CheckSquare },
          { id: 'my-tasks', label: t('myTasks'), icon: FileText },
          { id: 'gis', label: t('gisMap'), icon: MapPin },
          { id: 'search', label: t('search'), icon: Search },
        ];

      case 'SUPERVISOR':
        return [
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'verification', label: t('verificationQueue'), icon: CheckSquare },
          { id: 'workload', label: t('teamWorkload'), icon: Users },
          { id: 'batches', label: t('batches'), icon: Layers },
          { id: 'reports', label: t('reports'), icon: BarChart3 },
          { id: 'search', label: t('search'), icon: Search },
        ];

      case 'OFFICIAL':
        return [
          { id: 'dashboard', label: t('nationalOverview'), icon: LayoutDashboard },
          { id: 'gis', label: t('gisMap'), icon: MapPin },
          { id: 'documents', label: t('allRecords'), icon: FileText },
          { id: 'reports', label: t('reports'), icon: BarChart3 },
          { id: 'audit', label: t('auditLogs'), icon: ClipboardList },
        ];

      case 'ADMIN':
        return [
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'users', label: t('userManagement'), icon: Users },
          { id: 'rules', label: t('rulesConfig'), icon: Sliders },
          { id: 'audit', label: t('auditLogs'), icon: ClipboardList },
          { id: 'feedback', label: t('learningLoop'), icon: BrainCircuit },
          { id: 'integrations', label: t('lrmsGateway'), icon: Network },
          { id: 'documents', label: t('allRecords'), icon: FileText },
        ];

      default:
        return [{ id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-61px)]">
      <div className="p-4 border-b border-slate-800">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation • {user?.role}
        </div>
        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {t('activeScope')}: {user?.district === 'All' ? t('allDistricts') : `${user?.district}`}
          </span>
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Safety Notice Footer */}
      <div className="p-3.5 m-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400 leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{t('statutoryNoticeTitle')}</span>
        </div>
        {t('statutoryNotice')}
      </div>
    </aside>
  );
};
