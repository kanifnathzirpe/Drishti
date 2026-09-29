import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';
import { getCurrentUser } from './auth.js';

export const notificationsRouter = Router();

// GET /api/notifications
notificationsRouter.get('/', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const all = db.getNotifications();

  // Filter for user or user role
  const relevant = all.filter(
    (n) => !n.userId || n.userId === user.id || !n.targetRole || n.targetRole === user.role
  );

  return res.json({
    success: true,
    notifications: relevant,
    unreadCount: relevant.filter((n) => !n.read).length,
  });
});

// POST /api/notifications/:id/read
notificationsRouter.post('/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  db.markNotificationAsRead(id);
  return res.json({ success: true });
});

// POST /api/notifications/read-all
notificationsRouter.post('/read-all', (_req: Request, res: Response) => {
  const user = getCurrentUser();
  db.markAllNotificationsAsRead(user.id, user.role);
  return res.json({ success: true });
});
