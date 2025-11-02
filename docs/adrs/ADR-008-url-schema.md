# ADR-008: Custom URL Scheme (`toubkal://`)

**Status**: Accepted
**Date**: 2025-10-18
**Deciders**: Ilyass Motya, Engineering Team
**Technical Story**: [Story 1.5: Brand Identity Implementation](../stories/phase1-week1-2/story-004-brand-identity.md)

---

## Context

Toubkal is a Chromium fork, and by default inherits the `chrome://` URL scheme for internal browser pages (settings, extensions, flags, etc.). This creates several problems:

**Problem**: Users cannot visually distinguish Toubkal from Chrome, leading to brand confusion and potential legal risks.

**Requirements**:

- Toubkal must have a distinct brand identity visible in the browser UI
- Internal pages must be clearly branded as Toubkal, not Chrome
- Users typing `chrome://settings` should still work (backward compatibility)
- Extensions that reference `chrome://` URLs should not break
- Implementation must be completed in Phase 1 (Week 2) for MVP

**Constraints**:

- Must remain compatible with Chromium's URL handling architecture
- Cannot break existing Chrome extension APIs
- Must work across all platforms (Windows, macOS, Linux)
- Legal: Cannot infringe on Chrome trademark

---

## Decision Drivers

- **Brand Identity** (Critical) - Users must immediately recognize they're using Toubkal
- **Legal Safety** (Critical) - Avoid Chrome trademark issues
- **User Experience** (High) - Professional appearance builds trust
- **Developer Experience** (Medium) - Minimal changes to Chromium fork
- **Backward Compatibility** (Medium) - Chrome extensions should work with minimal changes
- **Marketing** (High) - "First browser with toubkal://" messaging opportunity

---

## Considered Options

### Summary Table

| Option                        | Brand Identity | Legal Safety | Dev Experience | Backward Compat | Verdict       |
| ----------------------------- | -------------- | ------------ | -------------- | --------------- | ------------- |
| Option 1: Keep `chrome://`    | ⭐             | ⭐           | ⭐⭐⭐⭐       | ⭐⭐⭐⭐        | ❌ Rejected   |
| Option 2: Custom `toubkal://` | ⭐⭐⭐⭐       | ⭐⭐⭐⭐     | ⭐⭐⭐         | ⭐⭐⭐          | ✅ **Chosen** |
| Option 3: Generic `app://`    | ⭐⭐           | ⭐⭐⭐⭐     | ⭐⭐⭐         | ⭐⭐⭐          | ❌ Rejected   |

---

### Option 1: Keep `chrome://` Scheme

**Description**: No changes - continue using Chromium's `chrome://` scheme.

**Pros**:

- ✅ Zero implementation effort
- ✅ Full backward compatibility with Chrome extensions
- ✅ No risk of breaking existing Chromium code

**Cons**:

