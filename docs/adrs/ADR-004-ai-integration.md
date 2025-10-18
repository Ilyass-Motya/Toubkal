# ADR-004: AI Integration (Multi-Engine Architecture, MCP, BYOM)

**Status**: Accepted
**Date**: 2025-10-18
**Deciders**: Ilyass Motya, Engineering Team
**Technical Story**: [Story 1.5: Brand Identity Implementation](../stories/phase1-week1-2/story-004-brand-identity.md)

---

## Context

Toubkal Browser requires a revolutionary AI integration that transforms the browser from a passive content viewer into an **AI-augmented workspace**. Unlike traditional browser AI features, Toubkal must deliver privacy-first intelligence with mathematically provable data protection, multi-engine inference support, and native MCP (Model Context Protocol) capabilities.

**Problem**: Existing browsers either lack AI integration entirely or compromise user privacy by sending data to cloud providers. Toubkal needs to pioneer the first browser with **native MCP support** while maintaining zero-telemetry-by-default principles.

**Requirements**:
- Multi-engine AI architecture supporting local and cloud inference
- Native MCP client with stdio, HTTP+SSE, and SHTTP transports
- BYOM (Bring Your Own Model) with drag-and-drop model import
- Privacy-first AI with cryptographic consent and audit trails
- Real-time resource monitoring and performance optimization
- AI model supply chain security and verification

**Constraints**:
- Must maintain zero-telemetry-by-default principle
- Every AI operation requires explicit user consent
- Performance critical: <2s local inference latency target
- Resource constrained: models must run efficiently on consumer hardware
- Cross-platform compatibility: Windows, macOS, Linux support

---

## Decision Drivers

- **Privacy** (Critical) - Zero unsanctioned data egress with cryptographic proof
- **Performance** (High) - Fast, responsive AI interactions (<2s latency)
- **Ecosystem** (High) - Support for diverse AI models and tools
- **User Experience** (High) - Seamless AI integration without workflow disruption
- **Extensibility** (Medium) - MCP ecosystem for third-party AI tools
- **Security** (Medium) - Supply chain security for AI models and tools

---

## Considered Options

### Summary Table

| Option | Privacy | Performance | Ecosystem | User Experience | Extensibility | Verdict |
|--------|----------|-------------|-----------|-----------------|---------------|---------|
| Option 1: Native MCP + Multi-Engine AI | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ **Chosen** |
| Option 2: Browser Extension AI | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ❌ Rejected |
| Option 3: Cloud-Only AI | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ Rejected |
| Option 4: Single Engine AI | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ❌ Rejected |

---

### Option 1: Native MCP + Multi-Engine AI (Toubkal's Approach)

**Description**: Implement comprehensive AI integration with native MCP client, multi-engine inference support (Ollama, Transformers.js, WebLLM, LlamaCpp, ONNX Runtime), BYOM capabilities, and privacy-first architecture with cryptographic consent.

**Pros**:
- ✅ **Maximum Privacy**: Local-first AI with consent-gated cloud fallback
- ✅ **Best Performance**: Multi-engine optimization for hardware capabilities
- ✅ **Largest Ecosystem**: MCP enables unlimited AI tool integrations
- ✅ **Superior UX**: Seamless AI integration without browser extension friction
- ✅ **Future-Proof**: MCP standard ensures long-term compatibility
- ✅ **Mathematical Trust**: Cryptographic audit trails for all AI operations
- ✅ **Hardware Optimized**: Adaptive inference based on available resources

**Cons**:
- ❌ **Implementation Complexity**: Multiple inference engines and MCP protocol
- ❌ **Resource Management**: Complex memory/CPU/GPU resource allocation
- ❌ **Model Management**: BYOM requires sophisticated model lifecycle management

**Verdict**: ✅ **Chosen** - Only option that delivers Toubkal's vision of privacy-first, AI-augmented browsing

---

### Option 2: Browser Extension AI

**Description**: Implement AI features through browser extensions with limited native integration.

