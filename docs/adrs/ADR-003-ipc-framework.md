# ADR-003: IPC Framework (Mojo IPC, Cross-Process Communication)

**Status**: Accepted
**Date**: 2025-10-18
**Deciders**: Ilyass Motya, Engineering Team
**Technical Story**: [Story 1.5: Brand Identity Implementation](../stories/phase1-week1-2/story-004-brand-identity.md)

---

## Context

Toubkal Browser requires robust inter-process communication (IPC) to enable secure, efficient data exchange between its multiple processes: browser process, renderer processes, AI engines, MCP servers, and internal UI components. As a privacy-first browser with AI capabilities, Toubkal demands IPC that guarantees data integrity, prevents unauthorized access, and maintains performance while handling sensitive operations like consent management, audit logging, and AI inference.

**Problem**: Chromium's multi-process architecture requires secure IPC for features like privacy controls, AI operations, and MCP server communication. Traditional IPC mechanisms lack the type safety, security boundaries, and performance characteristics needed for Toubkal's privacy-critical operations.

**Requirements**:
- Type-safe IPC with compile-time interface validation
- Secure cross-process communication with origin verification
- High-performance data transfer for AI operations and streaming
- Cryptographic integrity for sensitive IPC operations
- Extensible interface definitions for future AI and MCP features
- Integration with Chromium's security model and process isolation

**Constraints**:
- Must integrate with Chromium's Mojo IPC framework
- Cannot break existing Chromium IPC patterns
- Performance critical: <100ms latency for typical operations
- Security critical: Zero data leakage between processes
- Cross-platform compatibility across Windows, macOS, Linux

---

## Decision Drivers

- **Security** (Critical) - Prevent data exfiltration and unauthorized process communication
- **Type Safety** (High) - Compile-time validation prevents runtime IPC errors
- **Performance** (High) - Low-latency communication for AI streaming and real-time features
- **Maintainability** (High) - Clear interface definitions and automatic code generation
- **Extensibility** (Medium) - Support for future AI engines and MCP server types
- **Chromium Compatibility** (Medium) - Seamless integration with existing Chromium infrastructure

---

## Considered Options

### Summary Table

| Option | Security | Type Safety | Performance | Maintainability | Extensibility | Verdict |
|--------|----------|-------------|-------------|-----------------|---------------|---------|
| Option 1: Mojo IPC + .mojom IDL | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ **Chosen** |
| Option 2: Custom IPC Protocol | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ❌ Rejected |
| Option 3: Chromium Extensions API | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ Rejected |
| Option 4: Shared Memory + Mutexes | ⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | ❌ Rejected |

---

### Option 1: Mojo IPC + .mojom Interface Definition Language

**Description**: Adopt Chromium's Mojo IPC framework with .mojom interface definition language for type-safe, secure cross-process communication, enhanced with Toubkal-specific security features and performance optimizations.

**Pros**:
- ✅ **Maximum Security**: Built-in Chromium security with message validation and origin checking
- ✅ **Type Safety**: .mojom IDL provides compile-time interface validation across languages
- ✅ **High Performance**: Optimized for Chromium's multi-process architecture (<100μs typical latency)
- ✅ **Maintainability**: Automatic code generation from interface definitions
- ✅ **Extensibility**: Easy addition of new interfaces for AI engines and MCP servers
- ✅ **Chromium Native**: Seamless integration with existing browser infrastructure
- ✅ **Cross-Language**: Supports C++, JavaScript/TypeScript bindings for UI integration
- ✅ **Security Boundaries**: Process isolation with cryptographic message verification

**Cons**:
- ❌ **Learning Curve**: .mojom syntax and Mojo concepts require training
- ❌ **Build Complexity**: Interface compilation adds build steps
- ❌ **Debugging**: IPC debugging more complex than single-process communication

**Verdict**: ✅ **Chosen** - Only option providing Chromium-native IPC with required security and performance

---

### Option 2: Custom IPC Protocol

**Description**: Implement custom IPC protocol with sockets or shared memory for inter-process communication.

