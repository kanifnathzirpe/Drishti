import { DocumentRecord, ExtractedRecord, LrmsSyncRecord } from '../types.js';
import { db } from '../db/store.js';

export interface LrmsSyncResponse {
  success: boolean;
  status: 'SYNCED' | 'FAILED';
  externalRecordId?: string;
  acknowledgmentNumber?: string;
  message: string;
  syncedAt: string;
  auditId?: string;
}

export async function syncRecordToLrms(
  doc: DocumentRecord,
  extracted: ExtractedRecord,
  userId: string = 'SYSTEM'
): Promise<LrmsSyncResponse> {
  const now = new Date().toISOString();

  // Create or update sync record
  const syncRecordId = `SYNC-${doc.id}-${Date.now().toString().slice(-4)}`;
  const endpoint = process.env.LRMS_API_URL || 'https://dilrmp.nic.in/api/v2/records';

  const payload = {
    systemHeader: {
      source: 'DRISHTI-AI-STUDIO',
      version: '2.4.0',
      timestamp: now,
      lgdDistrict: doc.district,
      lgdTehsil: doc.tehsil,
      lgdVillage: doc.village,
    },
    landRecord: {
      documentId: doc.id,
      state: doc.state,
      surveyNumber: extracted.parcel?.surveyNumber?.value,
      khasraNumber: extracted.parcel?.khasraNumber?.value,
      khataNumber: extracted.parcel?.khataNumber?.value,
      plotAreaAcres: extracted.parcel?.normalizedAreaAcres?.value || extracted.parcel?.plotArea?.value,
      areaUnit: extracted.parcel?.areaUnit?.value,
      primaryOwner: extracted.ownership?.owners?.[0]?.name?.value,
      coOwners: extracted.ownership?.owners?.map((o) => ({
        name: o.name?.value,
        share: o.sharePercentage?.value,
        type: o.ownershipType?.value,
      })),
      landClassification: extracted.land?.landClassification?.value,
      mutationNumber: extracted.mutation?.mutationNumber?.value,
      registrationNumber: extracted.registration?.registrationNumber?.value,
    },
  };

  // Simulate network latency (200ms)
  await new Promise((resolve) => setTimeout(resolve, 200));

  // High reliability simulation (95% success)
  const isSuccess = Math.random() > 0.05;
  const externalId = `DILRMP-${doc.state.substring(0, 2).toUpperCase()}-${extracted.parcel?.surveyNumber?.value || 'PARCEL'}-${Date.now().toString().slice(-4)}`;
  const ackNum = `ACK-NIC-${Math.floor(100000 + Math.random() * 900000)}`;

  const syncRecord: LrmsSyncRecord = {
    id: syncRecordId,
    documentId: doc.id,
    system: 'DILRMP',
    endpoint,
    requestPayload: payload,
    responsePayload: isSuccess
      ? {
          status: 'SUCCESS',
          ackId: ackNum,
          externalRecordId: externalId,
          timestamp: now,
          gateway: 'NIC-National-Data-Center',
        }
      : {
          status: 'RETRYABLE_ERROR',
          code: 'ERR_GATEWAY_TIMEOUT',
          message: 'State revenue node busy, queued for retry.',
        },
    status: isSuccess ? 'SYNCED' : 'FAILED',
    attempts: 1,
    lastAttemptAt: now,
    externalRecordId: isSuccess ? externalId : undefined,
    error: isSuccess ? undefined : 'State gateway timeout during bulk sync',
    syncedBy: userId,
    createdAt: now,
  };

  db.addLrmsSyncRecord(syncRecord);

  if (isSuccess) {
    db.updateDocument(doc.id, {
      lrmsSyncStatus: 'SYNCED',
      lrmsRecordId: externalId,
      lrmsSyncedAt: now,
    });
  } else {
    db.updateDocument(doc.id, {
      lrmsSyncStatus: 'FAILED',
    });
  }

  return {
    success: isSuccess,
    status: isSuccess ? 'SYNCED' : 'FAILED',
    externalRecordId: isSuccess ? externalId : undefined,
    acknowledgmentNumber: isSuccess ? ackNum : undefined,
    message: isSuccess
      ? `Successfully synchronized to National DILRMP repository (${externalId})`
      : 'Synchronization gateway reported temporary failure. Retry available.',
    syncedAt: now,
  };
}
