# Toubkal Browser Product Roadmap

**Version:** 2.0
**Last Updated:** 2025-10-18
**Owner:** Ilyass Motya
**Status:** Active Development
**Revision**: Major timeline adjustment based on implementation analysis

---

## Vision

Transform the browser from a passive content viewer into an **AI-augmented workspace** with mathematically provable privacy, local-first intelligence, and user sovereignty.

**Tagline:** _"The intelligent browser that protects your mind."_

---

## Release Strategy

| Release                             | Target Date           | Status      | Goal                                     |
| ----------------------------------- | --------------------- | ----------- | ---------------------------------------- |
| **Phase 0: Infrastructure**         | Week 0 (Oct 2025)     | ✅ Complete | CI/CD, testing, docs, TypeScript/React   |
| **Phase 0.5: Foundation Prep**      | Week 1-4 (Nov 2025)   | 🔵 Active   | Real audit trail + ad blocking           |
| **Phase 1: Privacy Foundation**     | Week 5-12 (Dec 2025)  | 🟡 Planning | Trust & Privacy baseline (extended)      |
| **Phase 2: Local AI Platform**      | Week 13-20 (Feb 2026) | ⚪ Planned  | Intelligence without compromise          |
| **Phase 3: Ecosystem & Enterprise** | Week 21-28 (Apr 2026) | ⚪ Planned  | Scale & adoption                         |
| **Alpha Release**                   | Week 20 (Feb 2026)    | ⚪ Planned  | Public testing (10K users)               |
| **Beta Release**                    | Week 28 (Apr 2026)    | ⚪ Planned  | Production-ready (100K users)            |
| **Stable 1.0**                      | Week 36 (Jun 2026)    | ⚪ Planned  | General availability                     |

---

## Phase 0: Infrastructure (Week 0) — ✅ COMPLETE

**Status**: Complete as of 2025-10-18

### Completed Deliverables

- ✅ **Repository Setup**: Git initialized, `.gitignore`, npm/pnpm configuration
- ✅ **TypeScript/React Foundation**: Strict mode, ES2022 target, React 19, Tailwind CSS 4
- ✅ **Testing Infrastructure**: Vitest framework, JSDOM environment, 80% coverage enforcement
- ✅ **Code Quality Tools**: ESLint 9.15, Prettier 3.3.3, Husky 9.1.6 with lint-staged
- ✅ **GitHub Actions CI/CD**: Multi-platform testing (Linux/macOS/Windows), security scanning
- ✅ **Documentation Structure**: PRD, Architecture docs, ADRs, Contributing guidelines
- ✅ **Privacy Component Stubs**: `TelemetryManager`, `PrivacyDashboard`, `ConsentPrompt` (TypeScript/React)
- ✅ **Type System**: Comprehensive TypeScript types for telemetry, audit, consent

### Lessons Learned

- **Strength**: World-class documentation and CI/CD foundation
- **Gap**: TypeScript stubs ≠ production-ready privacy enforcement
- **Reality**: Need C++ Chromium integration for all core privacy features

---

## Phase 0.5: Foundation Prerequisites (Weeks 1-4) — Real Privacy Implementation

**Goal**: Replace TypeScript mocks with production-grade C++ implementations. Chromium fork managed by user.

**Status**: 🔵 Active Development
**Start Date**: 2025-10-19 (Week 1)
**End Date**: 2025-11-15 (Week 4)

### Core Deliverables

#### Week 1-2: Real Audit Trail (C++)
**Owner**: Ilyass (Chromium fork preparation handled separately)

- ✅ **BoringSSL Integration** (C++)
  - Replace mock Ed25519 signatures with real BoringSSL signing
  - Generate keypairs on first run (store in LevelDB)
  - Implement `AuditLogger::SignEntry()` using FIPS 140-2/3 validated crypto
  - **File**: `src/toubkal/components/privacy/audit/audit_logger.cc`

- ✅ **Merkle Tree Implementation** (C++)
  - Build Merkle tree from audit entries (SHA-256 hashing)
  - Implement `AuditLogger::VerifyChain()` for integrity checks
  - Export Merkle proofs (JSON format)
  - **File**: `src/toubkal/components/privacy/audit/merkle_tree.cc`

- ✅ **LevelDB Persistence**
  - Replace in-memory arrays with LevelDB storage
  - Schema: `audit/{timestamp}` → `{entry: {...}, signature: "..."}`
  - Implement export functionality (JSON/CSV/PDF)
  - **File**: `src/toubkal/components/privacy/audit/audit_storage.cc`

