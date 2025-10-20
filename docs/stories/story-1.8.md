# Story 1.8: Diagnostics & Scalability Infrastructure

Status: ContextReadyDraft

## Story

As a developer and operations engineer,
I want comprehensive diagnostics, logging, and scalability infrastructure built into Toubkal Browser,
so that I can troubleshoot issues effectively, monitor performance, and ensure the browser scales as features are added.

## Context

**Current State:**
- No centralized logging system
- No performance monitoring infrastructure
- No structured error tracking
- No diagnostic utilities for debugging
- No scalability patterns for resource-intensive features (AI inference, MCP servers)
- Limited observability into browser internals

**Desired State:**
- Comprehensive logging system with structured logs
- Performance monitoring for critical paths (AI inference, network requests, rendering)
- Error tracking with context and stack traces
- Debug utilities for development and troubleshooting
- Scalability patterns for resource management
- Observable and debuggable browser internals

**Problem Statement:**
Without proper diagnostics and scalability infrastructure:
- Debugging production issues is difficult
- Performance regressions go unnoticed
- Resource leaks are hard to identify
- AI inference bottlenecks are invisible
- User-reported issues lack context
- Scaling challenges emerge too late

**References:**
- Chromium's logging system: `base/logging.h`
- Brave's performance monitoring patterns
- Modern observability best practices (structured logging, metrics, tracing)

## Acceptance Criteria

### 1. Logging Infrastructure
- [ ] Centralized logging system implemented for both C++ and TypeScript
- [ ] Structured logging with log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- [ ] Log context includes timestamps, component names, and correlation IDs
- [ ] Logs can be filtered by component, level, and time range
- [ ] Log output configurable (console, file, structured JSON)
- [ ] Privacy-safe logging (no PII in logs without consent)

### 2. Error Tracking & Reporting
- [ ] Centralized error tracking system
- [ ] Automatic error capture with stack traces
- [ ] Error context includes browser state, user actions, and environment
- [ ] Error reporting respects user consent (telemetry off = no reporting)
- [ ] Error aggregation and deduplication
- [ ] Developer-friendly error dashboard (`toubkal://diagnostics`)

### 3. Performance Monitoring
- [ ] Performance monitoring for critical operations
- [ ] Metrics collection for AI inference (latency, throughput, resource usage)
- [ ] Network request monitoring (timing, success rate, failures)
- [ ] Rendering performance tracking (FPS, paint times)
- [ ] Resource usage monitoring (CPU, memory, GPU)
- [ ] Performance budget alerts for regressions

### 4. Scalability Framework
- [ ] Resource manager for AI inference (queue management, load balancing)
- [ ] Connection pool for MCP servers (limit concurrent connections)
- [ ] Memory management for audit logs (rotation, archival, limits)
- [ ] Background task scheduler with priority queues
- [ ] Resource limit enforcement (prevent browser hang)

### 5. Developer Tools & Utilities
- [ ] Debug panel accessible via `toubkal://diagnostics`
- [ ] Live log viewer with filtering and search
- [ ] Performance profiler with flamegraphs
- [ ] Resource inspector (memory, CPU, network)
- [ ] State inspector for debugging (consent state, privacy settings, etc.)
- [ ] Export diagnostics bundle for bug reports

## Tasks / Subtasks

### Phase 1: Logging Infrastructure (C++ & TypeScript)

- [ ] Design logging architecture
  - [ ] Define log levels and severity (DEBUG, INFO, WARN, ERROR, FATAL)
  - [ ] Design structured log format (JSON, key-value pairs)
  - [ ] Define privacy-safe logging policies
  - [ ] Document logging best practices

- [ ] Implement C++ logging system
  - [ ] Create `src/toubkal/components/diagnostics/logging/` directory
  - [ ] Implement `Logger` class with Chromium `base/logging.h` integration
  - [ ] Add structured logging support (context, tags, correlation IDs)
  - [ ] Implement log output adapters (console, file, JSON)
  - [ ] Create logging macros for convenience (`TOUBKAL_LOG_INFO`, etc.)
  - [ ] Write unit tests for logger

