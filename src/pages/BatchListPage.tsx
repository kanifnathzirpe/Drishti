import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BatchRecord } from '../types';
import { Layers, Plus, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';

export const BatchListPage: React.FC = () => {
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [name, setName] = useState('');
  const [village, setVillage] = useState('Wagholi');
  const [tehsil, setTehsil] = useState('Haveli');
  const [district, setDistrict] = useState('Pune');
  const [state, setState] = useState('Maharashtra');

  const loadBatches = async () => {
    try {
      setLoading(true);
      const res = await api.getBatches();
      if (res.success) {
        setBatches(res.batches);
      }
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await api.createBatch({
        name,
        state,
        district,
        tehsil,
        village,
      });
      if (res.success) {
        setBatches([res.batch, ...batches]);
        setShowNewBatchModal(false);
        setName('');
      }
    } catch (err) {
      console.error('Failed to create batch:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Digitization Batches</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Group land record ingestion campaigns by revenue village and survey drives
          </p>
        </div>
        <button
          onClick={() => setShowNewBatchModal(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Digitization Batch</span>
        </button>
      </div>

      {/* New Batch Modal */}
      {showNewBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border max-w-md w-full p-5 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Create Digitization Campaign Batch</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Wagholi 7/12 RoR Legacy Scan Drive"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded bg-white text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full p-2 border rounded bg-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tehsil</label>
                  <input
                    type="text"
                    value={tehsil}
                    onChange={(e) => setTehsil(e.target.value)}
                    className="w-full p-2 border rounded bg-white text-xs"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewBatchModal(false)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {batches.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {b.batchNumber}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1.5">{b.name}</h3>
                <p className="text-xs text-slate-500">
                  {b.village}, {b.tehsil}, {b.district}, {b.state}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {b.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="font-bold text-slate-800">
                  {b.approvedCount} / {b.documentCount} Approved
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((b.approvedCount / (b.documentCount || 1)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded">
                <span className="text-slate-400 block text-[10px]">Total</span>
                <span className="font-bold text-slate-900">{b.documentCount}</span>
              </div>
              <div className="bg-emerald-50 p-2 rounded text-emerald-800">
                <span className="text-emerald-600 block text-[10px]">Approved</span>
                <span className="font-bold">{b.approvedCount}</span>
              </div>
              <div className="bg-amber-50 p-2 rounded text-amber-800">
                <span className="text-amber-600 block text-[10px]">Review</span>
                <span className="font-bold">{b.reviewCount}</span>
              </div>
              <div className="bg-rose-50 p-2 rounded text-rose-800">
                <span className="text-rose-600 block text-[10px]">Failed</span>
                <span className="font-bold">{b.failedCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
