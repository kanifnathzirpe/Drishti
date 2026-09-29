import { ExtractedRecord, ValidationResult, DocumentRecord } from '../types.js';
import { db } from '../db/store.js';

export function runValidation(doc: DocumentRecord, record: ExtractedRecord): ValidationResult[] {
  const results: ValidationResult[] = [];
  const rules = db.getValidationRules().filter((r) => r.enabled);
  const now = new Date();

  for (const rule of rules) {
    if (rule.stateScope && rule.stateScope !== doc.state) {
      continue;
    }

    switch (rule.id) {
      case 'RULE-01': {
        // Mandatory Geographic Hierarchy
        const loc = record.location;
        const missing: string[] = [];
        if (!loc?.state?.value) missing.push('State');
        if (!loc?.district?.value) missing.push('District');
        if (!loc?.tehsil?.value) missing.push('Tehsil');
        if (!loc?.village?.value) missing.push('Village');

        if (missing.length > 0) {
          results.push({
            id: `VAL-${doc.id}-${rule.id}`,
            documentId: doc.id,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            field: 'location',
            message: `Mandatory location attributes missing: ${missing.join(', ')}`,
            expected: 'All administrative hierarchy levels specified',
            actual: `Missing: ${missing.join(', ')}`,
            status: 'FAIL',
            createdAt: now.toISOString(),
          });
        }
        break;
      }

      case 'RULE-02': {
        // Survey Number Pattern Check
        const survey = String(record.parcel?.surveyNumber?.value || '').trim();
        // Accepts: 142, 142/1, 142/2A, 142-A, 142/1/2
        const validPattern = /^[0-9]+(\/[0-9]+[a-zA-Z]*)?(\/[0-9]+)?(-[a-zA-Z0-9]+)?$/;
        if (!survey) {
          results.push({
            id: `VAL-${doc.id}-${rule.id}`,
            documentId: doc.id,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            field: 'parcel.surveyNumber',
            message: 'Survey Number is required and cannot be blank.',
            expected: 'e.g. 142, 142/1, 142/2A',
            actual: 'Empty',
            status: 'FAIL',
            createdAt: now.toISOString(),
          });
        } else if (!validPattern.test(survey)) {
          results.push({
            id: `VAL-${doc.id}-${rule.id}`,
            documentId: doc.id,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            field: 'parcel.surveyNumber',
            message: `Survey Number format '${survey}' is irregular. Expected standard numeric or subdivision syntax.`,
            expected: 'e.g. 142 or 142/2A',
            actual: survey,
            status: 'FAIL',
            createdAt: now.toISOString(),
          });
        }
        break;
      }

      case 'RULE-04': {
        // Positive Plot Area Sanity
        const area = Number(record.parcel?.plotArea?.value);
        if (isNaN(area) || area <= 0) {
          results.push({
            id: `VAL-${doc.id}-${rule.id}`,
            documentId: doc.id,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            field: 'parcel.plotArea',
            message: `Plot area must be a strictly positive number. Found: ${record.parcel?.plotArea?.value}`,
            expected: '> 0.00',
            actual: String(record.parcel?.plotArea?.value),
            status: 'FAIL',
            createdAt: now.toISOString(),
          });
        }
        break;
      }

      case 'RULE-05': {
        // Standard Unit Verification
        const unit = String(record.parcel?.areaUnit?.value || '').trim();
        const validUnits = ['Acre', 'Hectare', 'Bigha', 'Guntha', 'Sq Ft', 'Sq M'];
        if (!validUnits.some((u) => u.toLowerCase() === unit.toLowerCase())) {
          results.push({
            id: `VAL-${doc.id}-${rule.id}`,
            documentId: doc.id,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            field: 'parcel.areaUnit',
            message: `Area unit '${unit}' is not recognized in standard revenue measurements.`,
            expected: validUnits.join(', '),
            actual: unit,
            status: 'FAIL',
            createdAt: now.toISOString(),
          });
        }
        break;
      }

      case 'RULE-07': {
        // Owner Share Range Check
        const owners = record.ownership?.owners || [];
        for (const [idx, owner] of owners.entries()) {
          const share = Number(owner.sharePercentage?.value);
          if (isNaN(share) || share <= 0 || share > 100) {
            results.push({
              id: `VAL-${doc.id}-${rule.id}-${idx}`,
              documentId: doc.id,
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              field: `ownership.owners[${idx}].sharePercentage`,
              message: `Owner ${owner.name?.value || 'Co-owner'} has an invalid share percentage (${share}%). Must be between 0.1% and 100%.`,
              expected: '0.1% - 100%',
              actual: `${share}%`,
              status: 'FAIL',
              createdAt: now.toISOString(),
            });
          }
        }
        break;
      }

      case 'RULE-08': {
        // Total Ownership Shares Equal 100%
        const owners = record.ownership?.owners || [];
        if (owners.length > 0) {
          const total = owners.reduce((sum, o) => sum + (Number(o.sharePercentage?.value) || 0), 0);
          if (Math.abs(total - 100) > 0.5) {
            results.push({
              id: `VAL-${doc.id}-${rule.id}`,
              documentId: doc.id,
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              field: 'ownership.totalSharePercentage',
              message: `Sum of co-owner shares is ${total.toFixed(1)}%. Total ownership shares must equal exactly 100%.`,
              expected: '100.0%',
              actual: `${total.toFixed(1)}%`,
              status: 'FAIL',
              createdAt: now.toISOString(),
            });
          }
        }
        break;
      }

      case 'RULE-09': {
        // Mutation Date Rationality
        const mutDateStr = record.mutation?.mutationDate?.value;
        if (mutDateStr) {
          const mutDate = new Date(mutDateStr);
          if (!isNaN(mutDate.getTime()) && mutDate > now) {
            results.push({
              id: `VAL-${doc.id}-${rule.id}`,
              documentId: doc.id,
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              field: 'mutation.mutationDate',
              message: `Mutation date (${mutDateStr}) cannot be in the future.`,
              expected: `<= ${now.toISOString().split('T')[0]}`,
              actual: mutDateStr,
              status: 'FAIL',
              createdAt: now.toISOString(),
            });
          }
        }
        break;
      }

      case 'RULE-10': {
        // Registration Date Rationality
        const regDateStr = record.registration?.registrationDate?.value;
        if (regDateStr) {
          const regDate = new Date(regDateStr);
          if (!isNaN(regDate.getTime()) && regDate > now) {
            results.push({
              id: `VAL-${doc.id}-${rule.id}`,
              documentId: doc.id,
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              field: 'registration.registrationDate',
              message: `Registration date (${regDateStr}) cannot be in the future.`,
              expected: `<= ${now.toISOString().split('T')[0]}`,
              actual: regDateStr,
              status: 'FAIL',
              createdAt: now.toISOString(),
            });
          }
        }
        break;
      }

      case 'RULE-14': {
        // Document Quality Threshold
        if (doc.qualityScore < 60) {
          results.push({
            id: `VAL-${doc.id}-${rule.id}`,
            documentId: doc.id,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            field: 'document.qualityScore',
            message: `Document optical scan quality (${doc.qualityScore}/100) is below acceptable threshold (60). Verification required.`,
            expected: '>= 60',
            actual: String(doc.qualityScore),
            status: 'FAIL',
            createdAt: now.toISOString(),
          });
        }
        break;
      }
    }
  }

  return results;
}