**Success Criteria**:
- Audit trail signatures verify with `openssl dgst -sha256 -verify public.pem -signature sig.bin entry.json`
- 100% of privacy operations logged to LevelDB with Ed25519 signatures
- Merkle root hash verifies entire audit chain (tamper detection working)

---

#### Week 3-4: Ad Blocking MVP (C++)
**Owner**: Team

- ✅ **Brave's adblock-rust Integration**
  - Add `adblock-rust` as dependency in `DEPS`
  - Wrap in C++ `AdBlockingService` class
  - Implement `ShouldBlockRequest(url, resource_type)` method
  - **File**: `src/toubkal/components/privacy/ad_blocking/ad_blocking_service.cc`

- ✅ **EasyList + uBlock Origin Filters**
  - Download EasyList, uBlock Origin filters on startup
  - Parse filter lists using adblock-rust
  - Implement CNAME uncloaking (aggressive mode)
  - **File**: `src/toubkal/components/privacy/ad_blocking/filter_manager.cc`

- ✅ **Audit Logging Integration**
  - Log every blocked request to audit trail (with Ed25519 signature)
  - Generate cryptographic proof of blocking
  - Expose to UI via Mojo IPC
  - **File**: `src/toubkal/mojo/privacy/ad_blocking.mojom`

**Success Criteria**:
- Block 95%+ ads on top 100 sites (automated test suite vs. Brave baseline)
- All blocked requests logged to audit trail with cryptographic proof
- <5ms per-request latency (async CNAME resolution)
- Pass YouTube ad blocking tests (90-95% pre-roll/mid-roll blocked)

---

### Key Milestones

| Week   | Milestone                       | Deliverable                                                                 |
| ------ | ------------------------------- | --------------------------------------------------------------------------- |
| Week 1 | BoringSSL Ed25519 integration   | Real cryptographic signing working, LevelDB storage functional              |
| Week 2 | Merkle tree verification        | Tamper-proof audit chain, exportable Merkle proofs (JSON)                   |
| Week 3 | Ad blocking service (adblock-rust) | `ShouldBlockRequest()` working, EasyList filters loaded                  |
| Week 4 | Ad blocking audit integration   | All blocked requests logged with Ed25519 signatures, Mojo IPC to UI working |

---

### Success Criteria

- ✅ All audit entries signed with real Ed25519 signatures (verifiable with OpenSSL)
- ✅ Merkle tree integrity verification detects tampered logs
- ✅ LevelDB storage persists audit trail across browser restarts
- ✅ Ad blocking matches or exceeds Brave on top 100 sites (95%+ block rate)
- ✅ <5ms ad blocking latency (async resolution)
- ✅ 100% audit coverage for blocked requests

---

### Out of Scope (Phase 0.5)

- ❌ Chromium fork synchronization (user-managed, prerequisite for Phase 1)
- ❌ GN + Siso build system (Phase 1, Week 5-6)
- ❌ Browser UI branding (`toubkal://` scheme, internal pages)
- ❌ Consent fabric UI (Phase 1, Week 7-8)
- ❌ SLSA Level 3 builds (Phase 1, Week 11-12)
- ❌ AI features (Phase 2)
- ❌ MCP integration (Phase 2)

---

### Notes

**Chromium Fork**: User (Ilyass) manages Chromium fork setup separately. Phase 1 assumes fork is synchronized and buildable.

**Why Phase 0.5 Exists**:
- Original Phase 1 assumed mocks → real implementations could happen in parallel
- Reality: Need production-grade privacy before browser UI/branding
- This phase ensures "cryptographically provable privacy" promise is deliverable

---

## Phase 1: Privacy Foundation (Weeks 5-12) — Trust & Privacy Baseline

**Goal**: Establish cryptographically verifiable privacy, zero-telemetry baseline, and Toubkal brand identity.

**Status**: 🟡 Planning
**Start Date**: 2025-11-16 (Week 5)
**End Date**: 2026-01-10 (Week 12)
**Prerequisites**: ✅ Phase 0.5 complete, ✅ Chromium fork synchronized by user

### Core Deliverables

#### Week 5-6: GN + Siso Build System & Brand Identity

- ✅ **GN Build Configuration**
  - Create root `BUILD.gn` and `src/toubkal/BUILD.gn`
  - Configure Siso with Ninja fallback (per ADR-005)
  - Test builds on all platforms (Linux, macOS, Windows)
  - Document build instructions (`docs/contributing/build-instructions.md`)

