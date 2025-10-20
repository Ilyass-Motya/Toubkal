// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_SECURITY_MOJO_SECURITY_VALIDATOR_H_
#define TOUBKAL_BROWSER_SECURITY_MOJO_SECURITY_VALIDATOR_H_

#include <string>
#include "url/origin.h"

namespace toubkal {
namespace browser {
namespace security {

// Mojo IPC security validator for Toubkal internal pages
class MojoSecurityValidator {
 public:
  // Validate Mojo origin for internal page communication
  static bool ValidateMojoOrigin(const url::Origin& origin);

  // Validate Mojo origin for specific internal page
  static bool ValidateMojoOriginForHost(const url::Origin& origin, 
                                       const std::string& expected_host);

  // Check if origin is a valid Toubkal internal page
  static bool IsValidToubkalOrigin(const url::Origin& origin);

  // Get allowed hosts for Mojo communication
  static std::vector<std::string> GetAllowedHosts();

  // Validate Mojo message signature (for sensitive operations)
  static bool ValidateMojoSignature(const std::string& message, 
                                   const std::string& signature);

 private:
  // Allowed internal page hosts
  static const std::vector<std::string> kAllowedHosts;
};

}  // namespace security
}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_SECURITY_MOJO_SECURITY_VALIDATOR_H_
