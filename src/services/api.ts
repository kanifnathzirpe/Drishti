import {
  User,
  DocumentRecord,
  BatchRecord,
  ExtractedRecord,
  ValidationResult,
  AuditLog,
  ValidationRule,
  NotificationItem,
  GisParcel,
  UserRole,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || errorData?.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Auth
  getCurrentUser: () => fetchJson<{ success: boolean; user: User }>('/auth/me'),
  login: (email: string) => fetchJson<{ success: boolean; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  switchDemoRole: (role: UserRole) => fetchJson<{ success: boolean; user: User }>('/auth/switch-demo', {
    method: 'POST',
    body: JSON.stringify({ role }),
  }),

  // Documents
  getDocuments: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchJson<{ success: boolean; total: number; data: DocumentRecord[] }>(`/documents${query}`);
  },
  getDocumentById: (id: string) => fetchJson<{
    success: boolean;
    document: DocumentRecord;
    extractedRecord: ExtractedRecord | null;
    validationResults: ValidationResult[];
    syncRecord: any;
  }>(`/documents/${id}`),
  uploadDocument: (data: Partial<DocumentRecord> & { fileBase64?: string }) => fetchJson<{ success: boolean; document: DocumentRecord }>('/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  processDocument: (id: string) => fetchJson<{
    success: boolean;
    document: DocumentRecord;
    extractedRecord: ExtractedRecord;
    validationResults: ValidationResult[];
    confidenceRouting: any;
  }>(`/documents/${id}/process`, {
    method: 'POST',
  }),
  validateDocument: (id: string) => fetchJson<{
    success: boolean;
    validationResults: ValidationResult[];
    overallConfidence: number;
  }>(`/documents/${id}/validate`, {
    method: 'POST',
  }),

  // Batches
  getBatches: () => fetchJson<{ success: boolean; batches: BatchRecord[] }>('/batches'),
  createBatch: (data: Partial<BatchRecord>) => fetchJson<{ success: boolean; batch: BatchRecord }>('/batches', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Verification Tasks
  getVerificationTasks: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchJson<{ success: boolean; tasks: (DocumentRecord & { errorCount: number; warningCount: number; validationSummary: string[] })[]; total: number }>(`/verification/tasks${query}`);
  },
  correctField: (id: string, fieldPath: string, originalValue: any, newValue: any, notes?: string) =>
    fetchJson<{ success: boolean; extractedRecord: ExtractedRecord; validationResults: ValidationResult[]; overallConfidence: number }>(`/verification/tasks/${id}/correct`, {
      method: 'POST',
      body: JSON.stringify({ fieldPath, originalValue, newValue, notes }),
    }),
  approveDocument: (id: string) => fetchJson<{ success: boolean; document: DocumentRecord }>(`/verification/tasks/${id}/approve`, {
    method: 'POST',
  }),
  rejectDocument: (id: string, reason: string) => fetchJson<{ success: boolean; document: DocumentRecord }>(`/verification/tasks/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
  escalateDocument: (id: string, reason: string) => fetchJson<{ success: boolean; document: DocumentRecord }>(`/verification/tasks/${id}/escalate`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
  assignTask: (id: string, verifierId: string, verifierName: string) =>
    fetchJson<{ success: boolean; document: DocumentRecord }>(`/verification/tasks/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ verifierId, verifierName }),
    }),

  // Dashboards
  getOperatorDashboard: () => fetchJson<any>('/dashboard/operator'),
  getVerifierDashboard: (verifierId?: string) => fetchJson<any>(`/dashboard/verifier${verifierId ? `?verifierId=${verifierId}` : ''}`),
  getSupervisorDashboard: () => fetchJson<any>('/dashboard/supervisor'),
  getOfficialDashboard: () => fetchJson<any>('/dashboard/official'),

  // GIS
  getParcels: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchJson<{ success: boolean; geojson: any; parcels: GisParcel[] }>(`/gis/parcels${query}`);
  },

  // LRMS / DILRMP Sync
  syncToLrms: (documentId: string) => fetchJson<{
    success: boolean;
    status: string;
    externalRecordId?: string;
    acknowledgmentNumber?: string;
    message: string;
    syncedAt: string;
  }>('/integrations/lrms/sync', {
    method: 'POST',
    body: JSON.stringify({ documentId }),
  }),
  getIntegrationsOverview: () => fetchJson<any>('/integrations/overview'),

  // Audit
  getAuditLogs: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchJson<{ success: boolean; logs: AuditLog[]; total: number }>(`/audit${query}`);
  },

  // Feedback Learning Loop
  getFeedbackStats: () => fetchJson<any>('/feedback'),

  // Rules
  getValidationRules: () => fetchJson<{ success: boolean; rules: ValidationRule[] }>('/rules'),
  updateValidationRule: (id: string, updates: Partial<ValidationRule>) =>
    fetchJson<{ success: boolean; rule: ValidationRule }>(`/rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Users
  getUsers: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchJson<{ success: boolean; users: User[]; total: number }>(`/users${query}`);
  },
  createUser: (data: Partial<User>) => fetchJson<{ success: boolean; user: User }>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateUser: (id: string, updates: Partial<User>) => fetchJson<{ success: boolean; user: User }>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Notifications
  getNotifications: () => fetchJson<{ success: boolean; notifications: NotificationItem[]; unreadCount: number }>('/notifications'),
  markNotificationRead: (id: string) => fetchJson<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => fetchJson<{ success: boolean }>('/notifications/read-all', { method: 'POST' }),

  // Reports
  getReportsSummary: () => fetchJson<any>('/reports/summary'),
};
