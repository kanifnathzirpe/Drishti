import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge, ConfidenceBadge } from '../components/common/StatusBadge';
import { UploadModal } from '../components/upload/UploadModal';
import { DocumentRecord, BatchRecord } from '../types';
import {
  UploadCloud,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  RefreshCw,
  Play,
} from 'lucide-react';

interface OperatorDashboardProps {
  onOpenDocument: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  onOpenDocument,
  onNavigateTab,
}) => {
  const [data, setData] = useState<{
    metrics: any;
    languageDistribution: any[];
    documentTypeDistribution: any[];
    recentBatches: BatchRecord[];
    recentDocuments: DocumentRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getOperatorDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load operator dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleProcessDoc = async (id: string) => {
    try {
      setProcessingId(id);
      await api.processDocument(id);
      await loadDashboard();
      onOpenDocument(id);
    } catch (err) {
      console.error('Processing error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUploadSuccess = async (docId: string, autoProcess: boolean) => {
    if (autoProcess) {
      await handleProcessDoc(docId);
    } else {
      await loadDashboard();
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-slate-500 flex items-center justify-center space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading Operator Revenue Dashboard...</span>
      </div>
    );
  }

  const m = data?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Operator Digitization Workstation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingestion &amp; AI Multilingual Transcription • Department of Land Resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('batches')}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>View Batches</span>
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Land Record</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Ingested"
          value={m.totalUploaded || 0}
          icon={FileText}
          color="blue"
          subtitle="Physical records scanned"
        />
        <StatCard
          title="Processing"
          value={m.processing || 0}
          icon={Clock}
          color="amber"
          subtitle="In OCR/HTR queue"
        />
        <StatCard
          title="Review Queue"
          value={m.reviewRequired || 0}
          icon={AlertTriangle}
          color="rose"
          subtitle="Human review required"
          onClick={() => onNavigateTab('verification')}
        />
        <StatCard
          title="Approved"
          value={m.approved || 0}
          icon={CheckCircle}
          color="emerald"
          subtitle="Verified by officers"
        />
        <StatCard
          title="Auto-Accepted"
          value={m.autoAccepted || 0}
          icon={Sparkles}
          color="indigo"
          subtitle="Confidence >= 90%"
        />
        <StatCard
          title="DILRMP Synced"
          value={m.synced || 0}
          icon={Layers}
          color="emerald"
          subtitle="Pushed to national hub"
        />
      </div>

      {/* Two Column Layout: Recent Documents & Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Document Ingestions</h3>
              <p className="text-[11px] text-slate-500">Live feed from local land record offices</p>
            </div>
            <button
              onClick={() => onNavigateTab('documents')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Document ID</th>
                  <th className="px-4 py-2.5">Village / Tehsil</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Confidence</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentDocuments?.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {doc.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{doc.village}</div>
                      <div className="text-[10px] text-slate-400">{doc.tehsil}, {doc.district}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {doc.documentType}
                    </td>
                    <td className="px-4 py-3">
                      {doc.overallConfidence > 0 ? (
                        <ConfidenceBadge score={doc.overallConfidence} />
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={doc.processingStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {doc.processingStatus === 'UPLOADED' ? (
                        <button
                          disabled={processingId === doc.id}
                          onClick={() => handleProcessDoc(doc.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition disabled:opacity-50"
                        >
                          <Play className="w-3 h-3" />
                          <span>{processingId === doc.id ? 'Processing...' : 'Run Gemini AI'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenDocument(doc.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Workspace</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Batches & Distributions (1 col) */}
        <div className="space-y-6">
          {/* Recent Batches */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Active Digitization Batches</h3>
              <button
                onClick={() => onNavigateTab('batches')}
                className="text-xs text-indigo-600 font-semibold"
              >
                All Batches
              </button>
            </div>
            <div className="space-y-3">
              {data?.recentBatches?.map((b) => (
                <div key={b.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span className="truncate pr-2">{b.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {b.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mb-2">
                    {b.village}, {b.district} • {b.documentCount} Documents
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((b.approvedCount / (b.documentCount || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Approved: {b.approvedCount}</span>
                    <span>Review: {b.reviewCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multilingual Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Multilingual OCR Ingestion</h3>
            <div className="space-y-2">
              {data?.languageDistribution?.map((l) => (
                <div key={l.language} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{l.language}</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {l.count} records
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};