**Pros**:
- ✅ **Full Control**: Complete customization of protocol and security
- ✅ **High Performance**: Potential for optimized data transfer
- ✅ **Flexibility**: Design protocol specifically for Toubkal's needs

**Cons**:
- ❌ **Security Risks**: Custom protocol may have undiscovered vulnerabilities
- ❌ **Type Safety**: Manual serialization/deserialization prone to errors
- ❌ **Maintenance Burden**: Ongoing security auditing and maintenance
- ❌ **Integration Issues**: Difficult integration with Chromium's process model
- ❌ **Testing Complexity**: Comprehensive testing required for all edge cases

**Verdict**: ❌ **Rejected** - Security and maintenance risks outweigh performance benefits

---

### Option 3: Chromium Extensions API

**Description**: Use Chromium's extension messaging API for cross-process communication.

**Pros**:
- ✅ **Easy Implementation**: Leverage existing extension infrastructure
- ✅ **Familiar API**: Well-documented extension messaging patterns
- ✅ **User Permissions**: Built-in permission model

**Cons**:
- ❌ **Performance Issues**: Extension messaging adds significant latency overhead
- ❌ **Security Gaps**: Extension APIs may bypass browser security boundaries
- ❌ **Limited Types**: Restricted data types and message sizes
- ❌ **Extension Dependency**: Requires extension infrastructure for core features
- ❌ **Scalability Issues**: Not designed for high-frequency AI and MCP communication

**Verdict**: ❌ **Rejected** - Performance and security limitations unsuitable for core IPC needs

---

### Option 4: Shared Memory + Mutexes

**Description**: Use shared memory segments with mutexes for direct process communication.

**Pros**:
- ✅ **Maximum Performance**: Direct memory access eliminates serialization overhead
- ✅ **Low Latency**: Minimal communication delays

**Cons**:
- ❌ **Security Nightmare**: Shared memory vulnerable to data exfiltration and injection
- ❌ **Race Conditions**: Complex synchronization prone to deadlocks and corruption
- ❌ **Platform Complexity**: Different implementations needed for Windows, macOS, Linux
- ❌ **Debugging Hell**: Difficult to trace and debug memory corruption issues
- ❌ **Type Safety**: No compile-time validation of data structures
- ❌ **Process Isolation**: Breaks Chromium's security model of process isolation

**Verdict**: ❌ **Rejected** - Fundamental security violations make this unsuitable

---

## Decision Outcome

**Chosen Option**: **Option 1 - Mojo IPC + .mojom Interface Definition Language**

**Rationale**:
1. **Chromium Native Security**: Mojo IPC is battle-tested in Chromium's multi-process architecture
2. **Type Safety Critical**: .mojom IDL prevents runtime IPC errors in privacy-critical operations
3. **Performance Requirements**: Mojo's optimization for Chromium (<100μs latency) supports AI streaming
4. **Maintainability**: Automatic code generation reduces manual IPC implementation errors
5. **Extensibility**: Easy addition of new interfaces for future AI engines and MCP servers
6. **Privacy-First**: Cryptographic message verification supports Toubkal's security requirements
7. **Future-Proof**: Mojo IPC evolves with Chromium, ensuring long-term compatibility

---

## Consequences

### Positive Consequences
- ✅ **Security Foundation**: Type-safe IPC prevents data exfiltration and injection attacks
- ✅ **Performance Excellence**: Optimized for high-frequency AI and MCP operations
- ✅ **Maintainability**: Automatic code generation from .mojom definitions
- ✅ **Extensibility**: Easy addition of new interfaces for future features
- ✅ **Cross-Platform**: Consistent IPC behavior across all supported platforms
- ✅ **Integration**: Seamless integration with Chromium's security and process models

### Negative Consequences
- ❌ **Learning Investment**: Team must learn .mojom syntax and Mojo patterns
- ❌ **Build Complexity**: Interface compilation adds build pipeline steps
- ❌ **Debugging Challenges**: IPC issues require specialized debugging techniques