- ✅ **Brand Identity Implementation**
  - Custom `toubkal://` URL scheme registration
  - Redirect `chrome://` → `toubkal://` (auto-redirect for compatibility)
  - Rebrand internal pages (Settings, About, Version)
  - Create `toubkal://audit` (Transparency Dashboard skeleton)
  - Create `toubkal://consent` (Consent history viewer skeleton)

**Success Criteria**:
- `gn gen out/Debug && autoninja -C out/Debug toubkal` produces launchable browser
- Browser window displays "Toubkal Browser" (not "Chromium")
- `toubkal://settings` accessible (rebranded settings page)
- Build instructions verified on all platforms (Linux, macOS, Windows)

---

#### Week 7-8: Consent Fabric (C++ Browser-Level Enforcement)

- ✅ **Consent Manager (C++)**
  - Implement `ConsentManager::RequestConsent(action_type, data_disclosure)`
  - Store consent decisions in LevelDB
  - Enforce consent before network requests (Chromium network service integration)
  - **File**: `src/toubkal/components/privacy/consent/consent_manager.cc`

- ✅ **Mojo IPC Interfaces**
  - Define `.mojom` interfaces for consent requests
  - Implement `ConsentManagerInterface` for renderer processes
  - Visual consent banners (React components call Mojo)
  - **File**: `src/toubkal/mojo/privacy/consent.mojom`

- ✅ **Consent Audit Logging**
  - Log all consent decisions to audit trail (with Ed25519 signatures)
  - Export consent history (JSON/CSV/PDF)
  - Implement "Consent Snapshots" for rewind/audit

**Success Criteria**:
- All cloud AI/network requests blocked until user grants consent
- Consent decisions persist across browser restarts (LevelDB)
- Consent banners show accurate data disclosure (100% accuracy via automated tests)
- All consent decisions Ed25519-signed and logged to audit trail

---

#### Week 9-10: Transparency Dashboard (Real-Time)

- ✅ **Real-Time Operation Log Viewer**
  - React dashboard showing live audit log stream
  - Filter by operation type (AI query, network call, plugin action)
  - Search and pagination (handle 10K+ log entries)
  - **File**: `src/toubkal/app/pages/TransparencyDashboard/`

- ✅ **Audit Export Functionality**
  - Export as JSON, CSV, PDF (user-selectable format)
  - Merkle proof verification report included
  - Signature verification status for all entries
  - **File**: `src/toubkal/components/privacy/audit/audit_exporter.cc`

- ✅ **Forensic Replay Mode**
  - Step-through analysis of any operation
  - Visual timeline of data flows
  - Export compliance reports (GDPR, HIPAA, SOC 2)

**Success Criteria**:
- Dashboard displays 100% of privacy operations (no missing events)
- Export includes Merkle proofs and signature verification report
- Forensic replay shows complete data flow for any operation
- <100ms UI latency for log streaming (10K+ entries)

---

#### Week 11-12: SLSA Level 3 & Integration Testing

- ✅ **Reproducible Builds**
  - Configure SLSA Level 3 attestations
  - Generate CycloneDX SBOM (all dependencies tracked)
  - Implement Cosign signing for releases
  - Rekor transparency log integration
  - **File**: `build/slsa/attestation.py`

- ✅ **End-to-End Testing (Playwright)**
  - Add Playwright for browser automation tests
  - Test consent workflows end-to-end
  - Validate ad blocking in real browsing scenarios
  - Automate "1-hour browsing session" for telemetry verification
  - **Directory**: `tests/e2e/`

- ✅ **Performance Baselines**
  - Speedometer 3.0 benchmark (page load time)
  - Battery usage (4-hour reference workload)
  - RAM usage (10 tabs, 5 frozen)
  - Cold start time (launch to usable browser)
  - **File**: `tests/performance/baselines.json`

- ✅ **Enterprise Outreach Launch**
  - Identify 10-15 target enterprises (legal, journalism, healthcare)
  - Create pilot program materials (compliance docs, deployment guides)
  - Send outreach emails (LOI/POC requests)
  - Schedule demos for Q1 2026
  - **Goal**: 5+ LOIs by end of Phase 1

**Success Criteria**:
- Zero unsanctioned network requests (verified via Wireshark + DevTools)
- 100% audit coverage for all operations (automated test validation)
- Pass Panopticlick fingerprinting tests (>12 bits entropy reduction)
- Builds reproducible on Linux, macOS, Windows (identical checksums)
- <10s first-run experience
- SLSA Level 3 provenance for all artifacts
- E2E tests passing (80%+ code coverage maintained)
- Performance baselines documented for future optimization comparisons

