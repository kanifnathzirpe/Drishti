import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';
import { getCurrentUser } from './auth.js';
import { recordAuditEvent } from '../services/auditService.js';

export const rulesRouter = Router();

// GET /api/rules
rulesRouter.get('/', (_req: Request, res: Response) => {
  return res.json({ success: true, rules: db.getValidationRules() });
});

// PATCH /api/rules/:id
rulesRouter.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = getCurrentUser();
  const { enabled, severity, description } = req.body;

  const current = db.getValidationRules().find((r) => r.id === id);
  if (!current) {
    return res.status(404).json({ success: false, message: 'Rule not found' });
  }

  const updated = db.updateValidationRule(id, {
    enabled: enabled !== undefined ? enabled : current.enabled,
    severity: severity || current.severity,
    description: description || current.description,
  });

  recordAuditEvent({
    user: user.id,
    userName: user.name,
    role: user.role,
    action: 'RULE_CHANGED',
    entityType: 'RULE',
    entityId: id,
    before: { enabled: current.enabled, severity: current.severity },
    after: { enabled: updated?.enabled, severity: updated?.severity },
    details: `Admin modified validation rule ${current.name}`,
    ip: req.ip,
  });

  return res.json({ success: true, rule: updated });
});
