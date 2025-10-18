# Toubkal Browser

🏔️ **The intelligent browser that protects your mind.**

Local AI, zero telemetry, cryptographically verifiable privacy.

---

## Project Status

**Current Phase**: Phase 0.5 — Foundation Prerequisites (Weeks 1-4)
**Status**: 🔵 Active Development
**Last Updated**: 2025-10-18

### What's Complete (Phase 0)

- ✅ **CI/CD Infrastructure**: Multi-platform testing, security scanning, automated quality gates
- ✅ **TypeScript/React Foundation**: Strict mode, 80% test coverage enforcement, component stubs
- ✅ **Documentation**: Comprehensive PRD, roadmap, architecture docs, ADRs, contributing guidelines
- ✅ **Code Quality Tools**: ESLint, Prettier, Husky pre-commit hooks

### What's Next (Phase 0.5)

- 🔵 **Real Audit Trail (C++)**: BoringSSL Ed25519 signing, Merkle tree verification, LevelDB persistence
- 🔵 **Ad Blocking MVP (C++)**: Brave's adblock-rust integration, EasyList + uBlock Origin filters
- ⚪ **Chromium Fork**: User-managed (prerequisite for Phase 1)

**Note**: Phase 0 focused on TypeScript/React infrastructure. Phase 0.5 replaces mocks with production-grade C++ privacy implementations.

---

## Quick Links

