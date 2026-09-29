import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DocumentRecord } from '../types';
import { StatusBadge, ConfidenceBadge } from '../components/common/StatusBadge';
import { Search, Eye, Filter, RefreshCw } from 'lucide-react';

interface DocumentListPageProps {
  onOpenDocument: (id: string) => void;
}

export const DocumentListPage: React.FC<DocumentListPageProps> = ({ onOpenDocument }) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('All');

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.getDocuments({
        status: statusFilter,
        state: stateFilter,
        search,
      });
      if (res.success) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [statusFilter, stateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDocuments();
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Land Records Repository</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository of digitized 7/12 RoR, Mutation Registers, and Khasra-Khatauni records
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, Village, or File..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 w-56 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="REVIEW_REQUIRED">Review Required</option>
            <option value="SYNCED">DILRMP Synced</option>
            <option value="PROCESSING">Processing</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-700"
          >
            <option value="All">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
          </select>
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Document ID</th>
                <th className="px-4 py-3">Village / District</th>
                <th className="px-4 py-3">Document Type</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Quality</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">DILRMP</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-indigo-600" />
                    Loading repository records...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No documents found matching current criteria.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {doc.id}
                      {doc.isDemo && (
                        <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 border">
                          DEMO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{doc.village}</div>
                      <div className="text-[10px] text-slate-400">{doc.tehsil}, {doc.district}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {doc.documentType}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {doc.language}
                    </td>
                    <td className="px-4 py-3">
                      <ConfidenceBadge score={doc.overallConfidence} />
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {doc.qualityScore}/100
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={doc.workflowStatus || doc.processingStatus} />
                    </td>
                    <td className="px-4 py-3">
                      {doc.lrmsSyncStatus === 'SYNCED' ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Synced
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onOpenDocument(doc.id)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Inspect</span>
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