---

### Key Milestones

| Week    | Milestone                   | Deliverable                                                      |
| ------- | --------------------------- | ---------------------------------------------------------------- |
| Week 5  | GN build system working     | `autoninja toubkal` produces launchable browser                  |
| Week 6  | Brand identity complete     | `toubkal://` scheme working, internal pages rebranded            |
| Week 7  | Consent fabric (C++)        | Browser-level consent enforcement before network requests        |
| Week 8  | Consent audit integration   | All decisions Ed25519-signed, LevelDB persistence                |
| Week 9  | Transparency dashboard live | Real-time audit log viewer with export (JSON/CSV/PDF)            |
| Week 10 | Forensic replay working     | Step-through analysis of operations, compliance reports          |
| Week 11 | SLSA Level 3 builds         | Reproducible builds, SBOM, Cosign signing, Rekor transparency    |
| Week 12 | Phase 1 complete            | Zero unsanctioned egress verified, enterprise outreach initiated |

---

### Success Criteria

- Zero unsanctioned network requests (verified via Wireshark + DevTools on 1-hour browsing test)
- 100% audit coverage for all AI/cloud operations (automated test validation)
- Pass Panopticlick fingerprinting tests (score >12 bits entropy reduction)
- Builds reproducible on Linux (Ubuntu 24.04), macOS (14+), Windows (11)
- <10s first-run experience from launch to usable browser
- SLSA Level 3 provenance generated for all artifacts
- E2E tests passing (Playwright), 80%+ code coverage maintained
- 5+ enterprise LOIs (Letters of Intent) for pilot programs

---

## Phase 2: Local AI Platform (Weeks 13-20) — Intelligence Without Compromise

**Goal**: Deliver production-grade local AI with multi-engine support, native MCP integration, and consent-gated cloud fallback.

**Status**: ⚪ Planned
**Start Date**: 2026-01-11 (Week 13)
**End Date**: 2026-03-07 (Week 20)
**Prerequisites**: ✅ Phase 1 complete (consent fabric + audit trail functional)

### Core Deliverables

#### Week 13-14: AI Inference Gateway Architecture

- ✅ **C++ Abstraction Layer**
  - Define `AIInferenceEngine` interface (pluggable backends)
  - Implement `OllamaEngine` adapter (stdio communication)
  - Implement `TransformersJSEngine` adapter (in-browser fallback)
  - Implement `WebLLMEngine` adapter (WebGPU high-performance)
  - **File**: `src/toubkal/components/ai/inference/inference_engine.h`

- ✅ **Ollama Integration**
  - Local inference via Ollama API (REST)
  - Auto-detect Ollama installation (localhost:11434)
  - Model download and management UI
  - Resource monitoring (RAM/VRAM/CPU usage)
  - **File**: `src/toubkal/components/ai/inference/ollama_engine.cc`

- ✅ **Consent Integration**
  - All AI queries go through `ConsentManager`
  - Cloud AI requires explicit per-request consent
  - Local AI bypasses consent (marked in audit log as "Local-Only")
  - Visual indicators (🟢 Local, 🟠 Cloud)

**Success Criteria**:
- Ollama inference working (<2s latency for Llama 3.2 3B on 8GB RAM)
- Transformers.js fallback working (40-60% native performance, <3s latency)
- All AI operations logged to audit trail with consent status
- Model switching without breaking conversation (zero data loss)

---

#### Week 15-16: AI Assistant Interface

- ✅ **AI Overlay (Sidebar)**
  - React-based sidebar with conversation history
  - `Ctrl+Shift+I` hotkey to toggle
  - Model selector dropdown (shows current engine/model)
  - Streaming response handling (real-time tokens)
  - Resource usage display (RAM/VRAM/tokens-per-second)
  - **File**: `src/toubkal/app/components/AIOverlay/`

- ✅ **Context Menu Integration**
  - Right-click selected text/image/link
  - Quick AI actions: summarize, explain, translate, rewrite, extract data
  - Inline overlay or sidebar with result
  - All operations logged to audit trail
  - **File**: `src/toubkal/app/context_menu/ai_actions.tsx`

- ✅ **Core AI Features**
  - Page summarization (10KB article → 3 sentences)
  - Q&A (page context-aware answers)
  - Translation (EN ↔ ES, FR, AR, ZH, JA, DE)
  - Code explanation (syntax highlighting + natural language)
  - **File**: `src/toubkal/components/ai/features/`

