# Story 0.5.11: Audit Logging Integration - Log Blocked Requests

Status: Ready for Development
Priority: P0 (Foundation)
Estimated Effort: 3 days

## Dependencies

**Required Stories (must complete first):**
- Story 0.5.2: SignEntry method (provides cryptographic signing for audit entries)
- Story 0.5.9: ShouldBlockRequest (provides ad blocking decisions to log)

## Story

As a Toubkal Browser developer,
I want to log every blocked ad request to the audit trail,
so that users can verify comprehensive ad blocking with cryptographic proof.

## Acceptance Criteria

1. Every blocked request is logged with Ed25519 signature
2. Audit entries include URL, blocking reason, and timestamp
3. Cryptographic proof of blocking is generated
4. Blocking events are logged to audit trail with Merkle inclusion
5. 100% audit coverage for blocked requests verified
6. Performance impact on ad blocking is minimal (<1ms additional latency)

## Tasks / Subtasks

- [ ] Integrate audit logging with AdBlockingService
  - [ ] Add AuditLogger dependency to AdBlockingService
  - [ ] Create audit entry when request is blocked
  - [ ] Include blocking metadata (filter rule, reason, domain)
  - [ ] Generate Ed25519 signature for each block event

- [ ] Implement cryptographic proof generation for blocks
  - [ ] Create blocking proof structure with Merkle inclusion
  - [ ] Sign proof data with user private key
  - [ ] Store proof in audit entry for tamper verification
  - [ ] Include blocking rule hash for integrity

- [ ] Add blocking event batching and optimization
  - [ ] Implement asynchronous audit logging to avoid blocking
  - [ ] Batch multiple blocking events for efficiency
  - [ ] Cache signature operations for performance
  - [ ] Memory-efficient proof storage and transmission

- [ ] Add blocking statistics collection
  - [ ] Track blocked requests by domain and category
  - [ ] Aggregate blocking statistics over time periods
  - [ ] Include statistics in audit metadata
  - [ ] Support for blocking effectiveness analysis

- [ ] Implement audit chain verification for blocks
  - [ ] Verify blocking events are included in Merkle tree
  - [ ] Add chain integrity checks for blocking audit trail
  - [ ] Implement blocking event replay for verification
  - [ ] Support for forensic analysis of blocking decisions

- [ ] Comprehensive testing and verification
  - [ ] Test audit logging with real ad blocking scenarios
  - [ ] Verify cryptographic proofs are valid and tamper-proof
  - [ ] Performance testing for audit logging overhead
  - [ ] Test blocking audit trail integrity and verification

## Dev Notes

- Relevant architecture patterns and constraints
  - Audit logging must be reliable (never lose blocking events)
  - Blocking events must be cryptographically verifiable
  - Support for large volumes of blocking events without performance degradation
  - Integration with existing audit trail infrastructure

- Source tree components to touch
  - AdBlockingService integration with AuditLogger
  - Audit entry schema updates for blocking events
  - Merkle tree integration for blocking proofs

- Testing standards summary
  - Audit log accuracy tests for blocking events
  - Cryptographic proof validation for tamper resistance
  - Performance impact assessment on ad blocking
  - Integration tests with audit system

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Extends existing AdBlockingService component
  - Integrates with audit system components
  - Follows src/toubkal/components/privacy/ pattern

### References

- [Source: docs/PRODUCT-ROADMAP.md#Phase-0-5-Real-Privacy-Implementation]
- [Source: docs/PRIVACY-ETHICS-POLICY.md#Cryptographic-Auditability]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
