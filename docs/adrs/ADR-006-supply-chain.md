# ADR-006: Supply Chain Security (SLSA Level 3, SBOM, Reproducible Builds)

**Status**: Accepted
**Date**: 2025-10-18
**Deciders**: Ilyass Motya, Engineering Team
**Technical Story**: [Story 1.0: Repository Setup & Build System](../stories/phase1-week1-2/story-000-repository-setup.md)

---

## Context

Toubkal Browser is a Chromium fork with AI/ML capabilities that must establish unbreakable supply chain integrity. As a privacy-first browser handling sensitive data and AI operations, Toubkal requires mathematically provable build security to prevent supply chain attacks that could compromise user trust.

**Problem**: Chromium forks are high-value targets for supply chain attacks. Toubkal's AI features (Ollama, MCP servers, custom models) introduce additional attack surfaces requiring comprehensive supply chain protection.

**Requirements**:
- SLSA Level 3 attestations for all build artifacts
- Complete Software Bill of Materials (SBOM) generation
- Reproducible builds across Linux, macOS, Windows platforms
- Cryptographic signing with Cosign and Rekor transparency log
- Supply chain verification for AI models and MCP server downloads
- Hermetic build environments preventing external influence
- Automated dependency verification and vulnerability scanning

**Constraints**:
- Must integrate with Chromium's GN + Siso build system
- Support cross-platform reproducible builds (identical checksums)
- Handle AI/ML dependencies (GGUF models, ONNX checkpoints, Python packages)
- Enable community verification of official builds
- Performance: build time impact <10% for security features

---

## Decision Drivers

- **Security** (Critical) - Prevent supply chain attacks that could compromise privacy features
- **Trust** (Critical) - Enable mathematical proof of build integrity for users and enterprises
- **Compliance** (High) - Meet enterprise security requirements (SOC 2, FedRAMP)
- **Open Source** (High) - Enable community verification of official builds
- **AI Security** (High) - Protect AI model supply chain from tampering
- **Performance** (Medium) - Minimal build time overhead for security features

---

## Considered Options

### Summary Table

| Option | Security | Trust | Compliance | Dev Experience | Performance | Verdict |
|--------|----------|-------|------------|----------------|-------------|---------|
| Option 1: SLSA Level 3 + CycloneDX + Cosign | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ **Chosen** |
| Option 2: Basic SLSA Level 2 + Manual SBOM | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ Rejected |
| Option 3: Proprietary Supply Chain Tools | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ❌ Rejected |
| Option 4: No Supply Chain Security | ⭐ | ⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ Rejected |

---

### Option 1: SLSA Level 3 + CycloneDX SBOM + Cosign Signing

**Description**: Implement comprehensive supply chain security with SLSA Level 3 attestations, CycloneDX SBOM generation, Cosign cryptographic signing, and Rekor transparency log integration.

**Pros**:
- ✅ **Maximum Security**: SLSA Level 3 provides strongest supply chain protection
- ✅ **Complete Transparency**: SBOM enables full dependency tracking and vulnerability scanning
- ✅ **Mathematical Trust**: Cryptographic signatures enable independent verification
- ✅ **Industry Standard**: SLSA/CycloneDX are emerging standards for software supply chain
- ✅ **Community Verification**: Open-source tooling enables anyone to verify builds
- ✅ **AI Model Protection**: Extends supply chain security to ML artifacts

**Cons**:
- ❌ **Implementation Complexity**: Requires significant build system integration
- ❌ **Build Time Overhead**: ~5-10% increase in CI/CD pipeline time
- ❌ **Tooling Maturity**: Some SLSA tools are still evolving

**Verdict**: ✅ **Chosen** - Only option providing mathematical proof of supply chain integrity

---

### Option 2: Basic SLSA Level 2 + Manual SBOM

**Description**: Implement minimal SLSA Level 2 with manually maintained SBOM and basic signing.

**Pros**:
- ✅ **Good Security**: SLSA Level 2 prevents many supply chain attacks
- ✅ **Simpler Implementation**: Less complex than Level 3
- ✅ **Faster Adoption**: Easier to implement in Phase 1

