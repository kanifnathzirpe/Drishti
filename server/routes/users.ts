import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';
import { getCurrentUser } from './auth.js';
import { recordAuditEvent } from '../services/auditService.js';
import { User } from '../types.js';

export const usersRouter = Router();

// GET /api/users
usersRouter.get('/', (req: Request, res: Response) => {
  const { role, state, district } = req.query;
  let users = db.getUsers();

  if (role && role !== 'ALL') {
    users = users.filter((u) => u.role === role);
  }
  if (state && state !== 'All') {
    users = users.filter((u) => u.state === state);
  }
  if (district && district !== 'All') {
    users = users.filter((u) => u.district === district);
  }

  return res.json({ success: true, users, total: users.length });
});

// POST /api/users
usersRouter.post('/', (req: Request, res: Response) => {
  const currentUser = getCurrentUser();
  const { name, email, phone, role, state, district, tehsil } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
  }

  const newUser: User = {
    id: `usr-${Date.now().toString().slice(-4)}`,
    name,
    email,
    phone: phone || '+91 98000 00000',
    role,
    state: state || 'Maharashtra',
    district: district || 'Pune',
    tehsil: tehsil || 'Haveli',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  db.addUser(newUser);

  recordAuditEvent({
    user: currentUser.id,
    userName: currentUser.name,
    role: currentUser.role,
    action: 'USER_CREATED',
    entityType: 'USER',
    entityId: newUser.id,
    after: { name, email, role },
    details: `Created new user ${name} with role ${role}`,
    ip: req.ip,
  });

  return res.status(201).json({ success: true, user: newUser });
});

// PATCH /api/users/:id
usersRouter.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUser = getCurrentUser();
  const { role, status, state, district, tehsil } = req.body;

  const current = db.getUsers().find((u) => u.id === id);
  if (!current) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const updated = db.updateUser(id, {
    role: role || current.role,
    status: status || current.status,
    state: state || current.state,
    district: district || current.district,
    tehsil: tehsil || current.tehsil,
  });

  recordAuditEvent({
    user: currentUser.id,
    userName: currentUser.name,
    role: currentUser.role,
    action: 'ROLE_CHANGED',
    entityType: 'USER',
    entityId: id,
    before: { role: current.role, status: current.status },
    after: { role: updated?.role, status: updated?.status },
    details: `Updated user profile/role for ${current.name}`,
    ip: req.ip,
  });

  return res.json({ success: true, user: updated });
});
