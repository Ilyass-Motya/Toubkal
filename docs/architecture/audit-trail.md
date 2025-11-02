# Cryptographic Audit Trail Architecture

**Status**: Draft
**Last Updated**: 2025-01-27
**Author**: BMad Master (Brainstorming Session Output)
**Phase**: 1 (Weeks 1-8)

## Overview

Toubkal's cryptographic audit trail provides mathematically verifiable proof of all browser operations, ensuring complete transparency and enabling independent verification of privacy claims. Every operation is Ed25519-signed and integrated into a Merkle tree for tamper detection.

## Audit Granularity Levels

### User-Configurable Modes

Toubkal provides four audit granularity levels to balance privacy transparency with performance:

| Level                  | What's Logged                        | Performance Impact | Use Case                                 |
| ---------------------- | ------------------------------------ | ------------------ | ---------------------------------------- |
| **Minimal**            | AI operations only                   | <1% overhead       | Casual users, low-end hardware           |
| **Standard** (Default) | AI + Cloud + MCP operations          | 2-3% overhead      | Privacy-conscious professionals          |
| **Full**               | All network requests + AI/Cloud/MCP  | 5-10% overhead     | Enterprise compliance, high-threat users |
| **Forensic**           | Full + DOM events + keystroke timing | 15-20% overhead    | Legal/forensic mode (opt-in)             |

### Level Details

#### Minimal Mode

**Logged Operations**:

- AI queries (local and cloud)
- AI model loading/unloading
- AI workspace context changes

**Performance Target**: <1% CPU/memory overhead
**Storage**: ~1MB per 10,000 operations
**Use Case**: Users who want basic AI transparency without performance impact

#### Standard Mode (Default)

**Logged Operations**:

- All Minimal mode operations
- Cloud AI API calls (with consent)
- MCP tool invocations
- Consent decisions and changes
- Privacy setting modifications

**Performance Target**: <3% CPU/memory overhead
**Storage**: ~10MB per 10,000 operations
**Use Case**: Privacy-conscious users who want comprehensive audit coverage

#### Full Mode

**Logged Operations**:

- All Standard mode operations
- Network requests (first-party navigation)
- Third-party requests (trackers, ads)
- Blocked requests with cryptographic proof
- Extension operations
- Browser setting changes

**Performance Target**: <10% CPU/memory overhead
**Storage**: ~100MB per 10,000 operations
**Use Case**: Enterprise compliance, security researchers, high-threat users

#### Forensic Mode

**Logged Operations**:

- All Full mode operations
- DOM events (clicks, form inputs)
- Keystroke timing (anonymized)
- Tab switching and focus changes
- Window management events

**Performance Target**: <20% CPU/memory overhead
**Storage**: ~500MB per 10,000 operations
**Use Case**: Legal proceedings, forensic analysis, security investigations

## Technical Optimizations

### Async Logging with Write-Ahead Log (WAL)

**Problem**: Ed25519 signing is CPU-intensive and blocks user operations.

**Solution**: Write-Ahead Log with async signing.

**Implementation**:

1. **Write unsigned entries** to WAL (instant, non-blocking)
2. **Async worker** signs entries and commits to LevelDB
3. **User sees "Pending signature"** status until committed
4. **Merkle tree updated** when signatures are complete

**Benefits**:

- Zero perceived latency for user operations
- Cryptographic integrity maintained
- Graceful handling of signing failures

### Batched Signing (Phase 2 Optimization)

**Problem**: Individual Ed25519 signatures create significant overhead.

**Solution**: Batch multiple operations into single signatures.

**Implementation**:

- Group 10-50 operations per second into batches
- Single Ed25519 signature per batch
- Trade-off: 1-second granularity instead of per-operation
- 10x performance improvement for high-volume scenarios

**Configuration**:

```json
{
  "batching": {
    "enabled": true,
    "batch_size": 25,
    "batch_timeout_ms": 1000,
    "max_batch_delay_ms": 5000
  }
}
```

### Log Rotation & Archival

**Hot Storage** (LevelDB):

- Keep 30 days of logs in fast access storage
- Real-time querying and filtering
- Immediate signature verification

**Cold Storage** (Compressed JSON):

- Archive older logs to compressed files
- User-exported only (privacy protection)
- Configurable retention policy (7 days to unlimited)

**Retention Policies**:

- **Minimal**: 7 days (auto-delete)
- **Standard**: 30 days (auto-archive)
- **Full**: 90 days (auto-archive)
- **Forensic**: 1 year (manual cleanup)

## Performance Targets

### Phase 1 Targets (Weeks 1-8)

**Audit Overhead**: <5% CPU/memory impact on Standard mode
**Signature Verification**: 100% on export (not real-time)
**Storage**: 100MB per 1 million operations (compressed)
**Latency**: <100ms for audit log queries

### Phase 2 Targets (Weeks 9-16)