### Neutral Consequences
- 🔹 **Documentation**: Comprehensive IPC documentation essential for new team members
- 🔹 **Tooling**: Custom tools for IPC interface validation and testing
- 🔹 **Code Generation**: Reliance on Mojo code generation tools and processes

### IPC Security Architecture

**Message Validation**:
- All IPC messages validated against .mojom interface definitions
- Cryptographic integrity checking for sensitive operations
- Origin verification for cross-process communication

**Process Isolation**:
- Strict separation between browser, renderer, AI, and MCP processes
- No shared memory or direct data access between processes
- Sandboxed execution environments for untrusted components

**Performance Optimization**:
- Zero-copy message passing where possible
- Asynchronous communication patterns for non-blocking operations
- Connection pooling for frequently used interfaces

---

## Implementation

### Timeline
- **Phase 1, Week 3-4**: Core IPC infrastructure and privacy interfaces
- **Phase 1, Week 5-8**: AI and consent IPC interfaces
- **Phase 1, Week 9-12**: MCP server IPC interfaces and testing
- **Phase 2, Week 1-4**: Performance optimization and monitoring

### File Locations
```
/src/toubkal/mojo/
├── public/
│   ├── ai_platform.mojom          # AI engine interfaces
│   ├── consent.mojom               # Consent management
│   ├── audit.mojom                 # Audit logging
│   ├── mcp.mojom                  # MCP server interfaces
│   └── ui.mojom                   # UI component interfaces
├── interfaces/
│   ├── ai/
│   │   ├── inference.mojom        # AI inference requests
│   │   ├── model_management.mojom # Model loading/management
│   │   └── resource_monitor.mojom # Resource usage monitoring
│   ├── consent/
│   │   ├── consent_manager.mojom  # Consent operations
│   │   ├── consent_store.mojom    # Consent persistence
│   │   └── consent_ui.mojom       # UI integration
│   ├── audit/
│   │   ├── audit_logger.mojom     # Audit logging
│   │   ├── audit_store.mojom      # Audit persistence
│   │   └── audit_export.mojom     # Audit data export
│   ├── mcp/
│   │   ├── mcp_client.mojom       # MCP client interfaces
│   │   ├── mcp_server.mojom      # MCP server management
│   │   └── mcp_transport.mojom    # Transport protocols
│   └── ui/
│       ├── settings.mojom         # Settings management
│       ├── dashboard.mojom        # Dashboard data
│       └── notifications.mojom    # User notifications
├── BUILD.gn                       # Mojo interface compilation
└── tools/
    ├── validate_interfaces.py     # Interface validation
    ├── generate_bindings.py       # Custom binding generation
    └── test_harness.py           # IPC testing framework
```

### Key Classes/Functions

**Mojo Interface Definition** (`consent.mojom`):
```mojo
module toubkal.mojom.consent;

// Consent request structure
struct ConsentRequest {
  string operation_id;
  string operation_type;  // "ai_inference", "mcp_tool", "network_request"
  string description;
  map<string, Value> parameters;
  int64 timestamp;
  string user_id;
};

// Consent decision structure
struct ConsentDecision {
  string consent_id;
  bool approved;
  string signature;  // Ed25519 signature
  map<string, Value> metadata;
  int64 timestamp;
};

// Consent manager interface
interface ConsentManager {
  // Request consent for operation
  RequestConsent(ConsentRequest request) => (bool success, ConsentDecision? decision, string? error);

  // Verify existing consent
  VerifyConsent(string consent_id) => (bool valid, ConsentDecision? decision);

  // Revoke consent
  RevokeConsent(string consent_id) => (bool success, string? error);

  // Get consent history
  GetConsentHistory(string user_id, int32 limit) => (array<ConsentDecision> decisions);

  // Event notifications
  OnConsentRequested(ConsentRequest request);
  OnConsentGranted(ConsentDecision decision);
  OnConsentRevoked(string consent_id);
};
```

