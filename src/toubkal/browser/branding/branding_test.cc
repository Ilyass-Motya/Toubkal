// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/branding/branding_manager.h"

#include "testing/gtest/include/gtest/gtest.h"

namespace toubkal {
namespace branding {

class BrandingManagerTest : public testing::Test {
 protected:
  void SetUp() override {
    BrandingManager::Initialize();
  }
};

TEST_F(BrandingManagerTest, GetProductName) {
  EXPECT_EQ("Toubkal Browser", BrandingManager::GetProductName());
}

TEST_F(BrandingManagerTest, GetWindowTitle) {
  EXPECT_EQ("Toubkal Browser", BrandingManager::GetWindowTitle(""));
  EXPECT_EQ("Settings - Toubkal Browser", BrandingManager::GetWindowTitle("Settings"));
}

TEST_F(BrandingManagerTest, GetAboutDialogTitle) {
  EXPECT_EQ("About Toubkal Browser", BrandingManager::GetAboutDialogTitle());
}

TEST_F(BrandingManagerTest, ReplaceChromeReferences) {
  std::string text = "Welcome to Chrome Browser";
  std::string result = BrandingManager::ReplaceChromeReferences(text);
  EXPECT_EQ("Welcome to Toubkal Browser", result);
}

TEST_F(BrandingManagerTest, ReplaceChromeUrlScheme) {
  std::string text = "Visit chrome://settings for configuration";
  std::string result = BrandingManager::ReplaceChromeReferences(text);
  EXPECT_EQ("Visit toubkal://settings for configuration", result);
}

TEST_F(BrandingManagerTest, ReplaceMultipleReferences) {
  std::string text = "Chrome Browser and Chromium are both browsers";
  std::string result = BrandingManager::ReplaceChromeReferences(text);
  EXPECT_EQ("Toubkal Browser and Toubkal Browser are both browsers", result);
}

TEST_F(BrandingManagerTest, ContainsChromeReferences) {
  EXPECT_TRUE(BrandingManager::ContainsChromeReferences("Chrome Browser"));
  EXPECT_TRUE(BrandingManager::ContainsChromeReferences("Chromium Project"));
  EXPECT_TRUE(BrandingManager::ContainsChromeReferences("chrome://settings"));
  EXPECT_FALSE(BrandingManager::ContainsChromeReferences("Toubkal Browser"));
  EXPECT_FALSE(BrandingManager::ContainsChromeReferences("Firefox Browser"));
}

TEST_F(BrandingManagerTest, GetInternalScheme) {
  EXPECT_EQ("toubkal", BrandingManager::GetInternalScheme());
}

TEST_F(BrandingManagerTest, GetBrandColors) {
  EXPECT_EQ("#1E40AF", BrandingManager::GetPrimaryColor());
  EXPECT_EQ("#3B82F6", BrandingManager::GetSecondaryColor());
  EXPECT_EQ("#10B981", BrandingManager::GetAccentColor());
}

TEST_F(BrandingManagerTest, GetLogoPaths) {
  EXPECT_EQ("toubkal://resources/logo.svg", BrandingManager::GetLogoPath());
  EXPECT_EQ("toubkal://resources/icon.png", BrandingManager::GetIconPath());
  EXPECT_EQ("toubkal://resources/favicon.ico", BrandingManager::GetFaviconPath());
}

}  // namespace branding
}  // namespace toubkal