**Batched Signing**: 10x performance improvement
**Real-time Verification**: 95% of signatures verified within 1 second
**Storage Optimization**: 50% reduction in storage footprint
**Query Performance**: <50ms for complex audit log searches

## User Configuration UI

### Settings Interface

**Location**: `toubkal://settings/privacy/audit`

**Configuration Options**:

- **Audit Level**: Dropdown (Minimal/Standard/Full/Forensic)
- **Retention Period**: Slider (7 days to unlimited)
- **Batching**: Toggle (enabled/disabled)
- **Real-time Verification**: Toggle (enabled/disabled)
- **Export Format**: Checkboxes (JSON/CSV/PDF)

**Visual Indicators**:

- **Current Level**: Color-coded indicator (🟢 Minimal, 🟡 Standard, 🔴 Full, ⚫ Forensic)
- **Performance Impact**: Real-time CPU/memory usage display
- **Storage Usage**: Current log size and projected growth
- **Signature Status**: Pending/Verified/Failed counts

### Transparency Dashboard

**Location**: `toubkal://audit`

**Real-time Monitoring**:

- **Operation Counter**: Live count of logged operations
- **Signature Queue**: Pending signatures waiting for processing
- **Performance Metrics**: CPU/memory impact of audit logging
- **Storage Usage**: Current log size and retention status

**Export Functionality**:

- **Quick Export**: Last 24 hours (JSON/CSV/PDF)
- **Custom Range**: Date/time picker for specific periods
- **Filtered Export**: By operation type, consent level, or server
- **Verification Report**: Cryptographic proof of log integrity

## Cryptographic Implementation

### Ed25519 Signing

**Key Management**:

- User generates Ed25519 key pair on first run
- Private key stored in OS keychain (Windows Credential Manager, macOS Keychain, Linux Secret Service)
- Public key embedded in all audit entries
- Key rotation supported (new key signs old key's validity)

**Signature Process**:

1. **Create audit entry** with operation details
2. **Generate Merkle tree hash** of entry
3. **Sign hash** with user's Ed25519 private key
4. **Store signed entry** in LevelDB
5. **Update Merkle tree** with new entry

### Merkle Tree Verification

**Tree Structure**:

- **Leaf Nodes**: Individual audit entries
- **Internal Nodes**: Hashes of child nodes
- **Root Hash**: Single hash representing entire log
- **Incremental Updates**: Only affected branches recomputed

**Verification Process**:

1. **Export audit log** with Merkle tree
2. **Recompute tree** from exported entries
3. **Compare root hashes** (must match)
4. **Verify signatures** on all entries
5. **Report integrity status** (Verified/Tampered/Incomplete)

## Integration Points

### AI Operations

**Local AI**:

- Model loading/unloading events
- Query parameters and responses
- Resource usage (RAM/VRAM/CPU)
- Performance metrics (latency, tokens/sec)

**Cloud AI**:

- Consent decisions and data disclosure
- API requests and responses
- Provider information and costs
- Privacy policy compliance

### MCP Operations

**Tool Invocations**:

- Server identifier and tool name
- Input parameters and output results
- Permission checks and violations
- Resource usage and performance

**Server Management**:

- Installation and uninstallation
- Permission changes and updates
- Start/stop/restart events
- Error conditions and crashes

### Privacy Operations

**Consent Decisions**:

- User choices (Allow/Deny/Once/Session/Always)
- Context information (workspace, server, tool)
- Data disclosure details
- Timestamp and session information

**Blocking Operations**:

- Blocked requests with reasons
- Filter list matches and rules
- CNAME uncloaking results
- Cryptographic proof of blocking

## Compliance and Legal

### GDPR Compliance

**Data Subject Rights**:

- **Right to Access**: Export all audit logs
- **Right to Erasure**: Delete specific log entries
- **Right to Portability**: Export in standard formats
- **Right to Rectification**: Correct erroneous entries

**Data Minimization**:

- Only log necessary information
- Anonymize personal data where possible
- Configurable retention periods
- Automatic data cleanup

### Enterprise Compliance

**SOC 2 Type I**:

- Complete audit trail of all operations
- Cryptographic integrity verification
- Access controls and user authentication
- Data retention and disposal policies

**ISO 27001**:

- Information security management
- Risk assessment and mitigation
- Incident response and forensics
- Continuous monitoring and improvement

## References

- [PRD Section 4: Privacy & Security Foundation](../TOUBKAL-PRD.md#privacy--security-foundation-p0---critical)
- [ADR-002: Browser Engine](../adrs/ADR-002-browser-engine.md)
- [Ed25519 Signature Scheme](https://ed25519.cr.yp.to/)
- [Merkle Tree Implementation](https://en.wikipedia.org/wiki/Merkle_tree)

---

**Next Review**: Phase 1 Week 4 (Implementation Progress)
**Owner**: Hassan (Phase 1 Lead Developer)
