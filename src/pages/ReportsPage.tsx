import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { BarChart3, Download, FileText, CheckCircle2, Network, BrainCircuit } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getReportsSummary();
        if (res.success) {
          setData(res.overview);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Official Reports &amp; Data Exports</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ministry of Rural Development • Department of Land Resources (DoLR) Statistical Center
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Documents"
          value={data?.totalDocs || 0}
          icon={FileText}
          color="blue"
          subtitle="Processed in system"
        />
        <StatCard
          title="Completion Rate"
          value={`${data?.completionRate || 0}%`}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Verified &amp; approved"
        />
        <StatCard
          title="Auto-Accepted"
          value={`${data?.autoAcceptanceRate || 0}%`}
          icon={CheckCircle2}
          color="indigo"
          subtitle="Zero-touch digitizations"
        />
        <StatCard
          title="Cadastral Parcels"
          value={data?.parcelsMapped || 0}
          icon={Network}
          color="amber"
          subtitle="Boundaries mapped"
        />
      </div>

      {/* Export Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Master Land Records CSV</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete register of all ingested documents, confidence scores, validation flags, owner details, and DILRMP sync keys.
            </p>
          </div>
          <a
            href="/api/reports/export-csv"
            download="drishti_digitization_master_report.csv"
            className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Master CSV</span>
          </a>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">ML Training Corrections Dataset</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Labeled corrections made by authorized verifiers formatted as fine-tuning feedback dataset (JSON or CSV).
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <a
              href="/api/feedback/export?format=json"
              download="drishti_ai_training_dataset.json"
              className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </a>
            <a
              href="/api/feedback/export?format=csv"
              download="drishti_ai_training_dataset.csv"
              className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold text-xs shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">DILRMP Integration Log</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Transmission records and acknowledgment tokens generated by the simulated National LRMS Gateway.
            </p>
          </div>
          <button
            onClick={() => alert('DILRMP Audit logs are available in the Audit Trail section.')}
            className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition"
          >
            <span>View Integration Logs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
