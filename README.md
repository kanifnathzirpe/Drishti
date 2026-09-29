# DRISHTI — Intelligent Land Record Digitization and Validation System
### Problem Statement ID 26018 • Department of Land Resources (DoLR) • Ministry of Rural Development (MoRD)

DRISHTI is an end-to-end, full-stack intelligent land record digitization, multilingual OCR/HTR extraction, rule validation, human verification, and national DILRMP synchronization system.

---

## Key Features

1. **Multimodal Multilingual OCR/HTR Engine**: Direct document analysis using Google Gemini (`gemini-3.8-flash`) extracting structured Record of Rights (7/12, Khasra-Khatauni, Mutation Registers, Sale Deeds) across Marathi, Hindi, English, and Gujarati.
2. **Automated 15-Rule Validation Engine**: Automated checks for mandatory fields, survey pattern syntax, positive area sanity, co-owner share summation (100%), non-future mutation dates, and LGD code hierarchy.
3. **Confidence Scoring & Routing**: Computes weighted confidence `(AI * 0.55 + Validation * 0.25 + Quality * 0.20)`. Auto-accepts >= 90% confidence with zero errors; routes low-confidence and error-flagged records to verification queue.
4. **Two-Panel Verification Workspace**: Side-by-side original scanned document viewer (with pan, zoom, and bounding box highlight overlays) and field editor with original vs corrected value tracking.
5. **Continuous Learning Loop**: Reviewer corrections are captured into a feedback repository and exportable as fine-tuning datasets (JSON/CSV).
6. **National LRMS / DILRMP Integration Gateway**: Simulated REST adapter supporting record transmission, external record ID generation, and retry logic.
7. **Cadastral GIS Map**: Interactive Leaflet map displaying digitized parcels, survey boundaries, owner attribution, and verification status.
8. **Role-Based Access Control (RBAC)**: Tailored dashboards for Operator, Verifier, Supervisor, State/Central Official, and Admin.
9. **Immutable Audit Trail**: Cryptographic-style logging of every ingestion, edit, approval, rejection, and sync operation.

---

## Demo Roles & Logins

Switch active roles instantly from the header menu or use:
* **Operator**: `operator@drishti.demo` (Ramesh Patil • Haveli Tehsil, Pune)
* **Verifier**: `verifier@drishti.demo` (Sunita Deshmukh • Pune District)
* **Supervisor**: `supervisor@drishti.demo` (Anand Kulkarni, SDM • Pune Division)
* **Official**: `official@drishti.demo` (Dr. Meera Iyer, IAS • Maharashtra DoLR)
* **Admin**: `admin@drishti.demo` (Rajesh Varma, NIC • Central System Admin)

---

## Installation & Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (copy .env.example)
cp .env.example .env
# Provide GEMINI_API_KEY for real Gemini multimodal extraction

# 3. Start development server (Port 3000)
npm run dev

# 4. Build for production
npm run build
npm start
```
