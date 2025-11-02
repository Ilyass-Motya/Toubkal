# ADR-002: Browser Engine (Chromium Fork Strategy)

**Status**: Accepted
**Date**: 2025-10-18
**Deciders**: Ilyass Motya, Engineering Team
**Technical Story**: [Story 1.2: Chromium Fork Setup Documentation](../stories/phase1-week1-2/story-002-chromium-fork-setup-docs.md)

---

## Context

Toubkal Browser requires a robust, secure browser engine capable of delivering privacy-first features, AI integration, and enterprise-grade performance. As a privacy-focused browser with AI capabilities, Toubkal needs an engine that provides strong security boundaries, excellent performance, and extensibility for advanced features while maintaining compatibility with web standards and user expectations.

**Problem**: Building a browser engine from scratch is prohibitively expensive and time-consuming. Existing engines lack the privacy features and AI integration capabilities required for Toubkal's vision. A fork-based approach must balance innovation with maintenance overhead and upstream compatibility.

**Requirements**:
- Strong security architecture with process isolation and sandboxing
- High-performance rendering and JavaScript execution
- Web standards compliance and compatibility
- Extensibility for privacy features, AI integration, and MCP support
- Cross-platform support (Windows, macOS, Linux)
- Minimal maintenance burden through upstream compatibility

**Constraints**:
- Must maintain web compatibility and standards compliance
- Cannot compromise security for performance
- Must support enterprise deployment requirements
- Performance critical: <100ms page load times, <50ms JavaScript execution overhead
- Resource constrained: efficient memory usage for AI workloads

---

## Decision Drivers

- **Security** (Critical) - Process isolation, sandboxing, and exploit mitigation
- **Performance** (High) - Fast rendering, efficient resource usage, low latency
- **Compatibility** (High) - Web standards compliance, extension support
- **Maintainability** (High) - Upstream synchronization, minimal custom patches
- **Extensibility** (Medium) - Support for privacy features and AI integration
- **Enterprise Readiness** (Medium) - Security features, management capabilities

---

## Considered Options

### Summary Table

| Option | Security | Performance | Compatibility | Maintainability | Extensibility | Verdict |
|--------|----------|-------------|---------------|-----------------|---------------|---------|
| Option 1: Chromium Fork | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ **Chosen** |
| Option 2: WebKit Fork | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ Rejected |
| Option 3: Gecko Fork | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ Rejected |
| Option 4: Custom Engine | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ❌ Rejected |

---

### Option 1: Chromium Fork (Brave Strategy)

**Description**: Fork Chromium following Brave Browser's proven approach, maintaining upstream compatibility while adding privacy features, AI integration, and security enhancements through minimal, targeted patches.

**Pros**:
- ✅ **Battle-Tested Security**: Chromium's multi-process architecture with sandboxing
- ✅ **Superior Performance**: V8 JavaScript engine, optimized rendering pipeline
- ✅ **Web Standards Leadership**: 95%+ compatibility, active standards participation
- ✅ **Proven Fork Strategy**: Brave's successful model with 20M+ users
- ✅ **Extensive Ecosystem**: Rich extension ecosystem, developer tools
- ✅ **Cross-Platform Excellence**: Native support for Windows, macOS, Linux
- ✅ **Enterprise Features**: Built-in management, security policies
- ✅ **AI/ML Ready**: WebGPU, WebAssembly, hardware acceleration support

**Cons**:
- ❌ **Large Codebase**: 30M+ lines requiring significant build resources
- ❌ **Upstream Management**: Regular synchronization with Chromium releases
- ❌ **Build Complexity**: GN + Siso build system requires specialized knowledge
- ❌ **Memory Usage**: Higher baseline memory consumption than lightweight engines

**Verdict**: ✅ **Chosen** - Only option providing the security, performance, and ecosystem required for Toubkal's vision

---

### Option 2: WebKit Fork