- ❌ No brand differentiation (users think it's Chrome)
- ❌ Legal risk (Chrome is a Google trademark)
- ❌ Unprofessional appearance ("just a Chrome clone")
- ❌ No marketing value ("why not just use Chrome?")

**Verdict**: ❌ **Rejected** - Fails critical brand identity requirement

---

### Option 2: Custom `toubkal://` Scheme

**Description**: Register `toubkal://` as a custom URL scheme, redirect `chrome://` → `toubkal://` for compatibility.

**Pros**:

- ✅ Strong brand identity (visible in address bar)
- ✅ Legal safety (no Chrome trademark infringement)
- ✅ Professional appearance (users know they're using Toubkal)
- ✅ Proven pattern (Brave uses `brave://`, Edge uses `edge://`)
- ✅ Marketing opportunity ("Toubkal browser with toubkal:// URLs")
- ✅ Backward compatibility via auto-redirect

**Cons**:

- ❌ Requires 1-2 days implementation effort (URL registration + redirect logic)
- ❌ Extensions hard-coding `chrome://` URLs need feature detection

**Verdict**: ✅ **Chosen** - Best balance of branding, safety, and effort

---

### Option 3: Generic `app://` Scheme

**Description**: Use a generic `app://` scheme (no branding).

**Pros**:

- ✅ Legal safety (no trademark issues)
- ✅ Simple, neutral naming

**Cons**:

- ❌ No brand identity (could be any browser)
- ❌ Not memorable or distinctive
- ❌ Same implementation effort as `toubkal://`

**Verdict**: ❌ **Rejected** - No advantage over `toubkal://`, less branding value

---

## Decision Outcome

**Chosen Option**: **Option 2 - Custom `toubkal://` Scheme**

**Rationale**:

1. **Proven Pattern**: Brave (`brave://`) and Edge (`edge://`) successfully use custom schemes, demonstrating this is a standard practice for Chromium forks.
2. **Low Cost, High Impact**: Only 1-2 days implementation time for significant brand visibility.
3. **Legal Safety**: Eliminates Chrome trademark concerns completely.
4. **User Confidence**: Professional branding increases trust ("this is Toubkal, not a Chrome knockoff").
5. **MVP-Critical**: Branding must be complete before first public demo (Phase 1, Week 2).

---

## Consequences

### Positive Consequences

- ✅ **Brand Visibility**: Users see `toubkal://` in address bar on every internal page
- ✅ **Professional Appearance**: Distinguishes Toubkal from generic Chromium forks
- ✅ **Legal Protection**: No risk of Google trademark infringement
- ✅ **Marketing Advantage**: Can advertise "Toubkal browser with toubkal:// URLs"
- ✅ **User Clarity**: No confusion about which browser they're using

### Negative Consequences

- ❌ **Implementation Time**: Requires 1-2 days development in Phase 1
- ❌ **Extension Compatibility**: Extensions hard-coding `chrome://` may need updates (mitigated by auto-redirect)
- ❌ **Documentation Updates**: All docs must use `toubkal://` consistently

### Neutral Consequences

- 🔹 **New Internal Pages**: Can create Toubkal-specific pages (`toubkal://audit`, `toubkal://ai`)
- 🔹 **OS Registration**: Must register `toubkal://` scheme with operating systems
- 🔹 **URL Scheme Ownership**: Toubkal owns the `toubkal://` namespace (can add new pages at will)

### Security Considerations

**URL Validation**:

- All `toubkal://` URLs must be validated to prevent injection attacks
- Whitelist allowed hosts (settings, audit, ai, mcp, consent, flags, version, etc.)
- Reject malformed URLs or unknown hosts

**CSP (Content Security Policy)**:

- All `toubkal://` pages must enforce strict CSP headers
- Prevent inline scripts and unsafe-eval (XSS protection)
- See [ADR-007: UI Security](ADR-007-ui-security.md) for full CSP policy

**Example CSP Header** for `toubkal://` pages:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self' ws://localhost:* http://localhost:*;
  frame-ancestors 'none';
```

**Access Control**:

- Internal `toubkal://` pages should only be accessible from browser UI
- Block external navigation to `toubkal://` from web pages (security boundary)
- Enforce origin checks for Mojo IPC calls from `toubkal://` pages
- Implement URL scheme isolation to prevent privilege escalation
- Rate limit URL scheme access to prevent DoS attacks

**URL Scheme Hardening**:

- Validate all URL parameters and fragments for malicious input
- Implement URL canonicalization to prevent bypass attempts
- Log all URL scheme access for security auditing
- Implement URL scheme-specific security policies per internal page

---

## Implementation

### Timeline

- **Phase 1, Week 2 (Days 8-10)**: URL scheme implementation
  - Day 1: Register `toubkal://` scheme, implement redirect logic
  - Day 2: Update internal pages, test all platforms
  - Day 3: Documentation updates, extension compatibility testing

### File Locations

```
/src/toubkal/browser/url/
├── url_scheme_registration.h
├── url_scheme_registration.cc
├── url_redirect_handler.h
├── url_redirect_handler.cc
└── BUILD.gn

/src/toubkal/browser/resources/
├── settings/ (updated to use toubkal://)
├── extensions/ (updated to use toubkal://)
└── about/ (updated to use toubkal://)
```

### Key Classes/Functions

**URL Scheme Registration** (`url_scheme_registration.h`):

```cpp
// /src/toubkal/browser/url/url_scheme_registration.h
#ifndef TOUBKAL_BROWSER_URL_URL_SCHEME_REGISTRATION_H_
#define TOUBKAL_BROWSER_URL_URL_SCHEME_REGISTRATION_H_

#include "url/url_util.h"

namespace toubkal {

// Registers the "toubkal://" URL scheme with Chromium's URL parser.
// This must be called during browser initialization before any URL parsing.
void RegisterToubkalURLScheme();

// Returns true if the given URL uses the "toubkal://" scheme.
bool IsToubkalURL(const GURL& url);

}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_URL_URL_SCHEME_REGISTRATION_H_
```

**URL Scheme Registration** (`url_scheme_registration.cc`):

```cpp
// /src/toubkal/browser/url/url_scheme_registration.cc
#include "toubkal/browser/url/url_scheme_registration.h"

#include "base/logging.h"
#include "url/url_util.h"

namespace toubkal {

void RegisterToubkalURLScheme() {
  // Register "toubkal" as a standard scheme (like "http" or "chrome")
  url::AddStandardScheme("toubkal", url::SCHEME_WITH_HOST);

  // Mark as secure (allows HTTPS-like behavior for WebUI)
  url::AddSecureScheme("toubkal");

  // Mark as local (no network requests)
  url::AddLocalScheme("toubkal");

  // Allow empty document for iframe embedding
  url::AddEmptyDocumentScheme("toubkal");

  // Mark as web-displayable (can be shown in address bar)
  url::AddWebDisplayableScheme("toubkal");

  LOG(INFO) << "Registered toubkal:// URL scheme";
}

bool IsToubkalURL(const GURL& url) {
  return url.is_valid() && url.SchemeIs("toubkal");
}

}  // namespace toubkal
```

**Auto-Redirect Handler** (`url_redirect_handler.h`):

```cpp
// /src/toubkal/browser/url/url_redirect_handler.h
#ifndef TOUBKAL_BROWSER_URL_URL_REDIRECT_HANDLER_H_
#define TOUBKAL_BROWSER_URL_URL_REDIRECT_HANDLER_H_

#include "url/gurl.h"

namespace toubkal {

// Redirects legacy chrome:// URLs to toubkal:// equivalents.
// Examples:
//   chrome://settings → toubkal://settings
//   chrome://flags?search=ai → toubkal://flags?search=ai
//   toubkal://audit → toubkal://audit (no change)
GURL RedirectChromeURLToToubkal(const GURL& url);

// Returns true if the URL is a legacy chrome:// URL that should be redirected.
bool ShouldRedirectToToubkal(const GURL& url);

}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_URL_URL_REDIRECT_HANDLER_H_
```

**Auto-Redirect Handler** (`url_redirect_handler.cc`):

```cpp
// /src/toubkal/browser/url/url_redirect_handler.cc
#include "toubkal/browser/url/url_redirect_handler.h"

#include "base/logging.h"
#include "base/strings/string_util.h"

namespace toubkal {

GURL RedirectChromeURLToToubkal(const GURL& url) {
  if (!url.is_valid() || !url.SchemeIs("chrome")) {
    return url;  // Not a chrome:// URL, return as-is
  }

  // Build toubkal:// equivalent
  std::string new_url = "toubkal://" + url.host();

  // Preserve path (e.g., /privacy in chrome://settings/privacy)
  if (url.has_path()) {
    new_url += url.path();
  }

  // Preserve query parameters (e.g., ?search=ai in chrome://flags?search=ai)
  if (url.has_query()) {
    new_url += "?" + url.query();
  }

  // Preserve fragment (e.g., #appearance in chrome://settings#appearance)
  if (url.has_ref()) {
    new_url += "#" + url.ref();
  }

  GURL result(new_url);
  DCHECK(result.is_valid()) << "Invalid redirect URL: " << new_url;

  LOG(INFO) << "Redirected " << url.spec() << " → " << result.spec();

  return result;
}

bool ShouldRedirectToToubkal(const GURL& url) {
  return url.is_valid() && url.SchemeIs("chrome");
}

}  // namespace toubkal
```

**Browser Integration Hook** (`toubkal_browser_main_parts.cc`):

```cpp
// /src/toubkal/browser/toubkal_browser_main_parts.cc
#include "toubkal/browser/url/url_scheme_registration.h"

void ToubkalBrowserMainParts::PreMainMessageLoopStart() {
  // Register toubkal:// scheme during browser startup
  toubkal::RegisterToubkalURLScheme();

  // ... other initialization ...
}
```

**Navigation Redirect Logic** (`toubkal_content_browser_client.cc`):

```cpp
// /src/toubkal/browser/toubkal_content_browser_client.cc
#include "toubkal/browser/url/url_redirect_handler.h"

bool ToubkalContentBrowserClient::WillCreateURLLoaderFactory(
    content::BrowserContext* browser_context,
    content::RenderFrameHost* frame,
    int render_process_id,
    URLLoaderFactoryType type,
    const url::Origin& request_initiator,
    std::optional<int64_t> navigation_id,
    ukm::SourceIdObj ukm_source_id,
    mojo::PendingReceiver<network::mojom::URLLoaderFactory>* factory_receiver,
    mojo::PendingRemote<network::mojom::TrustedURLLoaderHeaderClient>*
        header_client,
    bool* bypass_redirect_checks,
    bool* disable_secure_dns,
    network::mojom::URLLoaderFactoryOverridePtr* factory_override,
    scoped_refptr<base::SequencedTaskRunner> navigation_response_task_runner) {

  // Intercept chrome:// navigations and redirect to toubkal://
  if (navigation_id.has_value()) {
    GURL request_url = frame->GetLastCommittedURL();
    if (toubkal::ShouldRedirectToToubkal(request_url)) {
      GURL redirect_url = toubkal::RedirectChromeURLToToubkal(request_url);
      frame->GetRenderViewHost()->Send(
          new ToubkalViewMsg_Redirect(frame->GetRoutingID(), redirect_url));
    }
  }

  return false;
}
```

### URL Mappings

| User Types            | Browser Displays       | Page                            |
| --------------------- | ---------------------- | ------------------------------- |
| `chrome://settings`   | `toubkal://settings`   | Browser settings                |
| `chrome://flags`      | `toubkal://flags`      | Feature flags                   |
| `chrome://version`    | `toubkal://version`    | Version info                    |
| `chrome://extensions` | `toubkal://extensions` | Extension management            |
| N/A                   | `toubkal://audit`      | **New**: Transparency Dashboard |
| N/A                   | `toubkal://ai`         | **New**: AI settings            |
| N/A                   | `toubkal://mcp`        | **New**: MCP server management  |
| N/A                   | `toubkal://consent`    | **New**: Consent history        |

### Operating System Registration

To allow users to open `toubkal://` URLs from external applications (email clients, chat apps, etc.), the browser must register the custom URL scheme with the operating system.

**Windows Registry** (`installer/windows/toubkal_url_scheme.reg`):

```registry
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\toubkal]
@="URL:Toubkal Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\toubkal\DefaultIcon]
@="C:\\Program Files\\Toubkal\\toubkal.exe,0"

[HKEY_CLASSES_ROOT\toubkal\shell]

[HKEY_CLASSES_ROOT\toubkal\shell\open]

[HKEY_CLASSES_ROOT\toubkal\shell\open\command]
@="\"C:\\Program Files\\Toubkal\\toubkal.exe\" \"%1\""
```

**macOS Info.plist** (`Toubkal.app/Contents/Info.plist`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleURLTypes</key>
  <array>
    <dict>
      <key>CFBundleURLName</key>
      <string>Toubkal URL</string>
      <key>CFBundleURLSchemes</key>
      <array>
        <string>toubkal</string>
      </array>
      <key>CFBundleTypeRole</key>
      <string>Viewer</string>
    </dict>
  </array>
</dict>
</plist>
```

**Linux Desktop Entry** (`/usr/share/applications/toubkal.desktop`):

```ini
[Desktop Entry]
Version=1.0
Name=Toubkal Browser
Exec=/usr/bin/toubkal %U
Terminal=false
Type=Application
Icon=toubkal
Categories=Network;WebBrowser;
MimeType=x-scheme-handler/toubkal;
```

### Build Integration

**GN Build File** (`/src/toubkal/browser/url/BUILD.gn`):

```python
# Build file for Toubkal URL scheme registration

source_set("url") {
  sources = [
    "url_scheme_registration.cc",
    "url_scheme_registration.h",
    "url_redirect_handler.cc",
    "url_redirect_handler.h",
  ]

  deps = [
    "//base",
    "//url",
    "//content/public/browser",
  ]

  public_deps = [
    "//url",
  ]
}

source_set("url_unittests") {
  testonly = true

  sources = [
    "url_redirect_handler_unittest.cc",
  ]

  deps = [
    ":url",
    "//base",
    "//testing/gtest",
    "//url",
  ]
}
```

**Integration with Main Browser** (`/src/toubkal/browser/BUILD.gn`):

```python
source_set("browser") {
  sources = [
    "toubkal_browser_main_parts.cc",
    "toubkal_browser_main_parts.h",
    "toubkal_content_browser_client.cc",
    "toubkal_content_browser_client.h",
    # ... other sources ...
  ]

  deps = [
    "//toubkal/browser/url",  # Add URL scheme dependency
    "//base",
    "//content/public/browser",
    # ... other deps ...
  ]
}
```

## Dependencies

**Chromium Libraries**:

- `//url` - URL parsing and scheme registration (core Chromium URL library)
- `//content/public/browser` - Browser URL handling and navigation
- `//chrome/browser/ui` - Internal page UI (rebrand to Toubkal)
- `//base` - Chromium base library (logging, string utilities, DCHECK)

**Toubkal Components**:

- `/toubkal/browser/ui/` - All internal pages must use `toubkal://`
- `/toubkal/common/` - Shared constants for URL scheme
- `/toubkal/browser/` - Main browser integration points

---

## Validation

### How to Verify This Decision

**Manual Tests**:

1. Navigate to `chrome://settings` → verify browser shows `toubkal://settings`
2. Check address bar displays `toubkal://` (not `chrome://`)
3. Open `toubkal://audit` → verify Transparency Dashboard loads
4. Test extension using `chrome://` URL → verify auto-redirect works

**Automated Tests**:

```cpp
// /src/toubkal/browser/url/url_redirect_handler_unittest.cc
#include "toubkal/browser/url/url_redirect_handler.h"

#include "testing/gtest/include/gtest/gtest.h"
#include "url/gurl.h"

namespace toubkal {

class URLRedirectHandlerTest : public testing::Test {
 protected:
  void SetUp() override {
    // Test setup if needed
  }
};

TEST_F(URLRedirectHandlerTest, RedirectsChromeToToubkal) {
  GURL chrome_url("chrome://settings");
  GURL result = RedirectChromeURLToToubkal(chrome_url);
  EXPECT_EQ(result.spec(), "toubkal://settings");
  EXPECT_TRUE(result.is_valid());
}

TEST_F(URLRedirectHandlerTest, PreservesToubkalURLs) {
  GURL toubkal_url("toubkal://audit");
  GURL result = RedirectChromeURLToToubkal(toubkal_url);
  EXPECT_EQ(result.spec(), "toubkal://audit");  // No change
}

TEST_F(URLRedirectHandlerTest, PreservesPathInRedirect) {
  GURL chrome_url("chrome://settings/privacy");
  GURL result = RedirectChromeURLToToubkal(chrome_url);
  EXPECT_EQ(result.spec(), "toubkal://settings/privacy");
}

TEST_F(URLRedirectHandlerTest, PreservesQueryParameters) {
  GURL chrome_url("chrome://flags?search=ai");
  GURL result = RedirectChromeURLToToubkal(chrome_url);
  EXPECT_EQ(result.spec(), "toubkal://flags?search=ai");
}

TEST_F(URLRedirectHandlerTest, PreservesFragment) {
  GURL chrome_url("chrome://settings#appearance");
  GURL result = RedirectChromeURLToToubkal(chrome_url);
  EXPECT_EQ(result.spec(), "toubkal://settings#appearance");
}

TEST_F(URLRedirectHandlerTest, PreservesComplexURL) {
  GURL chrome_url("chrome://settings/privacy?highlight=cookies#safe-browsing");
  GURL result = RedirectChromeURLToToubkal(chrome_url);
  EXPECT_EQ(result.spec(), "toubkal://settings/privacy?highlight=cookies#safe-browsing");
}

TEST_F(URLRedirectHandlerTest, HandlesInvalidURL) {
  GURL invalid_url("not-a-valid-url");
  GURL result = RedirectChromeURLToToubkal(invalid_url);
  EXPECT_EQ(result, invalid_url);  // Returns original if invalid
}

TEST_F(URLRedirectHandlerTest, ShouldRedirectReturnsTrueForChromeURL) {
  GURL chrome_url("chrome://version");
  EXPECT_TRUE(ShouldRedirectToToubkal(chrome_url));
}

TEST_F(URLRedirectHandlerTest, ShouldRedirectReturnsFalseForToubkalURL) {
  GURL toubkal_url("toubkal://audit");
  EXPECT_FALSE(ShouldRedirectToToubkal(toubkal_url));
}

TEST_F(URLRedirectHandlerTest, ShouldRedirectReturnsFalseForHTTPURL) {
  GURL http_url("https://example.com");
  EXPECT_FALSE(ShouldRedirectToToubkal(http_url));
}

}  // namespace toubkal
```

**Integration Tests** (E2E with Playwright):

```typescript
// /src/toubkal/tests/e2e/url_scheme.spec.ts
import { test, expect } from '@playwright/test'

test.describe('URL Scheme Redirection', () => {
  test('redirects chrome://settings to toubkal://settings', async ({ page }) => {
    await page.goto('chrome://settings')

    // Verify address bar shows toubkal://
    await expect(page).toHaveURL(/^toubkal:\/\/settings/)

    // Verify page title contains "Toubkal"
    await expect(page).toHaveTitle(/Toubkal Settings/)
  })

  test('toubkal://audit loads Transparency Dashboard', async ({ page }) => {
    await page.goto('toubkal://audit')

    // Verify URL is correct
    await expect(page).toHaveURL('toubkal://audit')

    // Verify dashboard content
    await expect(page.locator('h1')).toContainText('Transparency Dashboard')
  })

  test('preserves query parameters during redirect', async ({ page }) => {
    await page.goto('chrome://flags?search=ai')

    // Verify redirect preserves query
    await expect(page).toHaveURL('toubkal://flags?search=ai')

    // Verify search parameter is applied
    const searchInput = page.locator('input[type="search"]')
    await expect(searchInput).toHaveValue('ai')
  })

  test('all internal pages use toubkal:// scheme', async ({ page }) => {
    const internalPages = [
      'settings',
      'flags',
      'version',
      'extensions',
      'audit',
      'ai',
      'mcp',
      'consent',
    ]

    for (const pageName of internalPages) {
      await page.goto(`toubkal://${pageName}`)
      await expect(page).toHaveURL(new RegExp(`^toubkal://${pageName}`))
    }
  })
})
```

**Performance Tests**:

```bash
# Verify redirect overhead is minimal (CI/CD)
# Expected: <5ms redirect latency