- [ ] Implement TypeScript logging system
  - [ ] Create `src/toubkal/app/core/diagnostics/logger.ts`
  - [ ] Implement structured logging matching C++ format
  - [ ] Add browser console integration with styling
  - [ ] Add file logging via File System Access API (with consent)
  - [ ] Create logging utilities and helpers
  - [ ] Write unit tests for logger

- [ ] Setup log aggregation
  - [ ] Create log storage system (LevelDB for local storage)
  - [ ] Implement log rotation and retention policies
  - [ ] Add log filtering and search capabilities
  - [ ] Create Mojo IPC for C++ ↔ TypeScript log access

### Phase 2: Error Tracking & Reporting

- [ ] Design error tracking architecture
  - [ ] Define error severity levels (recoverable, non-recoverable, fatal)
  - [ ] Design error context capture (stack, state, actions)
  - [ ] Define consent-based error reporting policy
  - [ ] Document error handling patterns

- [ ] Implement C++ error tracking
  - [ ] Create `src/toubkal/components/diagnostics/error-tracking/` directory
  - [ ] Implement `ErrorTracker` class with stack trace capture
  - [ ] Add error context collection (browser state, environment)
  - [ ] Integrate with Chromium crash reporting (if consented)
  - [ ] Create error aggregation and deduplication logic
  - [ ] Write unit tests for error tracker

- [ ] Implement TypeScript error tracking
  - [ ] Create `src/toubkal/app/core/diagnostics/error-tracker.ts`
  - [ ] Implement global error handler (window.onerror, unhandledrejection)
  - [ ] Add React error boundary integration
  - [ ] Capture error context (component stack, user actions)
  - [ ] Add error reporting with consent checks
  - [ ] Write unit tests for error tracker

- [ ] Build error dashboard
  - [ ] Create `toubkal://diagnostics/errors` page
  - [ ] Display recent errors with stack traces
  - [ ] Add error filtering by component, severity, time
  - [ ] Add error export functionality
  - [ ] Implement error search and grouping

### Phase 3: Performance Monitoring

- [ ] Design performance monitoring architecture
  - [ ] Define key performance indicators (KPIs) to track
  - [ ] Design metrics collection system (counters, histograms, gauges)
  - [ ] Define performance budgets for critical operations
  - [ ] Document performance monitoring patterns

- [ ] Implement performance monitoring (C++)
  - [ ] Create `src/toubkal/components/diagnostics/performance/` directory
  - [ ] Implement `PerformanceMonitor` class
  - [ ] Add timing instrumentation for critical paths
  - [ ] Implement AI inference performance tracking
  - [ ] Add network request performance tracking
  - [ ] Create performance metrics aggregation
  - [ ] Write unit tests for performance monitor

- [ ] Implement performance monitoring (TypeScript)
  - [ ] Create `src/toubkal/app/core/diagnostics/performance-monitor.ts`
  - [ ] Integrate with Performance API (PerformanceObserver)
  - [ ] Add React render performance tracking
  - [ ] Implement custom performance marks and measures
  - [ ] Add FPS and paint time monitoring
  - [ ] Write unit tests for performance monitor

- [ ] Build performance dashboard
  - [ ] Create `toubkal://diagnostics/performance` page
  - [ ] Display real-time performance metrics
  - [ ] Add performance timeline visualization
  - [ ] Implement flamegraph for profiling
  - [ ] Add performance export and analysis tools

### Phase 4: Scalability Framework

- [ ] Design resource management architecture
  - [ ] Define resource limits (CPU, memory, GPU, network)
  - [ ] Design resource allocation strategies
  - [ ] Document scalability patterns for AI and MCP

- [ ] Implement AI inference resource manager
  - [ ] Create `src/toubkal/components/ai_platform/resource-manager/` directory
  - [ ] Implement request queue with priority
  - [ ] Add load balancing across inference engines
  - [ ] Implement resource limit enforcement (max concurrent requests)
  - [ ] Add inference performance tracking
  - [ ] Write unit tests for resource manager

