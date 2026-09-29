import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';

export const reportsRouter = Router();

// GET /api/reports/summary
reportsRouter.get('/summary', (_req: Request, res: Response) => {
  const docs = db.getDocuments();
  const batches = db.getBatches();
  const parcels = db.getGisParcels();

  const totalDocs = docs.length;
  const approved = docs.filter((d) => d.workflowStatus === 'APPROVED' || d.processingStatus === 'SYNCED').length;
  const autoApproved = docs.filter((d) => d.workflowStatus === 'AUTO_ACCEPTED').length;
  const synced = docs.filter((d) => d.lrmsSyncStatus === 'SYNCED').length;
  const failed = docs.filter((d) => d.processingStatus === 'FAILED').length;
  const inReview = docs.filter((d) => d.workflowStatus === 'IN_REVIEW' || d.processingStatus === 'REVIEW_REQUIRED').length;

  return res.json({
    success: true,
    overview: {
      totalDocs,
      totalBatches: batches.length,
      parcelsMapped: parcels.length,
      approved,
      autoApproved,
      synced,
      failed,
      inReview,
      autoAcceptanceRate: totalDocs > 0 ? +((autoApproved / totalDocs) * 100).toFixed(1) : 0,
      completionRate: totalDocs > 0 ? +((approved / totalDocs) * 100).toFixed(1) : 0,
    },
  });
});

// GET /api/reports/export-csv
reportsRouter.get('/export-csv', (_req: Request, res: Response) => {
  const docs = db.getDocuments();

  const headers = 'DocumentID,FileName,State,District,Tehsil,Village,DocumentType,Language,Confidence,Quality,Status,Workflow,SyncedLRMS,CreatedAt\n';
  const rows = docs
    .map(
      (d) =>
        `"${d.id}","${d.fileName}","${d.state}","${d.district}","${d.tehsil}","${d.village}","${d.documentType}","${d.language}",${d.overallConfidence},${d.qualityScore},"${d.processingStatus}","${d.workflowStatus}","${d.lrmsSyncStatus}","${d.createdAt}"`
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="drishti_digitization_master_report.csv"');
  return res.send(headers + rows);
});