**Mojo C++ Implementation** (`consent_manager.mojom.cc`):
```cpp
class ConsentManagerImpl : public mojom::ConsentManager {
 public:
  ConsentManagerImpl(
      std::unique_ptr<ConsentStore> store,
      std::unique_ptr<Ed25519Signer> signer,
      std::unique_ptr<AuditLogger> auditor)
      : store_(std::move(store)),
        signer_(std::move(signer)),
        auditor_(std::move(auditor)) {}

  void RequestConsent(
      mojom::ConsentRequestPtr request,
      RequestConsentCallback callback) override {
    // Validate request
    if (!ValidateConsentRequest(*request)) {
      std::move(callback).Run(false, nullptr, "Invalid consent request");
      return;
    }

    // Check existing consent
    auto existing_decision = store_->GetDecision(request->operation_id);
    if (existing_decision && IsDecisionValid(*existing_decision)) {
      std::move(callback).Run(true, std::move(existing_decision), nullptr);
      return;
    }

    // Create new consent request
    auto decision = CreateConsentDecision(*request);
    store_->StoreDecision(*decision);

    // Audit the consent operation
    auditor_->LogConsentEvent(*request, *decision);

    std::move(callback).Run(true, std::move(decision), nullptr);
  }

 private:
  bool ValidateConsentRequest(const mojom::ConsentRequest& request) {
    // Validate required fields
    if (request.operation_id.empty() || request.operation_type.empty()) {
      return false;
    }

    // Validate timestamp (within reasonable range)
    auto now = base::Time::Now();
    auto request_time = base::Time::FromMillisecondsSinceUnixEpoch(request.timestamp);
    auto time_diff = std::abs((now - request_time).InMinutes());

    return time_diff < 5;  // 5 minute tolerance
  }

  mojom::ConsentDecisionPtr CreateConsentDecision(const mojom::ConsentRequest& request) {
    auto decision = mojom::ConsentDecision::New();
    decision->consent_id = base::GenerateGUID();
    decision->approved = true;  // Auto-approve for demo (would be user decision)
    decision->signature = signer_->SignConsent(*decision);
    decision->timestamp = base::Time::Now().ToJavaScriptTime();
    return decision;
  }

  std::unique_ptr<ConsentStore> store_;
  std::unique_ptr<Ed25519Signer> signer_;
  std::unique_ptr<AuditLogger> auditor_;
};
```

**JavaScript/TypeScript Bindings** (`consent_manager.js`):
```javascript
// Auto-generated from consent.mojom
class ConsentManager {
  constructor(port) {
    this.port_ = port;
  }

  async requestConsent(request) {
    return new Promise((resolve, reject) => {
      const message = {
        type: 'ConsentManager.RequestConsent',
        request: request
      };

      this.port_.postMessage(message);

      this.port_.onMessage.addListener((response) => {
        if (response.type === 'ConsentManager.RequestConsent_Response') {
          if (response.success) {
            resolve(response.decision);
          } else {
            reject(new Error(response.error));
          }
        }
      });
    });
  }

  // Other methods...
}
```

**Mojo Connection Setup** (`ipc_connection_manager.cc`):
```cpp
class IPCConnectionManager {
 public:
  IPCConnectionManager() = default;

  void Initialize() {
    // Set up Mojo connections to various services
    InitializeConsentConnection();
    InitializeAIConnection();
    InitializeMCPConnection();
    InitializeAuditConnection();
  }

  mojo::Remote<mojom::ConsentManager>& GetConsentManager() {
    return consent_manager_;
  }

  mojo::Remote<mojom::AIPlatform>& GetAIPlatform() {
    return ai_platform_;
  }

  mojo::Remote<mojom::MCPClient>& GetMCPClient() {
    return mcp_client_;
  }

 private:
  void InitializeConsentConnection() {
    // Connect to consent service in browser process
    mojo::ScopedMessagePipeHandle pipe = CreateConsentServicePipe();
    consent_manager_.Bind(mojo::PendingRemote<mojom::ConsentManager>(
        std::move(pipe), 0));
  }

  void InitializeAIConnection() {
    // Connect to AI service
    mojo::ScopedMessagePipeHandle pipe = CreateAIServicePipe();
    ai_platform_.Bind(mojo::PendingRemote<mojom::AIPlatform>(
        std::move(pipe), 0));
  }

  // Other connection setup methods...

  mojo::Remote<mojom::ConsentManager> consent_manager_;
  mojo::Remote<mojom::AIPlatform> ai_platform_;
  mojo::Remote<mojom::MCPClient> mcp_client_;
  mojo::Remote<mojom::AuditLogger> audit_logger_;
};
```