**Pros**:
- ✅ **Easier Implementation**: Leverage existing extension APIs
- ✅ **User Choice**: Users can choose AI extensions independently
- ✅ **Faster MVP**: Shorter development timeline

**Cons**:
- ❌ **Privacy Gaps**: Extensions may bypass browser privacy controls
- ❌ **Performance Overhead**: Extension-to-browser communication latency
- ❌ **Fragmented Experience**: Different extensions provide inconsistent UX
- ❌ **Limited Integration**: Cannot access browser internals deeply
- ❌ **Extension Dependencies**: Users must manage extension lifecycle

**Verdict**: ❌ **Rejected** - Insufficient privacy guarantees and integration depth

---

### Option 3: Cloud-Only AI

**Description**: All AI operations processed through cloud providers with user consent.

**Pros**:
- ✅ **Best Performance**: Unlimited cloud resources for inference
- ✅ **Latest Models**: Access to cutting-edge AI models instantly
- ✅ **Maintenance Free**: No local model management required
- ✅ **Global Scale**: Consistent performance worldwide

**Cons**:
- ❌ **Zero Privacy**: All data sent to third-party cloud providers
- ❌ **Cost Barrier**: Ongoing API costs for users
- ❌ **Offline Incapable**: No functionality without internet connection
- ❌ **Provider Lock-in**: Dependent on specific cloud AI providers
- ❌ **Trust Erosion**: Cannot prove privacy claims mathematically

**Verdict**: ❌ **Rejected** - Fundamentally incompatible with Toubkal's privacy-first vision

---

### Option 4: Single Engine AI

**Description**: Support only one AI inference engine (e.g., only Ollama or only Transformers.js).

**Pros**:
- ✅ **Simpler Implementation**: Single codebase for inference
- ✅ **Consistent Performance**: Optimized for one engine's characteristics
- ✅ **Smaller Bundle**: Less code to maintain and distribute

**Cons**:
- ❌ **Limited Flexibility**: Cannot adapt to different hardware capabilities
- ❌ **User Lock-in**: Users stuck with one inference approach
- ❌ **Performance Issues**: Suboptimal for users with different hardware
- ❌ **Ecosystem Fragmentation**: Cannot leverage different model ecosystems
- ❌ **Future Limitations**: Cannot adopt better inference engines

**Verdict**: ❌ **Rejected** - Too restrictive for Toubkal's diverse user base and hardware ecosystem

---

## Decision Outcome

**Chosen Option**: **Option 1 - Native MCP + Multi-Engine AI**

**Rationale**:
1. **Privacy-First Imperative**: Only native integration can guarantee zero unsanctioned data egress
2. **AI Revolution**: MCP represents the future of AI tool interoperability - Toubkal will be the first browser with native MCP
3. **Performance Requirements**: Multi-engine architecture optimizes for diverse hardware (laptops to workstations)
4. **User Sovereignty**: BYOM empowers users to choose their own AI models without vendor lock-in
5. **Ecosystem Leadership**: MCP integration creates a platform for third-party AI tools
6. **Mathematical Trust**: Cryptographic consent and audit trails provide provable privacy
7. **Market Differentiation**: No other browser offers this level of AI integration with privacy guarantees

---

## Consequences

### Positive Consequences
- ✅ **Privacy Leadership**: First browser with mathematically provable AI privacy
- ✅ **AI Ecosystem**: MCP platform enables unlimited AI tool integrations
- ✅ **Performance Excellence**: Adaptive inference optimizes for user hardware
- ✅ **User Empowerment**: BYOM gives users complete AI model control
- ✅ **Future-Proof**: MCP standard ensures long-term AI tool compatibility
- ✅ **Trust Building**: Cryptographic audit trails enable independent verification

### Negative Consequences
- ❌ **Implementation Complexity**: Multiple inference engines require sophisticated orchestration
- ❌ **Resource Management**: Complex memory/CPU/GPU allocation across engines
- ❌ **Testing Overhead**: Each engine + MCP combination requires validation
- ❌ **Model Management**: BYOM requires robust model lifecycle and storage management

