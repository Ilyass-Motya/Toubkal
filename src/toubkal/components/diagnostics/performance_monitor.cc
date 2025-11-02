#include "toubkal/components/diagnostics/performance_monitor.h"

#include <sstream>
#include <iomanip>
#include <algorithm>
#include <ctime>
#include <cmath>
#include "base/logging.h"
#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"

namespace toubkal {
namespace diagnostics {

PerformanceMonitor* PerformanceMonitor::GetInstance() {
  return base::Singleton<PerformanceMonitor>::get();
}

PerformanceMonitor::PerformanceMonitor() 
    : logger_(Logger::GetInstance()),
      is_initialized_(false) {
  config_ = {
    true,   // enable_page_load_tracking
    true,   // enable_memory_tracking
    true,   // enable_cpu_tracking
    true,   // enable_network_tracking
    true,   // enable_user_interaction_tracking
    true,   // enable_rendering_tracking
    true,   // enable_javascript_tracking
    true,   // enable_resource_tracking
    1000,  // sampling_interval_ms
    1000,  // max_metrics_per_snapshot
    true,   // enable_real_time_monitoring
    true,   // enable_performance_alerts
    {},     // alert_thresholds (will be set in Initialize)
    true    // privacy_mode
  };
  
  // Set default alert thresholds
  config_.alert_thresholds[PerformanceMetricType::PAGE_LOAD] = 3000.0; // 3 seconds
  config_.alert_thresholds[PerformanceMetricType::MEMORY_USAGE] = 100 * 1024 * 1024.0; // 100MB
  config_.alert_thresholds[PerformanceMetricType::CPU_USAGE] = 80.0; // 80%
  config_.alert_thresholds[PerformanceMetricType::NETWORK_REQUEST] = 5000.0; // 5 seconds
  config_.alert_thresholds[PerformanceMetricType::USER_INTERACTION] = 100.0; // 100ms
  config_.alert_thresholds[PerformanceMetricType::RENDERING] = 16.67; // 60fps
  config_.alert_thresholds[PerformanceMetricType::JAVASCRIPT_EXECUTION] = 50.0; // 50ms
  config_.alert_thresholds[PerformanceMetricType::RESOURCE_LOADING] = 2000.0; // 2 seconds
}

PerformanceMonitor::~PerformanceMonitor() {
  Destroy();
}

void PerformanceMonitor::Initialize(const PerformanceMonitorConfig& config) {
  config_ = config;
  SetupPerformanceObservers();
  StartMonitoring();
  is_initialized_ = true;
  monitoring_start_time_ = std::chrono::system_clock::now();
  
  logger_->Info("PerformanceMonitor", "Performance monitoring system initialized", {
    {"sampling_interval", std::to_string(config_.sampling_interval_ms)},
    {"privacy_mode", config_.privacy_mode ? "true" : "false"}
  });
}

std::string PerformanceMonitor::TrackMetric(
    PerformanceMetricType type,
    const std::string& name,
    double value,
    const std::string& unit,
    const std::map<std::string, std::string>& context) {
  
  if (!is_initialized_) {
    Initialize(config_);
  }

  const std::string metric_id = GenerateMetricId(type, name, value);
  const auto now = std::chrono::system_clock::now();
  
  PerformanceMetric metric;
  metric.id = metric_id;
  metric.type = type;
  metric.name = name;
  metric.value = value;
  metric.unit = unit;
  metric.timestamp = now;
  metric.url = context.count("url") ? context.at("url") : "";
  metric.component = context.count("component") ? context.at("component") : "";
  metric.context = SanitizeContext(context);
  metric.threshold = CalculateThreshold(type, value);

  metrics_[metric_id] = metric;
  
  // Check for performance alerts
  if (config_.enable_performance_alerts && ShouldAlert(metric)) {
    TriggerPerformanceAlert(metric);
  }

  logger_->Debug("PerformanceMonitor", "Performance metric tracked", {
    {"type", std::to_string(static_cast<int>(type))},
    {"name", name},
    {"value", std::to_string(value)},
    {"unit", unit},
    {"threshold", std::to_string(static_cast<int>(metric.threshold))}
  });

  return metric_id;
}

PerformanceMetric* PerformanceMonitor::GetMetric(const std::string& metric_id) {
  auto it = metrics_.find(metric_id);
  return (it != metrics_.end()) ? &it->second : nullptr;
}

std::vector<PerformanceMetric> PerformanceMonitor::GetAllMetrics() const {
  std::vector<PerformanceMetric> all_metrics;
  for (const auto& pair : metrics_) {
    all_metrics.push_back(pair.second);
  }
  return all_metrics;
}

std::vector<PerformanceMetric> PerformanceMonitor::GetMetricsByType(PerformanceMetricType type) const {
  std::vector<PerformanceMetric> filtered_metrics;
  for (const auto& pair : metrics_) {
    if (pair.second.type == type) {
      filtered_metrics.push_back(pair.second);
    }
  }
  return filtered_metrics;
}

std::vector<PerformanceMetric> PerformanceMonitor::GetMetricsByThreshold(PerformanceThreshold threshold) const {
  std::vector<PerformanceMetric> filtered_metrics;
  for (const auto& pair : metrics_) {
    if (pair.second.threshold == threshold) {
      filtered_metrics.push_back(pair.second);
    }
  }
  return filtered_metrics;
}

std::vector<PerformanceMetric> PerformanceMonitor::GetRecentMetrics(int time_window_ms) const {
  const auto cutoff = std::chrono::system_clock::now() - std::chrono::milliseconds(time_window_ms);
  std::vector<PerformanceMetric> recent_metrics;
  
  for (const auto& pair : metrics_) {
    if (pair.second.timestamp >= cutoff) {
      recent_metrics.push_back(pair.second);
    }
  }
  return recent_metrics;
}

PerformanceSnapshot PerformanceMonitor::CreateSnapshot() {
  const auto now = std::chrono::system_clock::now();
  const auto recent_metrics = GetRecentMetrics(config_.sampling_interval_ms);
  
  PerformanceSnapshot snapshot;
  snapshot.timestamp = now;
  snapshot.metrics = recent_metrics;
  
  CalculateSnapshotSummary(recent_metrics, snapshot.summary);
  
  snapshots_.push_back(snapshot);
  
  // Keep only recent snapshots
  if (snapshots_.size() > 100) {
    snapshots_ = std::vector<PerformanceSnapshot>(
        snapshots_.end() - 100, snapshots_.end());
  }

  logger_->Debug("PerformanceMonitor", "Performance snapshot created", {
    {"metrics_count", std::to_string(recent_metrics.size())},
    {"average_value", std::to_string(snapshot.summary.average_value)}
  });

  return snapshot;
}

PerformanceReport PerformanceMonitor::GenerateReport(
    const std::chrono::system_clock::time_point& start_time,
    const std::chrono::system_clock::time_point& end_time) {
  
  std::vector<PerformanceMetric> report_metrics;
  for (const auto& pair : metrics_) {
    if (pair.second.timestamp >= start_time && pair.second.timestamp <= end_time) {
      report_metrics.push_back(pair.second);
    }
  }

  PerformanceReport report;
  report.id = GenerateReportId(start_time, end_time);
  report.start_time = start_time;
  report.end_time = end_time;
  report.duration = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time);
  report.metrics = report_metrics;
  
