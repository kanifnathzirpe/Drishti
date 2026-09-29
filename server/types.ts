export type UserRole = 'OPERATOR' | 'VERIFIER' | 'SUPERVISOR' | 'OFFICIAL' | 'ADMIN';

export type DocumentType =
  | 'Record of Rights'
  | 'Mutation Register'
  | 'Sale Deed'
  | 'Cadastral Map'
  | 'Land Register'
  | 'Other';

export type ProcessingStatus =
  | 'UPLOADED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'EXTRACTED'
  | 'VALIDATED'
  | 'REVIEW_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SYNCED'
  | 'FAILED';

export type WorkflowStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ESCALATED'
  | 'AUTO_ACCEPTED';

export type Severity = 'ERROR' | 'WARNING' | 'INFO';

export type LrmsSyncStatus = 'NOT_SYNCED' | 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  state: string;
  district: string;
  tehsil: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface ExtractedField<T = string | number> {
  value: T;
  confidence: number; // 0-100
  boundingBox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  sourcePage?: number;
  isEdited?: boolean;
  originalValue?: T;
  editedBy?: string;
  editedAt?: string;
  status?: 'VALID' | 'WARNING' | 'ERROR';
  note?: string;
}

export interface LandOwner {
  id: string;
  name: ExtractedField<string>;
  fatherOrHusbandName: ExtractedField<string>;
  sharePercentage: ExtractedField<number>;
  ownershipType: ExtractedField<string>; // Single, Joint, Occupant Class 1, Class 2
  aadhaarMasked?: string;
}

export interface ExtractedRecord {
  id: string;
  documentId: string;
  location: {
    state: ExtractedField<string>;
    district: ExtractedField<string>;
    tehsil: ExtractedField<string>;
    village: ExtractedField<string>;
    lgdStateCode?: ExtractedField<string>;
    lgdDistrictCode?: ExtractedField<string>;
    lgdVillageCode?: ExtractedField<string>;
  };
  parcel: {
    surveyNumber: ExtractedField<string>;
    khasraNumber: ExtractedField<string>;
    khataNumber: ExtractedField<string>;
    subDivision: ExtractedField<string>;
    plotArea: ExtractedField<number>;
    areaUnit: ExtractedField<string>; // Acre, Hectare, Bigha, Guntha, Sq Ft, Sq M
    normalizedAreaAcres: ExtractedField<number>;
  };
  ownership: {
    owners: LandOwner[];
    totalSharePercentage: number;
  };
  land: {
    landClassification: ExtractedField<string>; // Agricultural, Non-Agricultural, Forest, Pasture
    landUse: ExtractedField<string>; // Dryland (Jirayat), Irrigated (Bagayat), Fallow
    irrigationSource: ExtractedField<string>; // Canal, Well, Borewell, Rainfed
    cropType: ExtractedField<string>;
    soilType?: ExtractedField<string>;
  };
  mutation?: {
    mutationNumber: ExtractedField<string>;
    mutationDate: ExtractedField<string>;
    mutationType: ExtractedField<string>; // Inheritance, Sale, Gift, Partition
    previousOwner: ExtractedField<string>;
    newOwner: ExtractedField<string>;
    remarks?: ExtractedField<string>;
  };
  registration?: {
    registrationNumber: ExtractedField<string>;
    registrationDate: ExtractedField<string>;
    subRegistrarOffice: ExtractedField<string>;
    deedType: ExtractedField<string>;
  };
  metadata: {
    sourceFile: string;
    pageCount: number;
    language: string;
    documentType: DocumentType;
    isHandwritten?: boolean;
    hasStamp?: boolean;
    extractedAt: string;
  };
}

export interface ValidationResult {
  id: string;
  documentId: string;
  ruleId: string;
  ruleName: string;
  severity: Severity;
  field: string;
  message: string;
  expected?: string;
  actual?: string;
  status: 'FAIL' | 'PASS' | 'ACKNOWLEDGED';
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  batchId?: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  fileHash: string;
  pageCount: number;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  documentType: DocumentType;
  language: string;
  uploadStatus: 'SUCCESS' | 'FAILED';
  processingStatus: ProcessingStatus;
  qualityScore: number; // 0 - 100
  overallConfidence: number; // 0 - 100
  workflowStatus: WorkflowStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  uploadedBy: string;
  uploadedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: string;
  slaDueDate?: string;
  slaBreached?: boolean;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  escalationReason?: string;
  lrmsSyncStatus: LrmsSyncStatus;
  lrmsRecordId?: string;
  lrmsSyncedAt?: string;
  duplicateStatus?: 'NO_MATCH' | 'POSSIBLE_DUPLICATE' | 'HIGH_CONFIDENCE_DUPLICATE';
  duplicateOfDocId?: string;
  duplicateDetails?: string;
  createdAt: string;
  updatedAt: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  processingError?: string;
  isDemo?: boolean;
}

export interface BatchRecord {
  id: string;
  batchNumber: string;
  name: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  documentCount: number;
  processedCount: number;
  approvedCount: number;
  reviewCount: number;
  failedCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIALLY_COMPLETED';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userName: string;
  role: UserRole;
  action: string;
  entityType: 'DOCUMENT' | 'BATCH' | 'USER' | 'RULE' | 'INTEGRATION' | 'SYSTEM';
  entityId: string;
  before?: any;
  after?: any;
  ip: string;
  userAgent?: string;
  details?: string;
}

export interface FeedbackRecord {
  id: string;
  documentId: string;
  field: string;
  originalValue: any;
  correctedValue: any;
  language: string;
  documentType: DocumentType;
  reviewer: string;
  reviewerName: string;
  confidenceBefore: number;
  notes?: string;
  createdAt: string;
}

export interface LrmsSyncRecord {
  id: string;
  documentId: string;
  system: 'DILRMP' | 'STATE_LRMS' | 'BHULEKH';
  endpoint: string;
  requestPayload: any;
  responsePayload?: any;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  attempts: number;
  lastAttemptAt: string;
  externalRecordId?: string;
  error?: string;
  syncedBy: string;
  createdAt: string;
}

export interface ValidationRule {
  id: string;
  name: string;
  category: 'MANDATORY' | 'FORMAT' | 'SANITY' | 'LOGICAL' | 'HIERARCHY' | 'DUPLICATE';
  field: string;
  severity: Severity;
  enabled: boolean;
  stateScope?: string; // empty means ALL states
  description: string;
  parameters?: Record<string, any>;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string; // empty means broadcast to role
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SLA';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface GisParcel {
  id: string;
  surveyNumber: string;
  khasraNumber: string;
  khataNumber: string;
  village: string;
  tehsil: string;
  district: string;
  state: string;
  ownerName: string;
  plotAreaAcres: number;
  landClassification: string;
  status: 'DIGITIZED' | 'PENDING_VERIFICATION' | 'SYNCED' | 'DISPUTED';
  confidence: number;
  documentId?: string;
  coordinates: [number, number][]; // Lat, Lng polygon
  centroid: [number, number]; // Lat, Lng
}