### Neutral Consequences
- 🔹 **Documentation Requirements**: Comprehensive AI integration documentation essential
- 🔹 **User Education**: Users need guidance on AI privacy and model management
- 🔹 **Performance Monitoring**: Continuous optimization of inference performance required

### AI Architecture Principles

**Local-First Inference**:
- Primary inference engines run entirely on-device
- Cloud fallback requires explicit per-request consent
- All data processing occurs within browser security boundary

**Cryptographic Consent**:
- Every AI operation requires explicit user approval
- Consent decisions are Ed25519-signed and stored immutably
- Audit trails enable forensic analysis of AI operations

**Multi-Engine Orchestration**:
- Automatic engine selection based on hardware capabilities
- Seamless switching between engines without user intervention
- Resource monitoring prevents system resource exhaustion

---

## Implementation

### Timeline
- **Phase 1, Week 9-12**: Multi-engine AI infrastructure and Ollama integration
- **Phase 2, Week 1-4**: MCP client implementation and native MCP servers
- **Phase 2, Week 1-4**: BYOM capabilities and model management UI
- **Phase 2, Week 5-8**: AI model supply chain security integration

### File Locations
```
/src/toubkal/ai/
├── core/
│   ├── inference_engine.h
│   ├── inference_engine.cc
│   ├── engine_manager.h
│   ├── engine_manager.cc
│   └── resource_monitor.h
├── engines/
│   ├── ollama_engine.h
│   ├── ollama_engine.cc
│   ├── transformers_engine.h
│   ├── transformers_engine.cc
│   ├── webllm_engine.h
│   ├── webllm_engine.cc
│   ├── llamacpp_engine.h
│   ├── llamacpp_engine.cc
│   └── onnx_engine.h
├── mcp/
│   ├── mcp_client.h
│   ├── mcp_client.cc
│   ├── mcp_server.h
│   ├── mcp_server.cc
│   ├── native_servers/
│   │   ├── browser_tools_server.h
│   │   ├── browser_tools_server.cc
│   │   ├── bookmark_server.h
│   │   └── history_server.h
│   └── protocol/
│       ├── json_rpc.h
│       ├── transport_stdio.h
│       ├── transport_http.h
│       └── transport_shttp.h
├── models/
│   ├── model_manager.h
│   ├── model_manager.cc
│   ├── byom_importer.h
│   ├── byom_importer.cc
│   └── model_validator.h
├── privacy/
│   ├── consent_manager.h
│   ├── consent_manager.cc
│   ├── audit_logger.h
│   └── audit_logger.cc
└── BUILD.gn
```

### Key Classes/Functions

**Inference Engine Manager** (`engine_manager.h`):
```cpp
class InferenceEngineManager {
 public:
  // Initialize all available inference engines
  bool Initialize();

  // Select optimal engine for current hardware and model
  InferenceEngine* SelectEngine(const AIModel& model);

  // Execute inference with automatic engine selection
  Result<AIResponse> ExecuteInference(const AIRequest& request);

  // Monitor resource usage across engines
  ResourceUsage GetResourceUsage();

 private:
  std::vector<std::unique_ptr<InferenceEngine>> engines_;
  ResourceMonitor resource_monitor_;
  HardwareDetector hardware_detector_;
};
```

**MCP Client** (`mcp_client.h`):
```cpp
class MCPClient {
 public:
  // Initialize MCP client with supported transports
  bool Initialize();

  // Connect to MCP server
  Result<MCPConnection> Connect(const MCPServerConfig& config);

  // Execute tool with consent verification
  Result<MCPToolResult> ExecuteTool(const std::string& tool_name,
                                   const nlohmann::json& parameters);

  // List available tools from connected servers
  std::vector<MCPTool> ListTools();

 private:
  std::vector<std::unique_ptr<MCPTransport>> transports_;
  ConsentManager* consent_manager_;
  AuditLogger* audit_logger_;
};
```

