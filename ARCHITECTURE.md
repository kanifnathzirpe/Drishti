# DRISHTI Architecture Overview

## 1. High-Level System Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │                    React SPA Frontend                  │
                  │  - Tailwind CSS + High Contrast NIC / DoLR Theme       │
                  │  - Two-Panel Verification Workspace with Bounding Box   │
                  │  - Leaflet Cadastral GIS Parcel Visualizer             │
                  │  - Role-Based Dynamic Dashboards (5 Roles)             │
                  └──────────────────────────┬─────────────────────────────┘
                                             │ HTTP REST / JSON
                                             ▼
                  ┌────────────────────────────────────────────────────────┐
                  │                 Node.js / Express Backend              │
                  │  - Server-Side Multimodal Gemini Service (@google/genai)│
                  │  - 15-Rule Automated Validation Engine                 │
                  │  - Weighted Confidence & Routing Engine                │
                  │  - Exact Hash & Fuzzy Duplicate Detector               │
                  │  - Simulated National DILRMP REST Gateway Adapter      │
                  │  - Immutable Audit Logger & Training Loop Feedback     │
                  └──────────────────────────┬─────────────────────────────┘
                                             │ Persistent Storage
                                             ▼
                  ┌────────────────────────────────────────────────────────┐
                  │              JSON File Database Store                  │
                  │  - Atomic Sync to /data/drishti.json                   │
                  │  - Users, Documents, Batches, Extracted Records,       │
                  │    Validation Results, Audit Logs, GIS Parcels         │
                  └────────────────────────────────────────────────────────┘
```

## 2. Core Subsystems

### Ingestion & Preprocessing
* Ingests physical scans, PDF documents, and image formats (PNG, JPG, SVG, TIFF).
* Generates SHA-256 binary hash for instant duplicate upload detection.
* Captures administrative hierarchy (State, District, Tehsil, Village, LGD Master Directory codes).

### Gemini Multimodal AI Service
* Direct document analysis using `@google/genai` with model `gemini-3.8-flash`.
* Extracts structured JSON schema with per-field confidence scores and normalized bounding box coordinates `[ymin, xmin, ymax, xmax]`.
* Assesses blur, skew, contrast, and optical legibility (qualityScore 0-100).

### Validation & Confidence Engine
* Evaluates 15 business rules covering geographic consistency, survey regex syntax, area sanity, co-owner share summation (100%), and non-future transaction dates.
* Formulates weighted confidence:
  $$\text{Final Confidence} = (\text{AI Score} \times 0.55) + (\text{Validation Score} \times 0.25) + (\text{Quality Score} \times 0.20)$$
* Automatic routing: >= 90% and zero errors $\to$ `APPROVED` (Auto-accepted); otherwise $\to$ `REVIEW_REQUIRED`.

### Human-in-the-Loop Verification
* Synchronized side-by-side viewer with interactive bounding box highlighting.
* Verifier corrections trigger feedback records for the continuous learning loop and write to the immutable audit log.

### National DILRMP Integration Gateway Adapter
* Encapsulates transmission to the Central Digital India Land Records Modernization Programme.
* Manages transaction status (`PENDING` $\to$ `SYNCING` $\to$ `SYNCED` / `FAILED`), external record ID mapping, and retry attempts.
