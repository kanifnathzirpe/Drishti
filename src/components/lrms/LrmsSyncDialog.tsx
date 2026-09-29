import React, { useState } from 'react';
import { api } from '../../services/api';
import { DocumentRecord } from '../../types';
import { Network, CheckCircle2, AlertTriangle, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface LrmsSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentRecord;
  onSyncComplete: () => void;
}

export const LrmsSyncDialog: React.FC<LrmsSyncDialogProps> = ({
  isOpen,
  onClose,
  document,
  onSyncComplete,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    externalRecordId?: string;
    acknowledgmentNumber?: string;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSync = async () => {
    try {
      setSyncing(true);
      setResult(null);
      const res = await api.syncToLrms(document.id);
      setResult({
        success: res.success,
        externalRecordId: res.externalRecordId,
        acknowledgmentNumber: res.acknowledgmentNumber,
        message: res.message,
      });
      if (res.success) {
        onSyncComplete();
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Synchronization gateway failed.',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">National DILRMP Sync Gateway</h2>
              <p className="text-[11px] text-slate-500">Digital India Land Records Modernization Programme</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-200 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Document ID:</span>
              <span className="font-mono font-bold text-slate-800">{document.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Village &amp; Tehsil:</span>
              <span className="font-semibold text-slate-800">{document.village}, {document.tehsil}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Document Type:</span>
              <span className="font-semibold text-slate-800">{document.documentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Verification Status:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {document.workflowStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target API Node:</span>
              <span className="font-mono text-indigo-700">https://dilrmp.nic.in/api/v2/records</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Sandbox / Demonstration Integration Gateway. Pushing this approved record commits the normalized cadastral dataset to the simulated national revenue node.
            </span>
          </div>

          {result && (
            <div
              className={`p-3 rounded-lg border text-xs ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>{result.success ? 'Synchronization Successful' : 'Sync Encountered Issue'}</span>
              </div>
              <p className="text-[11px]">{result.message}</p>
              {result.externalRecordId && (
                <div className="mt-2 pt-2 border-t border-emerald-200 font-mono text-[10px] space-y-1">
                  <div>External ID: <span className="font-bold">{result.externalRecordId}</span></div>
                  <div>Ack Token: <span className="font-bold">{result.acknowledgmentNumber}</span></div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Close
            </button>
            <button
              disabled={syncing || (result?.success ?? false)}
              onClick={handleSync}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Dispatching...' : result?.success ? 'Synced' : 'Push to DILRMP'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