**Cons**:
- ❌ **Insufficient Protection**: Level 2 vulnerable to sophisticated attacks (build system compromise)
- ❌ **Manual SBOM**: Error-prone and incomplete dependency tracking
- ❌ **Limited Trust**: Cannot provide mathematical proof of integrity
- ❌ **Not Enterprise-Ready**: Won't meet SOC 2 or FedRAMP requirements

**Verdict**: ❌ **Rejected** - Insufficient security for privacy-critical browser

---

### Option 3: Proprietary Supply Chain Tools

**Description**: Use commercial supply chain security tools (e.g., Sigstore Enterprise, proprietary SBOM tools).

**Pros**:
- ✅ **Strong Security**: Commercial tools often have advanced capabilities
- ✅ **Vendor Support**: Dedicated support and maintenance
- ✅ **Compliance Ready**: Pre-built compliance features

**Cons**:
- ❌ **Vendor Lock-in**: Proprietary tools limit community verification
- ❌ **Cost**: Commercial licenses expensive for open-source project
- ❌ **Transparency Loss**: Proprietary tools reduce ability to audit security claims
- ❌ **Open Source Conflict**: Proprietary tools contradict Toubkal's open architecture

**Verdict**: ❌ **Rejected** - Incompatible with open-source, verifiable security approach

---

### Option 4: No Supply Chain Security

**Description**: Rely on Chromium's existing security practices without additional supply chain measures.

**Pros**:
- ✅ **Zero Implementation**: No additional work required
- ✅ **Fast Development**: No build pipeline changes needed

**Cons**:
- ❌ **Vulnerable to Attacks**: No protection against build system compromise
- ❌ **Trust Erosion**: Cannot prove build integrity to users
- ❌ **Enterprise Blocker**: Impossible to deploy in regulated environments
- ❌ **Privacy Promise Broken**: Cannot claim "mathematically provable" security

**Verdict**: ❌ **Rejected** - Fundamentally incompatible with Toubkal's security requirements

---

## Decision Outcome

**Chosen Option**: **Option 1 - SLSA Level 3 + CycloneDX SBOM + Cosign Signing**

**Rationale**:
1. **Privacy-First Imperative**: Toubkal's core value proposition requires unbreakable supply chain security
2. **Enterprise Requirements**: SOC 2 and FedRAMP compliance demand Level 3 attestations
3. **AI Security Risks**: ML supply chain attacks are emerging threats requiring comprehensive protection
4. **Mathematical Proof**: Only SLSA Level 3 provides cryptographically verifiable build integrity
5. **Open Architecture**: CycloneDX SBOM and Cosign enable community verification
6. **Future-Proof**: SLSA/CycloneDX becoming industry standards for supply chain security

---

## Consequences

### Positive Consequences
- ✅ **Unbreakable Security**: SLSA Level 3 prevents all known supply chain attacks
- ✅ **Enterprise Ready**: Meets highest security standards for regulated deployments
- ✅ **Community Trust**: Mathematical proof enables independent verification
- ✅ **AI Protection**: Extends security to ML models and MCP servers
- ✅ **Future Compliance**: Positions Toubkal for government and enterprise adoption

### Negative Consequences
- ❌ **Implementation Effort**: Significant engineering work (Phase 1, Week 11-12)
- ❌ **Build Performance**: ~5-10% CI/CD pipeline slowdown
- ❌ **Tooling Complexity**: Requires expertise in SLSA, SBOM, and cryptographic signing

### Neutral Consequences
- 🔹 **Documentation Requirements**: Security processes must be thoroughly documented
- 🔹 **Community Education**: Users need guidance on verifying builds
- 🔹 **Tool Maintenance**: SLSA tooling ecosystem requires ongoing monitoring

### Security Considerations

**Build System Security**:
- Hermetic builds preventing external network access
- Dependency pinning with cryptographic hashes
- Reproducible builds across all supported platforms

**AI Model Supply Chain**:
- Cryptographic verification of model downloads (SHA-256 + Ed25519 signatures)
- Model registry with transparency log integration
- BYOM (Bring Your Own Model) with user-verifiable provenance

**MCP Server Security**:
- Server catalog with reputation scoring and verification
- Runtime sandboxing for untrusted MCP servers
- Cryptographic attestation of server capabilities

