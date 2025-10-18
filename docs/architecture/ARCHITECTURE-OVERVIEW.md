# Toubkal Browser — Architecture Overview

**Version:** 1.0  
**Last Updated:** 2025-10-18  
**Owner:** Ilyass Motya
**Audience:** Engineering, Security, Architecture Review

---

## Executive Summary

Toubkal is a **Chromium-based browser** with cryptographically verifiable privacy, local-first AI, and native MCP integration. We follow a **monolithic architecture** using Chromium's GN + Siso build system, inheriting proven patterns from Brave while introducing unique privacy and AI capabilities.

**Key Differentiators:**

- Cryptographic audit trail (Ed25519 + Merkle trees)
- Multi-engine local AI (Ollama, Transformers.js, WebLLM, custom)
- Native MCP protocol integration (first browser with built-in MCP)
- Universal consent fabric (per-request, role-based, time-bound)
- Zero telemetry by default (mathematically provable)

---

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ React WebUI  │  │ AI Overlay   │  │ Transparency │      │
│  │ (Settings)   │  │ (Sidebar)    │  │ Dashboard    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │ Mojo IPC
┌───────────────────────────▼─────────────────────────────────┐
│                   Browser Process (C++)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Privacy      │  │ AI Inference │  │ MCP Client   │      │
│  │ Features     │  │ Gateway      │  │ (Stdio/HTTP) │      │
│  │ - Shields    │  │ - Ollama     │  │ - Tool Mgmt  │      │
│  │ - Consent    │  │ - WebGPU     │  │ - Sandbox    │      │
│  │ - Audit      │  │ - MCP Tools  │  │ - Consent    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────┐       │
│  │         Chromium Core (Navigation, Tabs, Net)    │       │
│  └──────────────────────────────────────────────────┘       │
└───────────────────────────┬─────────────────────────────────┘
                            │ Mojo IPC
┌───────────────────────────▼─────────────────────────────────┐
│                  Renderer Process (C++ + V8)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Blink Engine │  │ JavaScript   │  │ Extension    │      │
│  │ (HTML/CSS)   │  │ (V8 Engine)  │  │ Sandbox      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     GPU Process (C++)                        │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ WebGL/WebGPU │  │ Canvas Accel │  (Hardware-accelerated  │
│  │ Rendering    │  │ (for AI)     │   graphics & compute)   │
│  └──────────────┘  └──────────────┘                         │
└──────────────────────────────────────────────────────────────┘

External Components (Separate Processes):
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Ollama       │  │ MCP Servers  │  │ LevelDB      │
│ (HTTP API)   │  │ (Stdio/HTTP) │  │ (Audit Logs) │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Technology Stack

### Core Technologies

| Layer             | Technology                                       | Purpose                                               | Language   |
| ----------------- | ------------------------------------------------ | ----------------------------------------------------- | ---------- |
| Browser Engine    | Chromium 131+ (Stable, tracking Extended Stable) | Rendering, navigation, network                        | C++        |
| Ad Blocking       | Brave's adblock-rust                             | Network filtering, cosmetic blocking                  | Rust       |
| UI Framework      | React 19 + TypeScript 5.5+                       | Settings, dashboards, MCP Store                       | TypeScript |
| Styling           | Tailwind CSS 4                                   | UI design system                                      | CSS        |
| Build System      | GN + Siso (with Ninja fallback)                  | Meta-build, compilation, linking                      | Python/C++ |
| IPC               | Mojo (.mojom → C++ bindings)                     | Cross-process communication                           | C++/IDL    |
| Crypto            | BoringSSL (Chromium-bundled)                     | Ed25519 signing, Merkle trees, FIPS 140-2/3 validated | C++        |
| JavaScript Engine | V8 (Chromium-bundled)                            | JavaScript execution                                  | C++        |
| **URL Scheme**    | **`toubkal://` (custom)**                        | **Internal pages (replaces `chrome://`)**             | **C++**    |
| Cloud Fallback    | OpenAI, Anthropic, Gemini APIs                   | Consent-gated remote inference                        | TypeScript |

### AI Integration

