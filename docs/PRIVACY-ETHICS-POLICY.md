# Toubkal Browser — Privacy & Ethics Policy

**Version:** 1.0  
**Effective Date:** 2025-10-18  
**Last Updated:** 2025-10-18  
**Owner:** Ilyass Motya  
**Scope:** All Toubkal Browser users, contributors, and integrators

---

## Executive Summary

Toubkal's privacy model is not aspirational—it is **mathematically verifiable**. Every data flow is cryptographically signed (Ed25519), every AI operation requires explicit consent, and every claim is auditable by independent third parties. We don't ask users to trust us; we give them the tools to **verify** us.

**Core Commitment:**

> "AI that works for you, not on your data."

This policy defines how Toubkal handles user data, ensures consent, proves privacy cryptographically, and upholds ethical AI principles.

---

## 1. Foundational Privacy Principles

### 1.1 Zero Telemetry by Default

**Policy**: Toubkal collects **zero usage data** without explicit opt-in.

**Implementation**:

- No analytics, crash reports, or usage statistics sent by default
- No device fingerprinting or tracking identifiers
- No "phone home" connections to Toubkal servers
- Opt-in telemetry requires clear explanation and separate consent

**Verification**:

- Network traffic monitoring on fresh install shows zero outbound connections (except user-initiated browsing)
- Open-source codebase allows community verification
- Quarterly third-party network audits published publicly

**User Control**:

- Settings → Privacy → Telemetry: **OFF by default**
- If enabled: "Help improve Toubkal by sharing anonymous usage data"
  - Data shared: Feature usage counts, crash reports, performance metrics
  - Data NOT shared: Browsing history, page content, search queries, personal identifiers
  - All telemetry data is aggregated and anonymized before leaving device

---

### 1.2 Local-First AI (No Cloud by Default)

**Policy**: All AI operations run **on-device** unless explicit per-request consent is given for cloud inference.

**Implementation**:

- Primary AI: Ollama (localhost:11434) — no external network access
- Fallback AI: Transformers.js (WebGPU in-browser) — zero external dependencies
- Cloud AI (OpenAI, Anthropic, Gemini): **Disabled by default**, requires consent banner before every request

**Verification**:

- Network monitoring shows zero AI-related external requests during local inference
- Audit logs (Ed25519-signed) record every AI operation with source (local/cloud)
- Transparency Dashboard displays real-time AI data flows

**User Control**:

- Settings → AI → Inference Mode:
  - **Local Only** (default): All AI queries processed on-device
  - **Hybrid**: Local-first, prompt for cloud fallback if needed
  - **Cloud Allowed**: User pre-approves specific cloud providers (still logs each request)

---

### 1.3 Universal Consent Fabric

**Policy**: Every operation that processes user data (AI, cloud APIs, MCP tools, extensions) requires **explicit, informed, revocable consent**.

**Consent Requirements**:

- **Per-request consent**: User approves each sensitive operation individually
- **Informed disclosure**: Exactly what data is accessed/sent is shown in plain language
- **Granular control**: Allow once / Allow for session / Allow for workspace / Always allow / Never allow
- **Cryptographically signed**: Every consent decision is Ed25519-signed and stored immutably
- **Exportable**: Users can export their entire consent history as JSON/CSV

**Implementation**:

- Consent banner appears before:
  - Cloud AI requests (shows prompt + page content being sent)
  - MCP tool invocations (shows tool name + data accessed)
  - Extension permissions (shows capabilities requested)
- Consent decisions stored in LevelDB with Ed25519 signatures
- Revocation: User can revoke consent at any time (future operations blocked)

**User Control**:

- Settings → Privacy → Consent History
  - View all consent decisions (date, action, data disclosed, decision)
  - Revoke past consent (applies to future actions)
  - Export consent log (JSON/CSV/PDF)

---

### 1.4 Cryptographic Auditability

**Policy**: Every browser operation (AI query, network request, MCP tool call, consent decision) is cryptographically logged with Ed25519 signatures and Merkle-tree integrity verification.

**Implementation**:

- **Ed25519 signing**: Each audit event is signed with private key (user holds key)
- **Merkle tree**: Audit log is organized as Merkle tree (tamper detection)
- **LevelDB storage**: Local-only storage, never synced to cloud without explicit consent
- **Public key verification**: Anyone with public key can verify log authenticity

**Audit Log Contents**:

```
{
  "event_id": "uuid",
  "timestamp": "2025-10-18T02:15:00Z",
  "event_type": "AI_QUERY_LOCAL",
  "details": {
    "prompt": "Summarize this page",
    "page_url": "https://example.com",
    "model": "llama-3.2-3b",
    "inference_time_ms": 1850,
    "tokens_generated": 247
  },
  "consent_id": "uuid (if applicable)",
  "signature": "ed25519_signature_base64",
  "merkle_proof": ["hash1", "hash2", "root_hash"]
}
```

**Verification**:

- User can export audit log and verify signatures independently
- Merkle root hash displayed in Transparency Dashboard
- Third parties can audit without accessing sensitive data (only verify signatures)

