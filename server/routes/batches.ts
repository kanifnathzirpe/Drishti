import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';
import { getCurrentUser } from './auth.js';
import { BatchRecord } from '../types.js';

export const batchesRouter = Router();

// GET /api/batches
batchesRouter.get('/', (_req: Request, res: Response) => {
  const batches = db.getBatches();
  const docs = db.getDocuments();

  // Recalculate dynamic batch counts
  const enriched = batches.map((b) => {
    const bDocs = docs.filter((d) => d.batchId === b.id);
    const approved = bDocs.filter((d) => d.workflowStatus === 'APPROVED' || d.processingStatus === 'SYNCED').length;
    const review = bDocs.filter((d) => d.processingStatus === 'REVIEW_REQUIRED' || d.workflowStatus === 'IN_REVIEW').length;
    const failed = bDocs.filter((d) => d.processingStatus === 'FAILED').length;
    const processed = bDocs.filter((d) => d.processingStatus !== 'UPLOADED' && d.processingStatus !== 'QUEUED').length;

    return {
      ...b,
      documentCount: bDocs.length,
      processedCount: processed,
      approvedCount: approved,
      reviewCount: review,
      failedCount: failed,
      status: bDocs.length > 0 && approved === bDocs.length ? 'COMPLETED' : 'PROCESSING',
    };
  });

  return res.json({ success: true, batches: enriched });
});

// POST /api/batches
batchesRouter.post('/', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const { name, state = 'Maharashtra', district = 'Pune', tehsil = 'Haveli', village = 'Wagholi' } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Batch name is required.' });
  }

  const batchId = `BATCH-${Date.now().toString().slice(-4)}`;
  const batchNum = `${state.substring(0, 2).toUpperCase()}-${district.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  const newBatch: BatchRecord = {
    id: batchId,
    batchNumber: batchNum,
    name,
    state,
    district,
    tehsil,
    village,
    documentCount: 0,
    processedCount: 0,
    approvedCount: 0,
    reviewCount: 0,
    failedCount: 0,
    status: 'PENDING',
    createdBy: user.id,
    createdByName: user.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addBatch(newBatch);
  return res.status(201).json({ success: true, batch: newBatch });
});