| Component          | Technology                     | Purpose                                             |
| ------------------ | ------------------------------ | --------------------------------------------------- |
| **Primary AI**     | Ollama (HTTP API)              | Local LLM inference (Llama 3.2, Mistral, CodeLlama) |
| **In-Browser AI**  | Transformers.js + WebGPU       | Zero-install fallback (SmolLM2, Llama 3.2-1B)       |
| **Alternative**    | WebLLM (WebGPU)                | High-performance browser inference                  |
| **Cloud Fallback** | OpenAI, Anthropic, Gemini APIs | Consent-gated remote inference                      |
| **Protocol**       | MCP (Model Context Protocol)   | Standardized AI tool integration                    |

### Development Tools

| Tool                  | Purpose                                     |
| --------------------- | ------------------------------------------- |
| **gclient**           | Chromium dependency management              |
| **depot_tools**       | Build toolchain (Python scripts, Git hooks) |
| **clang-format**      | C++ code formatting                         |
| **eslint + prettier** | TypeScript/React linting and formatting     |
| **gtest**             | C++ unit testing                            |
| **jest**              | TypeScript/React unit testing               |
| **Playwright**        | End-to-end browser testing                  |
| **Cosign**            | Artifact signing (SLSA Level 3)             |
| **CycloneDX**         | SBOM generation                             |

---

## Repository Structure

### Monolithic Architecture

```
/toubkal                           # Root (monolithic, like Chromium)
│
├─ BUILD.gn                        # Root GN build file
├─ .gn                             # GN config (exec_root, buildconfig)
├─ DEPS                            # gclient dependencies (Chromium + Toubkal)
├─ .gclient                        # gclient configuration
├─ LICENSE                         # MPL 2.0
├─ README.md                       # Project overview
├─ CONTRIBUTING.md                 # Contributor guidelines
│
├─ /src                            # Chromium source (fetched by gclient)
│   ├─ /chrome                     # Chromium's browser code
│   ├─ /content                    # Content API (multi-process architecture)
│   ├─ /net                        # Network stack
│   ├─ /v8                         # JavaScript engine
│   │
│   └─ /toubkal                    # Toubkal code (parallel to /chrome)
│       ├─ BUILD.gn                # Toubkal's main build file
│       │
│       ├─ /browser                # Browser-level code (C++)
│       │   ├─ /ui                 # Browser UI (tabs, omnibox, menus)
│       │   ├─ /profiles           # User profiles, session management
│       │   └─ /resources          # Icons, strings, locales
│       │   ├── url/                      # **URL scheme (toubkal://)**
│       │   │   ├── url_scheme_registration.cc
│       │   │   ├── url_redirect_handler.cc
│       │   │   └── BUILD.gn
│       │
│       ├─ /components             # Toubkal components (feature modules)
│       │   ├─ /privacy            # Privacy features (shields, consent, audit)
│       │   ├─ /ai_platform        # AI inference gateway
│       │   ├─ /mcp_integration    # MCP client and native servers
│       │   ├─ /transparency       # Live Transparency Mode
│       │   └─ /performance        # Tab freezing, resource monitoring
│       │
│       ├─ /chromium_src           # File overlays (Brave-style redirects)
│       │   ├─ /chrome             # Replace Chromium UI components
│       │   ├─ /components         # Replace Chromium components
│       │   └─ /ui                 # Replace Chromium UI elements
│       │
│       ├─ /patches                # Git patches for Chromium
│       │   ├─ /net                # Network privacy patches
│       │   ├─ /content            # Content API patches (AI hooks)
│       │   ├─ /v8                 # V8 patches (WebAssembly, WebGPU)
│       │   └─ /build              # Build system patches
│       │
│       ├─ /app                    # React/TypeScript UI (built via GN)
│       │   ├─ /dashboard          # Transparency Dashboard
│       │   ├─ /mcp-store          # MCP Server Discovery & Management
│       │   ├─ /onboarding         # First-run experience
│       │   └─ /shared             # Shared React components
│       │
│       ├─ /mojo                   # Mojo IPC interfaces (.mojom files)
│       │   ├─ /public             # Public Mojo interfaces
│       │   │   ├─ ai_platform.mojom
│       │   │   ├─ consent.mojom
│       │   │   ├─ audit.mojom
│       │   │   └─ mcp.mojom
│       │   └─ /bindings           # Generated C++ bindings (auto-generated)
│       │
│       ├─ /extensions             # Extension system modifications
│       │   ├─ /api                # Toubkal-specific APIs (toubkal.*)
│       │   ├─ /renderer           # Extension renderer code
│       │   └─ /browser            # Extension browser code
│       │
│       ├─ /tools                  # Build tools, code generators
│       │   ├─ /gn                 # GN templates
│       │   ├─ /mojo               # Mojo compiler helpers
│       │   └─ /resources          # Resource processors
│       │
│       ├─ /updater                # Browser update mechanism
│       │   ├─ /service            # Update service (background)
│       │   ├─ /client             # Update client (browser integration)
│       │   └─ /protocol           # Update manifest parsing
│       │
│       └─ /tests                  # Tests (unit, integration, e2e)
│           ├─ /unit               # gtest (C++), jest (TypeScript)
│           ├─ /integration        # Cross-feature tests
│           └─ /e2e                # Playwright browser tests
│
├─ /config                         # Build configurations
│   ├─ /siso                       # Siso configuration (main.star)
│   └─ /gn                         # GN templates, build scripts
│
├─ /out                            # Build output (gitignored)
│   ├─ /Release                    # Release builds
│   └─ /Debug                      # Debug builds
│
└─ /docs                           # Documentation
    ├─ /architecture               # Architecture docs
    ├─ /adrs                       # Architecture Decision Records
    ├─ /api                        # API documentation
    └─ /contributing               # Contributor guides
```