  // Calculate summary
  CalculateSnapshotSummary(report_metrics, report.summary);
  
  // Get top slowest metrics
  std::sort(report_metrics.begin(), report_metrics.end(),
      [](const PerformanceMetric& a, const PerformanceMetric& b) {
        return a.value > b.value;
      });
  
  const int top_count = std::min(10, static_cast<int>(report_metrics.size()));
  report.summary.top_slowest_metrics = std::vector<PerformanceMetric>(
      report_metrics.begin(), report_metrics.begin() + top_count);
  
  report.summary.performance_score = CalculatePerformanceScore(report_metrics);
  report.recommendations = GenerateRecommendations(report_metrics);

  logger_->Info("PerformanceMonitor", "Performance report generated", {
    {"report_id", report.id},
    {"duration_ms", std::to_string(report.duration.count())},
    {"metrics_count", std::to_string(report_metrics.size())},
    {"performance_score", std::to_string(report.summary.performance_score)}
  });

  return report;
}

int PerformanceMonitor::GetPerformanceScore() const {
  const auto recent_metrics = GetRecentMetrics(300000); // 5 minutes
  return CalculatePerformanceScore(recent_metrics);
}

std::string PerformanceMonitor::ExportMetrics() const {
  std::ostringstream json;
  json << "[\n";
  
  bool first = true;
  for (const auto& pair : metrics_) {
    if (!first) {
      json << ",\n";
    }
    first = false;
    
    const PerformanceMetric& metric = pair.second;
    json << "  {\n";
    json << "    \"id\": \"" << metric.id << "\",\n";
    json << "    \"type\": " << static_cast<int>(metric.type) << ",\n";
    json << "    \"name\": \"" << metric.name << "\",\n";
    json << "    \"value\": " << metric.value << ",\n";
    json << "    \"unit\": \"" << metric.unit << "\",\n";
    json << "    \"timestamp\": " << std::chrono::duration_cast<std::chrono::seconds>(
        metric.timestamp.time_since_epoch()).count() << ",\n";
    json << "    \"threshold\": " << static_cast<int>(metric.threshold) << "\n";
    json << "  }";
  }
  
  json << "\n]";
  return json.str();
}

void PerformanceMonitor::ClearMetrics() {
  metrics_.clear();
  snapshots_.clear();
  logger_->Info("PerformanceMonitor", "All performance metrics cleared");
}

void PerformanceMonitor::Destroy() {
  StopMonitoring();
  ClearMetrics();
  is_initialized_ = false;
}

std::string PerformanceMonitor::GenerateMetricId(
    PerformanceMetricType type,
    const std::string& name,
    double value) {
  
  const std::string key = std::to_string(static_cast<int>(type)) + ":" + name + ":" + 
                         std::to_string(value) + ":" + std::to_string(
                         std::chrono::duration_cast<std::chrono::milliseconds>(
                         std::chrono::system_clock::now().time_since_epoch()).count());
  
  // Simple hash-based ID generation
  std::hash<std::string> hasher;
  const size_t hash = hasher(key);
  
  std::ostringstream oss;
  oss << std::hex << hash;
  return oss.str().substr(0, 16);
}

std::string PerformanceMonitor::GenerateReportId(
    const std::chrono::system_clock::time_point& start_time,
    const std::chrono::system_clock::time_point& end_time) {
  
  const std::string key = "report:" + std::to_string(
      std::chrono::duration_cast<std::chrono::milliseconds>(
      start_time.time_since_epoch()).count()) + ":" + std::to_string(
      std::chrono::duration_cast<std::chrono::milliseconds>(
      end_time.time_since_epoch()).count());
  
  std::hash<std::string> hasher;
  const size_t hash = hasher(key);
  
  std::ostringstream oss;
  oss << std::hex << hash;
  return oss.str().substr(0, 16);
}

PerformanceThreshold PerformanceMonitor::CalculateThreshold(
    PerformanceMetricType type,
    double value) {
  
  const double threshold = config_.alert_thresholds[type];
  
  if (value <= threshold * 0.5) return PerformanceThreshold::EXCELLENT;
  if (value <= threshold * 0.8) return PerformanceThreshold::GOOD;
  if (value <= threshold) return PerformanceThreshold::NEEDS_IMPROVEMENT;
  return PerformanceThreshold::POOR;
}

bool PerformanceMonitor::ShouldAlert(const PerformanceMetric& metric) {
  return metric.threshold == PerformanceThreshold::POOR;
}

void PerformanceMonitor::TriggerPerformanceAlert(const PerformanceMetric& metric) {
  logger_->Warn("PerformanceMonitor", "Performance alert triggered", {
    {"type", std::to_string(static_cast<int>(metric.type))},
    {"name", metric.name},
    {"value", std::to_string(metric.value)},
    {"unit", metric.unit},
    {"threshold", std::to_string(static_cast<int>(metric.threshold))}
  });
}

std::map<std::string, std::string> PerformanceMonitor::SanitizeContext(
    const std::map<std::string, std::string>& context) {
  
  if (!config_.privacy_mode) return context;
  
  std::map<std::string, std::string> sanitized = context;
  
  // Remove sensitive information
  sanitized.erase("user_id");
  sanitized.erase("session_id");
  sanitized.erase("ip_address");
  
  // Sanitize URLs
  if (sanitized.count("url")) {
    const std::string& url = sanitized["url"];
    // Simple URL sanitization - remove query parameters
    size_t query_pos = url.find('?');
    if (query_pos != std::string::npos) {
      sanitized["url"] = url.substr(0, query_pos);
    }
  }
  
  return sanitized;
}

void PerformanceMonitor::CalculateSnapshotSummary(
    const std::vector<PerformanceMetric>& metrics,
    PerformanceSnapshot::summary& summary) {
  
  if (metrics.empty()) {
    summary.total_metrics = 0;
    summary.average_value = 0.0;
    summary.min_value = 0.0;
    summary.max_value = 0.0;
    summary.threshold_distribution.clear();
    return;
  }

  std::vector<double> values;
  for (const auto& metric : metrics) {
    values.push_back(metric.value);
  }
  
  summary.total_metrics = metrics.size();
  summary.average_value = 0.0;
  for (double value : values) {
    summary.average_value += value;
  }
  summary.average_value /= values.size();
  
  summary.min_value = *std::min_element(values.begin(), values.end());
  summary.max_value = *std::max_element(values.begin(), values.end());
  
  // Calculate threshold distribution
  summary.threshold_distribution.clear();
  for (const auto& metric : metrics) {
    summary.threshold_distribution[metric.threshold]++;
  }
}

int PerformanceMonitor::CalculatePerformanceScore(
    const std::vector<PerformanceMetric>& metrics) const {
  
  if (metrics.empty()) return 100;

  std::map<PerformanceThreshold, int> threshold_counts;
  for (const auto& metric : metrics) {
    threshold_counts[metric.threshold]++;
  }

  const int total = metrics.size();
  const double excellent_weight = 1.0;
  const double good_weight = 0.8;
  const double needs_improvement_weight = 0.6;
  const double poor_weight = 0.3;

  const double score = (
    (threshold_counts[PerformanceThreshold::EXCELLENT] * excellent_weight +
     threshold_counts[PerformanceThreshold::GOOD] * good_weight +
     threshold_counts[PerformanceThreshold::NEEDS_IMPROVEMENT] * needs_improvement_weight +
     threshold_counts[PerformanceThreshold::POOR] * poor_weight) / total
  ) * 100;

  return static_cast<int>(std::round(score));
}

std::vector<std::string> PerformanceMonitor::GenerateRecommendations(
    const std::vector<PerformanceMetric>& metrics) const {
  
  std::vector<std::string> recommendations;
  
  std::map<PerformanceMetricType, int> slow_metrics;
  for (const auto& metric : metrics) {
    if (metric.threshold == PerformanceThreshold::POOR) {
      slow_metrics[metric.type]++;
    }
  }
  
  if (slow_metrics[PerformanceMetricType::PAGE_LOAD] > 0) {
    recommendations.push_back("Consider optimizing page load performance by reducing bundle size and implementing lazy loading");
  }
  
  if (slow_metrics[PerformanceMetricType::MEMORY_USAGE] > 0) {
    recommendations.push_back("Memory usage is high - consider implementing memory optimization strategies");
  }
  
  if (slow_metrics[PerformanceMetricType::NETWORK_REQUEST] > 0) {
    recommendations.push_back("Network requests are slow - consider implementing caching and request optimization");
  }
  
  if (slow_metrics[PerformanceMetricType::RENDERING] > 0) {
    recommendations.push_back("Rendering performance is poor - consider optimizing CSS and reducing layout thrashing");
  }
  
  if (slow_metrics[PerformanceMetricType::JAVASCRIPT_EXECUTION] > 0) {
    recommendations.push_back("JavaScript execution is slow - consider code splitting and performance optimization");
  }
  
  return recommendations;
}

void PerformanceMonitor::SetupPerformanceObservers() {
  // In a real implementation, this would set up performance observers
  // for the C++ side of the browser
  logger_->Info("PerformanceMonitor", "Performance observers setup completed");
}

void PerformanceMonitor::StartMonitoring() {
  if (!config_.enable_real_time_monitoring) return;
  
  // In a real implementation, this would start a monitoring thread
  logger_->Info("PerformanceMonitor", "Real-time monitoring started");
}

void PerformanceMonitor::StopMonitoring() {
  // In a real implementation, this would stop the monitoring thread
  logger_->Info("PerformanceMonitor", "Real-time monitoring stopped");
}

} // namespace diagnostics
} // namespace toubkal
