/**
 * Toubkal Browser Tracker Blocker Tests
 * 
 * Unit tests for tracker blocking functionality.
 */

#include "toubkal/browser/privacy/tracker_blocker.h"

#include "base/test/task_environment.h"
#include "base/test/test_simple_task_runner.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "mojo/public/cpp/bindings/remote.h"

namespace toubkal {

class TrackerBlockerTest : public testing::Test {
 public:
  TrackerBlockerTest() = default;
  ~TrackerBlockerTest() override = default;

  void SetUp() override {
    task_environment_ = std::make_unique<base::test::TaskEnvironment>();
    blocker_ = std::make_unique<TrackerBlocker>();
  }

  void TearDown() override {
    blocker_.reset();
    task_environment_.reset();
  }

 protected:
  std::unique_ptr<base::test::TaskEnvironment> task_environment_;
  std::unique_ptr<TrackerBlocker> blocker_;
};

TEST_F(TrackerBlockerTest, InitialState) {
  EXPECT_TRUE(blocker_->IsBlockingEnabled());
}

TEST_F(TrackerBlockerTest, ShouldBlockRequest) {
  // Test blocking of known tracking domains
  EXPECT_TRUE(blocker_->ShouldBlockRequest("https://google-analytics.com/analytics.js"));
  EXPECT_TRUE(blocker_->ShouldBlockRequest("https://googletagmanager.com/gtm.js"));
  EXPECT_TRUE(blocker_->ShouldBlockRequest("https://doubleclick.net/instream/ad_status.js"));
  
  // Test allowing of non-tracking domains
  EXPECT_FALSE(blocker_->ShouldBlockRequest("https://example.com/page.html"));
  EXPECT_FALSE(blocker_->ShouldBlockRequest("https://github.com/user/repo"));
}

TEST_F(TrackerBlockerTest, DomainBlocking) {
  // Test domain blocking
  EXPECT_TRUE(blocker_->IsDomainBlocked("https://google-analytics.com/analytics.js"));
  EXPECT_TRUE(blocker_->IsDomainBlocked("https://googletagmanager.com/gtm.js"));
  EXPECT_FALSE(blocker_->IsDomainBlocked("https://example.com/page.html"));
}

TEST_F(TrackerBlockerTest, UrlPatternBlocking) {
  // Test URL pattern blocking
  EXPECT_TRUE(blocker_->IsUrlPatternBlocked("https://google-analytics.com/analytics.js"));
  EXPECT_TRUE(blocker_->IsUrlPatternBlocked("https://googletagmanager.com/gtm.js"));
  EXPECT_FALSE(blocker_->IsUrlPatternBlocked("https://example.com/page.html"));
}

TEST_F(TrackerBlockerTest, RegexBlocking) {
  // Test regex blocking
  EXPECT_TRUE(blocker_->IsRegexBlocked("https://google-analytics.com/analytics.js"));
  EXPECT_TRUE(blocker_->IsRegexBlocked("https://googletagmanager.com/gtm.js"));
  EXPECT_FALSE(blocker_->IsRegexBlocked("https://example.com/page.html"));
}

TEST_F(TrackerBlockerTest, RuleValidation) {
  // Test valid rules
  EXPECT_TRUE(blocker_->IsValidRule("||google-analytics.com^"));
  EXPECT_TRUE(blocker_->IsValidRule("||googletagmanager.com^"));
  EXPECT_TRUE(blocker_->IsValidRule("||doubleclick.net^"));
  
  // Test invalid rules
  EXPECT_FALSE(blocker_->IsValidRule(""));
  EXPECT_FALSE(blocker_->IsValidRule("||google-analytics.com^" + std::string(1000, 'a')));
}

TEST_F(TrackerBlockerTest, RuleMatching) {
  // Test rule matching
  EXPECT_TRUE(blocker_->MatchesRule("https://google-analytics.com/analytics.js", "||google-analytics.com^"));
  EXPECT_TRUE(blocker_->MatchesRule("https://googletagmanager.com/gtm.js", "||googletagmanager.com^"));
  EXPECT_FALSE(blocker_->MatchesRule("https://example.com/page.html", "||google-analytics.com^"));
}

TEST_F(TrackerBlockerTest, Statistics) {
  // Test statistics recording
  blocker_->RecordBlockedRequest("https://google-analytics.com/analytics.js", "||google-analytics.com^");
  blocker_->RecordAllowedRequest("https://example.com/page.html");
  
  auto stats = blocker_->GetStatistics();
  EXPECT_EQ(stats.blocked_requests, 1);
  EXPECT_EQ(stats.allowed_requests, 1);
}

TEST_F(TrackerBlockerTest, CustomRules) {
  // Test custom rule addition
  blocker_->AddCustomRule("||example-tracker.com^");
  blocker_->AddCustomRule("||ads.example.com^");
  
  EXPECT_TRUE(blocker_->ShouldBlockRequest("https://example-tracker.com/track.js"));
  EXPECT_TRUE(blocker_->ShouldBlockRequest("https://ads.example.com/banner.js"));
}

TEST_F(TrackerBlockerTest, BlocklistLoading) {
  // Test blocklist loading
  blocker_->LoadBlocklists();
  
  // Should have loaded some rules
  auto stats = blocker_->GetStatistics();
  EXPECT_GT(stats.total_rules, 0);
  EXPECT_GT(stats.active_rules, 0);
}

}  // namespace toubkal
