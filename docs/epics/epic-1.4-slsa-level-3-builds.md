# Epic 1.4: SLSA Level 3 Supply Chain Security

**Epic ID**: 1.4
**Phase**: Phase 1 - Privacy Foundation
**Timeline**: Week 11-12 (2025-12-28 to 2026-01-10)
**Owner**: Team
**Status**: ⚪ Planned
**Priority**: P0 - Critical (Enterprise adoption requirement)

---

## Overview

Implement SLSA Level 3 supply chain security with reproducible builds, CycloneDX SBOM generation, Cosign cryptographic signing, and Rekor transparency log integration. Delivers mathematically provable build integrity for enterprise adoption and community verification.

---

## Business Value

**Why This Matters:**
- **Enterprise Trust**: SLSA Level 3 meets SOC 2, FedRAMP, HIPAA compliance requirements
- **Community Verification**: Anyone can independently verify official builds
- **Supply Chain Protection**: Prevent tampering with browser binaries and AI models
- **Competitive Differentiation**: First Chromium fork with SLSA Level 3 attestations

**Success Metrics:**
- 100% reproducible builds across Linux, macOS, Windows (identical checksums)
- SLSA Level 3 provenance for all release artifacts
- Complete SBOM tracking all dependencies (Chromium, Node.js, Python, AI models)
- <10% build time overhead for security features
- 5+ enterprise LOIs (Letters of Interest) by end of Phase 1

---

## Related ADRs

- **[ADR-006: Supply Chain Security](../adrs/ADR-006-supply-chain.md)** - SLSA Level 3 architecture decision
- **[ADR-005: Build System](../adrs/ADR-005-build-system.md)** - GN + Siso integration with supply chain
- **[ADR-002: Browser Engine](../adrs/ADR-002-browser-engine.md)** - Chromium fork supply chain considerations

---

## Related Epics

**Prerequisites:**
- **Epic 1.1: GN Build System** ✅ Required - Provides build infrastructure to extend
- **Epic 0.5.1: Real Audit Trail** ✅ Complete - Provides cryptographic signature patterns

**Parallel Epics:**
- None (runs sequentially after Epic 1.3)

**Downstream Epics:**
- **Epic 2.4: AI Model Supply Chain Security** - Extends supply chain to AI models (Phase 2)
- **Epic 3.1: Enterprise Features** - Uses SLSA attestations for enterprise deployments (Phase 3)

---

## Technical Architecture

### Components

**1. SLSA Provenance Generator** (`build/slsa/attestation.py`)
- Generate SLSA Level 3 provenance attestations
- Record build environment, dependencies, build commands
- Hermetic build verification (no external network access)
- GitHub Actions OIDC token integration

**2. CycloneDX SBOM Generator** (`build/sbom/generate_sbom.py`)
- Scan all build dependencies (Chromium, Node.js, Python packages)
- Track transitive dependencies
- Generate machine-readable SBOM (JSON/XML)
- Integrate with vulnerability scanners (Grype, Trivy)

**3. Cosign Signing Integration** (`build/signing/cosign_sign.sh`)
- Sign release artifacts with Cosign
- Keyless signing using Fulcio CA
- Rekor transparency log integration
- Verification instructions for users

**4. Reproducible Build Configuration** (`build/reproducible/`)
- Hermetic build environments (Docker containers)
- SOURCE_DATE_EPOCH timestamp normalization
- Deterministic file ordering
- Checksum verification across platforms

**5. Dependency Verification** (`build/verify/`)
- Automated dependency hash verification
- Supply chain attack detection (dependency confusion, typosquatting)
- License compliance checking
- Vulnerability scanning integration