### Dependencies
- **Mojo Framework**: Chromium's IPC framework (core dependency)
- **.mojom Compiler**: Interface definition compiler (build-time tool)
- **Chromium Base**: Core utilities and threading (base::, mojo:: namespaces)
- **Ed25519**: Cryptographic signing for secure operations
- **Protocol Buffers**: Message serialization (used by Mojo internally)

---

## Validation

### How to Verify This Decision

**Manual Tests**:
1. IPC interface compilation: Verify .mojom files generate correct C++/JS bindings
2. Cross-process communication: Test consent requests between renderer and browser processes
3. AI inference IPC: Verify AI requests/responses pass correctly through Mojo
4. MCP server IPC: Test MCP tool invocations via Mojo interfaces
5. Security validation: Attempt unauthorized IPC access (should be rejected)

**Automated Tests**:
```cpp
// IPC interface validation test
TEST_F(IPCValidationTest, ConsentInterfaceCompiles) {
  // Verify .mojom interface compiles without errors
  EXPECT_TRUE(CompileMojoInterface("consent.mojom"));
  EXPECT_TRUE(GenerateBindings("consent.mojom"));
}

// Cross-process communication test
TEST_F(IPCTest, ConsentRequestResponse) {
  IPCConnectionManager manager;
  manager.Initialize();

  // Create test consent request
  auto request = mojom::ConsentRequest::New();
  request->operation_id = "test_operation";
  request->operation_type = "ai_inference";
  request->description = "Test AI inference request";
  request->timestamp = base::Time::Now().ToJavaScriptTime();

  // Send request and verify response
  bool callback_called = false;
  manager.GetConsentManager()->RequestConsent(
      std::move(request),
      base::BindOnce([](bool success, mojom::ConsentDecisionPtr decision, const std::string& error) {
        EXPECT_TRUE(success);
        EXPECT_TRUE(decision);
        EXPECT_FALSE(error.empty());
        callback_called = true;
      }));

  // Wait for async response
  base::RunLoop run_loop;
  run_loop.RunUntilIdle();
  EXPECT_TRUE(callback_called);
}

// Performance benchmark test
TEST_F(IPCPerformanceTest, LatencyBenchmark) {
  IPCConnectionManager manager;
  manager.Initialize();

  const int kNumRequests = 1000;
  std::vector<base::TimeTicks> latencies;

  for (int i = 0; i < kNumRequests; ++i) {
    auto start_time = base::TimeTicks::Now();

    // Send IPC request
    manager.GetConsentManager()->IsProtectionEnabled(
        base::BindOnce([start_time, &latencies](bool enabled) {
          auto latency = base::TimeTicks::Now() - start_time;
          latencies.push_back(latency);
        }));
  }

  // Wait for all responses
  base::RunLoop run_loop;
  run_loop.RunUntilIdle();

  // Calculate statistics
  double avg_latency = 0;
  for (const auto& latency : latencies) {
    avg_latency += latency.InMicroseconds();
  }
  avg_latency /= latencies.size();

  // Assert performance requirements (<100μs average)
  EXPECT_LT(avg_latency, 100.0);
}
```

