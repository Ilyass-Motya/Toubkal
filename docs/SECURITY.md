# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version             | Supported | Status             |
| ------------------- | --------- | ------------------ |
| Alpha (current dev) | ✅ Yes    | Active development |
| Pre-alpha           | ❌ No     | Unsupported        |

---

## Reporting a Vulnerability

**IMPORTANT: DO NOT file public GitHub issues for security vulnerabilities.**

### How to Report

Please report security vulnerabilities to:

**security@toubkal.app**

You can also use our PGP key (see below) for encrypted communications.

### What to Include in Your Report

To help us triage and fix the issue quickly, please include:

1. **Description**: Detailed description of the vulnerability
2. **Steps to Reproduce**: Clear steps to reproduce the issue
3. **Impact Assessment**: Potential impact (data leak, code execution, etc.)
4. **Affected Versions**: Which versions are affected
5. **Suggested Fix**: If you have one (optional but appreciated)
6. **Your Contact Info**: For follow-up questions

### Example Report

```
Subject: [SECURITY] Ed25519 Signature Bypass in Audit Logger

Description: Found a way to bypass Ed25519 signature verification in the audit trail...

Steps to Reproduce:
1. Open Toubkal browser
2. Navigate to toubkal://audit
3. Execute the following in DevTools: ...

Impact: An attacker could forge audit log entries, breaking the verifiable privacy guarantee.

Affected Versions: Alpha 0.1.0 - 0.3.0

Suggested Fix: Add signature verification before merkle tree insertion at line 142 of audit_logger.cc
```

---

## Our Commitment

### Response Time

- **Initial Response**: Within 48 hours
- **Triage**: Within 5 business days
- **Fix Timeline**:
  - **Critical** (data leak, remote code execution): 7 days
  - **High** (authentication bypass, signature bypass): 14 days
  - **Medium** (XSS, CSRF): 30 days
  - **Low** (information disclosure): 60 days

### Disclosure Process

We follow **coordinated disclosure**:

1. **Report Received**: We acknowledge your report within 48 hours
2. **Investigation**: We validate and assess the vulnerability
3. **Fix Development**: We develop and test the fix
4. **Release**: Security patch released to all supported versions
5. **Public Disclosure**:
   - We publish a security advisory at **toubkal.app/security/advisories**
   - We credit the reporter (unless you request anonymity)
   - Typically 7-30 days after the patch is released

### Hall of Fame

Security researchers who responsibly disclose vulnerabilities will be:

