// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/security/content_security_policy.h"

#include "base/logging.h"
#include "base/rand_util.h"
#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"

namespace toubkal {
namespace browser {
namespace security {

std::string ContentSecurityPolicy::GenerateCSPHeader(const std::string& host) {
  LOG(INFO) << "Generating CSP header for host: " << host;

  // Start with base policy
  std::string csp = GetBaseCSPPolicy();
  
  // Add host-specific policies
  if (host == "ai") {
    csp += GetAICSPPolicy();
  } else if (host == "audit") {
    csp += GetAuditCSPPolicy();
  } else if (host == "consent") {
    csp += GetConsentCSPPolicy();
  } else if (host == "settings") {
    csp += GetSettingsCSPPolicy();
  }

  // Add standard policies
  csp += GetScriptCSPPolicy();
  csp += GetStyleCSPPolicy();
  csp += GetImageCSPPolicy();
  csp += GetConnectCSPPolicy();
  csp += GetFrameCSPPolicy();

  LOG(INFO) << "Generated CSP header: " << csp;
  return csp;
}

std::string ContentSecurityPolicy::GenerateReactCSPHeader(const std::string& host) {
  LOG(INFO) << "Generating React CSP header for host: " << host;

  // React-specific CSP with support for React 19 features
  std::string csp = "default-src 'self'; ";
  csp += "script-src 'self' 'unsafe-inline' 'unsafe-eval'; ";  // React needs unsafe-eval for HMR
  csp += "style-src 'self' 'unsafe-inline'; ";
  csp += "img-src 'self' data: blob:; ";
  csp += "font-src 'self' data:; ";
  csp += "connect-src 'self' ws://localhost:* http://localhost:*; ";
  csp += "frame-ancestors 'none'; ";
  csp += "object-src 'none'; ";
  csp += "base-uri 'self'; ";
  csp += "form-action 'self'; ";

  // Add host-specific policies
  if (host == "audit") {
    csp += "worker-src 'self'; ";  // For background processing
  } else if (host == "ai") {
    csp += "media-src 'self' blob:; ";  // For AI-generated media
  }

  return csp;
}

std::string ContentSecurityPolicy::GenerateStandardCSPHeader() {
  return GetBaseCSPPolicy() + 
         GetScriptCSPPolicy() + 
         GetStyleCSPPolicy() + 
         GetImageCSPPolicy() + 
         GetConnectCSPPolicy() + 
         GetFrameCSPPolicy();
}

bool ContentSecurityPolicy::ValidateCSPHeader(const std::string& csp) {
  // Basic validation - check for required directives
  return csp.find("default-src") != std::string::npos &&
         csp.find("script-src") != std::string::npos &&
         csp.find("style-src") != std::string::npos &&
         csp.find("frame-ancestors") != std::string::npos;
}

std::string ContentSecurityPolicy::GenerateCSPNonce() {
  // Generate a random nonce for inline scripts (if needed)
  std::string nonce;
  nonce.resize(16);
  base::RandBytes(nonce.data(), nonce.size());
  return base::ToLowerASCII(base::HexEncode(nonce.data(), nonce.size()));
}

std::string ContentSecurityPolicy::GetBaseCSPPolicy() {
  return "default-src 'self'; ";
}

std::string ContentSecurityPolicy::GetScriptCSPPolicy() {
  return "script-src 'self'; ";
}

std::string ContentSecurityPolicy::GetStyleCSPPolicy() {
  return "style-src 'self' 'unsafe-inline'; ";
}

std::string ContentSecurityPolicy::GetImageCSPPolicy() {
  return "img-src 'self' data: blob:; ";
}

std::string ContentSecurityPolicy::GetConnectCSPPolicy() {
  return "connect-src 'self' ws://localhost:* http://localhost:*; ";
}

std::string ContentSecurityPolicy::GetFrameCSPPolicy() {
  return "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; ";
}

std::string ContentSecurityPolicy::GetAICSPPolicy() {
  return "media-src 'self' blob:; ";
}

std::string ContentSecurityPolicy::GetAuditCSPPolicy() {
  return "worker-src 'self'; ";
}

std::string ContentSecurityPolicy::GetConsentCSPPolicy() {
  return "";
}

std::string ContentSecurityPolicy::GetSettingsCSPPolicy() {
  return "";
}

}  // namespace security
}  // namespace browser
}  // namespace toubkal