**Integration Tests**:
```typescript
// End-to-end IPC integration test
describe('IPC Integration Tests', () => {
  it('should handle consent request from UI to backend', async () => {
    // Simulate UI consent request
    const consentRequest = {
      operationId: 'ui_consent_test',
      operationType: 'settings_change',
      description: 'Test privacy settings change',
      timestamp: Date.now()
    };

    // Send request through Mojo IPC
    const response = await ipcClient.requestConsent(consentRequest);

    // Verify response structure
    expect(response.success).toBe(true);
    expect(response.decision).toBeDefined();
    expect(response.decision.consentId).toBeDefined();
    expect(response.decision.signature).toBeDefined();

    // Verify cryptographic signature
    const isValidSignature = await crypto.verifySignature(
      response.decision,
      response.decision.signature
    );
    expect(isValidSignature).toBe(true);
  });

  it('should stream AI responses through IPC', async () => {
    const responses: string[] = [];
    let responseCount = 0;

    // Start streaming AI request
    const stream = ipcClient.streamAIResponse('Explain quantum computing');

    stream.on('data', (chunk: string) => {
      responses.push(chunk);
      responseCount++;
    });

    stream.on('end', () => {
      // Verify streaming worked
      expect(responses.length).toBeGreaterThan(0);
      expect(responseCount).toBeGreaterThan(1); // Multiple chunks received

      const fullResponse = responses.join('');
      expect(fullResponse).toContain('quantum');
    });

    // Wait for stream to complete
    await new Promise(resolve => stream.on('end', resolve));
  });
});
```

**Performance Tests**:
```bash
# IPC latency benchmark
./tools/ipc_benchmark --interface consent --requests 10000
# Expected: <100μs average latency

# Memory usage validation
valgrind --tool=massif ./toubkal --test-ipc-memory
# Expected: <50MB additional memory for IPC infrastructure

# Connection scaling test
./tools/ipc_scaling_test --connections 100 --duration 60
# Expected: Handles 100+ concurrent connections without issues
```

**Metrics**:
- **IPC Latency**: <100μs for simple operations, <500μs for complex operations
- **Throughput**: 10,000+ IPC calls per second for lightweight operations
- **Memory Overhead**: <50MB additional memory for IPC infrastructure
- **Connection Scaling**: Support for 100+ concurrent IPC connections
- **Error Rate**: <0.01% IPC communication failures
- **Security Validation**: 100% of IPC messages validated and authenticated
- **Type Safety**: 0 runtime type errors in IPC communication

---

## Related ADRs

- [ADR-004: AI Integration](ADR-004-ai-integration.md) - IPC enables browser ↔ AI engine communication
- [ADR-007: UI Security](ADR-007-ui-security.md) - IPC security for internal page communication
- [ADR-006: Supply Chain Security](ADR-006-supply-chain.md) - IPC integrity verification

---

## Related Epics

This ADR is implemented by the following epics:

- **[Epic 1.2: Brand Identity & Internal Pages](../epics/epic-1.2-brand-identity.md)** (Week 5-6)
  - Implements Mojo IPC for `toubkal://audit` and `toubkal://consent` dashboards
  - Defines `.mojom` interfaces for audit log streaming and consent requests
  - Integrates TypeScript bindings for React UI ↔ C++ browser communication

- **[Epic 1.3: Privacy Controls & Consent Fabric](../epics/epic-1.3-privacy-controls.md)** (Week 7-10)
  - Implements Mojo IPC for consent requests and decisions
  - Creates real-time audit log streaming over IPC
  - Defines secure IPC channels for sensitive privacy operations

---

## References

- [PRD: Technical Architecture](../TOUBKAL-PRD.md#technical-architecture-overview)
- [PRD: IPC Framework](../TOUBKAL-PRD.md#ipc-framework-requirements)
- [Chromium Mojo Documentation](https://chromium.googlesource.com/chromium/src/+/main/mojo/README.md)
- [Mojo Interface Definition Language](https://chromium.googlesource.com/chromium/src/+/main/mojo/public/tools/bindings/README.md)
- [Chromium IPC Security](https://www.chromium.org/Home/chromium-security/chromium-security-faq/)
- [Ed25519 Cryptography](https://ed25519.cr.yp.to/)

---

## Changelog

| Date       | Change          | Author       |
| ---------- | --------------- | ------------ |
| 2025-10-18 | Initial version | Ilyass Motya |

***
