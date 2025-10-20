// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_SECURITY_CONTENT_SECURITY_POLICY_H_
#define TOUBKAL_BROWSER_SECURITY_CONTENT_SECURITY_POLICY_H_

#include <string>

namespace toubkal {
namespace browser {
namespace security {

// Content Security Policy generator for Toubkal internal pages
class ContentSecurityPolicy {
 public:
  // Generate CSP header for a specific internal page host
  static std::string GenerateCSPHeader(const std::string& host);

  // Generate CSP header for React WebUI pages
  static std::string GenerateReactCSPHeader(const std::string& host);

  // Generate CSP header for standard internal pages
  static std::string GenerateStandardCSPHeader();

  // Validate CSP header format
  static bool ValidateCSPHeader(const std::string& csp);

  // Get CSP nonce for inline scripts (if needed)
  static std::string GenerateCSPNonce();

 private:
  // Base CSP policy components
  static std::string GetBaseCSPPolicy();
  static std::string GetScriptCSPPolicy();
  static std::string GetStyleCSPPolicy();
  static std::string GetImageCSPPolicy();
  static std::string GetConnectCSPPolicy();
  static std::string GetFrameCSPPolicy();

  // Host-specific CSP policies
  static std::string GetAICSPPolicy();
  static std::string GetAuditCSPPolicy();
  static std::string GetConsentCSPPolicy();
  static std::string GetSettingsCSPPolicy();
};

}  // namespace security
}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_SECURITY_CONTENT_SECURITY_POLICY_H_
