// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/ui/webui/flags/toubkal_flags_page.h"

#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_data_source.h"
#include "toubkal/browser/branding/branding_manager.h"

namespace toubkal {
namespace browser {

ToubkalFlagsPage::ToubkalFlagsPage(content::WebUI* web_ui)
    : WebUIController(web_ui) {
  // Create and set the data source
  content::WebUIDataSource* source = CreateFlagsDataSource().release();
  content::WebUIDataSource::Add(web_ui->GetWebContents()->GetBrowserContext(), source);
}

ToubkalFlagsPage::~ToubkalFlagsPage() = default;

void ToubkalFlagsPage::WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) {
  // Initialize the flags page when the frame is created
  InitializeFlagsPage();
  ApplyBranding();
}

std::unique_ptr<content::WebUIDataSource> ToubkalFlagsPage::CreateFlagsDataSource() {
  auto source = std::make_unique<content::WebUIDataSource>("toubkal-flags");

  // Set up the flags page HTML
  source->SetDefaultResource(
      R"(<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Toubkal Feature Flags</title>
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
      --toubkal-warning: #F59E0B;
      --toubkal-danger: #EF4444;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--toubkal-bg);
      color: var(--toubkal-text);
      line-height: 1.6;
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

    .warning {
      background: #FEF3C7;
      border: 1px solid #F59E0B;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      color: #92400E;
    }

    .warning h3 {
      color: #92400E;
      margin-bottom: 0.5rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .search-bar {
      background: var(--toubkal-card);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--toubkal-border);
      margin-bottom: 2rem;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--toubkal-border);
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--toubkal-primary);
    }

    .category-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .category-tab {
      background: var(--toubkal-card);
      border: 1px solid var(--toubkal-border);
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
    }

    .category-tab:hover {
      background: var(--toubkal-bg);
    }

    .category-tab.active {
      background: var(--toubkal-primary);
      color: white;
      border-color: var(--toubkal-primary);
    }

    .flags-grid {
      display: grid;
      gap: 1.5rem;
    }

