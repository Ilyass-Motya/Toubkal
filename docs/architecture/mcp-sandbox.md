# MCP Server Sandboxing Architecture

**Status**: Draft  
**Last Updated**: 2025-01-27  
**Author**: BMad Master (Brainstorming Session Output)  
**Phase**: 2 (Weeks 9-16)

## Overview

Toubkal's MCP server sandboxing ensures security and privacy while enabling extensibility. This architecture provides multiple layers of isolation to prevent malicious MCP servers from compromising user data or system integrity.

## Sandbox Isolation Layers

### Process Isolation

**Implementation**: Each MCP server runs in a separate process using Chromium's multi-process architecture.

**Benefits**:

- Complete memory isolation between servers
- Process crash isolation (one server crash doesn't affect others)
- Independent resource monitoring per server
- OS-level security boundaries

**Technical Details**:

- MCP servers run as child processes of the main browser process
- Communication via Mojo IPC (same as Chromium's renderer processes)
- Process lifecycle managed by Toubkal's MCP Server Manager
- Automatic restart on unexpected crashes

### Capability-Based Permissions

**Implementation**: JSON-defined permissions similar to Chrome Extension Manifest V3.

**Permission Model**:

```json
{
  "permissions": {
    "filesystem": {
      "read": ["/home/user/documents"],
      "write": ["/home/user/toubkal-workspace"]
    },
    "network": {
      "domains": ["api.github.com", "slack.com"],
      "protocols": ["https"]
    },
    "browser": {
      "tabs": ["read", "create"],
      "bookmarks": ["read"],
      "history": ["read"]
    }
  }
}
```

**Runtime Enforcement**:

- Permissions checked before every tool invocation
- Capability matrix stored in MCP server manifest
- Violations logged in audit trail with Ed25519 signature
- Automatic server termination on permission violations

### Network Sandboxing by Privacy Label

**Privacy Label System**:

#### 🟢 **Local Only** (No Network Access)

- **Use Cases**: Filesystem, database, local AI models
- **Restrictions**: No network requests allowed
- **Examples**: File manager, local database, document processor
- **Audit Level**: Minimal (local operations only)

#### 🟡 **Network Access** (Restricted Domains)

- **Use Cases**: GitHub API, Slack integration, approved services
- **Restrictions**: Only pre-approved domains and protocols
- **Examples**: GitHub MCP server, Slack MCP server, weather API
- **Audit Level**: Standard (network requests logged)

#### 🔴 **Remote API** (Full Network Access)

- **Use Cases**: Cloud AI providers, external APIs
- **Restrictions**: Full consent disclosure before invocation
- **Examples**: OpenAI MCP server, Anthropic MCP server
- **Audit Level**: Full (all data logged with consent records)

**Implementation**:

- Network requests intercepted at Mojo IPC level
- Domain allowlist checked against server's privacy label
- Consent banner shown for 🔴 servers before any network call
- All network activity logged in audit trail

### Resource Limits

**CPU/RAM/Disk Quotas**:

- **Default Limits**: 100MB RAM, 10% CPU, 1GB disk per server
- **Configurable**: Users can adjust limits per server
- **Enforcement**: OS-level cgroups (Linux), job objects (Windows)
- **Monitoring**: Real-time resource usage in MCP Server Manager UI

**DoS Prevention**:

- Rate limiting on tool invocations (100/minute default)
- Memory leak detection and automatic restart
- CPU throttling for runaway processes
- Disk usage monitoring with cleanup

## Consent Enforcement

### Per-Tool Consent Model

**Consent Levels**:

- **Allow Once**: Single tool invocation only
- **Allow Session**: All tools for current browser session
- **Allow Workspace**: All tools within specific workspace
- **Allow Always**: All tools permanently (with periodic re-confirmation)
- **Never**: Block all tool invocations

**Consent UI**:

```
┌─────────────────────────────────────┐
│ MCP Tool Invocation Request        │
│                                     │
│ Server: GitHub MCP (🟡 Network)    │
│ Tool: create_issue                  │
│ Data: {title: "Bug report", ...}   │
│                                     │
│ [Allow Once] [Allow Session]        │
│ [Allow Workspace] [Never]           │
└─────────────────────────────────────┘
```

### Audit Trail Integration

**Every MCP Tool Call Logged**:

- Timestamp and server identifier
- Tool name and parameters
- User consent decision
- Ed25519 signature of the invocation
- Merkle tree hash for integrity verification

**Example Audit Entry**:

```json
{
  "id": "mcp_001",
  "timestamp": 1704067200000,
  "server": "github-mcp",
  "tool": "create_issue",
  "parameters": { "title": "Bug report", "body": "..." },
  "consent": "allow_once",
  "user_id": "user_123",
  "signature": "ed25519_abc123...",
  "merkle_root": "def456..."
}
```

## MCP Server Manager UI

### Real-Time Monitoring

**Server Status Dashboard**:

- Running/Stopped/Error status per server
- Resource usage (CPU/RAM/disk)
- Tool invocation count and success rate
- Network activity (for 🟡 and 🔴 servers)

**Log Viewer**:

- Real-time stream of server logs
- Filter by server, tool, or consent level
- Export logs for debugging or compliance
- Search and highlight functionality

### Server Management

**Installation**:

- One-click install via `npx` or Docker
- Automatic dependency resolution
- Permission manifest validation
- Privacy label assignment

**Configuration**:

- Resource limit adjustment
- Permission modification (with user consent)
- Workspace assignment
- Update and rollback management

## Security Considerations

### Threat Model

**Potential Attacks**:

1. **Data Exfiltration**: Server sends user data to external servers
2. **Privilege Escalation**: Server gains access beyond declared permissions
3. **Resource Exhaustion**: Server consumes excessive CPU/memory/disk
4. **Process Injection**: Malicious code execution in server process

**Mitigations**:

1. **Network Sandboxing**: Restrict network access by privacy label
2. **Capability Model**: Strict permission enforcement
3. **Resource Limits**: OS-level quotas and monitoring
4. **Process Isolation**: Separate process prevents injection

### Audit and Compliance

**Forensic Capabilities**:

- Complete audit trail of all MCP operations
- Cryptographic proof of server behavior
- Exportable logs for compliance reporting
- Real-time monitoring for security teams

**Privacy Protection**:

- Local-only servers (🟢) never send data externally
- Network servers (🟡🔴) require explicit consent
- All data flows logged and verifiable
- User controls all data sharing decisions

## Implementation Timeline

### Phase 2 (Weeks 9-16)

**Week 9-10**: Process Isolation

- Implement MCP server process spawning
- Basic Mojo IPC communication
- Process lifecycle management

**Week 11-12**: Permission System

- JSON permission manifest parsing
- Runtime permission enforcement
- Capability-based access control

**Week 13-14**: Network Sandboxing

- Privacy label system implementation
- Network request interception
- Consent banner integration

**Week 15-16**: UI and Integration

- MCP Server Manager UI
- Real-time monitoring dashboard
- Audit trail integration

## References

- [PRD Section 4: MCP Integration](../TOUBKAL-PRD.md#mcp-integration-p0---critical)
- [ADR-003: IPC Framework](../adrs/ADR-003-ipc-framework.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

**Next Review**: Phase 2 Week 9 (Implementation Start)  
**Owner**: Hassan (Phase 2 Lead Developer)