**Success Criteria**:
- p95 <2s local summarization latency (10KB Wikipedia article, Llama 3.2 3B)
- Streaming responses start <500ms (local), <1s (cloud)
- Context menu actions respond in <2s for local models
- Resource monitoring accurate (±10% of OS task manager)

---

#### Week 17-18: Native MCP Integration (First Browser with Native MCP!)

- ✅ **C++ MCP Client**
  - Implement stdio, HTTP+SSE, SHTTP transports
  - JSON-RPC 2.0 messaging (per MCP 2024-11-05 spec)
  - Tool discovery and capability negotiation
  - Sandbox isolation (separate processes per MCP server)
  - **File**: `src/toubkal/components/mcp/mcp_client.cc`

- ✅ **Native MCP Servers**
  - `toubkal-tabs`: List/switch/close/group tabs
  - `toubkal-bookmarks`: Search/add/organize bookmarks
  - `toubkal-history`: Search/export browsing history
  - All tools consent-gated (visual confirmation before invocation)
  - **Directory**: `src/toubkal/mcp_servers/`

- ✅ **MCP Audit Logging**
  - Log all MCP tool invocations to audit trail
  - Ed25519-signed records with tool name, arguments, result
  - Consent decisions included in audit entry
  - Export MCP operation history (JSON/CSV)

**Success Criteria**:
- MCP protocol compliance (100% MCP 2024-11-05 spec conformance)
- <100ms tool invocation overhead (stdio), <200ms (HTTP+SSE)
- 100% of tool calls consent-gated (automated test verification)
- Native MCP servers functional with zero crashes (stability testing)

---

#### Week 19-20: Cloud AI Fallback & Performance Optimization

- ✅ **Cloud AI Providers (Consent-Gated)**
  - Optional OpenAI, Anthropic, Gemini integration
  - Explicit per-request consent banner (data disclosure)
  - "Allow once/session/workspace/always" options
  - All cloud requests Ed25519-signed in audit log
  - **File**: `src/toubkal/components/ai/cloud/cloud_provider.cc`

- ✅ **BYOM (Bring Your Own Model)**
  - Import GGUF models from HuggingFace Hub or local filesystem
  - Checksum verification (SHA-256)
  - Model resource monitoring (RAM/VRAM warnings)
  - Users can load specialized models (legal, medical, code)
  - **File**: `src/toubkal/app/pages/ModelManager/`

- ✅ **Performance Optimizations**
  - Tab freezing/sleeping (energy saver mode)
  - Adaptive tab sleeping (inactive 5min+ → freeze)
  - Fast restore (<100ms p95 latency)
  - Battery monitoring integration (Chromium TaskManager)
  - **File**: `src/toubkal/components/performance/tab_freezing.cc`

**Success Criteria**:
- 80%+ AI queries handled locally (audit log analysis over 1-week user testing)
- All cloud AI requests show consent banner with accurate data disclosure (100% coverage)
- 15-20% battery improvement vs. Chrome/Brave (4-hour reference workload)
- 30-40% RAM reduction with 15 frozen tabs (validated on reference hardware)
- <100ms p95 tab restore latency from frozen state (50 freeze/restore cycles)

---

### Key Milestones

| Week    | Milestone                   | Deliverable                                                    |
| ------- | --------------------------- | -------------------------------------------------------------- |
| Week 13 | AI inference gateway        | Ollama integration working, pluggable backend architecture     |
| Week 14 | Multi-engine support        | Transformers.js + WebLLM working, consent integration complete |
| Week 15 | AI Overlay (sidebar)        | React UI with conversation history, model selector, streaming  |
| Week 16 | Context menu + core AI      | Summarization, Q&A, translation working locally                |
| Week 17 | MCP client implementation   | stdio + HTTP+SSE transports working, tool discovery functional |
| Week 18 | Native MCP servers (3+)     | toubkal-tabs, toubkal-bookmarks, toubkal-history operational   |
| Week 19 | Cloud AI fallback           | Consent-gated OpenAI/Anthropic integration, BYOM working       |
| Week 20 | Phase 2 complete + Alpha    | 80%+ local query rate, performance targets met, Alpha released |

---

### Success Criteria

- p95 <2s local summarization latency (Llama 3.2 3B on 8GB RAM, Ollama)
- p95 <3s for Transformers.js (WebGPU-only, no Ollama)
- 80%+ AI queries handled locally (no cloud)
- All cloud requests show consent banner with data disclosure
- Native MCP servers functional with consent enforcement (automated protocol conformance tests)
- Performance targets: 15-20% battery gain, 30-40% RAM reduction
- <100ms p95 tab restore latency
- **Alpha Release**: 10,000+ active users (telemetry opt-in), <0.1% crash rate