# Test 1: Measure redirect time
time curl -I "chrome://settings" 2>&1 | grep "toubkal://"

# Test 2: Verify no memory leaks during redirects
valgrind --leak-check=full ./toubkal --test-redirect-loop
```

**Metrics**:

- **Redirect Coverage**: 100% of chrome:// URLs successfully redirect to toubkal://
- **Internal Page Accessibility**: 100% of internal pages accessible via toubkal://
- **Broken Links**: Zero broken links in browser UI (verified by automated link checker)
- **Extension Compatibility**: 95%+ of Chrome extensions work without modification (tested on top 100 extensions)
- **Redirect Latency**: <5ms per redirect (measured in unit tests)
- **Memory Overhead**: Zero memory leaks from redirect logic (verified by Valgrind)
- **Cross-Platform**: 100% pass rate on Windows, macOS, Linux (CI/CD validation)

---

## Related ADRs

- [ADR-002: Browser Engine](ADR-002-browser-engine.md) - Chromium fork provides base URL infrastructure
- [ADR-001: UI Framework](ADR-001-ui-framework.md) - React UI for internal pages uses `toubkal://` URLs

---

## Related Epics

This ADR is implemented by the following epic:

- **[Epic 1.2: Brand Identity & Internal Pages](../epics/epic-1.2-brand-identity.md)** (Week 5-6)
  - Implements `toubkal://` URL scheme registration
  - Creates `chrome://` → `toubkal://` auto-redirect
  - Implements internal pages: `toubkal://settings`, `toubkal://about`, `toubkal://version`
  - Creates React dashboards: `toubkal://audit`, `toubkal://consent`
  - Establishes WebUI controllers for all `toubkal://` pages

---

## References

- [PRD: Brand Identity Features](../TOUBKAL-PRD.md#brand-identity--user-experience-features-p0)
- [Architecture Overview: URL Scheme](../ARCHITECTURE-OVERVIEW.md#brand-identity--url-scheme)
- [Product Roadmap: Phase 1 Week 2](../PRODUCT-ROADMAP.md#phase-1-foundation-weeks-1-8)
- [Brave Browser URL Scheme](https://github.com/brave/brave-browser/wiki/Custom-URL-Scheme)
- [Chromium URL Scheme Documentation](https://www.chromium.org/developers/design-documents/url-handling/)

---

## Changelog

| Date       | Change          | Author       |
| ---------- | --------------- | ------------ |
| 2025-10-18 | Initial version | Ilyass Motya |

```

***
```
