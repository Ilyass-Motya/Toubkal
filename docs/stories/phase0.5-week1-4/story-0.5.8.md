# Story 0.5.8: Adblock-rust Integration - Wrap in AdBlockingService Class

Status: Ready for Development
Priority: P0 (Foundation)
Estimated Effort: 4 days

## Dependencies

**Required Stories (must complete first):**
- Story 0.5.7: adblock-rust DEPS (provides build system integration for Rust library)

## Story

As a Toubkal Browser developer,
I want to wrap adblock-rust in a C++ AdBlockingService class,
so that the Rust ad blocking engine integrates cleanly with Chromium's network stack.

## Acceptance Criteria

1. AdBlockingService C++ class provides clean API for ad blocking
2. Class integrates with Chromium's network interception points
3. Memory management is safe across Rust/C++ boundaries
4. Performance meets requirements (<5ms per-request latency)
5. Error handling prevents crashes from malformed filters
6. Class follows Chromium coding standards and patterns

## Tasks / Subtasks

- [ ] Design AdBlockingService class interface
  - [ ] Define ShouldBlockRequest(url, resource_type) method
  - [ ] Add filter loading and management methods
  - [ ] Implement proper initialization and cleanup
  - [ ] Add configuration options for blocking aggressiveness

- [ ] Implement Rust/C++ interop layer
  - [ ] Create C bindings for adblock-rust functions
  - [ ] Handle memory ownership across language boundaries
  - [ ] Implement error propagation from Rust to C++
  - [ ] Add thread safety for concurrent requests

- [ ] Integrate with Chromium network stack
  - [ ] Hook into URLRequest interception points
  - [ ] Add early filtering before network requests
  - [ ] Implement caching for repeated URL checks
  - [ ] Add metrics collection for blocking statistics

- [ ] Add filter management functionality
  - [ ] Implement filter list loading from EasyList/uBlock
  - [ ] Add filter compilation and optimization
  - [ ] Support for custom filter rules
  - [ ] Implement filter update mechanisms

- [ ] Performance optimization and safety
  - [ ] Add request result caching (LRU cache)
  - [ ] Implement asynchronous filter updates
  - [ ] Add circuit breakers for performance issues
  - [ ] Memory usage monitoring and limits

- [ ] Comprehensive testing
  - [ ] Unit tests for blocking logic
  - [ ] Integration tests with network requests
  - [ ] Performance benchmarks against known ad sites
  - [ ] Memory safety testing for Rust interop

## Dev Notes

- Relevant architecture patterns and constraints
  - Follow Chromium's service class patterns
  - Ensure thread safety for network interception
  - Implement proper shutdown handling
  - Support for future filter list updates

- Source tree components to touch
  - src/toubkal/components/privacy/ad_blocking/ad_blocking_service.h (new)
  - src/toubkal/components/privacy/ad_blocking/ad_blocking_service.cc (new)
  - Network interception integration points

- Testing standards summary
  - Unit tests for ad blocking logic
  - Network integration tests
  - Performance and memory testing
  - Cross-platform compatibility

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Follows src/toubkal/components/privacy/ pattern

- Detected conflicts or variances (with rationale)
  - Adds Rust interop (justified for performance)

### References

- [Source: docs/PRODUCT-ROADMAP.md#Phase-0-5-Real-Privacy-Implementation]
- [Source: docs/architecture/network-architecture.md]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
