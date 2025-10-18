# Toubkal Browser — AI Integration Specification

**Version:** 1.0  
**Last Updated:** 2025-10-18  
**Owner:** Ilyass Motya
**Audience:** Engineering, AI/ML Team, Security

---

## Executive Summary

Toubkal's AI integration is **local-first by default**, multi-engine by design, and consent-gated at every boundary. This specification defines how AI models are invoked, how data flows through the system, and how privacy is cryptographically proven at each step.

**Core Principle:**

> "AI runs on your machine, with your explicit permission, and leaves a verifiable trail."

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Supported AI Engines](#supported-ai-engines)
3. [AI Inference Gateway](#ai-inference-gateway)
4. [Data Flow & Privacy](#data-flow--privacy)
5. [MCP Integration](#mcp-integration)
6. [UI Trigger Points](#ui-trigger-points)
7. [Model Management](#model-management)
8. [Performance & Resource Monitoring](#performance--resource-monitoring)
9. [Cloud AI Fallback](#cloud-ai-fallback)
10. [Security & Isolation](#security--isolation)

---

## 1. Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────┐
│              User Interface Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ AI Overlay   │  │ Context Menu │  │ Omnibox  │  │
│  │ (Sidebar)    │  │ Integration  │  │ `/ai`    │  │
│  └──────┬───────┘  └──────┬───────┘  └────┬─────┘  │
└─────────┼──────────────────┼───────────────┼────────┘
          │                  │               │
          │ Mojo IPC         │               │
          ▼                  ▼               ▼
┌─────────────────────────────────────────────────────┐
│           AI Inference Gateway (C++)                 │
│  ┌──────────────────────────────────────────────┐   │
│  │ Request Router                               │   │
│  │ - Parse query                                │   │
│  │ - Select engine (Ollama/Transformers.js/etc)│   │
│  │ - Check consent                              │   │
│  │ - Inject context (page, tabs, MCP tools)    │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Consent Gate                                 │   │
│  │ - Universal Consent Fabric check             │   │
│  │ - Show consent banner if needed              │   │
│  │ - Log decision (Ed25519 signature)           │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Cryptographic Audit Logger                   │   │
│  │ - Log every AI operation (Ed25519)           │   │
│  │ - Update Merkle tree                         │   │
│  │ - Store in LevelDB                           │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
          │
          │ HTTP/WebGPU/MCP
          ▼
┌─────────────────────────────────────────────────────┐
│              AI Engine Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Ollama   │  │Transform │  │ WebLLM   │          │
│  │ (HTTP)   │  │ers.js    │  │ (WebGPU) │          │
│  │ localhost│  │ (WebGPU) │  │          │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ LlamaCpp │  │ ONNX     │  │ Custom   │          │
│  │ (Native) │  │ Runtime  │  │ Endpoint │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────┘
          │ (Optional, consent-gated)
          ▼
┌─────────────────────────────────────────────────────┐
│       Cloud AI APIs (Consent-Gated)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ OpenAI   │  │Anthropic │  │ Gemini   │          │
│  │ API      │  │ Claude   │  │ API      │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────┘
```

---

## 2. Supported AI Engines

### Local Engines (No External Network)

| Engine              | Technology                 | Models Supported                                   | Use Case                                      | Performance            |
| ------------------- | -------------------------- | -------------------------------------------------- | --------------------------------------------- | ---------------------- |
| **Ollama**          | HTTP API (localhost:11434) | Llama 3.2 (1B/3B/8B), Mistral 7B, CodeLlama, Phi-3 | General purpose, primary engine               | Fast (GPU accelerated) |
| **Transformers.js** | WebGPU (in-browser)        | SmolLM2 (1.7B), Llama 3.2-1B, Phi-3-mini           | Zero-install fallback                         | Moderate (WebGPU)      |
| **WebLLM**          | WebGPU (in-browser)        | Llama 3.2-3B, Phi-3, RedPajama                     | High-performance browser inference            | Fast (WebGPU)          |
| **LlamaCpp**        | Native binary or HTTP      | Any GGUF model                                     | Custom model support                          | Very fast (native)     |
| **ONNX Runtime**    | WebAssembly + WebGPU       | ONNX models                                        | Specialized tasks (embedding, classification) | Fast (WebGPU)          |

### Cloud Engines (Consent-Gated)

| Provider      | API                              | Default Status | Consent Required   |
| ------------- | -------------------------------- | -------------- | ------------------ |
| **OpenAI**    | GPT-4, GPT-4o                    | Disabled       | Per-request banner |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus | Disabled       | Per-request banner |
| **Google**    | Gemini 1.5 Pro, Gemini 2.0 Flash | Disabled       | Per-request banner |

---

## 3. AI Inference Gateway

### Component Location

**C++ Implementation**: `/src/toubkal/components/ai_platform/gateway/`

**Key Files**:

- `inference_gateway.h` / `inference_gateway.cc`: Main routing logic
- `engine_adapter.h` / `engine_adapter.cc`: Per-engine adapters (Ollama, Transformers.js, etc.)
- `consent_gate.h` / `consent_gate.cc`: Consent enforcement
- `context_manager.h` / `context_manager.cc`: Workspace context injection

### Responsibilities

1. **Request Routing**: Decide which engine to use based on:
   - User preference (Settings → AI → Inference Mode)
   - Model availability (is Ollama running?)
   - Query complexity (local model capable? or need cloud?)
2. **Consent Enforcement**: Before any AI operation:
   - Check Universal Consent Fabric
   - If no prior consent: show consent banner
   - Log consent decision (Ed25519 signature)
3. **Context Injection**: Provide AI with relevant context:
   - Current page content (DOM text extraction)
   - Selected text (if user highlighted content)
   - Workspace tabs (if workspace-aware query)
   - MCP tool outputs (if AI invoked tools)
4. **Response Streaming**: Stream AI responses token-by-token for UX
5. **Audit Logging**: Log entire transaction:
   - Prompt (user query)
   - Context (page URL, selected text)
   - Model used (Ollama Llama 3.2-3B, etc.)
   - Response (AI output)
   - Latency (inference time in ms)
   - Signature (Ed25519)

---

### Request Flow

```
User Query: "Summarize this page"
         │
         ▼
┌─────────────────────┐
│ AI Overlay (React)  │
│ - User types query  │
│ - Click "Send"      │
└─────────┬───────────┘
          │ Mojo IPC
          ▼
┌─────────────────────┐
│ Inference Gateway   │
│ Step 1: Parse query │
│ Step 2: Check       │
│   consent           │
└─────────┬───────────┘
          │
          ▼ (if no prior consent)
┌─────────────────────┐
│ Consent Banner      │
│ "Allow AI to access │
│  this page content?"│
│ [Allow] [Deny]      │
└─────────┬───────────┘
          │ User approves
          ▼
┌─────────────────────┐
│ Inference Gateway   │
│ Step 3: Select      │
│   engine (Ollama)   │
│ Step 4: Extract     │
│   page content      │
│ Step 5: Build       │
│   prompt            │
└─────────┬───────────┘
          │ HTTP POST
          ▼
┌─────────────────────┐
│ Ollama (localhost)  │
│ Model: Llama 3.2-3B │
│ Generate response   │
└─────────┬───────────┘
          │ Streaming response
          ▼
┌─────────────────────┐
│ Inference Gateway   │
│ Step 6: Stream to   │
│   UI (token-by-     │
│   token)            │
│ Step 7: Log audit   │
│   (Ed25519 sig)     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ AI Overlay (React)  │
│ Display response    │
└─────────────────────┘
```

---

## 4. Data Flow & Privacy

### Local AI Data Flow (Ollama Example)

```
User Data (Page Content):
  "Article: AI privacy concerns..."
         │
         ▼
┌─────────────────────┐
│ DOM Text Extractor  │
│ - Strip HTML tags   │
│ - Extract readable  │
│   text (5000 chars) │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Consent Check       │
│ ✅ User approved    │
│    "AI_QUERY_LOCAL" │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Build Prompt        │
│ System: "You are a  │
│  helpful assistant."│
│ User: "Summarize:   │
│  [page content]"    │
└─────────┬───────────┘
          │ HTTP POST localhost:11434
          ▼
┌─────────────────────┐
│ Ollama (Local)      │
│ - No external net   │
│ - GPU inference     │
│ - Streaming tokens  │
└─────────┬───────────┘
          │ Response
          ▼
┌─────────────────────┐
│ Audit Logger        │
│ - Sign (Ed25519)    │
│ - Store LevelDB     │
│ - Merkle tree       │
└─────────────────────┘
```

**Privacy Guarantees:**

- ✅ Page content never leaves device
- ✅ No external network requests
- ✅ Ed25519-signed audit log
- ✅ User can export log and verify signatures

---

### Cloud AI Data Flow (OpenAI Example, Consent-Gated)

```
User Query: "Translate to French"
         │
         ▼
┌─────────────────────┐
│ Inference Gateway   │
│ Detect: Query needs │
│  cloud (translation │
│  quality)           │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Consent Banner      │
│ "Send to OpenAI?    │
│  Data disclosed:    │
│  - User query       │
│  - Page text (500   │
│    chars)           │
│  Provider: OpenAI   │
│  Training: No"      │
│ [Allow Once]        │
│ [Allow Session]     │
│ [Deny]              │
└─────────┬───────────┘
          │ User: Allow Once
          ▼
┌─────────────────────┐
│ Audit Logger        │
│ Log consent:        │
│ - Action: CLOUD_API │
│ - Provider: OpenAI  │
│ - Data: [hash]      │
│ - Decision: ALLOW_  │
│   ONCE              │
│ - Signature         │
└─────────┬───────────┘
          │ HTTPS POST
          ▼
┌─────────────────────┐
│ OpenAI API          │
│ GPT-4 inference     │
│ (TLS 1.3 encrypted) │
└─────────┬───────────┘
          │ Response
          ▼
┌─────────────────────┐
│ Audit Logger        │
│ Log response:       │
│ - Provider: OpenAI  │
│ - Latency: 850ms    │
│ - Tokens: 120       │
│ - Signature         │
└─────────────────────┘
```

**Privacy Guarantees:**

- ✅ Explicit per-request consent
- ✅ Data disclosure shown before sending
- ✅ Provider bound by no-training agreement
- ✅ Full transaction logged (Ed25519-signed)
- ✅ User can revoke consent for future requests

---

## 5. MCP Integration

### MCP in AI Context

**Purpose**: Allow AI to invoke browser actions via Model Context Protocol (MCP) servers.

**Example Workflow**:

```
User: "Close all YouTube tabs"
         │
         ▼
┌─────────────────────┐
│ AI (Ollama)         │
│ Recognizes: needs   │
│  tool "close_tabs"  │
└─────────┬───────────┘
          │ MCP tool request
          ▼
┌─────────────────────┐
│ MCP Client          │
│ Tool: toubkal-tabs. │
│  close_tabs         │
│ Args: {filter:      │
│  "youtube.com"}     │
└─────────┬───────────┘
          │
          ▼ (consent gate)
┌─────────────────────┐
│ Consent Banner      │
│ "Allow AI to close  │
│  tabs? Affected:    │
│  3 tabs with        │
│  'youtube.com'"     │
│ [Allow] [Deny]      │
└─────────┬───────────┘
          │ User: Allow
          ▼
┌─────────────────────┐
│ toubkal-tabs server │
│ Execute close_tabs()│
│ Returns: {closed:3} │
└─────────┬───────────┘
          │ Tool result
          ▼
┌─────────────────────┐
│ AI (Ollama)         │
│ Response: "Closed 3 │
│  YouTube tabs."     │
└─────────────────────┘
```

**Consent Enforcement**:

- Every MCP tool invocation requires user approval
- Consent banner shows:
  - Tool name (`toubkal-tabs.close_tabs`)
  - Arguments (`filter: "youtube.com"`)
  - Affected resources (3 tabs)
- Logged in audit trail (Ed25519-signed)

---

## 6. UI Trigger Points

### 1. AI Overlay (Sidebar)

**Location**: Right-side panel (toggleable)  
**Hotkey**: `Ctrl+Shift+I` (Windows/Linux), `Cmd+Shift+I` (macOS)  
**Features**:

- Text input for user queries
- Model selector dropdown (Ollama Llama 3.2-3B, Transformers.js SmolLM2, etc.)
- Streaming response display
- Resource monitoring (RAM/VRAM, tokens/sec)
- Visual indicator: 🟢 Local | 🟠 Cloud

**Example UI**:

```
┌─────────────────────────────────┐
│ 🏔️ Toubkal AI Assistant        │
├─────────────────────────────────┤
│ Model: Ollama Llama 3.2-3B 🟢   │
│ ┌─────────────────────────────┐ │
│ │ User: Summarize this page   │ │
│ │                             │ │
│ │ AI: This article discusses  │ │
│ │ AI privacy concerns...      │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Type your question...       │ │
│ └─────────────────────────────┘ │
│ [Send] [Clear]                  │
│                                 │
│ Performance:                    │
│ ▓▓▓▓░░░░ RAM: 2.1GB            │
│ ▓▓▓░░░░░ VRAM: 1.8GB           │
│ Tokens/sec: 42.5                │
└─────────────────────────────────┘
```

---

### 2. Context Menu Integration

**Trigger**: Right-click on selected text

**Menu Items**:

- **Summarize** → AI summarizes selected text
- **Explain** → AI explains concept
- **Translate** → AI translates to target language
- **Fix Grammar** → AI corrects grammar/spelling

**Example**:

```
User selects: "quantum entanglement"
Right-click →
  ┌─────────────────────────┐
  │ Cut                     │
  │ Copy                    │
  │ Paste                   │
  ├─────────────────────────┤
  │ 🏔️ AI Actions          │
  │   Explain this          │
  │   Translate to Spanish  │
  │   Summarize             │
  └─────────────────────────┘
Click "Explain this" →
AI Overlay opens with response
```

---

### 3. Omnibox Integration

**Trigger**: Type `/ai` in address bar

**Usage**:

```
Omnibox: /ai What is the capital of France?
         ↓
AI Overlay opens with response
```

---

### 4. Page Overlay (Future)

**Trigger**: Floating AI button on every page (opt-in)

**Features**:

- Quick AI questions without opening sidebar
- Inline responses (tooltip-style)

---

## 7. Model Management

### BYOM (Bring Your Own Model)

**Supported Formats**:

- **GGUF** (Llama, Mistral, etc.)
- **ONNX** (ONNX Runtime models)
- **Safetensors** (HuggingFace format)

**Import Flow**:

```
Settings → AI → Models → Import Model
         │
         ▼
┌─────────────────────┐
│ Select Model Source │
│ ○ HuggingFace Hub   │
│ ● Local File        │
└─────────┬───────────┘
          │ User selects: llama-3.2-3b.gguf
          ▼
┌─────────────────────┐
│ Verify Checksum     │
│ SHA256: abc123...   │
│ ✅ Match            │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Import Model        │
│ Copy to:            │
│ ~/.toubkal/models/  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Model Available     │
│ Name: Llama 3.2-3B  │
│ Size: 2.1GB         │
│ Format: GGUF        │
└─────────────────────┘
```

---

### Model Storage

**Location**:

- **Windows**: `%LOCALAPPDATA%\Toubkal\Models\`
- **macOS**: `~/Library/Application Support/Toubkal/Models/`
- **Linux**: `~/.config/toubkal/models/`

**Structure**:

```
models/
├─ llama-3.2-1b.gguf
├─ llama-3.2-3b.gguf
├─ mistral-7b-v0.3.gguf
└─ models.json  # Model metadata (name, size, checksum)
```

---

## 8. Performance & Resource Monitoring

### Real-Time Monitoring

**Displayed in AI Overlay**:

- **RAM Usage**: Model loading + inference memory
- **VRAM Usage**: GPU memory (if applicable)
- **CPU Usage**: Inference thread utilization
- **Tokens/sec**: Generation speed
- **Latency**: Time to first token, total inference time

**Implementation**:

- Poll system APIs every 500ms (Windows: WMI, macOS: `mach_vm_statistics`, Linux: `/proc/meminfo`)
- Display as progress bars + numeric values

---

### Performance Targets

| Model        | Hardware                | Target Latency (p95) | Target Tokens/sec |
| ------------ | ----------------------- | -------------------- | ----------------- |
| Llama 3.2-1B | 8GB RAM, integrated GPU | <1s                  | 60+               |
| Llama 3.2-3B | 8GB RAM, integrated GPU | <2s                  | 40+               |
| Mistral 7B   | 16GB RAM, discrete GPU  | <3s                  | 50+               |

---

## 9. Cloud AI Fallback

### When to Use Cloud

**User-Configurable** (Settings → AI → Inference Mode):

- **Local Only** (default): Never use cloud
- **Hybrid**: Local-first, prompt for cloud if local fails
- **Cloud Allowed**: User pre-approves cloud providers

**Auto-Trigger Conditions** (Hybrid mode):

- Local model not available (Ollama not running)
- Query complexity exceeds local model capability (detected by heuristics)
- User explicitly requests cloud model ("Use GPT-4 for this")

---

### Cloud Provider Configuration

**Settings → AI → Cloud Providers**:

```
┌─────────────────────────────────┐
│ Cloud AI Providers              │
├─────────────────────────────────┤
│ □ OpenAI (GPT-4, GPT-4o)        │
│   API Key: [- - - - - - - - ] [Edit]    │
│                                 │
│ □ Anthropic (Claude 3.5 Sonnet) │
│   API Key: [- - - - - - - - ] [Edit]    │
│                                 │
│ □ Google (Gemini 1.5 Pro)       │
│   API Key: [- - - - - - - - ] [Edit]    │
└─────────────────────────────────┘
```

**API Key Storage**:

- Encrypted with user-derived key (AES-256-GCM)
- Stored in OS keychain (Windows Credential Manager, macOS Keychain, Linux Secret Service)

---

## 10. Security & Isolation

### Process Isolation

**AI Inference Runs in Separate Process**:

- Browser Process → Mojo IPC → AI Inference Process
- Crash in AI inference doesn't crash browser
- Memory isolation (no shared heap)

---

### Content Security Policy for AI Output

**Problem**: AI output may contain malicious HTML/JavaScript

**Solution**: Strict CSP + Trusted Types

- AI responses sanitized before rendering
- No inline `<script>` execution
- Trusted Types API enforces safe DOM manipulation

**Example**:

```
const sanitizedResponse = DOMPurify.sanitize(aiResponse);
const trustedHTML = trustedTypes.createHTML(sanitizedResponse);
responseContainer.innerHTML = trustedHTML;  // Safe
```

---

### Network Monitoring

**Audit Trail Includes**:

- All HTTP requests made during AI inference
- Destination (localhost:11434 for Ollama, api.openai.com for cloud)
- Data sent (hash of request body)
- Response received (hash of response body)

**User Verification**:

- Settings → Privacy → Transparency Dashboard
- Filter by "AI Operations"
- Verify: all local AI shows "Destination: localhost"

---

**Last Updated**: 2025-10-18  
**Next Review**: 2025-11-01

```

***
```
