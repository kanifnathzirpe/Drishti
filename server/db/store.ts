import fs from 'fs';
import path from 'path';
import {
  User,
  DocumentRecord,
  BatchRecord,
  ExtractedRecord,
  ValidationResult,
  AuditLog,
  FeedbackRecord,
  LrmsSyncRecord,
  ValidationRule,
  NotificationItem,
  GisParcel,
} from '../types.js';
import { seedInitialData } from './seed.js';

export interface DatabaseSchema {
  users: User[];
  documents: DocumentRecord[];
  batches: BatchRecord[];
  extractedRecords: ExtractedRecord[];
  validationResults: ValidationResult[];
  auditLogs: AuditLog[];
  feedbackRecords: FeedbackRecord[];
  lrmsSyncRecords: LrmsSyncRecord[];
  validationRules: ValidationRule[];
  notifications: NotificationItem[];
  gisParcels: GisParcel[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'drishti.json');

class JsonDatabaseStore {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;
  private isSaving = false;

  constructor() {
    this.data = {
      users: [],
      documents: [],
      batches: [],
      extractedRecords: [],
      validationResults: [],
      auditLogs: [],
      feedbackRecords: [],
      lrmsSyncRecords: [],
      validationRules: [],
      notifications: [],
      gisParcels: [],
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`[Database] Loaded existing database with ${this.data.documents.length} documents, ${this.data.users.length} users.`);
      } else {
        console.log('[Database] Initializing fresh database with demonstration seeds...');
        this.data = seedInitialData();
        this.persistSync();
        console.log(`[Database] Seeded ${this.data.documents.length} documents and ${this.data.users.length} users successfully.`);
      }
    } catch (err) {
      console.error('[Database] Failed to load database file, re-seeding:', err);
      this.data = seedInitialData();
      this.persistSync();
    }
  }

  public persistSync() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Error persisting data synchronously:', err);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistSync();
      this.saveTimeout = null;
    }, 150);
  }

  // Getters
  public getUsers(): User[] {
    return this.data.users;
  }

  public getDocuments(): DocumentRecord[] {
    return this.data.documents;
  }

  public getBatches(): BatchRecord[] {
    return this.data.batches;
  }

  public getExtractedRecords(): ExtractedRecord[] {
    return this.data.extractedRecords;
  }

  public getValidationResults(): ValidationResult[] {
    return this.data.validationResults;
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public getFeedbackRecords(): FeedbackRecord[] {
    return this.data.feedbackRecords;
  }

  public getLrmsSyncRecords(): LrmsSyncRecord[] {
    return this.data.lrmsSyncRecords;
  }

  public getValidationRules(): ValidationRule[] {
    return this.data.validationRules;
  }

  public getNotifications(): NotificationItem[] {
    return this.data.notifications;
  }

  public getGisParcels(): GisParcel[] {
    return this.data.gisParcels;
  }

  // Mutations
  public addDocument(doc: DocumentRecord) {
    this.data.documents.unshift(doc);
    this.save();
  }

  public updateDocument(id: string, updates: Partial<DocumentRecord>): DocumentRecord | null {
    const idx = this.data.documents.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.data.documents[idx] = {
      ...this.data.documents[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.documents[idx];
  }

  public addBatch(batch: BatchRecord) {
    this.data.batches.unshift(batch);
    this.save();
  }

  public updateBatch(id: string, updates: Partial<BatchRecord>): BatchRecord | null {
    const idx = this.data.batches.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.data.batches[idx] = {
      ...this.data.batches[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.batches[idx];
  }

  public setExtractedRecord(record: ExtractedRecord) {
    const idx = this.data.extractedRecords.findIndex((r) => r.documentId === record.documentId);
    if (idx >= 0) {
      this.data.extractedRecords[idx] = record;
    } else {
      this.data.extractedRecords.unshift(record);
    }
    this.save();
  }

  public setValidationResults(documentId: string, results: ValidationResult[]) {
    // Remove existing for this doc
    this.data.validationResults = this.data.validationResults.filter((r) => r.documentId !== documentId);
    this.data.validationResults.unshift(...results);
    this.save();
  }

  public addAuditLog(log: AuditLog) {
    this.data.auditLogs.unshift(log);
    // Keep max 1000 logs
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs.pop();
    }
    this.save();
  }

  public addFeedbackRecord(feedback: FeedbackRecord) {
    this.data.feedbackRecords.unshift(feedback);
    this.save();
  }

  public addLrmsSyncRecord(rec: LrmsSyncRecord) {
    const idx = this.data.lrmsSyncRecords.findIndex((r) => r.id === rec.id || r.documentId === rec.documentId);
    if (idx >= 0) {
      this.data.lrmsSyncRecords[idx] = rec;
    } else {
      this.data.lrmsSyncRecords.unshift(rec);
    }
    this.save();
  }

  public updateValidationRule(id: string, updates: Partial<ValidationRule>): ValidationRule | null {
    const idx = this.data.validationRules.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.data.validationRules[idx] = {
      ...this.data.validationRules[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.validationRules[idx];
  }

  public addNotification(notification: NotificationItem) {
    this.data.notifications.unshift(notification);
    if (this.data.notifications.length > 200) {
      this.data.notifications.pop();
    }
    this.save();
  }

  public markNotificationAsRead(id: string) {
    const item = this.data.notifications.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.save();
    }
  }

  public markAllNotificationsAsRead(userId?: string, role?: string) {
    this.data.notifications.forEach((n) => {
      if (!userId || n.userId === userId || n.targetRole === role) {
        n.read = true;
      }
    });
    this.save();
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
  }

  public addGisParcel(parcel: GisParcel) {
    const idx = this.data.gisParcels.findIndex((p) => p.id === parcel.id || p.documentId === parcel.documentId);
    if (idx >= 0) {
      this.data.gisParcels[idx] = parcel;
    } else {
      this.data.gisParcels.push(parcel);
    }
    this.save();
  }

  public resetToDemoData() {
    this.data = seedInitialData();
    this.persistSync();
  }
}

export const db = new JsonDatabaseStore();
