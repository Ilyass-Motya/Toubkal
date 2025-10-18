# Toubkal Browser API

**Status**: Alpha (Unstable)  
**Last Updated**: 2025-10-18  
**Target Stability**: Stable 1.0 (Aug 2026)  
**Location**: `/src/toubkal/browser/api/`

⚠️ **Warning**: This API may change without notice during Alpha/Beta phases.

---

## Overview

The Toubkal Browser API provides programmatic access to browser features for web pages and extensions. This includes privacy features, AI integration, and workspace management.

**Key Principles**:

- **Privacy-first**: All APIs require explicit user consent
- **Local-first**: Most operations run locally (no cloud by default)
- **Auditable**: Every API call is logged in the cryptographic audit trail

---

## Table of Contents

1. [Privacy API](#privacy-api)
2. [AI API](#ai-api)
3. [MCP API](#mcp-api)
4. [Workspace API](#workspace-api)
5. [Consent API](#consent-api)

---

## Privacy API

### `toubkal.privacy`

Access to privacy features and audit logs.

#### Methods

##### `toubkal.privacy.getAuditLogs(options)`

Retrieves cryptographic audit logs.

**Parameters**:

- `options` (Object, optional):
  - `startTime` (Number): Unix timestamp (ms) for start of range
  - `endTime` (Number): Unix timestamp (ms) for end of range
  - `actionType` (String): Filter by action type (e.g., `"AI_QUERY_LOCAL"`)
  - `limit` (Number): Maximum number of logs to return (default: 100)

**Returns**: `Promise<AuditLog[]>`

**Example**:

```
const logs = await toubkal.privacy.getAuditLogs({
  startTime: Date.now() - 86400000, // Last 24 hours
  actionType: "AI_QUERY_LOCAL",
  limit: 50
});

console.log(logs);
// [
//   {
//     timestamp: 1729238400000,
//     actionType: "AI_QUERY_LOCAL",
//     userId: "anon_user_123",
//     data: { query: "Summarize this page", model: "Llama 3.2-3B" },
//     signature: "ed25519_sig_abc123...",
//     merkleRoot: "merkle_root_def456..."
//   }
// ]
```

---

##### `toubkal.privacy.verifyAuditLog(log)`

Verifies the Ed25519 signature of an audit log entry.

**Parameters**:

- `log` (AuditLog): Audit log object to verify

**Returns**: `Promise<boolean>` - `true` if signature is valid

**Example**:

```
const log = logs;
const isValid = await toubkal.privacy.verifyAuditLog(log);
console.log(`Signature valid: ${isValid}`); // true
```

---

##### `toubkal.privacy.exportAuditLogs(format)`

Exports all audit logs in specified format.

**Parameters**:

- `format` (String): Export format (`"json"` or `"csv"`)

**Returns**: `Promise<Blob>` - Downloadable file

**Example**:

```
const blob = await toubkal.privacy.exportAuditLogs("json");
const url = URL.createObjectURL(blob);
// Trigger download
```

---

## AI API

### `toubkal.ai`

Interact with local and cloud AI models.

#### Methods

##### `toubkal.ai.query(prompt, options)`

Sends a query to the AI inference gateway.

**Parameters**:

- `prompt` (String): User query
- `options` (Object, optional):
  - `model` (String): Model name (e.g., `"ollama:llama3.2-3b"`)
  - `context` (Object): Additional context (page content, selected text)
  - `stream` (Boolean): Enable streaming responses (default: `false`)

**Returns**: `Promise<AIResponse>` or `ReadableStream<AIResponse>` (if streaming)

**Requires**: User consent (`AI_QUERY_LOCAL` or `AI_QUERY_CLOUD`)

**Example**:

```
const response = await toubkal.ai.query("Explain quantum computing", {
  model: "ollama:llama3.2-3b",
  stream: false
});

console.log(response.text); // AI-generated response
console.log(response.latency); // 1850 (ms)
```

---

##### `toubkal.ai.listModels()`

Lists all available AI models (local and cloud).

**Returns**: `Promise<AIModel[]>`

**Example**:

```
const models = await toubkal.ai.listModels();
console.log(models);
// [
//   { id: "ollama:llama3.2-3b", name: "Llama 3.2-3B", type: "local", size: "2.1GB" },
//   { id: "transformers:smollm2", name: "SmolLM2", type: "local", size: "1.7GB" },
//   { id: "openai:gpt-4", name: "GPT-4", type: "cloud", requiresApiKey: true }
// ]
```

---

## MCP API

### `toubkal.mcp`

Manage Model Context Protocol (MCP) servers.

#### Methods

##### `toubkal.mcp.listServers()`

Lists all installed MCP servers.

**Returns**: `Promise<MCPServer[]>`

**Example**:

```
const servers = await toubkal.mcp.listServers();
console.log(servers);
// [
//   { id: "toubkal-tabs", name: "Tab Management", tools: ["list_tabs", "close_tabs"] },
//   { id: "toubkal-context", name: "Page Context", tools: ["get_content", "get_links"] }
// ]
```

---

##### `toubkal.mcp.invokeTool(serverId, toolName, params)`

Invokes an MCP tool (requires user consent).

**Parameters**:

- `serverId` (String): MCP server ID (e.g., `"toubkal-tabs"`)
- `toolName` (String): Tool name (e.g., `"close_tabs"`)
- `params` (Object): Tool-specific parameters

**Returns**: `Promise<Object>` - Tool result

**Requires**: User consent (`MCP_TOOL_INVOKE`)

**Example**:

```
const result = await toubkal.mcp.invokeTool("toubkal-tabs", "close_tabs", {
  filter: "youtube.com"
});

console.log(result); // { closedCount: 3, tabIds:  }
```

---

## Workspace API

### `toubkal.workspace`

Manage browser workspaces (collections of tabs + context).

#### Methods

##### `toubkal.workspace.create(name, options)`

Creates a new workspace.

**Parameters**:

- `name` (String): Workspace name
- `options` (Object, optional):
  - `tabs` (Array): Initial tab URLs
  - `aiContext` (String): Workspace-specific AI context

**Returns**: `Promise<Workspace>`

**Example**:

```
const workspace = await toubkal.workspace.create("Research Project", {
  tabs: ["https://arxiv.org", "https://github.com"],
  aiContext: "Research on quantum computing algorithms"
});
```

---

## Consent API

### `toubkal.consent`

Manage user consent for data operations.

#### Methods

##### `toubkal.consent.request(actionType, details)`

Requests user consent for an action.

**Parameters**:

- `actionType` (String): Action type (e.g., `"AI_QUERY_CLOUD"`)
- `details` (Object): Action details shown to user

**Returns**: `Promise<boolean>` - `true` if user approved

**Example**:

```
const approved = await toubkal.consent.request("AI_QUERY_CLOUD", {
  provider: "OpenAI",
  model: "GPT-4",
  dataShared: ["User query", "Page title"],
  retention: "Not used for training"
});

if (approved) {
  // Proceed with cloud API call
}
```

---

## Error Handling

All API methods follow this error structure:

```
try {
  const result = await toubkal.ai.query("Test");
} catch (error) {
  console.error(error.code);    // "CONSENT_DENIED"
  console.error(error.message); // "User denied consent for AI_QUERY_LOCAL"
}
```

**Common Error Codes**:

- `CONSENT_DENIED`: User denied consent
- `MODEL_NOT_AVAILABLE`: AI model not installed
- `NETWORK_ERROR`: Cloud API unreachable
- `INVALID_PARAMS`: Invalid parameters

---

## TypeScript Definitions

```
interface AuditLog {
  timestamp: number;
  actionType: string;
  userId: string;
  data: Record<string, any>;
  signature: string;
  merkleRoot: string;
}

interface AIResponse {
  text: string;
  model: string;
  latency: number;
  tokensGenerated: number;
}

interface AIModel {
  id: string;
  name: string;
  type: "local" | "cloud";
  size?: string;
  requiresApiKey?: boolean;
}

interface MCPServer {
  id: string;
  name: string;
  tools: string[];
}

interface Workspace {
  id: string;
  name: string;
  tabs: Tab[];
  aiContext: string;
}
```

---

## Rate Limits

**Alpha Phase**: No rate limits  
**Stable 1.0+**: TBD (likely 1000 requests/hour for local APIs)

---

## See Also

- [Extension API](extension-api.md) - Extension-specific APIs
- [MCP Server API](mcp-server-api.md) - MCP server protocol
- [Mojo Interfaces](mojo-interfaces.md) - Internal C++ IPC

---

**Last Updated**: 2025-10-18

```

***
```
