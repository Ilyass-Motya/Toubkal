#ifndef TOUBKAL_COMPONENTS_DIAGNOSTICS_PERFORMANCE_MONITOR_H_
#define TOUBKAL_COMPONENTS_DIAGNOSTICS_PERFORMANCE_MONITOR_H_

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <chrono>
#include "base/memory/singleton.h"
#include "toubkal/components/diagnostics/logging/logger.h"

namespace toubkal {
namespace diagnostics {

enum class PerformanceMetricType {
  PAGE_LOAD = 0,
  MEMORY_USAGE,
  CPU_USAGE,
  NETWORK_REQUEST,
  USER_INTERACTION,
  RENDERING,
  JAVASCRIPT_EXECUTION,
  RESOURCE_LOADING
};

enum class PerformanceThreshold {
  EXCELLENT = 0,
  GOOD,
  NEEDS_IMPROVEMENT,
  POOR
};

struct PerformanceMetric {
  std::string id;
  PerformanceMetricType type;
  std::string name;
  double value;
  std::string unit;
  std::chrono::system_clock::time_point timestamp;
  std::string url;
  std::string component;
  std::map<std::string, std::string> context;
  PerformanceThreshold threshold;
};

struct PerformanceSnapshot {
  std::chrono::system_clock::time_point timestamp;
  std::vector<PerformanceMetric> metrics;
  struct {
    int total_metrics;
    double average_value;
    double min_value;
    double max_value;
    std::map<PerformanceThreshold, int> threshold_distribution;
  } summary;
};

struct PerformanceReport {
  std::string id;
  std::chrono::system_clock::time_point start_time;
  std::chrono::system_clock::time_point end_time;
  std::chrono::milliseconds duration;
  std::vector<PerformanceMetric> metrics;
  struct {
    int total_metrics;
    double average_value;
    double min_value;
    double max_value;
    std::map<PerformanceThreshold, int> threshold_distribution;
    std::vector<PerformanceMetric> top_slowest_metrics;
    int performance_score;
  } summary;
  std::vector<std::string> recommendations;
};

struct PerformanceMonitorConfig {
  bool enable_page_load_tracking;
  bool enable_memory_tracking;
  bool enable_cpu_tracking;
  bool enable_network_tracking;
  bool enable_user_interaction_tracking;
  bool enable_rendering_tracking;
  bool enable_javascript_tracking;
  bool enable_resource_tracking;
  int sampling_interval_ms;
  int max_metrics_per_snapshot;
  bool enable_real_time_monitoring;
  bool enable_performance_alerts;
  std::map<PerformanceMetricType, double> alert_thresholds;
  bool privacy_mode;
};

class PerformanceMonitor {
 public:
  static PerformanceMonitor* GetInstance();

  void Initialize(const PerformanceMonitorConfig& config);
  
  std::string TrackMetric(
      PerformanceMetricType type,
      const std::string& name,
      double value,
      const std::string& unit,
      const std::map<std::string, std::string>& context = {});
  
  PerformanceMetric* GetMetric(const std::string& metric_id);
  std::vector<PerformanceMetric> GetAllMetrics() const;
  std::vector<PerformanceMetric> GetMetricsByType(PerformanceMetricType type) const;
  std::vector<PerformanceMetric> GetMetricsByThreshold(PerformanceThreshold threshold) const;
  std::vector<PerformanceMetric> GetRecentMetrics(int time_window_ms = 60000) const;
  
  PerformanceSnapshot CreateSnapshot();
  PerformanceReport GenerateReport(
      const std::chrono::system_clock::time_point& start_time,
      const std::chrono::system_clock::time_point& end_time);
  
  int GetPerformanceScore() const;
  
  std::string ExportMetrics() const;
  void ClearMetrics();
  void Destroy();

 private:
  PerformanceMonitor();
  ~PerformanceMonitor();
  PerformanceMonitor(const PerformanceMonitor&) = delete;
  PerformanceMonitor& operator=(const PerformanceMonitor&) = delete;

  std::string GenerateMetricId(
      PerformanceMetricType type,
      const std::string& name,
      double value);
  
  std::string GenerateReportId(
      const std::chrono::system_clock::time_point& start_time,
      const std::chrono::system_clock::time_point& end_time);
  
  PerformanceThreshold CalculateThreshold(
      PerformanceMetricType type,
      double value);
  
  bool ShouldAlert(const PerformanceMetric& metric);
  void TriggerPerformanceAlert(const PerformanceMetric& metric);
  
  std::map<std::string, std::string> SanitizeContext(
      const std::map<std::string, std::string>& context);
  
  void CalculateSnapshotSummary(
      const std::vector<PerformanceMetric>& metrics,
      PerformanceSnapshot::summary& summary);
  
  int CalculatePerformanceScore(
      const std::vector<PerformanceMetric>& metrics) const;
  
  std::vector<std::string> GenerateRecommendations(
      const std::vector<PerformanceMetric>& metrics) const;
  
  void SetupPerformanceObservers();
  void StartMonitoring();
  void StopMonitoring();

  Logger* logger_;
  PerformanceMonitorConfig config_;
  std::map<std::string, PerformanceMetric> metrics_;
  std::vector<PerformanceSnapshot> snapshots_;
  bool is_initialized_;
  std::chrono::system_clock::time_point monitoring_start_time_;
};

} // namespace diagnostics
} // namespace toubkal

#endif // TOUBKAL_COMPONENTS_DIAGNOSTICS_PERFORMANCE_MONITOR_H_
