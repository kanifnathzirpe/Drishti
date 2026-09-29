import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';

export const auditRouter = Router();

// GET /api/audit
auditRouter.get('/', (req: Request, res: Response) => {
  const { action, role, entityType, search, limit = '100' } = req.query;
  let logs = db.getAuditLogs();

  if (action && action !== 'ALL') {
    logs = logs.filter((l) => l.action === action);
  }
  if (role && role !== 'ALL') {
    logs = logs.filter((l) => l.role === role);
  }
  if (entityType && entityType !== 'ALL') {
    logs = logs.filter((l) => l.entityType === entityType);
  }
  if (search) {
    const q = String(search).toLowerCase();
    logs = logs.filter(
      (l) =>
        l.entityId.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q) ||
        (l.details && l.details.toLowerCase().includes(q))
    );
  }

  const l = parseInt(String(limit), 10) || 100;
  return res.json({
    success: true,
    total: logs.length,
    logs: logs.slice(0, l),
  });
});
