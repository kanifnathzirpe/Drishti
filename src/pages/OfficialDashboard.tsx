import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { GisMap } from '../components/gis/GisMap';
import {
  FileText,
  Sparkles,
  Network,
  MapPin,
  CheckCircle,
  TrendingUp,
  Download,
} from 'lucide-react';

interface OfficialDashboardProps {
  onOpenDocument?: (id: string) => void;
}

export const OfficialDashboard: React.FC<OfficialDashboardProps> = ({ onOpenDocument }) => {
  const [data, setData] = useState<any>(null);
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [dashRes, gisRes] = await Promise.all([
          api.getOfficialDashboard(),
          api.getParcels(),
        ]);
        if (dashRes.success) setData(dashRes);
        if (gisRes.success) setParcels(gisRes.parcels);
      } catch (err) {
        console.error('Failed to load official dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExport = () => {
    window.location.href = '/api/reports/export-csv';
  };

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-900">National Land Records Intelligence Portal</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ministry of Rural Development • Department of Land Resources (DoLR) • DILRMP
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Master CSV Report</span>
        </button>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Documents"
          value={kpis.totalDocuments || 0}
          icon={FileText}
          color="blue"
          subtitle="Ingested in repository"
        />
        <StatCard
          title="Digitized Completion"
          value={`${kpis.digitizationCompletionRate || 0}%`}
          icon={CheckCircle}
          color="emerald"
          subtitle="Verified by officers"
        />
        <StatCard
          title="Auto-Acceptance Rate"
          value={`${kpis.autoAcceptanceRate || 0}%`}
          icon={Sparkles}
          color="indigo"
          subtitle="Score >= 90% & Zero errors"
        />
        <StatCard
          title="DILRMP Sync Rate"
          value={`${kpis.dilrmpSyncRate || 0}%`}
          icon={Network}
          color="emerald"
          subtitle="National repository parity"
        />
        <StatCard
          title="Cadastral Parcels"
          value={kpis.totalParcelsMapped || 0}
          icon={MapPin}
          color="amber"
          subtitle="Mapped in GIS layer"
        />
        <StatCard
          title="Duplicates Flagged"
          value={kpis.duplicatesDetected || 0}
          icon={TrendingUp}
          color="rose"
          subtitle="Overlap protection"
        />
      </div>

      {/* State Progress Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-1">State &amp; Union Territory Progress</h3>
        <p className="text-xs text-slate-500 mb-4">Digitization &amp; National Gateway Sync Rates</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">State</th>
                <th className="px-4 py-2.5">Total Records</th>
                <th className="px-4 py-2.5">Verified &amp; Approved</th>
                <th className="px-4 py-2.5">DILRMP Synced</th>
                <th className="px-4 py-2.5">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.stateBreakdown?.map((s: any) => (
                <tr key={s.state} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{s.state}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{s.total}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{s.approved}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-700">{s.synced}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${s.completionRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800">{s.completionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrated GIS Map View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">National Cadastral GIS Visualization</h3>
            <p className="text-xs text-slate-500">Live parcel polygon coverage and boundary alignment</p>
          </div>
        </div>
        <GisMap parcels={parcels} onOpenDocument={onOpenDocument} />
      </div>
    </div>
  );
};
