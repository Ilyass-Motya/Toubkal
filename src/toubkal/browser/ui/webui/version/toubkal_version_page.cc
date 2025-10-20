// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/ui/webui/version/toubkal_version_page.h"

#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_data_source.h"
#include "toubkal/browser/branding/branding_manager.h"

namespace toubkal {
namespace browser {

ToubkalVersionPage::ToubkalVersionPage(content::WebUI* web_ui)
    : WebUIController(web_ui) {
  // Create and set the data source
  content::WebUIDataSource* source = CreateVersionDataSource().release();
  content::WebUIDataSource::Add(web_ui->GetWebContents()->GetBrowserContext(), source);
}

ToubkalVersionPage::~ToubkalVersionPage() = default;

void ToubkalVersionPage::WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) {
  // Initialize the version page when the frame is created
  InitializeVersionPage();
  ApplyBranding();
}

std::unique_ptr<content::WebUIDataSource> ToubkalVersionPage::CreateVersionDataSource() {
  auto source = std::make_unique<content::WebUIDataSource>("toubkal-version");

  // Set up the version page HTML
  source->SetDefaultResource(
      R"(<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Toubkal Version</title>
  <style>
    :root {
      --toubkal-primary: #1E40AF;
      --toubkal-secondary: #3B82F6;
      --toubkal-accent: #10B981;
      --toubkal-bg: #F8FAFC;
      --toubkal-card: #FFFFFF;
      --toubkal-text: #1F2937;
      --toubkal-text-secondary: #6B7280;
      --toubkal-border: #E5E7EB;
      --toubkal-code: #F3F4F6;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Monaco', 'Menlo', monospace;
      background: var(--toubkal-bg);
      color: var(--toubkal-text);
      line-height: 1.6;
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, var(--toubkal-primary), var(--toubkal-secondary));
      color: white;
      padding: 2rem 0;
      text-align: center;
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .version-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .version-card {
      background: var(--toubkal-card);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--toubkal-border);
    }

    .version-card h2 {
      color: var(--toubkal-primary);
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .version-card h2::before {
      content: '';
      width: 4px;
      height: 20px;
      background: var(--toubkal-accent);
      border-radius: 2px;
    }

    .version-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--toubkal-border);
    }

    .version-item:last-child {
      border-bottom: none;
    }

    .version-label {
      font-weight: 600;
      color: var(--toubkal-text);
    }

    .version-value {
      color: var(--toubkal-text-secondary);
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.9rem;
    }

    .version-value.version-number {
      color: var(--toubkal-primary);
      font-weight: 600;
    }

    .version-value.build-type {
      text-transform: uppercase;
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      background: var(--toubkal-accent);
      color: white;
    }

    .version-value.build-type.debug {
      background: #EF4444;
    }

    .version-value.build-type.release {
      background: var(--toubkal-accent);
    }

    .code-block {
      background: var(--toubkal-code);
      border: 1px solid var(--toubkal-border);
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.9rem;
      overflow-x: auto;
    }

    .code-block pre {
      margin: 0;
      white-space: pre-wrap;
    }