**BYOM Importer** (`byom_importer.h`):
```cpp
class BYOMImporter {
 public:
  // Import model from file system or URL
  Result<AIModel> ImportModel(const std::string& source_path,
                             ModelFormat format);

  // Validate model integrity and compatibility
  Result<ModelValidation> ValidateModel(const AIModel& model);

  // Convert model to optimal format for target engine
  Result<AIModel> ConvertModel(const AIModel& source_model,
                              InferenceEngine* target_engine);

 private:
  ModelValidator validator_;
  ModelConverter converter_;
  SupplyChainVerifier supply_chain_verifier_;
};
```

**Consent Manager** (`consent_manager.h`):
```cpp
class ConsentManager {
 public:
  // Request consent for AI operation
  Result<ConsentDecision> RequestConsent(const AIRequest& request);

  // Verify consent for operation execution
  bool VerifyConsent(const ConsentToken& token);

  // Log consent decision cryptographically
  bool LogConsentDecision(const ConsentDecision& decision);

  // Export consent history
  Result<std::string> ExportConsentHistory(ExportFormat format);

 private:
  ConsentStore consent_store_;
  Ed25519Signer signer_;
  AuditLogger* audit_logger_;
};
```

### Dependencies
- **Ollama**: Local inference engine (REST API integration)
- **Transformers.js**: Browser-based inference (WebAssembly/WebGPU)
- **WebLLM**: Optimized browser inference engine
- **ONNX Runtime**: Cross-platform model execution
- **Llama.cpp**: Efficient LLM inference library
- **MCP SDK**: Model Context Protocol implementation
- **Ed25519**: Cryptographic signing for consent and audit trails
- **BoringSSL**: Cryptographic primitives for secure communication

---

## Validation

### How to Verify This Decision

**Manual Tests**:
1. Install Ollama → verify automatic detection and model loading
2. Import custom model → verify BYOM workflow and validation
3. Connect MCP server → verify tool discovery and consent prompts
4. Switch inference engines → verify seamless transitions
5. Check audit logs → verify cryptographic signing of AI operations

**Automated Tests**:
```cpp
// Multi-engine inference test
TEST_F(AITest, MultiEngineInference) {
  InferenceEngineManager manager;
  ASSERT_TRUE(manager.Initialize());

  // Test Ollama engine
  AIRequest request("Explain quantum computing", "llama3.2");
  auto result = manager.ExecuteInference(request);
  ASSERT_TRUE(result.success);
  ASSERT_LT(result.data.latency_ms, 2000);  // <2s target

  // Test Transformers.js fallback
  request.engine_preference = "transformers";
  result = manager.ExecuteInference(request);
  ASSERT_TRUE(result.success);
}

// MCP tool execution test
TEST_F(MCPTest, ToolExecutionWithConsent) {
  MCPClient client;
  ASSERT_TRUE(client.Initialize());

  // Mock consent approval
  EXPECT_CALL(mock_consent_manager, RequestConsent(_))
      .WillOnce(Return(ConsentDecision::APPROVED));

  // Execute tool
  auto result = client.ExecuteTool("read_file", {{"path", "/tmp/test.txt"}});
  ASSERT_TRUE(result.success);
  ASSERT_TRUE(result.data.consent_verified);
}

// BYOM import test
TEST_F(BYOMTest, ModelImportAndValidation) {
  BYOMImporter importer;

  // Import GGUF model
  auto result = importer.ImportModel("/path/to/model.gguf", ModelFormat::GGUF);
  ASSERT_TRUE(result.success);

  // Verify model validation
  auto validation = importer.ValidateModel(result.data);
  ASSERT_TRUE(validation.success);
  ASSERT_EQ(validation.data.checksum_verified, true);
}
```

