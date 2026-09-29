import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';
import { getCurrentUser } from './auth.js';
import { syncRecordToLrms } from '../services/lrmsService.js';
import { recordAuditEvent } from '../services/auditService.js';

export const integrationsRouter = Router();

// POST /api/integrations/lrms/sync
integrationsRouter.post('/lrms/sync', async (req: Request, res: Response) => {
  const { documentId } = req.body;
  const user = getCurrentUser();

  const doc = db.getDocuments().find((d) => d.id === documentId);
  const ext = db.getExtractedRecords().find((r) => r.documentId === documentId);

  if (!doc || !ext) {
    return res.status(404).json({ success: false, message: 'Document or extracted record not found.' });
  }

  // Update status to SYNCING
  db.updateDocument(documentId, { lrmsSyncStatus: 'SYNCING' });

  recordAuditEvent({
    user: user.id,
    userName: user.name,
    role: user.role,
    action: 'SYNC_STARTED',
    entityType: 'INTEGRATION',
    entityId: documentId,
    details: 'Initiated synchronization dispatch to National DILRMP gateway',
    ip: req.ip,
  });

  const syncResult = await syncRecordToLrms(doc, ext, user.id);

  recordAuditEvent({
    user: user.id,
    userName: user.name,
    role: user.role,
    action: syncResult.success ? 'SYNC_COMPLETED' : 'SYNC_FAILED',
    entityType: 'INTEGRATION',
    entityId: documentId,
    after: syncResult,
    details: syncResult.message,
    ip: req.ip,
  });

  return res.json({
    success: syncResult.success,
    status: syncResult.status,
    externalRecordId: syncResult.externalRecordId,
    acknowledgmentNumber: syncResult.acknowledgmentNumber,
    message: syncResult.message,
    syncedAt: syncResult.syncedAt,
  });
});

// GET /api/integrations/lrms/:id/status
integrationsRouter.get('/lrms/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const record = db.getLrmsSyncRecords().find((r) => r.documentId === id || r.id === id);

  if (!record) {
    return res.status(404).json({ success: false, message: 'Sync transaction not found.' });
  }

  return res.json({ success: true, record });
});

// GET /api/integrations/status (All integrations overview)
integrationsRouter.get('/overview', (_req: Request, res: Response) => {
  const syncRecords = db.getLrmsSyncRecords();
  const total = syncRecords.length;
  const successful = syncRecords.filter((r) => r.status === 'SYNCED').length;
  const failed = syncRecords.filter((r) => r.status === 'FAILED').length;

  return res.json({
    success: true,
    totalSyncs: total,
    successfulSyncs: successful,
    failedSyncs: failed,
    gateway: 'National DILRMP Hub (Sandbox Active)',
    gatewayStatus: 'OPERATIONAL',
    latencyMs: 142,
    recentSyncs: syncRecords.slice(0, 10),
  });
});
