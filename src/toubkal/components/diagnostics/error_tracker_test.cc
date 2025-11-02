#include "toubkal/components/diagnostics/error_tracker.h"

#include <gtest/gtest.h>
#include <memory>
#include <chrono>
#include "base/test/scoped_task_environment.h"

namespace toubkal {
namespace diagnostics {

class ErrorTrackerTest : public testing::Test {
 protected:
  void SetUp() override {
    error_tracker_ = ErrorTracker::GetInstance();
    error_tracker_->ClearErrors();
    
    // Initialize with test config
    ErrorTrackerConfig config;
    config.max_reports = 100;
    config.report_retention_days = 1;
    config.enable_auto_reporting = true;
    config.enable_user_feedback = true;
    config.enable_crash_reporting = true;
    config.privacy_mode = true;
    
    error_tracker_->Initialize(config);
  }

  void TearDown() override {
    error_tracker_->ClearErrors();
  }

  ErrorTracker* error_tracker_;
};

TEST_F(ErrorTrackerTest, TrackError) {
  const std::string error_message = "Test error message";
  const std::string error_id = error_tracker_->TrackError(
      error_message, ErrorSeverity::HIGH, ErrorCategory::SYSTEM);
  
  EXPECT_FALSE(error_id.empty());
  
  ErrorReport* report = error_tracker_->GetErrorReport(error_id);
  ASSERT_NE(report, nullptr);
  EXPECT_EQ(report->message, error_message);
  EXPECT_EQ(report->severity, ErrorSeverity::HIGH);
  EXPECT_EQ(report->category, ErrorCategory::SYSTEM);
  EXPECT_EQ(report->count, 1);
  EXPECT_FALSE(report->resolved);
}

TEST_F(ErrorTrackerTest, TrackErrorWithException) {
  const std::runtime_error exception("Runtime error");
  const std::string error_id = error_tracker_->TrackError(
      exception, ErrorSeverity::CRITICAL, ErrorCategory::SYSTEM);
  
  EXPECT_FALSE(error_id.empty());
  
  ErrorReport* report = error_tracker_->GetErrorReport(error_id);
  ASSERT_NE(report, nullptr);
  EXPECT_EQ(report->message, "Runtime error");
  EXPECT_EQ(report->severity, ErrorSeverity::CRITICAL);
  EXPECT_EQ(report->category, ErrorCategory::SYSTEM);
}

TEST_F(ErrorTrackerTest, TrackErrorWithContext) {
  ErrorContext context;
  context.user_id = "user123";
  context.session_id = "session456";
  context.url = "https://example.com";
  context.user_agent = "Mozilla/5.0";
  context.component = "test-component";
  context.action = "test-action";
  context.metadata["key"] = "value";
  
  const std::string error_id = error_tracker_->TrackError(
      "Test error", ErrorSeverity::MEDIUM, ErrorCategory::NETWORK, context);
  
  ErrorReport* report = error_tracker_->GetErrorReport(error_id);
  ASSERT_NE(report, nullptr);
  EXPECT_EQ(report->context.user_id, "user123");
  EXPECT_EQ(report->context.session_id, "session456");
  EXPECT_EQ(report->context.url, "https://example.com");
  EXPECT_EQ(report->context.user_agent, "Mozilla/5.0");
  EXPECT_EQ(report->context.component, "test-component");
  EXPECT_EQ(report->context.action, "test-action");
  EXPECT_EQ(report->context.metadata["key"], "value");
}

TEST_F(ErrorTrackerTest, TrackDuplicateError) {
  const std::string error_message = "Duplicate error";
  const std::string error_id1 = error_tracker_->TrackError(
      error_message, ErrorSeverity::LOW, ErrorCategory::UNKNOWN);
  const std::string error_id2 = error_tracker_->TrackError(
      error_message, ErrorSeverity::LOW, ErrorCategory::UNKNOWN);
  
  EXPECT_EQ(error_id1, error_id2);
  
  ErrorReport* report = error_tracker_->GetErrorReport(error_id1);
  ASSERT_NE(report, nullptr);
  EXPECT_EQ(report->count, 2);
}

TEST_F(ErrorTrackerTest, GetAllErrors) {
  error_tracker_->TrackError("Error 1", ErrorSeverity::LOW);
  error_tracker_->TrackError("Error 2", ErrorSeverity::MEDIUM);
  error_tracker_->TrackError("Error 3", ErrorSeverity::HIGH);
  
  std::vector<ErrorReport> all_errors = error_tracker_->GetAllErrors();
  EXPECT_EQ(all_errors.size(), 3);
}

TEST_F(ErrorTrackerTest, GetErrorsBySeverity) {
  error_tracker_->TrackError("High Error 1", ErrorSeverity::HIGH);
  error_tracker_->TrackError("Low Error 1", ErrorSeverity::LOW);
  error_tracker_->TrackError("High Error 2", ErrorSeverity::HIGH);
  
  std::vector<ErrorReport> high_errors = error_tracker_->GetErrorsBySeverity(ErrorSeverity::HIGH);
  EXPECT_EQ(high_errors.size(), 2);
  
  std::vector<ErrorReport> low_errors = error_tracker_->GetErrorsBySeverity(ErrorSeverity::LOW);
  EXPECT_EQ(low_errors.size(), 1);
}

TEST_F(ErrorTrackerTest, GetErrorsByCategory) {
  error_tracker_->TrackError("Network Error 1", ErrorSeverity::MEDIUM, ErrorCategory::NETWORK);
  error_tracker_->TrackError("Security Error 1", ErrorSeverity::HIGH, ErrorCategory::SECURITY);
  error_tracker_->TrackError("Network Error 2", ErrorSeverity::MEDIUM, ErrorCategory::NETWORK);
  
  std::vector<ErrorReport> network_errors = error_tracker_->GetErrorsByCategory(ErrorCategory::NETWORK);
  EXPECT_EQ(network_errors.size(), 2);
  
  std::vector<ErrorReport> security_errors = error_tracker_->GetErrorsByCategory(ErrorCategory::SECURITY);
  EXPECT_EQ(security_errors.size(), 1);
}

TEST_F(ErrorTrackerTest, GetErrorStats) {
  error_tracker_->TrackError("High Error", ErrorSeverity::HIGH, ErrorCategory::SYSTEM);
  error_tracker_->TrackError("Medium Error", ErrorSeverity::MEDIUM, ErrorCategory::NETWORK);
  error_tracker_->TrackError("Another High Error", ErrorSeverity::HIGH, ErrorCategory::SECURITY);
  
  ErrorStats stats = error_tracker_->GetErrorStats();
  
  EXPECT_EQ(stats.total_errors, 3);
  EXPECT_EQ(stats.errors_by_severity[ErrorSeverity::HIGH], 2);
  EXPECT_EQ(stats.errors_by_severity[ErrorSeverity::MEDIUM], 1);
  EXPECT_EQ(stats.errors_by_category[ErrorCategory::SYSTEM], 1);
  EXPECT_EQ(stats.errors_by_category[ErrorCategory::NETWORK], 1);
  EXPECT_EQ(stats.errors_by_category[ErrorCategory::SECURITY], 1);
  EXPECT_GT(stats.error_rate, 0.0);
}

TEST_F(ErrorTrackerTest, MarkErrorResolved) {
  const std::string error_id = error_tracker_->TrackError("Test error");
  
  ErrorReport* report = error_tracker_->GetErrorReport(error_id);
  ASSERT_NE(report, nullptr);
  EXPECT_FALSE(report->resolved);
  
  bool result = error_tracker_->MarkErrorResolved(error_id);
  EXPECT_TRUE(result);
  
  report = error_tracker_->GetErrorReport(error_id);
  ASSERT_NE(report, nullptr);
  EXPECT_TRUE(report->resolved);
}

TEST_F(ErrorTrackerTest, MarkNonExistentErrorResolved) {
  bool result = error_tracker_->MarkErrorResolved("non-existent-id");
  EXPECT_FALSE(result);
}

TEST_F(ErrorTrackerTest, ReportError) {
  const std::string error_id = error_tracker_->TrackError("Test error");
  
  bool result = error_tracker_->ReportError(error_id);
  EXPECT_TRUE(result);
}

TEST_F(ErrorTrackerTest, ReportNonExistentError) {
  bool result = error_tracker_->ReportError("non-existent-id");
  EXPECT_FALSE(result);
}

TEST_F(ErrorTrackerTest, ExportErrors) {
  error_tracker_->TrackError("Error 1", ErrorSeverity::LOW);
  error_tracker_->TrackError("Error 2", ErrorSeverity::HIGH);
  
  std::string exported = error_tracker_->ExportErrors();
  EXPECT_FALSE(exported.empty());
  
  // Should be valid JSON array
  EXPECT_TRUE(exported.find("[") != std::string::npos);
  EXPECT_TRUE(exported.find("]") != std::string::npos);
}

TEST_F(ErrorTrackerTest, ClearErrors) {
  error_tracker_->TrackError("Error 1");
  error_tracker_->TrackError("Error 2");
  
  std::vector<ErrorReport> all_errors = error_tracker_->GetAllErrors();
  EXPECT_EQ(all_errors.size(), 2);
  
  error_tracker_->ClearErrors();
  
  all_errors = error_tracker_->GetAllErrors();
  EXPECT_EQ(all_errors.size(), 0);
}

TEST_F(ErrorTrackerTest, GetNonExistentErrorReport) {
  ErrorReport* report = error_tracker_->GetErrorReport("non-existent-id");
  EXPECT_EQ(report, nullptr);
}

TEST_F(ErrorTrackerTest, ErrorIdGeneration) {
  const std::string error1 = error_tracker_->TrackError("Error 1");
  const std::string error2 = error_tracker_->TrackError("Error 2");
  
  EXPECT_NE(error1, error2);
  EXPECT_FALSE(error1.empty());
  EXPECT_FALSE(error2.empty());
}

TEST_F(ErrorTrackerTest, ErrorTags) {
  const std::string error_id = error_tracker_->TrackError(
      "Network fetch failed", ErrorSeverity::HIGH, ErrorCategory::NETWORK);
  
  ErrorReport* report = error_tracker_->GetErrorReport(error_id);
  ASSERT_NE(report, nullptr);
  
  // Should have severity and category tags
  EXPECT_TRUE(std::find(report->tags.begin(), report->tags.end(), "2") != report->tags.end()); // HIGH = 2
  EXPECT_TRUE(std::find(report->tags.begin(), report->tags.end(), "0") != report->tags.end()); // NETWORK = 0
  
  // Should have content-based tags
  EXPECT_TRUE(std::find(report->tags.begin(), report->tags.end(), "network") != report->tags.end());
}

TEST_F(ErrorTrackerTest, ErrorRetention) {
  ErrorTrackerConfig config;
  config.max_reports = 2;
  config.report_retention_days = 1;
  config.enable_auto_reporting = true;
  config.enable_user_feedback = true;
  config.enable_crash_reporting = true;
  config.privacy_mode = true;
  
  error_tracker_->Initialize(config);
  
  // Add more errors than max_reports
  error_tracker_->TrackError("Error 1");
  error_tracker_->TrackError("Error 2");
  error_tracker_->TrackError("Error 3");
  
  // Should have cleaned up to max_reports
  std::vector<ErrorReport> all_errors = error_tracker_->GetAllErrors();
  EXPECT_LE(all_errors.size(), 2);
}

} // namespace diagnostics
} // namespace toubkal
