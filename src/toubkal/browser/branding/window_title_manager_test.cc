// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/branding/window_title_manager.h"

#include "testing/gtest/include/gtest/gtest.h"

namespace toubkal {
namespace branding {

class WindowTitleManagerTest : public testing::Test {
 protected:
  void SetUp() override {
    BrandingManager::Initialize();
  }
};

TEST_F(WindowTitleManagerTest, GetDefaultTitle) {
  EXPECT_EQ("Toubkal Browser", WindowTitleManager::GetDefaultTitle());
}

TEST_F(WindowTitleManagerTest, GetTitleForPage) {
  EXPECT_EQ("Toubkal Browser", WindowTitleManager::GetTitleForPage(""));
  EXPECT_EQ("Settings - Toubkal Browser", WindowTitleManager::GetTitleForPage("Settings"));
  EXPECT_EQ("Google - Toubkal Browser", WindowTitleManager::GetTitleForPage("Google"));
}

TEST_F(WindowTitleManagerTest, GetTitleForInternalPage) {
  EXPECT_EQ("Settings - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("settings"));
  EXPECT_EQ("About - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("about"));
  EXPECT_EQ("Version - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("version"));
  EXPECT_EQ("Flags - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("flags"));
  EXPECT_EQ("Extensions - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("extensions"));
  EXPECT_EQ("Help - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("help"));
  EXPECT_EQ("Audit - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("audit"));
  EXPECT_EQ("Consent - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("consent"));
  EXPECT_EQ("Privacy - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("privacy"));
  EXPECT_EQ("Security - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("security"));
}

TEST_F(WindowTitleManagerTest, GetTitleForInternalPageCaseInsensitive) {
  EXPECT_EQ("Settings - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("SETTINGS"));
  EXPECT_EQ("About - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("About"));
  EXPECT_EQ("Version - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("VERSION"));
}

TEST_F(WindowTitleManagerTest, GetTitleForInternalPageUnknown) {
  EXPECT_EQ("Custom - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("custom"));
  EXPECT_EQ("Test - Toubkal Browser", WindowTitleManager::GetTitleForInternalPage("test"));
}

TEST_F(WindowTitleManagerTest, GetTitleForExternalPage) {
  EXPECT_EQ("Toubkal Browser", WindowTitleManager::GetTitleForExternalPage("", "https://example.com"));
  EXPECT_EQ("Google - Toubkal Browser", WindowTitleManager::GetTitleForExternalPage("Google", "https://google.com"));
  EXPECT_EQ("Example - Toubkal Browser", WindowTitleManager::GetTitleForExternalPage("Example", "https://example.com"));
}

TEST_F(WindowTitleManagerTest, SanitizePageTitle) {
  EXPECT_EQ("Toubkal Settings", WindowTitleManager::SanitizePageTitle("Chrome Settings"));
  EXPECT_EQ("Toubkal Browser", WindowTitleManager::SanitizePageTitle("Chrome Browser"));
  EXPECT_EQ("Toubkal://settings", WindowTitleManager::SanitizePageTitle("chrome://settings"));
  EXPECT_EQ("Toubkal Browser", WindowTitleManager::SanitizePageTitle("Chromium Browser"));
  EXPECT_EQ("Google", WindowTitleManager::SanitizePageTitle("Google"));
}

TEST_F(WindowTitleManagerTest, ShouldBrandTitle) {
  EXPECT_TRUE(WindowTitleManager::ShouldBrandTitle("Chrome Browser"));
  EXPECT_TRUE(WindowTitleManager::ShouldBrandTitle("Chromium Project"));
  EXPECT_TRUE(WindowTitleManager::ShouldBrandTitle("chrome://settings"));
  EXPECT_FALSE(WindowTitleManager::ShouldBrandTitle("Toubkal Browser"));
  EXPECT_FALSE(WindowTitleManager::ShouldBrandTitle("Firefox Browser"));
  EXPECT_FALSE(WindowTitleManager::ShouldBrandTitle("Google"));
}

}  // namespace branding
}  // namespace toubkal
