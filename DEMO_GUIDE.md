# DRISHTI — End-to-End Walkthrough & Demonstration Guide

Follow this guide to demonstrate the complete lifecycle of a land record from physical ingestion to national DILRMP sync:

---

### Step 1: Login as Operator
1. In the top bar, ensure the active role is set to **Operator** (`Ramesh Patil`).
2. Click **"Upload Land Record"** in the top-right.
3. In the upload dialog, click **"Quick Demo Presets: Maharashtra 7/12 RoR (Marathi)"** or drag your own scan.
4. Verify metadata:
   - State: Maharashtra
   - District: Pune
   - Tehsil: Haveli
   - Village: Wagholi
   - Document Type: Record of Rights
   - Language: Marathi
5. Click **"Upload Document"**.
6. The Gemini multimodal AI extraction pipeline executes immediately:
   - OCR/HTR transcription of Devanagari text
   - Field extraction (Survey #142, Area 2.45 Acre, Owner Balasaheb Tukaram Jagtap)
   - 15-rule validation checks
   - Duplicate hash & fuzzy matching
   - Weighted confidence score calculation

---

### Step 2: Login as Verifier (Human-in-the-Loop Workspace)
1. Switch active role in top bar to **Verifier** (`Sunita Deshmukh`).
2. The Verification Queue lists pending records requiring officer verification.
3. Click **"Inspect & Verify"** on any document (e.g. `DOC-MH-2026-002` or the newly uploaded document).
4. **Inspect the Two-Panel Workspace**:
   - **Left Panel**: Scanned revenue sheet with zoom in, zoom out, and pan controls.
   - **Right Panel**: Extracted fields with individual confidence tags (Green >=90%, Amber 75-89%, Red <75%).
5. Click on any field (e.g., **Survey No** or **Owner Name**):
   - Notice the **amber bounding box highlight** instantly activates on the left document viewer!
6. Click the edit icon next to any field, update the value, add a note (e.g., *"Confirmed against Talathi register"*), and click **"Save & Log"**.
   - This records the correction into the **AI Training Feedback Dataset** and creates an immutable audit event.
7. Click **"Re-run Validation"**:
   - The validation engine re-evaluates all 15 business rules and updates document confidence dynamically.
8. Click **"Approve Record"**:
   - Status changes to **APPROVED** with verifier timestamp.
9. Click **"Sync to DILRMP"**:
   - The National DILRMP Gateway dialog opens with simulated endpoint `https://dilrmp.nic.in/api/v2/records`.
   - Click **"Push to DILRMP"**.
   - Live transmission occurs, returning an external record ID (e.g., `DILRMP-MH-142-2026`) and acknowledgment token. Status changes to **SYNCED**.

---

### Step 3: Login as Supervisor
1. Switch active role to **Supervisor** (`Anand Kulkarni, SDM`).
2. Observe real-time updates:
   - Pending verification count decreases
   - Approved count increases
   - Verifier team utilization and SLA metrics reflect the completed task
   - Error hotspots ranking displays top triggered validation rules

---

### Step 4: Login as Official
1. Switch active role to **State / Central Official** (`Dr. Meera Iyer, IAS`).
2. View national overview metrics:
   - Auto-acceptance rate
   - Completion rate
   - National DILRMP synchronization rate
3. Inspect the **Cadastral GIS Map**:
   - Leaflet interactive map displays verified land parcels layered on cadastral grids.
   - Clicking on any parcel opens survey number, registered owner, area, and link to inspect the source document.
4. Export official reports via **"Export Master CSV Report"**.

---

### Step 5: Login as Admin
1. Switch active role to **System Admin** (`Rajesh Varma, NIC`).
2. Inspect the **Immutable Audit Trail**:
   - Every single action performed during the demo (`LOGIN`, `UPLOAD`, `PROCESS_COMPLETED`, `FIELD_EDITED`, `APPROVED`, `SYNC_COMPLETED`) is recorded with timestamp, user ID, role, and IP.
3. Inspect the **Validation Rule Engine**:
   - Toggle rules on/off or change severity.
4. Inspect the **AI Learning Loop**:
   - Download the reviewer corrections dataset as JSON or CSV for model retraining.