- [ ] Implement MCP server connection pool
  - [ ] Create `src/toubkal/components/mcp_integration/connection-pool/` directory
  - [ ] Implement connection pooling and reuse
  - [ ] Add connection limit enforcement (max concurrent connections)
  - [ ] Implement connection health checks and retry logic
  - [ ] Add connection performance tracking
  - [ ] Write unit tests for connection pool

- [ ] Implement audit log management
  - [ ] Create `src/toubkal/components/privacy/audit/log-manager/` directory
  - [ ] Implement log rotation with size and time limits
  - [ ] Add log archival and compression
  - [ ] Implement log cleanup and retention policies
  - [ ] Add log export functionality
  - [ ] Write unit tests for log manager

- [ ] Implement background task scheduler
  - [ ] Create `src/toubkal/components/performance/task-scheduler/` directory
  - [ ] Implement priority queue for background tasks
  - [ ] Add task throttling and rate limiting
  - [ ] Implement idle detection for non-critical tasks
  - [ ] Add task monitoring and cancellation
  - [ ] Write unit tests for task scheduler

### Phase 5: Developer Tools & Diagnostics Dashboard

- [ ] Design diagnostics dashboard
  - [ ] Design UI/UX for `toubkal://diagnostics` page
  - [ ] Define dashboard sections (logs, errors, performance, resources)
  - [ ] Create wireframes and component structure

- [ ] Implement diagnostics dashboard foundation
  - [ ] Create `src/toubkal/app/features/diagnostics-dashboard/` directory
  - [ ] Setup React components for dashboard layout
  - [ ] Create Mojo IPC interfaces for diagnostics data
  - [ ] Implement real-time data streaming

- [ ] Build log viewer
  - [ ] Create log viewer component with filtering
  - [ ] Add log search and highlighting
  - [ ] Implement log level filtering (DEBUG, INFO, WARN, ERROR)
  - [ ] Add log export functionality
  - [ ] Implement live log streaming

- [ ] Build resource inspector
  - [ ] Create resource usage visualizations (CPU, memory, GPU)
  - [ ] Add process list with resource breakdown
  - [ ] Implement memory profiler with heap snapshots
  - [ ] Add network inspector with request timeline
  - [ ] Implement GPU usage monitoring

- [ ] Build state inspector
  - [ ] Create state viewer for debugging
  - [ ] Display consent state and history
  - [ ] Display privacy settings and shields status
  - [ ] Show AI inference queue and MCP connections
  - [ ] Add state export for bug reports

- [ ] Implement diagnostics export
  - [ ] Create diagnostics bundle generator
  - [ ] Include logs, errors, performance data, state
  - [ ] Add privacy filtering (remove PII)
  - [ ] Implement ZIP compression for export
  - [ ] Add upload to support (with consent)

### Phase 6: Testing & Documentation

- [ ] Write comprehensive tests
  - [ ] Unit tests for all logging components
  - [ ] Unit tests for error tracking
  - [ ] Unit tests for performance monitoring
  - [ ] Unit tests for resource managers
  - [ ] Integration tests for diagnostics dashboard
  - [ ] E2E tests for diagnostics workflows

- [ ] Create documentation
  - [ ] Logging guide for developers (`docs/contributing/logging.md`)
  - [ ] Error handling best practices (`docs/contributing/error-handling.md`)
  - [ ] Performance monitoring guide (`docs/contributing/performance.md`)
  - [ ] Scalability patterns documentation (`docs/architecture/scalability.md`)
  - [ ] Diagnostics dashboard user guide (`docs/diagnostics.md`)

- [ ] Setup monitoring alerts
  - [ ] Define performance budget alerts
  - [ ] Configure error rate thresholds
  - [ ] Setup resource usage alerts
  - [ ] Document alert response procedures

## Dev Notes

