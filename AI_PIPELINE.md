# DRISHTI Multimodal AI Extraction Pipeline

## Overview
DRISHTI uses Google Gemini (`gemini-3.8-flash`) through the official `@google/genai` TypeScript SDK on the server-side to analyze scanned physical land records and extract structured revenue data.

## Pipeline Sequence

```
1. Document Upload (Base64 Scanned Document Image or PDF)
         │
         ▼
2. Binary Hash & Duplicate Pre-Check (SHA-256)
         │
         ▼
3. Server-Side Multimodal Analysis via @google/genai
   - Model: 'gemini-3.8-flash'
   - Telemetry Header: 'User-Agent': 'aistudio-build'
   - Context: State, District, Tehsil, Village, Document Type, Language
         │
         ▼
4. Structured JSON Parsing & Schema Normalization
   - Extracts: Location, Survey/Khasra/Khata, Area, Co-owners & Shares,
               Classification, Mutation (Ferfar) records, Registration
   - Per-field confidence (0-100) & normalized bounding boxes [ymin, xmin, ymax, xmax]
   - Optical qualityScore (0-100) evaluating blur, contrast, skew, legibility
         │
         ▼
5. Automated Business Validation Engine (15 Rules)
   - Mandatory attributes
   - Survey syntax regex pattern
   - Positive area sanity
   - Sum of co-owner shares == 100%
   - Date rationality (mutation & registration dates cannot be in the future)
   - LGD directory consistency
         │
         ▼
6. Weighted Confidence Scoring & Decision Routing
   - finalConfidence = (AI * 0.55) + (Validation * 0.25) + (Quality * 0.20)
   - If critical error exists -> REVIEW_REQUIRED
   - If finalConfidence >= 90 and zero errors -> APPROVED (Auto-Accepted)
   - Otherwise -> REVIEW_REQUIRED
         │
         ▼
7. Human-in-the-Loop Feedback Learning Loop
   - When verifiers correct a field, original value, corrected value,
     language, and notes are captured in feedback_records.
   - Exportable for fine-tuning via GET /api/feedback/export.
```

## AI Safety & Statutory Boundaries
* **Legal Adjudication Disclaimer**: AI extraction is strictly assistive. Legal determination of land ownership remains the statutory prerogative of authorized revenue officers.
* **No Value Fabrication**: The prompt strictly instructs the model to return null/empty when text is unreadable or obscured by revenue seals.