**Integration Tests**:
```typescript
// AI conversation integration test
describe('AI Conversation Flow', () => {
  it('should complete full conversation with consent and audit logging', async () => {
    // Start conversation
    const response = await aiService.sendMessage('Summarize this page');

    // Verify consent was requested
    expect(consentManager.requestConsent).toHaveBeenCalled();

    // Verify audit logging
    expect(auditLogger.logOperation).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'ai_inference',
        consent_signature: expect.any(String)
      })
    );

    // Verify response quality
    expect(response.content).toBeTruthy();
    expect(response.latency).toBeLessThan(2000);
  });
});

// MCP ecosystem integration test
describe('MCP Server Ecosystem', () => {
  it('should discover and execute tools from multiple MCP servers', async () => {
    // Connect to file server
    await mcpClient.connectFileServer();

    // Execute file operations
    const files = await mcpClient.executeTool('list_directory', {path: '/tmp'});

    // Verify consent and logging
    expect(consentManager.verifyConsent).toHaveBeenCalled();
    expect(auditLogger.logMCPOperation).toHaveBeenCalled();
  });
});
```

**Performance Tests**:
```bash
# Inference latency benchmark
time ./ai_benchmark --model llama3.2-3b --prompt "Hello world"
# Expected: <1500ms for local inference

# Resource usage monitoring
./resource_monitor --ai-inference --duration 60
# Expected: <4GB RAM usage, <80% CPU utilization

# MCP tool execution latency
time ./mcp_benchmark --tool file_read --file-size 1MB
# Expected: <500ms end-to-end
```

**Metrics**:
- **Inference Latency**: <2s for local models, <500ms for lightweight models
- **Consent Overhead**: <100ms per consent request
- **MCP Tool Latency**: <500ms for typical operations
- **Model Import Success**: 95%+ success rate for valid model files
- **Resource Usage**: <4GB RAM, <80% CPU during normal operation
- **Audit Trail Coverage**: 100% of AI operations logged with cryptographic signatures
- **Supply Chain Verification**: 100% of imported models verified for integrity

---

## Related ADRs

- [ADR-006: Supply Chain Security](ADR-006-supply-chain.md) - AI model supply chain verification
- [ADR-007: UI Security](ADR-007-ui-security.md) - Secure AI content rendering
- [ADR-003: IPC Framework](ADR-003-ipc-framework.md) - Mojo IPC for browser ↔ AI communication

---

## Related Epics

This ADR will be implemented in Phase 2 (not yet started):

- **Epic 2.1: Multi-Engine AI Infrastructure** (Week 13-16) - *Epic not yet documented*
  - Will implement Ollama, Transformers.js, and WebLLM engines
  - Will create engine selection and fallback logic
  - Will integrate AI inference with browser architecture

- **Epic 2.2: MCP Client Implementation** (Week 13-16) - *Epic not yet documented*
  - Will implement MCP protocol (stdio, HTTP+SSE transports)
  - Will create native MCP servers (browser tools, bookmarks, history)
  - Will build MCP server catalog UI

- **Epic 2.3: BYOM (Bring Your Own Model)** (Week 17-18) - *Epic not yet documented*
  - Will implement drag-and-drop model import
  - Will create model format conversion pipeline
  - Will integrate with consent fabric for model usage permissions

- **Epic 2.4: AI Model Supply Chain Security** (Week 19-20) - *Epic not yet documented*
  - Will implement model registry with verification
  - Will create cryptographic model signing
  - Will integrate with SLSA attestations for AI models

**Note**: Phase 2 epics will be documented when Phase 1 nears completion.

---

## References

- [PRD: AI Assistant Interface](../TOUBKAL-PRD.md#ai-assistant-interface)
- [PRD: MCP Integration](../TOUBKAL-PRD.md#mcp-integration-requirements)
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Ollama Documentation](https://github.com/jmorganca/ollama)
- [Transformers.js](https://huggingface.co/docs/transformers.js/index)
- [WebLLM](https://webllm.mlc.ai/)
- [ONNX Runtime](https://onnxruntime.ai/)

---

## Changelog

| Date       | Change          | Author       |
| ---------- | --------------- | ------------ |
| 2025-10-18 | Initial version | Ilyass Motya |

***
