#include "toubkal/components/diagnostics/error_tracker.h"

#include <sstream>
#include <iomanip>
#include <algorithm>
#include <ctime>
#include "base/logging.h"
#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"

namespace toubkal {
namespace diagnostics {

ErrorTracker* ErrorTracker::GetInstance() {
  return base::Singleton<ErrorTracker>::get();
}

ErrorTracker::ErrorTracker() 
    : logger_(Logger::GetInstance()),
      is_initialized_(false) {
  config_ = {
    1000,    // max_reports
    30,      // report_retention_days
    true,    // enable_auto_reporting
    true,    // enable_user_feedback
    true,    // enable_crash_reporting
    true     // privacy_mode
  };
}

ErrorTracker::~ErrorTracker() = default;

void ErrorTracker::Initialize(const ErrorTrackerConfig& config) {
  config_ = config;
  SetupGlobalErrorHandlers();
  is_initialized_ = true;
  
  logger_->Info("ErrorTracker", "Error tracking system initialized", {
    {"max_reports", std::to_string(config_.max_reports)},
    {"privacy_mode", config_.privacy_mode ? "true" : "false"}
  });
}

std::string ErrorTracker::TrackError(
    const std::string& error_message,
    ErrorSeverity severity,
    ErrorCategory category,
    const ErrorContext& context) {
  
  if (!is_initialized_) {
    Initialize(config_);
  }

  const std::string error_id = GenerateErrorId(error_message, context);
  const auto now = std::chrono::system_clock::now();
  
  // Create error context with timestamp
  ErrorContext full_context = context;
  if (full_context.timestamp == std::chrono::system_clock::time_point{}) {
    full_context.timestamp = now;
  }

  // Check if this error already exists
  auto it = reports_.find(error_id);
  if (it != reports_.end()) {
    // Update existing report
    it->second.count += 1;
    it->second.last_seen = now;
    it->second.severity = severity;
    it->second.category = category;
    
    logger_->Warn("ErrorTracker", 
        "Error tracked (count: " + std::to_string(it->second.count) + ")", {
          {"error_id", error_id},
          {"severity", std::to_string(static_cast<int>(severity))},
          {"category", std::to_string(static_cast<int>(category))},
          {"message", error_message}
        });
  } else {
    // Create new error report
    ErrorReport report;
    report.id = error_id;
    report.severity = severity;
    report.category = category;
    report.message = error_message;
    report.context = full_context;
    report.count = 1;
    report.first_seen = now;
    report.last_seen = now;
    report.resolved = false;
    report.tags = GenerateTags(error_message, severity, category);

    reports_[error_id] = report;
    
    logger_->Error("ErrorTracker", "New error tracked", {
      {"error_id", error_id},
      {"severity", std::to_string(static_cast<int>(severity))},
      {"category", std::to_string(static_cast<int>(category))},
      {"message", error_message}
    });
  }

  // Update error counts
  const std::string count_key = std::to_string(static_cast<int>(severity)) + 
                                ":" + std::to_string(static_cast<int>(category));
  error_counts_[count_key]++;

  // Auto-report if enabled
  if (config_.enable_auto_reporting && severity == ErrorSeverity::CRITICAL) {
    ReportError(error_id);
  }

  // Cleanup old reports if needed
  CleanupOldReports();

  return error_id;
}

std::string ErrorTracker::TrackError(
    const std::exception& exception,
    ErrorSeverity severity,
    ErrorCategory category,
    const ErrorContext& context) {
  
  return TrackError(exception.what(), severity, category, context);
}

ErrorReport* ErrorTracker::GetErrorReport(const std::string& error_id) {
  auto it = reports_.find(error_id);
  return (it != reports_.end()) ? &it->second : nullptr;
}

std::vector<ErrorReport> ErrorTracker::GetAllErrors() const {
  std::vector<ErrorReport> errors;
  for (const auto& pair : reports_) {
    errors.push_back(pair.second);
  }
  return errors;
}

std::vector<ErrorReport> ErrorTracker::GetErrorsBySeverity(ErrorSeverity severity) const {
  std::vector<ErrorReport> errors;
  for (const auto& pair : reports_) {
    if (pair.second.severity == severity) {
      errors.push_back(pair.second);
    }
  }
  return errors;
}

std::vector<ErrorReport> ErrorTracker::GetErrorsByCategory(ErrorCategory category) const {
  std::vector<ErrorReport> errors;
  for (const auto& pair : reports_) {
    if (pair.second.category == category) {
      errors.push_back(pair.second);
    }
  }
  return errors;
}

ErrorStats ErrorTracker::GetErrorStats(int time_window_hours) const {
  const auto now = std::chrono::system_clock::now();
  const auto time_window_start = now - std::chrono::hours(time_window_hours);
  
  std::vector<ErrorReport> recent_errors;
  for (const auto& pair : reports_) {
    if (pair.second.last_seen >= time_window_start) {
      recent_errors.push_back(pair.second);
    }
  }

  std::map<ErrorSeverity, int> errors_by_severity;
  std::map<ErrorCategory, int> errors_by_category;
  
  for (const auto& error : recent_errors) {
    errors_by_severity[error.severity] += error.count;
    errors_by_category[error.category] += error.count;
  }

  // Sort by count for top errors
  std::sort(recent_errors.begin(), recent_errors.end(),
      [](const ErrorReport& a, const ErrorReport& b) {
        return a.count > b.count;
      });

  const std::vector<ErrorReport> top_errors(
      recent_errors.begin(), 
      recent_errors.begin() + std::min(10, static_cast<int>(recent_errors.size())));

  const double error_rate = static_cast<double>(recent_errors.size()) / time_window_hours;

  return {
    static_cast<int>(recent_errors.size()),
    errors_by_severity,
    errors_by_category,
    top_errors,
    recent_errors,
    error_rate,
    time_window_start,
    now
  };
}

bool ErrorTracker::MarkErrorResolved(const std::string& error_id) {
  auto it = reports_.find(error_id);
  if (it != reports_.end()) {
    it->second.resolved = true;
    logger_->Info("ErrorTracker", "Error marked as resolved", {
      {"error_id", error_id}
    });
    return true;
  }
  return false;
}

bool ErrorTracker::ReportError(const std::string& error_id) {
  auto it = reports_.find(error_id);
  if (it == reports_.end()) {
    return false;
  }

  const ErrorReport& report = it->second;
  
  // In a real implementation, this would send the error report to a remote service
  // For now, we'll just log it
  logger_->Error("ErrorTracker", "Error report generated", {
    {"error_id", error_id},
    {"severity", std::to_string(static_cast<int>(report.severity))},
    {"category", std::to_string(static_cast<int>(report.category))},
    {"message", report.message},
    {"count", std::to_string(report.count)},
    {"first_seen", std::to_string(std::chrono::duration_cast<std::chrono::seconds>(
        report.first_seen.time_since_epoch()).count())},
    {"last_seen", std::to_string(std::chrono::duration_cast<std::chrono::seconds>(
        report.last_seen.time_since_epoch()).count())}
  });

  return true;
}

std::string ErrorTracker::ExportErrors() const {
  std::ostringstream json;
  json << "[\n";
  
  bool first = true;
  for (const auto& pair : reports_) {
    if (!first) {
      json << ",\n";
    }
    first = false;
    
    const ErrorReport& report = pair.second;
    json << "  {\n";
    json << "    \"id\": \"" << report.id << "\",\n";
    json << "    \"severity\": " << static_cast<int>(report.severity) << ",\n";
    json << "    \"category\": " << static_cast<int>(report.category) << ",\n";
    json << "    \"message\": \"" << report.message << "\",\n";
    json << "    \"count\": " << report.count << ",\n";
    json << "    \"resolved\": " << (report.resolved ? "true" : "false") << ",\n";
    json << "    \"first_seen\": " << std::chrono::duration_cast<std::chrono::seconds>(
        report.first_seen.time_since_epoch()).count() << ",\n";
    json << "    \"last_seen\": " << std::chrono::duration_cast<std::chrono::seconds>(
        report.last_seen.time_since_epoch()).count() << "\n";
    json << "  }";
  }
  
  json << "\n]";
  return json.str();
}

void ErrorTracker::ClearErrors() {
  reports_.clear();
  error_counts_.clear();
  logger_->Info("ErrorTracker", "All error reports cleared");
}

std::string ErrorTracker::GenerateErrorId(
    const std::string& error_message,
    const ErrorContext& context) {
  
  // Create a unique ID based on error message and context
  const std::string key = error_message + ":" + context.component + ":" + context.action;
  
  // Simple hash-based ID generation
  std::hash<std::string> hasher;
  const size_t hash = hasher(key);
  
  std::ostringstream oss;
  oss << std::hex << hash;
  return oss.str().substr(0, 16);
}

std::vector<std::string> ErrorTracker::GenerateTags(
    const std::string& error_message,
    ErrorSeverity severity,
    ErrorCategory category) {
  
  std::vector<std::string> tags;
  
  // Add severity and category tags
  tags.push_back(std::to_string(static_cast<int>(severity)));
  tags.push_back(std::to_string(static_cast<int>(category)));
  
  // Add content-based tags
  const std::string lower_message = base::ToLowerASCII(error_message);
  
  if (lower_message.find("network") != std::string::npos || 
      lower_message.find("fetch") != std::string::npos) {
    tags.push_back("network");
  }
  if (lower_message.find("render") != std::string::npos || 
      lower_message.find("dom") != std::string::npos) {
    tags.push_back("rendering");
  }
  if (lower_message.find("security") != std::string::npos || 
      lower_message.find("auth") != std::string::npos) {
    tags.push_back("security");
  }
  if (lower_message.find("performance") != std::string::npos || 
      lower_message.find("slow") != std::string::npos) {
    tags.push_back("performance");
  }
  
  return tags;
}

void ErrorTracker::CleanupOldReports() {
  const auto max_age = std::chrono::hours(24 * config_.report_retention_days);
  const auto cutoff = std::chrono::system_clock::now() - max_age;
  
  for (auto it = reports_.begin(); it != reports_.end();) {
    if (it->second.last_seen < cutoff) {
      it = reports_.erase(it);
    } else {
      ++it;
    }
  }

  // Also limit by max reports
  if (reports_.size() > static_cast<size_t>(config_.max_reports)) {
    std::vector<std::pair<std::string, ErrorReport>> sorted_reports(
        reports_.begin(), reports_.end());
    
    std::sort(sorted_reports.begin(), sorted_reports.end(),
        [](const std::pair<std::string, ErrorReport>& a,
           const std::pair<std::string, ErrorReport>& b) {
          return a.second.last_seen < b.second.last_seen;
        });
    
    const int to_delete = reports_.size() - config_.max_reports;
    for (int i = 0; i < to_delete; ++i) {
      reports_.erase(sorted_reports[i].first);
    }
  }
}

void ErrorTracker::SetupGlobalErrorHandlers() {
  // In a real implementation, this would set up global error handlers
  // for the C++ side of the browser
  logger_->Info("ErrorTracker", "Global error handlers setup completed");
}

} // namespace diagnostics
} // namespace toubkal