### File Structure
```
build/slsa/
├── attestation.py              # SLSA provenance generation
├── github_actions_oidc.py      # OIDC token integration
├── hermetic_builder.py         # Hermetic build verification
└── templates/
    └── provenance.json.template

build/sbom/
├── generate_sbom.py            # CycloneDX SBOM generation
├── dependency_scanner.py       # Scan all dependencies
├── license_checker.py          # License compliance
└── vulnerability_scanner.py    # Grype/Trivy integration

build/signing/
├── cosign_sign.sh              # Cosign signing automation
├── fulcio_ca.py                # Fulcio CA integration
├── rekor_log.py                # Rekor transparency log
└── verification_docs.md        # User verification guide

build/reproducible/
├── hermetic_env.Dockerfile     # Hermetic build container
├── source_date_epoch.py        # Timestamp normalization
├── deterministic_build.py      # Deterministic file ordering
└── checksum_verify.sh          # Cross-platform verification

build/verify/
├── dependency_verify.py        # Hash verification
├── attack_detection.py         # Supply chain attack detection
└── compliance_check.py         # License compliance
```

---

## Stories

### Week 11 Stories (SLSA Provenance & SBOM)
- **Story 1.4.1**: SLSA Level 3 Provenance Generation (P0)
- **Story 1.4.2**: CycloneDX SBOM Generation (P0)
- **Story 1.4.3**: Reproducible Build Configuration (P0)

### Week 12 Stories (Signing & Verification)
- **Story 1.4.4**: Cosign Signing Integration (P0)
- **Story 1.4.5**: Rekor Transparency Log Integration (P1)
- **Story 1.4.6**: Dependency Verification & Attack Detection (P1)
- **Story 1.4.7**: Enterprise Outreach Launch (P0)

**Total Stories**: 7
**Completed**: 0
**Completion**: 0%

---

## Success Criteria

### Week 11 Deliverables (SLSA Provenance & SBOM)
- [  ] SLSA Level 3 provenance generated for all release artifacts
- [  ] Provenance includes: build environment, dependencies, build commands
- [  ] Hermetic build verification passes (no external network access during build)
- [  ] CycloneDX SBOM generated (JSON/XML formats)
- [  ] SBOM tracks all dependencies: Chromium, Node.js, Python packages, AI models
- [  ] Reproducible builds verified (identical checksums on Linux, macOS, Windows)

### Week 12 Deliverables (Signing & Verification)
- [  ] Cosign signing working for all release artifacts
- [  ] Keyless signing via Fulcio CA functional
- [  ] Rekor transparency log integration complete
- [  ] User verification guide published (`docs/verification.md`)
- [  ] Dependency hash verification automated
- [  ] Supply chain attack detection active (dependency confusion, typosquatting)
- [  ] 5+ enterprise LOIs received (target: legal, journalism, healthcare orgs)

### Technical Requirements
- [  ] Build reproducibility: 100% identical checksums across platforms
- [  ] SLSA Level: Level 3 attestations for all artifacts
- [  ] SBOM completeness: 100% of dependencies tracked
- [  ] Build time overhead: <10% increase for security features
- [  ] Hermetic builds: Zero external network access during compilation
- [  ] Transparency: All signatures published to Rekor log

---

## Dependencies

**Prerequisites:**
- ✅ **Epic 1.1: GN Build System** - REQUIRED (provides build infrastructure)
- ✅ Chromium build system (GN + Siso)
- ✅ GitHub Actions CI/CD (for OIDC token integration)
- ✅ Cosign, Rekor, Fulcio (open-source signing tools)

**Blockers:**
- ⚠️ Epic 1.1 completion (need working build system to extend)

**Downstream Dependencies:**
- **Epic 2.4**: AI Model Supply Chain Security (extends supply chain to AI models)
- **Epic 3.1**: Enterprise Features (uses SLSA attestations for deployments)

---

## Testing Strategy

### Reproducible Build Tests

