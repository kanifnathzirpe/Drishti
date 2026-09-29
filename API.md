# DRISHTI REST API Documentation

All endpoints return structured responses with standard HTTP status codes.

## Authentication & Session
* `POST /api/auth/login` — Login with email
* `GET /api/me` — Get current user context
* `POST /api/auth/switch-demo` — Switch between active demo roles (Operator, Verifier, Supervisor, Official, Admin)

## Documents & Ingestion
* `GET /api/documents` — Query documents with filters (`status`, `batchId`, `state`, `district`, `village`, `search`, `page`, `limit`)
* `GET /api/documents/:id` — Get document record, extracted fields, validation results, and sync status
* `POST /api/documents` — Ingest new document with base64 payload and metadata
* `POST /api/documents/:id/process` — Execute multimodal Gemini extraction, validation, duplicate check, and confidence routing
* `POST /api/documents/:id/validate` — Re-evaluate 15 business rules and update confidence

## Human-in-the-Loop Verification
* `GET /api/verification/tasks` — List pending verification queue with SLA deadlines and error counts
* `POST /api/verification/tasks/:id/correct` — Update field value, record original vs new, and add to feedback dataset
* `POST /api/verification/tasks/:id/approve` — Approve document record
* `POST /api/verification/tasks/:id/reject` — Reject record with reason
* `POST /api/verification/tasks/:id/escalate` — Escalate record to Supervisor
* `POST /api/verification/tasks/:id/assign` — Assign task to specific verifier

## Dashboards & Analytics
* `GET /api/dashboard/operator` — Ingestion metrics, batches, language breakdown
* `GET /api/dashboard/verifier` — Assigned tasks, pending review count, SLA warnings
* `GET /api/dashboard/supervisor` — District progress, verifier utilization %, error hotspots
* `GET /api/dashboard/official` — State progress, auto-acceptance rates, DILRMP sync rates

## Cadastral GIS
* `GET /api/gis/parcels` — Returns Cadastral parcels and standard GeoJSON FeatureCollection

## National Integration
* `POST /api/integrations/lrms/sync` — Push approved record to DILRMP Gateway
* `GET /api/integrations/lrms/:id/status` — Query sync transaction status
* `GET /api/integrations/overview` — Gateway operational health and throughput

## Audit & Governance
* `GET /api/audit` — Query immutable audit trail
* `GET /api/feedback` — Summary of reviewer corrections
* `GET /api/feedback/export` — Export training dataset (`?format=json` or `?format=csv`)
* `GET /api/reports/summary` — High-level statistics
* `GET /api/reports/export-csv` — Export complete master registry CSV
* `GET /api/rules` — List validation rules
* `PATCH /api/rules/:id` — Toggle or update validation rule
