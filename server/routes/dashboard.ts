import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';

export const dashboardRouter = Router();

// GET /api/dashboard/operator
dashboardRouter.get('/operator', (_req: Request, res: Response) => {
  const docs = db.getDocuments();
  const batches = db.getBatches();

  const totalUploaded = docs.length;
  const processing = docs.filter((d) => d.processingStatus === 'PROCESSING' || d.processingStatus === 'QUEUED').length;
  const reviewRequired = docs.filter((d) => d.processingStatus === 'REVIEW_REQUIRED' || d.workflowStatus === 'IN_REVIEW').length;
  const approved = docs.filter((d) => d.processingStatus === 'APPROVED' || d.workflowStatus === 'APPROVED').length;
  const autoAccepted = docs.filter((d) => d.workflowStatus === 'AUTO_ACCEPTED').length;
  const failed = docs.filter((d) => d.processingStatus === 'FAILED').length;
  const synced = docs.filter((d) => d.lrmsSyncStatus === 'SYNCED').length;

  const validConfDocs = docs.filter((d) => d.overallConfidence > 0);
  const avgConfidence = validConfDocs.length
    ? Math.round(validConfDocs.reduce((acc, d) => acc + d.overallConfidence, 0) / validConfDocs.length)
    : 0;

  // Language breakdown
  const langDist: Record<string, number> = {};
  docs.forEach((d) => {
    langDist[d.language] = (langDist[d.language] || 0) + 1;
  });

  // Doc Type breakdown
  const typeDist: Record<string, number> = {};
  docs.forEach((d) => {
    typeDist[d.documentType] = (typeDist[d.documentType] || 0) + 1;
  });

  return res.json({
    success: true,
    metrics: {
      totalUploaded,
      processing,
      reviewRequired,
      approved,
      autoAccepted,
      failed,
      synced,
      avgConfidence,
    },
    languageDistribution: Object.entries(langDist).map(([lang, count]) => ({ language: lang, count })),
    documentTypeDistribution: Object.entries(typeDist).map(([type, count]) => ({ type, count })),
    recentBatches: batches.slice(0, 5),
    recentDocuments: docs.slice(0, 8),
  });
});

// GET /api/dashboard/verifier
dashboardRouter.get('/verifier', (req: Request, res: Response) => {
  const docs = db.getDocuments();
  const currentVerifierId = req.query.verifierId || 'usr-ver-01';

  const assignedToMe = docs.filter((d) => d.assignedTo === currentVerifierId && (d.workflowStatus === 'IN_REVIEW' || d.processingStatus === 'REVIEW_REQUIRED')).length;
  const totalQueue = docs.filter((d) => d.processingStatus === 'REVIEW_REQUIRED' || d.workflowStatus === 'IN_REVIEW').length;
  const highPriority = docs.filter((d) => (d.processingStatus === 'REVIEW_REQUIRED' || d.workflowStatus === 'IN_REVIEW') && (d.priority === 'HIGH' || d.priority === 'CRITICAL')).length;
  const myApproved = docs.filter((d) => d.approvedBy === currentVerifierId).length;
  const slaBreached = docs.filter((d) => d.slaBreached).length;

  return res.json({
    success: true,
    metrics: {
      assignedToMe,
      totalQueue,
      highPriority,
      myApproved,
      slaBreached,
    },
  });
});

