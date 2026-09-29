import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';
import { getCurrentUser } from './auth.js';
import { recordAuditEvent } from '../services/auditService.js';
import { runValidation } from '../services/validationService.js';
import { computeDocumentConfidence } from '../services/confidenceService.js';

export const verificationRouter = Router();

// GET /api/verification/tasks
verificationRouter.get('/tasks', (req: Request, res: Response) => {
  const { status = 'REVIEW_REQUIRED', priority, assignedTo } = req.query;

  let docs = db.getDocuments().filter((d) => {
    if (status === 'ALL') return true;
    if (status === 'REVIEW_REQUIRED') return d.processingStatus === 'REVIEW_REQUIRED' || d.workflowStatus === 'IN_REVIEW';
    if (status === 'APPROVED') return d.workflowStatus === 'APPROVED' || d.processingStatus === 'APPROVED';
    if (status === 'REJECTED') return d.workflowStatus === 'REJECTED' || d.processingStatus === 'REJECTED';
    return d.processingStatus === status;
  });

  if (priority) {
    docs = docs.filter((d) => d.priority === priority);
  }
  if (assignedTo) {
    docs = docs.filter((d) => d.assignedTo === assignedTo);
  }

  // Attach validation error counts
  const allValResults = db.getValidationResults();
  const tasks = docs.map((doc) => {
    const valResults = allValResults.filter((r) => r.documentId === doc.id);
    const errorCount = valResults.filter((r) => r.severity === 'ERROR' && r.status === 'FAIL').length;
    const warningCount = valResults.filter((r) => r.severity === 'WARNING' && r.status === 'FAIL').length;

    return {
      ...doc,
      errorCount,
      warningCount,
      validationSummary: valResults.slice(0, 3).map((r) => r.message),
    };
  });

  return res.json({ success: true, tasks, total: tasks.length });
});