---

## Module Relationships

### Feature-First Organization

```
/toubkal/components/
├─ /privacy                    # Privacy & security features
│   ├─ /shields                # Ad/tracker blocking (Brave's adblock-rust)
│   ├─ /consent                # Universal Consent Fabric
│   ├─ /audit                  # Cryptographic Audit Trail
│   ├─ /routing                # Privacy Routing (Tor/I2P, future)
│   └─ /fingerprinting         # Fingerprinting protection
│
├─ /ai_platform                # Local AI inference
│   ├─ /gateway                # Multi-engine routing (Ollama, Transformers.js, etc.)
│   ├─ /models                 # Model management (BYOM, download, resource monitoring)
│   ├─ /context                # Workspace context manager
│   └─ /ui                     # AI Overlay (sidebar), context menu
│
├─ /mcp_integration            # MCP protocol support
│   ├─ /client                 # MCP client (stdio, HTTP+SSE, SHTTP)
│   ├─ /servers                # Native MCP servers (tabs, bookmarks, history)
│   ├─ /manager                # MCP Server Manager (discovery, install)
│   └─ /sandbox                # Tool isolation and permissions
│
├─ /transparency               # Live Transparency Mode
│   ├─ /dashboard              # Real-time data flow visualization
│   ├─ /forensics              # Forensic replay, audit export
│   └─ /services               # Event aggregation, log streaming
│
└─ /performance                # Performance optimizations
    ├─ /tab_freezing           # Energy Saver-style tab management
    ├─ /resource_monitor       # CPU/RAM/VRAM monitoring
    └─ /battery                # Battery optimization
```

### Dependency Graph

```
┌─────────────────────────────────────────────┐
│         Toubkal Features (High-Level)       │
│  - AI Platform                              │
│  - MCP Integration                          │
│  - Transparency Dashboard                   │
└────────────┬────────────────────────────────┘
             │ depends on
┌────────────▼────────────────────────────────┐
│       Toubkal Shared Components             │
│  - Consent Fabric                           │
│  - Cryptographic Audit Trail                │
│  - Privacy Routing                          │
└────────────┬────────────────────────────────┘
             │ depends on
┌────────────▼────────────────────────────────┐
│       Chromium Engine Core                  │
│  - Content API (multi-process)              │
│  - Network Stack (net/)                     │
│  - Mojo IPC                                 │
│  - V8 JavaScript Engine                     │
│  - Blink Rendering Engine                   │
└─────────────────────────────────────────────┘
```

---

## Brand Identity & URL Scheme

### Custom URL Scheme: `toubkal://`

Toubkal registers a custom URL scheme (`toubkal://`) to replace Chromium's `chrome://` scheme for all internal pages. This ensures users immediately recognize they're using Toubkal, not Chrome.

**Implementation Location**: `/src/toubkal/browser/url/`

```cpp
// /src/toubkal/browser/url/url_scheme_registration.cc
#include "toubkal/browser/url/url_scheme_registration.h"
#include "url/url_util.h"

namespace toubkal {

void RegisterToubkalURLScheme() {
  url::AddStandardScheme("toubkal", url::SCHEME_WITH_HOST);
  url::AddSecureScheme("toubkal");
  url::AddLocalScheme("toubkal");
  url::AddWebDisplayableScheme("toubkal");
}

}  // namespace toubkal
```

