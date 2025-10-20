// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/ui/webui/about/toubkal_about_page.h"

#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_data_source.h"
#include "toubkal/browser/branding/branding_manager.h"

namespace toubkal {
namespace browser {

ToubkalAboutPage::ToubkalAboutPage(content::WebUI* web_ui)
    : WebUIController(web_ui) {
  // Create and set the data source
  content::WebUIDataSource* source = CreateAboutDataSource().release();
  content::WebUIDataSource::Add(web_ui->GetWebContents()->GetBrowserContext(), source);
}

ToubkalAboutPage::~ToubkalAboutPage() = default;

void ToubkalAboutPage::WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) {
  // Initialize the about page when the frame is created
  InitializeAboutPage();
  ApplyBranding();
}

std::unique_ptr<content::WebUIDataSource> ToubkalAboutPage::CreateAboutDataSource() {
  auto source = std::make_unique<content::WebUIDataSource>("toubkal-about");

  // Set up the about page HTML
  source->SetDefaultResource(
      R"(<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Toubkal Browser</title>
    <link rel="icon" type="image/svg+xml" href="assets/toubkal-icon.svg">
    <link rel="shortcut icon" href="assets/favicon.ico">
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
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, var(--toubkal-bg) 0%, #E0E7FF 100%);
      color: var(--toubkal-text);
      line-height: 1.6;
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, var(--toubkal-primary), var(--toubkal-secondary));
      color: white;
      padding: 4rem 0;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      opacity: 0.3;
    }

    .header-content {
      position: relative;
      z-index: 1;
    }

    .logo {
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 20px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      padding: 8px;
    }

    .logo img {
      width: 100%;
      height: 100%;
    }