// POST /api/verification/tasks/:id/correct (Edit field value with feedback tracking)
verificationRouter.post('/tasks/:id/correct', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = getCurrentUser();
  const { fieldPath, originalValue, newValue, notes } = req.body;

  const doc = db.getDocuments().find((d) => d.id === id);
  const ext = db.getExtractedRecords().find((r) => r.documentId === id);

  if (!doc || !ext) {
    return res.status(404).json({ success: false, message: 'Document or extraction record not found.' });
  }

  // Update field inside ExtractedRecord
  const parts = fieldPath.split('.');
  let target: any = ext;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!target[parts[i]]) target[parts[i]] = {};
    target = target[parts[i]];
  }

  const lastKey = parts[parts.length - 1];
  const previous = target[lastKey]?.value;

  target[lastKey] = {
    ...target[lastKey],
    value: newValue,
    isEdited: true,
    originalValue: previous !== undefined ? previous : originalValue,
    editedBy: user.name,
    editedAt: new Date().toISOString(),
    confidence: 100, // Reviewer confirmed value
  };

  db.setExtractedRecord(ext);

  // Store in feedback dataset for ML learning loop
  db.addFeedbackRecord({
    id: `FDB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    documentId: id,
    field: fieldPath,
    originalValue: previous || originalValue,
    correctedValue: newValue,
    language: doc.language,
    documentType: doc.documentType,
    reviewer: user.id,
    reviewerName: user.name,
    confidenceBefore: target[lastKey]?.confidence || 70,
    notes,
    createdAt: new Date().toISOString(),
  });

  // Re-run validation
  const validationResults = runValidation(doc, ext);
  db.setValidationResults(id, validationResults);

  const confidenceRouting = computeDocumentConfidence(doc.overallConfidence, doc.qualityScore, validationResults);

  db.updateDocument(id, {
    overallConfidence: confidenceRouting.overallConfidence,
  });

  recordAuditEvent({
    user: user.id,
    userName: user.name,
    role: user.role,
    action: 'FIELD_EDITED',
    entityType: 'DOCUMENT',
    entityId: id,
    before: { field: fieldPath, value: previous || originalValue },
    after: { field: fieldPath, value: newValue },
    ip: req.ip,
    details: `Verifier updated field '${fieldPath}': '${previous || originalValue}' -> '${newValue}'`,
  });

  return res.json({
    success: true,
    extractedRecord: ext,
    validationResults,
    overallConfidence: confidenceRouting.overallConfidence,
  });
});

// POST /api/verification/tasks/:id/approve
verificationRouter.post('/tasks/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = getCurrentUser();
  const doc = db.getDocuments().find((d) => d.id === id);

  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document not found.' });
  }

  const updated = db.updateDocument(id, {
    processingStatus: 'APPROVED',
    workflowStatus: 'APPROVED',
    approvedBy: user.id,
    approvedByName: user.name,
    approvedAt: new Date().toISOString(),
  });

  // Update corresponding GIS parcel status
  const parcel = db.getGisParcels().find((p) => p.documentId === id);
  if (parcel) {
    parcel.status = 'DIGITIZED';
    db.addGisParcel(parcel);
  }

  recordAuditEvent({
    user: user.id,
    userName: user.name,
    role: user.role,
    action: 'APPROVED',
    entityType: 'DOCUMENT',
    entityId: id,
    before: { workflowStatus: doc.workflowStatus },
    after: { workflowStatus: 'APPROVED' },
    ip: req.ip,
    details: `Authorized verifier ${user.name} approved land record. Ready for DILRMP sync.`,
  });

  return res.json({ success: true, document: updated });
});

// POST /api/verification/tasks/:id/reject
verificationRouter.post('/tasks/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = getCurrentUser();
  const { reason = 'Document illegible or disputed' } = req.body;

  const doc = db.getDocuments().find((d) => d.id === id);
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document not found.' });
  }

  const updated = db.updateDocument(id, {
    processingStatus: 'REJECTED',
    workflowStatus: 'REJECTED',
    rejectionReason: reason,
    reviewedBy: user.id,
    reviewedByName: user.name,
    reviewedAt: new Date().toISOString(),
  });

  recordAuditEvent({
    user: user.id,
    userName: user.name,
    role: user.role,
    action: 'REJECTED',
    entityType: 'DOCUMENT',
    entityId: id,
    before: { workflowStatus: doc.workflowStatus },
    after: { workflowStatus: 'REJECTED', reason },
    ip: req.ip,
    details: `Verifier rejected document: ${reason}`,
  });

  return res.json({ success: true, document: updated });
});

// POST /api/verification/tasks/:id/escalate
verificationRouter.post('/tasks/:id/escalate', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = getCurrentUser();
  const { reason = 'Disputed ownership boundary or unresolvable discrepancy' } = req.body;

  const doc = db.getDocuments().find((d) => d.id === id);
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document not found.' });
  }

  const updated = db.updateDocument(id, {
    workflowStatus: 'ESCALATED',
    escalationReason: reason,
    priority: 'CRITICAL',
  });

  db.addNotification({
    id: `NOTIF-${Date.now()}`,
    targetRole: 'SUPERVISOR',
    title: 'Disputed Record Escalation',
    message: `Record ${id} in ${doc.village} escalated by ${user.name}: ${reason}`,
    type: 'ERROR',
    read: false,
    link: `/verification/${id}`,
    createdAt: new Date().toISOString(),
  });

  recordAuditEvent({
    user: user.id,
    userName: user.name,
    role: user.role,
    action: 'ESCALATED',
    entityType: 'DOCUMENT',
    entityId: id,
    details: `Escalated to Supervisor: ${reason}`,
    ip: req.ip,
  });

  return res.json({ success: true, document: updated });
});

// POST /api/verification/tasks/:id/assign
verificationRouter.post('/tasks/:id/assign', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = getCurrentUser();
  const { verifierId, verifierName } = req.body;

  const updated = db.updateDocument(id, {
    assignedTo: verifierId,
    assignedToName: verifierName,
    assignedAt: new Date().toISOString(),
  });

  recordAuditEvent({
    user: user.id,
    userName: user.name,
    role: user.role,
    action: 'ASSIGNED',
    entityType: 'DOCUMENT',
    entityId: id,
    details: `Task assigned to ${verifierName} (${verifierId})`,
    ip: req.ip,
  });

  return res.json({ success: true, document: updated });
});