- 📖 [Vision & Mission](docs/TOUBKAL-PRD.md#1-vision--objectives)
- 🎯 [MVP Scope](docs/TOUBKAL-PRD.md#6-mvp-scope-alignment)
- 🚀 [Product Roadmap](docs/PRODUCT-ROADMAP.md) — **Updated v2.0** (Phase 0.5 added, timeline extended)
- 🏗️ [Architecture Overview](docs/architecture/ARCHITECTURE-OVERVIEW.md)
- 🤝 [Contributing Guidelines](CONTRIBUTING.md)
- 🔒 [Privacy & Ethics Policy](docs/PRIVACY-ETHICS-POLICY.md)

---

## Features (Planned)

### Phase 0.5 (Weeks 1-4) — Active Development

✅ **Cryptographic Audit Trail** (C++): Ed25519-signed logs, Merkle tree verification, LevelDB persistence
✅ **Ad Blocking MVP** (C++): Brave's adblock-rust, EasyList + uBlock Origin, CNAME uncloaking

### Phase 1 (Weeks 5-12) — Privacy Foundation

✅ **Zero Telemetry**: No tracking, no analytics, no "phone home"
✅ **Consent Fabric** (C++): Browser-level enforcement, Ed25519-signed decisions
✅ **Transparency Dashboard**: Real-time audit log viewer with Merkle proof export
✅ **SLSA Level 3 Builds**: Reproducible builds, Cosign signing, Rekor transparency log

### Phase 2 (Weeks 13-20) — Local AI Platform

✅ **Local-First AI**: Ollama, Transformers.js, WebLLM — AI runs on your machine
✅ **Native MCP Support**: First browser with built-in Model Context Protocol
✅ **AI Assistant Interface**: Sidebar overlay, context menu integration, streaming responses
✅ **BYOM**: Bring Your Own Model (GGUF import from HuggingFace)

### Phase 3 (Weeks 21-28) — Enterprise & Beta

✅ **Enterprise Policies**: Group Policy/MDM support, local-only AI enforcement
✅ **Community MCP Servers**: 5-10 pre-vetted servers (filesystem, GitHub, database, automation)
✅ **Performance Dashboard**: Real-time CPU/RAM/battery monitoring per tab
✅ **Public Beta**: 10K+ users, 5+ enterprise pilots

### Post-MVP (Phase 4+)

✅ **Open Source**: MPL 2.0 licensed
✅ **On-Device Fine-Tuning**: LoRA/QLoRA support
✅ **Privacy Routing**: Tor/I2P integration with cryptographic route proofs
✅ **Post-Quantum Crypto**: NIST ML-KEM / ML-DSA
✅ **Mobile Apps**: iOS and Android versions

---

## Quick Start

**Note**: Chromium fork setup is a prerequisite. Full build instructions coming in Phase 1.

```bash
# Phase 0.5 Development (TypeScript/React components)

# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint & format
pnpm lint
pnpm format
```

**Chromium Build (Phase 1+)** — Coming Soon:
```bash
# Sync Chromium (user-managed, see docs/contributing/build-instructions.md)
gclient sync

# Build
gn gen out/Debug
autoninja -C out/Debug toubkal

# Run
./out/Debug/toubkal
```

**Full build instructions**: [docs/contributing/build-instructions.md](docs/contributing/build-instructions.md) (will be updated in Phase 1)

---

## Documentation

### Getting Started

- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute (updated timeline)
- [Coding Rules](CODING-RULES.md) - Critical coding standards (mandatory for all developers)

### Strategic Docs

- [Toubkal PRD](docs/TOUBKAL-PRD.md) - Product Requirements (updated v2.0 with Phase 0.5)
- [Product Roadmap](docs/PRODUCT-ROADMAP.md) - 28-week timeline (updated v2.0)
- [Privacy & Ethics Policy](docs/PRIVACY-ETHICS-POLICY.md) - Privacy commitments

### Technical Docs

- [Architecture Overview](docs/architecture/ARCHITECTURE-OVERVIEW.md) - System design
- [AI Integration Spec](docs/architecture/AI-INTEGRATION-SPEC.md) - AI architecture
- [MCP Integration](docs/architecture/mcp-integration.md) - Model Context Protocol
- [Privacy Architecture](docs/architecture/privacy-architecture.md) - Audit trail, consent fabric
- [ADRs](docs/adrs/) - Architecture Decision Records (8 documented)

### Development Guides

- [Testing Strategy](docs/contributing/testing-strategy.md) - Comprehensive testing guide
- [Code Style Guide](docs/contributing/code-style.md) - Language-specific patterns
- [Build Instructions](docs/contributing/build-instructions.md) - Chromium build (Phase 1+)
- [Release Process](docs/contributing/release-process.md) - Release workflow
- [Onboarding Guide](docs/contributing/onboarding.md) - Team/culture onboarding

---

## Project Timeline

```
Month        Oct 2025     Nov 2025      Dec 2025      Jan 2026      Feb 2026      Mar 2026      Apr 2026      May 2026
Week         0   1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28
Phase 0      [✅]
Phase 0.5        [🔵🔵🔵🔵]
Phase 1              [⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪]
Phase 2                                  [⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪]
Phase 3                                                      [⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪]
Alpha                                                                    ▲
Beta                                                                                              ▲
```

**Legend**: ✅ Complete | 🔵 Active | ⚪ Planned

---

## Contributing

We welcome contributions! Please read:

1. [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution workflow (updated timeline)
2. [CODING-RULES.md](CODING-RULES.md) - **MANDATORY** coding standards
3. [docs/contributing/testing-strategy.md](docs/contributing/testing-strategy.md) - Testing requirements

### Key Standards

- **Test Coverage**: 80% minimum (enforced in CI)
- **Type Safety**: No `any` types, strict TypeScript mode
- **Error Handling**: No bare string throws, must use `Error` objects
- **Code Review**: All PRs require approval before merge
- **Pre-Commit**: Husky runs linting and tests automatically

---

## License

**Mozilla Public License 2.0** — See [LICENSE](LICENSE)

This ensures:
- ✅ Open source code (all modifications must be shared)
- ✅ Patent grant (contributors grant patent rights)
- ✅ Commercial use allowed (businesses can deploy)
- ✅ Weak copyleft (file-level, not project-level)

---

## Community

- **GitHub Issues**: [Bug reports, feature requests](https://github.com/toubkal/toubkal/issues)
- **Discussions**: [Community discussions](https://github.com/toubkal/toubkal/discussions)
- **Security**: security@toubkal.app (for security reports, see [SECURITY.md](docs/SECURITY.md))
- **Enterprise**: enterprise@toubkal.app (for pilot programs, see roadmap Week 11-12)

---

## Acknowledgments

Built on the shoulders of giants:

- **Chromium** - Browser engine foundation
- **Brave** - Privacy-first browser inspiration, adblock-rust library
- **Ollama** - Local AI inference
- **Anthropic** - Model Context Protocol (MCP) specification
- **BoringSSL** - FIPS-validated cryptography (Ed25519 signing)

---

**Tagline**: _"The intelligent browser that protects your mind."_

**Status**: Phase 0.5 Active Development (Week 1-4)
**Next Milestone**: Real audit trail + ad blocking MVP (Week 4 completion)
**Last Updated**: 2025-10-18
