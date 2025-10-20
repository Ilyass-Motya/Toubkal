// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/security/content_security_policy.h"

#include "testing/gtest/include/gtest/gtest.h"

namespace toubkal {
namespace browser {
namespace security {

class ContentSecurityPolicyTest : public testing::Test {
 protected:
  void SetUp() override {}
  void TearDown() override {}
};

TEST_F(ContentSecurityPolicyTest, GeneratesStrictCSP) {
  std::string csp = ContentSecurityPolicy::GenerateCSPHeader("settings");
  
  // Check that unsafe-eval is not present
  EXPECT_TRUE(csp.find("unsafe-eval") == std::string::npos);
  
  // Check that frame-ancestors is set to 'none'
  EXPECT_TRUE(csp.find("frame-ancestors 'none'") != std::string::npos);
  
  // Check that object-src is set to 'none'
  EXPECT_TRUE(csp.find("object-src 'none'") != std::string::npos);
  
  // Check that base-uri is set to 'self'
  EXPECT_TRUE(csp.find("base-uri 'self'") != std::string::npos);
}

TEST_F(ContentSecurityPolicyTest, GeneratesReactCSP) {
  std::string csp = ContentSecurityPolicy::GenerateReactCSPHeader("audit");
  
  // React needs unsafe-eval for HMR
  EXPECT_TRUE(csp.find("unsafe-eval") != std::string::npos);
  
  // Check that worker-src is present for audit page
  EXPECT_TRUE(csp.find("worker-src 'self'") != std::string::npos);
}

TEST_F(ContentSecurityPolicyTest, GeneratesAICSP) {
  std::string csp = ContentSecurityPolicy::GenerateCSPHeader("ai");
  
  // Check that media-src is present for AI page
  EXPECT_TRUE(csp.find("media-src 'self' blob:") != std::string::npos);
}

TEST_F(ContentSecurityPolicyTest, ValidatesCSPHeader) {
  std::string valid_csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';";
  std::string invalid_csp = "script-src 'self';";
  
  EXPECT_TRUE(ContentSecurityPolicy::ValidateCSPHeader(valid_csp));
  EXPECT_FALSE(ContentSecurityPolicy::ValidateCSPHeader(invalid_csp));
}

TEST_F(ContentSecurityPolicyTest, GeneratesCSPNonce) {
  std::string nonce1 = ContentSecurityPolicy::GenerateCSPNonce();
  std::string nonce2 = ContentSecurityPolicy::GenerateCSPNonce();
  
  // Nonces should not be empty
  EXPECT_FALSE(nonce1.empty());
  EXPECT_FALSE(nonce2.empty());
  
  // Nonces should be different
  EXPECT_NE(nonce1, nonce2);
}

}  // namespace security
}  // namespace browser
}  // namespace toubkal