```cpp
// /src/toubkal/browser/url/url_redirect_handler.cc
#include "toubkal/browser/url/url_redirect_handler.h"

namespace toubkal {

GURL RedirectChromeURLToToubkal(const GURL& url) {
  if (!url.is_valid() || !url.SchemeIs("chrome")) {
    return url;
  }
  std::string new_url = "toubkal://" + url.host();
  if (url.has_path()) new_url += url.path();
  if (url.has_query()) new_url += "?" + url.query();
  if (url.has_ref()) new_url += "#" + url.ref();
  return GURL(new_url);
}

}  // namespace toubkal
```

**URL Mappings**:

| User Types            | Browser Shows          | Purpose                                      |
| --------------------- | ---------------------- | -------------------------------------------- |
| `chrome://settings`   | `toubkal://settings`   | Browser settings                             |
| `chrome://flags`      | `toubkal://flags`      | Feature flags                                |
| `chrome://version`    | `toubkal://version`    | Version information                          |
| `chrome://extensions` | `toubkal://extensions` | Extension management                         |
| N/A                   | `toubkal://audit`      | **New**: Transparency Dashboard (audit logs) |
| N/A                   | `toubkal://ai`         | **New**: AI settings & model management      |
| N/A                   | `toubkal://mcp`        | **New**: MCP server management               |
| N/A                   | `toubkal://consent`    | **New**: Consent history viewer              |

**Key Features**:

- **Auto-redirect**: Legacy `chrome://` URLs automatically redirect to `toubkal://`
- **No broken links**: All Chromium internal links work seamlessly
- **Brand consistency**: Users see "toubkal://" in address bar, reinforcing brand identity
- **New pages**: Toubkal-specific features get dedicated internal pages

**File Structure**:
/src/toubkal/browser/url/
├── url_scheme_registration.h
├── url_scheme_registration.cc
├── url_redirect_handler.h
├── url_redirect_handler.cc
└── BUILD.gn

---

## Security Boundaries

### Process Isolation

| Process                     | Purpose                                     | Sandbox Level                 | Communication                                 |
| --------------------------- | ------------------------------------------- | ----------------------------- | --------------------------------------------- |
| **Browser Process**         | Main coordinator, UI, network, AI           | Minimal (trusted)             | Mojo IPC to all other processes               |
| **Renderer Process**        | Web content rendering, JavaScript execution | High (untrusted)              | Mojo IPC to browser, very restricted syscalls |
| **GPU Process**             | Graphics acceleration, WebGL/WebGPU         | Medium                        | Mojo IPC to browser, GPU APIs only            |
| **Network Process**         | HTTP/HTTPS requests, DNS                    | Medium                        | Mojo IPC to browser, network APIs only        |
| **Utility Process**         | Audio, video decoding                       | High                          | Mojo IPC to browser, limited syscalls         |
| **AI Inference (External)** | Ollama, LlamaCpp servers                    | None (separate process)       | HTTP localhost (127.0.0.1:11434)              |
| **MCP Servers (External)**  | Community tools                             | None (separate child process) | Stdio or HTTP (sandboxed by OS)               |

### Data Flow Security

```
User Request (e.g., "Summarize this page")
         │
         ▼
┌─────────────────────┐
│  AI Overlay UI      │ ← User-visible consent prompt
│  (React)            │
└─────────┬───────────┘
          │ Mojo IPC
          ▼
┌─────────────────────┐
│  Consent Fabric     │ ← Check: user approved? Sign decision (Ed25519)
│  (C++)              │
└─────────┬───────────┘
          │ If approved
          ▼
┌─────────────────────┐
│  AI Inference       │ ← Route to Ollama/Transformers.js/Cloud
│  Gateway (C++)      │
└─────────┬───────────┘
          │ HTTP/WebGPU
          ▼
┌─────────────────────┐
│  Ollama / WebGPU    │ ← Local inference (no network egress)
│  (External)         │
└─────────┬───────────┘
          │ Response
          ▼
┌─────────────────────┐
│  Cryptographic      │ ← Log entire transaction (Ed25519 signature)
│  Audit Trail (C++)  │
└─────────┬───────────┘
          │ Merkle tree update
          ▼
┌─────────────────────┐
│  LevelDB Storage    │ ← Tamper-proof audit log
└─────────────────────┘
```

