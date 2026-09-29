import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { Bell, Globe, UserCheck, ShieldCheck, ChevronDown, Check } from 'lucide-react';

interface GovHeaderProps {
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
}

export const GovHeader: React.FC<GovHeaderProps> = ({ onOpenNotifications, unreadNotificationsCount }) => {
  const { user, switchRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'OPERATOR', label: 'Operator', desc: 'Document Ingestion & Metadata' },
    { role: 'VERIFIER', label: 'Verifier', desc: 'Human-in-the-Loop Verification' },
    { role: 'SUPERVISOR', label: 'Supervisor', desc: 'Workload & SLA Management' },
    { role: 'OFFICIAL', label: 'State / Central Official', desc: 'Analytics & GIS Map' },
    { role: 'ADMIN', label: 'System Admin', desc: 'Users, Rules & Audit Logs' },
  ];

  const handleSelectRole = (r: UserRole) => {
    switchRole(r);
    setShowRoleMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Topmost National Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="font-semibold tracking-wide text-amber-400">{t('govBar')}</span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300">{t('department')}</span>
        </div>
        <div className="flex items-center space-x-3">
          {/* Multilingual Selector: English, Hindi, Marathi */}
          <div className="flex items-center bg-slate-800 rounded-md p-0.5 border border-slate-700">
            <Globe className="w-3.5 h-3.5 ml-1.5 mr-1 text-slate-400 shrink-0" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                language === 'en'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                language === 'hi'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('mr')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                language === 'mr'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              मराठी
            </button>
          </div>
          <span className="text-slate-400 hidden sm:inline">NIC Cloud Portal</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-900 flex items-center justify-center text-white font-serif font-black text-xl shadow-xs">
            दृ
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                {t('systemTitle')}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                PS-26018
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5 hidden sm:block">
              {t('systemSubtitle')}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 transition text-xs font-medium text-slate-700 shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <div className="text-left">
                <span className="text-[10px] text-slate-500 block leading-none">{t('activeRole')}</span>
                <span className="font-bold text-slate-900">{user?.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-500">
                  Switch Active Role (Demo Mode)
                </div>
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => handleSelectRole(r.role)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      user?.role === r.role ? 'bg-indigo-50/60 font-semibold text-indigo-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{r.label}</div>
                      <div className="text-[11px] text-slate-500">{r.desc}</div>
                    </div>
                    {user?.role === r.role && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Badge */}
          <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
              {user?.name.charAt(0)}
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-slate-900 leading-tight">{user?.name}</div>
              <div className="text-[10px] text-slate-500">{user?.district}, {user?.state}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