**User Control**:

- Settings → Privacy → Transparency Dashboard
  - View real-time audit log (last 1000 events)
  - Export audit log (JSON/CSV/PDF)
  - Verify log integrity (re-compute Merkle root)

---

### 1.5 Data Minimization

**Policy**: Toubkal collects, processes, and stores the **absolute minimum** data necessary for functionality.

**Implementation**:

- **No persistent identifiers**: No device IDs, advertising IDs, or tracking cookies
- **Ephemeral sessions**: AI conversation history deleted on browser close (unless user enables workspace persistence)
- **Local storage only**: Bookmarks, history, settings stored locally (never synced without consent)
- **Automatic cleanup**: Audit logs older than 90 days auto-archived (user-configurable)

**Data Retention**:
| Data Type | Retention | User Control |
|-----------|-----------|--------------|
| Browsing history | Until user clears | Settings → Privacy → Clear Data |
| AI conversation history | Session-only (default) or workspace-persistent (opt-in) | Settings → AI → Workspace Memory |
| Audit logs | 90 days (configurable: 30/60/90/180/365/forever) | Settings → Privacy → Audit Log Retention |
| Consent records | Forever (unless revoked) | Settings → Privacy → Consent History |
| Crash reports | Never sent (unless telemetry enabled) | Settings → Privacy → Telemetry |

---

## 2. AI Ethics Principles

### 2.1 User Sovereignty Over AI

**Policy**: Users **own and control** their AI interactions. No AI training on user data without explicit consent.

**Implementation**:

- AI queries never leave device (local-first)
- Cloud AI providers (if used) bound by "no training" agreements:
  - OpenAI: Zero-retention API mode
  - Anthropic: No training on user data
  - Gemini: No training on user data
- On-device fine-tuning (future): LoRA/QLoRA diffs stay local unless user explicitly shares

**Verification**:

- Contracts with cloud providers published publicly
- Audit logs show which provider was used for each query
- Transparency Dashboard displays "Training: No" for all AI requests

---

### 2.2 Bias Mitigation & Transparency

**Policy**: Toubkal acknowledges that all AI models have biases. We commit to transparency about model limitations and provide tools for users to detect bias.

**Implementation**:

- Model cards displayed in Settings → AI → Models (shows training data, known biases)
- BYOM (Bring Your Own Model): Users can choose models aligned with their values
- Bias detection (future): Highlight potentially biased AI responses for user review

**User Control**:

- Settings → AI → Model Selection: Choose between different models (Llama, Mistral, CodeLlama, custom)
- Model provenance: Every AI response shows which model generated it

---

### 2.3 Consent for Agentic AI

**Policy**: AI cannot take autonomous actions without explicit user consent for each action.

**Implementation**:

- MCP tool invocations require consent: "Allow AI to close tabs?" (shows affected tabs)
- No "auto-pilot" mode: AI suggests actions, user approves
- Workspace isolation: AI cannot access data from other workspaces without consent

**Example**:

```
User: "Find all PDFs in my downloads and organize them"

AI: "I need to:
  1. Access filesystem (MCP tool: filesystem.list)
  2. Read file metadata
  3. Create folders and move files

Approve these actions?"

[Approve All] [Approve Individually] [Deny]
```

---

## 3. User Data Handling

### 3.1 What Data Toubkal Collects

**Locally Stored (Never Leaves Device by Default)**:

- Browsing history (URLs, visit times)
- Bookmarks (folders, tags, URLs)
- Settings and preferences
- AI conversation history (workspace-specific, opt-in persistence)
- Audit logs (cryptographically signed)
- Consent records (cryptographically signed)
- Downloaded files metadata

**Never Collected**:

- Geolocation (unless explicitly requested by website with consent)
- Microphone/camera access (unless explicitly requested by website with consent)
- Clipboard contents (except when user pastes)
- Keystrokes or form data (except in-page autofill, local-only)

**Optionally Sent (Opt-In Only)**:

- Telemetry (anonymous usage statistics, crash reports)
- Cloud AI queries (prompt + page content, only with per-request consent)
- Sync data (encrypted bookmarks, settings, if user enables sync)

---

### 3.2 Third-Party Data Sharing

**Policy**: Toubkal **never sells or shares** user data with third parties.

**Exceptions (All Require Explicit Consent)**:

- **Cloud AI providers**: If user approves cloud inference, prompt + context sent to OpenAI/Anthropic/Gemini
  - Data encrypted in transit (TLS 1.3)
  - Bound by no-training agreements
  - Logged in audit trail with provider name
- **MCP servers**: If user approves tool invocation, necessary data sent to MCP server
  - Community servers: Privacy label shown before install (🟢 Local / 🟡 Network / 🟠 Remote API)
  - Sandboxed execution (separate process, limited permissions)
  - Logged in audit trail with tool name + data accessed

---

### 3.3 User Rights (GDPR/CCPA Compliant)