```bash
# Cross-platform reproducibility test
./build/reproducible/checksum_verify.sh

# Build on Linux
docker run --rm -v $(pwd):/workspace hermetic-builder:latest \
  ./build_toubkal.sh --release
sha256sum out/Release/toubkal > checksums_linux.txt

# Build on macOS
./build_toubkal.sh --release
shasum -a 256 out/Release/Toubkal.app > checksums_macos.txt

# Build on Windows
build_toubkal.bat --release
certutil -hashfile out\Release\toubkal.exe SHA256 > checksums_windows.txt

# Compare checksums
diff checksums_linux.txt checksums_macos.txt checksums_windows.txt
# Expected: Identical checksums across all platforms
```

### SLSA Provenance Validation

```bash
# Generate SLSA provenance
python build/slsa/attestation.py \
  --artifact out/Release/toubkal \
  --output provenance.json

# Verify provenance structure
slsa-verifier verify-artifact \
  --provenance-path provenance.json \
  --source-uri github.com/toubkal/toubkal-browser

# Expected: SLSA Level 3 verification passes
```

### SBOM Generation & Vulnerability Scanning

```bash
# Generate CycloneDX SBOM
python build/sbom/generate_sbom.py \
  --output sbom.json \
  --format cyclonedx-json

# Verify SBOM completeness
cyclonedx-cli validate --input sbom.json
# Expected: Valid CycloneDX 1.5 SBOM

# Vulnerability scanning with Grype
grype sbom:sbom.json --output table
# Expected: Zero high/critical vulnerabilities

# Vulnerability scanning with Trivy
trivy sbom sbom.json --severity HIGH,CRITICAL
# Expected: Clean scan results
```

### Cosign Signing & Verification

```bash
# Sign release artifact with Cosign (keyless)
cosign sign-blob \
  --bundle toubkal.bundle \
  out/Release/toubkal

# Verify signature
cosign verify-blob \
  --bundle toubkal.bundle \
  --certificate-identity-regexp "github.com/toubkal/.*" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  out/Release/toubkal

# Expected: Signature verification passes

# Query Rekor transparency log
rekor-cli search --artifact out/Release/toubkal
# Expected: Entry found in transparency log
```

### Dependency Verification

```bash
# Verify dependency hashes
python build/verify/dependency_verify.py \
  --sbom sbom.json \
  --lock-file package-lock.json

# Expected: All dependency hashes match

# Detect supply chain attacks
python build/verify/attack_detection.py \
  --sbom sbom.json \
  --threshold high

# Expected: No supply chain attacks detected
```

### Integration Tests

```python
# slsa_integration_test.py
def test_end_to_end_supply_chain():
    # 1. Build artifact
    subprocess.run(["./build_toubkal.sh", "--release"], check=True)

    # 2. Generate SLSA provenance
    provenance = generate_slsa_provenance("out/Release/toubkal")
    assert provenance["slsaVersion"] == "1.0"
    assert provenance["buildLevel"] == 3

    # 3. Generate SBOM
    sbom = generate_sbom("out/Release/toubkal")
    assert len(sbom["components"]) > 1000  # Chromium has many deps

    # 4. Sign with Cosign
    signature = sign_with_cosign("out/Release/toubkal")
    assert signature is not None

    # 5. Verify signature
    verified = verify_cosign_signature("out/Release/toubkal", signature)
    assert verified is True

    # 6. Check Rekor log
    rekor_entry = query_rekor("out/Release/toubkal")
    assert rekor_entry is not None
```

### Manual Testing

1. **Reproducible Build Verification**: Build on 3 different machines (Linux, macOS, Windows), compare checksums
2. **SLSA Provenance Review**: Manually inspect provenance.json for completeness
3. **SBOM Review**: Manually verify SBOM includes Chromium, Node.js, Python dependencies
4. **Signature Verification**: Follow user verification guide, verify signature with Cosign
5. **Rekor Log Check**: Search Rekor transparency log for artifact entry
6. **Enterprise Demo**: Present SLSA attestations to 5 target enterprises

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Reproducible Build Failures** | High | Medium | Hermetic Docker environments, SOURCE_DATE_EPOCH normalization, extensive testing |
| **SLSA Tooling Immaturity** | Medium | Medium | Pin to stable tool versions, contribute upstream fixes, fallback to manual attestation |
| **Build Time Overhead** | Medium | Low | Parallel SBOM generation, cache SLSA provenance, optimize signing |
| **Cosign Key Management** | High | Low | Use keyless signing (Fulcio CA), no private keys to manage |
| **SBOM Completeness** | Medium | Medium | Automated dependency scanning, manual verification for AI model dependencies |
| **Enterprise Adoption Delay** | Low | Medium | Early outreach, compliance documentation, pilot program incentives |

