# GitHub Actions CI/CD Pipeline

This directory contains the GitHub Actions workflows for Toubkal Browser's continuous integration and security scanning.

## Workflows

### 🔄 CI Pipeline (`.github/workflows/ci.yml`)

**Triggers**: Push/PR to `main` branch

**Jobs**:
1. **lint-and-test** - Core quality checks
   - ESLint check (TypeScript/React)
   - TypeScript type check (strict mode)
   - Vitest tests with coverage (80% threshold)
   - Coverage report upload

2. **cpp-lint** - C++ code formatting
   - clang-format check for `.cc` and `.h` files

3. **build-verification** - Multi-platform build test
   - Runs on Linux, macOS, Windows
   - Node.js 20 compatibility
   - Full quality gate verification

4. **multi-platform-test** - Cross-platform compatibility
   - Tests on Linux, macOS, Windows
   - Node.js 18, 20, 22 compatibility

5. **quality-gate** - Final validation
   - Ensures all jobs passed
   - Generates summary report

### 🔒 Security Pipeline (`.github/workflows/security.yml`)

**Triggers**: Push/PR to `main` branch + Daily at 2 AM UTC

**Jobs**:
1. **dependency-scan** - Vulnerability scanning
   - npm audit (moderate+ severity)
   - High/critical vulnerability detection

2. **sast-scan** - Static Application Security Testing
   - ESLint security rules
   - Security-related code pattern detection

3. **license-compliance** - License verification
   - License compatibility check
   - GPL/AGPL/Copyleft detection

4. **supply-chain-security** - Package integrity
   - package-lock.json verification
   - Snyk security scanning
   - Malicious package detection

5. **security-summary** - Security validation
   - Ensures all security checks passed
   - Generates security summary

## Quality Gates

### CI Pipeline Requirements
- ✅ ESLint: No errors or warnings
- ✅ TypeScript: Strict mode compliance
- ✅ Tests: 100% pass rate
- ✅ Coverage: ≥80% (branches, functions, lines, statements)
- ✅ C++: clang-format compliance
- ✅ Multi-platform: Linux, macOS, Windows builds

### Security Pipeline Requirements
- ✅ Dependencies: No high/critical vulnerabilities
- ✅ SAST: No security-related ESLint violations
- ✅ Licenses: No problematic licenses (GPL, AGPL, Copyleft)
- ✅ Supply Chain: Package integrity verified

## Artifacts

### CI Artifacts
- `coverage-report/` - Test coverage reports (30 days retention)
- `test-results/` - Test execution results (30 days retention)

### Security Artifacts
- `npm-audit-report/` - Dependency vulnerability scan (30 days retention)
- `sast-report/` - Static analysis results (30 days retention)
- `license-report/` - License compliance report (30 days retention)
- `snyk-report/` - Snyk security scan results (30 days retention)

## Configuration

### Node.js Setup
- **Version**: 20 (primary), 18, 22 (compatibility testing)
- **Cache**: npm dependencies cached for faster builds
- **Timeout**: 15-60 minutes per job

### TypeScript Configuration
- **Strict Mode**: Enforced (`strict: true`)
- **Target**: ES2022
- **Module**: ESNext
- **JSX**: React 18

### Test Configuration
- **Framework**: Vitest
- **Environment**: jsdom
- **Coverage**: v8 provider
- **Threshold**: 80% (branches, functions, lines, statements)

## Monitoring

### Status Checks
All workflows must pass before merging to `main`:
- `lint-and-test` ✅
- `cpp-lint` ✅
- `build-verification` ✅
- `multi-platform-test` ✅
- `dependency-scan` ✅
- `sast-scan` ✅
- `license-compliance` ✅
- `supply-chain-security` ✅

### Notifications
- Failed builds block PR merges
- Security vulnerabilities trigger alerts
- Coverage drops below 80% fail the build

## Troubleshooting

### Common Issues

1. **Coverage below 80%**
   ```bash
   # Run tests locally to see coverage
   npm run test:coverage
   ```

2. **ESLint errors**
   ```bash
   # Fix auto-fixable issues
   npm run lint:fix
   ```

3. **TypeScript errors**
   ```bash
   # Check type errors
   npm run typecheck
   ```

4. **C++ formatting issues**
   ```bash
   # Format C++ files
   clang-format -i **/*.{cc,h}
   ```

### Local Testing

Test the CI pipeline locally:

```bash
# Install dependencies
npm ci

# Run all quality checks
npm run lint
npm run typecheck
npm run test:ci

# Check C++ formatting
find . -name '*.cc' -o -name '*.h' | xargs clang-format -n --Werror
```

## Security Features

### Supply Chain Security
- **Dependency Locking**: package-lock.json enforced
- **Vulnerability Scanning**: npm audit + Snyk
- **License Compliance**: Automated license checking
- **Malicious Package Detection**: Snyk security scanning

### Code Security
- **SAST**: ESLint security rules
- **Type Safety**: TypeScript strict mode
- **Format Security**: clang-format for C++

### Compliance
- **No GPL/AGPL**: License compatibility enforced
- **Audit Trail**: All security scans logged
- **Artifact Retention**: 30-day retention for forensics

---

**Last Updated**: 2025-01-27  
**Maintainer**: Toubkal Browser Team  
**Contact**: dev@toubkal.app