- Listed in our [Security Hall of Fame](https://toubkal.app/security/hall-of-fame)
- Credited in release notes (if desired)
- Eligible for swag/rewards when our bug bounty program launches

---

## Security Features

Toubkal includes the following security features:

### Cryptographic Privacy

- **Ed25519 Signatures**: All audit log entries are cryptographically signed using BoringSSL (FIPS 140-2/3 validated)
- **Merkle Trees**: Tamper-proof audit trail with SHA-256 root hash verification
- **Zero Telemetry**: Mathematically provable (no external network requests by default)
- **Reproducible Builds**: SLSA Level 3 attestations with Cosign signing and Rekor transparency log

### Process Isolation

- **Sandboxing**: Chromium's multi-process architecture with OS-level sandboxing (seccomp-bpf on Linux, Sandbox on Windows, Seatbelt on macOS)
- **Site Isolation**: Each website runs in its own renderer process
- **Principle of Least Privilege**: Processes have minimal permissions
- **V8 Isolation**: JavaScript execution sandboxed with pointer compression and control-flow integrity

### Network Security

- **TLS 1.3**: Enforced for all HTTPS connections (TLS 1.2 deprecated)
- **HSTS Preload**: HTTP Strict Transport Security enabled by default
- **Certificate Transparency**: CT log verification required
- **DNS-over-HTTPS**: Secure DNS resolution to prevent eavesdropping
- **Post-Quantum Cryptography**: NIST ML-KEM/ML-DSA support planned (pending BoringSSL implementation)

### Supply Chain Security

- **Reproducible Builds**: SLSA Level 3 attestation across Linux, macOS, Windows
- **Signed Releases**: All releases signed with Cosign and published to Rekor transparency log
- **SBOM**: Software Bill of Materials (CycloneDX format) generated for every release
- **Dependency Scanning**: Automated vulnerability scanning with Dependabot and Trivy
- **Chromium Upstream Tracking**: Pinned to Chromium Stable releases (tracking Extended Stable for enterprise)

---

## Bug Bounty Program

**Status**: Coming soon (Phase 3, Q2 2026)

We're planning to launch a bug bounty program with rewards for:

- **Critical** (RCE, data breach, cryptographic bypass): $1,000 - $5,000
- **High** (authentication bypass, Ed25519 signature forgery): $500 - $1,000
- **Medium** (XSS, CSRF, privilege escalation): $250 - $500
- **Low** (information disclosure, denial of service): $50 - $250

**Scope Includes**:

- Toubkal browser core (C++ codebase)
- Cryptographic audit trail implementation
- Universal consent fabric
- MCP integration layer
- AI inference gateway (Ollama, Transformers.js, WebGPU)

**Out of Scope**:

- Third-party dependencies (report to upstream)
- Social engineering attacks
- Physical attacks on user devices
- Denial of service attacks

Details will be published at **toubkal.app/security/bounty**

---

## PGP Key

For encrypted security reports, use our PGP key:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----

[PGP key will be added when project launches]

Fingerprint: [To be added]
Key ID: [To be added]

-----END PGP PUBLIC KEY BLOCK-----
```

Download from: **toubkal.app/security/pgp-key.asc**

---

## Security Advisories

Published security advisories: **toubkal.app/security/advisories**

We use the following severity levels:

- **Critical**: Immediate action required (remote code execution, data breach)
- **High**: Important update (authentication bypass, cryptographic flaw)
- **Medium**: Recommended update (XSS, CSRF, information disclosure)
- **Low**: Optional update (minor issues, edge cases)

---

## Security Best Practices

### For Users

1. **Keep Toubkal Updated**: Enable automatic updates (Settings → About)
2. **Verify Signatures**: Check SLSA attestations for downloaded builds
3. **Review Audit Logs**: Regularly check the Transparency Dashboard
4. **Use Local AI**: Avoid cloud AI unless necessary (reduces attack surface)
5. **Report Suspicious Behavior**: If something seems wrong, report it

### For Contributors

1. **Follow Secure Coding Guidelines**: See [docs/contributing/code-style.md](docs/contributing/code-style.md)
2. **Run Security Scans**: Use security linters before committing (clang-tidy, cppcheck)
3. **Review Dependencies**: Check for known vulnerabilities (Chromium's security review process)
4. **Write Tests**: Include security test cases for new features (unit + integration)
5. **Sign Commits**: Use GPG to sign your commits
6. **Code Review**: All security-sensitive code requires 2+ reviewer approvals
7. **Fuzz Testing**: Run fuzzing tests for parser/codec implementations

---

## Past Security Incidents

**None yet** (project in alpha)

When incidents occur, we'll document them here with:

- Date discovered
- Impact
- Fix timeline
- Lessons learned

---

## Security Contacts

- **General Security**: security@toubkal.app
- **Security Advisories**: advisories@toubkal.app
- **Bug Bounty**: bounty@toubkal.app (when launched)

---

## Acknowledgments

We thank the security research community for helping keep Toubkal secure. Special thanks to:

- [To be added as researchers contribute]

---

## Security Architecture Highlights

### Cryptographic Audit Trail

Every browser operation is logged with:

- **Ed25519 digital signatures** (BoringSSL FIPS 140-2/3)
- **Merkle tree integrity** (SHA-256 hash chain)
- **LevelDB storage** (local-first, no cloud sync)
- **Export formats**: JSON, CSV, PDF for compliance audits

**Verification**:

```bash
# Verify audit log integrity
toubkal://audit → Export → Verify Signature
# Returns: ✅ All 1,234 entries verified (Merkle root: abc123...)
```

### Universal Consent Fabric

All external operations require explicit user consent:

- **Per-request consent** for cloud AI (OpenAI, Anthropic, Gemini)
- **MCP tool invocations** (consent banner with data disclosure)
- **Visual indicators**: 🟢 Local (no consent), 🔵 Consent-gated, 🔴 Denied
- **Consent log**: Cryptographically signed, auditable, exportable

### AI Inference Security

**Local AI (Ollama, Transformers.js)**:

- Runs in sandboxed browser context (no network access)
- Model weights verified via SHA-256 checksums
- No data leaves the device

**Cloud AI (Optional)**:

- Explicit consent banner before every request
- Data disclosure (what data is sent, retention policy)
- Request/response logged in audit trail
- User can revoke consent at any time

### MCP Security Model

**Server Isolation**:

- Each MCP server runs in isolated process (stdio transport)
- Network-based MCP servers (HTTP+SSE) run with CORS restrictions
- Tool invocations require consent-gated approval

**Privacy Labels**:

- 🟢 **Local-only**: No network access (e.g., toubkal-tabs, toubkal-bookmarks)
- 🟡 **Local-network**: LAN access only (e.g., filesystem, database)
- 🔵 **Internet**: Full network access (requires explicit consent per tool)

---

## Vulnerability Disclosure Examples

### Example 1: Critical (Cryptographic Bypass)

**Severity**: Critical
**CVSS**: 9.8 (Critical)
**Description**: Ed25519 signature verification bypass in audit trail
**Impact**: Attacker could forge audit log entries, breaking verifiable privacy guarantee
**Fix Timeline**: 7 days (emergency patch)
**Reward**: $5,000

### Example 2: High (Authentication Bypass)

**Severity**: High
**CVSS**: 8.1 (High)
**Description**: Consent fabric bypass via race condition
**Impact**: Cloud AI request sent without user consent
**Fix Timeline**: 14 days (security patch)
**Reward**: $1,000

### Example 3: Medium (XSS)

**Severity**: Medium
**CVSS**: 6.5 (Medium)
**Description**: Reflected XSS in toubkal://ai settings page
**Impact**: Malicious script execution in internal page context
**Fix Timeline**: 30 days (regular update)
**Reward**: $500

---

**Last Updated**: 2025-10-18
**Next Review**: 2026-01-18
