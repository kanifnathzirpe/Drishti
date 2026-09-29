# DRISHTI Security & Compliance

## Security Architecture

1. **Server-Side API Key Protection**:
   * The Gemini API key (`GEMINI_API_KEY`) is stored strictly in server-side environment variables and never exposed to the client or browser bundles.
   * Telemetry headers (`User-Agent: aistudio-build`) are set in all model calls.

2. **Role-Based Access Control (RBAC) & Scope Enforcement**:
   * Enforced on both frontend UI routing and backend REST API endpoints.
   * District and tehsil level scoping limits operator and verifier access to their authorized jurisdiction.

3. **Input Validation & Safe File Handling**:
   * 25MB file size limit enforced on document uploads.
   * Strict MIME type checking (PNG, JPG, JPEG, SVG, PDF, TIFF).
   * Request body limits configured in Express (`50mb` limit for high-resolution base64 document scans).

4. **Immutable Audit Trail**:
   * Every administrative, ingestion, verification, editing, approval, rejection, and sync operation is immutably logged with timestamp, user ID, role, and IP address.
   * Audit logs cannot be modified through the application UI.

5. **AI Safety & Non-Adjudication Notice**:
   * Assistive notice displayed across verification workspaces.
   * Adjudication of ownership remains under the statutory jurisdiction of revenue officers pursuant to Land Revenue Codes.
