# Story 0.5.2: BoringSSL Integration - Implement SignEntry() Method

Status: Ready for Development
Priority: P0 (Foundation)
Estimated Effort: 2 days

## Dependencies

**Required Stories (must complete first):**
- Story 0.5.1: KeyManager (provides cryptographic primitives for signing)

## Story

As a Toubkal Browser developer,
I want to implement the AuditLogger::SignEntry() method using BoringSSL,
so that audit entries are cryptographically signed with Ed25519 signatures for tamper detection.

## Acceptance Criteria

1. AuditLogger::SignEntry() method accepts audit data and returns Ed25519 signature
2. Signatures use FIPS 140-2/3 validated BoringSSL primitives
3. Signed audit entries include timestamp, signature, and public key reference
4. Signature verification works correctly (sign/verify roundtrip)
5. Integration follows Chromium error handling patterns
6. Method is thread-safe and performant (<10ms per signature)

## Tasks / Subtasks

- [ ] Extend AuditLogger class with SignEntry method
  - [ ] Add SignEntry() method to audit_logger.h
  - [ ] Implement method in audit_logger.cc
  - [ ] Add dependency injection for KeyManager instance

- [ ] Implement audit entry signing logic
  - [ ] Create canonical JSON representation of audit data
  - [ ] Generate SHA-256 hash of audit entry
  - [ ] Sign hash using Ed25519 private key
  - [ ] Return signature as base64-encoded string

- [ ] Update audit entry data structure
  - [ ] Add signature field to audit entry JSON schema
  - [ ] Add public key ID reference for verification
  - [ ] Add signing timestamp for audit trail ordering
  - [ ] Ensure backward compatibility with existing entries

- [ ] Implement signature verification in audit chain
  - [ ] Add VerifyEntrySignature() method to AuditLogger
  - [ ] Implement batch verification for audit log integrity
  - [ ] Add error handling for corrupted signatures
  - [ ] Log verification failures for security monitoring

- [ ] Add comprehensive unit tests
  - [ ] Test SignEntry() with various audit data types
  - [ ] Test signature verification (valid/invalid signatures)
  - [ ] Test performance requirements (<10ms per operation)
  - [ ] Test error conditions (key not found, crypto failures)

- [ ] Integration testing with LevelDB storage
  - [ ] Test end-to-end signing workflow
  - [ ] Verify signatures persist correctly in database
  - [ ] Test signature verification after restart

## Dev Notes

- Relevant architecture patterns and constraints
  - Follow Chromium's crypto integration patterns
  - Use asynchronous signing for UI responsiveness
  - Implement proper error propagation (Result<T> pattern)
  - Ensure crypto operations are isolated from UI thread

- Source tree components to touch
  - src/toubkal/components/privacy/audit/audit_logger.h (update)
  - src/toubkal/components/privacy/audit/audit_logger.cc (update)
  - src/toubkal/components/privacy/crypto/key_manager.h (new dependency)
  - BUILD.gn files for updated audit components

- Testing standards summary
  - Unit tests for all signing/verification operations
  - Integration tests with LevelDB persistence
  - Performance benchmarks for crypto operations
  - Security testing for signature integrity

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Extends existing audit_logger component
  - Follows Chromium naming conventions (PascalCase methods)
  - Proper dependency injection pattern

- Detected conflicts or variances (with rationale)
  - Adds crypto dependency to audit system (expected integration)

### References

- [Source: docs/PRODUCT-ROADMAP.md#Phase-0-5-Real-Privacy-Implementation]
- [Source: docs/PRIVACY-ETHICS-POLICY.md#Cryptographic-Auditability]
- [Source: docs/architecture/audit-trail-architecture.md]
- [Source: CODING-RULES.md#Error-Handling]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