    .flag-card {
      background: var(--toubkal-card);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--toubkal-border);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .flag-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .flag-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .flag-name {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--toubkal-primary);
      margin-bottom: 0.5rem;
    }

    .flag-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .flag-status.enabled {
      background: var(--toubkal-accent);
      color: white;
    }

    .flag-status.disabled {
      background: #EF4444;
      color: white;
    }

    .flag-status.default {
      background: var(--toubkal-border);
      color: var(--toubkal-text);
    }

    .flag-description {
      color: var(--toubkal-text-secondary);
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .flag-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .flag-select {
      padding: 0.5rem 1rem;
      border: 1px solid var(--toubkal-border);
      border-radius: 6px;
      background: white;
      font-size: 0.9rem;
      min-width: 120px;
    }

    .flag-button {
      background: var(--toubkal-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .flag-button:hover {
      background: var(--toubkal-secondary);
    }

    .flag-button.secondary {
      background: var(--toubkal-border);
      color: var(--toubkal-text);
    }

    .flag-button.secondary:hover {
      background: #D1D5DB;
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

    .reset-button {
      background: var(--toubkal-danger);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      margin-left: 1rem;
    }

    .reset-button:hover {
      background: #DC2626;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Toubkal Feature Flags</h1>
    <p>Enable or disable experimental features and settings</p>
  </div>

  <div class="container">
    <div class="warning">
      <h3>⚠️ Warning</h3>
      <p>
        Feature flags are experimental and may cause instability or security issues. 
        Only enable flags you understand and need. Changes require a browser restart.
      </p>
    </div>

    <div class="search-bar">
      <input type="text" class="search-input" id="search-input" placeholder="Search feature flags...">
    </div>

    <div class="category-tabs">
      <div class="category-tab active" data-category="all">All Flags</div>
      <div class="category-tab" data-category="toubkal">Toubkal Features</div>
      <div class="category-tab" data-category="privacy">Privacy</div>
      <div class="category-tab" data-category="ai">AI Features</div>
      <div class="category-tab" data-category="security">Security</div>
      <div class="category-tab" data-category="performance">Performance</div>
    </div>

    <div class="flags-grid" id="flags-grid">
      <!-- Toubkal AI Features -->
      <div class="flag-card" data-category="toubkal ai">
        <div class="flag-header">
          <div>
            <div class="flag-name">enable-toubkal-ai</div>
            <div class="flag-description">Enable Toubkal's local AI processing capabilities for privacy-first intelligent assistance.</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="enable-toubkal-ai">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('enable-toubkal-ai')">Apply</button>
        </div>
      </div>

      <!-- Privacy Features -->
      <div class="flag-card" data-category="toubkal privacy">
        <div class="flag-header">
          <div>
            <div class="flag-name">enable-toubkal-privacy</div>
            <div class="flag-description">Enable enhanced privacy protection features including fingerprinting protection and tracker blocking.</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="enable-toubkal-privacy">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('enable-toubkal-privacy')">Apply</button>
        </div>
      </div>

      <div class="flag-card" data-category="toubkal privacy">
        <div class="flag-header">
          <div>
            <div class="flag-name">enable-toubkal-audit</div>
            <div class="flag-description">Enable cryptographic audit logging for all privacy decisions and data access.</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="enable-toubkal-audit">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('enable-toubkal-audit')">Apply</button>
        </div>
      </div>

      <div class="flag-card" data-category="toubkal privacy">
        <div class="flag-header">
          <div>
            <div class="flag-name">enable-toubkal-consent</div>
            <div class="flag-description">Enable consent management system for granular privacy control.</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="enable-toubkal-consent">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('enable-toubkal-consent')">Apply</button>
        </div>
      </div>

      <!-- Branding -->
      <div class="flag-card" data-category="toubkal">
        <div class="flag-header">
          <div>
            <div class="flag-name">enable-toubkal-brand</div>
            <div class="flag-description">Enable Toubkal branding and custom URL scheme (toubkal://).</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="enable-toubkal-brand">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('enable-toubkal-brand')">Apply</button>
        </div>
      </div>

      <!-- Telemetry Control -->
      <div class="flag-card" data-category="privacy">
        <div class="flag-header">
          <div>
            <div class="flag-name">disable-telemetry</div>
            <div class="flag-description">Completely disable all telemetry and data collection.</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="disable-telemetry">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('disable-telemetry')">Apply</button>
        </div>
      </div>

      <div class="flag-card" data-category="privacy">
        <div class="flag-header">
          <div>
            <div class="flag-name">disable-crash-reporting</div>
            <div class="flag-description">Disable automatic crash reporting to maintain privacy.</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="disable-crash-reporting">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('disable-crash-reporting')">Apply</button>
        </div>
      </div>

      <div class="flag-card" data-category="privacy">
        <div class="flag-header">
          <div>
            <div class="flag-name">disable-usage-statistics</div>
            <div class="flag-description">Disable usage statistics collection for complete privacy.</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="disable-usage-statistics">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('disable-usage-statistics')">Apply</button>
        </div>
      </div>

      <!-- AI Features -->
      <div class="flag-card" data-category="ai">
        <div class="flag-header">
          <div>
            <div class="flag-name">enable-local-ai-processing</div>
            <div class="flag-description">Process AI requests locally without sending data to external servers.</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="enable-local-ai-processing">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('enable-local-ai-processing')">Apply</button>
        </div>
      </div>

      <div class="flag-card" data-category="ai">
        <div class="flag-header">
          <div>
            <div class="flag-name">enable-ai-suggestions</div>
            <div class="flag-description">Enable intelligent browsing suggestions powered by local AI.</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="enable-ai-suggestions">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('enable-ai-suggestions')">Apply</button>
        </div>
      </div>

      <!-- Security Features -->
      <div class="flag-card" data-category="security">
        <div class="flag-header">
          <div>
            <div class="flag-name">enable-enhanced-security</div>
            <div class="flag-description">Enable enhanced security features including strict CSP and trusted types.</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="enable-enhanced-security">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('enable-enhanced-security')">Apply</button>
        </div>
      </div>

      <div class="flag-card" data-category="security">
        <div class="flag-header">
          <div>
            <div class="flag-name">enable-cryptographic-verification</div>
            <div class="flag-description">Enable cryptographic verification for all privacy decisions and audit logs.</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="enable-cryptographic-verification">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('enable-cryptographic-verification')">Apply</button>
        </div>
      </div>

      <!-- Performance Features -->
      <div class="flag-card" data-category="performance">
        <div class="flag-header">
          <div>
            <div class="flag-name">enable-performance-optimizations</div>
            <div class="flag-description">Enable performance optimizations for faster browsing.</div>
          </div>
          <div class="flag-status enabled">Enabled</div>
        </div>
        <div class="flag-controls">
          <select class="flag-select" data-flag="enable-performance-optimizations">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <button class="flag-button" onclick="updateFlag('enable-performance-optimizations')">Apply</button>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 2rem;">
      <button class="flag-button" onclick="applyAllChanges()">Apply All Changes</button>
      <button class="reset-button" onclick="resetAllFlags()">Reset All Flags</button>
    </div>
  </div>

  <div class="footer">
    <p>Toubkal Browser - Experimental features and settings</p>
    <p>
      <a href="toubkal://about">About</a> |
      <a href="toubkal://settings">Settings</a> |
      <a href="toubkal://help">Help</a>
    </p>
  </div>

  <script>
    // Flag management
    class ToubkalFlags {
      constructor() {
        this.flags = {};
        this.loadFlags();
        this.bindEvents();
      }

      loadFlags() {
        // Load flags from storage
        const saved = localStorage.getItem('toubkal-flags');
        if (saved) {
          this.flags = JSON.parse(saved);
        }
        this.updateUI();
      }

      saveFlags() {
        // Save flags to storage
        localStorage.setItem('toubkal-flags', JSON.stringify(this.flags));
      }

      updateUI() {
        // Update flag selectors
        document.querySelectorAll('.flag-select').forEach(select => {
          const flagName = select.dataset.flag;
          if (this.flags[flagName]) {
            select.value = this.flags[flagName];
          }
        });
      }

      bindEvents() {
        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => {
          this.filterFlags(e.target.value);
        });

        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
          tab.addEventListener('click', (e) => {
            this.switchCategory(e.target.dataset.category);
          });
        });
      }

      filterFlags(searchTerm) {
        const cards = document.querySelectorAll('.flag-card');
        cards.forEach(card => {
          const name = card.querySelector('.flag-name').textContent.toLowerCase();
          const description = card.querySelector('.flag-description').textContent.toLowerCase();
          const matches = name.includes(searchTerm.toLowerCase()) || 
                         description.includes(searchTerm.toLowerCase());
          card.style.display = matches ? 'block' : 'none';
        });
      }

      switchCategory(category) {
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(tab => {
          tab.classList.toggle('active', tab.dataset.category === category);
        });

        // Filter flags
        const cards = document.querySelectorAll('.flag-card');
        cards.forEach(card => {
          if (category === 'all') {
            card.style.display = 'block';
          } else {
            const cardCategory = card.dataset.category;
            const matches = cardCategory.includes(category);
            card.style.display = matches ? 'block' : 'none';
          }
        });
      }

      updateFlag(flagName) {
        const select = document.querySelector(`[data-flag="${flagName}"]`);
        if (select) {
          this.flags[flagName] = select.value;
          this.saveFlags();
          this.updateFlagStatus(flagName, select.value);
        }
      }

      updateFlagStatus(flagName, value) {
        const card = document.querySelector(`[data-flag="${flagName}"]`).closest('.flag-card');
        const status = card.querySelector('.flag-status');
        status.textContent = value === 'enabled' ? 'Enabled' : 'Disabled';
        status.className = `flag-status ${value === 'enabled' ? 'enabled' : 'disabled'}`;
      }
    }

    // Global functions
    function updateFlag(flagName) {
      if (window.toubkalFlags) {
        window.toubkalFlags.updateFlag(flagName);
      }
    }

    function applyAllChanges() {
      if (window.toubkalFlags) {
        // Apply all flag changes
        document.querySelectorAll('.flag-select').forEach(select => {
          const flagName = select.dataset.flag;
          window.toubkalFlags.updateFlag(flagName);
        });
        alert('All flag changes applied! Browser restart required.');
      }
    }

    function resetAllFlags() {
      if (confirm('Are you sure you want to reset all flags to their default values?')) {
        localStorage.removeItem('toubkal-flags');
        location.reload();
      }
    }

    // Initialize flags when page loads
    document.addEventListener('DOMContentLoaded', () => {
      window.toubkalFlags = new ToubkalFlags();
    });
  </script>
</body>
</html>)");

  return source;
}

void ToubkalFlagsPage::InitializeFlagsPage() {
  // Initialize the flags page with current flag states
}

std::string ToubkalFlagsPage::GetFeatureFlags() {
  return "All Toubkal feature flags available";
}

std::string ToubkalFlagsPage::GetFlagCategories() {
  return "Toubkal, Privacy, AI, Security, Performance";
}

void ToubkalFlagsPage::HandleFlagChange(const std::string& flag_name, const std::string& flag_value) {
  // Handle flag changes
}

void ToubkalFlagsPage::ApplyBranding() {
  // Apply Toubkal branding to the flags page
  // This ensures all text and UI elements are properly branded
}

}  // namespace browser
}  // namespace toubkal
