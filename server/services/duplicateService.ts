import { DocumentRecord, ExtractedRecord } from '../types.js';
import { db } from '../db/store.js';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: 'EXACT_HASH' | 'FUZZY_RECORD' | 'NONE';
  matchedDocId?: string;
  matchedSurvey?: string;
  confidence: number;
  reason?: string;
}

export function checkDuplicate(
  currentDoc: DocumentRecord,
  extracted?: ExtractedRecord
): DuplicateCheckResult {
  const documents = db.getDocuments();

  // 1. Exact Binary File Hash Check
  if (currentDoc.fileHash) {
    const exactMatch = documents.find(
      (d) => d.id !== currentDoc.id && d.fileHash === currentDoc.fileHash
    );
    if (exactMatch) {
      return {
        isDuplicate: true,
        duplicateType: 'EXACT_HASH',
        matchedDocId: exactMatch.id,
        matchedSurvey: exactMatch.fileName,
        confidence: 100,
        reason: `Exact identical document binary found in repository (Doc ID: ${exactMatch.id}).`,
      };
    }
  }

  // 2. Fuzzy Record Matching: Village + Survey/Khasra + Normalized Owner
  if (extracted && extracted.parcel?.surveyNumber?.value && extracted.location?.village?.value) {
    const curVillage = String(extracted.location.village.value).trim().toLowerCase();
    const curSurvey = String(extracted.parcel.surveyNumber.value).trim().toLowerCase();
    const curOwner = String(extracted.ownership?.owners?.[0]?.name?.value || '')
      .trim()
      .toLowerCase();

    const allRecords = db.getExtractedRecords();
    for (const rec of allRecords) {
      if (rec.documentId === currentDoc.id) continue;

      const otherDoc = documents.find((d) => d.id === rec.documentId);
      if (!otherDoc || otherDoc.processingStatus === 'REJECTED') continue;

      const otherVillage = String(rec.location?.village?.value || '').trim().toLowerCase();
      const otherSurvey = String(rec.parcel?.surveyNumber?.value || '').trim().toLowerCase();
      const otherOwner = String(rec.ownership?.owners?.[0]?.name?.value || '').trim().toLowerCase();

      if (curVillage && curVillage === otherVillage && curSurvey && curSurvey === otherSurvey) {
        // Same village and same survey number!
        const ownerSimilar = curOwner && otherOwner && (curOwner.includes(otherOwner) || otherOwner.includes(curOwner));
        return {
          isDuplicate: true,
          duplicateType: 'FUZZY_RECORD',
          matchedDocId: rec.documentId,
          matchedSurvey: rec.parcel?.surveyNumber?.value as string,
          confidence: ownerSimilar ? 95 : 75,
          reason: `Potential duplicate: Survey #${rec.parcel?.surveyNumber?.value} in village '${rec.location?.village?.value}' already registered in Doc ID: ${rec.documentId}.`,
        };
      }
    }
  }

  return {
    isDuplicate: false,
    duplicateType: 'NONE',
    confidence: 0,
  };
}
