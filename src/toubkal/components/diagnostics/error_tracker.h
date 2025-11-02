#ifndef TOUBKAL_COMPONENTS_DIAGNOSTICS_ERROR_TRACKER_H_
#define TOUBKAL_COMPONENTS_DIAGNOSTICS_ERROR_TRACKER_H_

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <chrono>
#include "base/memory/singleton.h"
#include "toubkal/components/diagnostics/logging/logger.h"

namespace toubkal {
namespace diagnostics {

enum class ErrorSeverity {
  LOW = 0,
  MEDIUM,
  HIGH,
  CRITICAL
};

enum class ErrorCategory {
  NETWORK = 0,
  RENDERING,
  SECURITY,
  PERFORMANCE,
  USER_INPUT,
  SYSTEM,
  THIRD_PARTY,
  UNKNOWN
};

struct ErrorContext {
  std::string user_id;
  std::string session_id;
  std::string url;
  std::string user_agent;
  std::chrono::system_clock::time_point timestamp;
  std::string stack_trace;
  std::string component;
  std::string action;
  std::map<std::string, std::string> metadata;
};

struct ErrorReport {
  std::string id;
  ErrorSeverity severity;
  ErrorCategory category;
  std::string message;
  ErrorContext context;
  int count;
  std::chrono::system_clock::time_point first_seen;
  std::chrono::system_clock::time_point last_seen;
  bool resolved;
  std::vector<std::string> tags;
};

struct ErrorStats {
  int total_errors;
  std::map<ErrorSeverity, int> errors_by_severity;
  std::map<ErrorCategory, int> errors_by_category;
  std::vector<ErrorReport> top_errors;
  std::vector<ErrorReport> recent_errors;
  double error_rate;
  std::chrono::system_clock::time_point time_window_start;
  std::chrono::system_clock::time_point time_window_end;
};

struct ErrorTrackerConfig {
  int max_reports;
  int report_retention_days;
  bool enable_auto_reporting;
  bool enable_user_feedback;
  bool enable_crash_reporting;
  bool privacy_mode;
};

class ErrorTracker {
 public:
  static ErrorTracker* GetInstance();

  void Initialize(const ErrorTrackerConfig& config);
  
  std::string TrackError(
      const std::string& error_message,
      ErrorSeverity severity = ErrorSeverity::MEDIUM,
      ErrorCategory category = ErrorCategory::UNKNOWN,
      const ErrorContext& context = ErrorContext{});
  
  std::string TrackError(
      const std::exception& exception,
      ErrorSeverity severity = ErrorSeverity::MEDIUM,
      ErrorCategory category = ErrorCategory::UNKNOWN,
      const ErrorContext& context = ErrorContext{});

  ErrorReport* GetErrorReport(const std::string& error_id);
  std::vector<ErrorReport> GetAllErrors() const;
  std::vector<ErrorReport> GetErrorsBySeverity(ErrorSeverity severity) const;
  std::vector<ErrorReport> GetErrorsByCategory(ErrorCategory category) const;
  
  ErrorStats GetErrorStats(int time_window_hours = 24) const;
  
  bool MarkErrorResolved(const std::string& error_id);
  bool ReportError(const std::string& error_id);
  
  std::string ExportErrors() const;
  void ClearErrors();

 private:
  ErrorTracker();
  ~ErrorTracker();
  ErrorTracker(const ErrorTracker&) = delete;
  ErrorTracker& operator=(const ErrorTracker&) = delete;

  std::string GenerateErrorId(
      const std::string& error_message,
      const ErrorContext& context);
  
  std::vector<std::string> GenerateTags(
      const std::string& error_message,
      ErrorSeverity severity,
      ErrorCategory category);
  
  void CleanupOldReports();
  void SetupGlobalErrorHandlers();

  Logger* logger_;
  ErrorTrackerConfig config_;
  std::map<std::string, ErrorReport> reports_;
  std::map<std::string, int> error_counts_;
  bool is_initialized_;
};

} // namespace diagnostics
} // namespace toubkal

#endif // TOUBKAL_COMPONENTS_DIAGNOSTICS_ERROR_TRACKER_H_
