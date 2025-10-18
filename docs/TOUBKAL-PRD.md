# **Toubkal Browser — Product Requirements Document (PRD)**

---

**Document Type:** PRD — Strategic & Functional Specification  
**Project:** Toubkal Browser  
**Version:** 1.0
**Owner:** Ilyass Motya
**Last Updated:** 2025-10-18  
**Audience:** Product, Engineering, QA, Security

---

## **1. Vision & Objectives**

### Vision

Toubkal is the world's first **cryptographically auditable, privacy-first AI browser** where local AI assistance, user sovereignty, and verifiable consent are non-negotiable. We redefine the browser as an **AI-augmented workspace** that protects user data, proves privacy mathematically, and runs AI locally with zero cloud dependency by default—making "AI that works for you, not on your data" a verifiable reality, not a marketing promise.

**Tagline:** _"The intelligent browser that protects your mind."_

### Objectives

**1. Establish Mathematically Provable Privacy**

- Zero unsanctioned data egress with cryptographic proof (Ed25519-signed audit logs, Merkle-tree verification)
- Live Transparency Mode with real-time data flow visualization and forensic replay capability
- Universal Consent Fabric with per-request, role-based, time-bound consent and exportable "Consent Snapshots"
- Every AI operation, network call, and plugin action is cryptographically signed and auditable

**2. Deploy Radical Local-First AI Platform**

- Multi-engine architecture supporting Ollama, HuggingFace Transformers.js, WebLLM, LlamaCpp, ONNX Runtime, and custom endpoints
- BYOM (Bring Your Own Model) with support for GGUF, ONNX, Safetensors, and custom checkpoints
- On-device fine-tuning with LoRA/QLoRA for personalized AI that learns without cloud leakage (requires discrete GPU with 12GB+ VRAM)
- Federated learning diffs (opt-in) allowing users to contribute model improvements while preserving privacy
- In-browser inference via WebGPU achieving 40-60% of native performance without external dependencies (targeting 70%+ with optimizations by Phase 2)

**3. Pioneer Native MCP Integration**

- First browser with built-in Model Context Protocol (MCP) client supporting stdio, HTTP+SSE, and SHTTP transports
- Native MCP servers exposing browser capabilities (tabs, bookmarks, history, automation) to AI with consent gating
- Community MCP server ecosystem with privacy labels, sandbox isolation, and cryptographic logging
- MCP Server Manager UI for discovery, installation, and management of AI tools
- Every MCP tool invocation requires explicit user consent with visual confirmation

**4. Deliver Best-in-Class AI Assistant Interface**

- Multi-modal access: AI Overlay (sidebar), context menu, omnibox integration, page overlay, voice command
- Context-aware assistance with persistent workspace memory and multi-tab context understanding
- Real-time model switching between local and cloud with visual indicators (🟢 Local, 🟠 Cloud)
- Streaming responses, resource monitoring (RAM/VRAM/tokens/sec), and performance optimization
- Consent-gated cloud fallback with detailed data disclosure before any external API call

**5. Advance Enterprise-Grade Security & Isolation**

- Optional hypervisor mode with microVM sandboxing for critical use cases (journalists, enterprises, high-risk users)
- Privacy routing with user-selectable paths (local-only, Tor, I2P, direct) and cryptographic route proofs
- Biometric/passkey identity for AI operations preventing unauthorized access
- Capability-based plugin sandbox with JSON-defined permissions and runtime enforcement

**6. Achieve Future-Proof Architecture**

- Post-quantum cryptography (Kyber/Dilithium) for all network and sync operations
- Zero-trust local-first sync (P2P, USB, encrypted) where users hold private keys—no third-party servers
- Modular codebase with feature-first organization (features/shared/engine separation)
- Reproducible builds with SLSA Level 3 attestations, SBOM generation, and Cosign signing

**7. Build Superior Ad Blocking & Privacy Defaults**

- Multi-layer blocking: EasyList, uBlock Origin filters, Brave filters, regional lists, custom scriptlets
- Anti-adblock circumvention with machine learning detection (future)
- YouTube-specific enhancements blocking pre-roll, mid-roll, and search ads
- CNAME uncloaking in Standard mode (not just Aggressive like Brave)
- Cryptographic proof of every blocked request with exportable audit logs

---

## **2. Target Audience & Personas**

### Primary Personas

**1. Privacy-Conscious Professionals (High Priority)**

- **Profile:** Lawyers, journalists, researchers, activists, security professionals
- **Pain Points:**
  - Need AI assistance but cannot risk data leakage to cloud providers
  - Current browsers have hidden telemetry and opaque AI operations
  - No way to verify privacy claims mathematically
- **Value Proposition:**
  - Mathematically provable zero telemetry with Ed25519 audit chains
  - Local-first AI with explicit consent for any cloud usage
  - Exportable transparency proofs for compliance and legal protection
- **Key Features:** Cryptographic audit trail, Live Transparency Mode, local AI inference, enterprise isolation

**2. Enterprise Users & IT Administrators (High Priority)**

- **Profile:** Security teams, compliance officers, CISOs, DevOps engineers
- **Pain Points:**
  - Cannot deploy AI browsers due to data residency and GDPR/HIPAA concerns
  - Lack of audit trails for regulatory compliance
  - Need to enforce local-only AI policies across organization
- **Value Proposition:**
  - Local-only AI deployments with enterprise policy enforcement
  - Exportable audit logs for SOC 2, ISO 27001 compliance
  - Workspace isolation and role-based consent controls
- **Key Features:** Enterprise policies, MCP gateway controls, hypervisor isolation, reproducible builds

**3. AI-Powered Knowledge Workers (Medium Priority)**

- **Profile:** Developers, writers, analysts, designers, content creators
- **Pain Points:**
  - Need AI for summarization, Q&A, translation, code assistance
  - Frustrated by slow cloud AI and privacy concerns
  - Want to customize AI models for specific tasks
- **Value Proposition:**
  - Full local AI productivity with <2s response times
  - BYOM for specialized models (legal, medical, code, languages)
  - Composable workspaces with persistent AI context
- **Key Features:** AI Assistant Interface, multi-engine support, MCP integration, workspace context manager

**4. Open-Source Advocates & Security Researchers (Medium Priority)**

- **Profile:** Privacy activists, security auditors, academic researchers, FOSS contributors
- **Pain Points:**
  - Cannot verify proprietary browser privacy claims
  - Need reproducible builds and open audit processes
  - Want to contribute to privacy-preserving technology
- **Value Proposition:**
  - Fully auditable open-source codebase
  - Reproducible builds with SLSA attestations
  - Cryptographic proofs allow independent verification
- **Key Features:** Open architecture, SLSA Level 3 builds, community MCP servers, fork-friendly design

### Secondary Personas

**5. Tech Enthusiasts & Early Adopters**

- **Profile:** Power users who test cutting-edge features and provide feedback
- **Value Proposition:** First access to local AI innovations, performance benefits, bleeding-edge privacy tech
- **Key Features:** Beta access, experimental features, community involvement

**6. AI Application Developers**

- **Profile:** Developers building AI-enhanced web apps and browser extensions
- **Value Proposition:** MCP integration, standardized AI capabilities, privacy-preserving development tools
- **Key Features:** MCP SDK, Toubkal native APIs, plugin ecosystem, developer documentation

---

## **3. Core Principles**

### Foundational Principles

**1. Privacy by Default & Design**

- No telemetry, no fingerprinting, no hidden cloud calls
- Zero data collection without explicit opt-in consent
- Cookie isolation, tracker blocking, and fingerprinting resistance as baseline
- Multi-layer ad blocking (network + cosmetic + anti-adblock circumvention)
- Every action is user-controlled and cryptographically logged

**2. Local-First AI with Radical Transparency**

- All AI operations stay on-device unless explicit per-request consent is provided
- Multi-engine support: users choose inference backend (Ollama, Transformers.js, WebLLM, custom)
- BYOM philosophy: users can bring, train, and fine-tune their own models
- Cloud AI is always opt-in with detailed data disclosure and signed consent records
- Visual indicators distinguish local (🟢) from cloud (🟠) operations at all times

**3. Universal Auditability & Cryptographic Proof**

- Every AI query, network call, plugin action, and consent decision is Ed25519-signed
- Merkle-tree verification ensures audit log integrity and tamper detection
- Live Transparency Mode provides real-time visualization of all data flows
- Exportable transparency proofs (JSON/CSV/PDF) for compliance and legal protection
- Forensic replay mode allows step-through analysis of any operation

**4. Modular, Scalable, & Future-Proof Architecture**

- Feature-first code organization: features/, shared/, engine/ separation for clarity
- Apps decoupled from C++ core for rapid UI iteration
- Chromium overlays/patches minimize upstream merge conflicts
- Dev lab (bmad-core) isolated from production pipelines
- Post-quantum cryptography readiness for long-term security

**5. Native MCP Integration for Extensibility**

- Built-in MCP client supporting stdio, HTTP+SSE, SHTTP transports
- Consent-gated tool invocations with per-tool permission management
- Community MCP server ecosystem with privacy labels and sandbox isolation
- Native Toubkal MCP servers expose browser capabilities to AI
- All MCP operations cryptographically logged and auditable

**6. UX-Driven Security & Accessibility**

- Privacy and AI features must be intuitive, beautiful, and actionable—never intimidating
- Keyboard shortcuts, screen reader support, and responsive design for all users
- Visual indicators for privacy states (local/cloud, consent status, resource usage)
- Minimal, mountain-inspired design language symbolizing trust and clarity
- Performance optimization: tab freezing, memory reduction, battery gains

**7. Open Verifiability & Community Trust**

- Open-source core enables community audits of privacy claims
- Reproducible builds with SLSA Level 3 attestations and SBOM generation
- Transparent governance with public ADRs and architectural decisions
- Supply-chain integrity through Cosign signing and Rekor transparency logs
- Fork-friendly licensing to empower derivative privacy-focused projects

---

## **4. Feature Map & Requirements**

### **Privacy & Security Foundation (P0 — Critical)**

| Feature                       | Description                                                                                                                       | Priority | Acceptance Criteria                                                                                                                                                                                                                                                           | Strategic Notes                                                                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multi-Layer Ad Blocking**   | Network-level blocking (EasyList, uBlock Origin, Brave filters, regional lists) + cosmetic filtering + anti-adblock circumvention | P0       | Match/exceed Brave blocking on top 100 sites; pass Panopticlick tests; zero unsanctioned telemetry; YouTube ads blocked (90-95% success rate); CNAME uncloaking in Aggressive mode (EasyList CNAME filters in Standard mode to avoid site breakage); <5ms per-request latency | Differentiator: cryptographic proof of blocked requests; anti-adblock ML detection (future); Brave's ad blocking engine (adblock-rust) is written in Rust—we inherit this proven implementation |
| **Zero Telemetry by Default** | No data collection without explicit opt-in; zero network requests to analytics/metrics endpoints                                  | P0       | Fresh install network monitoring shows 0 telemetry requests for 1-hour browsing session; all data collection toggles off by default                                                                                                                                           | Brave still has some usage pings—we eliminate all                                                                                                                                               |
| **Fingerprinting Protection** | Canvas randomization, WebGL protection, font enumeration blocking, hardware fingerprint mitigation                                | P0       | Pass Panopticlick and EFF Cover Your Tracks tests; fingerprint entropy <15 bits                                                                                                                                                                                               | Global option (not just 3rd-party like Brave)                                                                                                                                                   |
| **Cryptographic Audit Trail** | Ed25519-signed logs for every AI operation, network call, plugin action, consent decision; Merkle-tree integrity verification     | P0       | 100% audit coverage; all signatures verify with public key; tampered logs detected via Merkle tree mismatch; exportable as JSON/CSV/PDF                                                                                                                                       | Foundation for all trust claims—no competitor has this                                                                                                                                          |
| **Live Transparency Mode**    | Real-time visualization of data flows, AI tokens, system calls, network events; forensic replay capability                        | P0       | Per-process flow graph; step-through replay; exportable transparency proofs for compliance; dashboard shows 100% of operations                                                                                                                                                | Enterprise-ready audit interface                                                                                                                                                                |
| **Universal Consent Fabric**  | Per-request, role-based, time-bound consent with visual indicators for all AI/cloud/plugin actions                                | P0       | Banner before cloud AI calls with data disclosure; "Consent Snapshots" for audit/rewind; "Allow once/workspace/always/never" options; all decisions Ed25519-signed                                                                                                            | Never just "yes/no"—users see what, why, when, and can export proofs                                                                                                                            |
| **Privacy Routing**           | User-routable connections: local-only, Tor, I2P, direct; cryptographic proof of route with Merkle-chain linking                   | P1       | Per-tab privacy indicators; visual traffic flow; route proofs exportable; performance overhead <10% for Tor/I2P                                                                                                                                                               | Lets orgs/users independently audit network claims                                                                                                                                              |