---

## Implementation

### Timeline
- **Phase 1, Week 11**: SLSA Level 3 build pipeline setup
- **Phase 1, Week 12**: SBOM generation and Cosign integration
- **Phase 2, Week 1-2**: AI model supply chain verification
- **Phase 2, Week 3-4**: MCP server supply chain security

### File Locations
```
/src/toubkal/tools/supply-chain/
├── slsa/
│   ├── generate_provenance.sh
│   ├── verify_provenance.sh
│   └── slsa_build.yaml
├── sbom/
│   ├── cyclonedx_generator.py
│   ├── dependency_scanner.py
│   └── sbom_validator.py
├── signing/
│   ├── cosign_setup.sh
│   ├── rekor_integration.py
│   └── signature_verifier.py
└── BUILD.gn

/ci/
├── .github/workflows/slsa-build.yml
├── .github/workflows/sbom-generation.yml
└── .github/workflows/supply-chain-audit.yml
```

### Key Classes/Functions

**SLSA Provenance Generation** (`slsa/generate_provenance.sh`):
```bash
#!/bin/bash
# Generate SLSA Level 3 provenance attestation

# Build environment verification
verify_build_environment() {
  # Check hermetic build environment
  if [ -n "$http_proxy" ] || [ -n "$https_proxy" ]; then
    echo "ERROR: Build environment not hermetic - proxy detected"
    exit 1
  fi
}

# Generate provenance
generate_provenance() {
  local artifact_path="$1"
  local output_path="$2"

  # Collect build metadata
  local build_started_on="$(date -Iseconds)"
  local builder_id="https://github.com/toubkal/browser/.github/workflows/slsa-build.yml"
  local build_type="https://slsa.dev/provenance/v1"

  # Generate SLSA attestation
  slsa-provenance generate \
    --artifact-path "$artifact_path" \
    --builder-id "$builder_id" \
    --build-type "$build_type" \
    --output-path "$output_path"
}
```

**CycloneDX SBOM Generation** (`sbom/cyclonedx_generator.py`):
```python
#!/usr/bin/env python3
import json
from cyclonedx.model.bom import Bom
from cyclonedx.model.component import Component
from cyclonedx.output.json import JsonV1Dot5

class ToubkalSBOMGenerator:
    def __init__(self):
        self.bom = Bom()
        self.bom.metadata.component = Component(
            name="toubkal-browser",
            version=self.get_version(),
            type="application"
        )

    def scan_chromium_deps(self):
        """Scan Chromium DEPS file for dependencies"""
        # Parse DEPS file and add components
        pass

    def scan_npm_deps(self):
        """Scan package-lock.json for npm dependencies"""
        # Parse package-lock.json and add components
        pass

    def scan_ai_models(self):
        """Scan AI model dependencies"""
        # Add GGUF, ONNX, and other ML model components
        pass

    def generate_sbom(self, output_path: str):
        """Generate CycloneDX SBOM"""
        outputter = JsonV1Dot5(bom=self.bom)
        with open(output_path, 'w') as f:
            f.write(outputter.output_as_string())
```

**Cosign Signing Integration** (`signing/cosign_setup.sh`):
```bash
#!/bin/bash
# Set up Cosign signing for release artifacts

setup_keyless_signing() {
  # Use GitHub OIDC for keyless signing
  export COSIGN_EXPERIMENTAL=1

  # Configure Rekor transparency log
  export REKOR_SERVER="https://rekor.sigstore.dev"
}

sign_artifacts() {
  local artifact_path="$1"
  local certificate_path="$2"

  # Sign with Cosign
  cosign sign \
    --certificate "$certificate_path" \
    --rekor-url "https://rekor.sigstore.dev" \
    "$artifact_path"
}
```

## Dependencies
- **SLSA Framework**: slsa-provenance CLI tool, slsa-verifier for validation
- **CycloneDX**: cyclonedx-python library for SBOM generation and validation
- **Cosign**: Cryptographic signing tool with Rekor transparency log integration
- **Build System**: GN + Siso with hermetic build environment support

---

## Validation

### How to Verify This Decision

