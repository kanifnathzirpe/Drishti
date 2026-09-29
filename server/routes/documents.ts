import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';
import { getCurrentUser } from './auth.js';
import { extractLandRecordWithGemini } from '../services/geminiService.js';
import { runValidation } from '../services/validationService.js';
import { computeDocumentConfidence } from '../services/confidenceService.js';
import { checkDuplicate } from '../services/duplicateService.js';
import { recordAuditEvent } from '../services/auditService.js';
import { DocumentRecord, ExtractedRecord } from '../types.js';

export const documentsRouter = Router();

// GET /api/documents
documentsRouter.get('/', (req: Request, res: Response) => {
  const { status, batchId, state, district, village, search, priority, page = '1', limit = '50' } = req.query;

  let docs = db.getDocuments();

  if (status && status !== 'ALL') {
    docs = docs.filter((d) => d.processingStatus === status || d.workflowStatus === status);
  }
  if (batchId) {
    docs = docs.filter((d) => d.batchId === batchId);
  }
  if (state && state !== 'All') {
    docs = docs.filter((d) => d.state.toLowerCase() === String(state).toLowerCase());
  }
  if (district && district !== 'All') {
    docs = docs.filter((d) => d.district.toLowerCase() === String(district).toLowerCase());
  }
  if (village) {
    docs = docs.filter((d) => d.village.toLowerCase().includes(String(village).toLowerCase()));
  }
  if (priority) {
    docs = docs.filter((d) => d.priority === priority);
  }
  if (search) {
    const q = String(search).toLowerCase();
    docs = docs.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.village.toLowerCase().includes(q) ||
        d.district.toLowerCase().includes(q)
    );
  }

  const p = parseInt(String(page), 10) || 1;
  const l = parseInt(String(limit), 10) || 50;
  const total = docs.length;
  const paginated = docs.slice((p - 1) * l, p * l);

  res.json({
    success: true,
    total,
    page: p,
    limit: l,
    data: paginated,
  });
});

// GET /api/documents/:id
documentsRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = db.getDocuments().find((d) => d.id === id);

  if (!doc) {
    return res.status(404).json({ success: false, error: { code: 'DOC_NOT_FOUND', message: 'Document not found.' } });
  }

  const extracted = db.getExtractedRecords().find((r) => r.documentId === id);
  const validationResults = db.getValidationResults().filter((v) => v.documentId === id);
  const syncRecord = db.getLrmsSyncRecords().find((s) => s.documentId === id);

  return res.json({
    success: true,
    document: doc,
    extractedRecord: extracted || null,
    validationResults,
    syncRecord: syncRecord || null,
  });
});

// POST /api/documents
documentsRouter.post('/', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const {
    fileName,
    fileBase64,
    fileType = 'image/png',
    fileSize = 1024 * 500,
    batchId,
    state = 'Maharashtra',
    district = 'Pune',
    tehsil = 'Haveli',
    village = 'Wagholi',
    documentType = 'Record of Rights',
    language = 'Marathi',
    autoProcess = false,
  } = req.body;

  if (!fileName) {
    return res.status(400).json({ success: false, message: 'File name is required.' });
  }

  const docId = `DOC-${Date.now().toString().slice(-6)}`;
  const fileHash = `hash-${docId.toLowerCase()}-${Math.floor(Math.random() * 10000)}`;

  const newDoc: DocumentRecord = {
    id: docId,
    batchId,
    fileName,
    fileUrl: fileBase64 || `/samples/document_template.png`,
    fileType,
    fileSize,
    fileHash,
    pageCount: 1,
    state,
    district,
    tehsil,
    village,
    documentType,
    language,
    uploadStatus: 'SUCCESS',
    processingStatus: 'UPLOADED',
    qualityScore: 88,
    overallConfidence: 0,
    workflowStatus: 'PENDING',
    priority: 'NORMAL',
    uploadedBy: user.id,
    uploadedByName: user.name,
    lrmsSyncStatus: 'NOT_SYNCED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addDocument(newDoc);

  recordAuditEvent({
    user: user.id,
    userName: user.name,
    role: user.role,
    action: 'UPLOAD',
    entityType: 'DOCUMENT',
    entityId: docId,
    after: { fileName, batchId, state, district, village },
    ip: req.ip,
    details: `Uploaded new land record document: ${fileName}`,
  });

  // If a batch was specified, update batch counts
  if (batchId) {
    const b = db.getBatches().find((batch) => batch.id === batchId);
    if (b) {
      db.updateBatch(batchId, { documentCount: b.documentCount + 1 });
    }
  }

  return res.status(201).json({ success: true, document: newDoc });
});

