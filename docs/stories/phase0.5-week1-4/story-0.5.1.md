# Story 0.5.1: BoringSSL Integration - Generate Keypairs

Status: Ready for Development
Priority: P0 (Foundation)
Dependencies: None
Estimated Effort: 3 days

## Story

As a Toubkal Browser developer,
I want to integrate BoringSSL for cryptographic operations,
so that audit entries can be cryptographically signed with Ed25519 signatures for tamper-proof logging.

## Acceptance Criteria

1. Ed25519 keypair generation is implemented on first browser run
2. Generated keys are stored securely in LevelDB
3. Key verification functions work correctly (sign/verify cycle)
4. Integration follows Chromium C++ coding standards
5. All cryptographic operations use FIPS 140-2/3 validated primitives
6. KeyManager provides clean API for cryptographic operations

## Tasks / Subtasks

- [ ] Implement KeyManager class for Ed25519 operations
  - [ ] Create src/toubkal/components/privacy/crypto/key_manager.h
  - [ ] Create src/toubkal/components/privacy/crypto/key_manager.cc
  - [ ] Implement GenerateKeyPair() method using BoringSSL EVP_PKEY
  - [ ] Implement SignData() and VerifySignature() methods
  - [ ] Add proper error handling with Result<T> pattern

- [ ] Implement key lifecycle management
  - [ ] Create key storage schema in LevelDB (via AuditStorage)
  - [ ] Implement secure key persistence on first run
  - [ ] Add key retrieval and validation functions
  - [ ] Ensure keys are never logged or exposed in memory dumps
  - [ ] Implement key rotation for security

- [ ] Add comprehensive unit tests
  - [ ] Create key_manager_test.cc with comprehensive test coverage
  - [ ] Test key generation, signing, and verification cycles
  - [ ] Add mock implementations for testing without real crypto
  - [ ] Test error conditions and edge cases
  - [ ] Achieve 80%+ test coverage for crypto components

## Dev Notes

- Relevant architecture patterns and constraints
  - Follow Chromium's cryptographic standards and patterns
  - Use BoringSSL's high-level EVP interfaces for portability
  - Ensure thread-safety for key operations
  - Implement proper key lifecycle management

- Source tree components to touch
  - src/toubkal/components/privacy/crypto/ (new directory)
  - src/toubkal/components/privacy/audit/audit_logger.* (update)
  - BUILD.gn files for crypto components
  - DEPS file for BoringSSL dependency

- Testing standards summary
  - Unit tests for all crypto operations (80%+ coverage required)
  - Mock crypto for integration testing
  - FIPS compliance validation
  - Memory safety verification

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Follows src/toubkal/components/privacy/ pattern
  - Uses snake_case for C++ files per Chromium standards
  - Proper BUILD.gn integration

- Detected conflicts or variances (with rationale)
  - None expected - this is foundation crypto layer

### References

- [Source: docs/PRODUCT-ROADMAP.md#Phase-0-5-Real-Privacy-Implementation]
- [Source: docs/PRIVACY-ETHICS-POLICY.md#Cryptographic-Auditability]
- [Source: CODING-RULES.md#Chromium-C++-Rules]
- [Source: docs/architecture/audit-trail-architecture.md]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-18 | Initial story creation | BMAD Agent |
| 2025-10-18 | Enhanced with dependencies and metadata | BMAD Agent |

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
