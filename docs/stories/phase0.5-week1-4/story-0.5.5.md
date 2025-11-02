# Story 0.5.5: LevelDB Persistence - Replace In-Memory Arrays

Status: Ready for Development
Priority: P0 (Foundation)
Dependencies: Story 0.5.3 (Merkle Tree)
Estimated Effort: 4 days

## Story

As a Toubkal Browser developer,
I want to replace in-memory audit log storage with LevelDB persistence,
so that audit entries survive browser restarts and scale to large datasets.

## Acceptance Criteria

1. LevelDB database replaces in-memory audit entry arrays
2. Schema uses `audit/{timestamp}` → `{entry: {...}, signature: "..."}` format
3. Audit entries persist across browser restarts
4. Memory usage is bounded regardless of audit log size
5. Database operations are thread-safe and performant
6. Migration from in-memory to LevelDB works seamlessly

## Tasks / Subtasks

- [ ] Create AuditStorage LevelDB wrapper class
  - [ ] Create src/toubkal/components/privacy/audit/audit_storage.h
  - [ ] Create src/toubkal/components/privacy/audit/audit_storage.cc
  - [ ] Implement LevelDB connection management
  - [ ] Add proper error handling and connection recovery

- [ ] Implement audit entry storage schema
  - [ ] Design key format: `audit/{timestamp}` (sortable)
  - [ ] Design value format: JSON with entry and signature fields
  - [ ] Add metadata fields (sequence numbers, Merkle proofs)
  - [ ] Implement schema versioning for future migrations

- [ ] Replace in-memory arrays in AuditLogger
  - [ ] Update AuditLogger to use AuditStorage instead of vectors
  - [ ] Implement lazy loading for performance
  - [ ] Add database connection lifecycle management
  - [ ] Maintain backward compatibility during transition

- [ ] Implement database maintenance operations
  - [ ] Add compaction scheduling for LevelDB optimization
  - [ ] Implement corruption detection and recovery
  - [ ] Add database size limits and rotation policies
  - [ ] Implement backup and restore functionality

- [ ] Add database performance optimizations
  - [ ] Implement write batching for multiple entries
  - [ ] Add read caching for frequently accessed entries
  - [ ] Implement asynchronous writes for UI responsiveness
  - [ ] Add connection pooling if needed

- [ ] Comprehensive testing and migration
  - [ ] Test data migration from memory to LevelDB
  - [ ] Performance testing with large datasets (100K+ entries)
  - [ ] Test database corruption scenarios and recovery
  - [ ] Memory usage validation (should be bounded)

## Dev Notes

- Relevant architecture patterns and constraints
  - LevelDB provides ACID guarantees for audit integrity
  - Database operations should be asynchronous to avoid UI blocking
  - Implement proper shutdown handling to ensure data durability
  - Support for database encryption in future phases

- Source tree components to touch
  - src/toubkal/components/privacy/audit/audit_storage.h (new)
  - src/toubkal/components/privacy/audit/audit_storage.cc (new)
  - src/toubkal/components/privacy/audit/audit_logger.h (update)
  - src/toubkal/components/privacy/audit/audit_logger.cc (update)
  - BUILD.gn files for LevelDB integration

- Testing standards summary
  - Unit tests for database operations
  - Integration tests for data persistence
  - Performance tests for large datasets
  - Durability tests (simulated crashes)

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Follows src/toubkal/components/privacy/audit/ pattern
  - Uses snake_case for C++ files per Chromium standards
  - Proper BUILD.gn integration

- Detected conflicts or variances (with rationale)
  - Adds LevelDB dependency (standard Chromium component)

### References

- [Source: docs/PRODUCT-ROADMAP.md#Phase-0-5-Real-Privacy-Implementation]
- [Source: docs/PRIVACY-ETHICS-POLICY.md#Cryptographic-Auditability]
- [Source: docs/architecture/audit-trail-architecture.md]
- [Source: CODING-RULES.md#Chromium-C++-Rules]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
