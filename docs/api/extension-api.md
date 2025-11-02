# Toubkal Extension API

**Status**: Alpha (Unstable)
**Last Updated**: 2025-10-18
**Target Stability**: Stable 1.0 (Aug 2026)
**Extends**: Chrome Extension API (Manifest V3)

⚠️ **Warning**: This API may change without notice during Alpha/Beta phases.

---

## Overview

Toubkal extensions are built on Chrome's Manifest V3 architecture with additional Toubkal-specific APIs for privacy, AI, and MCP integration.

**Compatibility**:

- ✅ All Chrome Manifest V3 APIs supported
- ✅ Toubkal-specific APIs under `toubkal.*` namespace
- ✅ Extensions can run on both Toubkal and Chrome (with feature detection)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Manifest File](#manifest-file)
3. [Toubkal-Specific APIs](#toubkal-specific-apis)
4. [Permissions](#permissions)
5. [Examples](#examples)

---

## Getting Started

### Minimal Extension

**File Structure**:

```
my-extension/
├── manifest.json
├── background.js
├── content.js
└── popup.html
```

**manifest.json**:

```
{
  "manifest_version": 3,
  "name": "My Toubkal Extension",
  "version": "1.0.0",
  "permissions": [
    "toubkal.privacy",
    "toubkal.ai"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}
```

---

## Manifest File

### Toubkal-Specific Fields

```
{
  "manifest_version": 3,
  "name": "Extension Name",
  "version": "1.0.0",

  "toubkal": {
    "minimum_version": "0.1.0",
    "ai_features": {
      "local_models": ["ollama:llama3.2-3b"],
      "cloud_providers": ["openai"]
    },
    "mcp_integration": {
      "servers": ["toubkal-tabs", "toubkal-context"]
    }
  },

  "permissions": [
    "toubkal.privacy",
    "toubkal.ai",
    "toubkal.mcp"
  ]
}
```

**Fields**:

- `toubkal.minimum_version`: Minimum Toubkal version required
- `toubkal.ai_features`: AI models/providers the extension uses
- `toubkal.mcp_integration`: MCP servers the extension interacts with

---

## Toubkal-Specific APIs

### 1. Privacy API (`toubkal.privacy`)

#### `toubkal.privacy.onAuditLogAdded`

Listens for new audit log entries.

**Event**: Fires when a new audit log entry is created

**Example**:

```
toubkal.privacy.onAuditLogAdded.addListener((log) => {
  console.log(`New audit log: ${log.actionType}`);
  // Process log entry
});
```

---

#### `toubkal.privacy.getConsentStatus(actionType)`

Gets consent status for a specific action.

**Parameters**:

- `actionType` (String): Action type (e.g., `"AI_QUERY_LOCAL"`)

**Returns**: `Promise<ConsentStatus>`

**Example**:

```
const status = await toubkal.privacy.getConsentStatus("AI_QUERY_LOCAL");
console.log(status);
// {
//   granted: true,
//   timestamp: 1729238400000,
//   expiresAt: null,
//   scope: "session"
// }
```

---

### 2. AI API (`toubkal.ai`)

#### `toubkal.ai.queryWithContext(prompt, context)`

Queries AI with page context automatically extracted.

**Parameters**:

- `prompt` (String): User query
- `context` (Object):
  - `includePageContent` (Boolean): Include current page content
  - `includeSelection` (Boolean): Include selected text
  - `model` (String): Model to use

**Returns**: `Promise<AIResponse>`

**Requires**: `toubkal.ai` permission + user consent

**Example**:

```
const response = await toubkal.ai.queryWithContext("Summarize this article", {
  includePageContent: true,
  model: "ollama:llama3.2-3b"
});

console.log(response.text);
```

---

#### `toubkal.ai.onModelDownloaded`

Fires when a new AI model is downloaded.

**Example**:

```
toubkal.ai.onModelDownloaded.addListener((model) => {
  console.log(`Model downloaded: ${model.name}`);
  // Update UI to show new model available
});
```

---

### 3. MCP API (`toubkal.mcp`)

#### `toubkal.mcp.registerServer(manifest)`

Registers a new MCP server provided by the extension.

**Parameters**:

- `manifest` (Object):
  - `id` (String): Unique server ID
  - `name` (String): Human-readable name
  - `tools` (Array): List of tools the server provides

**Returns**: `Promise<void>`

**Example**:

```
await toubkal.mcp.registerServer({
  id: "my-extension-mcp",
  name: "My Extension Tools",
  tools: [
    {
      name: "analyze_sentiment",
      description: "Analyzes sentiment of text",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string" }
        }
      }
    }
  ]
});
```

---

#### `toubkal.mcp.onToolInvoked`

Fires when an MCP tool is invoked (for servers registered by this extension).

**Example**:

```
toubkal.mcp.onToolInvoked.addListener(async (request) => {
  if (request.tool === "analyze_sentiment") {
    const sentiment = analyzeSentiment(request.params.text);
    return { sentiment };
  }
});
```

---

### 4. Workspace API (`toubkal.workspace`)

#### `toubkal.workspace.onWorkspaceActivated`

Fires when user switches workspaces.

**Example**:

```
toubkal.workspace.onWorkspaceActivated.addListener((workspace) => {
  console.log(`Switched to workspace: ${workspace.name}`);
  // Load workspace-specific settings
});
```

---

## Permissions

### Toubkal-Specific Permissions

| Permission          | Description                           | User Prompt          |
| ------------------- | ------------------------------------- | -------------------- |
| `toubkal.privacy`   | Read audit logs, check consent status | "Read privacy data"  |
| `toubkal.ai`        | Query AI models, manage models        | "Use AI features"    |
| `toubkal.mcp`       | Register MCP servers, invoke tools    | "Integrate with MCP" |
| `toubkal.workspace` | Access workspace data                 | "Access workspaces"  |
| `toubkal.consent`   | Request consent on behalf of user     | "Manage consent"     |

### Permission Examples

**Read audit logs**:

```
{
  "permissions": ["toubkal.privacy"]
}
```

**Use AI without page content** (no additional permissions):

```
const response = await toubkal.ai.query("What is 2+2?");
```

**Use AI with page content** (requires `activeTab` permission):

```
{
  "permissions": ["toubkal.ai", "activeTab"]
}
```

---

## Examples

### Example 1: Privacy Dashboard Extension

```
// background.js
toubkal.privacy.onAuditLogAdded.addListener(async (log) => {
  if (log.actionType === "AI_QUERY_CLOUD") {
    // Notify user about cloud AI usage
    chrome.notifications.create({
      type: "basic",
      title: "Cloud AI Used",
      message: `Query sent to ${log.data.provider}`,
      iconUrl: "icon.png"
    });
  }
});
```

---

### Example 2: AI-Powered Summarizer

```
// content.js
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "summarize") {
    const response = await toubkal.ai.queryWithContext("Summarize this page", {
      includePageContent: true,
      model: "ollama:llama3.2-3b"
    });

    sendResponse({ summary: response.text });
  }
});
```

---

### Example 3: MCP Server Extension

```
// background.js
await toubkal.mcp.registerServer({
  id: "weather-mcp",
  name: "Weather Tools",
  tools: [{
    name: "get_weather",
    description: "Gets current weather for a city",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string" }
      },
      required: ["city"]
    }
  }]
});

toubkal.mcp.onToolInvoked.addListener(async (request) => {
  if (request.tool === "get_weather") {
    const weather = await fetchWeather(request.params.city);
    return { temperature: weather.temp, conditions: weather.conditions };
  }
});
```

---

## Feature Detection

### Check if running on Toubkal

```
if (typeof toubkal !== "undefined") {
  // Toubkal-specific features available
  const logs = await toubkal.privacy.getAuditLogs();
} else {
  // Running on Chrome or other browser
  console.log("Toubkal features not available");
}
```

---

## Error Handling

```
try {
  const response = await toubkal.ai.query("Test");
} catch (error) {
  if (error.code === "TOUBKAL_NOT_AVAILABLE") {
    console.error("Not running on Toubkal");
  } else if (error.code === "CONSENT_DENIED") {
    console.error("User denied consent");
  }
}
```

---

## TypeScript Support

```
/// <reference types="toubkal-extension-types" />

const logs: toubkal.privacy.AuditLog[] = await toubkal.privacy.getAuditLogs();
```

**Install types**:

```
pnpm add -D @toubkal/extension-types
```

---

## Migration from Chrome Extensions

**Step 1**: Add Toubkal permissions to manifest

```
{
  "permissions": ["toubkal.ai", "toubkal.privacy"]
}
```

**Step 2**: Use feature detection

```
if (typeof toubkal !== "undefined") {
  // Use Toubkal features
} else {
  // Fallback to Chrome APIs
}
```

**Step 3**: Test on both browsers

---

## See Also

- [Browser API](browser-api.md) - Web page APIs
- [MCP Server API](mcp-server-api.md) - MCP protocol
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/mv3/)

---

**Last Updated**: 2025-10-18

```

***
```
