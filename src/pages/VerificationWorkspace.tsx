import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DocumentViewer } from '../components/verification/DocumentViewer';
import { FieldEditor } from '../components/verification/FieldEditor';
import { ValidationPanel } from '../components/verification/ValidationPanel';
import { LrmsSyncDialog } from '../components/lrms/LrmsSyncDialog';
import { StatusBadge, ConfidenceBadge } from '../components/common/StatusBadge';
import { DocumentRecord, ExtractedRecord, ValidationResult } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Network,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface VerificationWorkspaceProps {
  documentId: string;
  onBack: () => void;
}

export const VerificationWorkspace: React.FC<VerificationWorkspaceProps> = ({
  documentId,
  onBack,
}) => {
  const { language, t } = useLanguage();
  const [doc, setDoc] = useState<DocumentRecord | null>(null);
  const [extractedRecord, setExtractedRecord] = useState<ExtractedRecord | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBoundingBox, setActiveBoundingBox] = useState<[number, number, number, number] | null>(null);
  const [activeFieldName, setActiveFieldName] = useState<string | undefined>();
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadDocumentData = async () => {
    try {
      setLoading(true);
      const res = await api.getDocumentById(documentId);
      if (res.success) {
        setDoc(res.document);
        setExtractedRecord(res.extractedRecord);
        setValidationResults(res.validationResults);
      }
    } catch (err) {
      console.error('Failed to load document details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentData();
  }, [documentId]);

  const handleSelectField = (box?: [number, number, number, number], fieldName?: string) => {
    setActiveBoundingBox(box || null);
    setActiveFieldName(fieldName);
  };

  const handleCorrectField = async (
    fieldPath: string,
    originalValue: any,
    newValue: any,
    notes?: string
  ) => {
    const res = await api.correctField(documentId, fieldPath, originalValue, newValue, notes);
    if (res.success) {
      setExtractedRecord(res.extractedRecord);
      setValidationResults(res.validationResults);
      if (doc) {
        setDoc({ ...doc, overallConfidence: res.overallConfidence });
      }
      showToast(`Field corrected and recorded in ML learning dataset.`);
    }
  };

  const handleRerunValidation = async () => {
    try {
      setIsValidating(true);
      const res = await api.validateDocument(documentId);
      if (res.success) {
        setValidationResults(res.validationResults);
        if (doc) {
          setDoc({ ...doc, overallConfidence: res.overallConfidence });
        }
        showToast('Validation re-evaluated across 15 business rules.');
      }
    } catch (err) {
      console.error('Validation rerun error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const res = await api.approveDocument(documentId);
      if (res.success) {
        setDoc(res.document);
        showToast('Land record approved by authorized verifier. Ready for DILRMP sync.');
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Enter official reason for record rejection:');
    if (!reason) return;

    try {
      setIsRejecting(true);
      const res = await api.rejectDocument(documentId, reason);
      if (res.success) {
        setDoc(res.document);
        showToast('Document marked as rejected.');
      }
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleEscalate = async () => {
    const reason = window.prompt('Enter reason for escalating to Supervisor:');
    if (!reason) return;

    try {
      setIsEscalating(true);
      const res = await api.escalateDocument(documentId, reason);
      if (res.success) {
        setDoc(res.document);
        showToast('Document escalated to Supervisor adjudication queue.');
      }
    } catch (err) {
      console.error('Escalation failed:', err);
    } finally {
      setIsEscalating(false);
    }
  };

  if (loading || !doc) {
    return (
      <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading Verification Workspace...</span>
      </div>
    );
  }

  const isApproved = doc.workflowStatus === 'APPROVED' || doc.processingStatus === 'APPROVED';
  const isSynced = doc.lrmsSyncStatus === 'SYNCED';

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Workspace Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Back to Queue"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-bold text-slate-900">{doc.id}</span>
              <StatusBadge status={doc.workflowStatus || doc.processingStatus} />
              <ConfidenceBadge score={doc.overallConfidence} />
            </div>
            <p className="text-xs text-slate-500">
              {doc.village}, {doc.tehsil}, {doc.district} • {doc.documentType} ({doc.language})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Re-run Validation */}
          <button
            disabled={isValidating}
            onClick={handleRerunValidation}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
            <span>{t('rerunValidation')}</span>
          </button>

          {/* Reject */}
          <button
            disabled={isRejecting || isApproved}
            onClick={handleReject}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition disabled:opacity-40"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{t('reject')}</span>
          </button>

          {/* Escalate */}
          <button
            disabled={isEscalating || isApproved}
            onClick={handleEscalate}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-semibold transition disabled:opacity-40"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
            <span>{t('escalate')}</span>
          </button>

          {/* Approve Record */}
          <button
            disabled={isApproving || isApproved}
            onClick={handleApprove}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isApproved ? (language === 'mr' ? 'मंजूर झाले ✓' : language === 'hi' ? 'स्वीकृत हुआ ✓' : 'Approved ✓') : t('approve')}</span>
          </button>

          {/* Sync to LRMS / DILRMP */}
          <button
            disabled={!isApproved}
            onClick={() => setIsSyncModalOpen(true)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold shadow-xs transition ${
              isSynced
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                : isApproved
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>{isSynced ? (language === 'mr' ? 'DILRMP सिंक पूर्ण ✓' : 'Synced to DILRMP ✓') : t('syncToLrms')}</span>
          </button>
        </div>
      </div>

      {/* Statutory Adjudication Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg text-[11px] text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>{t('statutoryNoticeTitle')}:</strong> {t('statutoryNotice')}
          </span>
        </div>
        <span className="text-[10px] text-amber-700 font-mono">Sec. 44 DoLR Standard</span>
      </div>

      {/* Two-Panel Flagship Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[780px]">
        {/* LEFT PANEL: Document Viewer (6 cols) */}
        <div className="lg:col-span-6 h-full">
          <DocumentViewer
            fileUrl={doc.fileUrl}
            fileName={doc.fileName}
            activeBoundingBox={activeBoundingBox}
            activeFieldName={activeFieldName}
            pageCount={doc.pageCount}
          />
        </div>

        {/* RIGHT PANEL: Extracted Fields & Validation (6 cols) */}
        <div className="lg:col-span-6 h-full flex flex-col space-y-4 overflow-y-auto pr-1">
          {/* Validation Engine Panel */}
          <ValidationPanel
            validationResults={validationResults}
            onRerunValidation={handleRerunValidation}
            isValidating={isValidating}
          />

          {/* Structured Fields Editor */}
          {extractedRecord && (
            <FieldEditor
              extractedRecord={extractedRecord}
              onCorrectField={handleCorrectField}
              onSelectField={handleSelectField}
              activeFieldName={activeFieldName}
            />
          )}
        </div>
      </div>

      {/* LRMS / DILRMP Sync Dialog */}
      <LrmsSyncDialog
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        document={doc}
        onSyncComplete={loadDocumentData}
      />
    </div>
  );
};