---

## Phase 3: Ecosystem & Enterprise (Weeks 21-28) — Scale & Adoption

**Goal**: Enable enterprise adoption, community MCP ecosystem, and public beta release.

**Status**: ⚪ Planned
**Start Date**: 2026-03-08 (Week 21)
**End Date**: 2026-05-02 (Week 28)
**Prerequisites**: ✅ Phase 2 complete (local AI + MCP functional)

### Core Deliverables

#### Week 21-22: MCP Ecosystem & Server Manager UI

- ✅ **MCP Server Manager UI**
  - React-based discovery and install interface
  - Privacy labels (🟢 Local, 🟡 Network, 🟠 Remote API)
  - Real-time server logs (stdout/stderr streaming)
  - One-click install via `npx`/Docker
  - Per-server resource limits (CPU/RAM caps)
  - **File**: `src/toubkal/app/pages/MCPServerManager/`

- ✅ **Community MCP Servers (5-10 Pre-Vetted)**
  - **Filesystem MCP**: Local file operations (read/write/search)
  - **GitHub MCP**: Repo browsing, PR automation, issue tracking
  - **Database MCP**: SQL query execution (local SQLite/PostgreSQL only)
  - **Browserbase MCP**: Web automation (Playwright integration)
  - **Slack MCP**: Workspace messaging (consent-gated)
  - **Email MCP**: IMAP/SMTP operations (local-only by default)
  - All servers sandboxed (isolated processes + consent-gated)
  - **Directory**: `community-mcp-servers/` (separate repo)

**Success Criteria**:
- 5-10 community MCP servers available with privacy labels
- MCP Server Manager UI functional (one-click install working)
- All community servers pass security audit (sandbox isolation verified)
- Real-time server logs display stdout/stderr (no data loss)

---

#### Week 23-24: Enterprise Features & Policies

- ✅ **Enterprise Policies**
  - IT-controlled settings (Group Policy / MDM support)
  - Local-only AI enforcement (block cloud AI entirely)
  - Allowlists (approved websites, MCP servers, models)
  - Data residency rules (configurable per-workspace)
  - MCP gateway controls (enterprise-approved servers only)
  - **File**: `src/toubkal/browser/enterprise/policy_manager.cc`

- ✅ **Advanced Workspace Features**
  - Persistent AI memory across sessions (LevelDB storage)
  - Workspace-specific model preferences (saved per workspace)
  - Cross-tab context isolation (no data leakage between workspaces)
  - Visual workspace switcher (sidebar or tab bar)
  - **File**: `src/toubkal/components/workspaces/workspace_manager.cc`

- ✅ **Privacy Routing (Basic)**
  - Local-only mode (all cloud requests blocked)
  - Direct mode (standard internet routing)
  - Visual per-tab indicators (🟢 Local-Only, 🔵 Direct)
  - Network flow visualization (Transparency Dashboard integration)
  - **File**: `src/toubkal/components/privacy/routing/privacy_router.cc`

**Success Criteria**:
- Enterprise policies enforceable via Group Policy (Windows) and MDM (macOS/Linux)
- Workspace isolation verified (no cross-workspace data leakage in automated tests)
- Privacy routing modes functional with visual indicators
- 2+ signed enterprise contracts (paid deployments, 50+ users each)

---

#### Week 25-26: Performance Dashboard & Documentation Site

- ✅ **Performance Dashboard**
  - React-based real-time per-tab monitoring
  - CPU/RAM/network usage (live charts)
  - Battery impact estimates (Chromium TaskManager integration)
  - Freeze/sleep status indicators (per tab)
  - Performance recommendations (automated suggestions)
  - **File**: `src/toubkal/app/pages/PerformanceDashboard/`

- ✅ **Public Documentation Site**
  - Architecture docs (system diagrams, data flows)
  - API reference (Mojo IPC, MCP protocol, Extension APIs)
  - Contributor guidelines (code style, testing, PRs)
  - Security model (threat model, privacy guarantees)
  - Build instructions (Linux/macOS/Windows)
  - **Site**: `docs.toubkal.app` (Hugo or Docusaurus)

**Success Criteria**:
- Performance dashboard accurate (±10% of OS task manager)
- Documentation site live with 95%+ accuracy (quarterly audit)
- 100+ contributors with merged PRs (GitHub activity)
- Documentation covers 100% of public APIs (automated coverage check)