| Right                            | How to Exercise                                                |
| -------------------------------- | -------------------------------------------------------------- |
| **Right to Access**              | Settings → Privacy → Export Data (JSON/CSV)                    |
| **Right to Deletion**            | Settings → Privacy → Clear All Data + Uninstall                |
| **Right to Portability**         | Settings → Privacy → Export Data (portable JSON format)        |
| **Right to Rectification**       | Settings → Edit bookmarks, history, preferences                |
| **Right to Restrict Processing** | Settings → AI → Disable AI Features                            |
| **Right to Object**              | Settings → Privacy → Disable Telemetry (always off by default) |
| **Right to Revoke Consent**      | Settings → Privacy → Consent History → Revoke                  |

**Data Export Format**:

```
{
  "export_version": "1.0",
  "export_date": "2025-10-18T02:20:00Z",
  "user_id": "uuid (local-only)",
  "data": {
    "bookmarks": [...],
    "history": [...],
    "settings": {...},
    "audit_logs": [...],
    "consent_records": [...]
  },
  "signature": "ed25519_signature_base64"
}
```

---

## 4. Security & Compliance

### 4.1 Data Encryption

| Data at Rest           | Encryption                                                |
| ---------------------- | --------------------------------------------------------- |
| Audit logs             | AES-256-GCM (encrypted with user-derived key)             |
| Consent records        | AES-256-GCM                                               |
| Sync data (if enabled) | End-to-end encrypted (user holds private key)             |
| Browsing history       | Plain (local filesystem, OS-level encryption recommended) |

| Data in Transit         | Encryption      |
| ----------------------- | --------------- |
| Cloud AI requests       | TLS 1.3 (HTTPS) |
| MCP tool calls (remote) | TLS 1.3 (HTTPS) |
| Update checks           | TLS 1.3 (HTTPS) |

---

### 4.2 Compliance

**GDPR (General Data Protection Regulation)**:

- ✅ Data minimization (Art. 5)
- ✅ Consent requirements (Art. 7)
- ✅ Right to access (Art. 15)
- ✅ Right to erasure (Art. 17)
- ✅ Data portability (Art. 20)
- ✅ Privacy by design (Art. 25)

**CCPA (California Consumer Privacy Act)**:

- ✅ Disclosure of data collection
- ✅ Right to opt-out
- ✅ Right to deletion
- ✅ No sale of personal data

**HIPAA (Healthcare)**:

- ⚠️ Toubkal is not HIPAA-certified (future roadmap for enterprise deployments)

**SOC 2 (Security)**:

- ⚠️ Roadmap for enterprise: SOC 2 Type II audit by Q2 2026

---

## 5. MCP Server Privacy

### 5.1 Community MCP Server Guidelines

**Privacy Labels** (Displayed Before Install):

- 🟢 **Local Only**: Server never makes external network requests
- 🟡 **Network Access**: Server may make external requests (e.g., GitHub API)
- 🟠 **Remote API**: Server sends data to third-party service (e.g., Slack, email)

**Vetting Process**:

1. Community submits MCP server to Toubkal MCP Store
2. Automated scan: Static analysis for network calls, file access, credentials
3. Manual review: Code audit by Toubkal security team
4. Privacy label assigned based on behavior
5. Published with privacy label + audit report

**User Control**:

- Settings → MCP Servers → [Server Name]
  - View privacy label
  - View permissions requested
  - View audit report (if available)
  - Enable/disable server
  - Revoke consent for past tool invocations

---

## 6. Children's Privacy (COPPA Compliance)

**Policy**: Toubkal does not knowingly collect data from children under 13.

**Implementation**:

- No age verification required (Toubkal collects no personal data by default)
- Parents: Enable parental controls via OS-level restrictions (Windows Family Safety, macOS Screen Time)
- AI content filtering (future): Optional filter for age-appropriate AI responses

---

## 7. Policy Updates

**Notification**: Users notified of privacy policy changes via:

- In-browser notification on next launch
- Email (if user opted into telemetry with email provided)
- Public announcement on toubkal.app/privacy

**Version History**: All past versions archived at toubkal.app/privacy/archive

**User Consent**: Material changes require re-consent (e.g., new data collection category)

---

## 8. Contact & Transparency

**Privacy Questions**: privacy@toubkal.app  
**Security Issues**: security@toubkal.app (PGP key: [link])  
**Data Requests**: Legal team (GDPR/CCPA requests): legal@toubkal.app

**Transparency Reports**: Published quarterly at toubkal.app/transparency

- Number of users (aggregate, opt-in telemetry)
- Number of third-party data requests (law enforcement, GDPR)
- Number of security incidents (if any)
- Audit findings (third-party pen-tests, network audits)

---

## 9. Ethical AI Commitments

1. **No Surveillance Capitalism**: Toubkal will never monetize user data or attention
2. **No Dark Patterns**: UI will never manipulate users into less-private choices
3. **Open Source**: Core privacy mechanisms are auditable by anyone
4. **No Vendor Lock-In**: Users can export all data and switch browsers anytime
5. **Local-First Forever**: We will never deprecate local AI in favor of cloud-only

---

**Last Updated**: 2025-10-18  
**Next Review**: 2025-11-18 (monthly review during MVP phase)

```

***
```
