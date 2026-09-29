import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, ValidationRule, AuditLog } from '../types';
import { StatCard } from '../components/common/StatCard';
import { Users, Sliders, ClipboardList, BrainCircuit, Download, Plus, Check, RefreshCw } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'RULES' | 'USERS' | 'AUDIT' | 'FEEDBACK'>('RULES');

  // New user form state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'OPERATOR' | 'VERIFIER' | 'SUPERVISOR' | 'OFFICIAL' | 'ADMIN'>('VERIFIER');
  const [newUserDistrict, setNewUserDistrict] = useState('Pune');

  const loadData = async () => {
    try {
      setLoading(true);
      const [uRes, rRes, aRes, fRes] = await Promise.all([
        api.getUsers(),
        api.getValidationRules(),
        api.getAuditLogs({ limit: '30' }),
        api.getFeedbackStats(),
      ]);
      if (uRes.success) setUsers(uRes.users);
      if (rRes.success) setRules(rRes.rules);
      if (aRes.success) setAuditLogs(aRes.logs);
      if (fRes.success) setFeedbackStats(fRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleRule = async (rule: ValidationRule) => {
    try {
      const res = await api.updateValidationRule(rule.id, { enabled: !rule.enabled });
      if (res.success) {
        setRules(rules.map((r) => (r.id === rule.id ? res.rule : r)));
      }
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    try {
      const res = await api.createUser({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        district: newUserDistrict,
        state: 'Maharashtra',
        tehsil: 'Haveli',
      });
      if (res.success) {
        setUsers([res.user, ...users]);
        setShowAddUser(false);
        setNewUserName('');
        setNewUserEmail('');
      }
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">System Administration &amp; Governance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Validation Rule Engine • RBAC Users • Audit Trail • AI Feedback Dataset
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Users"
          value={users.length}
          icon={Users}
          color="blue"
          subtitle="Across 5 system roles"
          onClick={() => setActiveTab('USERS')}
        />
        <StatCard
          title="Configured Rules"
          value={rules.length}
          icon={Sliders}
          color="indigo"
          subtitle="Mandatory &amp; Sanity"
          onClick={() => setActiveTab('RULES')}
        />
        <StatCard
          title="Audit Trail Logs"
          value={auditLogs.length}
          icon={ClipboardList}
          color="slate"
          subtitle="Immutable events"
          onClick={() => setActiveTab('AUDIT')}
        />
        <StatCard
          title="Reviewer Corrections"
          value={feedbackStats?.totalCorrections || 0}
          icon={BrainCircuit}
          color="emerald"
          subtitle="Labeled ML training data"
          onClick={() => setActiveTab('FEEDBACK')}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('RULES')}
          className={`py-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'RULES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Validation Rule Engine ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`py-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'USERS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Users &amp; Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`py-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'AUDIT'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('FEEDBACK')}
          className={`py-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'FEEDBACK'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          AI Learning Loop &amp; Retraining
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-5 shadow-xs">
        {/* 1. Validation Rules Tab */}
        {activeTab === 'RULES' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-slate-500">
                Configure state-specific and national validation rules. Changes take effect on subsequent validation runs.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {rules.map((rule) => (
                <div key={rule.id} className="py-3 flex items-center justify-between">
                  <div className="pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-900">{rule.id}</span>
                      <span className="font-semibold text-xs text-slate-900">{rule.name}</span>
                      <span className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                        rule.severity === 'ERROR' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rule.severity}
                      </span>
                      {rule.stateScope && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                          {rule.stateScope} Only
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{rule.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      rule.enabled
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Users Tab */}
        {activeTab === 'USERS' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs text-slate-500">Role-based access control and jurisdiction assignments</p>
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>

            {showAddUser && (
              <form onSubmit={handleCreateUser} className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-4 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="p-2 border rounded bg-white"
                  required
                />
                <input
                  type="email"
                  placeholder="Official Email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="p-2 border rounded bg-white"
                  required
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="p-2 border rounded bg-white"
                >
                  <option value="OPERATOR">OPERATOR</option>
                  <option value="VERIFIER">VERIFIER</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="OFFICIAL">OFFICIAL</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button
                  type="submit"
                  className="p-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700"
                >
                  Save User
                </button>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Jurisdiction</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{u.name}</td>
                      <td className="p-2.5 font-mono text-slate-600">{u.email}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600">{u.district}, {u.state}</td>
                      <td className="p-2.5 font-semibold text-emerald-700">{u.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Audit Logs Tab */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                  <tr>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">User</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">Entity</th>
                    <th className="p-2.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 font-sans">
                      <td className="p-2.5 text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">{log.userName}</td>
                      <td className="p-2.5 text-slate-600">{log.role}</td>
                      <td className="p-2.5 font-mono font-bold text-indigo-700">{log.action}</td>
                      <td className="p-2.5 text-slate-600">{log.entityId}</td>
                      <td className="p-2.5 text-slate-600 max-w-xs truncate">{log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Feedback Learning Loop Tab */}
        {activeTab === 'FEEDBACK' && (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <h4 className="font-bold">ML Learning Loop Dataset Export</h4>
                <p className="text-[11px] mt-0.5">
                  Every correction made by verifiers is automatically tagged with original vs corrected values for model fine-tuning.
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href="/api/feedback/export?format=json"
                  download="drishti_ai_training_dataset.json"
                  className="px-3 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </a>
                <a
                  href="/api/feedback/export?format=csv"
                  download="drishti_ai_training_dataset.csv"
                  className="px-3 py-1.5 rounded bg-white border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-2">Corrections by Field:</span>
                {feedbackStats?.correctionsByField?.map((f: any) => (
                  <div key={f.field} className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600 truncate pr-2">{f.field}</span>
                    <span className="font-bold text-slate-900">{f.count}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-2">Corrections by Language:</span>
                {feedbackStats?.correctionsByLanguage?.map((l: any) => (
                  <div key={l.language} className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">{l.language}</span>
                    <span className="font-bold text-slate-900">{l.count}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-2">Corrections by Document Type:</span>
                {feedbackStats?.correctionsByDocumentType?.map((t: any) => (
                  <div key={t.type} className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">{t.type}</span>
                    <span className="font-bold text-slate-900">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
