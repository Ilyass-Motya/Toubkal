# Toubkal MCP Server API

**Status**: Alpha (Unstable)  
**Last Updated**: 2025-10-18  
**Target Stability**: Beta (Jun 2026)  
**Protocol**: Model Context Protocol (MCP) Specification

⚠️ **Warning**: This API may change without notice during Alpha/Beta phases.

---

## Overview

Toubkal is the **first browser with native Model Context Protocol (MCP) support**. MCP servers provide tools that AI models can invoke to interact with browser state, external services, or user data.

**Key Features**:

- **Native Integration**: MCP servers run as browser processes (not external processes)
- **Consent-Gated**: Every tool invocation requires explicit user consent
- **Privacy-First**: Tool calls are logged in the cryptographic audit trail
- **Protocol Compliance**: Implements the [MCP Specification](https://spec.modelcontextprotocol.io)

---

## Table of Contents

1. [Protocol Overview](#protocol-overview)
2. [Server Manifest](#server-manifest)
3. [Communication Protocols](#communication-protocols)
4. [Built-in Servers](#built-in-servers)
5. [Custom Server Development](#custom-server-development)
6. [Tool Invocation Flow](#tool-invocation-flow)
7. [Security & Consent](#security--consent)

---

## Protocol Overview

### MCP Architecture

```
┌─────────────────────────────────────────────┐
│          AI Model (Llama 3.2-3B)            │
│  "Close all YouTube tabs"                   │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│        MCP Client (Toubkal Browser)         │
│  - Parses tool requests                     │
│  - Routes to appropriate server             │
│  - Enforces consent                         │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│    MCP Server (toubkal-tabs)                │
│  Tool: close_tabs({ filter: "youtube.com" })│
└─────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│      Browser API (Tabs Management)          │
│  chrome.tabs.query() + chrome.tabs.remove() │
└─────────────────────────────────────────────┘
```

---

## Server Manifest

Every MCP server must provide a manifest file describing its capabilities.

### manifest.json

```
{
  "protocol_version": "1.0",
  "server": {
    "id": "toubkal-tabs",
    "name": "Tab Management Server",
    "version": "1.0.0",
    "description": "Provides tools for managing browser tabs"
  },
  "author": {
    "name": "Toubkal Team",
    "email": "dev@toubkal.app"
  },
  "permissions": {
    "browser": ["tabs"],
    "network": false,
    "filesystem": false
  },
  "tools": [
    {
      "name": "list_tabs",
      "description": "Lists all open tabs with URLs and titles",
      "inputSchema": {
        "type": "object",
        "properties": {
          "filter": {
            "type": "string",
            "description": "Optional URL filter (substring match)"
          }
        }
      }
    },
    {
      "name": "close_tabs",
      "description": "Closes tabs matching the filter",
      "inputSchema": {
        "type": "object",
        "properties": {
          "filter": {
            "type": "string",
            "description": "URL filter (required)"
          }
        },
        "required": ["filter"]
      }
    }
  ],
  "resources": [],
  "prompts": []
}
```

---

## Communication Protocols

Toubkal supports **3 transport protocols** for MCP servers:

### 1. Stdio (Standard Input/Output)

**Use Case**: Lightweight servers, command-line tools

**Server Implementation**:

```
// server.js (Node.js)
process.stdin.on('data', (data) => {
  const request = JSON.parse(data);
  const response = handleRequest(request);
  process.stdout.write(JSON.stringify(response) + '\n');
});
```

**Toubkal Configuration**:

```
{
  "id": "my-server",
  "transport": "stdio",
  "command": ["node", "/path/to/server.js"]
}
```

---

### 2. HTTP (REST API)

**Use Case**: Remote services, cloud integrations

**Server Implementation**:

```
// server.js (Express)
app.post('/mcp/invoke', async (req, res) => {
  const { tool, params } = req.body;
  const result = await handleToolInvocation(tool, params);
  res.json(result);
});
```

**Toubkal Configuration**:

```
{
  "id": "weather-server",
  "transport": "http",
  "url": "https://api.example.com/mcp"
}
```

---

### 3. Native (C++ Plugin)

**Use Case**: High-performance, deep browser integration

**Server Implementation**:

```
// server_plugin.cc
class TabsServer : public MCPServer {
 public:
  ToolResult InvokeTool(const std::string& tool_name,
                        const base::Value& params) override {
    if (tool_name == "close_tabs") {
      return CloseTabs(params);
    }
    return ToolResult::Error("Unknown tool");
  }
};
```

**Toubkal Configuration**:

```
{
  "id": "toubkal-tabs",
  "transport": "native",
  "plugin": "libtoubkal_tabs_server.so"
}
```

---

## Built-in Servers

Toubkal ships with **3 built-in MCP servers**:

### 1. toubkal-tabs

**Purpose**: Tab management (list, close, create, switch)

**Tools**:

- `list_tabs`: Lists all open tabs
- `close_tabs`: Closes tabs matching filter
- `create_tab`: Opens new tab with URL
- `switch_to_tab`: Switches to specific tab

**Example**:

```
{
  "tool": "close_tabs",
  "params": {
    "filter": "youtube.com"
  }
}
```

**Response**:

```
{
  "closedCount": 3,
  "tabIds":
}
```

---

### 2. toubkal-context

**Purpose**: Page content extraction (for AI context)

**Tools**:

- `get_page_content`: Extracts main content (article text, no ads)
- `get_page_links`: Lists all links on current page
- `get_selected_text`: Returns user-selected text
- `screenshot`: Captures screenshot (requires consent)

**Example**:

```
{
  "tool": "get_page_content",
  "params": {
    "url": "https://example.com/article"
  }
}
```

**Response**:

```
{
  "title": "Article Title",
  "content": "Article text...",
  "wordCount": 1250
}
```

---

### 3. toubkal-bookmarks

**Purpose**: Bookmark management

**Tools**:

- `list_bookmarks`: Lists all bookmarks
- `search_bookmarks`: Searches bookmarks by keyword
- `add_bookmark`: Adds new bookmark
- `remove_bookmark`: Removes bookmark

**Example**:

```
{
  "tool": "search_bookmarks",
  "params": {
    "query": "machine learning"
  }
}
```

---

## Custom Server Development

### Step 1: Create Server Manifest

```
{
  "protocol_version": "1.0",
  "server": {
    "id": "my-custom-server",
    "name": "My Custom Server",
    "version": "1.0.0"
  },
  "tools": [
    {
      "name": "my_tool",
      "description": "Does something useful",
      "inputSchema": {
        "type": "object",
        "properties": {
          "input": { "type": "string" }
        },
        "required": ["input"]
      }
    }
  ]
}
```

---

### Step 2: Implement Server (Node.js + Stdio)

```
// server.js
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  const request = JSON.parse(line);

  if (request.method === 'tools/invoke') {
    const { tool, params } = request.params;

    if (tool === 'my_tool') {
      const result = { output: `Processed: ${params.input}` };
      const response = {
        jsonrpc: '2.0',
        id: request.id,
        result
      };
      console.log(JSON.stringify(response));
    }
  }
});
```

---

### Step 3: Register with Toubkal

**Option A: Via Extension**

```
// extension background.js
await toubkal.mcp.registerServer({
  id: "my-custom-server",
  transport: "stdio",
  command: ["node", "/path/to/server.js"],
  manifest: { /* ... */ }
});
```

**Option B: Via Config File**

```
// ~/.toubkal/mcp-servers.json
{
  "servers": [
    {
      "id": "my-custom-server",
      "transport": "stdio",
      "command": ["node", "/path/to/server.js"]
    }
  ]
}
```

---

## Tool Invocation Flow

### 1. AI Model Generates Tool Call

```
User: "Close all YouTube tabs"

AI Model Output:
<tool_call>
  <tool>close_tabs</tool>
  <params>{"filter": "youtube.com"}</params>
</tool_call>
```

---

### 2. Toubkal Parses Tool Call

```
// inference_gateway.cc
std::optional<ToolCall> ParseToolCall(const std::string& response) {
  // Extract <tool_call> block from AI response
  // Parse JSON params
  // Return ToolCall struct
}
```

---

### 3. Consent Gate Activated

```
┌─────────────────────────────────────────┐
│  Allow AI to close YouTube tabs?       │
│                                         │
│  Tool: close_tabs                       │
│  Server: toubkal-tabs                   │
│  Params: { filter: "youtube.com" }     │
│                                         │
│  [ Allow Once ]  [ Allow Always ]      │
│  [ Deny ]                               │
└─────────────────────────────────────────┘
```

---

### 4. Tool Executed (if approved)

```
// MCP client invokes tool
const result = await mcpClient.invokeTool('toubkal-tabs', 'close_tabs', {
  filter: 'youtube.com'
});

// Result: { closedCount: 3, tabIds:  }
```

---

### 5. Audit Log Created

```
{
  "timestamp": 1729238400000,
  "actionType": "MCP_TOOL_INVOKE",
  "userId": "anon_user_123",
  "data": {
    "server": "toubkal-tabs",
    "tool": "close_tabs",
    "params": { "filter": "youtube.com" },
    "result": { "closedCount": 3 },
    "consentGiven": true
  },
  "signature": "ed25519_sig_abc123..."
}
```

---

## Security & Consent

### Consent Scopes

| Scope            | Description                  | Example Tools                    |
| ---------------- | ---------------------------- | -------------------------------- |
| **READ_TABS**    | Read tab list (URLs, titles) | `list_tabs`                      |
| **MODIFY_TABS**  | Close, create, switch tabs   | `close_tabs`, `create_tab`       |
| **READ_CONTENT** | Extract page content         | `get_page_content`               |
| **SCREENSHOT**   | Capture screenshots          | `screenshot`                     |
| **BOOKMARKS**    | Access/modify bookmarks      | `list_bookmarks`, `add_bookmark` |
| **NETWORK**      | Make external HTTP requests  | Custom server tools              |

---

### Consent Prompts

**First Time**:

```
Allow AI to use "toubkal-tabs" server?

This server can:
✓ List your open tabs
✓ Close tabs
✓ Create new tabs

[Allow Once] [Allow Always] [Deny]
```

**Subsequent Calls** (if "Allow Always" selected):

```
(no prompt, silent execution)
```

---

### Privacy Labels

MCP servers display privacy labels (similar to App Store):

🟢 **Local** - Runs entirely locally, no network access  
🟡 **Network** - May send data to external servers  
🟠 **Cloud** - Requires cloud API (e.g., weather service)

---

## Error Handling

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "Consent denied by user",
    "data": {
      "tool": "close_tabs",
      "consentRequired": "MODIFY_TABS"
    }
  }
}
```

**Error Codes**:

- `-32000`: Consent denied
- `-32001`: Tool not found
- `-32002`: Invalid parameters
- `-32003`: Server unavailable

---

## Testing

### Test MCP Server Locally

```
# Start server
node server.js

# Send test request (stdin)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/invoke","params":{"tool":"my_tool","params":{"input":"test"}}}' | node server.js
```

---

## See Also

- [MCP Specification](https://spec.modelcontextprotocol.io)
- [Extension API](extension-api.md) - Register servers via extensions
- [AI Integration Spec](../architecture/AI-INTEGRATION-SPEC.md) - AI + MCP integration

---

**Last Updated**: 2025-10-18

```

***
```