---

## Out of Scope

- ❌ SLSA Level 4 (requires two-party review) - Phase 2+
- ❌ AI model supply chain security (model signing, verification) - Epic 2.4
- ❌ Extension supply chain security - Phase 3
- ❌ Automated CVE patching - Phase 2
- ❌ Advanced SBOM features (VEX documents, vulnerability exploitability) - Phase 2

---

## Documentation

- [ ] `docs/security/slsa-attestations.md` - SLSA provenance documentation
- [ ] `docs/security/sbom-generation.md` - SBOM generation guide
- [ ] `docs/security/verification-guide.md` - User verification instructions
- [ ] `docs/contributing/reproducible-builds.md` - How to build reproducibly
- [ ] `docs/enterprise/compliance.md` - Compliance documentation (SOC 2, FedRAMP)
- [ ] `docs/enterprise/pilot-program.md` - Enterprise pilot program details
- [ ] Inline code comments in build scripts

---

## Enterprise Outreach Strategy

### Target Organizations (10-15)

**Legal Sector** (3-5 orgs):
- Law firms handling sensitive client data
- Legal tech companies
- Corporate legal departments

**Journalism** (3-5 orgs):
- Investigative journalism organizations (ProPublica, The Markup)
- News organizations handling whistleblower communications
- Independent journalists needing privacy

**Healthcare** (2-3 orgs):
- Healthcare IT departments
- Telemedicine providers
- Medical research organizations

**Finance** (2-3 orgs):
- Financial services firms
- Fintech startups
- Compliance teams

### Outreach Materials

- **Compliance Documentation**: SOC 2, FedRAMP, HIPAA alignment
- **Deployment Guides**: Windows/macOS/Linux enterprise deployment
- **Pilot Program Materials**: LOI template, POC requirements
- **Technical Whitepaper**: SLSA Level 3 architecture, supply chain security

### Success Metrics

- **LOIs**: 5+ Letters of Interest by end of Week 12
- **Demos**: Schedule 10+ demos for Q1 2026
- **POCs**: 2+ Proof-of-Concept deployments in Q1 2026

---

## Timeline

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| **Week 11** | SLSA Provenance & SBOM | Reproducible builds working, SLSA Level 3 provenance, CycloneDX SBOM |
| **Week 12** | Signing & Enterprise Launch | Cosign signing, Rekor integration, 5+ enterprise LOIs |

**Start Date**: 2025-12-28 (Week 11)
**End Date**: 2026-01-10 (Week 12)
**Duration**: 2 weeks

---

## References

- [PRODUCT-ROADMAP.md - Phase 1](../PRODUCT-ROADMAP.md#phase-1-privacy-foundation-weeks-5-12)
- [ADR-006: Supply Chain Security](../adrs/ADR-006-supply-chain.md)
- [ADR-005: Build System](../adrs/ADR-005-build-system.md)
- [SLSA Framework](https://slsa.dev/)
- [CycloneDX SBOM Specification](https://cyclonedx.org/)
- [Cosign Documentation](https://docs.sigstore.dev/cosign/overview/)
- [Rekor Transparency Log](https://docs.sigstore.dev/rekor/overview/)
- [Fulcio Certificate Authority](https://docs.sigstore.dev/fulcio/overview/)

---

**Epic Owner**: Team
**Last Updated**: 2025-10-18
**Status**: ⚪ Planned (starts Week 11 after Epic 1.3 completion)
