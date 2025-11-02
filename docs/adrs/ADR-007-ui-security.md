# ADR-007: UI Security (Content Security Policy, Trusted Types, XSS Prevention)

**Status**: Accepted
**Date**: 2025-10-18
**Deciders**: Ilyass Motya, Engineering Team
**Technical Story**: [Story 1.5: Brand Identity Implementation](../stories/phase1-week1-2/story-004-brand-identity.md)

---

## Context

Toubkal Browser's internal pages (`toubkal://`) use React 19 with complex UI components for privacy dashboards, AI management, and consent interfaces. These pages handle sensitive user data and AI operations, requiring robust security measures to prevent XSS attacks, data leakage, and unauthorized access.

**Problem**: React-based internal pages must be secured against web vulnerabilities while maintaining functionality for AI streaming, real-time audit logs, and Mojo IPC communication.

**Requirements**:
- Prevent XSS attacks in AI-generated content and user interfaces
- Secure Mojo IPC communication between browser and UI
- Enforce strict content security policies
- Maintain compatibility with React 19 features (Suspense, Transitions)
- Support real-time data streaming for audit logs and AI responses

**Constraints**:
- Must work with Chromium's WebUI infrastructure
- Cannot break React 19 functionality (HMR, JSX, state management)
- Must support Trusted Types for DOM manipulation safety
- Performance critical: security overhead <5ms per page load

---

## Decision Drivers

- **Security** (Critical) - Prevent XSS, data exfiltration, unauthorized access
- **Developer Experience** (High) - Minimal impact on React development workflow
- **Performance** (Medium) - Low security overhead for fast page loads
- **Compatibility** (High) - Work with existing Chromium security features
- **Auditability** (High) - Security policies must be verifiable and testable

---

## Considered Options

### Summary Table

| Option | Security | Dev Experience | Performance | Compatibility | Verdict |
|--------|----------|----------------|-------------|---------------|---------|
| Option 1: Strict CSP + Trusted Types | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ **Chosen** |
| Option 2: Relaxed CSP for Development | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ Rejected |
| Option 3: No CSP (Chromium Default) | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ Rejected |

---

### Option 1: Strict CSP + Trusted Types + Secure Mojo IPC

**Description**: Implement strict Content Security Policy, enforce Trusted Types for all DOM manipulation, and secure Mojo IPC with origin validation.

**Pros**:
- ✅ Maximum XSS protection through CSP and Trusted Types
- ✅ Prevents data exfiltration from internal pages
- ✅ Secure Mojo IPC communication with origin validation
- ✅ Compatible with React 19 and Chromium WebUI
- ✅ Auditable security policies

**Cons**:
- ❌ Additional development overhead for Trusted Types compliance
- ❌ Requires careful CSP policy design for React functionality

**Verdict**: ✅ **Chosen** - Best security protection for privacy-critical browser

---

### Option 2: Relaxed CSP for Development Convenience

**Description**: Use permissive CSP policies during development with strict policies only in production.

**Pros**:
- ✅ Easier development workflow
- ✅ Faster iteration during Phase 1

**Cons**:
- ❌ Security vulnerabilities in development environment
- ❌ Risk of production deployment with insecure policies
- ❌ Inconsistent security posture

**Verdict**: ❌ **Rejected** - Security must be consistent across environments

---

### Option 3: No Custom CSP (Chromium Default)

**Description**: Rely on Chromium's default WebUI security without additional CSP policies.

**Pros**:
- ✅ Zero implementation effort
- ✅ Full compatibility with Chromium

**Cons**:
- ❌ Insufficient protection for AI-generated content
- ❌ No protection against React-specific XSS vectors
- ❌ Vulnerable to data exfiltration from internal pages

**Verdict**: ❌ **Rejected** - Inadequate for Toubkal's privacy requirements

---

## Decision Outcome

**Chosen Option**: **Option 1 - Strict CSP + Trusted Types + Secure Mojo IPC**