### **Local-First AI Platform (P0 — Critical)**

| Feature                               | Description                                                                                                                | Priority      | Acceptance Criteria                                                                                                                                                                                                                 | Strategic Notes                                                                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Multi-Engine AI Support**           | Unified inference gateway supporting Ollama, HuggingFace Transformers.js, WebLLM, LlamaCpp, ONNX Runtime, custom endpoints | P0            | Auto-detection of available engines; OpenAI-compatible API normalization; users can switch engines without breaking workflow; <100ms routing overhead                                                                               | First browser with true inference-engine agnostic architecture                                                                         |
| **In-Browser AI (Zero Dependencies)** | Transformers.js + WebLLM for 100% local, in-tab inference via WebGPU; no external software required                        | P0            | Works out-of-box on fresh install; 40-60% of native performance (targeting 70%+ by Phase 2); supports lightweight models (SmolLM2-1.7B, Llama 3.2-1B); <3s summarization latency for WebGPU, <2s for Ollama                         | Perfect for locked-down corporate machines or users who won't install Ollama; performance degrades gracefully to Ollama recommendation |
| **BYOM (Bring Your Own Model)**       | Import models from HuggingFace Hub, local filesystem, or custom URLs; supports GGUF, ONNX, Safetensors formats             | P0            | Drag-and-drop model import; checksum verification; model resource monitoring (RAM/VRAM/CPU); users can load specialized models (legal, medical, code)                                                                               | Differentiator: personal AI without vendor lock-in                                                                                     |
| **On-Device Fine-Tuning**             | LoRA/QLoRA support for fine-tuning local models on user data; privacy-preserving federated learning diffs (opt-in)         | P1 (Phase 4+) | Fine-tuning works offline; all operations signed; federated diffs cryptographically verified; users can contribute improvements without data leakage; **Requires discrete GPU with 12GB+ VRAM** (NVIDIA RTX 3060+, AMD RX 6700 XT+) | Game-changer: AI that learns from you, privately; limited to 5-10% of users with high-end GPUs                                         |
| **Cloud AI Fallback (Consent-Gated)** | Optional cloud providers (OpenAI, Anthropic, Gemini, custom); explicit per-request consent with data disclosure banner     | P0            | Consent banner shows data sent, provider, privacy policy; user can "Allow once/session/workspace" or deny; all cloud requests Ed25519-signed; default: local-only                                                                   | Cloud AI is opt-in only—never default                                                                                                  |
| **Model Resource Monitoring**         | Real-time RAM/VRAM/CPU usage, inference latency (tokens/sec), context window tracking                                      | P0            | Visual dashboard shows per-model resource consumption; users can pause/unload models; alerts when approaching hardware limits                                                                                                       | Prevents resource exhaustion; empowers user control                                                                                    |

### **AI Assistant Interface (P0 — Critical)**

| Feature                        | Description                                                                                                              | Priority | Acceptance Criteria                                                                                                                                               | Strategic Notes                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **AI Overlay (Sidebar)**       | Primary interface with conversation history, model selector, workspace context manager, streaming responses              | P0       | Opens in <100ms via `Ctrl+Shift+I`; shows real-time resource usage; visual indicators (🟢 Local, 🟠 Cloud); persistent workspace context; Ed25519-signed messages | Native, unobtrusive, context-aware—not a bolt-on |
| **Context Menu Integration**   | Right-click selected text/image/link for quick AI actions: summarize, explain, translate, rewrite, extract data          | P0       | Actions respond in <2s for local models; inline overlay or sidebar with result; all operations logged                                                             | Zero friction between intent and action          |
| **Model Selector & Switching** | Dropdown showing current engine (Ollama, Transformers.js, custom); one-click switch with consent prompt if cloud         | P0       | Real-time resource display; status indicator (🟢 Connected, 🟠 Cloud, ⚫ Offline); switch without breaking conversation                                           | Visual transparency of AI source at all times    |
| **Workspace Context Manager**  | Group tabs into named workspaces; AI has persistent memory within each workspace; attach tabs/docs/files to conversation | P1       | Multi-tab summarization (5+ tabs); workspace switching preserves state; visual badge shows attached context; isolation prevents cross-workspace leakage           | True knowledge workspaces with local memory      |
| **Omnibox AI Integration**     | Type `@toubkal` or `ask:` in address bar for quick questions; AI responds in dropdown                                    | P1       | Response shows source (local/cloud) and latency; `Enter` opens full response in sidebar; logged to audit trail                                                    | Search augmentation without leaving omnibox      |
| **Page Overlay (In-Page)**     | Floating bubble or selection toolbar for non-intrusive AI access without opening sidebar                                 | P1       | Mini-chat window (draggable); auto-hides when not in use; floating toolbar on text selection                                                                      | For users who prefer minimal UI                  |

### **MCP Integration (P0 — Critical)**

| Feature                          | Description                                                                                                                                                                         | Priority | Acceptance Criteria                                                                                                                                                                            | Strategic Notes                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Native MCP Client**            | Built-in support for stdio, HTTP+SSE, SHTTP transports; JSON-RPC 2.0 messaging; tool discovery and capability negotiation                                                           | P0       | Compliant with MCP 2024-11-05 spec (latest); lifecycle management (initialize, ping, shutdown); async by default; <100ms tool invocation overhead; version negotiation for future spec updates | First browser with native MCP—category-defining          |
| **Toubkal Native MCP Servers**   | Expose browser capabilities to AI: tabs (list, switch, close, group), bookmarks (search, add, organize), history (search, export), browser automation (navigate, click, screenshot) | P0       | At least 3 native servers in MVP; all tools consent-gated; local-only (no cloud egress); Ed25519-signed invocations                                                                            | Native browser-AI integration that competitors lack      |
| **MCP Server Manager UI**        | Discover, install, enable/disable community MCP servers; privacy labels (🟢 Local, 🟡 Network, 🟠 Remote API); real-time logs                                                       | P0       | One-click install via `npx`/Docker; visual status (running/stopped/error); per-server resource limits; consent per tool invocation                                                             | User-friendly ecosystem management                       |
| **Consent-Gated MCP Tools**      | Universal consent fabric integration: every tool call requires approval with visual confirmation; "Allow once/workspace/always/never"                                               | P0       | First-time approval shows tool description, permissions, data accessed; consent decisions Ed25519-signed; audit trail includes all MCP operations                                              | Privacy-preserving extensibility                         |
| **Community MCP Server Support** | Pre-vetted servers: filesystem, GitHub, database, web automation (Browserbase/Playwright), Slack/email, custom APIs                                                                 | P1       | 5-10 servers in MVP; privacy labels and community audit status; sandboxed execution (isolated process/container); cryptographic logging                                                        | Ecosystem differentiator—extensible without code changes |

### **Performance & Sustainability (P1 — High Priority)**

| Feature                     | Description                                                                                               | Priority | Acceptance Criteria                                                                                                                     | Strategic Notes                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Tab Freezing & Sleeping** | Energy Saver-style background tab freezing; adaptive tab sleeping (inactive 5min+); fast restore (<100ms) | P1       | 15-20% battery improvement on 10-tab workload; 30-40% RAM reduction; p95 restore latency <100ms; user overrides (pin tab, never freeze) | Core UX win: sustainability + speed |
| **Performance Dashboard**   | Real-time per-tab CPU/memory/network usage; battery impact estimates; freeze/sleep status indicators      | P1       | Accurate resource tracking (±10%); battery estimates match system measurements; settings apply immediately                              | Empowers user optimization          |

### **Enterprise & Advanced Features (P1-P2)**

| Feature                  | Description                                                                                                                                                                       | Priority      | Acceptance Criteria                                                                                          | Strategic Notes                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Enterprise Policies**  | IT-controlled settings: local-only AI enforcement, allowlists, data residency rules, MCP gateway controls                                                                         | P1            | Group Policy / MDM support; settings override user preferences; audit logs exportable for compliance         | Enterprise adoption enabler                                                                                        |
| **Hypervisor Isolation** | Optional microVM sandbox mode for critical use cases (journalists, high-risk users); biometric/passkey identity for AI                                                            | P2            | Physical+logical isolation; no cloud presence leakage; biometric auth works with OS keychain                 | Extreme security for high-threat environments                                                                      |
| **Zero-Trust Sync**      | Encrypted P2P or USB sync; user holds private keys; supports bookmarks, models, context, workspace settings                                                                       | P2            | Data never transits third-party servers; cryptographically verifiable sync; works offline                    | Proof of local-first sync                                                                                          |
| **Post-Quantum Crypto**  | NIST ML-KEM (formerly Kyber) / ML-DSA (formerly Dilithium) for key exchange (Phase 4+, pending BoringSSL support); configurable per-feature; audit logs for all crypto operations | P2 (Phase 4+) | Post-quantum secure per NIST FIPS 203/204/205 standards; optional enable/disable per workspace; future-proof | Advertise as "future-proof" and enterprise-ready; dependent on BoringSSL ML-KEM/ML-DSA implementation availability |

### **Brand Identity & User Experience Features (P0)**

| Feature                              | Description                                                                                                     | Priority | Acceptance Criteria                                                                                                                                                                                                                                                                                                              | Strategic Notes                                                                                                                                                   |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Custom URL Scheme (`toubkal://`)** | Replace `chrome://` with `toubkal://` for all internal pages. Auto-redirect legacy URLs for compatibility.      | P0       | - User types `chrome://settings` → browser shows `toubkal://settings`<br>- All internal pages accessible via `toubkal://`<br>- No broken links or redirect loops<br>- Address bar displays `toubkal://` scheme                                                                                                                   | Essential for brand identity; users immediately recognize they're using Toubkal, not Chrome. Low effort (1-2 days), high impact. Brave proves this pattern works. |
| **Internal Pages Rebranding**        | Update all internal page titles, headers, and logos to Toubkal branding. Remove all Chrome/Chromium references. | P0       | - Settings page title: "Toubkal Settings"<br>- Version page shows: "Toubkal Browser"<br>- About page shows Toubkal logo + tagline<br>- No "Chrome" or "Chromium" text visible<br>- Consistent blue gradient theme                                                                                                                | Completes brand transition; reinforces "this is Toubkal, not a Chrome clone."                                                                                     |
| **Toubkal-Specific Internal Pages**  | Add new branded internal pages for Toubkal features.                                                            | P0       | - `toubkal://audit` → Transparency Dashboard<br>- `toubkal://ai` → AI settings & model management<br>- `toubkal://mcp` → MCP server management<br>- `toubkal://consent` → Consent history viewer<br>- All pages follow Toubkal design system                                                                                     | Showcase unique Toubkal features with dedicated UI.                                                                                                               |
| **Migration from Brave Browser**     | Seamless migration path for existing Brave users to adopt Toubkal's privacy-first features.                     | P0       | - **Phase 1 (Week 8)**: Basic import (bookmarks, history, settings)<br>- **Phase 2 (Weeks 9-16)**: AI context migration and user education<br>- **Phase 3 (Weeks 17-24)**: Advanced migration (workspaces, consent policies)<br>- **Not Supported**: Brave Rewards/Wallet (removed), Brave Sync (replaced by Zero-Trust P2P/USB) | Critical for user adoption; leverages existing Brave user base. Migration wizard guides users through privacy-first setup.                                        |

