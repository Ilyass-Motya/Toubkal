# Toubkal Browser PRODUCT-ROADMAP — Review Analysis

**Date**: 2025-10-18
**Reviewer**: Claude (Technical Analysis)
**Document Reviewed**: PRODUCT-ROADMAP.md v1.0
**Review Type**: Timeline Feasibility, PRD Consistency, Risk Analysis

---

## Executive Summary

**Overall Assessment**: ⭐⭐⭐⭐ (4/5) — **Strong Timeline with 8 Critical Inconsistencies**

The Product Roadmap is well-structured with clear phases, realistic milestones, and measurable success criteria. However, there are **8 critical inconsistencies** with the updated PRD and **5 timeline risks** that need addressing.

**Key Strengths**:

- ✅ Clear 3-phase structure (Foundation → AI → Ecosystem)
- ✅ Realistic 24-week timeline (6 months to Beta)
- ✅ Measurable success criteria per phase
- ✅ Dependencies clearly documented
- ✅ Risk mitigation strategies included

**Critical Issues Requiring Immediate Attention**:

- ❌ **MCP Spec Version Wrong** (2025-06-18 should be 2024-11-05)
- ❌ **libsodium References** (should be BoringSSL)
- ❌ **Enterprise Pilot Expectations Unrealistic** (6-month procurement cycles)
- ❌ **Chromium "LTS" Label** (should be "Stable tracking Extended Stable")
- ❌ **Post-Quantum Crypto Names** (Kyber/Dilithium → ML-KEM/ML-DSA)
- ❌ **WebGPU Performance Claims Missing** (updated to 40-60% in PRD)
- ❌ **Alpha/Beta Target Dates Wrong** (Jan 2026 vs. Oct 2025 today)
- ❌ **Siso Build System** (missing Ninja fallback mention)

---

## 1. CRITICAL INCONSISTENCIES WITH UPDATED PRD

### Issue #1: MCP Spec Version (Line 199)

**Problem**: Roadmap references "MCP spec 2025-06-18" but PRD was updated to "2024-11-05"

**Current**:

```markdown
**MCP protocol**: Track Anthropic's MCP spec updates (currently 2025-06-18)
```

**Issue**: 2025-06-18 is a **future date** and doesn't exist

**Impact**: 🔴 **CRITICAL** — Technical inaccuracy

**Fix Required**:

```diff
- **MCP protocol**: Track Anthropic's MCP spec updates (currently 2025-06-18)
+ **MCP protocol**: Track Anthropic's MCP spec updates (currently 2024-11-05, latest)
```

---

### Issue #2: libsodium vs. BoringSSL (Line 38)

**Problem**: Roadmap doesn't specify crypto library, but PRD/Architecture use BoringSSL (not libsodium)

**Current**:

```markdown
- ✅ **Cryptographic Audit Trail**: Ed25519-signed logs, Merkle-tree verification, exportable transparency proofs (JSON/CSV/PDF)
```

**Missing**: Crypto library specification (BoringSSL FIPS-validated)

**Impact**: 🟡 **MEDIUM** — Missing technical detail

**Fix Required**:

```diff
- ✅ **Cryptographic Audit Trail**: Ed25519-signed logs, Merkle-tree verification, exportable transparency proofs (JSON/CSV/PDF)
+ ✅ **Cryptographic Audit Trail**: Ed25519-signed logs (BoringSSL FIPS 140-2/3), Merkle-tree verification (SHA-256), exportable transparency proofs (JSON/CSV/PDF)
```

---

### Issue #3: Enterprise Pilot Expectations (Line 143)

**Problem**: Success criteria says "5+ enterprise pilot deployments" by Week 24, but PRD was updated to account for 6-12 month procurement cycles

**Current**:

```markdown
### Success Criteria

- 5+ enterprise pilot deployments (50+ users each)
```

**Issue**: Unrealistic timeline (enterprise sales = 6-12 months)

**Impact**: 🔴 **CRITICAL** — Unrealistic success criteria

**Fix Required**:

```diff
### Success Criteria
- 5+ enterprise pilot deployments (50+ users each)
+ 5+ enterprise pilot LOIs (Letters of Intent) or POC agreements (50+ users each), with 2+ signed paid contracts by Month 9
+ Enterprise outreach must start in Phase 1 (Week 1-8) to meet Week 24 target
```

---

### Issue #4: Chromium "LTS" Label (Line 197)

