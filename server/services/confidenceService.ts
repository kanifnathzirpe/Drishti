import { ValidationResult, DocumentRecord } from '../types.js';

export interface ConfidenceCalculation {
  overallConfidence: number;
  aiScore: number;
  validationScore: number;
  qualityScore: number;
  hasCriticalErrors: boolean;
  recommendedStatus: DocumentRecord['processingStatus'];
  recommendedWorkflow: DocumentRecord['workflowStatus'];
}

export function computeDocumentConfidence(
  aiConfidence: number,
  qualityScore: number,
  validationResults: ValidationResult[]
): ConfidenceCalculation {
  // Errors reduce validation score severely
  const errorCount = validationResults.filter((r) => r.severity === 'ERROR' && r.status === 'FAIL').length;
  const warningCount = validationResults.filter((r) => r.severity === 'WARNING' && r.status === 'FAIL').length;

  let validationScore = 100 - errorCount * 30 - warningCount * 10;
  if (validationScore < 0) validationScore = 0;

  // Weighted formulation:
  // finalConfidence = AIConfidence * 0.55 + ValidationScore * 0.25 + QualityScore * 0.20
  const rawConfidence = aiConfidence * 0.55 + validationScore * 0.25 + qualityScore * 0.2;
  const overallConfidence = Math.min(100, Math.max(10, Math.round(rawConfidence)));

  const hasCriticalErrors = errorCount > 0;

  let recommendedStatus: DocumentRecord['processingStatus'] = 'REVIEW_REQUIRED';
  let recommendedWorkflow: DocumentRecord['workflowStatus'] = 'IN_REVIEW';

  if (!hasCriticalErrors && overallConfidence >= 90) {
    recommendedStatus = 'APPROVED';
    recommendedWorkflow = 'AUTO_ACCEPTED';
  } else if (hasCriticalErrors) {
    recommendedStatus = 'REVIEW_REQUIRED';
    recommendedWorkflow = 'IN_REVIEW';
  } else {
    recommendedStatus = 'REVIEW_REQUIRED';
    recommendedWorkflow = 'IN_REVIEW';
  }

  return {
    overallConfidence,
    aiScore: aiConfidence,
    validationScore,
    qualityScore,
    hasCriticalErrors,
    recommendedStatus,
    recommendedWorkflow,
  };
}