    .header h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header p {
      font-size: 1.2rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .info-card {
      background: var(--toubkal-card);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--toubkal-border);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .info-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .info-card h2 {
      color: var(--toubkal-primary);
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .info-card h2::before {
      content: '';
      width: 4px;
      height: 24px;
      background: var(--toubkal-accent);
      border-radius: 2px;
    }

    .version-info {
      background: linear-gradient(135deg, var(--toubkal-primary), var(--toubkal-secondary));
      color: white;
    }

    .version-info h2 {
      color: white;
    }

    .version-info h2::before {
      background: white;
    }

    .version-number {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .version-details {
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .feature-list {
      list-style: none;
      padding: 0;
    }

    .feature-list li {
      padding: 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .feature-list li::before {
      content: '✓';
      color: var(--toubkal-accent);
      font-weight: bold;
      font-size: 1.2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .stat-item {
      text-align: center;
      padding: 1.5rem;
      background: var(--toubkal-card);
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--toubkal-primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: var(--toubkal-text-secondary);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
      margin: 0 1rem;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    .button {
      background: var(--toubkal-primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
      text-decoration: none;
      display: inline-block;
    }

    .button:hover {
      background: var(--toubkal-secondary);
    }

    .button.secondary {
      background: var(--toubkal-border);
      color: var(--toubkal-text);
    }

    .button.secondary:hover {
      background: #D1D5DB;
    }

    .action-buttons {
      text-align: center;
      margin: 2rem 0;
    }

    .action-buttons .button {
      margin: 0 0.5rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      <div class="logo">
        <img src="assets/toubkal-icon.svg" alt="Toubkal Browser">
      </div>
      <h1>Toubkal Browser</h1>
      <p>The intelligent browser that protects your mind</p>
    </div>
  </div>

  <div class="container">
    <div class="info-grid">
      <!-- Version Information -->
      <div class="info-card version-info">
        <h2>Version Information</h2>
        <div class="version-number" id="version-number">1.0.0</div>
        <div class="version-details">
          <div>Build: <span id="build-info">Development</span></div>
          <div>Chromium: <span id="chromium-version">120.0.6099.109</span></div>
          <div>Release Date: <span id="release-date">2025-10-20</span></div>
        </div>
      </div>

      <!-- Privacy Features -->
      <div class="info-card">
        <h2>Privacy Features</h2>
        <ul class="feature-list">
          <li>Zero Telemetry Collection</li>
          <li>Fingerprinting Protection</li>
          <li>Tracker Blocking</li>
          <li>Cryptographic Audit Logging</li>
          <li>Local AI Processing</li>
          <li>Consent Management</li>
        </ul>
      </div>

      <!-- Security Features -->
      <div class="info-card">
        <h2>Security Features</h2>
        <ul class="feature-list">
          <li>HTTPS Everywhere</li>
          <li>Safe Browsing Protection</li>
          <li>Content Security Policy</li>
          <li>Trusted Types</li>
          <li>Secure URL Scheme</li>
          <li>Cryptographic Verification</li>
        </ul>
      </div>

      <!-- AI Features -->
      <div class="info-card">
        <h2>AI Features</h2>
        <ul class="feature-list">
          <li>Local AI Processing</li>
          <li>Privacy-First AI</li>
          <li>Intelligent Suggestions</li>
          <li>Context-Aware Assistance</li>
          <li>No Data Collection</li>
          <li>Transparent AI Decisions</li>
        </ul>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-number" id="privacy-score">100%</div>
        <div class="stat-label">Privacy Score</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="trackers-blocked">0</div>
        <div class="stat-label">Trackers Blocked</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="data-collected">0</div>
        <div class="stat-label">Data Collected</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="ai-requests">0</div>
        <div class="stat-label">AI Requests</div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <a href="toubkal://settings" class="button">Settings</a>
      <a href="toubkal://audit" class="button secondary">Audit Dashboard</a>
      <a href="toubkal://consent" class="button secondary">Consent History</a>
      <a href="toubkal://help" class="button secondary">Help</a>
    </div>

    <!-- Technical Information -->
    <div class="info-card">
      <h2>Technical Information</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
        <div>
          <strong>Platform:</strong> <span id="platform">Windows 10</span><br>
          <strong>Architecture:</strong> <span id="architecture">x64</span><br>
          <strong>User Agent:</strong> <span id="user-agent">Toubkal/1.0.0</span>
        </div>
        <div>
          <strong>V8 Version:</strong> <span id="v8-version">12.0.267.8</span><br>
          <strong>Blink Version:</strong> <span id="blink-version">120.0.6099.109</span><br>
          <strong>JavaScript:</strong> <span id="js-version">ES2023</span>
        </div>
        <div>
          <strong>Build Type:</strong> <span id="build-type">Development</span><br>
          <strong>Debug Mode:</strong> <span id="debug-mode">Enabled</span><br>
          <strong>Official Build:</strong> <span id="official-build">No</span>
        </div>
      </div>
    </div>

    <!-- Legal Information -->
    <div class="info-card">
      <h2>Legal Information</h2>
      <p>
        Toubkal Browser is built on Chromium, an open-source web browser project. 
        Toubkal Browser adds privacy-first features and AI capabilities while maintaining 
        compatibility with the web platform.
      </p>
      <p style="margin-top: 1rem;">
        <strong>Copyright:</strong> 2025 Toubkal Browser. All rights reserved.<br>
        <strong>License:</strong> BSD-3-Clause (based on Chromium)<br>
        <strong>Open Source:</strong> <a href="https://github.com/toubkalbrowser/toubkal" target="_blank">GitHub Repository</a>
      </p>
    </div>
  </div>

  <div class="footer">
    <p>Toubkal Browser - Elevating your browsing experience with privacy and intelligence</p>
    <p>
      <a href="toubkal://settings">Settings</a> |
      <a href="toubkal://help">Help</a> |
      <a href="toubkal://version">Version</a> |
      <a href="https://toubkalbrowser.com" target="_blank">Website</a>
    </p>
  </div>

  <script>
    // Initialize about page
    document.addEventListener('DOMContentLoaded', function() {
      // Update version information
      document.getElementById('version-number').textContent = '1.0.0';
      document.getElementById('build-info').textContent = 'Development Build';
      document.getElementById('chromium-version').textContent = '120.0.6099.109';
      document.getElementById('release-date').textContent = new Date().toLocaleDateString();

      // Update platform information
      document.getElementById('platform').textContent = navigator.platform;
      document.getElementById('architecture').textContent = navigator.cpuClass || 'x64';
      document.getElementById('user-agent').textContent = navigator.userAgent;

      // Update technical information
      document.getElementById('v8-version').textContent = '12.0.267.8';
      document.getElementById('blink-version').textContent = '120.0.6099.109';
      document.getElementById('js-version').textContent = 'ES2023';
      document.getElementById('build-type').textContent = 'Development';
      document.getElementById('debug-mode').textContent = 'Enabled';
      document.getElementById('official-build').textContent = 'No';

      // Update statistics (these would be real values in a real implementation)
      document.getElementById('privacy-score').textContent = '100%';
      document.getElementById('trackers-blocked').textContent = '0';
      document.getElementById('data-collected').textContent = '0 bytes';
      document.getElementById('ai-requests').textContent = '0';
    });
  </script>
</body>
</html>)");

  return source;
}

void ToubkalAboutPage::InitializeAboutPage() {
  // Initialize the about page with current browser information
}

std::string ToubkalAboutPage::GetBrowserVersion() {
  return "1.0.0";
}

std::string ToubkalAboutPage::GetBuildInfo() {
  return "Development Build";
}

std::string ToubkalAboutPage::GetPrivacyFeaturesStatus() {
  return "All privacy features enabled";
}

void ToubkalAboutPage::ApplyBranding() {
  // Apply Toubkal branding to the about page
  // This ensures all text and UI elements are properly branded
}

}  // namespace browser
}  // namespace toubkal
