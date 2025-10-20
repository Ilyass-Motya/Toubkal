// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/security/mojo_security_validator.h"

#include "base/logging.h"
#include "base/strings/string_util.h"
#include "url/origin.h"

namespace toubkal {
namespace browser {
namespace security {

// Allowed internal page hosts for Mojo communication
const std::vector<std::string> MojoSecurityValidator::kAllowedHosts = {
  "settings",
  "audit", 
  "consent",
  "about",
  "version",
  "flags",
  "ai",
  "mcp"
};

bool MojoSecurityValidator::ValidateMojoOrigin(const url::Origin& origin) {
  LOG(INFO) << "Validating Mojo origin: " << origin.Serialize();

  // Check if origin is toubkal:// scheme
  if (origin.scheme() != "toubkal") {
    LOG(WARNING) << "Invalid Mojo origin scheme: " << origin.scheme();
    return false;
  }

  // Check if host is in allowed list
  std::string host = base::ToLowerASCII(origin.host());
  for (const auto& allowed_host : kAllowedHosts) {
    if (host == allowed_host) {
      LOG(INFO) << "Valid Mojo origin: " << origin.Serialize();
      return true;
    }
  }

  LOG(WARNING) << "Invalid Mojo origin host: " << host;
  return false;
}

bool MojoSecurityValidator::ValidateMojoOriginForHost(const url::Origin& origin, 
                                                     const std::string& expected_host) {
  LOG(INFO) << "Validating Mojo origin for host: " << expected_host;

  if (!ValidateMojoOrigin(origin)) {
    return false;
  }

  std::string host = base::ToLowerASCII(origin.host());
  bool is_valid = (host == base::ToLowerASCII(expected_host));
  
  if (!is_valid) {
    LOG(WARNING) << "Mojo origin host mismatch. Expected: " << expected_host 
                 << ", Got: " << host;
  }

  return is_valid;
}

bool MojoSecurityValidator::IsValidToubkalOrigin(const url::Origin& origin) {
  return ValidateMojoOrigin(origin);
}

std::vector<std::string> MojoSecurityValidator::GetAllowedHosts() {
  return kAllowedHosts;
}

bool MojoSecurityValidator::ValidateMojoSignature(const std::string& message, 
                                                 const std::string& signature) {
  // TODO: Implement cryptographic signature validation for sensitive operations
  // This would use BoringSSL to verify signatures
  LOG(INFO) << "Validating Mojo signature (placeholder implementation)";
  
  // For now, just check that signature is not empty
  return !signature.empty();
}

}  // namespace security
}  // namespace browser
}  // namespace toubkal