// GET /api/dashboard/supervisor
dashboardRouter.get('/supervisor', (_req: Request, res: Response) => {
  const docs = db.getDocuments();
  const users = db.getUsers().filter((u) => u.role === 'VERIFIER');
  const valResults = db.getValidationResults();

  // District Breakdown
  const districtMap: Record<string, { total: number; approved: number; pending: number }> = {};
  docs.forEach((d) => {
    if (!districtMap[d.district]) {
      districtMap[d.district] = { total: 0, approved: 0, pending: 0 };
    }
    districtMap[d.district].total += 1;
    if (d.workflowStatus === 'APPROVED' || d.processingStatus === 'APPROVED' || d.processingStatus === 'SYNCED') {
      districtMap[d.district].approved += 1;
    } else if (d.workflowStatus === 'IN_REVIEW' || d.processingStatus === 'REVIEW_REQUIRED') {
      districtMap[d.district].pending += 1;
    }
  });

  // Verifier Workload
  const verifierWorkload = users.map((u) => {
    const assigned = docs.filter((d) => d.assignedTo === u.id && d.workflowStatus === 'IN_REVIEW').length;
    const completed = docs.filter((d) => d.approvedBy === u.id).length;
    return {
      id: u.id,
      name: u.name,
      district: u.district,
      tehsil: u.tehsil,
      assignedTasks: assigned,
      completedTasks: completed,
      utilizationRate: Math.min(100, Math.round((assigned / 15) * 100)),
    };
  });

  // Top Error Hotspots
  const ruleCounts: Record<string, number> = {};
  valResults.forEach((r) => {
    if (r.severity === 'ERROR' && r.status === 'FAIL') {
      ruleCounts[r.ruleName] = (ruleCounts[r.ruleName] || 0) + 1;
    }
  });

  const errorHotspots = Object.entries(ruleCounts)
    .map(([rule, count]) => ({ rule, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return res.json({
    success: true,
    totalDocuments: docs.length,
    pendingVerification: docs.filter((d) => d.processingStatus === 'REVIEW_REQUIRED').length,
    escalatedCount: docs.filter((d) => d.workflowStatus === 'ESCALATED').length,
    slaBreachedCount: docs.filter((d) => d.slaBreached).length,
    districtProgress: Object.entries(districtMap).map(([district, stats]) => ({
      district,
      ...stats,
      completionRate: Math.round((stats.approved / (stats.total || 1)) * 100),
    })),
    verifierWorkload,
    errorHotspots,
  });
});

// GET /api/dashboard/official
dashboardRouter.get('/official', (_req: Request, res: Response) => {
  const docs = db.getDocuments();
  const parcels = db.getGisParcels();

  const total = docs.length;
  const processed = docs.filter((d) => d.processingStatus !== 'UPLOADED' && d.processingStatus !== 'QUEUED').length;
  const approved = docs.filter((d) => d.workflowStatus === 'APPROVED' || d.processingStatus === 'APPROVED' || d.processingStatus === 'SYNCED').length;
  const autoAccepted = docs.filter((d) => d.workflowStatus === 'AUTO_ACCEPTED').length;
  const synced = docs.filter((d) => d.lrmsSyncStatus === 'SYNCED').length;
  const duplicates = docs.filter((d) => d.duplicateStatus === 'HIGH_CONFIDENCE_DUPLICATE' || d.duplicateStatus === 'POSSIBLE_DUPLICATE').length;

  const validConfDocs = docs.filter((d) => d.overallConfidence > 0);
  const avgConfidence = validConfDocs.length
    ? Math.round(validConfDocs.reduce((acc, d) => acc + d.overallConfidence, 0) / validConfDocs.length)
    : 0;

  const autoAcceptanceRate = processed > 0 ? +((autoAccepted / processed) * 100).toFixed(1) : 0;
  const digitizationCompletionRate = total > 0 ? +((approved / total) * 100).toFixed(1) : 0;
  const dilrmpSyncRate = approved > 0 ? +((synced / approved) * 100).toFixed(1) : 0;

  // State Level aggregation
  const stateAgg: Record<string, { total: number; approved: number; synced: number }> = {};
  docs.forEach((d) => {
    if (!stateAgg[d.state]) {
      stateAgg[d.state] = { total: 0, approved: 0, synced: 0 };
    }
    stateAgg[d.state].total += 1;
    if (d.workflowStatus === 'APPROVED' || d.processingStatus === 'SYNCED') {
      stateAgg[d.state].approved += 1;
    }
    if (d.lrmsSyncStatus === 'SYNCED') {
      stateAgg[d.state].synced += 1;
    }
  });

  return res.json({
    success: true,
    kpis: {
      totalDocuments: total,
      totalParcelsMapped: parcels.length,
      digitizationCompletionRate,
      autoAcceptanceRate,
      dilrmpSyncRate,
      avgConfidence,
      duplicatesDetected: duplicates,
      nationalSyncReady: approved - synced,
    },
    stateBreakdown: Object.entries(stateAgg).map(([state, data]) => ({
      state,
      ...data,
      completionRate: Math.round((data.approved / (data.total || 1)) * 100),
    })),
  });
});