---

#### Week 27-28: Beta Preparation & Release

- ✅ **Security Audit (Third-Party)**
  - Quarterly penetration testing ($15-30K budget)
  - Scope: Chromium overlays, audit trail crypto, MCP sandbox isolation
  - Track severity: 0 critical, <5 medium findings
  - Time-to-resolution: <30 days for high-severity issues
  - **Report**: `docs/security/pen-test-q1-2026.pdf`

- ✅ **Performance Optimization**
  - Speedometer 3.0 benchmark (match Chromium ±5%)
  - Battery/RAM targets validated on reference hardware
  - Cold start time optimization (<10s maintained)
  - Tab restore latency optimization (<100ms p95 maintained)
  - **File**: `tests/performance/benchmarks.json`

- ✅ **Beta Release**
  - Public release announcement (blog post, HN, Reddit)
  - 5+ enterprise pilots deployed (50+ users each)
  - 10,000+ active users (telemetry opt-in tracking)
  - Crash rate <0.1% (breakpad reporting)
  - NPS survey (target: 40+ score)
  - **Milestone**: Beta v0.9.0

**Success Criteria**:
- 5+ enterprise pilot LOIs (Letters of Intent) or POC agreements (50+ users each)
- 2+ signed paid contracts by end of Phase 3 (Month 9)
- 10+ community MCP servers with privacy labels
- 10,000+ active users (telemetry opt-in)
- 100+ contributors with merged PRs
- Documentation site live with 95%+ accuracy
- Security audit passed (0 critical findings, <5 medium)
- Performance targets met (battery, RAM, latency)

---

### Key Milestones

| Week    | Milestone                | Deliverable                                                     |
| ------- | ------------------------ | --------------------------------------------------------------- |
| Week 21 | MCP Server Manager UI    | Discovery, install, privacy labels, real-time logs              |
| Week 22 | Community MCP servers    | 5-10 pre-vetted servers available, sandboxed execution          |
| Week 23 | Enterprise policies      | Group Policy / MDM support, local-only AI enforcement           |
| Week 24 | Advanced workspaces      | Persistent memory, workspace isolation, privacy routing (basic) |
| Week 25 | Performance dashboard    | Real-time per-tab CPU/RAM/network monitoring                    |
| Week 26 | Documentation site live  | Architecture docs, API reference, contributor guidelines        |
| Week 27 | Security audit           | Third-party pen-test passed, <5 medium findings                 |
| Week 28 | Beta release             | 5+ enterprise pilots, 10K+ active users, 2+ paid contracts      |

---

## Post-MVP Features (Phase 4+)

**Target**: Q3-Q4 2026

### Major Features

- **On-Device Fine-Tuning**: LoRA/QLoRA support for personalized AI (requires 12GB+ VRAM)
- **Federated Learning**: Privacy-preserving model improvement contributions (cryptographically verified diffs)
- **Full Privacy Routing**: Tor/I2P integration with cryptographic route proofs
- **Zero-Trust Sync**: P2P/USB encrypted sync (user holds private keys, no cloud servers)
- **Hypervisor Isolation**: MicroVM sandboxing for high-risk users (journalists, activists)
- **Post-Quantum Cryptography**: NIST ML-KEM / ML-DSA (pending BoringSSL support)
- **Mobile Apps**: iOS and Android versions
- **Voice Input/Output**: Hands-free AI assistance
- **Advanced Agentic Features**: Autonomous browsing, multi-step reasoning
- **MCP SDK**: Developer tooling for custom server creation

---

## Timeline Visualization (Revised)

```
Month        Oct 2025     Nov 2025      Dec 2025      Jan 2026      Feb 2026      Mar 2026      Apr 2026      May 2026
Week         0   1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28
Phase 0      [✅]
Phase 0.5        [====]
Phase 1              [================]
Phase 2                                  [================]
Phase 3                                                      [================]
Alpha                                                                    ▲
Beta                                                                                              ▲
```

---

## Dependencies & Critical Path

### Phase 0.5 → Phase 1 Dependencies

- **Blocker**: Real audit trail (BoringSSL + LevelDB) must be functional before browser UI branding
- **Blocker**: Ad blocking must be working before transparency dashboard (need data to display)
- **User-Managed**: Chromium fork synchronization (prerequisite for Phase 1 GN build system)

### Phase 1 → Phase 2 Dependencies