// POST /api/documents/:id/process
documentsRouter.post('/:id/process', async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = getCurrentUser();
  const doc = db.getDocuments().find((d) => d.id === id);

  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document not found.' });
  }

  // Update status to PROCESSING
  db.updateDocument(id, {
    processingStatus: 'PROCESSING',
    processingStartedAt: new Date().toISOString(),
  });

  recordAuditEvent({
    user: user.id,
    userName: user.name,
    role: user.role,
    action: 'PROCESS_STARTED',
    entityType: 'DOCUMENT',
    entityId: id,
    details: 'Initiated multimodal OCR and field extraction pipeline',
  });

  try {
    // Call Gemini Service
    const extractionResult = await extractLandRecordWithGemini(
      doc.id,
      doc.fileUrl,
      doc.fileType,
      {
        state: doc.state,
        district: doc.district,
        tehsil: doc.tehsil,
        village: doc.village,
        documentType: doc.documentType,
        language: doc.language,
        fileName: doc.fileName,
      }
    );

    const fullRecord: ExtractedRecord = {
      id: `EXT-${doc.id}`,
      documentId: doc.id,
      location: extractionResult.extractedRecord.location as any,
      parcel: extractionResult.extractedRecord.parcel as any,
      ownership: extractionResult.extractedRecord.ownership as any,
      land: extractionResult.extractedRecord.land as any,
      mutation: extractionResult.extractedRecord.mutation as any,
      registration: extractionResult.extractedRecord.registration as any,
      metadata: extractionResult.extractedRecord.metadata as any,
    };

    db.setExtractedRecord(fullRecord);

    // Run Validation Rules
    const validationResults = runValidation(doc, fullRecord);
    db.setValidationResults(doc.id, validationResults);

    // Run Duplicate Check
    const dupCheck = checkDuplicate(doc, fullRecord);

    // Compute Confidence & Routing
    const confidenceRouting = computeDocumentConfidence(
      extractionResult.overallConfidence,
      extractionResult.qualityScore,
      validationResults
    );

    let finalStatus = confidenceRouting.recommendedStatus;
    let finalWorkflow = confidenceRouting.recommendedWorkflow;

    if (dupCheck.isDuplicate && dupCheck.duplicateType === 'EXACT_HASH') {
      finalStatus = 'REVIEW_REQUIRED';
      finalWorkflow = 'IN_REVIEW';
    }

    // Update document record
    const updated = db.updateDocument(doc.id, {
      processingStatus: finalStatus,
      workflowStatus: finalWorkflow,
      qualityScore: extractionResult.qualityScore,
      overallConfidence: confidenceRouting.overallConfidence,
      duplicateStatus: dupCheck.isDuplicate ? (dupCheck.duplicateType === 'EXACT_HASH' ? 'HIGH_CONFIDENCE_DUPLICATE' : 'POSSIBLE_DUPLICATE') : 'NO_MATCH',
      duplicateOfDocId: dupCheck.matchedDocId,
      duplicateDetails: dupCheck.reason,
      assignedTo: finalStatus === 'REVIEW_REQUIRED' ? 'usr-ver-01' : undefined,
      assignedToName: finalStatus === 'REVIEW_REQUIRED' ? 'Sunita Deshmukh' : undefined,
      assignedAt: finalStatus === 'REVIEW_REQUIRED' ? new Date().toISOString() : undefined,
      slaDueDate: finalStatus === 'REVIEW_REQUIRED' ? new Date(Date.now() + 48 * 3600 * 1000).toISOString() : undefined,
      processingCompletedAt: new Date().toISOString(),
    });

    recordAuditEvent({
      user: 'SYSTEM',
      userName: 'AI Engine (Gemini 3.8 Flash)',
      role: 'ADMIN',
      action: 'PROCESS_COMPLETED',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      after: {
        status: finalStatus,
        confidence: confidenceRouting.overallConfidence,
        quality: extractionResult.qualityScore,
        errors: validationResults.filter((r) => r.severity === 'ERROR').length,
      },
      details: `Processing finished. Routed to ${finalStatus} with confidence ${confidenceRouting.overallConfidence}%.`,
    });

    // Also add parcel to GIS if parcel details exist
    if (fullRecord.parcel?.surveyNumber?.value) {
      const lat = 18.579 + (Math.random() * 0.02 - 0.01);
      const lng = 73.981 + (Math.random() * 0.02 - 0.01);
      db.addGisParcel({
        id: `PARCEL-${doc.id}`,
        surveyNumber: String(fullRecord.parcel.surveyNumber.value),
        khasraNumber: String(fullRecord.parcel.khasraNumber?.value || fullRecord.parcel.surveyNumber.value),
        khataNumber: String(fullRecord.parcel.khataNumber?.value || '101'),
        village: doc.village,
        tehsil: doc.tehsil,
        district: doc.district,
        state: doc.state,
        ownerName: String(fullRecord.ownership?.owners?.[0]?.name?.value || 'Unknown'),
        plotAreaAcres: Number(fullRecord.parcel.plotArea?.value || 1.5),
        landClassification: String(fullRecord.land?.landClassification?.value || 'Agricultural'),
        status: finalStatus === 'APPROVED' ? 'DIGITIZED' : 'PENDING_VERIFICATION',
        confidence: confidenceRouting.overallConfidence,
        documentId: doc.id,
        centroid: [lat, lng],
        coordinates: [
          [lat - 0.001, lng - 0.001],
          [lat + 0.001, lng - 0.001],
          [lat + 0.001, lng + 0.001],
          [lat - 0.001, lng + 0.001],
        ],
      });
    }

    return res.json({
      success: true,
      document: updated,
      extractedRecord: fullRecord,
      validationResults,
      confidenceRouting,
    });
  } catch (error: any) {
    db.updateDocument(doc.id, {
      processingStatus: 'FAILED',
      processingError: error.message || 'Processing failed',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'PROCESSING_ERROR', message: error.message || 'Processing pipeline error' },
    });
  }
});

// POST /api/documents/:id/validate (re-runs validation after corrections)
documentsRouter.post('/:id/validate', (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = db.getDocuments().find((d) => d.id === id);
  const ext = db.getExtractedRecords().find((r) => r.documentId === id);

  if (!doc || !ext) {
    return res.status(404).json({ success: false, message: 'Document or extracted record not found.' });
  }

  const results = runValidation(doc, ext);
  db.setValidationResults(id, results);

  const confidenceRouting = computeDocumentConfidence(doc.overallConfidence, doc.qualityScore, results);

  db.updateDocument(id, {
    overallConfidence: confidenceRouting.overallConfidence,
  });

  return res.json({
    success: true,
    validationResults: results,
    overallConfidence: confidenceRouting.overallConfidence,
  });
});