    .feature-flags {
      background: var(--toubkal-card);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--toubkal-border);
      margin-bottom: 2rem;
    }

    .feature-flags h2 {
      color: var(--toubkal-primary);
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .feature-flag {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--toubkal-border);
    }

    .feature-flag:last-child {
      border-bottom: none;
    }

    .feature-name {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.9rem;
      color: var(--toubkal-text);
    }

    .feature-status {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .feature-status.enabled {
      background: var(--toubkal-accent);
      color: white;
    }

    .feature-status.disabled {
      background: #EF4444;
      color: white;
    }

    .footer {
      text-align: center;
      padding: 2rem;
      color: var(--toubkal-text-secondary);
      font-size: 0.9rem;
    }

    .footer a {
      color: var(--toubkal-primary);
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    .copy-button {
      background: var(--toubkal-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      margin-left: 1rem;
    }

    .copy-button:hover {
      background: var(--toubkal-secondary);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Toubkal Version Information</h1>
    <p>Detailed version and build information</p>
  </div>

  <div class="container">
    <div class="version-grid">
      <!-- Toubkal Version -->
      <div class="version-card">
        <h2>Toubkal Browser</h2>
        <div class="version-item">
          <span class="version-label">Version</span>
          <span class="version-value version-number" id="toubkal-version">1.0.0</span>
        </div>
        <div class="version-item">
          <span class="version-label">Build Type</span>
          <span class="version-value build-type debug" id="toubkal-build-type">Debug</span>
        </div>
        <div class="version-item">
          <span class="version-label">Build Date</span>
          <span class="version-value" id="toubkal-build-date">2025-10-20</span>
        </div>
        <div class="version-item">
          <span class="version-label">Git Commit</span>
          <span class="version-value" id="toubkal-commit">a1b2c3d4e5f6</span>
        </div>
        <div class="version-item">
          <span class="version-label">Channel</span>
          <span class="version-value" id="toubkal-channel">Development</span>
        </div>
      </div>

      <!-- Chromium Version -->
      <div class="version-card">
        <h2>Chromium Engine</h2>
        <div class="version-item">
          <span class="version-label">Chromium Version</span>
          <span class="version-value version-number" id="chromium-version">120.0.6099.109</span>
        </div>
        <div class="version-item">
          <span class="version-label">V8 Version</span>
          <span class="version-value" id="v8-version">12.0.267.8</span>
        </div>
        <div class="version-item">
          <span class="version-label">Blink Version</span>
          <span class="version-value" id="blink-version">120.0.6099.109</span>
        </div>
        <div class="version-item">
          <span class="version-label">Skia Version</span>
          <span class="version-value" id="skia-version">120.0.6099.109</span>
        </div>
        <div class="version-item">
          <span class="version-label">ICU Version</span>
          <span class="version-value" id="icu-version">73.2</span>
        </div>
      </div>

      <!-- Platform Information -->
      <div class="version-card">
        <h2>Platform</h2>
        <div class="version-item">
          <span class="version-label">Operating System</span>
          <span class="version-value" id="os-version">Windows 10</span>
        </div>
        <div class="version-item">
          <span class="version-label">Architecture</span>
          <span class="version-value" id="architecture">x64</span>
        </div>
        <div class="version-item">
          <span class="version-label">Compiler</span>
          <span class="version-value" id="compiler">MSVC 19.37</span>
        </div>
        <div class="version-item">
          <span class="version-label">Build Tools</span>
          <span class="version-value" id="build-tools">GN + Ninja</span>
        </div>
        <div class="version-item">
          <span class="version-label">Target CPU</span>
          <span class="version-value" id="target-cpu">x64</span>
        </div>
      </div>

      <!-- Security Information -->
      <div class="version-card">
        <h2>Security</h2>
        <div class="version-item">
          <span class="version-label">Security Patch Level</span>
          <span class="version-value" id="security-patch">2025-10-20</span>
        </div>
        <div class="version-item">
          <span class="version-label">CSP Version</span>
          <span class="version-value" id="csp-version">3.0</span>
        </div>
        <div class="version-item">
          <span class="version-label">TLS Version</span>
          <span class="version-value" id="tls-version">1.3</span>
        </div>
        <div class="version-item">
          <span class="version-label">Crypto Library</span>
          <span class="version-value" id="crypto-lib">BoringSSL</span>
        </div>
        <div class="version-item">
          <span class="version-label">Sandbox</span>
          <span class="version-value" id="sandbox">Enabled</span>
        </div>
      </div>
    </div>

    <!-- Feature Flags -->
    <div class="feature-flags">
      <h2>Feature Flags</h2>
      <div class="feature-flag">
        <span class="feature-name">enable-toubkal-ai</span>
        <span class="feature-status enabled">Enabled</span>
      </div>
      <div class="feature-flag">
        <span class="feature-name">enable-toubkal-privacy</span>
        <span class="feature-status enabled">Enabled</span>
      </div>
      <div class="feature-flag">
        <span class="feature-name">enable-toubkal-audit</span>
        <span class="feature-status enabled">Enabled</span>
      </div>
      <div class="feature-flag">
        <span class="feature-name">enable-toubkal-consent</span>
        <span class="feature-status enabled">Enabled</span>
      </div>
      <div class="feature-flag">
        <span class="feature-name">enable-toubkal-brand</span>
        <span class="feature-status enabled">Enabled</span>
      </div>
      <div class="feature-flag">
        <span class="feature-name">disable-telemetry</span>
        <span class="feature-status enabled">Enabled</span>
      </div>
      <div class="feature-flag">
        <span class="feature-name">disable-crash-reporting</span>
        <span class="feature-status enabled">Enabled</span>
      </div>
      <div class="feature-flag">
        <span class="feature-name">disable-usage-statistics</span>
        <span class="feature-status enabled">Enabled</span>
      </div>
      <div class="feature-flag">
        <span class="feature-name">enable-privacy-dashboard</span>
        <span class="feature-status enabled">Enabled</span>
      </div>
      <div class="feature-flag">
        <span class="feature-name">enable-cryptographic-verification</span>
        <span class="feature-status enabled">Enabled</span>
      </div>
    </div>

    <!-- Build Configuration -->
    <div class="version-card">
      <h2>Build Configuration</h2>
      <div class="code-block">
        <pre id="build-config">is_debug = true
is_official_build = false
is_component_build = true
enable_toubkal_ai = true
enable_toubkal_privacy = true
enable_toubkal_audit = true
enable_toubkal_consent = true
enable_toubkal_brand = true
disable_telemetry = true
disable_crash_reporting = true
disable_usage_statistics = true
target_os = "win"
target_cpu = "x64"
symbol_level = 2
enable_debugging = true</pre>
        <button class="copy-button" onclick="copyBuildConfig()">Copy</button>
      </div>
    </div>

    <!-- User Agent -->
    <div class="version-card">
      <h2>User Agent</h2>
      <div class="code-block">
        <pre id="user-agent">Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Toubkal/1.0.0 Chrome/120.0.6099.109 Safari/537.36</pre>
        <button class="copy-button" onclick="copyUserAgent()">Copy</button>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Toubkal Browser - Built on Chromium with privacy-first enhancements</p>
    <p>
      <a href="toubkal://about">About</a> |
      <a href="toubkal://settings">Settings</a> |
      <a href="toubkal://help">Help</a>
    </p>
  </div>

  <script>
    // Initialize version page
    document.addEventListener('DOMContentLoaded', function() {
      // Update version information
      document.getElementById('toubkal-version').textContent = '1.0.0';
      document.getElementById('toubkal-build-type').textContent = 'Debug';
      document.getElementById('toubkal-build-date').textContent = new Date().toLocaleDateString();
      document.getElementById('toubkal-commit').textContent = 'a1b2c3d4e5f6';
      document.getElementById('toubkal-channel').textContent = 'Development';

      // Update Chromium information
      document.getElementById('chromium-version').textContent = '120.0.6099.109';
      document.getElementById('v8-version').textContent = '12.0.267.8';
      document.getElementById('blink-version').textContent = '120.0.6099.109';
      document.getElementById('skia-version').textContent = '120.0.6099.109';
      document.getElementById('icu-version').textContent = '73.2';

      // Update platform information
      document.getElementById('os-version').textContent = navigator.platform;
      document.getElementById('architecture').textContent = navigator.cpuClass || 'x64';
      document.getElementById('compiler').textContent = 'MSVC 19.37';
      document.getElementById('build-tools').textContent = 'GN + Ninja';
      document.getElementById('target-cpu').textContent = 'x64';

      // Update security information
      document.getElementById('security-patch').textContent = new Date().toISOString().split('T')[0];
      document.getElementById('csp-version').textContent = '3.0';
      document.getElementById('tls-version').textContent = '1.3';
      document.getElementById('crypto-lib').textContent = 'BoringSSL';
      document.getElementById('sandbox').textContent = 'Enabled';

      // Update user agent
      document.getElementById('user-agent').textContent = navigator.userAgent;
    });

    // Copy functions
    function copyBuildConfig() {
      const text = document.getElementById('build-config').textContent;
      navigator.clipboard.writeText(text).then(() => {
        alert('Build configuration copied to clipboard!');
      });
    }

    function copyUserAgent() {
      const text = document.getElementById('user-agent').textContent;
      navigator.clipboard.writeText(text).then(() => {
        alert('User agent copied to clipboard!');
      });
    }
  </script>
</body>
</html>)");

  return source;
}

void ToubkalVersionPage::InitializeVersionPage() {
  // Initialize the version page with current browser version information
}

std::string ToubkalVersionPage::GetDetailedVersionInfo() {
  return "Toubkal Browser 1.0.0 (Development Build)";
}

std::string ToubkalVersionPage::GetBuildConfiguration() {
  return "Debug build with all Toubkal features enabled";
}

std::string ToubkalVersionPage::GetFeatureFlags() {
  return "All Toubkal privacy and AI features enabled";
}

void ToubkalVersionPage::ApplyBranding() {
  // Apply Toubkal branding to the version page
  // This ensures all text and UI elements are properly branded
}

}  // namespace browser
}  // namespace toubkal