- **Blocker**: Consent fabric must be functional before AI features (all AI ops require consent)
- **Blocker**: Audit trail must log all AI operations (privacy promise depends on this)
- **Blocker**: Build system must be stable for team collaboration (GN + Siso working)

### Phase 2 → Phase 3 Dependencies

- **Blocker**: Basic AI features must work reliably before enterprise pilots (value proposition)
- **Blocker**: MCP client must be functional before community servers (protocol dependency)
- **Blocker**: Performance optimizations must meet targets for user adoption (battery/RAM claims)

### External Dependencies

- **Chromium upstream**: Track Stable releases (with Extended Stable for enterprise), minimize merge conflicts via canary builds
- **Ollama stability**: Monitor Ollama releases for API changes (currently v0.1.x, stable)
- **MCP protocol**: Track Anthropic's MCP spec updates (currently 2024-11-05, with version negotiation for future specs)
- **BoringSSL FIPS**: Ensure Ed25519 signing uses FIPS 140-2/3 validated crypto (enterprise compliance)

---

## Risk & Mitigation Summary

| Risk                                    | Impact                           | Mitigation                                                          |
| --------------------------------------- | -------------------------------- | ------------------------------------------------------------------- |
| Chromium upstream breaking changes      | 2-week delay per milestone       | Daily canary builds, pinned LKGR, Extended Stable tracking          |
| Phase 0.5 timeline underestimated       | 2-4 week delay to Phase 1        | Weekly progress reviews, escalate blockers early                    |
| Ollama performance issues               | 30% user satisfaction drop       | Model downshifting, cloud fallback, Transformers.js                 |
| MCP spec changes                        | Protocol incompatibility         | Version negotiation, backward compatibility (2+ spec versions)      |
| Community adoption slower than expected | Delayed product-market fit       | Aggressive UX simplification, one-click Ollama installer            |
| Enterprise procurement cycles           | 6-month sales delay              | Early outreach (Week 1!), free pilots, SOC 2 compliance roadmap     |
| Security audit findings                 | Beta release delay (1-2 weeks)   | Pre-audit security review (Week 26), allocate time for remediation  |

---

## Metrics & Tracking

### Daily Monitoring

- Build success rate (CI/CD) - target 95%+
- Privacy metrics (audit coverage, unsanctioned egress) - target 100% coverage, 0 unsanctioned
- Performance metrics (battery, RAM, latency) - track against baselines

### Weekly Reviews

- Sprint progress (Phase milestones) - burn-down charts
- AI metrics (query rate, latency, adoption) - track 80%+ local usage
- Quality metrics (test coverage, crash rate) - maintain 80%+ coverage, <0.1% crash rate

### Monthly Reviews

- Roadmap progress vs. targets (Phase completion %)
- Adoption metrics (users, contributors) - track against goals
- Risk register updates (new risks, mitigation effectiveness)
- Enterprise outreach (demos, LOIs, contracts) - track sales pipeline

### Quarterly Reviews

- Strategic OKR alignment (company-level goals)
- Security audits (pen-testing, findings, remediation)
- User satisfaction (NPS surveys) - target 40+
- Revenue tracking (enterprise contracts, cloud AI credits)

---

## Contact & Updates

- **Product Owner**: Ilyass Motya
- **Roadmap Maintainer**: Hassan (AI assistant via BMAD workflows)
- **Roadmap Updates**: Published monthly in `/docs/roadmap/`
- **Status Dashboard**: GitHub Projects (link TBD)
- **Enterprise Inquiries**: enterprise@toubkal.app
- **Security Reports**: security@toubkal.app

---

## Revision History

| Version | Date       | Changes                                                                 | Author        |
| ------- | ---------- | ----------------------------------------------------------------------- | ------------- |
| 1.0     | 2025-10-18 | Initial roadmap (Phase 1-3, 24-week timeline)                           | Ilyass Motya  |
| 2.0     | 2025-10-18 | Major revision: Added Phase 0.5, extended Phase 1 (8→12 weeks), revised | Hassan (BMAD) |
|         |            | milestones based on implementation analysis, adjusted all phase dates   |               |

---

**Last Updated**: 2025-10-18
**Next Review**: 2025-11-01
**Status**: Phase 0 ✅ Complete, Phase 0.5 🔵 Active Development

---

**Note to Team**: This roadmap reflects reality-based planning. Phase 0.5 addresses the gap between TypeScript mocks and production-grade C++ privacy implementations. Chromium fork setup is user-managed and assumed complete before Phase 1. Enterprise outreach begins Week 1 (not Phase 3) to account for 6-12 month procurement cycles.
