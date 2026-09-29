import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';
import { recordAuditEvent } from '../services/auditService.js';

export const authRouter = Router();

// In-memory session tracking for active demo user
let currentUserId = 'usr-op-01'; // Default to Operator

export function getCurrentUser() {
  return db.getUsers().find((u) => u.id === currentUserId) || db.getUsers()[0];
}

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.getUsers().find((u) => u.email.toLowerCase() === String(email).toLowerCase().trim());

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'User not found in DRISHTI directory.' },
    });
  }

  currentUserId = user.id;
  db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

  recordAuditEvent({
    user: user.id,
    userName: user.name,
    role: user.role,
    action: 'LOGIN',
    entityType: 'USER',
    entityId: user.id,
    details: `User logged in from ${req.ip || '127.0.0.1'} with role ${user.role}`,
  });

  return res.json({ success: true, user });
});

// GET /api/me
authRouter.get('/me', (_req: Request, res: Response) => {
  const user = getCurrentUser();
  return res.json({ success: true, user });
});

// POST /api/auth/switch-demo
authRouter.post('/switch-demo', (req: Request, res: Response) => {
  const { role } = req.body;
  const target = db.getUsers().find((u) => u.role === role);

  if (!target) {
    return res.status(404).json({ success: false, message: 'Role user not found' });
  }

  currentUserId = target.id;
  db.updateUser(target.id, { lastLoginAt: new Date().toISOString() });

  recordAuditEvent({
    user: target.id,
    userName: target.name,
    role: target.role,
    action: 'DEMO_ROLE_SWITCH',
    entityType: 'USER',
    entityId: target.id,
    details: `Active role switched to ${target.role} (${target.name})`,
  });

  return res.json({ success: true, user: target });
});