---

## Build System

### GN + Siso Architecture

```
Developer writes code
         │
         ▼
    GN (Meta-Build System)
         │ Reads BUILD.gn files
         │ Generates .ninja files
         ▼
    Siso (Build Executor)
         │ Executes .ninja build graph
         │ Supports remote execution (Bazel RE API)
         ▼
    Compiled Binaries
         │ toubkal.exe, toubkal (Linux), Toubkal.app (macOS)
         ▼
    Packaging
         │ .exe installer (Windows)
         │ .dmg (macOS)
         │ .deb, .rpm, AppImage (Linux)
         ▼
    SLSA Attestation + Cosign Signing
```

### Build Configuration (`args.gn`)

```
# Toubkal Release Build Configuration
use_siso = true                     # Use Siso instead of Ninja
is_component_build = false          # Static linking
is_debug = false                    # Release build
symbol_level = 1                    # Minimal symbols
enable_nacl = false                 # Disable NaCl (legacy)
proprietary_codecs = true           # H.264/AAC support
ffmpeg_branding = "Chrome"          # Chrome codec set

# Toubkal-specific features
toubkal_privacy_enabled = true
toubkal_ai_platform_enabled = true
toubkal_mcp_enabled = true
toubkal_telemetry_disabled = true   # Zero telemetry by default
```

### Build System Fallback Strategy

Siso is **experimental** in Chromium (introduced Q4 2024). Toubkal maintains Ninja as a fallback to ensure build reliability.

**Primary Build Path** (Siso):

- Faster incremental builds via remote execution
- Bazel Remote Execution API compatible
- Used in CI/CD for distributed builds
- Activate via `use_siso = true` in `args.gn`

**Fallback Build Path** (Ninja):