### Relevant Architecture Patterns and Constraints

- **Privacy-First Logging**: No PII in logs without explicit consent, all diagnostics respect telemetry settings
- **Structured Logging**: Use structured, machine-readable logs (JSON) for better analysis
- **Chromium Integration**: Leverage Chromium's `base/logging.h` and performance APIs
- **Consent-Gated**: All error reporting and diagnostics upload require user consent
- **Zero Telemetry Default**: Diagnostics are local-first, no data sent without opt-in

### Project Structure Components to Create

**New Directories:**
```
src/toubkal/
├── components/
│   ├── diagnostics/                 # C++ diagnostics infrastructure
│   │   ├── logging/                 # Logging system
│   │   │   ├── logger.h
│   │   │   ├── logger.cc
│   │   │   ├── log_sink.h
│   │   │   ├── log_sink.cc
│   │   │   └── BUILD.gn
│   │   ├── error-tracking/          # Error tracking
│   │   │   ├── error_tracker.h
│   │   │   ├── error_tracker.cc
│   │   │   ├── stack_trace.h
│   │   │   ├── stack_trace.cc
│   │   │   └── BUILD.gn
│   │   ├── performance/             # Performance monitoring
│   │   │   ├── performance_monitor.h
│   │   │   ├── performance_monitor.cc
│   │   │   ├── metrics_collector.h
│   │   │   ├── metrics_collector.cc
│   │   │   └── BUILD.gn
│   │   └── BUILD.gn
│   │
│   ├── ai_platform/
│   │   ├── resource-manager/        # AI inference resource management
│   │   │   ├── inference_queue.h
│   │   │   ├── inference_queue.cc
│   │   │   ├── load_balancer.h
│   │   │   ├── load_balancer.cc
│   │   │   └── BUILD.gn
│   │
│   ├── mcp_integration/
│   │   ├── connection-pool/         # MCP connection pooling
│   │   │   ├── connection_pool.h
│   │   │   ├── connection_pool.cc
│   │   │   └── BUILD.gn
│   │
│   ├── privacy/audit/
│   │   ├── log-manager/             # Audit log management
│   │   │   ├── log_manager.h
│   │   │   ├── log_manager.cc
│   │   │   ├── log_rotation.h
│   │   │   ├── log_rotation.cc
│   │   │   └── BUILD.gn
│   │
│   └── performance/
│       ├── task-scheduler/          # Background task scheduling
│       │   ├── task_scheduler.h
│       │   ├── task_scheduler.cc
│       │   ├── priority_queue.h
│       │   ├── priority_queue.cc
│       │   └── BUILD.gn
│
└── app/
    ├── core/
    │   ├── diagnostics/             # TypeScript diagnostics
    │   │   ├── logger.ts
    │   │   ├── error-tracker.ts
    │   │   ├── performance-monitor.ts
    │   │   └── debug-utils.ts
    │
    └── features/
        └── diagnostics-dashboard/   # Diagnostics UI
            ├── components/
            │   ├── DiagnosticsDashboard.tsx
            │   ├── LogViewer.tsx
            │   ├── ErrorList.tsx
            │   ├── PerformancePanel.tsx
            │   ├── ResourceInspector.tsx
            │   └── StateInspector.tsx
            ├── hooks/
            │   ├── use-logs.ts
            │   ├── use-errors.ts
            │   └── use-performance-metrics.ts
            ├── services/
            │   └── diagnostics-api.ts
            └── index.ts
```

### Logging Best Practices

**Log Levels:**
- **DEBUG**: Detailed information for debugging (only in debug builds)
- **INFO**: General informational messages (startup, shutdown, state changes)
- **WARN**: Warning messages (recoverable errors, deprecated usage)
- **ERROR**: Error messages (operation failed but browser continues)
- **FATAL**: Fatal errors (browser must terminate)

**Structured Logging Example (C++):**
```cpp
TOUBKAL_LOG_INFO("ai_inference",
  {{"model", "llama-3.2"},
   {"latency_ms", 245},
   {"tokens", 150}});
```