**Manual Tests**:
1. Build Toubkal on clean environment → verify identical checksums across platforms
2. Download release artifact → verify SLSA attestation with slsa-verifier
3. Inspect SBOM → verify all dependencies tracked with versions and hashes
4. Check Cosign signature → verify against Rekor transparency log
5. Test supply chain attack resistance → attempt build system compromise scenarios

**Automated Tests**:
```bash
# SLSA attestation verification
slsa-verifier verify-artifact toubkal-linux-x64.tar.gz \
  --provenance-path toubkal-linux-x64.intoto.jsonl \
  --source-uri github.com/toubkal/browser \
  --source-tag v1.0.0

# SBOM validation
cyclonedx-cli validate --input-file toubkal-sbom.json

# Reproducible build verification
./scripts/reproducible-build-test.sh
# Expected: identical checksums across build environments
```

**Integration Tests**:
```python
# SBOM completeness test
def test_sbom_completeness():
    sbom = load_sbom('toubkal-sbom.json')

    # Verify Chromium dependencies
    assert len([c for c in sbom.components if c.name.startswith('chromium')]) > 100

    # Verify AI dependencies
    ai_components = [c for c in sbom.components if 'ai' in c.name.lower()]
    assert len(ai_components) > 0

    # Verify cryptographic hashes
    for component in sbom.components:
        assert component.hashes is not None
        assert len(component.hashes) > 0
```

**Performance Tests**:
```bash
# Build time impact measurement
time ./build.sh  # Normal build
time ./build.sh --with-slsa  # Build with SLSA

# Target: <10% performance overhead
```

**Metrics**:
- **SLSA Compliance**: 100% of release artifacts have Level 3 attestations
- **SBOM Coverage**: 100% of dependencies tracked with cryptographic hashes
- **Reproducible Builds**: Identical checksums across all supported platforms
- **Signature Verification**: 100% of downloads include valid Cosign signatures
- **Build Time Overhead**: <10% increase in CI/CD pipeline execution time
- **False Positives**: 0% incorrect security alerts from supply chain verification

---

## Related ADRs

- [ADR-005: Build System](ADR-005-build-system.md) - GN + Siso build system integration
- [ADR-004: AI Integration](ADR-004-ai-integration.md) - AI model supply chain security
- [ADR-007: UI Security](ADR-007-ui-security.md) - Security framework integration

---

## Related Epics

This ADR is implemented by the following epics:

- **[Epic 0.5.1: Real Audit Trail](../epics/epic-0.5.1-real-audit-trail.md)** (Week 1-2)
  - Establishes cryptographic patterns (Ed25519 signing) used in supply chain
  - Creates tamper-evident audit trail foundation for SLSA provenance

- **[Epic 1.4: SLSA Level 3 Builds](../epics/epic-1.4-slsa-level-3-builds.md)** (Week 11-12)
  - Implements SLSA Level 3 provenance generation
  - Creates CycloneDX SBOM generation pipeline
  - Integrates Cosign signing with Fulcio CA and Rekor transparency log
  - Establishes reproducible build infrastructure (hermetic builds)
  - Implements dependency verification and supply chain attack detection

- **Epic 2.4: AI Model Supply Chain Security** (Week 19-20) - *Epic not yet documented*
  - Will extend supply chain security to AI models
  - Will implement model registry with cryptographic verification
  - Will integrate model signing and transparency logs

---

## References

- [PRD: Security Architecture](../TOUBKAL-PRD.md#security-architecture)
- [PRD: Supply Chain Security](../TOUBKAL-PRD.md#supply-chain-security)
- [SLSA Framework](https://slsa.dev/)
- [CycloneDX SBOM Specification](https://cyclonedx.org/)
- [Cosign Documentation](https://docs.sigstore.dev/cosign/)
- [Chromium Security Documentation](https://www.chromium.org/Home/chromium-security/)
- [Google SLSA Adoption](https://security.googleblog.com/2021/06/introducing-slsa-end-to-end-framework.html)

---

## Changelog

| Date       | Change          | Author       |
| ---------- | --------------- | ------------ |
| 2025-10-18 | Initial version | Ilyass Motya |

***
