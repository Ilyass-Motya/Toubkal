// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/branding/branding_integration.h"

#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"
#include "content/public/browser/web_contents.h"
#include "toubkal/browser/branding/branding_manager.h"
#include "toubkal/browser/branding/window_title_manager.h"

namespace toubkal {
namespace branding {

void BrandingIntegration::Initialize() {
  BrandingManager::Initialize();
}

void BrandingIntegration::ApplyBrandingToWebContents(content::WebContents* web_contents) {
  if (!web_contents) {
    return;
  }

  // Update window title
  std::string current_title = web_contents->GetTitle();
  if (!current_title.empty()) {
    UpdateWindowTitle(web_contents, current_title);
  }

  // Replace Chrome references in page content
  ReplaceChromeReferencesInPage(web_contents);

  // Check if this is an internal page
  std::string url = web_contents->GetURL().spec();
  if (IsInternalPage(url)) {
    ApplyInternalPageBranding(web_contents);
  }

  // Inject branding CSS and JS
  InjectBrandingCSS(web_contents);
  InjectBrandingJS(web_contents);
}

void BrandingIntegration::UpdateWindowTitle(content::WebContents* web_contents, 
                                           const std::string& title) {
  if (!web_contents) {
    return;
  }

  std::string branded_title = WindowTitleManager::GetTitleForPage(title);
  web_contents->UpdateTitleForEntry(web_contents->GetController().GetActiveEntry(), 
                                   base::UTF8ToUTF16(branded_title));
}

void BrandingIntegration::ReplaceChromeReferencesInPage(content::WebContents* web_contents) {
  if (!web_contents) {
    return;
  }

  // This would typically involve injecting JavaScript to replace text content
  // For now, we'll just ensure the window title is properly branded
  std::string current_title = web_contents->GetTitle();
  if (BrandingManager::ContainsChromeReferences(current_title)) {
    std::string branded_title = BrandingManager::ReplaceChromeReferences(current_title);
    web_contents->UpdateTitleForEntry(web_contents->GetController().GetActiveEntry(),
                                     base::UTF8ToUTF16(branded_title));
  }
}

bool BrandingIntegration::ShouldRebrandUrl(const std::string& url) {
  return base::StartsWith(url, "chrome://", base::CompareCase::INSENSITIVE_ASCII);
}

std::string BrandingIntegration::GetRebrandedUrl(const std::string& url) {
  if (!ShouldRebrandUrl(url)) {
    return url;
  }

  return base::ReplaceFirstSubstringAfterOffset(url, 0, "chrome://", "toubkal://");
}

void BrandingIntegration::ApplyInternalPageBranding(content::WebContents* web_contents) {
  if (!web_contents) {
    return;
  }

  std::string url = web_contents->GetURL().spec();
  std::string page_name = GetInternalPageName(url);
  
  if (!page_name.empty()) {
    ApplySpecificInternalPageBranding(web_contents, page_name);
  }
}

void BrandingIntegration::InjectBrandingCSS(content::WebContents* web_contents) {
  if (!web_contents) {
    return;
  }

  // CSS for Toubkal branding
  std::string css = R"(
    /* Toubkal Browser Branding CSS */
    .toubkal-branding {
      --toubkal-primary: #1E40AF;
      --toubkal-secondary: #3B82F6;
      --toubkal-accent: #10B981;
    }
    
    .toubkal-logo {
      background-image: url('toubkal://resources/logo.svg');
      background-size: contain;
      background-repeat: no-repeat;
    }
    
    .toubkal-title {
      color: var(--toubkal-primary);
      font-weight: 600;
    }
  )";

  // Inject CSS into the page
  // This would typically be done through a content script or WebUI
}

void BrandingIntegration::InjectBrandingJS(content::WebContents* web_contents) {
  if (!web_contents) {
    return;
  }

  // JavaScript for Toubkal branding
  std::string js = R"(
    // Toubkal Browser Branding JavaScript
    (function() {
      'use strict';
      
      // Replace Chrome references with Toubkal
      function replaceChromeReferences() {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent.includes('Chrome') || node.textContent.includes('Chromium')) {
            node.textContent = node.textContent
              .replace(/Chrome/g, 'Toubkal')
              .replace(/Chromium/g, 'Toubkal Browser')
              .replace(/chrome:\/\//g, 'toubkal://');
          }
        }
      }
      
      // Apply branding on page load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', replaceChromeReferences);
      } else {
        replaceChromeReferences();
      }
    })();
  )";

  // Inject JavaScript into the page
  // This would typically be done through a content script or WebUI
}

bool BrandingIntegration::IsInternalPage(const std::string& url) {
  return base::StartsWith(url, "toubkal://", base::CompareCase::INSENSITIVE_ASCII);
}

std::string BrandingIntegration::GetInternalPageName(const std::string& url) {
  if (!IsInternalPage(url)) {
    return "";
  }

  // Extract page name from toubkal://page_name
  std::string page_name = url.substr(9); // Remove "toubkal://"
  
  // Remove query parameters and fragments
  size_t query_pos = page_name.find('?');
  if (query_pos != std::string::npos) {
    page_name = page_name.substr(0, query_pos);
  }
  
  size_t fragment_pos = page_name.find('#');
  if (fragment_pos != std::string::npos) {
    page_name = page_name.substr(0, fragment_pos);
  }
  
  return page_name;
}

void BrandingIntegration::ApplySpecificInternalPageBranding(content::WebContents* web_contents,
                                                           const std::string& page_name) {
  if (!web_contents) {
    return;
  }

  // Update window title for internal page
  std::string branded_title = WindowTitleManager::GetTitleForInternalPage(page_name);
  web_contents->UpdateTitleForEntry(web_contents->GetController().GetActiveEntry(),
                                   base::UTF8ToUTF16(branded_title));
}

}  // namespace branding
}  // namespace toubkal