**Problem**: External Dependencies references "Chromium LTS" but PRD/Architecture updated to "Stable tracking Extended Stable"

**Current**:

```markdown
- **Chromium upstream**: Track LTS releases, minimize merge conflicts
```

**Issue**: "LTS releases" terminology inaccurate (Chromium doesn't have LTS)

**Impact**: 🟡 **MEDIUM** — Misleading terminology

**Fix Required**:

```diff
- **Chromium upstream**: Track LTS releases, minimize merge conflicts
+ **Chromium upstream**: Track Stable releases (with Extended Stable for enterprise), minimize merge conflicts via canary builds
```

---

### Issue #5: Post-Quantum Crypto Names (Line 162)

**Problem**: Phase 4+ lists "Kyber/Dilithium" but PRD was updated to NIST ML-KEM/ML-DSA

**Current**:

```markdown
- **Post-Quantum Cryptography**: Kyber/Dilithium for future-proof security
```

**Issue**: Pre-standard algorithm names (NIST finalized in Aug 2024)

**Impact**: 🟡 **MEDIUM** — Outdated algorithm names

**Fix Required**:

```diff
- **Post-Quantum Cryptography**: Kyber/Dilithium for future-proof security
+ **Post-Quantum Cryptography**: NIST ML-KEM (formerly Kyber) / ML-DSA (formerly Dilithium) for future-proof security (pending BoringSSL support)
```

---

### Issue #6: WebGPU Performance Claims Missing

**Problem**: Phase 2 deliverables don't mention WebGPU performance targets (PRD updated to 40-60%)

**Current**:

```markdown
- ✅ **Multi-Engine AI Support**: Ollama (primary), Transformers.js (in-browser), custom endpoints
```

**Missing**: WebGPU performance expectations

**Impact**: 🟡 **MEDIUM** — Incomplete technical specification

**Fix Required**:

```diff
- ✅ **Multi-Engine AI Support**: Ollama (primary), Transformers.js (in-browser), custom endpoints
+ ✅ **Multi-Engine AI Support**: Ollama (primary), Transformers.js (in-browser, 40-60% native performance), WebLLM (WebGPU, high-performance), custom endpoints
```

And in Success Criteria (line 105):

```diff
- p95 <2s local summarization latency (Llama 3.2 3B, 8GB RAM)
+ p95 <2s local summarization latency (Llama 3.2 3B, 8GB RAM, Ollama); <3s for WebGPU-only (Transformers.js)
```

---

### Issue #7: Timeline Dates Mismatch

**Problem**: Line 22 shows "Week 1-8 (Jan 2026)" but today is 2025-10-18

**Current**:

```markdown
| **Phase 1: Foundation** | Week 1-8 (Jan 2026) | 🟡 Planning | Trust & Privacy baseline |
| **Phase 2: Local AI Platform** | Week 9-16 (Mar 2026) | ⚪ Planned | Intelligence without compromise |
| **Phase 3: Ecosystem & Enterprise** | Week 17-24 (May 2026) | ⚪ Planned | Scale & adoption |
| **Alpha Release** | Week 16 (Apr 2026) | ⚪ Planned | Public testing (10K users) |
| **Beta Release** | Week 24 (Jun 2026) | ⚪ Planned | Production-ready (100K users) |
```

**Issue**: If starting Oct 2025, Phase 1 ends Dec 2025 (not Jan 2026)

**Impact**: 🟡 **MEDIUM** — Date confusion

**Fix Required**:

```diff
Assuming Phase 1 starts Week 1 of Nov 2025:
- | **Phase 1: Foundation** | Week 1-8 (Jan 2026) | 🟡 Planning | Trust & Privacy baseline |
+ | **Phase 1: Foundation** | Week 1-8 (Nov-Dec 2025) | 🟡 Planning | Trust & Privacy baseline |
- | **Phase 2: Local AI Platform** | Week 9-16 (Mar 2026) | ⚪ Planned | Intelligence without compromise |
+ | **Phase 2: Local AI Platform** | Week 9-16 (Jan-Feb 2026) | ⚪ Planned | Intelligence without compromise |
- | **Phase 3: Ecosystem & Enterprise** | Week 17-24 (May 2026) | ⚪ Planned | Scale & adoption |
+ | **Phase 3: Ecosystem & Enterprise** | Week 17-24 (Mar-Apr 2026) | ⚪ Planned | Scale & adoption |
- | **Alpha Release** | Week 16 (Apr 2026) | ⚪ Planned | Public testing (10K users) |
+ | **Alpha Release** | Week 16 (Feb 2026) | ⚪ Planned | Public testing (10K users) |
- | **Beta Release** | Week 24 (Jun 2026) | ⚪ Planned | Production-ready (100K users) |
+ | **Beta Release** | Week 24 (Apr 2026) | ⚪ Planned | Production-ready (100K users) |
```

**OR** if Phase 1 starts Jan 2026, update status from "🟡 Planning" to "⚪ Planned" (consistency)

---

### Issue #8: Siso Build System (Line 43)

**Problem**: Roadmap mentions "GN + Siso Build System" but doesn't note Ninja fallback (per PRD/Architecture updates)

**Current**:

```markdown
- ✅ **GN + Siso Build System**: Monolithic structure, automated gclient sync, patch application scripts
```

**Issue**: Missing Ninja fallback strategy

**Impact**: 🟡 **MEDIUM** — Incomplete risk mitigation

**Fix Required**:

```diff
- ✅ **GN + Siso Build System**: Monolithic structure, automated gclient sync, patch application scripts
+ ✅ **GN + Siso Build System (with Ninja fallback)**: Monolithic structure, automated gclient sync, patch application scripts, fallback to Ninja if Siso unstable
```

---

## 2. TIMELINE FEASIBILITY ANALYSIS

### Phase 1 (Weeks 1-8): ✅ **REALISTIC**

**Analysis**: 8 weeks for privacy foundation is **achievable** given:

- Chromium fork setup: 1-2 weeks (gclient sync, build configuration)
- Brave adblock-rust integration: 1 week (proven library, battle-tested)
- Ed25519 + Merkle tree: 2 weeks (BoringSSL APIs well-documented)
- Consent fabric (basic): 2 weeks (Mojo IPC + React UI)
- SLSA Level 3: 1-2 weeks (Cosign, Rekor, CycloneDX tooling exists)

**Risk**: Week 1 milestone ("GN/Siso build working") **might slip** if Siso issues arise → **Mitigation**: Ninja fallback

**Recommendation**: ✅ Timeline realistic, minor buffer for Siso troubleshooting

---

### Phase 2 (Weeks 9-16): ⚠️ **AGGRESSIVE BUT ACHIEVABLE**

**Analysis**: 8 weeks for full AI platform is **tight** but achievable given:

- Ollama integration: 1 week (HTTP API straightforward)
- AI Overlay UI: 2 weeks (React sidebar + streaming responses)
- BYOM (GGUF import): 1 week (file upload + validation)
- MCP client: 2-3 weeks (stdio + HTTP+SSE transports, JSON-RPC 2.0)
- 3 native MCP servers: 1-2 weeks (tabs, bookmarks, history are simple APIs)
- Performance optimizations: 2 weeks (tab freezing, Chromium has APIs)

**Risk**: Week 14 "MCP integration" **might slip** if consent enforcement complex → **Mitigation**: Defer consent to per-tool (not per-invocation) initially

**Recommendation**: ⚠️ Add 1-week buffer or deprioritize cloud fallback (Week 13) to P1

---

### Phase 3 (Weeks 17-24): ⚠️ **TIGHT FOR ENTERPRISE PILOTS**

**Analysis**: 8 weeks for enterprise adoption is **very aggressive** given:

- MCP Server Manager UI: 2 weeks (React UI + npm/Docker installation scripts)
- Community MCP servers (5-10): **External dependency** (can't control)
- Enterprise policies: 2 weeks (Group Policy + MDM integration)
- Advanced workspaces: 2 weeks (persistent memory + isolation)
- Documentation site: 1-2 weeks (static site generator + content)

**Risk**: "5+ enterprise pilot deployments" **unrealistic** by Week 24 (6-12 month procurement cycles) → **Mitigation**: Per Issue #3, change to "5+ LOIs/POC agreements"

**Recommendation**: ⚠️ Start enterprise outreach **Week 1** (Phase 1), not Week 17

---

### Overall Timeline: ✅ **24 weeks to Beta is realistic** with caveats:

**Strengths**:

- 8-week phases align with 2-week sprints (4 sprints/phase)
- Clear dependencies (Phase 1 → Phase 2 → Phase 3)
- Success criteria measurable

**Weaknesses**:

- No buffer weeks (assumes zero slippage)
- Enterprise pilots unrealistic timeline (need 6+ months advance work)
- Community MCP servers external dependency (can't guarantee 5-10 by Week 24)

**Recommendation**: Add 2-week buffer per phase (30 weeks total, 7.5 months to Beta)

---

## 3. RISK ANALYSIS

### Risk #1: Chromium Upstream Breaking Changes

**Roadmap Says**: "2-week delay per milestone"

**Reality Check**:

- Chromium releases every **6 weeks** (milestone cadence)
- Phase 1 (8 weeks) = **1-2 Chromium milestones**
- Phase 2 (8 weeks) = **1-2 Chromium milestones**
- Phase 3 (8 weeks) = **1-2 Chromium milestones**
- **Total**: 3-6 Chromium milestones during MVP (high merge conflict risk)

**Analysis**: "2-week delay per milestone" is **optimistic**

**Recommendation**:

```diff
- | Chromium upstream breaking changes | 2-week delay per milestone | Nightly canary builds, pinned LKGR |
+ | Chromium upstream breaking changes | 2-4 weeks delay per milestone (6-week Chromium cadence) | Nightly canary builds, pinned LKGR, upstream sync automation (scripts/rebase.sh) |
```

**Mitigation Strategy**:

1. Minimize Chromium core patches (<5% codebase)
2. Use file overlays (`/chromium_src/`) instead of Git patches
3. Automated rebase testing (CI job per Chromium canary)
4. Budget 30-40% dev capacity for upstream sync (per PRD)

---

### Risk #2: Ollama Performance Issues

**Roadmap Says**: "30% user satisfaction drop"

**Reality Check**:

- Ollama is **beta software** (API changes every 1-2 months)
- Performance varies wildly by hardware (Llama 3.2 3B: 10-50 tokens/sec depending on GPU)
- Model downshifting (3B → 1B) degrades quality → users notice

**Analysis**: "30% satisfaction drop" is **understated** (could be 50%+ if Ollama breaks)

**Recommendation**:

```diff
- | Ollama performance issues | 30% user satisfaction drop | Model downshifting, cloud fallback, Transformers.js |
+ | Ollama performance issues | 50% user satisfaction drop (if Ollama API breaks or performance degrades) | Model downshifting (3B → 1B), cloud fallback (consent-gated), Transformers.js/WebLLM fallback, Ollama version pinning (v0.x.x) |
```

**Mitigation Strategy**:

1. Pin Ollama version in documentation (e.g., "Ollama v0.1.40 recommended")
2. Test against 3 Ollama versions (latest, latest-1, latest-2)
3. Add Ollama health check API (browser checks `localhost:11434/api/tags` on startup)
4. Fallback to Transformers.js if Ollama unavailable (already in roadmap)

---

### Risk #3: Community Adoption Slower Than Expected

**Roadmap Says**: "Delayed product-market fit"

**Reality Check**:

- Brave took **3 years** to reach 10M users (launched 2016, hit 10M in 2019)
- Arc browser took **2 years** to reach 1M users (invite-only strategy)
- Toubkal targets **10K users by Week 24** (6 months) = **very aggressive**

**Analysis**: "Delayed product-market fit" is **likely** (10K in 6 months is 2-3x faster than Brave/Arc)

**Recommendation**:

```diff
- | Community adoption slower than expected | Delayed product-market fit | Aggressive UX simplification, one-click Ollama installer |
+ | Community adoption slower than expected (10K users by Week 24 aggressive) | Delayed product-market fit, possible pivot to narrower niche (developers, privacy advocates) | Aggressive UX simplification, one-click Ollama installer, early HackerNews/Reddit outreach, influencer partnerships |
```

**Mitigation Strategy**:

1. Launch on HackerNews Show HN (Week 16, Alpha)
2. Influencer partnerships (privacy YouTubers, tech bloggers)
3. One-click Ollama installer (reduce setup friction)
4. Target narrower niche first (developers, privacy advocates) before general public

---

### Risk #4: Enterprise Procurement Cycles

**Roadmap Says**: "6-month sales delay"

**Reality Check**:

- Enterprise procurement: RFP (4-8 weeks) → POC (4-8 weeks) → legal/security review (4-12 weeks) → contract (4-8 weeks)
- **Total**: 16-36 weeks (4-9 months)
- Roadmap targets "5+ enterprise pilots by Week 24" = **unrealistic**

**Analysis**: "6-month delay" is **accurate** but success criteria need adjustment

**Recommendation**:

```diff
- | Enterprise procurement cycles | 6-month sales delay | Early pilot programs, compliance docs (SOC 2 roadmap) |
+ | Enterprise procurement cycles | 6-12 month sales delay (from first contact to signed contract) | Early pilot programs (start Week 1 outreach), compliance docs (SOC 2 roadmap), free 90-day enterprise trial, pre-qualify 10-15 leads by Week 8 |
```

**Success Criteria Adjustment** (per Issue #3):

```diff
- 5+ enterprise pilot deployments (50+ users each)
+ 5+ enterprise pilot LOIs/POC agreements by Week 24, with 2+ signed contracts by Month 9 (Week 36)
```

---

### Risk #5: MCP Protocol Evolution

**New Risk** (not in current roadmap):

**Problem**: MCP spec is evolving rapidly (2024-11-05 is latest, but breaking changes expected every 2-3 months)

**Impact**: 2-week integration updates per spec change (acknowledged in PRD)

**Recommendation**: Add to risk table:

```markdown
| MCP protocol breaking changes | 2-week integration update per spec change | Version negotiation (support multiple specs), subscribe to Anthropic MCP GitHub for updates, automated spec compliance tests |
```

---

## 4. MISSING SECTIONS

### Missing #1: Revenue Milestones

**Problem**: Roadmap lacks revenue/business milestones (PRD added Section 10: Business Model)

**Impact**: No alignment between product timeline and revenue targets

**Fix Required**: Add "Revenue Milestones" section:

```markdown
## Revenue Milestones

Aligned with PRD Section 10 (Business Model & Revenue Strategy):

| Milestone                  | Target Date        | Revenue Target  | Key Metric                    |
| -------------------------- | ------------------ | --------------- | ----------------------------- |
| First Enterprise Pilot     | Phase 3 (Week 20)  | $0 (free pilot) | 5 orgs, 50+ users each        |
| First Paid Customer        | Month 7 (Week 28)  | $15K ARR        | 1 org, 100 users, $150/user   |
| Profitability (Break-Even) | Month 18 (Week 72) | $500K ARR       | Cover 3 FTE engineers + infra |
| Series A Fundability       | Month 24 (Week 96) | $2M ARR         | 30%+ MoM growth, <$1M burn    |

**Phase-Specific Targets**:

- **Phase 1-2**: $0 revenue (focus: product-market fit)
- **Phase 3**: 5+ enterprise LOIs (Letters of Intent), $0 signed revenue
- **Post-Beta (Month 7+)**: First paid customer ($15K ARR)
```

---

### Missing #2: Internationalization Timeline

**Problem**: PRD added Section 11 (Internationalization) but roadmap doesn't include i18n milestones

**Impact**: No timeline for Spanish/French/German/Portuguese support

**Fix Required**: Add to Phase 2 or Phase 3:

```markdown
### Phase 2 (Optional Addition):

- ✅ **Internationalization (Phase 2)**: Spanish, French, German, Portuguese UI translations ($24K professional translations)

### Or Phase 3 (Recommended):

Week 18 | i18n support | 4 languages (ES, FR, DE, PT) live, 100% translation coverage
```

---

### Missing #3: Accessibility Timeline

**Problem**: PRD added Section 12 (Accessibility & WCAG) but roadmap doesn't include a11y milestones

**Impact**: No timeline for WCAG 2.1 Level AA compliance

**Fix Required**: Add to Phase 1:

```markdown
### Phase 1 Addition:

Week 7 | Accessibility baseline | WCAG 2.1 Level AA compliance (keyboard nav, screen readers, axe-core CI/CD)
```

Or as success criteria:

```diff
### Phase 1 Success Criteria:
+ Pass WCAG 2.1 Level AA automated tests (axe-core, Lighthouse 100/100)
+ Keyboard navigation functional for all features
```

---

### Missing #4: Privacy Policy & GDPR Timeline

**Problem**: PRD added Section 13 (Privacy Policy & GDPR) but roadmap doesn't include legal milestones

**Impact**: No timeline for privacy policy publication or legal review

**Fix Required**: Add to Phase 1:

```markdown
### Phase 1 Addition:

Week 5 | Privacy policy | Draft privacy policy (GDPR/CCPA/HIPAA compliant), legal review initiated ($7.5K)
Week 8 | Privacy policy published | toubkal://privacy live, user consent flow tested
```

---

## 5. RECOMMENDATIONS

### Pre-Phase 1 Fixes (Immediate)

| Priority  | Issue                             | Fix                                                    | Effort |
| --------- | --------------------------------- | ------------------------------------------------------ | ------ |
| 🔴 **P0** | #1: MCP spec version              | Change 2025-06-18 → 2024-11-05                         | 2 min  |
| 🔴 **P0** | #3: Enterprise pilot expectations | Add LOI/POC language, start outreach Week 1            | 5 min  |
| 🔴 **P0** | #7: Timeline dates                | Fix Phase 1-3 dates (Jan 2026 → Nov 2025 start)        | 10 min |
| 🟡 **P1** | #2: libsodium → BoringSSL         | Add "BoringSSL FIPS" to audit trail                    | 2 min  |
| 🟡 **P1** | #4: Chromium LTS                  | Fix "LTS releases" → "Stable tracking Extended Stable" | 2 min  |
| 🟡 **P1** | #5: Post-quantum crypto           | Kyber/Dilithium → ML-KEM/ML-DSA                        | 2 min  |
| 🟡 **P1** | #6: WebGPU performance            | Add "40-60% native perf"                               | 2 min  |
| 🟡 **P1** | #8: Siso fallback                 | Add "with Ninja fallback"                              | 2 min  |

**Total Effort**: 30 minutes

---

### Phase 1-3 Enhancements (During Development)

| Priority  | Enhancement                            | Target Phase       | Effort |
| --------- | -------------------------------------- | ------------------ | ------ |
| 🟡 **P1** | Add revenue milestones                 | Phase 3 planning   | 30 min |
| 🟡 **P1** | Add i18n timeline                      | Phase 2/3 planning | 15 min |
| 🟢 **P2** | Add a11y milestones                    | Phase 1 planning   | 15 min |
| 🟢 **P2** | Add privacy policy timeline            | Phase 1 planning   | 15 min |
| 🟢 **P2** | Expand risk table (MCP spec evolution) | Risk review        | 10 min |

---

## 6. SCORING BREAKDOWN

| Category             | Score | Rationale                                                    |
| -------------------- | ----- | ------------------------------------------------------------ |
| **Timeline Realism** | 4/5   | 24 weeks achievable, but tight; need 2-week buffer           |
| **Phase Structure**  | 5/5   | Clear Foundation → AI → Ecosystem progression                |
| **Success Criteria** | 4/5   | Measurable, but enterprise pilots unrealistic                |
| **PRD Consistency**  | 3/5   | 8 critical inconsistencies (MCP spec, crypto, dates)         |
| **Risk Management**  | 4/5   | Good risks identified, but underestimated (Chromium, Ollama) |
| **Completeness**     | 3.5/5 | Missing revenue, i18n, a11y, privacy policy timelines        |

**Overall**: ⭐⭐⭐⭐ (4/5) — **Solid roadmap with fixable issues**

---

## 7. FINAL VERDICT

**Ship Status**: ✅ **READY FOR PHASE 1 (after 30-minute fixes)**

The Product Roadmap is **well-structured** but needs alignment with updated PRD. Fix the 8 critical inconsistencies (30 min total) and it's production-ready.

**Immediate Actions** (Pre-Phase 1, Week 1):

1. ✅ Fix MCP spec version (2024-11-05)
2. ✅ Update enterprise pilot expectations (LOIs/POC)
3. ✅ Correct timeline dates (Nov 2025 start, not Jan 2026)
4. ✅ Add BoringSSL to audit trail
5. ✅ Fix Chromium LTS → Stable tracking Extended Stable
6. ✅ Update post-quantum crypto names (ML-KEM/ML-DSA)
7. ✅ Add WebGPU performance targets (40-60%)
8. ✅ Add Siso fallback mention

**Optional Enhancements** (Phase 1-3):

- Add revenue milestones (align with PRD Section 10)
- Add i18n timeline (4 languages by Phase 2/3)
- Add a11y milestones (WCAG 2.1 Level AA)
- Add privacy policy timeline (legal review Week 5)

---

**Document Version**: 1.0 (Pre-Fix)
**Last Updated**: 2025-10-18
**Next Review**: After P0/P1 fixes applied