**Description**: Fork WebKit (Safari's engine) and customize for privacy and AI features.

**Pros**:
- ✅ **Excellent Performance**: Highly optimized JavaScript engine
- ✅ **Smaller Footprint**: Less code than Chromium, easier maintenance
- ✅ **Privacy-Friendly**: Apple's privacy-first approach aligns with Toubkal
- ✅ **Cross-Platform**: WebKit works on all major platforms

**Cons**:
- ❌ **Limited Ecosystem**: Fewer extensions and developer tools than Chromium
- ❌ **Standards Compliance**: Lags behind Chromium in modern web features
- ❌ **AI/ML Support**: Less mature WebGPU and ML capabilities
- ❌ **Enterprise Adoption**: Lower enterprise deployment than Chromium-based browsers
- ❌ **Maintenance Burden**: Less active development community than Chromium

**Verdict**: ❌ **Rejected** - Ecosystem and standards limitations outweigh performance benefits

---

### Option 3: Gecko Fork

**Description**: Fork Mozilla's Gecko engine (Firefox) and extend with privacy features.

**Pros**:
- ✅ **Strong Privacy Focus**: Mozilla's privacy-first approach
- ✅ **Extension Ecosystem**: Rich Firefox extension compatibility
- ✅ **Customization**: Extensive configuration options for enterprises
- ✅ **Open Governance**: Mozilla's open development model

**Cons**:
- ❌ **Performance Gap**: Generally slower than Chromium-based browsers
- ❌ **Standards Lag**: Often behind Chromium in web standards implementation
- ❌ **Platform Integration**: Less native platform integration than Chromium
- ❌ **AI/ML Ecosystem**: Smaller ML/AI community and tools compared to Chromium
- ❌ **Market Share**: Lower adoption affects ecosystem maturity

**Verdict**: ❌ **Rejected** - Performance and ecosystem limitations not suitable for AI-first browser

---

### Option 4: Custom Engine

**Description**: Build a custom browser engine from scratch focused on privacy and AI.

**Pros**:
- ✅ **Perfect Fit**: Engine designed specifically for Toubkal's requirements
- ✅ **Minimal Attack Surface**: Only required features, reduced complexity
- ✅ **Full Control**: Complete customization of security and performance
- ✅ **Innovation Freedom**: No upstream constraints on architecture decisions

**Cons**:
- ❌ **Development Time**: 5+ years to reach basic functionality (vs. 16 weeks MVP)
- ❌ **Security Risks**: New engine with unknown vulnerabilities
- ❌ **Standards Compliance**: Years to achieve acceptable web compatibility
- ❌ **Resource Requirements**: Massive team and budget needed
- ❌ **Ecosystem Gap**: No existing extensions or developer tools
- ❌ **Maintenance Burden**: Ongoing development without upstream support

**Verdict**: ❌ **Rejected** - Development timeline incompatible with 16-week MVP requirement

---

## Decision Outcome

**Chosen Option**: **Option 1 - Chromium Fork (Brave Strategy)**

**Rationale**:
1. **Security Foundation**: Chromium's multi-process architecture provides the strongest security boundaries
2. **Performance Requirements**: V8 + Blink deliver the speed needed for AI applications
3. **Ecosystem Advantage**: Extension ecosystem and developer tools critical for adoption
4. **Proven Model**: Brave's fork strategy demonstrates viability and scalability
5. **AI/ML Capabilities**: WebGPU, WebAssembly, and hardware acceleration support
6. **Enterprise Standards**: Chromium-based browsers dominate enterprise deployments
7. **Upstream Benefits**: Regular security updates and performance improvements

---

## Consequences

### Positive Consequences
- ✅ **Enterprise-Grade Security**: Multi-process architecture with robust sandboxing
- ✅ **Superior Performance**: V8 JavaScript engine, optimized rendering pipeline
- ✅ **Web Standards Compliance**: 95%+ compatibility with modern web applications
- ✅ **Rich Ecosystem**: Extensions, developer tools, and third-party integrations
- ✅ **Cross-Platform Support**: Native performance on Windows, macOS, Linux
- ✅ **AI/ML Ready**: WebGPU, WebAssembly, hardware acceleration support
- ✅ **Future-Proof**: Benefits from ongoing Chromium development and improvements

### Negative Consequences
- ❌ **Build Complexity**: Large codebase requires significant computational resources
- ❌ **Upstream Management**: Regular synchronization with Chromium releases
- ❌ **Memory Footprint**: Higher baseline memory usage than lightweight alternatives
- ❌ **Learning Curve**: GN build system and Chromium architecture require expertise

### Neutral Consequences
- 🔹 **Fork Management**: Dedicated resources needed for upstream synchronization
- 🔹 **Build Infrastructure**: High-performance build machines required
- 🔹 **Team Expertise**: Specialized knowledge in Chromium development needed

### Chromium Fork Strategy

**Upstream Management**:
- Regular synchronization with Chromium stable releases
- Minimal patches to reduce maintenance burden
- Security fixes applied immediately from upstream
- Feature flags for experimental Toubkal features

**Architecture Overview**:
- **Browser Process**: Main coordinator, UI, network, AI orchestration
- **Renderer Process**: Web content rendering, JavaScript execution (sandboxed)
- **GPU Process**: Graphics acceleration, WebGL/WebGPU (isolated)
- **Network Process**: HTTP/HTTPS, DNS resolution (restricted)
- **Utility Process**: Audio/video decoding, file operations (sandboxed)

**Security Boundaries**:
- Process isolation prevents renderer exploits from accessing browser data
- Site isolation separates different websites into separate processes
- Sandboxing restricts process capabilities to minimum required
- Mojo IPC provides secure cross-process communication

---

## Implementation

### Timeline
- **Pre-Phase 1**: Chromium fork setup and synchronization (user-managed)
- **Phase 1, Week 1-2**: Privacy features integration (fingerprinting, tracking blocking)
- **Phase 1, Week 3-4**: AI infrastructure integration (WebGPU, WebAssembly)
- **Phase 1, Week 5-12**: Feature development and upstream synchronization
- **Phase 2**: Advanced features and performance optimization

### File Locations
```
/src/
├── chromium/                          # Chromium upstream (managed by user)
├── toubkal/                           # Toubkal-specific modifications
│   ├── browser/                       # Browser process modifications
│   │   ├── privacy/                   # Privacy features
│   │   ├── ai/                        # AI integration
│   │   ├── mcp/                       # MCP server support
│   │   └── ui/                        # Internal UI pages
│   ├── components/                    # Shared components
│   │   ├── privacy/                   # Privacy components
│   │   ├── ai/                        # AI components
│   │   └── consent/                   # Consent management
│   ├── common/                        # Shared interfaces
│   └── renderer/                      # Renderer process modifications
├── third_party/                       # Third-party dependencies
└── BUILD.gn                          # Root build configuration
```

### Key Classes/Functions

**Browser Process Architecture** (`toubkal/browser/browser_main_parts.cc`):
```cpp
class ToubkalBrowserMainParts : public ChromeBrowserMainParts {
 public:
  ToubkalBrowserMainParts() = default;

  void PreMainMessageLoopStart() override {
    // Initialize Toubkal-specific services
    InitializePrivacyManager();
    InitializeAIManager();
    InitializeMCPManager();
    InitializeConsentManager();

    // Set up security policies
    ConfigureSecurityPolicies();

    ChromeBrowserMainParts::PreMainMessageLoopStart();
  }

  void PostMainMessageLoopStart() override {
    ChromeBrowserMainParts::PostMainMessageLoopStart();

    // Start Toubkal background services
    StartPrivacyServices();
    StartAIServices();
    StartMCPServices();
  }

 private:
  void InitializePrivacyManager() {
    privacy_manager_ = std::make_unique<PrivacyManager>();
    privacy_manager_->Initialize();
  }

  void InitializeAIManager() {
    ai_manager_ = std::make_unique<AIManager>();
    ai_manager_->Initialize();
  }

  void InitializeMCPManager() {
    mcp_manager_ = std::make_unique<MCPManager>();
    mcp_manager_->Initialize();
  }

  void ConfigureSecurityPolicies() {
    // Disable telemetry
    DisableTelemetry();

    // Enable privacy features
    EnableFingerprintingProtection();
    EnableTrackingBlocking();
    EnableBraveShields();

    // Configure AI security
    ConfigureAISecurity();
  }

  std::unique_ptr<PrivacyManager> privacy_manager_;
  std::unique_ptr<AIManager> ai_manager_;
  std::unique_ptr<MCPManager> mcp_manager_;
  std::unique_ptr<ConsentManager> consent_manager_;
};
```

**Renderer Process Modifications** (`toubkal/renderer/toubkal_content_renderer_client.cc`):
```cpp
class ToubkalContentRendererClient : public ChromeContentRendererClient {
 public:
  ToubkalContentRendererClient() = default;

  void RenderFrameCreated(content::RenderFrame* render_frame) override {
    ChromeContentRendererClient::RenderFrameCreated(render_frame);

    // Inject privacy scripts
    InjectPrivacyScripts(render_frame);

    // Set up AI integration
    SetupAIIntegration(render_frame);

    // Configure consent handling
    SetupConsentHandling(render_frame);
  }

  void DidCreateScriptContext(
      v8::Handle<v8::Context> context,
      content::RenderFrame* render_frame) override {
    ChromeContentRendererClient::DidCreateScriptContext(context, render_frame);

    // Install privacy APIs
    InstallPrivacyAPIs(context, render_frame);

    // Install AI APIs
    InstallAIAPIs(context, render_frame);

    // Install consent APIs
    InstallConsentAPIs(context, render_frame);
  }

 private:
  void InjectPrivacyScripts(content::RenderFrame* render_frame) {
    // Inject fingerprinting protection
    InjectFingerprintingProtection(render_frame);

    // Inject tracking blocker
    InjectTrackingBlocker(render_frame);

    // Inject consent manager
    InjectConsentManager(render_frame);
  }

  void InstallPrivacyAPIs(v8::Handle<v8::Context> context,
                         content::RenderFrame* render_frame) {
    // Create privacy API bindings
    v8::Isolate* isolate = context->GetIsolate();
    v8::Local<v8::Object> global = context->Global();

    // Install fingerprinting protection API
    InstallFingerprintingAPI(isolate, global);

    // Install tracking blocker API
    InstallTrackingBlockerAPI(isolate, global);
  }
};
```

**Process Security Configuration** (`toubkal/browser/toubkal_content_browser_client.cc`):
```cpp
class ToubkalContentBrowserClient : public ChromeContentBrowserClient {
 public:
  ToubkalContentBrowserClient() = default;

  std::string GetProcessType() override {
    // Return custom process type for Toubkal
    return "toubkal-browser";
  }

  bool IsRendererCodeIntegrityEnabled() override {
    // Enable code integrity checks for renderer processes
    return true;
  }

  bool ShouldEnableAudioSandbox() override {
    // Enable audio process sandboxing
    return true;
  }

  bool ShouldEnableVideoSandbox() override {
    // Enable video process sandboxing
    return true;
  }

  bool ShouldEnableNetworkSandbox() override {
    // Enable network process sandboxing
    return true;
  }

  void ConfigureNetworkContext(
      network::mojom::NetworkContextParams* context_params,
      cert_verifier::CertVerifier* cert_verifier) override {
    ChromeContentBrowserClient::ConfigureNetworkContext(
        context_params, cert_verifier);

    // Configure Toubkal-specific network policies
    ConfigurePrivacyNetworkPolicies(context_params);
    ConfigureAISecurityPolicies(context_params);
  }

 private:
  void ConfigurePrivacyNetworkPolicies(
      network::mojom::NetworkContextParams* context_params) {
    // Block telemetry domains
    context_params->blocked_domains = GetTelemetryDomains();

    // Enable HTTPS-only mode
    context_params->require_secure_origins = true;

    // Configure privacy proxy settings
    ConfigurePrivacyProxy(context_params);
  }

  void ConfigureAISecurityPolicies(
      network::mojom::NetworkContextParams* context_params) {
    // Restrict AI service domains
    context_params->allowed_ai_domains = GetAllowedAIDomains();

    // Enable AI traffic monitoring
    context_params->enable_ai_monitoring = true;
  }
};
```

### Dependencies
- **Chromium**: Core browser engine and infrastructure
- **V8**: JavaScript engine for high-performance script execution
- **Blink**: Rendering engine for web standards compliance
- **Skia**: Graphics library for cross-platform rendering
- **WebGPU**: Hardware-accelerated graphics and compute
- **WebAssembly**: High-performance code execution
- **Mojo**: IPC framework for secure cross-process communication

---

## Validation

### How to Verify This Decision

**Manual Tests**:
1. Build verification: Full Chromium build with Toubkal modifications
2. Web compatibility: Test against major websites and web standards
3. Security validation: Run security audits and fuzz testing
4. Performance benchmarking: Compare with Chromium baseline
5. Cross-platform testing: Verify consistent behavior on all supported platforms

**Automated Tests**:
```cpp
// Browser engine initialization test
TEST_F(BrowserEngineTest, InitializesCorrectly) {
  // Create browser main parts
  ToubkalBrowserMainParts main_parts;

  // Verify initialization
  EXPECT_TRUE(main_parts.Initialize());

  // Verify services started
  EXPECT_TRUE(main_parts.GetPrivacyManager() != nullptr);
  EXPECT_TRUE(main_parts.GetAIManager() != nullptr);
  EXPECT_TRUE(main_parts.GetMCPManager() != nullptr);
}

// Security boundary test
TEST_F(SecurityTest, ProcessIsolationWorks) {
  // Start renderer process
  content::RenderProcessHost* renderer = CreateRendererProcess();

  // Attempt cross-process access (should fail)
  EXPECT_FALSE(CanAccessBrowserDataFromRenderer(renderer));

  // Verify sandbox restrictions
  EXPECT_TRUE(IsRendererSandboxed(renderer));
}

// Performance benchmark test
TEST_F(PerformanceTest, RenderingPerformance) {
  // Load test page
  LoadTestPage("https://example.com");

  // Measure page load time
  base::TimeTicks start = base::TimeTicks::Now();
  WaitForPageLoad();
  base::TimeTicks end = base::TimeTicks::Now();

  base::TimeDelta load_time = end - start;

  // Assert performance requirements (<100ms)
  EXPECT_LT(load_time.InMilliseconds(), 100);
}

// Web standards compliance test
TEST_F(CompatibilityTest, WebStandardsCompliance) {
  // Test CSS Grid support
  EXPECT_TRUE(SupportsCSSGrid());

  // Test ES2023 features
  EXPECT_TRUE(SupportsES2023());

  // Test WebGPU support
  EXPECT_TRUE(SupportsWebGPU());

  // Test WebAssembly SIMD
  EXPECT_TRUE(SupportsWasmSIMD());
}
```

**Integration Tests**:
```python
# End-to-end browser functionality test
def test_browser_functionality():
    with BrowserTestHarness() as browser:
        # Test basic navigation
        browser.navigate("https://example.com")
        assert browser.get_title() == "Example Domain"

        # Test privacy features
        browser.enable_privacy_mode()
        assert browser.is_fingerprinting_blocked()

        # Test AI integration
        response = browser.query_ai("What is 2+2?")
        assert "4" in response

        # Test MCP functionality
        mcp_result = browser.execute_mcp_tool("file_read", {"path": "/tmp/test.txt"})
        assert mcp_result["success"] == True

# Cross-platform compatibility test
def test_cross_platform_compatibility():
    platforms = ["linux", "mac", "win"]

    for platform in platforms:
        with PlatformTestHarness(platform) as harness:
            # Build and run tests on each platform
            harness.build_browser()
            harness.run_functionality_tests()

            # Verify consistent behavior
            assert harness.get_test_results() == expected_results
```

**Performance Tests**:
```bash
# Page load performance benchmark
./tools/benchmark_page_load.py --url https://example.com --iterations 100
# Expected: Average <100ms, P95 <200ms

# JavaScript execution benchmark
./tools/benchmark_js_execution.py --test-suite octane --iterations 10
# Expected: Score > 80,000 (competitive with Chromium)

# Memory usage validation
./tools/measure_memory_usage.py --scenario browsing --duration 300
# Expected: < 500MB average, < 1GB peak

# Security audit
./tools/security_audit.py --check-process-isolation --check-sandboxing
# Expected: All security checks pass
```

**Metrics**:
- **Build Success Rate**: >99% successful builds with Toubkal modifications
- **Web Compatibility**: >95% compatibility with top 1000 websites
- **Security Score**: A+ rating on security audit tools
- **Performance**: <100ms page load times, <50ms JavaScript overhead
- **Memory Usage**: <500MB average browser memory consumption
- **Cross-Platform Consistency**: <1% behavioral differences across platforms
- **Upstream Compatibility**: <100 lines of conflict resolution per Chromium release

---

## Related ADRs

- [ADR-005: Build System](ADR-005-build-system.md) - GN + Siso build system for Chromium compilation
- [ADR-003: IPC Framework](ADR-003-ipc-framework.md) - Mojo IPC for cross-process communication
- [ADR-006: Supply Chain Security](ADR-006-supply-chain.md) - Reproducible builds for browser security

---

## Related Epics

This ADR is foundational to the following epics:

- **[Epic 0.5.1: Real Audit Trail](../epics/epic-0.5.1-real-audit-trail.md)** (Week 1-2)
  - Uses BoringSSL from Chromium for Ed25519 cryptographic signing
  - Integrates LevelDB from Chromium for audit persistence

- **[Epic 0.5.2: Ad Blocking MVP](../epics/epic-0.5.2-ad-blocking-mvp.md)** (Week 3-4)
  - Integrates with Chromium network stack for request blocking
  - Uses Chromium's resource type detection

- **[Epic 1.2: Brand Identity & Internal Pages](../epics/epic-1.2-brand-identity.md)** (Week 5-6)
  - Leverages Chromium WebUI infrastructure for `toubkal://` pages
  - Uses Mojo IPC for browser ↔ UI communication

- **[Epic 1.3: Privacy Controls & Consent Fabric](../epics/epic-1.3-privacy-controls.md)** (Week 7-10)
  - Integrates consent enforcement at Chromium network service level
  - Uses Chromium's fingerprinting APIs for protection

- **[Epic 1.4: SLSA Level 3 Builds](../epics/epic-1.4-slsa-level-3-builds.md)** (Week 11-12)
  - Builds on Chromium's GN build system for reproducible builds
  - Extends Chromium's build infrastructure for supply chain security

---

## References

- [PRD: Browser Architecture](../TOUBKAL-PRD.md#browser-architecture)
- [PRD: Technical Architecture](../TOUBKAL-PRD.md#technical-architecture-overview)
- [Chromium Architecture](https://www.chromium.org/developers/design-documents/)
- [Brave Browser Fork Strategy](https://github.com/brave/brave-browser/wiki)
- [Chromium Security Architecture](https://www.chromium.org/Home/chromium-security/)
- [Web Platform Tests](https://web-platform-tests.org/)

---

## Changelog

| Date       | Change          | Author       |
| ---------- | --------------- | ------------ |
| 2025-10-18 | Initial version | Ilyass Motya |

***
