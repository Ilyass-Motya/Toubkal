# Contributing to Toubkal Browser

**Welcome!** 🏔️

Toubkal is an open-source, privacy-first AI browser built by a community that believes in user sovereignty, local intelligence, and verifiable transparency. We welcome contributions from developers, designers, security researchers, and privacy advocates.

This guide will help you get started.

**Last Updated**: 2025-10-18 (Updated with Phase 0.5 timeline)

---

## Table of Contents

1. [Project Status & Timeline](#project-status--timeline)
2. [Code of Conduct](#code-of-conduct)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [Professional Naming Conventions](#professional-naming-conventions)
6. [Code Style](#code-style)
7. [Testing Requirements](#testing-requirements)
8. [Pull Request Process](#pull-request-process)
9. [Good First Issues](#good-first-issues)
10. [Communication Channels](#communication-channels)
11. [License](#license)

---

## Project Status & Timeline

**Current Phase**: Phase 0.5 — Foundation Prerequisites (Weeks 1-4)
**Status**: 🔵 Active Development
**Updated Roadmap**: v2.0 (October 2025)

### Development Phases

| Phase                    | Timeline           | Status      | Focus Area                                          |
| ------------------------ | ------------------ | ----------- | --------------------------------------------------- |
| **Phase 0**              | Week 0 (Oct 2025)  | ✅ Complete | CI/CD, TypeScript/React foundation, documentation   |
| **Phase 0.5**            | Weeks 1-4 (Nov 2025) | 🔵 Active | Real C++ audit trail + ad blocking (no mocks)       |
| **Phase 1**              | Weeks 5-12 (Dec 2025-Jan 2026) | 🟡 Planning | Privacy foundation, consent fabric, transparency dashboard |
| **Phase 2**              | Weeks 13-20 (Feb-Mar 2026) | ⚪ Planned | Local AI platform, native MCP integration           |
| **Phase 3**              | Weeks 21-28 (Apr-May 2026) | ⚪ Planned | Enterprise features, community MCP servers, Beta    |
| **Alpha Release**        | Week 20 (Feb 2026)   | ⚪ Planned | 10K+ users                                          |
| **Beta Release**         | Week 28 (Apr 2026)   | ⚪ Planned | 100K+ users, 5+ enterprise pilots                   |

**Key Changes (v2.0)**:
- ✅ **Phase 0.5 Added**: Replaces TypeScript mocks with production-grade C++ implementations (audit trail + ad blocking)
- 🔄 **Phase 1 Extended**: 8 weeks → 12 weeks (realistic timeline for C++ Chromium integration)
- 📅 **Timeline Shifted**: Alpha moved from Week 16 to Week 20, Beta from Week 24 to Week 28

**What This Means for Contributors**:
- **Phase 0.5 (NOW)**: Focus on C++ privacy implementations (BoringSSL, adblock-rust, LevelDB)
- **Phase 1**: Chromium fork must be synchronized by user before Week 5 (GN build system setup)
- **Phase 2+**: AI and MCP features start Week 13 (after consent fabric is functional)

**Full Roadmap**: See [PRODUCT-ROADMAP.md](docs/PRODUCT-ROADMAP.md)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone, regardless of:

- Gender, gender identity, or gender expression
- Sexual orientation
- Disability
- Physical appearance
- Race or ethnicity
- Age
- Religion
- Nationality

### Our Standards

**Expected Behavior:**

- ✅ Be respectful and considerate in all interactions
- ✅ Give and accept constructive feedback gracefully
- ✅ Focus on what is best for the community and project
- ✅ Show empathy toward other community members

**Unacceptable Behavior:**

- ❌ Harassment, trolling, or personal attacks
- ❌ Publishing others' private information without consent
- ❌ Any conduct that could reasonably be considered inappropriate

### Enforcement

Violations can be reported to: conduct@toubkal.app
All reports will be reviewed confidentially within 48 hours.

---

## Getting Started

### Prerequisites

**Phase 0.5 (Current) — TypeScript/React Development:**

- Git (latest stable)
- Node.js v20+ (for TypeScript/React development)
- npm or pnpm (package manager)
- 2GB disk space

**Phase 1+ — Full Chromium Build:**

- All of the above, plus:
- Python 3.11+ (for build scripts)
- depot_tools (Chromium's build toolchain)
- 20GB disk space (Chromium source is large)
- 8GB+ RAM (16GB recommended for parallel builds)

**Platform-Specific (Phase 1+):**

- **Linux**: Ubuntu 22.04+ or equivalent
- **macOS**: macOS 14+ (Sonoma)
- **Windows**: Windows 11 with Visual Studio 2022

---

### Initial Setup

#### Phase 0.5 Setup (TypeScript/React Development)

```bash
# 1. Fork the repository on GitHub
# Click "Fork" at https://github.com/toubkal/toubkal

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/toubkal.git
cd toubkal

# 3. Add upstream remote
git remote add upstream https://github.com/toubkal/toubkal.git

# 4. Install dependencies
pnpm install

# 5. Run tests
pnpm test

# 6. Start development
# Edit TypeScript/React components in src/
# Follow CODING-RULES.md for standards
```

#### Phase 1+ Setup (Full Chromium Build)

**Note**: Chromium fork synchronization is user-managed. This will be available starting Week 5.

```bash
# Prerequisites: Complete Phase 0.5 setup above

# 1. Install depot_tools (Chromium's build toolchain)
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH="$PATH:$(pwd)/depot_tools"  # Add to ~/.bashrc or ~/.zshrc

# 2. Sync Chromium and dependencies (user-managed, see build-instructions.md)
gclient sync

# 3. Configure build (GN + Siso with Ninja fallback)
gn gen out/Debug --args='use_siso=true is_component_build=true is_debug=true'

# 4. Build Toubkal
autoninja -C out/Debug toubkal

# 5. Run Toubkal
./out/Debug/toubkal  # Linux/macOS
# out\Debug\toubkal.exe  # Windows
```

**Troubleshooting**: See [Build Instructions](docs/contributing/build-instructions.md) (will be updated in Phase 1)

---

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

```
feature/add-mcp-server-manager   # New features
fix/audit-log-signature-bug      # Bug fixes
docs/update-architecture-guide   # Documentation
chore/update-dependencies        # Maintenance tasks
refactor/simplify-consent-ui     # Code refactoring
test/add-e2e-ai-tests            # New tests
```

### Commit Messages

We follow **Conventional Commits** specification:

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no behavior change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build scripts)
- `perf`: Performance improvements
- `ci`: CI/CD changes

**Examples:**

```bash
# Good commits
feat(ai): add Transformers.js fallback for in-browser inference
fix(audit): prevent duplicate Ed25519 signatures in consent logs
docs(readme): update build instructions for macOS 14
test(mcp): add integration tests for toubkal-tabs server

# Bad commits (too vague)
update code
fixed bug
changes
```

**Body and Footer (Optional):**

```
feat(ai): add Transformers.js fallback for in-browser inference

Adds WebGPU-accelerated Transformers.js as fallback when Ollama
is not available. Supports SmolLM2-1.7B and Llama 3.2-1B models.

Closes #123
```

### Development Cycle

```bash
# 1. Update your fork
git checkout main
git fetch upstream
git merge upstream/main

# 2. Create feature branch
git checkout -b feature/my-awesome-feature

# 3. Make changes
# Edit code, test locally

# 4. Run tests
ninja -C out/Debug unit_tests     # C++ unit tests
./out/Debug/unit_tests            # Run C++ tests
npm test                          # TypeScript/React tests (if applicable)

# 5. Format code
git clang-format                  # C++ (clang-format)

# 6. Commit changes
git add .
git commit -m "feat(scope): descriptive commit message"

# 7. Push to your fork
git push origin feature/my-awesome-feature

# 8. Open Pull Request on GitHub
# Go to https://github.com/toubkal/toubkal and click "New Pull Request"
```

---

## Professional Naming Conventions

### General Rules

**✅ DO:**

- Use descriptive, unambiguous names
- Follow language-specific conventions (PascalCase, camelCase, snake_case, kebab-case)
- Keep names between 2-4 words (not too short, not too verbose)
- Use full words, not abbreviations (unless widely known: `id`, `url`, `api`)
- Be consistent across the codebase

**❌ DON'T:**

- Single-letter variables (except loop counters: `i`, `j`, `k`)
- Abbreviations that aren't obvious (`mgr` → use `manager`)
- Misleading names (`temp` for non-temporary data)
- Hungarian notation (`strName`, `bIsValid`)
- Reserved keywords or confusing names

---

### C++ Naming (Google Style)

| Type                  | Convention                          | Example                                |
| --------------------- | ----------------------------------- | -------------------------------------- |
| **Classes**           | `PascalCase`                        | `ConsentManager`, `AuditLogger`        |
| **Functions/Methods** | `PascalCase`                        | `HasConsent()`, `SignEvent()`          |
| **Variables**         | `snake_case`                        | `user_id`, `consent_record`            |
| **Member variables**  | `snake_case_` (trailing underscore) | `database_`, `logger_`                 |
| **Constants**         | `kPascalCase`                       | `kMaxRetries`, `kDefaultTimeout`       |
| **Namespaces**        | `lowercase` (no underscores)        | `toubkal`, `toubkal::privacy`          |
| **Macros**            | `UPPER_SNAKE_CASE`                  | `TOUBKAL_LOG`, `CHECK_NOT_NULL`        |
| **Files**             | `snake_case.cc/.h`                  | `consent_manager.cc`, `audit_logger.h` |

**Example:**

```cpp
// ✅ Good
namespace toubkal {
namespace privacy {

constexpr int kMaxRetries = 3;

class ConsentManager {
 public:
  explicit ConsentManager(Database* database);

  bool HasConsent(const std::string& user_id,
                  ConsentActionType action_type) const;

 private:
  Database* database_;  // Not owned
  std::unique_ptr<Logger> logger_;
};

}  // namespace privacy
}  // namespace toubkal
```

---

## Code Style

### C++ Code Style

We follow **Google C++ Style Guide** with Chromium modifications:

**Formatting:**

- Use `clang-format` (config: `.clang-format` in repo root)
- Indentation: 2 spaces (no tabs)
- Max line length: 100 characters
- Braces: Same line for functions, control flow

**See Also**: [CODING-RULES.md](CODING-RULES.md) for critical rules

---

## Testing Requirements

### Test Coverage

**Minimum:** 80% code coverage for all new code

### Running Tests

```bash
# C++ unit tests
ninja -C out/Debug unit_tests
./out/Debug/unit_tests

# Check code coverage (if configured)
# See docs/contributing/testing-strategy.md
```

### Writing Tests

**C++ (gtest):**

```cpp
#include "toubkal/components/privacy/consent/consent_manager.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace toubkal {

class ConsentManagerTest : public testing::Test {
 protected:
  void SetUp() override {
    // Setup test fixtures
  }
};

TEST_F(ConsentManagerTest, HasConsentReturnsTrueForApprovedAction) {
  ConsentManager manager(/* mock db */);
  EXPECT_TRUE(manager.HasConsent("user123", ConsentActionType::AI_QUERY_LOCAL));
}

}  // namespace toubkal
```

---

## Pull Request Process

### Before Submitting

- ✅ Code compiles without errors
- ✅ All tests pass (unit + integration)
- ✅ Code is formatted (`git clang-format`)
- ✅ Code coverage ≥ 80% for new code
- ✅ Documentation updated (if applicable)
- ✅ Commit messages follow Conventional Commits

### Review Process

1. **Automated Checks** (GitHub Actions):
   - Build success (Linux, macOS, Windows)
   - Test pass (unit, integration)
   - Code coverage ≥ 80%
   - Linters pass (clang-format, clang-tidy)

2. **Manual Review** (Maintainers):
   - Code quality and readability
   - Architecture alignment
   - Security implications

3. **Approval & Merge**:
   - 1 approving review required
   - All CI checks must pass
   - Squash and merge

**Response Time**: Maintainers aim to review PRs within **48 hours**.

---

## Good First Issues

Filter by label: `good first issue` on GitHub Issues

**Example Good First Issues:**

- Add code comments to `consent_manager.cc`
- Write integration test for MCP tab server
- Update build instructions for Ubuntu 24.04
- Improve error messages in internal pages

---

## Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **Discord**: [discord.gg/toubkal](#)
- **Dev List**: dev@toubkal.app

---

## License

By contributing to Toubkal, you agree that your contributions will be licensed under **Mozilla Public License 2.0 (MPL-2.0)**.

---

## Additional Resources

For detailed guides, see:

- **[CODING-RULES.md](CODING-RULES.md)** - Critical rules for AI agents and developers
- **[Code Style Guide](docs/contributing/code-style.md)** - Language-specific patterns and best practices
- **[Testing Strategy](docs/contributing/testing-strategy.md)** - Comprehensive testing guide (unit, integration, E2E)
- **[Build Instructions](docs/contributing/build-instructions.md)** - Chromium build system deep dive
- **[Release Process](docs/contributing/release-process.md)** - How to ship Toubkal releases
- **[Onboarding Guide](docs/contributing/onboarding.md)** - Team culture and extended onboarding
- **[PRD](docs/TOUBKAL-PRD.md)** - Product requirements and technical specifications
- **[Architecture Overview](docs/architecture/ARCHITECTURE-OVERVIEW.md)** - System architecture and design
- **[Product Roadmap](docs/PRODUCT-ROADMAP.md)** - Development timeline and milestones
- **[Security Policy](docs/SECURITY.md)** - Security features and vulnerability reporting

---

## Recognition

All contributors are recognized in [CONTRIBUTORS.md](./CONTRIBUTORS.md)

Thank you for helping build the future of privacy-first AI browsers! 🏔️

---

**Questions?** Email: contribute@toubkal.app
