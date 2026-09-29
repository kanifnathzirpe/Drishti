import { AuditLog, UserRole } from '../types.js';
import { db } from '../db/store.js';

export function recordAuditEvent(params: {
  user: string;
  userName: string;
  role: UserRole;
  action: string;
  entityType: AuditLog['entityType'];
  entityId: string;
  before?: any;
  after?: any;
  ip?: string;
  details?: string;
}): AuditLog {
  const log: AuditLog = {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    user: params.user,
    userName: params.userName,
    role: params.role,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    before: params.before,
    after: params.after,
    ip: params.ip || '127.0.0.1',
    details: params.details,
  };

  db.addAuditLog(log);
  return log;
}
