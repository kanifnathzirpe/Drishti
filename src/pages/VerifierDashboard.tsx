import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge, ConfidenceBadge } from '../components/common/StatusBadge';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  RefreshCw,
  Search,
} from 'lucide-react';

interface VerifierDashboardProps {
  onOpenDocument: (id: string) => void;
}

export const VerifierDashboard: React.FC<VerifierDashboardProps> = ({ onOpenDocument }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'MY_TASKS' | 'HIGH_PRIORITY' | 'SLA_BREACHED'>('ALL');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [queueRes, metricsRes] = await Promise.all([
        api.getVerificationTasks(),
        api.getVerifierDashboard(user?.id),
      ]);
      if (queueRes.success) setTasks(queueRes.tasks);
      if (metricsRes.success) setMetrics(metricsRes.metrics);
    } catch (err) {
      console.error('Failed to load verifier queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredTasks = tasks.filter((t) => {
    if (filterTab === 'MY_TASKS' && t.assignedTo !== user?.id) return false;
    if (filterTab === 'HIGH_PRIORITY' && t.priority !== 'HIGH' && t.priority !== 'CRITICAL') return false;
    if (filterTab === 'SLA_BREACHED' && !t.slaBreached) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.village.toLowerCase().includes(q) ||
        t.fileName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Verification &amp; Adjudication Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Human-in-the-Loop Revenue Record Inspection • {user?.district} District
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Assigned To Me"
          value={metrics?.assignedToMe || 0}
          icon={CheckSquare}
          color="indigo"
          subtitle="Awaiting your verification"
          onClick={() => setFilterTab('MY_TASKS')}
        />
        <StatCard
          title="Total Pending Queue"
          value={metrics?.totalQueue || 0}
          icon={Clock}
          color="amber"
          subtitle="District review pool"
          onClick={() => setFilterTab('ALL')}
        />
        <StatCard
          title="High Priority Disputed"
          value={metrics?.highPriority || 0}
          icon={AlertTriangle}
          color="rose"
          subtitle="Low confidence / Errors"
          onClick={() => setFilterTab('HIGH_PRIORITY')}
        />
        <StatCard
          title="My Approvals"
          value={metrics?.myApproved || 0}
          icon={CheckCircle}
          color="emerald"
          subtitle="Verified & ready for sync"
        />
      </div>

      {/* Queue Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Tabs */}
        <div className="px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterTab === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Queue ({tasks.length})
            </button>
            <button
              onClick={() => setFilterTab('MY_TASKS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterTab === 'MY_TASKS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Assigned to Me
            </button>
            <button
              onClick={() => setFilterTab('HIGH_PRIORITY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterTab === 'HIGH_PRIORITY'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              High Priority Disputed
            </button>
            <button
              onClick={() => setFilterTab('SLA_BREACHED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterTab === 'SLA_BREACHED'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              SLA Breached
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search document or village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-300 bg-white w-64 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Document ID</th>
                <th className="px-4 py-3">Village / District</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Validation Issues</th>
                <th className="px-4 py-3">Priority / SLA</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    No documents matching selected filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                      {doc.id}
                      {doc.isDemo && (
                        <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 border">
                          DEMO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{doc.village}</div>
                      <div className="text-[10px] text-slate-500">{doc.tehsil}, {doc.district}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      {doc.documentType}
                    </td>
                    <td className="px-4 py-3.5">
                      <ConfidenceBadge score={doc.overallConfidence} />
                    </td>
                    <td className="px-4 py-3.5">
                      {doc.errorCount > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          {doc.errorCount} Error{doc.errorCount > 1 ? 's' : ''}
                        </span>
                      ) : doc.warningCount > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {doc.warningCount} Warning{doc.warningCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-medium">Clear</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            doc.priority === 'CRITICAL'
                              ? 'bg-purple-100 text-purple-800'
                              : doc.priority === 'HIGH'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {doc.priority}
                        </span>
                        {doc.slaBreached && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                            SLA Breached
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={doc.workflowStatus || doc.processingStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onOpenDocument(doc.id)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect &amp; Verify</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