**Rationale**:
1. **Privacy-First Mandate**: Toubkal's core value requires maximum security for internal pages handling sensitive data
2. **AI Content Risks**: AI-generated content introduces new XSS vectors requiring robust CSP
3. **Mojo IPC Security**: Internal pages communicate with browser via Mojo - must validate origins
4. **Proven Pattern**: Strict CSP + Trusted Types is industry best practice for secure web applications
5. **Phase 1 Critical**: Security foundation must be established before AI features implementation

---

## Consequences

### Positive Consequences
- ✅ **XSS Prevention**: Strict CSP blocks inline scripts and unsafe-eval
- ✅ **Data Protection**: Prevents external data exfiltration from internal pages
- ✅ **Secure IPC**: Mojo communication validated by origin
- ✅ **Audit Trail**: Security policies are testable and verifiable

### Negative Consequences
- ❌ **Development Overhead**: Additional Trusted Types implementation required
- ❌ **Testing Complexity**: CSP policies require comprehensive testing
- ❌ **Performance Impact**: Minimal overhead for security validation

### Neutral Consequences
- 🔹 **New Security Surface**: CSP policies become part of codebase to maintain
- 🔹 **Documentation**: Security policies must be documented and kept current

### Security Considerations

**CSP Policy Requirements**:
- Block inline scripts and styles (`unsafe-inline`)
- Block `eval()` and similar functions (`unsafe-eval`)
- Restrict connect-src to localhost for development tools
- Allow WebSocket connections for real-time features
- Strict frame-ancestors policy (`none`)

**Trusted Types Enforcement**:
- All DOM manipulation must use Trusted Types policies
- React dangerouslySetInnerHTML requires sanitization
- Custom Trusted Types policies for AI content rendering

**Mojo IPC Security**:
- Validate origin of Mojo messages from internal pages
- Reject messages from non-toubkal:// origins
- Cryptographic signing of sensitive IPC operations

---

## Implementation

### Timeline
- **Phase 1, Week 3-4**: CSP and Trusted Types implementation
- **Phase 1, Week 5-6**: Mojo IPC security validation
- **Phase 1, Week 7-8**: Security testing and audit

### File Locations
```
/src/toubkal/browser/security/
├── content_security_policy.h
├── content_security_policy.cc
├── trusted_types_policy.h
├── trusted_types_policy.cc
├── mojo_security_validator.h
├── mojo_security_validator.cc
└── BUILD.gn

/src/toubkal/browser/resources/  # All internal pages
```

### Key Classes/Functions

**CSP Header Generation** (`content_security_policy.cc`):
```cpp
std::string GenerateCSPHeader(const std::string& host) {
  // Strict CSP for all internal pages
  std::string csp = "default-src 'self'; "
                   "script-src 'self'; "
                   "style-src 'self' 'unsafe-inline'; "
                   "img-src 'self' data: blob:; "
                   "font-src 'self' data:; "
                   "connect-src 'self' ws://localhost:* http://localhost:*; "
                   "frame-ancestors 'none'; "
                   "object-src 'none'; "
                   "base-uri 'self'; "
                   "form-action 'self';";

  // AI-specific policies for toubkal://ai
  if (host == "ai") {
    csp += " media-src 'self' blob:;";  // For AI-generated media
  }

  // Audit dashboard specific policies
  if (host == "audit") {
    csp += " worker-src 'self';";  // For background processing
  }

  return csp;
}
```

**Trusted Types Policy** (`trusted_types_policy.cc`):
```cpp
class ToubkalTrustedTypesPolicy {
 public:
  static TrustedHTML SanitizeAIContent(const std::string& html) {
    // Sanitize AI-generated content before rendering
    return DOMPurifySanitizer::Sanitize(html);
  }
};
```

**Mojo Origin Validation** (`mojo_security_validator.cc`):
```cpp
bool ValidateMojoOrigin(const url::Origin& origin) {
  return origin.scheme() == "toubkal" &&
         (origin.host() == "settings" ||
          origin.host() == "audit" ||
          origin.host() == "ai" ||
          origin.host() == "mcp" ||
          origin.host() == "consent");
}
```