---

## **5. Technical Architecture Overview**

### **High-Level Architecture**

Toubkal follows Chromium's **monolithic architecture** with **GN + Siso** build system, inheriting proven patterns while introducing modular, feature-first organization for AI, privacy, and MCP capabilities. The architecture prioritizes security boundaries, reproducible builds, and minimal upstream divergence.

### **Repository Structure (Monolith)**

```
/toubkal                           # Root (monolithic, like Chromium)
│
├─ BUILD.gn                        # Root GN build file
├─ .gn                             # GN config (exec_root, buildconfig)
├─ DEPS                            # gclient dependencies (Chromium + Toubkal)
├─ .gclient                        # gclient configuration
│
├─ /src                            # Chromium source (fetched by gclient)
│   ├─ /chrome                     # Chromium's browser code
│   ├─ /content                    # Content API
│   ├─ /net                        # Network stack
│   ├─ /v8                         # JavaScript engine
│   └─ /toubkal                    # Toubkal code (parallel to /chrome)
│       ├─ BUILD.gn                # Toubkal's main build file
│       ├─ /browser                # Browser-level code (C++)
│       ├─ /components             # Toubkal components (AI, privacy, MCP)
│       ├─ /chromium_src           # File overlays (Brave-style redirects)
│       ├─ /patches                # Git patches for Chromium
│       ├─ /app                    # React/TypeScript UI (built via GN)
│       ├─ /mojo                   # Mojo IPC interfaces (.mojom files)
│       ├─ /extensions             # Extension system
│       ├─ /tools                  # Build tools, code generators
│       ├─ /updater                # Browser update mechanism
│       └─ /resources              # Icons, strings, locales
│
├─ /config                         # Build configurations
│   ├─ /siso                       # Siso configuration (main.star)
│   └─ /gn                         # GN templates, build scripts
│
├─ /out                            # Build output (gitignored)
│   ├─ /Release                    # Release builds
│   └─ /Debug                      # Debug builds
│
└─ /docs                           # Architecture, ADRs, API docs
    ├─ /architecture               # System architecture diagrams
    ├─ /adrs                       # Architecture Decision Records
    └─ /api                        # API documentation
```

### **Technology Stack**

