// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/security/mojo_security_validator.h"

#include "testing/gtest/include/gtest/gtest.h"
#include "url/gurl.h"
#include "url/origin.h"

namespace toubkal {
namespace browser {
namespace security {

class MojoSecurityValidatorTest : public testing::Test {
 protected:
  void SetUp() override {}
  void TearDown() override {}
};

TEST_F(MojoSecurityValidatorTest, ValidatesToubkalOrigins) {
  // Valid Toubkal origins
  url::Origin settings_origin = url::Origin::Create(GURL("toubkal://settings"));
  url::Origin audit_origin = url::Origin::Create(GURL("toubkal://audit"));
  url::Origin consent_origin = url::Origin::Create(GURL("toubkal://consent"));
  
  EXPECT_TRUE(MojoSecurityValidator::ValidateMojoOrigin(settings_origin));
  EXPECT_TRUE(MojoSecurityValidator::ValidateMojoOrigin(audit_origin));
  EXPECT_TRUE(MojoSecurityValidator::ValidateMojoOrigin(consent_origin));
}

TEST_F(MojoSecurityValidatorTest, RejectsExternalOrigins) {
  // Invalid external origins
  url::Origin http_origin = url::Origin::Create(GURL("http://example.com"));
  url::Origin https_origin = url::Origin::Create(GURL("https://example.com"));
  url::Origin chrome_origin = url::Origin::Create(GURL("chrome://settings"));
  
  EXPECT_FALSE(MojoSecurityValidator::ValidateMojoOrigin(http_origin));
  EXPECT_FALSE(MojoSecurityValidator::ValidateMojoOrigin(https_origin));
  EXPECT_FALSE(MojoSecurityValidator::ValidateMojoOrigin(chrome_origin));
}

TEST_F(MojoSecurityValidatorTest, ValidatesOriginForHost) {
  url::Origin settings_origin = url::Origin::Create(GURL("toubkal://settings"));
  url::Origin audit_origin = url::Origin::Create(GURL("toubkal://audit"));
  
  EXPECT_TRUE(MojoSecurityValidator::ValidateMojoOriginForHost(settings_origin, "settings"));
  EXPECT_TRUE(MojoSecurityValidator::ValidateMojoOriginForHost(audit_origin, "audit"));
  
  // Wrong host
  EXPECT_FALSE(MojoSecurityValidator::ValidateMojoOriginForHost(settings_origin, "audit"));
}

TEST_F(MojoSecurityValidatorTest, GetsAllowedHosts) {
  std::vector<std::string> allowed_hosts = MojoSecurityValidator::GetAllowedHosts();
  
  // Check that expected hosts are present
  EXPECT_TRUE(std::find(allowed_hosts.begin(), allowed_hosts.end(), "settings") != allowed_hosts.end());
  EXPECT_TRUE(std::find(allowed_hosts.begin(), allowed_hosts.end(), "audit") != allowed_hosts.end());
  EXPECT_TRUE(std::find(allowed_hosts.begin(), allowed_hosts.end(), "consent") != allowed_hosts.end());
  EXPECT_TRUE(std::find(allowed_hosts.begin(), allowed_hosts.end(), "about") != allowed_hosts.end());
  EXPECT_TRUE(std::find(allowed_hosts.begin(), allowed_hosts.end(), "version") != allowed_hosts.end());
  EXPECT_TRUE(std::find(allowed_hosts.begin(), allowed_hosts.end(), "flags") != allowed_hosts.end());
}

TEST_F(MojoSecurityValidatorTest, ValidatesMojoSignature) {
  std::string message = "test message";
  std::string signature = "test signature";
  std::string empty_signature = "";
  
  EXPECT_TRUE(MojoSecurityValidator::ValidateMojoSignature(message, signature));
  EXPECT_FALSE(MojoSecurityValidator::ValidateMojoSignature(message, empty_signature));
}

}  // namespace security
}  // namespace browser
}  // namespace toubkal
