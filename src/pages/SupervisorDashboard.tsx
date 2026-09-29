import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { Users, AlertTriangle, Clock, CheckCircle, RefreshCw } from 'lucide-react';

export const SupervisorDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getSupervisorDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load supervisor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-slate-500 flex items-center justify-center space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading Supervisor Workload Metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">District Workload &amp; SLA Command</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisory monitoring of human-in-the-loop throughput and adjudication SLAs
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="District Documents"
          value={data?.totalDocuments || 0}
          icon={CheckCircle}
          color="blue"
          subtitle="Total in jurisdiction"
        />
        <StatCard
          title="Pending Verification"
          value={data?.pendingVerification || 0}
          icon={Clock}
          color="amber"
          subtitle="Currently queued"
        />
        <StatCard
          title="SLA Breaches"
          value={data?.slaBreachedCount || 0}
          icon={AlertTriangle}
          color="rose"
          subtitle="Exceeded 48h resolution"
        />
        <StatCard
          title="Escalated Disputes"
          value={data?.escalatedCount || 0}
          icon={Users}
          color="indigo"
          subtitle="Requires officer signoff"
        />
      </div>

      {/* Grid: Verifier Utilization & District Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verifier Team Utilization */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Verifier Team Utilization &amp; Capacity</h3>
          <p className="text-xs text-slate-500 mb-4">Active load distribution across Tehsil officers</p>

          <div className="space-y-3">
            {data?.verifierWorkload?.map((v: any) => (
              <div key={v.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="font-bold text-slate-900">{v.name}</span>
                    <span className="text-slate-500 text-[10px] ml-2">({v.tehsil})</span>
                  </div>
                  <span className="font-semibold text-slate-700">{v.utilizationRate}% Capacity</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      v.utilizationRate > 80 ? 'bg-rose-500' : v.utilizationRate > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${v.utilizationRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>Assigned: {v.assignedTasks}</span>
                  <span>Approved: {v.completedTasks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* District & Tehsil Progress */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-1">District Digitization Progress</h3>
          <p className="text-xs text-slate-500 mb-4">Completion rates across revenue divisions</p>

          <div className="space-y-4">
            {data?.districtProgress?.map((dp: any) => (
              <div key={dp.district} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">{dp.district}</span>
                  <span className="text-indigo-600">{dp.completionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${dp.completionRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Approved: {dp.approved}</span>
                  <span>Pending: {dp.pending}</span>
                  <span>Total: {dp.total}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Error Hotspots */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2">Top Validation Rule Error Hotspots</h4>
            <div className="space-y-1.5">
              {data?.errorHotspots?.map((eh: any) => (
                <div key={eh.rule} className="flex justify-between text-xs py-1 px-2 rounded bg-rose-50/50 border border-rose-100">
                  <span className="text-rose-900 font-medium truncate pr-2">{eh.rule}</span>
                  <span className="font-bold text-rose-700 font-mono">{eh.count} flags</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