| Layer                | Technology                                                    | Rationale                                                                                                | ADR Reference |
| -------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------- |
| **UI**               | React + TypeScript + Tailwind CSS                             | Velocity, type safety, design consistency                                                                | ADR-001       |
| **Browser Engine**   | C++ (primary)                                                 | Chromium compatibility, proven performance                                                               | ADR-002       |
| **Security Modules** | C++ with BoringSSL (Chromium's FIPS-validated crypto library) | Ed25519 signing, Merkle trees, audit logging, FIPS 140-2/3 compliance for enterprise                     | ADR-002       |
| **Build System**     | GN + Siso (with Ninja fallback)                               | Upstream compatibility, remote execution (experimental), maintainable fallback to Ninja if Siso unstable | ADR-005       |
| **IPC**              | Mojo (.mojom IDL → C++ bindings)                              | Chromium-native, type-safe service boundaries                                                            | ADR-003       |
| **AI Integration**   | MCP + Ollama (local by default)                               | Standardized tools, privacy-first inference                                                              | ADR-004       |
| **Supply Chain**     | SLSA Level 3 + CycloneDX SBOM + Cosign                        | Verifiable builds, enterprise readiness                                                                  | ADR-006       |
| **UI Security**      | Strict CSP + Trusted Types                                    | XSS hardening for AI-rendered content                                                                    | ADR-007       |

### **Key Subsystems**

| Subsystem                     | Primary Technology                                   | Purpose                                                                         | Document Reference                           |
| ----------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------- |
| **AI Inference Gateway**      | C++ with Ollama/Transformers.js integration          | Multi-engine routing, consent gating, resource monitoring                       | `/docs/architecture/ai-inference-gateway.md` |
| **Universal Consent Fabric**  | C++ with LevelDB storage                             | Per-request consent, Ed25519 signing, policy evaluation                         | `/docs/architecture/consent-fabric.md`       |
| **Cryptographic Audit Trail** | C++ with BoringSSL (Ed25519 FIPS-validated), LevelDB | Signed logs, Merkle tree verification, forensic replay, FIPS 140-2/3 compliance | `/docs/architecture/audit-trail.md`          |
| **MCP Integration**           | C++ with Mojo IPC                                    | Native MCP client, stdio/HTTP/SHTTP transports, sandbox                         | `/docs/architecture/mcp-integration.md`      |
| **Privacy Routing**           | C++ with Tor/I2P integration                         | User-selectable routing, cryptographic route proofs                             | `/docs/architecture/privacy-routing.md`      |
| **Multi-Layer Ad Blocking**   | Rust (Brave's `adblock-rust` library)                | Network blocking, cosmetic filtering, anti-adblock circumvention                | `/docs/architecture/ad-blocking.md`          |
| **Browser Update System**     | C++ with Siso build integration                      | Omaha-style auto-updater, SLSA attestation verification                         | `/docs/architecture/updater.md`              |
| **Mojo IPC Layer**            | C++ with .mojom IDL                                  | All cross-process communication (browser ↔ renderer, AI)                       | `/docs/architecture/mojo-ipc.md`             |
| **Extension System**          | C++ with WebExtensions API                           | Chromium extensions + Toubkal native APIs                                       | `/docs/architecture/extensions.md`           |

### **Core Architecture Documents**

For complete technical specifications, implementation details, and API references:

- **System Overview**: `/docs/architecture/system-overview.md` — High-level architecture, process model, security boundaries
- **Toubkal Core Structure**: `/docs/architecture/toubkal-core-structure.md` — Feature-first organization, module dependencies
- **Build System**: `/docs/architecture/build-system.md` — GN + Siso configuration, build targets, developer workflow
- **Mojo IPC**: `/docs/architecture/mojo-ipc.md` — IPC interfaces, .mojom file specifications, C++ bindings
- **Extension System**: `/docs/architecture/extensions.md` — WebExtensions API, Toubkal native APIs, manifest format
- **Security Isolation**: `/docs/architecture/security-isolation.md` — Process sandboxing, capability model, attack surface
- **UI Architecture**: `/docs/architecture/ui-architecture.md` — React components, WebUI integration, CSP/Trusted Types
- **AI Platform**: `/docs/architecture/ai-platform.md` — Multi-engine integration, model management, resource monitoring
- **Privacy Architecture**: `/docs/architecture/privacy-architecture.md` — Consent fabric, audit trail, routing, blocking

---

## **6. MVP Scope Alignment**

### **MVP Philosophy**

Toubkal's MVP delivers **provable privacy + local-first AI** as the core value proposition. We focus on features that demonstrate our unique differentiators while maintaining rapid development velocity by inheriting Chromium's proven architecture and following Brave's fork strategy.

**Revision Note (v2.0)**: Based on implementation analysis, we've added **Phase 0.5** to address the gap between TypeScript mocks and production-grade C++ privacy implementations. Phase 1 extended from 8 to 12 weeks for realistic timeline. See updated roadmap for details.

---

### **Phase 0: Infrastructure (Week 0) — ✅ COMPLETE**

**Status**: Complete as of 2025-10-18

**Completed Deliverables**:

- ✅ **Repository Setup**: Git initialized, `.gitignore`, npm/pnpm configuration
- ✅ **TypeScript/React Foundation**: Strict mode, ES2022 target, React 19, Tailwind CSS 4
- ✅ **Testing Infrastructure**: Vitest framework, JSDOM environment, 80% coverage enforcement
- ✅ **Code Quality Tools**: ESLint 9.15, Prettier 3.3.3, Husky 9.1.6 with lint-staged
- ✅ **GitHub Actions CI/CD**: Multi-platform testing (Linux/macOS/Windows), security scanning
- ✅ **Documentation Structure**: PRD, Architecture docs, ADRs, Contributing guidelines
- ✅ **Privacy Component Stubs**: `TelemetryManager`, `PrivacyDashboard`, `ConsentPrompt` (TypeScript/React UI only)
- ✅ **Type System**: Comprehensive TypeScript types for telemetry, audit, consent

**Lessons Learned**:
- **Strength**: World-class documentation and CI/CD foundation
- **Gap**: TypeScript stubs ≠ production-ready privacy enforcement
- **Reality**: Need C++ Chromium integration for all core privacy features

---

### **Phase 0.5: Foundation Prerequisites (Weeks 1-4) — Real Privacy Implementation**

**Goal**: Replace TypeScript mocks with production-grade C++ implementations. **Chromium fork managed by user separately.**

**Status**: 🔵 Active Development
**Start Date**: 2025-10-19 (Week 1)
**End Date**: 2025-11-15 (Week 4)

**Core Features**:

#### Week 1-2: Real Audit Trail (C++)
- ✅ **BoringSSL Ed25519 Integration**: Replace mock signatures with real FIPS 140-2/3 validated crypto
- ✅ **Merkle Tree Implementation**: SHA-256 hashing, tamper-proof audit chain, exportable proofs
- ✅ **LevelDB Persistence**: Replace in-memory storage, schema: `audit/{timestamp}` → `{entry, signature}`
- **Files**: `src/toubkal/components/privacy/audit/audit_logger.cc`, `merkle_tree.cc`, `audit_storage.cc`

#### Week 3-4: Ad Blocking MVP (C++)
- ✅ **Brave's adblock-rust Integration**: Network-level blocking, EasyList + uBlock Origin filters
- ✅ **CNAME Uncloaking**: Aggressive mode, <5ms per-request latency (async resolution)
- ✅ **Audit Logging Integration**: Ed25519-signed blocked request records, Mojo IPC to UI
- **Files**: `src/toubkal/components/privacy/ad_blocking/ad_blocking_service.cc`, `filter_manager.cc`

**Success Criteria**:

- All audit entries signed with real Ed25519 signatures (verifiable with OpenSSL CLI)
- Merkle tree integrity verification detects tampered logs
- LevelDB storage persists audit trail across browser restarts
- Ad blocking matches or exceeds Brave on top 100 sites (95%+ block rate)
- <5ms ad blocking latency, 100% audit coverage for blocked requests

**Out of Scope (Phase 0.5)**:
- Chromium fork synchronization (user-managed, prerequisite for Phase 1)
- GN + Siso build system (Phase 1)
- Browser UI branding (Phase 1)
- Consent fabric UI (Phase 1)

---

### **Phase 1: Privacy Foundation (Weeks 5-12) — Trust & Privacy Baseline**

**Goal**: Establish cryptographically verifiable privacy, zero-telemetry baseline, and Toubkal brand identity.

**Status**: 🟡 Planning
**Start Date**: 2025-11-16 (Week 5)
**End Date**: 2026-01-10 (Week 12)
**Prerequisites**: ✅ Phase 0.5 complete, ✅ Chromium fork synchronized by user

**Core Features**:

#### Week 5-6: GN Build System & Brand Identity
- ✅ **GN + Siso Build Configuration**: Root `BUILD.gn`, Ninja fallback, multi-platform testing
- ✅ **Brand Identity**: Custom `toubkal://` URL scheme, internal page rebranding, `toubkal://audit` and `toubkal://consent` pages
- **Success**: `gn gen out/Debug && autoninja -C out/Debug toubkal` produces launchable browser

#### Week 7-8: Consent Fabric (C++ Browser-Level Enforcement)
- ✅ **Consent Manager (C++)**: `RequestConsent()`, LevelDB persistence, network request gating
- ✅ **Mojo IPC Interfaces**: `.mojom` definitions, React components call Mojo for consent banners
- ✅ **Consent Audit Logging**: Ed25519-signed decisions, exportable consent history (JSON/CSV/PDF)
- **Files**: `src/toubkal/components/privacy/consent/consent_manager.cc`, `src/toubkal/mojo/privacy/consent.mojom`

#### Week 9-10: Transparency Dashboard (Real-Time)
- ✅ **Real-Time Operation Log Viewer**: React dashboard, filter by operation type, pagination (10K+ entries)
- ✅ **Audit Export Functionality**: JSON/CSV/PDF with Merkle proofs and signature verification report
- ✅ **Forensic Replay Mode**: Step-through analysis, visual timeline, compliance reports (GDPR, HIPAA, SOC 2)
- **Files**: `src/toubkal/app/pages/TransparencyDashboard/`, `src/toubkal/components/privacy/audit/audit_exporter.cc`

#### Week 11-12: SLSA Level 3 & Integration Testing
- ✅ **Reproducible Builds**: SLSA Level 3 attestations, CycloneDX SBOM, Cosign signing, Rekor transparency log
- ✅ **End-to-End Testing (Playwright)**: Browser automation tests, consent workflows, ad blocking validation
- ✅ **Performance Baselines**: Speedometer 3.0, battery/RAM benchmarks, cold start time
- ✅ **Enterprise Outreach Launch**: Identify 10-15 targets, pilot materials, LOI/POC requests, demos scheduled for Q1 2026

**Success Criteria**:

- Zero unsanctioned network requests (verified via Wireshark + DevTools on 1-hour browsing test)
- 100% audit coverage for all operations (automated test validation)
- Pass Panopticlick fingerprinting tests (score >12 bits entropy reduction)
- Builds reproducible on Linux (Ubuntu 24.04), macOS (14+), Windows (11)
- <10s first-run experience from launch to usable browser
- SLSA Level 3 provenance for all artifacts
- E2E tests passing (Playwright), 80%+ code coverage maintained
- 5+ enterprise LOIs (Letters of Intent) for pilot programs

**Out of Scope (Phase 1)**:
- AI features (Phase 2)
- MCP integration (Phase 2)
- Advanced workspace features (Phase 2-3)
- Privacy routing (basic in Phase 3, full Tor/I2P in Phase 4+)

---

### **Phase 2: Local AI Platform (Weeks 13-20) — Intelligence Without Compromise**

**Goal**: Deliver production-grade local AI with multi-engine support, native MCP integration, and consent-gated cloud fallback.

**Status**: ⚪ Planned
**Start Date**: 2026-01-11 (Week 13)
**End Date**: 2026-03-07 (Week 20)
**Prerequisites**: ✅ Phase 1 complete (consent fabric + audit trail functional)

**Core Features**:

#### Week 13-14: AI Inference Gateway
- ✅ **C++ Abstraction Layer**: `AIInferenceEngine` interface, Ollama/Transformers.js/WebLLM adapters
- ✅ **Ollama Integration**: Local inference via REST API, auto-detect installation, model management UI
- ✅ **Consent Integration**: All AI queries through `ConsentManager`, visual indicators (🟢 Local, 🟠 Cloud)
- **Files**: `src/toubkal/components/ai/inference/inference_engine.h`, `ollama_engine.cc`

#### Week 15-16: AI Assistant Interface
- ✅ **AI Overlay (Sidebar)**: React UI, conversation history, `Ctrl+Shift+I` hotkey, streaming responses
- ✅ **Context Menu Integration**: Right-click actions (summarize, explain, translate, rewrite, extract)
- ✅ **Core AI Features**: Page summarization, Q&A, translation (EN↔ES/FR/AR/ZH/JA/DE), code explanation
- **Files**: `src/toubkal/app/components/AIOverlay/`, `src/toubkal/app/context_menu/ai_actions.tsx`

#### Week 17-18: Native MCP Integration (First Browser with Native MCP!)
- ✅ **C++ MCP Client**: stdio/HTTP+SSE/SHTTP transports, JSON-RPC 2.0, sandbox isolation
- ✅ **Native MCP Servers**: toubkal-tabs, toubkal-bookmarks, toubkal-history (3+ servers, consent-gated)
- ✅ **MCP Audit Logging**: Ed25519-signed tool invocations, exportable MCP operation history
- **Files**: `src/toubkal/components/mcp/mcp_client.cc`, `src/toubkal/mcp_servers/`

#### Week 19-20: Cloud AI Fallback & Performance
- ✅ **Cloud AI Providers**: Optional OpenAI/Anthropic/Gemini with per-request consent banners
- ✅ **BYOM (Bring Your Own Model)**: GGUF import from HuggingFace/local, SHA-256 checksum verification
- ✅ **Performance Optimizations**: Tab freezing/sleeping, 15-20% battery gain, 30-40% RAM reduction
- **Files**: `src/toubkal/components/ai/cloud/cloud_provider.cc`, `src/toubkal/app/pages/ModelManager/`

**Success Criteria**:

- p95 <2s local summarization latency (Llama 3.2 3B on 8GB RAM, Ollama)
- p95 <3s for Transformers.js (WebGPU-only, no Ollama)
- 80%+ AI queries handled locally (no cloud)
- All cloud requests show consent banner with data disclosure
- Native MCP servers functional with consent enforcement (automated protocol conformance tests)
- Performance targets: 15-20% battery gain, 30-40% RAM reduction
- <100ms p95 tab restore latency
- **Alpha Release**: 10,000+ active users (telemetry opt-in), <0.1% crash rate

**Out of Scope (Phase 2)**:

- On-device fine-tuning (LoRA/QLoRA) - Phase 4+
- Community MCP server ecosystem (beyond 3 native servers) - Phase 3
- Full privacy routing (Tor/I2P) - Phase 4+
- Voice input/output - Phase 4+
- Advanced agentic features - Phase 4+

---

### **Phase 3: Ecosystem & Enterprise (Weeks 21-28) — Scale & Adoption**

**Goal**: Enable enterprise adoption, community MCP ecosystem, and public beta release.

**Status**: ⚪ Planned
**Start Date**: 2026-03-08 (Week 21)
**End Date**: 2026-05-02 (Week 28)
**Prerequisites**: ✅ Phase 2 complete (local AI + MCP functional)

**Core Features**:

#### Week 21-22: MCP Ecosystem & Server Manager UI
- ✅ **MCP Server Manager UI**: React-based discovery/install, privacy labels (🟢 Local, 🟡 Network, 🟠 Remote), real-time logs, one-click install
- ✅ **Community MCP Servers (5-10 Pre-Vetted)**: Filesystem, GitHub, Database, Browserbase, Slack, Email (all sandboxed)
- **Files**: `src/toubkal/app/pages/MCPServerManager/`, `community-mcp-servers/` (separate repo)

#### Week 23-24: Enterprise Features & Policies
- ✅ **Enterprise Policies**: Group Policy/MDM support, local-only AI enforcement, allowlists, data residency rules
- ✅ **Advanced Workspace Features**: Persistent AI memory (LevelDB), workspace-specific models, cross-tab isolation
- ✅ **Privacy Routing (Basic)**: Local-only/direct modes with visual indicators (🟢 Local-Only, 🔵 Direct)
- **Files**: `src/toubkal/browser/enterprise/policy_manager.cc`, `src/toubkal/components/workspaces/workspace_manager.cc`

#### Week 25-26: Performance Dashboard & Documentation Site
- ✅ **Performance Dashboard**: Real-time per-tab CPU/RAM/network monitoring, battery impact estimates, performance recommendations
- ✅ **Public Documentation Site**: Architecture docs, API reference, contributor guidelines, security model, build instructions
- **Site**: `docs.toubkal.app` (Hugo or Docusaurus)

#### Week 27-28: Beta Preparation & Release
- ✅ **Security Audit (Third-Party)**: Quarterly pen-testing ($15-30K), scope: Chromium overlays, audit trail crypto, MCP sandbox
- ✅ **Performance Optimization**: Speedometer 3.0 benchmark (match Chromium ±5%), battery/RAM targets validated
- ✅ **Beta Release**: Public announcement, 5+ enterprise pilots, 10K+ active users, NPS survey (target: 40+)
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

**Deferred to Post-MVP (Phase 4+)**:

- On-device fine-tuning (LoRA/QLoRA, requires 12GB+ VRAM)
- Federated learning (privacy-preserving model improvements)
- Full privacy routing (Tor/I2P integration with cryptographic route proofs)
- Zero-trust sync (P2P/USB encrypted, user holds private keys)
- Hypervisor isolation mode (microVM sandboxing for high-risk users)
- Post-quantum cryptography (NIST ML-KEM / ML-DSA, pending BoringSSL support)
- Mobile apps (iOS/Android)
- Voice input/output (hands-free AI assistance)
- Advanced agentic features (autonomous browsing, multi-step reasoning)
- MCP SDK and developer tooling

---

### **Feature Priority Matrix**

| Feature                                | Phase 0.5 (Wk 1-4) | Phase 1 (Wk 5-12) | Phase 2 (Wk 13-20) | Phase 3 (Wk 21-28) | Post-MVP          |
| -------------------------------------- | ------------------ | ----------------- | ------------------ | ------------------ | ----------------- |
| Privacy defaults (ad/tracker blocking) | ✅ Full (C++)      | ✅ Full           | ✅ Full            | ✅ Full            | ✅ Full           |
| Cryptographic audit trail              | ✅ Full (C++)      | ✅ Full           | ✅ Full            | ✅ Full            | ✅ Full           |
| Universal consent fabric               | ❌                 | ✅ Full (C++)     | ✅ Full            | ✅ Full            | ✅ Full           |
| Transparency dashboard                 | ❌                 | ✅ Full           | ✅ Enhanced        | ✅ Advanced        | ✅ Advanced       |
| Local AI (Ollama + Transformers.js)    | ❌                 | ❌                | ✅ Full            | ✅ Full            | ✅ Full           |
| Cloud AI fallback                      | ❌                 | ❌                | ✅ Consent-gated   | ✅ Full            | ✅ Full           |
| AI Assistant Interface                 | ❌                 | ❌                | ✅ Full            | ✅ Full            | ✅ Full           |
| BYOM (import models)                   | ❌                 | ❌                | ✅ GGUF only       | ✅ All formats     | ✅ All formats    |
| Basic workspaces                       | ❌                 | ❌                | 🟡 Basic           | ✅ Full            | ✅ Full           |
| Native MCP servers                     | ❌                 | ❌                | ✅ 3 servers       | ✅ 3+ servers      | ✅ Extended       |
| MCP client                             | ❌                 | ❌                | ✅ Full (stdio/HTTP/SHTTP) | ✅ Full    | ✅ Full           |
| Community MCP servers                  | ❌                 | ❌                | ❌                 | ✅ 5-10 servers    | ✅ Marketplace    |
| Tab freezing/performance               | ❌                 | 🟡 Basic          | ✅ Full            | ✅ Full            | ✅ Full           |
| Privacy routing                        | ❌                 | ❌                | ❌                 | 🟡 Basic           | ✅ Full (Tor/I2P) |
| Enterprise policies                    | ❌                 | ❌                | ❌                 | ✅ Full            | ✅ Full           |
| On-device fine-tuning                  | ❌                 | ❌                | ❌                 | ❌                 | ✅ LoRA/QLoRA     |
| Post-quantum crypto                    | ❌                 | ❌                | ❌                 | ❌                 | ✅ Full           |
| Mobile apps                            | ❌                 | ❌                | ❌                 | ❌                 | ✅ iOS/Android    |

**Legend**:

- ✅ Full implementation
- 🟡 Basic/partial implementation
- ❌ Not included in this phase

**Key Changes (v2.0)**:
- **Phase 0.5 (NEW)**: Real C++ implementations for audit trail and ad blocking (no TypeScript mocks)
- **Phase 1**: Extended from 8 to 12 weeks, now includes GN build system, consent fabric (C++), transparency dashboard (full), SLSA Level 3 builds
- **Phase 2**: Week numbers shifted (13-20 instead of 9-16), now includes full MCP client (stdio/HTTP+SSE/SHTTP transports)
- **Phase 3**: Week numbers shifted (21-28 instead of 17-24), Beta release at end of Phase 3

---

## **7. KPIs & Metrics**

### **Privacy Metrics (Critical — Must-Have)**

| Metric                                | Target                                                                        | Measurement Method                                                                                                | Blocker Threshold                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Zero Unsanctioned AI/Cloud Egress** | 0% (100% consent coverage)                                                    | Network monitoring (Wireshark, Chrome DevTools) + audit log validation (automated test suite)                     | Any unsanctioned request = blocker                                            |
| **Audit Coverage**                    | 100% of AI/cloud/MCP operations                                               | Audit log entry count vs. actual operations (automated test comparing expected vs. actual entries)                | <100% = blocker                                                               |
| **Signature Verification Rate**       | 100% of audit entries pass Ed25519 verification                               | `verify-audit-log` script with BoringSSL FIPS-validated crypto (run on every CI build)                            | Any failed signature = blocker                                                |
| **Merkle Tree Integrity**             | 100% (no tampered logs)                                                       | Root hash verification on audit export (automated integrity check)                                                | Tampered logs detected = blocker                                              |
| **Zero Telemetry by Default**         | 0 telemetry requests on fresh install                                         | 1-hour browsing test (top 100 sites), network logs analyzed via automated script                                  | Any telemetry = blocker                                                       |
| **Fingerprinting Resistance**         | Pass Panopticlick + EFF Cover Your Tracks (>12 bits entropy reduction)        | Automated + manual testing quarterly                                                                              | Fail either test = blocker                                                    |
| **Ad/Tracker Blocking Parity**        | Match or exceed Brave on top 100 sites (>95% block rate)                      | Automated testing suite comparing blocked requests vs. Brave baseline                                             | <95% parity = blocker                                                         |
| **YouTube Ad Blocking**               | 90-95% pre-roll/mid-roll/search ads blocked (best-effort, cat-and-mouse game) | Manual testing on YouTube (20+ videos across categories, diverse content types); automated detection of ad bypass | >10% ads shown = concern; filter update process documented for weekly updates |
| **Consent Banner Accuracy**           | 100% (correct data disclosure before cloud calls)                             | Manual review + automated testing (compare banner content vs. actual data sent)                                   | Inaccurate disclosure = blocker                                               |

---

### **AI Metrics (Critical — Must-Have)**

| Metric                                 | Target                                                   | Measurement Method                                                                                           | Success Threshold            |
| -------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| **Local Query Rate**                   | 80-90% queries handled locally (no cloud)                | Audit log analysis: local vs. cloud operations over 1-week user testing period                               | <80% = concern               |
| **Summarization Latency (Local)**      | p95 <2s, p50 <1.5s                                       | Automated benchmark: 100 Wikipedia articles (5-15KB), Llama 3.2 3B on reference hardware (8GB RAM, Intel i5) | p95 >2s = concern            |
| **Translation Latency (Local)**        | p95 <3s for 500-word text                                | Automated benchmark: 50 sample texts, multiple languages (EN↔ES, EN↔FR, EN↔AR)                            | p95 >3s = acceptable         |
| **Q&A Accuracy**                       | 85%+ correct answers (page context)                      | Human evaluation: 100 Q&A pairs on diverse content (news, technical docs, legal text)                        | <80% = concern               |
| **Model Resource Monitoring Accuracy** | RAM/VRAM estimates ±10% of actual                        | Compare dashboard readings to OS task manager (100 samples across different models)                          | >20% deviation = blocker     |
| **AI Feature Adoption Rate**           | 60%+ users try at least one AI feature in first week     | Telemetry (opt-in) tracking feature usage events                                                             | <50% = concern               |
| **Cloud Consent Approval Rate**        | Track accept vs. deny ratio (baseline metric, no target) | Audit log analysis of consent decisions                                                                      | Baseline for UX optimization |
| **Streaming Response Latency**         | First token <500ms (local), <1s (cloud)                  | Automated benchmark measuring time-to-first-token                                                            | >1s local = concern          |

---

### **Performance Metrics (High Priority)**

| Metric                           | Target                             | Measurement Method                                                                                                           | Success Threshold     |
| -------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **Battery Improvement**          | 15-20% gain vs. Chrome/Brave       | 4-hour reference workload (10 tabs: YouTube video, Gmail, news sites), battery report comparison on laptop with 50Wh battery | <15% = concern        |
| **RAM Reduction (Tab Freezing)** | 30-40% with 15 frozen tabs         | Memory profiler before/after freeze on reference hardware (measure working set size)                                         | <25% = concern        |
| **Tab Restore Latency**          | p95 <100ms from frozen state       | Automated benchmark: 50 freeze/restore cycles per tab, measure time from restore trigger to DOM ready                        | p95 >150ms = concern  |
| **Page Load Time**               | Match Chromium baseline (±5%)      | Speedometer 3.0 benchmark (public test suite)                                                                                | >10% slower = concern |
| **CPU Usage (Idle)**             | <2% with AI engine running         | Task manager monitoring (5-minute idle period, Ollama running in background)                                                 | >5% = concern         |
| **Binary Size**                  | <200MB installer (Windows x64)     | Measure final `.exe` installer package size                                                                                  | >250MB = concern      |
| **First Run Experience**         | <10s from launch to usable browser | Automated timing (cold start on reference hardware: SSD, 8GB RAM)                                                            | >15s = concern        |

---

### **MCP Metrics (High Priority)**

| Metric                           | Target                                                                  | Measurement Method                                                                                          | Success Threshold          |
| -------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------- |
| **Native MCP Servers Available** | 3+ in MVP (tabs, bookmarks, history)                                    | Feature checklist verification (manual + automated test)                                                    | <3 = blocker               |
| **MCP Tool Invocation Latency**  | <100ms overhead (stdio), <200ms (HTTP+SSE)                              | Automated benchmark: 100 tool calls per transport type, measure IPC + processing time                       | p95 >150ms stdio = concern |
| **MCP Consent Coverage**         | 100% of tool calls consent-gated                                        | Audit log analysis: verify consent record exists for every tool invocation                                  | <100% = blocker            |
| **Community MCP Server Support** | 5-10 servers by Phase 3                                                 | Count of vetted, installable servers in MCP Store (privacy-labeled + audited)                               | <5 by Phase 3 = concern    |
| **MCP Protocol Compliance**      | 100% (MCP 2024-11-05 spec, with forward compatibility for future specs) | Automated protocol conformance tests (JSONSchema validation + transport tests); version negotiation support | Any failure = blocker      |

---

### **Quality Metrics (High Priority)**

| Metric                         | Target                               | Measurement Method                                                       | Success Threshold                    |
| ------------------------------ | ------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------ |
| **Test Coverage**              | 80%+ (unit + integration + e2e)      | Code coverage reports: gtest (C++), jest (TypeScript), Playwright (e2e)  | <75% = concern                       |
| **Critical CVE Count**         | 0 unpatched critical vulnerabilities | Dependabot alerts + manual security audits (quarterly)                   | Any critical CVE >7 days = blocker   |
| **SLSA Level**                 | Level 3 attestations for all builds  | SLSA verification tooling (slsa-verifier CLI)                            | <Level 3 = blocker                   |
| **SBOM Coverage**              | 100% of dependencies tracked         | CycloneDX SBOM validation (verify all `DEPS` + npm dependencies present) | <95% = concern                       |
| **Build Success Rate (CI/CD)** | 95%+ on main branch                  | GitHub Actions/GitLab CI metrics (successful builds / total builds)      | <90% = concern                       |
| **Crash Rate**                 | <0.1% of sessions                    | Crash reporting (opt-in telemetry, breakpad integration)                 | >0.5% = concern                      |
| **Bug Density**                | <5 bugs per 1,000 lines of code      | Issue tracker analysis + code review metrics (quarterly audit)           | >10 = concern                        |
| **Security Audit Findings**    | 0 high-severity issues unresolved    | Quarterly penetration testing + code audits (track time-to-resolution)   | Any high-severity >30 days = blocker |

---

### **Adoption Metrics (Medium Priority — Post-Launch)**

| Metric                                    | Target                                                            | Measurement Method                                                                                                                    | Success Threshold            |
| ----------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **Active Users (Public Alpha)**           | 10,000+ by 6 months post-launch                                   | Telemetry opt-in (anonymous usage pings, daily active user count)                                                                     | <5,000 = concern             |
| **Enterprise Pilot Deployments**          | 5+ LOIs/POC agreements by Phase 3, 2+ signed contracts by Month 9 | Direct outreach + enterprise signup tracking (signed agreements/LOIs); outreach starts Phase 1 to account for 6-12 month sales cycles | <3 LOIs by Phase 3 = concern |
| **GitHub Stars**                          | 5,000+ by 6 months                                                | GitHub metrics (star count tracking)                                                                                                  | <2,500 = concern             |
| **Contributors**                          | 100+ by 6 months                                                  | GitHub contributor count (unique authors with merged PRs)                                                                             | <50 = concern                |
| **Documentation Page Views**              | 1,000+ daily unique visitors by 6 months                          | Analytics on docs site (Google Analytics or privacy-respecting alternative)                                                           | <500 = concern               |
| **Extension/MCP Marketplace Submissions** | 2+ community submissions per week by 6 months                     | Marketplace activity tracking (new submissions + updates)                                                                             | <1/week = concern            |
| **User Retention (30-day)**               | 40%+ of users active after 30 days                                | Telemetry opt-in cohort analysis (Day 1 cohort → Day 30 active users)                                                                 | <30% = concern               |
| **Net Promoter Score (NPS)**              | 40+ (promoters - detractors)                                      | User surveys (quarterly, 10-point scale: 0-10)                                                                                        | <20 = concern                |

---

### **Security Metrics (Critical — Ongoing)**

| Metric                         | Target                                         | Measurement Method                                                                   | Blocker Threshold             |
| ------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------- |
| **Supply-Chain Integrity**     | SLSA Level 3 + Cosign + Rekor transparency log | Automated verification in CI/CD (slsa-verifier + cosign verify)                      | Missing attestation = blocker |
| **Dependency Vulnerabilities** | Resolve critical/high within 48 hours          | Dependabot alerts + manual tracking (time from alert to PR merged)                   | >7 days unresolved = blocker  |
| **Reproducible Builds**        | 100% of releases reproducible                  | Independent build verification (compare checksums from different build environments) | Non-reproducible = blocker    |
| **Signature Verification**     | 100% of releases Cosign-signed                 | Automated verification script (`cosign verify` on all artifacts)                     | Unsigned release = blocker    |
| **Penetration Test Findings**  | 0 critical, <5 medium per quarter              | Quarterly pen-test reports (track severity distribution)                             | Any critical = blocker        |
| **Fuzzing Coverage**           | 80%+ of C++ code fuzz-tested                   | Fuzzing infrastructure metrics (ClusterFuzz or OSS-Fuzz style tracking)              | <70% = concern                |

---

### **Metrics Dashboard & Tracking**

**Daily Monitoring**:

- Privacy metrics (audit coverage, unsanctioned egress)
- Performance metrics (battery, RAM, latency)
- Build success rate (CI/CD pipelines)

**Weekly Reviews**:

- AI metrics (query rate, latency, adoption)
- MCP metrics (tool invocations, consent coverage)
- Quality metrics (test coverage, crash rate)

**Monthly Reviews**:

- Adoption metrics (users, contributors, engagement)
- Security metrics (vulnerabilities, pen-test findings)
- Risk register update (emerging risks, mitigation effectiveness)

**Quarterly Reviews**:

- Strategic KPI review with stakeholders (OKR alignment)
- Roadmap adjustments based on metric trends
- User satisfaction surveys (NPS)
- Security audits (third-party penetration testing)

---

## **8. Dependencies**

### **Core Dependencies**

| Dependency       | Version/Tag                                                     | Purpose                                                                  | Source                    | License             |
| ---------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------- | ------------------- |
| **Chromium**     | 131.0.6778.85 (Stable, tracking Extended Stable for enterprise) | Browser engine base                                                      | chromium.googlesource.com | BSD-3-Clause        |
| **Siso**         | Latest (Chromium bundled)                                       | Build executor (experimental, replacing Ninja)                           | Chromium project          | BSD-3-Clause        |
| **Ninja**        | Latest (Chromium bundled)                                       | Build executor (fallback if Siso unstable)                               | Chromium project          | Apache 2.0          |
| **GN**           | Latest (Chromium bundled)                                       | Meta-build system (generates .ninja files)                               | Chromium project          | BSD-3-Clause        |
| **Mojo**         | Latest (Chromium bundled)                                       | IPC framework (.mojom IDL compiler)                                      | Chromium project          | BSD-3-Clause        |
| **V8**           | Latest (Chromium bundled)                                       | JavaScript engine                                                        | Chromium project          | BSD-3-Clause        |
| **BoringSSL**    | Latest (Chromium bundled)                                       | Ed25519 signing, Merkle trees, crypto primitives, FIPS 140-2/3 validated | Chromium project          | OpenSSL/ISC License |
| **LevelDB**      | Latest (Chromium bundled)                                       | Audit log storage, consent records, key-value store                      | Google's LevelDB          | BSD-3-Clause        |
| **Node.js**      | v24+                                                            | Build scripts, development tooling                                       | nodejs.org                | MIT                 |
| **TypeScript**   | 5.5+                                                            | UI type safety, React components                                         | typescriptlang.org        | Apache 2.0          |
| **React**        | 19+                                                             | Web UI framework (settings, dashboards)                                  | react.dev                 | MIT                 |
| **Tailwind CSS** | 4+                                                              | UI styling framework                                                     | tailwindcss.com           | MIT                 |

### **Optional Runtime Dependencies**

| Dependency | Purpose                                     | Installation   | License       |
| ---------- | ------------------------------------------- | -------------- | ------------- |
| **Ollama** | Local AI inference (primary recommendation) | ollama.ai      | MIT           |
| **Tor**    | Privacy routing (Tor mode)                  | torproject.org | BSD-3-Clause  |
| **I2P**    | Privacy routing (I2P mode)                  | geti2p.net     | Public Domain |

### **Development Dependencies**

| Tool                  | Purpose                                | Installation        |
| --------------------- | -------------------------------------- | ------------------- |
| **Python 3.11+**      | Build scripts, patch automation, CI/CD | python.org          |
| **Git**               | Version control, patch management      | git-scm.com         |
| **gclient**           | Chromium dependency management         | Part of depot_tools |
| **clang-format**      | C++ code formatting                    | Chromium bundled    |
| **eslint + prettier** | TypeScript/React linting/formatting    | npm install         |
| **gtest**             | C++ unit testing                       | Chromium bundled    |
| **jest**              | TypeScript/React unit testing          | npm install         |
| **Playwright**        | End-to-end browser testing             | playwright.dev      |

### **Build Infrastructure Dependencies**

| Tool                         | Purpose                         | Optional/Required           |
| ---------------------------- | ------------------------------- | --------------------------- |
| **Cosign**                   | Artifact signing (SLSA Level 3) | Required for release        |
| **CycloneDX**                | SBOM generation                 | Required for release        |
| **BuildBuddy/NativeLink**    | Remote execution (Siso)         | Optional (speeds up builds) |
| **GitHub Actions/GitLab CI** | CI/CD automation                | Required                    |

### **Dependency Management**

- **Chromium dependencies**: Managed via `DEPS` file (gclient sync)
- **Node.js dependencies**: Managed via `package.json` (npm install)
- **System dependencies**: Documented in `/docs/contributing/build-instructions.md` per platform

### **Versioning Strategy**

- **Chromium releases**: Pin to stable Chromium releases (e.g., `131.0.6778.85`), tracking Extended Stable channel for enterprise deployments (8-week update cadence vs. 6-week for stable)
- **Upstream sync**: Automated canary builds track Chromium main branch; production follows stable releases with 2-week validation window
- **Semantic versioning**: Toubkal releases use semver (e.g., `v1.0.0`)
- **Dependency updates**: Quarterly review of npm dependencies, immediate critical CVE patches
- **Fallback strategy**: Maintain compatibility with previous Chromium milestone for emergency rollbacks

---

## **10. Business Model & Revenue Strategy**

### **Revenue Philosophy**

Toubkal's revenue model aligns with our privacy-first principles: **users never pay with their data**. We monetize through value-added services that enhance privacy, not compromise it.

### **Revenue Streams**

#### **1. Enterprise Licensing (Primary Revenue — 60-70%)**

**Target Market**: Organizations with 50-10,000+ employees requiring privacy-compliant AI browsers

**Pricing Model** (per user/year):

- **Starter**: $50/user/year (50-250 users) — Basic enterprise policies, email support
- **Professional**: $150/user/year (250-1,000 users) — Advanced policies, SSO/SAML, priority support
- **Enterprise**: $300/user/year (1,000+ users) — Custom policies, dedicated account manager, SLA guarantees

**Value Proposition**:

- Local-only AI enforcement (GDPR/HIPAA compliance)
- Exportable audit logs (SOC 2, ISO 27001 compliance)
- Group Policy/MDM deployment
- Priority security patches
- Custom MCP server integration

**Revenue Projection** (Phase 3, Year 1):

- 5 pilot organizations × 100 users × $150/user = $75K ARR
- Year 2 target: 50 organizations × 200 users × $150/user = $1.5M ARR

#### **2. Cloud AI Credits (Secondary Revenue — 20-30%)**

**Model**: Toubkal-managed cloud AI gateway with privacy guarantees

**Pricing**:

- OpenAI GPT-4 via Toubkal: $0.03/1K input tokens, $0.06/1K output tokens (10-15% markup)
- Anthropic Claude via Toubkal: $0.015/1K input tokens, $0.075/1K output tokens (10-15% markup)
- Toubkal privacy guarantee: All cloud requests Ed25519-signed, zero data retention by default

**Why Users Pay Premium**:

- Cryptographic proof of privacy (signed consent records)
- No third-party tracking (Toubkal intermediary strips metadata)
- Automatic audit log integration

**Revenue Projection** (Year 1):

- 10,000 active users × 10% cloud usage × $5/month avg = $60K/year
- Year 2 target (100K users): $600K/year

#### **3. MCP Marketplace (Emerging Revenue — 10-15%)**

**Model**: Curated marketplace for premium MCP servers

**Revenue Share**: 70% developer, 30% Toubkal

**Premium MCP Server Examples**:

- **Legal Research MCP** ($9.99/month): LexisNexis/Westlaw integration for lawyers
- **Medical Records MCP** ($19.99/month): HIPAA-compliant EHR integration for doctors
- **DevOps MCP** ($14.99/month): AWS/Azure/GCP management tools
- **Financial MCP** ($29.99/month): Bloomberg Terminal integration for analysts

**Revenue Projection** (Year 1):

- 50 premium MCP servers × 100 subscribers × $15 avg × 30% = $67.5K/year
- Year 2 target: 200 servers × 500 subscribers = $450K/year

#### **4. Professional Services (Opportunistic — 5-10%)**

**Services**:

- **Custom Browser Builds**: $25-50K/engagement (white-label Toubkal for enterprises)
- **MCP Server Development**: $10-25K/server (build custom MCP servers for orgs)
- **Training & Onboarding**: $5-10K/organization (on-site training for enterprise deployments)
- **Security Audits**: $15-30K/audit (third-party penetration testing for enterprises)

**Revenue Projection** (Year 1):

- 5 engagements × $30K avg = $150K/year

### **Total Revenue Projections**

| Year              | Enterprise Licenses | Cloud AI Credits | MCP Marketplace | Professional Services | **Total ARR** |
| ----------------- | ------------------- | ---------------- | --------------- | --------------------- | ------------- |
| Year 1 (Phase 3+) | $75K                | $60K             | $67.5K          | $150K                 | **$352.5K**   |
| Year 2            | $1.5M               | $600K            | $450K           | $300K                 | **$2.85M**    |
| Year 3            | $5M                 | $1.5M            | $1M             | $500K                 | **$8M**       |

### **Non-Revenue Growth Strategies**

**Community Edition** (Free, Forever):

- Individual users (non-enterprise)
- Full feature access (local AI, MCP, audit logs)
- No telemetry, no ads, no data collection
- Community support (Discord, GitHub Discussions)

**Why Free Tier Drives Growth**:

- ✅ Viral adoption (users become enterprise advocates)
- ✅ Developer ecosystem (MCP server builders)
- ✅ Security researchers (audit open-source code)
- ✅ Brand loyalty (users trust Toubkal privacy claims)

### **Monetization Principles**

1. **Privacy-Aligned**: Never monetize user data; charge for value-added services
2. **Transparent Pricing**: All pricing public (no enterprise "contact sales" opacity)
3. **No Feature Paywalls**: Core privacy features (audit trail, consent fabric) always free
4. **Open Source Core**: Browser engine remains MPL 2.0; only enterprise tooling proprietary

### **Revenue Milestones**

| Milestone                  | Target Date            | Revenue Target  | Key Metric                    |
| -------------------------- | ---------------------- | --------------- | ----------------------------- |
| First Enterprise Pilot     | Phase 3 (Week 20)      | $0 (free pilot) | 5 orgs, 50+ users each        |
| First Paid Customer        | Month 7 (post-Phase 3) | $15K ARR        | 1 org, 100 users, $150/user   |
| Profitability (Break-Even) | Month 18               | $500K ARR       | Cover 3 FTE engineers + infra |
| Series A Fundability       | Month 24               | $2M ARR         | 30%+ MoM growth, <$1M burn    |

### **Cost Structure (for Context)**

**Year 1 Costs** (Phase 1-3):

- Engineering (3 FTE × $150K) = $450K
- Infrastructure (CI/CD, BuildBuddy, hosting) = $50K
- Legal/Compliance (SLSA, SOC 2 prep) = $50K
- Marketing (docs site, community) = $25K
- **Total**: $575K

**Funding Strategy**:

- Bootstrap (founder capital) or small angel round ($500K-1M) for Year 1
- Series A ($5-10M) at Month 18-24 if hitting revenue milestones

---

## **11. Internationalization & Localization (i18n/l10n)**

### **i18n Strategy**

Toubkal targets global adoption with multi-language support aligned with privacy-conscious markets and high AI adoption regions.

### **Target Languages by Phase**

**Phase 1 (Weeks 1-8)**: English Only

- Focus: MVP development, technical foundation
- Locales: `en-US` (primary)

**Phase 2 (Weeks 9-16)**: Western Markets

- **Spanish** (`es-ES`, `es-MX`): 500M+ speakers, high privacy awareness
- **French** (`fr-FR`, `fr-CA`): EU market, strong GDPR compliance culture
- **German** (`de-DE`): Enterprise focus (Germany, Austria, Switzerland)
- **Portuguese** (`pt-BR`): Brazil's large tech-savvy population

**Phase 3 (Weeks 17-24)**: Global Expansion

- **Arabic** (`ar-SA`, `ar-EG`): Middle East privacy-conscious markets
- **Simplified Chinese** (`zh-CN`): Mainland China (if viable post-censorship analysis)
- **Japanese** (`ja-JP`): Tech-forward market, high AI adoption
- **Korean** (`ko-KR`): High privacy awareness, strong tech ecosystem

**Post-MVP (Year 2+)**: Emerging Markets

- **Hindi** (`hi-IN`), **Russian** (`ru-RU`), **Italian** (`it-IT`), **Dutch** (`nl-NL`), **Polish** (`pl-PL`)

### **Implementation Approach**

**1. Chromium's Grit System**

- Use Chromium's built-in Grit localization framework
- Store strings in `/toubkal/app/strings/toubkal_strings.grd`
- Auto-generate C++ headers (`IDS_TOUBKAL_*` constants)
- Example:

```xml
<!-- toubkal_strings.grd -->
<message name="IDS_TOUBKAL_PRIVACY_DASHBOARD" desc="Page title for Transparency Dashboard">
  Transparency Dashboard
</message>
```

**2. React UI Localization**

- Library: `react-i18next` (industry standard, 10M+ weekly downloads)
- Translation files: `/toubkal/app/locales/{lang}/translation.json`
- Auto-sync with Grit (build script converts `.grd` → `.json`)
- Example:

```json
{
  "privacy_dashboard": {
    "title": "Transparency Dashboard",
    "export_button": "Export Audit Log"
  }
}
```

**3. Right-to-Left (RTL) Support**

- Arabic, Hebrew support via CSS `dir="rtl"`
- Tailwind CSS auto-generates RTL utilities (`rtl:` prefix)
- Test on Arabic (`ar-SA`) as primary RTL validation

### **Translation Workflow**

**Phase 2-3 (Professional Translations)**:

1. Export strings to XLIFF format (Grit native format)
2. Send to professional translation service (e.g., Crowdin, Phrase, POEditor)
3. Import translated XLIFF → update `.grd` files
4. Native speaker QA (1-2 reviewers per language)

**Post-MVP (Community Translations)**:

- Open Crowdin project for community contributions
- Core strings (privacy/security) remain professionally translated
- Community translates non-critical UI (settings descriptions, help text)

### **Locale-Specific Considerations**

| Language                 | Special Requirements                               | Notes                                                   |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------- |
| **Arabic**               | RTL layout, date/number formatting                 | Test with Saudi Arabia (`ar-SA`) dialect                |
| **Chinese (Simplified)** | Font support (Noto Sans CJK), IME compatibility    | Censorship risk: defer if Great Firewall blocks Toubkal |
| **Japanese**             | Vertical text support (optional), honorifics in UI | Polite forms (`desu/masu`) for user-facing text         |
| **German**               | Long compound words (word wrapping)                | "Datenschutz-Grundverordnung" (GDPR in German)          |
| **French**               | Gender agreement (e.g., "connecté(e)")             | Canadian French (`fr-CA`) differs from France (`fr-FR`) |

### **Testing Strategy**

**Automated Tests**:

- String coverage: 100% of UI strings must exist in all target locales
- Placeholder validation: `{count}` placeholders match across translations
- CI/CD check: Fail build if missing translations

**Manual QA**:

- Native speaker testing (1-2 testers per language, Phase 2-3)
- Screenshot comparison (English vs. translated UI)
- RTL layout verification (Arabic, Hebrew)

### **Metrics**

| Metric                   | Target                            | Measurement                         |
| ------------------------ | --------------------------------- | ----------------------------------- |
| **Translation Coverage** | 100% core UI by Phase 2           | Automated Grit coverage report      |
| **Translation Quality**  | 95%+ accuracy (native speaker QA) | Manual review scoring (1-5 scale)   |
| **RTL Layout Issues**    | 0 critical bugs                   | Manual testing on Arabic locale     |
| **Non-English Adoption** | 30%+ of users by Year 2           | Telemetry opt-in language breakdown |

### **Budget**

**Phase 2 Professional Translations** (4 languages: ES, FR, DE, PT):

- ~5,000 strings × 4 languages × $0.10/word avg = **$20K**
- Native speaker QA (2 reviewers × 4 languages × $500) = **$4K**
- **Total Phase 2**: $24K

**Phase 3 Professional Translations** (4 languages: AR, ZH, JA, KO):

- ~6,000 strings × 4 languages × $0.12/word avg (CJK premium) = **$28.8K**
- **Total Phase 3**: ~$32K

**Year 2 Community Translations**: $0 (community-driven via Crowdin)

### **Deferred Features (Post-MVP)**

- **Voice input/output localization** (accents, dialects)
- **Currency formatting** (if MCP Marketplace goes global)
- **Legal document translations** (Privacy Policy, Terms of Service)

---

## **12. Accessibility & Compliance (WCAG)**

### **Accessibility Philosophy**

Toubkal's privacy features must be **accessible to all users**, including those with disabilities. WCAG 2.1 Level AA compliance is a **requirement**, not an optional feature.

### **WCAG 2.1 Level AA Targets**

**Phase 1 (Baseline)**:

- Keyboard navigation for all features (no mouse required)
- Screen reader support (NVDA, JAWS, VoiceOver)
- Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Focus indicators (visible keyboard focus)

**Phase 2 (Enhanced)**:

- ARIA labels for dynamic content (AI responses, audit logs)
- Captions/transcripts for video tutorials
- Resizable text (up to 200% without layout breakage)

**Phase 3 (Advanced)**:

- Voice control support (Dragon NaturallySpeaking)
- High contrast mode
- Reduced motion preferences (`prefers-reduced-motion`)

### **Key Accessibility Features**

| Feature                   | WCAG Criterion                      | Implementation                                            | Phase   |
| ------------------------- | ----------------------------------- | --------------------------------------------------------- | ------- |
| **Keyboard Navigation**   | 2.1.1 (Keyboard)                    | All buttons/links accessible via `Tab`, `Enter`, `Space`  | Phase 1 |
| **Screen Reader Support** | 4.1.2 (Name, Role, Value)           | ARIA labels for AI Overlay, Transparency Dashboard        | Phase 1 |
| **Color Contrast**        | 1.4.3 (Contrast Minimum)            | Tailwind CSS enforces 4.5:1 contrast (audit via axe-core) | Phase 1 |
| **Focus Indicators**      | 2.4.7 (Focus Visible)               | Custom focus rings (`ring-2 ring-toubkal-primary`)        | Phase 1 |
| **Skip Links**            | 2.4.1 (Bypass Blocks)               | "Skip to main content" link on all pages                  | Phase 1 |
| **Alt Text for Images**   | 1.1.1 (Non-text Content)            | All icons/diagrams have descriptive alt text              | Phase 1 |
| **ARIA Live Regions**     | 4.1.3 (Status Messages)             | AI streaming responses use `aria-live="polite"`           | Phase 2 |
| **Resizable Text**        | 1.4.4 (Resize Text)                 | UI scales to 200% zoom without horizontal scrolling       | Phase 2 |
| **Captions**              | 1.2.2 (Captions Prerecorded)        | Video tutorials include captions                          | Phase 3 |
| **Reduced Motion**        | 2.3.3 (Animation from Interactions) | Respect `prefers-reduced-motion` CSS media query          | Phase 3 |

### **Testing Strategy**

**Automated Testing**:

- **axe-core** (Deque): Run in CI/CD on every build (catches 30-50% of issues)
- **Lighthouse Accessibility Audit**: 100/100 score target
- **ESLint jsx-a11y Plugin**: Catch missing ARIA labels at build time

**Manual Testing**:

- **Screen Reader Testing**: NVDA (Windows), JAWS (Windows), VoiceOver (macOS)
- **Keyboard-Only Testing**: Navigate all features without mouse
- **Color Contrast**: Manual spot-checks with Stark plugin (Figma/Chrome)

**User Testing**:

- Recruit 3-5 users with disabilities (blind, low vision, motor impairments) per phase
- Pay $100/hr for 1-hour usability sessions

### **Keyboard Shortcuts (All Accessible)**

| Shortcut            | Action                      | WCAG Criterion   |
| ------------------- | --------------------------- | ---------------- |
| `Ctrl+Shift+I`      | Open AI Overlay             | 2.1.1 (Keyboard) |
| `Ctrl+Shift+A`      | Open Transparency Dashboard | 2.1.1 (Keyboard) |
| `Ctrl+Shift+M`      | Open MCP Server Manager     | 2.1.1 (Keyboard) |
| `Esc`               | Close overlays/modals       | 2.1.1 (Keyboard) |
| `Tab` / `Shift+Tab` | Navigate UI elements        | 2.1.1 (Keyboard) |
| `Enter` / `Space`   | Activate buttons/links      | 2.1.1 (Keyboard) |

### **Metrics**

| Metric                             | Target                       | Measurement                                       |
| ---------------------------------- | ---------------------------- | ------------------------------------------------- |
| **Lighthouse Accessibility Score** | 100/100                      | Automated Lighthouse CI                           |
| **axe-core Violations**            | 0 critical issues            | CI/CD gating (fail build if violations)           |
| **Keyboard Navigation Coverage**   | 100% of features             | Manual QA checklist                               |
| **Screen Reader Compatibility**    | 100% (NVDA, JAWS, VoiceOver) | Manual testing with assistive tech                |
| **User Testing Satisfaction**      | 8/10+ (SUS score)            | Post-session surveys with users with disabilities |

### **Budget**

**Phase 1-2 Accessibility**:

- axe-core integration (built-in, $0)
- User testing with disabilities (5 users × 1 hour × $100/hr) = **$500**

**Phase 3 Advanced Accessibility**:

- Captions for video tutorials (5 videos × $100/video) = **$500**
- High contrast theme design (20 hours × $100/hr) = **$2K**
- **Total Phase 3**: **$2.5K**

---

## **13. Privacy Policy & GDPR Compliance**

### **Privacy Policy Principles**

Toubkal's privacy policy reflects our **radical transparency** ethos: users own their data, not us.

### **Core Commitments**

1. **Zero Data Collection by Default**: No telemetry, analytics, or cloud sync without explicit opt-in
2. **Local-First Storage**: Audit logs, bookmarks, history, AI conversations stored **only** on user's device
3. **Cryptographic Proof**: Every operation logged with Ed25519 signature; users can export transparency proofs
4. **Right to Erasure**: Users can delete all data (audit logs, consent records, workspace context) at any time
5. **No Third-Party Sharing**: Zero data sold or shared with advertisers, analytics providers, or cloud AI vendors (unless user consents)

### **GDPR Compliance (EU Regulation 2016/679)**

**Lawful Basis for Processing** (Article 6):

- **Consent** (6.1.a): All data processing requires explicit opt-in (e.g., telemetry, cloud AI)
- **Legitimate Interest** (6.1.f): Local-only features (ad blocking, audit logging) do not transmit data

**Data Subject Rights** (Chapter 3):

- **Right to Access** (Art. 15): Export audit logs as JSON/CSV/PDF
- **Right to Erasure** (Art. 17): "Delete all data" button in `toubkal://settings/privacy`
- **Right to Data Portability** (Art. 20): Export bookmarks, history, AI context as JSON
- **Right to Object** (Art. 21): Opt-out of telemetry (default: opted-out)

**Data Retention** (Article 5.1.e):

- **Audit Logs**: Default 90 days, user-configurable (30/90/365 days, or indefinite)
- **Consent Records**: Retained indefinitely (or until user deletes)
- **Telemetry Data** (if opted-in): Anonymized, 30-day rolling window

### **HIPAA Compliance (Healthcare Deployments)**

**Applicability**: If enterprise customers (hospitals, clinics) deploy Toubkal for medical AI use cases

**Requirements**:

- **PHI Encryption**: All audit logs encrypted at rest (AES-256)
- **Access Controls**: Biometric/passkey authentication for AI operations
- **Audit Trails**: HIPAA requires 6-year retention → configure Toubkal audit logs accordingly
- **Business Associate Agreement (BAA)**: Toubkal (company) signs BAA with healthcare customers

**Toubkal Advantage**: Local-only AI = no PHI transmitted to cloud = easier HIPAA compliance

### **CCPA Compliance (California Consumer Privacy Act)**

**Data Categories**:

- **Personal Information**: Browsing history, bookmarks (stored locally only)
- **Opt-Out**: "Do Not Sell My Personal Information" link (N/A—we don't sell data)

**Consumer Rights**:

- **Right to Know**: Export all data (`toubkal://settings/privacy/export`)
- **Right to Delete**: Delete all data (`toubkal://settings/privacy/delete`)

### **Privacy Policy Content (Key Sections)**

**1. Data We Collect** (Transparency):

- **Local-Only Data**: Audit logs, bookmarks, history, AI conversations (never leaves device unless user exports)
- **Optional Telemetry** (Opt-In): Crash reports, feature usage, performance metrics (anonymized, 30-day retention)
- **Cloud AI Data** (Consent-Gated): If user consents to OpenAI/Anthropic, prompt + response sent to cloud (logged in audit trail)

**2. How We Use Data**:

- **Audit Logs**: Transparency Dashboard, compliance exports, forensic replay
- **Telemetry** (Opt-In): Improve performance, fix bugs, prioritize features
- **Cloud AI**: Fulfill user's AI request (data not retained by Toubkal, subject to third-party policies)

**3. Data Sharing**:

- **Zero Sharing by Default**: No third parties unless user consents (e.g., cloud AI providers)
- **Cloud AI Providers**: OpenAI, Anthropic, Gemini (only if user consents per-request)
- **Legal Compliance**: We may disclose data if required by law (rare, local-first architecture minimizes this)

**4. Data Retention**:

- **Audit Logs**: 90 days (configurable 30/90/365/indefinite)
- **Telemetry**: 30 days (anonymized, aggregated)
- **Cloud AI Requests**: Not retained by Toubkal (subject to third-party retention policies)

**5. User Rights**:

- **Export Data**: `toubkal://settings/privacy/export` (JSON/CSV/PDF)
- **Delete Data**: `toubkal://settings/privacy/delete` (irreversible, includes audit logs)
- **Opt-Out Telemetry**: Default opted-out; can opt-in via `toubkal://settings/privacy`

**6. Security**:

- **Encryption**: Ed25519 signatures, AES-256 at-rest encryption (audit logs)
- **FIPS Compliance**: BoringSSL FIPS 140-2/3 validated crypto
- **Reproducible Builds**: SLSA Level 3 attestations prevent supply-chain attacks

**7. Contact**:

- **Data Protection Officer**: privacy@toubkal.com
- **GDPR Inquiries**: gdpr@toubkal.com

### **Privacy Policy Updates**

**Version Control**:

- Privacy Policy v1.0 (Phase 1 launch)
- v1.1 (Phase 2: add cloud AI disclosure)
- v1.2 (Phase 3: add MCP Marketplace data sharing)

**User Notification**:

- In-browser banner when policy changes (requires "Accept" before continuing)
- Email notification (if user opted-in to email communications)

### **Implementation**

**Privacy Settings UI** (`toubkal://settings/privacy`):

- **Export Data**: Button → download audit logs, bookmarks, history (JSON/CSV/PDF)
- **Delete All Data**: Button → confirm dialog → irreversible deletion
- **Telemetry Opt-In**: Toggle (default: OFF)
- **Audit Log Retention**: Dropdown (30/90/365/indefinite days)
- **Cloud AI Consent History**: Table (timestamp, provider, data sent, consent decision)

**Privacy Policy Page** (`toubkal://privacy` or static site):

- Plain language (8th-grade reading level, <3,000 words)
- Expandable sections (GDPR, CCPA, HIPAA)
- Changelog (version history with diff view)

### **Metrics**

| Metric                       | Target                               | Measurement                       |
| ---------------------------- | ------------------------------------ | --------------------------------- |
| **Privacy Policy Read Rate** | 15%+ users visit `toubkal://privacy` | Analytics (opt-in telemetry)      |
| **Data Export Requests**     | <5% users (low = good trust signal)  | Count of export button clicks     |
| **Data Deletion Requests**   | <1% users (low = good UX signal)     | Count of delete button clicks     |
| **GDPR Compliance Audits**   | 0 violations                         | Annual third-party privacy audits |
| **Telemetry Opt-In Rate**    | 10-20% (baseline)                    | Track opt-in toggle changes       |

### **Legal Review**

**Phase 1 (Pre-Launch)**:

- Retain privacy lawyer ($5-10K) to review privacy policy
- GDPR compliance checklist (Art. 5, 6, 7, 15-22)
- CCPA compliance checklist (§1798.100-1798.199)

**Phase 3 (Enterprise Prep)**:

- HIPAA compliance review (if targeting healthcare)
- SOC 2 Type I audit prep ($25-50K)

### **Budget**

**Phase 1 Legal**:

- Privacy lawyer retainer (policy review) = **$7.5K**

**Phase 3 Compliance**:

- SOC 2 Type I audit = **$35K**
- HIPAA compliance review (if applicable) = **$10K**
- **Total Phase 3 Legal**: **$45K**

---

## **14. Risks & Mitigations**

### **Technical Risks**

| Risk                                       | Probability | Impact | Quantified Impact                                            | Mitigation                                                                                                                                                          |
| ------------------------------------------ | ----------- | ------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chromium upstream breaking changes**     | High        | High   | 2 weeks delay per milestone; 30K/year DevOps costs           | Nightly canary builds tracking upstream; pinned LKGR (Last Known Good Revision) for releases; automated merge conflict detection; maintain minimal patches/overlays |
| **Siso build system instability**          | Medium      | Medium | 4-week delay if rollback to Ninja required                   | Monitor Chromium's Siso adoption; keep Ninja fallback option in CI/CD; engage with Chromium build team                                                              |
| **Ollama performance on low-end hardware** | Medium      | High   | 6-week roadmap delay; 30% user satisfaction drop             | Model downshifting (Llama 3.2 3B → 1B); cloud fallback with consent; Transformers.js in-browser fallback; performance benchmarks on 8GB RAM machines                |
| **Mojo API surface instability**           | Low         | Medium | 4-week capability sandbox delay; technical debt              | Minimize custom Mojo interfaces; use stable Chromium Mojo APIs; version pinning; upstream-friendly design                                                           |
| **MCP protocol evolution**                 | Medium      | Low    | 2-week integration update per spec change                    | Track Anthropic's MCP spec releases; modular MCP client design; automated protocol conformance tests                                                                |
| **GN build complexity**                    | Medium      | Medium | 20% slower developer onboarding; 10% productivity loss       | Comprehensive build documentation; GN templates for common patterns; developer onboarding videos; automated build setup scripts                                     |
| **WebGPU/WebAssembly compatibility**       | Medium      | Medium | In-browser AI unavailable on older hardware; 15% user impact | Graceful degradation to Ollama; clear system requirements; WebGL fallback where possible                                                                            |

---

### **Market Risks**

| Risk                                       | Probability | Impact | Quantified Impact                                                   | Mitigation                                                                                                                                                   |
| ------------------------------------------ | ----------- | ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **AI browser market saturation**           | Medium      | Medium | 50% revenue target miss; 3-month runway reduction                   | Differentiate on privacy (local-first, cryptographic audit, verifiable); emphasize BYOM and MCP extensibility; enterprise focus (data residency, compliance) |
| **Privacy regulations change (GDPR/CCPA)** | Low         | Medium | 2-month compliance sprint; 50K legal costs                          | Local-first architecture complies by design; modular consent framework allows quick policy updates; quarterly legal reviews                                  |
| **User adoption of local AI models**       | Medium      | High   | 40% feature adoption rate (target: 80%); delayed product-market fit | Seamless cloud fallback with consent; one-click Ollama installer; in-browser Transformers.js as zero-install option; aggressive UX simplification            |
| **Enterprise procurement cycles**          | High        | Medium | 6-month sales cycle delay; deferred 100K ARR                        | Early pilot programs (5+ orgs); compliance documentation (SOC 2, ISO 27001 roadmap); free enterprise trial (90 days)                                         |
| **Competitive response (Chrome/Brave AI)** | High        | High   | Market share erosion; 40% slower user growth                        | Speed to market (MVP in 16 weeks); lock in differentiators (MCP, cryptographic audit, BYOM); open-source moat (community trust)                              |

---

### **Operational Risks**

| Risk                                  | Probability | Impact | Quantified Impact                                        | Mitigation                                                                                                                                                 |
| ------------------------------------- | ----------- | ------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chromium build maintenance burden** | High        | High   | 30% dev capacity consumed by upstream sync               | Minimal C++ overlays (<5% of codebase); automated upstream sync CI; GN-friendly design; leverage Siso remote execution for faster builds                   |
| **Community/contributor growth**      | Medium      | Medium | 20 contributors by M6 (target: 100); sustainability risk | Clear CONTRIBUTING.md; "good first issues" tagged; Discord/Slack community; developer documentation site; contributor recognition program                  |
| **Documentation drift**               | Medium      | Low    | 30% doc accuracy (target: 95%); onboarding friction      | Automated doc generation from code comments; quarterly doc audits; `/docs/architecture/SOURCE-OF-TRUTH.md` canonical reference; CI checks for broken links |
| **CI/CD pipeline costs**              | Medium      | Medium | 50K/year for remote execution (Siso + BuildBuddy)        | GitHub Actions free tier for open source; self-hosted runners for heavy builds; BuildBuddy open-source option; optimize build caching                      |
| **Key person dependency**             | Medium      | High   | 6-month project delay if core dev leaves                 | Knowledge sharing via ADRs; pair programming; comprehensive documentation; bus factor >3 for critical modules                                              |

---

### **Security Risks**

| Risk                              | Probability | Impact   | Quantified Impact                                             | Mitigation                                                                                                                                                            |
| --------------------------------- | ----------- | -------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supply-chain compromise**       | Low         | Critical | Complete project trust loss; 6-month recovery                 | SLSA Level 3 attestations; SBOM verification; Cosign signing; Rekor transparency log; hermetic builds; dependency pinning; Dependabot alerts                          |
| **Zero-day in Chromium**          | Medium      | Critical | Emergency patch within 48 hours; potential user data exposure | Track Chromium security releases; automated CVE monitoring; rapid patch deployment via auto-updater; security mailing list                                            |
| **MCP server malicious behavior** | Medium      | High     | User data exfiltration via rogue MCP server; trust erosion    | Consent-gated tool invocations; sandbox isolation (separate process); privacy labels (local-only/network/remote); community audits; code signing for verified servers |
| **Audit log tampering**           | Low         | High     | Loss of trust in transparency claims; regulatory issues       | Merkle tree integrity verification; Ed25519 signatures; read-only after write; automated tampering detection; public key verification                                 |
| **Extension vulnerability (XSS)** | Medium      | High     | Malicious extension steals user data; reputation damage       | Strict CSP + Trusted Types; extension permission model (least privilege); code review for featured extensions; automated security scans                               |

---

### **Privacy Risks**

| Risk                               | Probability | Impact   | Quantified Impact                                      | Mitigation                                                                                                                                   |
| ---------------------------------- | ----------- | -------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Accidental telemetry leak**      | Low         | Critical | Instant loss of privacy credibility; user exodus       | Zero telemetry by default; network monitoring in CI/CD; quarterly security audits; open-source transparency (community can verify)           |
| **Cloud AI consent bypass**        | Low         | Critical | Unsanctioned data egress; regulatory fines; trust loss | Consent fabric enforced at network layer; cryptographic logging; automated testing (100% consent coverage); kill switch for cloud AI         |
| **Fingerprinting failure**         | Medium      | Medium   | Users trackable across sites; privacy claims weakened  | Continuous testing (Panopticlick, EFF); canvas randomization; WebGL protection; font enumeration blocking; upstream Chromium privacy patches |
| **Privacy routing leak (Tor/I2P)** | Low         | High     | User identity exposed; high-risk users compromised     | Independent security audits of routing implementation; upstream Tor Browser code review; kill switch for leaked connections; user warnings   |

---

### **Risk Monitoring & Response**

**Daily Monitoring**:

- Chromium security mailing list
- Dependabot alerts (critical/high severity)
- CI/CD build failures
- Network monitoring for unsanctioned telemetry

**Weekly Reviews**:

- Upstream Chromium merge conflicts
- MCP server security reports
- User-reported privacy issues
- Performance regression tests

**Monthly Reviews**:

- Risk register update
- Security audit findings
- Dependency vulnerability trends
- Mitigation effectiveness

**Quarterly Reviews**:

- Penetration testing
- Third-party security audits
- Privacy policy compliance review
- Risk mitigation strategy adjustments

---
