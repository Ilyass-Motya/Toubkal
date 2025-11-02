/**
 * Toubkal Browser Brave Shields Manager Tests
 * 
 * Unit tests for Brave Shields integration functionality.
 */

#include "toubkal/browser/privacy/brave_shields_manager.h"

#include "base/test/task_environment.h"
#include "base/test/test_simple_task_runner.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "mojo/public/cpp/bindings/remote.h"

namespace toubkal {

class BraveShieldsManagerTest : public testing::Test {
 public:
  BraveShieldsManagerTest() = default;
  ~BraveShieldsManagerTest() override = default;

  void SetUp() override {
    task_environment_ = std::make_unique<base::test::TaskEnvironment>();
    shields_manager_ = std::make_unique<BraveShieldsManager>();
  }

  void TearDown() override {
    shields_manager_.reset();
    task_environment_.reset();
  }

 protected:
  std::unique_ptr<base::test::TaskEnvironment> task_environment_;
  std::unique_ptr<BraveShieldsManager> shields_manager_;
};

TEST_F(BraveShieldsManagerTest, InitialState) {
  EXPECT_TRUE(shields_manager_->IsShieldsEnabled());
  EXPECT_EQ(shields_manager_->GetMode(), ShieldMode::AGGRESSIVE);
}

TEST_F(BraveShieldsManagerTest, AdBlocking) {
  // Test ad blocking
  EXPECT_TRUE(shields_manager_->ShouldBlockAd("https://google-analytics.com/analytics.js", "https://example.com"));
  EXPECT_TRUE(shields_manager_->ShouldBlockAd("https://googletagmanager.com/gtm.js", "https://example.com"));
  EXPECT_TRUE(shields_manager_->ShouldBlockAd("https://doubleclick.net/instream/ad_status.js", "https://example.com"));
  
  // Test non-ad URLs
  EXPECT_FALSE(shields_manager_->ShouldBlockAd("https://example.com/page.html", "https://example.com"));
  EXPECT_FALSE(shields_manager_->ShouldBlockAd("https://github.com/user/repo", "https://example.com"));
}

TEST_F(BraveShieldsManagerTest, TrackerBlocking) {
  // Test tracker blocking
  EXPECT_TRUE(shields_manager_->ShouldBlockTracker("https://google-analytics.com/analytics.js", "https://example.com"));
  EXPECT_TRUE(shields_manager_->ShouldBlockTracker("https://googletagmanager.com/gtm.js", "https://example.com"));
  EXPECT_TRUE(shields_manager_->ShouldBlockTracker("https://doubleclick.net/instream/ad_status.js", "https://example.com"));
  
  // Test non-tracking URLs
  EXPECT_FALSE(shields_manager_->ShouldBlockTracker("https://example.com/page.html", "https://example.com"));
  EXPECT_FALSE(shields_manager_->ShouldBlockTracker("https://github.com/user/repo", "https://example.com"));
}

TEST_F(BraveShieldsManagerTest, ScriptBlocking) {
  // Test script blocking in aggressive mode
  EXPECT_TRUE(shields_manager_->ShouldBlockScript("https://example.com/script.js", "https://example.com"));
  EXPECT_TRUE(shields_manager_->ShouldBlockScript("https://cdn.example.com/library.js", "https://example.com"));
  
  // Test non-script URLs
  EXPECT_FALSE(shields_manager_->ShouldBlockScript("https://example.com/page.html", "https://example.com"));
  EXPECT_FALSE(shields_manager_->ShouldBlockScript("https://example.com/image.png", "https://example.com"));
}

TEST_F(BraveShieldsManagerTest, CookieBlocking) {
  // Test cookie blocking in aggressive mode
  EXPECT_TRUE(shields_manager_->ShouldBlockCookie("https://example.com/set-cookie", "https://example.com"));
  EXPECT_TRUE(shields_manager_->ShouldBlockCookie("https://tracker.com/track", "https://example.com"));
  
  // Test non-cookie URLs
  EXPECT_FALSE(shields_manager_->ShouldBlockCookie("https://example.com/page.html", "https://example.com"));
  EXPECT_FALSE(shields_manager_->ShouldBlockCookie("https://example.com/image.png", "https://example.com"));
}

TEST_F(BraveShieldsManagerTest, FingerprintingBlocking) {
  // Test fingerprinting blocking
  EXPECT_TRUE(shields_manager_->ShouldBlockFingerprinting("https://fingerprintjs.com/fingerprint.js", "https://example.com"));
  EXPECT_TRUE(shields_manager_->ShouldBlockFingerprinting("https://deviceinfo.me/info.js", "https://example.com"));
  EXPECT_TRUE(shields_manager_->ShouldBlockFingerprinting("https://panopticlick.eff.org/tracker", "https://example.com"));
  
  // Test non-fingerprinting URLs
  EXPECT_FALSE(shields_manager_->ShouldBlockFingerprinting("https://example.com/page.html", "https://example.com"));
  EXPECT_FALSE(shields_manager_->ShouldBlockFingerprinting("https://github.com/user/repo", "https://example.com"));
}

TEST_F(BraveShieldsManagerTest, SiteShieldSettings) {
  // Test site-specific shield settings
  SiteShieldSettings settings;
  settings.site = "example.com";
  settings.ads_blocked = true;
  settings.trackers_blocked = true;
  settings.scripts_blocked = false;
  settings.cookies_blocked = false;
  settings.fingerprinting_blocked = true;
  settings.mode = ShieldMode::STANDARD;
  settings.enabled = true;
  
  shields_manager_->SetSiteShieldSettings("example.com", settings);
  
  auto retrieved_settings = shields_manager_->GetSiteShieldSettings("example.com");
  EXPECT_EQ(retrieved_settings.site, "example.com");
  EXPECT_TRUE(retrieved_settings.ads_blocked);
  EXPECT_TRUE(retrieved_settings.trackers_blocked);
  EXPECT_FALSE(retrieved_settings.scripts_blocked);
  EXPECT_FALSE(retrieved_settings.cookies_blocked);
  EXPECT_TRUE(retrieved_settings.fingerprinting_blocked);
  EXPECT_EQ(retrieved_settings.mode, ShieldMode::STANDARD);
  EXPECT_TRUE(retrieved_settings.enabled);
}

TEST_F(BraveShieldsManagerTest, Statistics) {
  // Test statistics recording
  shields_manager_->RecordBlockedAd("https://google-analytics.com/analytics.js", "https://example.com");
  shields_manager_->RecordBlockedTracker("https://googletagmanager.com/gtm.js", "https://example.com");
  shields_manager_->RecordBlockedScript("https://example.com/script.js", "https://example.com");
  shields_manager_->RecordBlockedCookie("https://example.com/set-cookie", "https://example.com");
  shields_manager_->RecordBlockedFingerprinting("https://fingerprintjs.com/fingerprint.js", "https://example.com");
  
  auto stats = shields_manager_->GetStatistics();
  EXPECT_EQ(stats.ads_blocked, 1);
  EXPECT_EQ(stats.trackers_blocked, 1);
  EXPECT_EQ(stats.scripts_blocked, 1);
  EXPECT_EQ(stats.cookies_blocked, 1);
  EXPECT_EQ(stats.fingerprinting_attempts_blocked, 1);
}

TEST_F(BraveShieldsManagerTest, ModeSwitching) {
  // Test mode switching
  shields_manager_->SetMode(ShieldMode::STANDARD);
  EXPECT_EQ(shields_manager_->GetMode(), ShieldMode::STANDARD);
  
  shields_manager_->SetMode(ShieldMode::AGGRESSIVE);
  EXPECT_EQ(shields_manager_->GetMode(), ShieldMode::AGGRESSIVE);
}

TEST_F(BraveShieldsManagerTest, ShieldControl) {
  // Test shield enabling/disabling
  shields_manager_->DisableShields();
  EXPECT_FALSE(shields_manager_->IsShieldsEnabled());
  
  shields_manager_->EnableShields();
  EXPECT_TRUE(shields_manager_->IsShieldsEnabled());
}

TEST_F(BraveShieldsManagerTest, StatisticsClearing) {
  // Test statistics clearing
  shields_manager_->RecordBlockedAd("https://google-analytics.com/analytics.js", "https://example.com");
  shields_manager_->RecordBlockedTracker("https://googletagmanager.com/gtm.js", "https://example.com");
  
  auto stats_before = shields_manager_->GetStatistics();
  EXPECT_GT(stats_before.ads_blocked, 0);
  EXPECT_GT(stats_before.trackers_blocked, 0);
  
  shields_manager_->ClearStatistics();
  
  auto stats_after = shields_manager_->GetStatistics();
  EXPECT_EQ(stats_after.ads_blocked, 0);
  EXPECT_EQ(stats_after.trackers_blocked, 0);
}

}  // namespace toubkal
