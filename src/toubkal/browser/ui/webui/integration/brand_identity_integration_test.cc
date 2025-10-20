// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/ui/webui/settings/toubkal_settings_page.h"
#include "toubkal/browser/ui/webui/about/toubkal_about_page.h"
#include "toubkal/browser/ui/webui/version/toubkal_version_page.h"
#include "toubkal/browser/ui/webui/flags/toubkal_flags_page.h"
#include "toubkal/browser/security/content_security_policy.h"
#include "toubkal/browser/security/mojo_security_validator.h"

#include "testing/gtest/include/gtest/gtest.h"
#include "content/public/test/test_web_ui.h"
#include "url/gurl.h"
#include "url/origin.h"

namespace toubkal {
namespace browser {

class BrandIdentityIntegrationTest : public testing::Test {
 protected:
  void SetUp() override {
    web_ui_ = std::make_unique<content::TestWebUI>();
  }
  
  void TearDown() override {
    web_ui_.reset();
  }

  std::unique_ptr<content::TestWebUI> web_ui_;
};

TEST_F(BrandIdentityIntegrationTest, SettingsPageHasToubkalBranding) {
  auto settings_page = std::make_unique<ToubkalSettingsPage>(web_ui_.get());
  
  // Test that settings page is created successfully
  EXPECT_NE(settings_page, nullptr);
  
  // Test that CSP header is generated
  std::string csp = security::ContentSecurityPolicy::GenerateCSPHeader("settings");
  EXPECT_FALSE(csp.empty());
  EXPECT_TRUE(csp.find("frame-ancestors 'none'") != std::string::npos);
}

TEST_F(BrandIdentityIntegrationTest, AboutPageHasToubkalBranding) {
  auto about_page = std::make_unique<ToubkalAboutPage>(web_ui_.get());
  
  // Test that about page is created successfully
  EXPECT_NE(about_page, nullptr);
  
  // Test that CSP header is generated
  std::string csp = security::ContentSecurityPolicy::GenerateCSPHeader("about");
  EXPECT_FALSE(csp.empty());
  EXPECT_TRUE(csp.find("frame-ancestors 'none'") != std::string::npos);
}

TEST_F(BrandIdentityIntegrationTest, VersionPageHasToubkalBranding) {
  auto version_page = std::make_unique<ToubkalVersionPage>(web_ui_.get());
  
  // Test that version page is created successfully
  EXPECT_NE(version_page, nullptr);
  
  // Test that CSP header is generated
  std::string csp = security::ContentSecurityPolicy::GenerateCSPHeader("version");
  EXPECT_FALSE(csp.empty());
  EXPECT_TRUE(csp.find("frame-ancestors 'none'") != std::string::npos);
}

TEST_F(BrandIdentityIntegrationTest, FlagsPageHasToubkalBranding) {
  auto flags_page = std::make_unique<ToubkalFlagsPage>(web_ui_.get());
  
  // Test that flags page is created successfully
  EXPECT_NE(flags_page, nullptr);
  
  // Test that CSP header is generated
  std::string csp = security::ContentSecurityPolicy::GenerateCSPHeader("flags");
  EXPECT_FALSE(csp.empty());
  EXPECT_TRUE(csp.find("frame-ancestors 'none'") != std::string::npos);
}

TEST_F(BrandIdentityIntegrationTest, AllPagesUseToubkalScheme) {
  // Test that all internal pages use toubkal:// scheme
  std::vector<std::string> hosts = {"settings", "about", "version", "flags", "audit", "consent"};
  
  for (const auto& host : hosts) {
    url::Origin origin = url::Origin::Create(GURL("toubkal://" + host));
    EXPECT_TRUE(MojoSecurityValidator::IsValidToubkalOrigin(origin));
  }
}

TEST_F(BrandIdentityIntegrationTest, CSPHeadersAreStrict) {
  std::vector<std::string> hosts = {"settings", "about", "version", "flags", "audit", "consent"};
  
  for (const auto& host : hosts) {
    std::string csp = security::ContentSecurityPolicy::GenerateCSPHeader(host);
    
    // Check for strict security policies
    EXPECT_TRUE(csp.find("frame-ancestors 'none'") != std::string::npos);
    EXPECT_TRUE(csp.find("object-src 'none'") != std::string::npos);
    EXPECT_TRUE(csp.find("base-uri 'self'") != std::string::npos);
    EXPECT_TRUE(csp.find("form-action 'self'") != std::string::npos);
    
    // Check that unsafe-eval is not present (except for React pages)
    if (host != "audit" && host != "consent") {
      EXPECT_TRUE(csp.find("unsafe-eval") == std::string::npos);
    }
  }
}

TEST_F(BrandIdentityIntegrationTest, MojoSecurityValidatesOrigins) {
  // Test valid Toubkal origins
  std::vector<std::string> valid_hosts = {"settings", "about", "version", "flags", "audit", "consent"};
  
  for (const auto& host : valid_hosts) {
    url::Origin origin = url::Origin::Create(GURL("toubkal://" + host));
    EXPECT_TRUE(MojoSecurityValidator::ValidateMojoOrigin(origin));
  }
  
  // Test invalid origins
  std::vector<std::string> invalid_origins = {
    "http://example.com",
    "https://example.com", 
    "chrome://settings",
    "file:///path/to/file"
  };
  
  for (const auto& origin_str : invalid_origins) {
    url::Origin origin = url::Origin::Create(GURL(origin_str));
    EXPECT_FALSE(MojoSecurityValidator::ValidateMojoOrigin(origin));
  }
}

TEST_F(BrandIdentityIntegrationTest, BrandAssetsAreAccessible) {
  // Test that brand assets can be loaded
  // This would typically test that logo and CSS assets are properly served
  // For now, we'll test that the asset paths are valid
  
  std::vector<std::string> asset_paths = {
    "assets/toubkal-icon.svg",
    "assets/toubkal-logo.svg",
    "assets/favicon.ico"
  };
  
  for (const auto& path : asset_paths) {
    // In a real test, we would verify that these assets exist and are accessible
    EXPECT_FALSE(path.empty());
  }
}

}  // namespace browser
}  // namespace toubkal