### Dependencies
- **DOMPurify**: HTML sanitization for AI content
- **Chromium Security**: CSP, Trusted Types, origin validation
- **BoringSSL**: Cryptographic signing for sensitive operations

---

## Validation

### How to Verify This Decision

**Manual Tests**:
1. Navigate to `toubkal://settings` → verify CSP headers in DevTools
2. Test XSS payload in AI input → verify blocked by CSP
3. Attempt external fetch from internal page → verify blocked
4. Test Mojo IPC from external page → verify rejected

**Automated Tests**:
```cpp
// CSP header validation test
TEST_F(SecurityTest, GeneratesStrictCSP) {
  std::string csp = GenerateCSPHeader("settings");
  EXPECT_TRUE(csp.find("unsafe-eval") == std::string::npos);
  EXPECT_TRUE(csp.find("frame-ancestors 'none'") != std::string::npos);
}

// Mojo origin validation test
TEST_F(SecurityTest, RejectsExternalMojoOrigins) {
  url::Origin external_origin(url::Origin::Create(GURL("https://example.com")));
  EXPECT_FALSE(ValidateMojoOrigin(external_origin));
}

// Trusted Types validation test
TEST_F(SecurityTest, SanitizesAIContent) {
  std::string malicious_html = "<script>alert('xss')</script><p>Safe content</p>";
  TrustedHTML sanitized = ToubkalTrustedTypesPolicy::SanitizeAIContent(malicious_html);
  EXPECT_TRUE(sanitized.toString().find("<script>") == std::string::npos);
  EXPECT_TRUE(sanitized.toString().find("Safe content") != std::string::npos);
}
```

**Performance Tests**:
```bash
# CSP header generation performance test
time ./security_unittests --gtest_filter=SecurityTest.GeneratesStrictCSP

# Expected: <1ms per CSP generation
# Target: 1000 CSP generations/sec minimum
```

**Metrics**:
- **CSP Coverage**: 100% of internal pages have strict CSP headers
- **XSS Prevention**: 0 XSS vulnerabilities in internal pages (penetration testing)
- **Performance Overhead**: <5ms security validation per page load
- **Mojo IPC Security**: 100% of external IPC attempts rejected
- **Trusted Types Compliance**: 100% DOM manipulation uses Trusted Types

---

## Related ADRs

- [ADR-001: UI Framework](ADR-001-ui-framework.md) - React 19 provides the UI framework that requires security
- [ADR-003: IPC Framework](ADR-003-ipc-framework.md) - Mojo IPC enables browser ↔ UI communication that must be secured
- [ADR-008: Custom URL Scheme](ADR-008-url-schema.md) - `toubkal://` URLs serve the React-based internal pages

---

## Related Epics

This ADR is implemented by the following epics:

- **[Epic 1.2: Brand Identity & Internal Pages](../epics/epic-1.2-brand-identity.md)** (Week 5-6)
  - Implements strict CSP for `toubkal://audit` and `toubkal://consent` pages
  - Integrates Trusted Types for React DOM manipulation
  - Secures Mojo IPC communication channels for internal pages

- **[Epic 1.3: Privacy Controls & Consent Fabric](../epics/epic-1.3-privacy-controls.md)** (Week 7-10)
  - Extends CSP for real-time transparency dashboard
  - Secures consent banner UI against XSS attacks
  - Implements CSP for AI-generated content rendering (future)

---

## References

- [PRD: Security Architecture](../TOUBKAL-PRD.md#security-architecture)
- [PRD: Privacy & Ethics Policy](../PRIVACY-ETHICS-POLICY.md)
- [Architecture: Security Overview](../architecture/security-architecture.md)
- [Chromium CSP Documentation](https://www.chromium.org/developers/design-documents/content-security-policy/)
- [Trusted Types Specification](https://w3c.github.io/trusted-types/dist/spec/)
- [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

---

## Changelog

| Date       | Change          | Author       |
| ---------- | --------------- | ------------ |
| 2025-10-18 | Initial version | Ilyass Motya |

***
