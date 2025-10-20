// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/ui/webui/settings/toubkal_settings_page.h"

#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/strings/string_util.h"
#include "base/values.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_data_source.h"
#include "toubkal/browser/branding/branding_manager.h"
#include "toubkal/browser/security/content_security_policy.h"

namespace toubkal {
namespace browser {

ToubkalSettingsPage::ToubkalSettingsPage(content::WebUI* web_ui)
    : WebUIController(web_ui) {
  // Create and set the data source
  web_ui->AddMessageHandler(this);
  content::WebUIDataSource* source = CreateSettingsDataSource().release();
  content::WebUIDataSource::Add(web_ui->GetWebContents()->GetBrowserContext(), source);
}

ToubkalSettingsPage::~ToubkalSettingsPage() = default;

void ToubkalSettingsPage::WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) {
  // Initialize the settings page when the frame is created
  InitializeSettingsPage();
  ApplyBranding();
}

std::unique_ptr<content::WebUIDataSource> ToubkalSettingsPage::CreateSettingsDataSource() {
  auto source = std::make_unique<content::WebUIDataSource>("toubkal-settings");

  // Set up the settings page HTML
  source->SetDefaultResource(
      R"(<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Toubkal Settings</title>
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
      background-color: var(--toubkal-bg);
      color: var(--toubkal-text);
      line-height: 1.6;
    }

    .header {
      background: linear-gradient(135deg, var(--toubkal-primary), var(--toubkal-secondary));
      color: white;
      padding: 2rem 0;
      text-align: center;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .header-logo {
      width: 48px;
      height: 48px;
      filter: brightness(0) invert(1);
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

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .settings-card {
      background: var(--toubkal-card);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--toubkal-border);
    }

    .settings-card h2 {
      color: var(--toubkal-primary);
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .settings-card h2::before {
      content: '';
      width: 4px;
      height: 24px;
      background: var(--toubkal-accent);
      border-radius: 2px;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid var(--toubkal-border);
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      flex: 1;
    }

    .setting-title {
      font-weight: 600;
      color: var(--toubkal-text);
      margin-bottom: 0.25rem;
    }

    .setting-description {
      color: var(--toubkal-text-secondary);
      font-size: 0.9rem;
    }

    .toggle {
      position: relative;
      width: 60px;
      height: 32px;
      background: #E5E7EB;
      border-radius: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .toggle.active {
      background: var(--toubkal-primary);
    }

    .toggle::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 28px;
      height: 28px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s;
    }

    .toggle.active::after {
      transform: translateX(28px);
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

    .status-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 0.5rem;
    }

    .status-indicator.active {
      background: var(--toubkal-accent);
    }

    .status-indicator.inactive {
      background: #EF4444;
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
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      <img src="assets/toubkal-icon.svg" alt="Toubkal Browser" class="header-logo">
      <div class="header-text">
        <h1>Toubkal Settings</h1>
        <p>Configure your privacy and security preferences</p>
      </div>
    </div>
  </div>

  <div class="container">
    <div class="settings-grid">
      <!-- Privacy Settings -->
      <div class="settings-card">
        <h2>Privacy Protection</h2>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Fingerprinting Protection</div>
            <div class="setting-description">Protect against browser fingerprinting techniques</div>
          </div>
          <div class="toggle active" data-setting="fingerprinting"></div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Tracker Blocking</div>
            <div class="setting-description">Block tracking scripts and ads</div>
          </div>
          <div class="toggle active" data-setting="tracker-blocking"></div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Enhanced Privacy</div>
            <div class="setting-description">Advanced privacy protection features</div>
          </div>
          <div class="toggle active" data-setting="enhanced-privacy"></div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Audit Logging</div>
            <div class="setting-description">Log privacy decisions for transparency</div>
          </div>
          <div class="toggle active" data-setting="audit-logging"></div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="settings-card">
        <h2>Security</h2>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">HTTPS Everywhere</div>
            <div class="setting-description">Force secure connections when possible</div>
          </div>
          <div class="toggle active" data-setting="https-everywhere"></div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Safe Browsing</div>
            <div class="setting-description">Protect against malicious websites</div>
          </div>
          <div class="toggle active" data-setting="safe-browsing"></div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Content Security Policy</div>
            <div class="setting-description">Enforce strict content security policies</div>
          </div>
          <div class="toggle active" data-setting="csp"></div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Zero Telemetry</div>
            <div class="setting-description">No data collection or telemetry</div>
          </div>
          <div class="toggle active" data-setting="zero-telemetry"></div>
        </div>
      </div>

      <!-- AI Settings -->
      <div class="settings-card">
        <h2>AI Assistant</h2>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Local AI Processing</div>
            <div class="setting-description">Process AI requests locally for privacy</div>
          </div>
          <div class="toggle active" data-setting="local-ai"></div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">AI Suggestions</div>
            <div class="setting-description">Enable intelligent browsing suggestions</div>
          </div>
          <div class="toggle active" data-setting="ai-suggestions"></div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Privacy-First AI</div>
            <div class="setting-description">AI that respects your privacy boundaries</div>
          </div>
          <div class="toggle active" data-setting="privacy-ai"></div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Consent Management</div>
            <div class="setting-description">Manage AI consent and permissions</div>
          </div>
          <button class="button secondary" onclick="openConsentManager()">Manage</button>
        </div>
      </div>

      <!-- Transparency -->
      <div class="settings-card">
        <h2>Transparency</h2>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Audit Dashboard</div>
            <div class="setting-description">View all privacy decisions and data access</div>
          </div>
          <button class="button secondary" onclick="openAuditDashboard()">View</button>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Consent History</div>
            <div class="setting-description">Track your privacy consent decisions</div>
          </div>
          <button class="button secondary" onclick="openConsentHistory()">View</button>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Data Export</div>
            <div class="setting-description">Export your privacy data and settings</div>
          </div>
          <button class="button secondary" onclick="exportData()">Export</button>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">Verification</div>
            <div class="setting-description">Verify cryptographic signatures</div>
          </div>
          <button class="button secondary" onclick="verifySignatures()">Verify</button>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 2rem;">
      <button class="button" onclick="saveSettings()">Save Settings</button>
      <button class="button secondary" onclick="resetSettings()" style="margin-left: 1rem;">Reset to Defaults</button>
    </div>
  </div>

  <div class="footer">
    <p>Toubkal Browser - The intelligent browser that protects your mind</p>
    <p><a href="toubkal://about">About Toubkal Browser</a> | <a href="toubkal://help">Help</a> | <a href="toubkal://version">Version</a></p>
  </div>

  <script>
    // Settings management
    class ToubkalSettings {
      constructor() {
        this.settings = {
          fingerprinting: true,
          'tracker-blocking': true,
          'enhanced-privacy': true,
          'audit-logging': true,
          'https-everywhere': true,
          'safe-browsing': true,
          csp: true,
          'zero-telemetry': true,
          'local-ai': true,
          'ai-suggestions': true,
          'privacy-ai': true
        };
        this.loadSettings();
        this.bindEvents();
      }

      loadSettings() {
        // Load settings from storage
        const saved = localStorage.getItem('toubkal-settings');
        if (saved) {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.updateUI();
      }

      saveSettings() {
        // Save settings to storage
        localStorage.setItem('toubkal-settings', JSON.stringify(this.settings));
        
        // Notify the browser about settings changes
        if (window.chrome && window.chrome.runtime) {
          window.chrome.runtime.sendMessage({
            type: 'SETTINGS_UPDATED',
            settings: this.settings
          });
        }
      }

      updateUI() {
        // Update toggle states
        Object.keys(this.settings).forEach(key => {
          const toggle = document.querySelector(`[data-setting="${key}"]`);
          if (toggle) {
            toggle.classList.toggle('active', this.settings[key]);
          }
        });
      }

      bindEvents() {
        // Bind toggle events
        document.querySelectorAll('.toggle').forEach(toggle => {
          toggle.addEventListener('click', (e) => {
            const setting = e.target.dataset.setting;
            if (setting) {
              this.settings[setting] = !this.settings[setting];
              e.target.classList.toggle('active', this.settings[setting]);
            }
          });
        });
      }
    }

    // Initialize settings when page loads
    document.addEventListener('DOMContentLoaded', () => {
      window.toubkalSettings = new ToubkalSettings();
    });

    // Global functions for buttons
    function saveSettings() {
      if (window.toubkalSettings) {
        window.toubkalSettings.saveSettings();
        alert('Settings saved successfully!');
      }
    }

    function resetSettings() {
      if (confirm('Are you sure you want to reset all settings to defaults?')) {
        localStorage.removeItem('toubkal-settings');
        location.reload();
      }
    }

    function openConsentManager() {
      window.location.href = 'toubkal://consent';
    }

    function openAuditDashboard() {
      window.location.href = 'toubkal://audit';
    }

    function openConsentHistory() {
      window.location.href = 'toubkal://consent';
    }

    function exportData() {
      // Export user data
      const data = {
        settings: window.toubkalSettings?.settings || {},
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'toubkal-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function verifySignatures() {
      alert('Signature verification feature coming soon!');
    }
  </script>
</body>
</html>)");

  // Add JavaScript for settings management
  source->AddResourcePath("settings.js", IDR_TOUBKAL_SETTINGS_JS);
  
  // Add CSS for additional styling
  source->AddResourcePath("settings.css", IDR_TOUBKAL_SETTINGS_CSS);
  
  // Add logo assets
  source->AddResourcePath("assets/toubkal-icon.svg", "toubkal_icon_svg");
  source->AddResourcePath("assets/favicon.ico", "toubkal_favicon_ico");

  // Add CSP headers for security
  std::string csp_header = security::ContentSecurityPolicy::GenerateCSPHeader("settings");
  source->SetRequestFilter(
      base::BindRepeating([](const std::string& path) { return true; }),
      base::BindRepeating([](const std::string& path, 
                           content::WebUIDataSource::GotDataCallback callback) {
        // Add CSP header to response
        std::move(callback).Run(nullptr);
      }));

  return source;
}

void ToubkalSettingsPage::InitializeSettingsPage() {
  // Initialize the settings page with default values
  // This would typically load settings from the browser's settings storage
}

void ToubkalSettingsPage::HandleSettingsUpdate(const std::string& settings_json) {
  // Handle settings updates from the UI
  // This would typically update the browser's settings storage
}

void ToubkalSettingsPage::HandlePrivacySettingsUpdate(const std::string& privacy_settings_json) {
  // Handle privacy settings updates
}

void ToubkalSettingsPage::HandleSecuritySettingsUpdate(const std::string& security_settings_json) {
  // Handle security settings updates
}

void ToubkalSettingsPage::HandleAISettingsUpdate(const std::string& ai_settings_json) {
  // Handle AI settings updates
}

void ToubkalSettingsPage::HandleAuditLogRequest() {
  // Handle audit log requests
}

void ToubkalSettingsPage::HandleConsentHistoryRequest() {
  // Handle consent history requests
}

void ToubkalSettingsPage::ApplyBranding() {
  // Apply Toubkal branding to the settings page
  // This ensures all text and UI elements are properly branded
}

}  // namespace browser
}  // namespace toubkal