- If Siso unstable or unavailable
- Local-only builds (no remote execution)
- Proven stability (Chromium's default until 2024)
- Activate via `use_siso = false` in `args.gn`

**Switching Between Build Systems**:

```bash
# Switch to Ninja
gn args out/Release
# Edit: use_siso = false

# Rebuild
autoninja -C out/Release toubkal

# Switch back to Siso
gn args out/Release
# Edit: use_siso = true
```

**When to Use Ninja**:

- Siso build failures (connection refused to remote executor)
- Local development (no remote execution infrastructure)
- CI/CD troubleshooting (isolate build vs. remote execution issues)

---

## Key Subsystems (Deep Dive)

### 1. Universal Consent Fabric

**Purpose**: Per-request consent for all AI/cloud/MCP operations

**Implementation**:

- C++ policy engine (`/toubkal/components/privacy/consent/`)
- LevelDB storage for consent records
- Mojo IPC interface (`consent.mojom`) for UI ↔ engine communication
- Ed25519 signing for all consent decisions

**Data Model**:

```
struct ConsentRecord {
  std::string id;                     // UUID
  std::string user_id;                // User identifier
  std::optional<std::string> workspace_id;
  ConsentActionType action_type;      // AI_QUERY, CLOUD_API, MCP_TOOL
  std::string data_disclosed;         // JSON of accessed data
  std::optional<std::string> provider; // "Anthropic", "OpenAI", etc.
  ConsentDecision decision;           // ALLOW_ONCE, ALLOW_SESSION, ALLOW_ALWAYS, DENY
  int64_t timestamp;
  std::optional<int64_t> expires_at;
  std::vector<uint8_t> signature;     // Ed25519 signature
};
```

---

### 2. Cryptographic Audit Trail

**Purpose**: Tamper-proof logging of all browser operations

**Implementation**:

- Ed25519 signing with BoringSSL (FIPS 140-2/3 validated)
- Merkle tree for integrity verification (SHA-256 via BoringSSL)
- LevelDB storage (`/toubkal/components/privacy/audit/`)
- Export API (JSON/CSV/PDF)

**Merkle Tree Structure**:

```
                    Root Hash
                   /         \
                H(L)          H(R)
               /    \        /    \
            H(E1)  H(E2)  H(E3)  H(E4)
             |      |      |      |
           Event1 Event2 Event3 Event4
```

**Verification**:

- Recompute root hash from leaves
- Compare with stored root hash
- If mismatch → tampering detected

---

### 3. AI Inference Gateway

**Purpose**: Multi-engine AI routing with consent gating

**Supported Engines**:

- **Ollama** (HTTP API, localhost:11434)
- **Transformers.js** (WebGPU, in-browser)
- **WebLLM** (WebGPU, high-performance)
- **LlamaCpp** (HTTP server or native bridge)
- **ONNX Runtime** (WebGPU acceleration)
- **Cloud APIs** (OpenAI, Anthropic, Gemini) — consent-gated

**Routing Logic**:

1. User query arrives at AI Overlay (React)
2. Mojo IPC call to AI Inference Gateway (C++)
3. Check consent: approved for local/cloud?
4. Route to appropriate engine:
   - Local: Ollama (primary) or Transformers.js (fallback)
   - Cloud: Show consent banner → if approved, call API
5. Sign entire transaction (Ed25519)
6. Log to audit trail
7. Return response to UI

---

### 4. MCP Native Integration

**Purpose**: First browser with built-in MCP protocol support

**MCP Client** (`/toubkal/components/mcp_integration/client/`):

- **Protocol Compliance**: MCP spec 2024-11-05 (latest) with version negotiation for future specs
- Transport support: stdio, HTTP+SSE, SHTTP
- JSON-RPC 2.0 messaging
- Tool discovery and capability negotiation
- Consent-gated tool invocations

**Native MCP Servers**:

- **toubkal-tabs**: `list_tabs`, `switch_tab`, `close_tabs`, `group_tabs`
- **toubkal-bookmarks**: `search_bookmarks`, `add_bookmark`, `organize_bookmarks`
- **toubkal-history**: `search_history`, `export_history` (consent-gated)

**Example MCP Tool Call**:

```
User: "Close all YouTube tabs"
       │
       ▼
AI Overlay → MCP Client → toubkal-tabs.close_tabs(filter: "youtube.com")
       │
       ▼ (consent prompt)
"Allow AI to close tabs? This will affect 3 tabs."
[Allow Once] [Allow for Session] [Deny]
       │
       ▼ (if approved)
Execute tool → Log (Ed25519 signature) → Return result
```

---

## Deployment Architecture

### Platform Support

| Platform    | Binary Format            | Package Manager      | Update Mechanism           |
| ----------- | ------------------------ | -------------------- | -------------------------- |
| **Windows** | `.exe` installer         | WiX/InnoSetup        | Omaha-style update service |
| **macOS**   | `.dmg` + `.app`          | Homebrew (optional)  | Sparkle framework          |
| **Linux**   | `.deb`, `.rpm`, AppImage | apt, dnf, flatpak    | System package manager     |
| **Android** | `.apk` (future)          | Google Play, F-Droid | Google Play Services       |
| **iOS**     | `.ipa` (future)          | App Store            | App Store updates          |

### Update Flow

```
Update Service (runs in background)
         │
         ▼
Check updates.toubkal.app for new version
         │
         ▼
Download manifest (XML with version, URL, hash)
         │
         ▼
Verify SLSA attestation + Cosign signature
         │
         ▼
Download update package
         │
         ▼
Verify checksum (SHA-256)
         │
         ▼
Prompt user: "Update available. Install now?"
         │
         ▼
Install update (MSI/DMG/DEB)
         │
         ▼
Relaunch browser
```

---

## Performance Characteristics

### Target Metrics

| Metric               | Target                        | Measurement          |
| -------------------- | ----------------------------- | -------------------- |
| **Page Load Time**   | Match Chromium ±5%            | Speedometer 3.0      |
| **Memory Usage**     | 30-40% lower (tab freezing)   | Task Manager         |
| **Battery Life**     | 15-20% longer                 | 4-hour workload test |
| **AI Response Time** | p95 <2s (local summarization) | Automated benchmark  |
| **Build Time**       | <30 min (full clean build)    | CI/CD tracking       |
| **Binary Size**      | <200MB (Windows installer)    | Package measurement  |

---

## References

For detailed technical specifications, see:

- **Mojo IPC**: `/docs/architecture/mojo-ipc.md`
- **Privacy Architecture**: `/docs/architecture/privacy-architecture.md`
- **AI Integration**: `/docs/architecture/ai-integration-spec.md`
- **MCP Integration**: `/docs/architecture/mcp-integration.md`
- **Build System**: `/docs/architecture/build-system.md`
- **Security Isolation**: `/docs/architecture/security-isolation.md`

---

**Last Updated**: 2025-10-18  
**Next Review**: 2025-11-01

```

***
```
