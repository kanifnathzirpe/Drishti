import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';

export const feedbackRouter = Router();

// GET /api/feedback
feedbackRouter.get('/', (_req: Request, res: Response) => {
  const records = db.getFeedbackRecords();

  // Metrics on corrections
  const byField: Record<string, number> = {};
  const byLanguage: Record<string, number> = {};
  const byType: Record<string, number> = {};

  records.forEach((r) => {
    byField[r.field] = (byField[r.field] || 0) + 1;
    byLanguage[r.language] = (byLanguage[r.language] || 0) + 1;
    byType[r.documentType] = (byType[r.documentType] || 0) + 1;
  });

  return res.json({
    success: true,
    totalCorrections: records.length,
    correctionsByField: Object.entries(byField).map(([field, count]) => ({ field, count })),
    correctionsByLanguage: Object.entries(byLanguage).map(([language, count]) => ({ language, count })),
    correctionsByDocumentType: Object.entries(byType).map(([type, count]) => ({ type, count })),
    records: records.slice(0, 50),
  });
});

// GET /api/feedback/export
feedbackRouter.get('/export', (req: Request, res: Response) => {
  const format = req.query.format || 'json';
  const records = db.getFeedbackRecords();

  if (format === 'csv') {
    const headers = 'ID,DocumentID,Field,OriginalValue,CorrectedValue,Language,DocumentType,Reviewer,CreatedAt\n';
    const rows = records
      .map(
        (r) =>
          `"${r.id}","${r.documentId}","${r.field}","${String(r.originalValue).replace(/"/g, '""')}","${String(r.correctedValue).replace(/"/g, '""')}","${r.language}","${r.documentType}","${r.reviewerName}","${r.createdAt}"`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="drishti_ai_training_dataset.csv"');
    return res.send(headers + rows);
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="drishti_ai_training_dataset.json"');
  return res.json({
    version: '1.0.0',
    datasetName: 'DRISHTI Multilingual OCR/HTR Reviewer Corrections Dataset',
    exportedAt: new Date().toISOString(),
    itemCount: records.length,
    samples: records,
  });
});