**Structured Logging Example (TypeScript):**
```typescript
logger.info('ai_inference', {
  model: 'llama-3.2',
  latency_ms: 245,
  tokens: 150
});
```

**Privacy-Safe Logging:**
- Never log URLs, user input, or search queries without anonymization
- Use correlation IDs instead of user identifiers
- Redact sensitive data automatically
- Document what data is logged

### Performance Monitoring Patterns

**Key Metrics to Track:**
- AI Inference: Latency (p50, p95, p99), throughput, queue depth
- MCP Calls: Latency, success rate, error rate
- Network: Request latency, bandwidth, connection count
- Rendering: FPS, paint times, layout shifts
- Memory: Heap size, allocation rate, garbage collection pauses

**Performance Budget Example:**
```yaml
performance_budgets:
  ai_inference_latency_p95: 500ms
  mcp_call_latency_p95: 100ms
  page_load_time: 2000ms
  first_paint: 500ms
```

### Scalability Patterns

**Resource Manager Pattern:**
- Use priority queues for resource allocation
- Implement backpressure when limits reached
- Add circuit breakers for failing services
- Monitor and alert on resource exhaustion

**Connection Pool Pattern:**
- Pool and reuse expensive connections (MCP servers)
- Implement health checks and automatic reconnection
- Limit concurrent connections to prevent overload
- Add connection timeout and retry logic

**Background Task Scheduler Pattern:**
- Run non-critical tasks during idle time
- Implement priority-based scheduling
- Add task cancellation for low-priority work
- Monitor task queue depth and latency

### Dependencies

**Depends On:**
- Story 1.7: Project Structure Migration (needs clean feature-first structure)
- Story 1.5: Brand Identity Implementation (React WebUI foundation)

**Blocks:**
- Future AI features: Resource management needed for scaling
- Future MCP features: Connection pooling needed for reliability
- Production debugging: Diagnostics infrastructure needed for troubleshooting

### Estimated Effort

**Complexity:** High (new infrastructure, performance-critical code)
**Estimated Time:** 5-7 days
- Day 1: Logging infrastructure (C++ & TypeScript)
- Day 2: Error tracking & reporting
- Day 3: Performance monitoring
- Day 4-5: Scalability framework (resource managers, connection pools)
- Day 6: Diagnostics dashboard UI
- Day 7: Testing, documentation, validation

### Success Metrics

- [ ] All components have structured logging with appropriate levels
- [ ] Error tracking captures 100% of uncaught errors
- [ ] Performance monitoring tracks all critical operations
- [ ] Resource managers prevent browser hang under load
- [ ] Diagnostics dashboard provides actionable insights
- [ ] Zero PII leaks in logs or diagnostics
- [ ] Performance overhead < 1% in production builds
- [ ] Developer productivity improves (faster debugging)

### Security & Privacy Considerations

**Privacy-First Design:**
- All diagnostics are local by default
- No data sent to remote servers without explicit consent
- PII automatically redacted from logs and errors
- User can view and delete all diagnostic data
- Diagnostic exports are anonymized

**Security Considerations:**
- Diagnostics dashboard (`toubkal://diagnostics`) is local-only
- No external network access for diagnostics
- Diagnostic data encrypted at rest (if persisted)
- Access control for sensitive diagnostic features

## Dev Agent Record

### Context Reference

- docs/stories/story-context-1.8.xml (Comprehensive implementation context for Story 1.8)

### Agent Model Used

Claude Sonnet 4 (BMAD SM Agent)

## References

- Chromium Logging: https://chromium.googlesource.com/chromium/src/+/main/base/logging.h
- Brave Performance Monitoring: https://github.com/brave/brave-core/tree/master/components/brave_perf_predictor
- Structured Logging Best Practices: https://www.structlog.org/
- OpenTelemetry (inspiration): https://opentelemetry.io/
- Web Performance APIs: https://developer.mozilla.org/en-US/docs/Web/API/Performance
