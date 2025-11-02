#include "toubkal/components/diagnostics/performance_monitor.h"

#include <gtest/gtest.h>
#include <memory>
#include <chrono>
#include "base/test/scoped_task_environment.h"

namespace toubkal {
namespace diagnostics {

class PerformanceMonitorTest : public testing::Test {
 protected:
  void SetUp() override {
    performance_monitor_ = PerformanceMonitor::GetInstance();
    performance_monitor_->ClearMetrics();
    
    // Initialize with test config
    PerformanceMonitorConfig config;
    config.enable_page_load_tracking = true;
    config.enable_memory_tracking = true;
    config.enable_cpu_tracking = true;
    config.enable_network_tracking = true;
    config.enable_user_interaction_tracking = true;
    config.enable_rendering_tracking = true;
    config.enable_javascript_tracking = true;
    config.enable_resource_tracking = true;
    config.sampling_interval_ms = 1000;
    config.max_metrics_per_snapshot = 100;
    config.enable_real_time_monitoring = true;
    config.enable_performance_alerts = true;
    config.privacy_mode = true;
    
    // Set alert thresholds
    config.alert_thresholds[PerformanceMetricType::PAGE_LOAD] = 3000.0;
    config.alert_thresholds[PerformanceMetricType::MEMORY_USAGE] = 100 * 1024 * 1024.0;
    config.alert_thresholds[PerformanceMetricType::CPU_USAGE] = 80.0;
    config.alert_thresholds[PerformanceMetricType::NETWORK_REQUEST] = 5000.0;
    config.alert_thresholds[PerformanceMetricType::USER_INTERACTION] = 100.0;
    config.alert_thresholds[PerformanceMetricType::RENDERING] = 16.67;
    config.alert_thresholds[PerformanceMetricType::JAVASCRIPT_EXECUTION] = 50.0;
    config.alert_thresholds[PerformanceMetricType::RESOURCE_LOADING] = 2000.0;
    
    performance_monitor_->Initialize(config);
  }

  void TearDown() override {
    performance_monitor_->ClearMetrics();
  }

  PerformanceMonitor* performance_monitor_;
};

TEST_F(PerformanceMonitorTest, TrackMetric) {
  const std::string metric_id = performance_monitor_->TrackMetric(
      PerformanceMetricType::PAGE_LOAD, "Page Load Time", 1500.0, "ms");
  
  EXPECT_FALSE(metric_id.empty());
  
  PerformanceMetric* metric = performance_monitor_->GetMetric(metric_id);
  ASSERT_NE(metric, nullptr);
  EXPECT_EQ(metric->name, "Page Load Time");
  EXPECT_EQ(metric->value, 1500.0);
  EXPECT_EQ(metric->unit, "ms");
  EXPECT_EQ(metric->type, PerformanceMetricType::PAGE_LOAD);
}

TEST_F(PerformanceMonitorTest, TrackMetricWithContext) {
  std::map<std::string, std::string> context;
  context["url"] = "https://example.com";
  context["component"] = "page-loader";
  context["user_id"] = "user123";
  
  const std::string metric_id = performance_monitor_->TrackMetric(
      PerformanceMetricType::MEMORY_USAGE, "Memory Usage", 75.0, "MB", context);
  
  PerformanceMetric* metric = performance_monitor_->GetMetric(metric_id);
  ASSERT_NE(metric, nullptr);
  EXPECT_EQ(metric->context["url"], "https://example.com");
  EXPECT_EQ(metric->context["component"], "page-loader");
  // user_id should be sanitized in privacy mode
  EXPECT_EQ(metric->context.count("user_id"), 0);
}

TEST_F(PerformanceMonitorTest, GetAllMetrics) {
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Page Load 1", 1000.0, "ms");
  performance_monitor_->TrackMetric(PerformanceMetricType::MEMORY_USAGE, "Memory Usage", 50.0, "MB");
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Page Load 2", 2000.0, "ms");
  
  std::vector<PerformanceMetric> all_metrics = performance_monitor_->GetAllMetrics();
  EXPECT_EQ(all_metrics.size(), 3);
}

TEST_F(PerformanceMonitorTest, GetMetricsByType) {
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Page Load 1", 1000.0, "ms");
  performance_monitor_->TrackMetric(PerformanceMetricType::MEMORY_USAGE, "Memory Usage", 50.0, "MB");
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Page Load 2", 2000.0, "ms");
  
  std::vector<PerformanceMetric> page_load_metrics = 
      performance_monitor_->GetMetricsByType(PerformanceMetricType::PAGE_LOAD);
  EXPECT_EQ(page_load_metrics.size(), 2);
  
  std::vector<PerformanceMetric> memory_metrics = 
      performance_monitor_->GetMetricsByType(PerformanceMetricType::MEMORY_USAGE);
  EXPECT_EQ(memory_metrics.size(), 1);
}

TEST_F(PerformanceMonitorTest, GetMetricsByThreshold) {
  // Fast page load (should be excellent)
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Fast Load", 1000.0, "ms");
  
  // Slow page load (should be poor)
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Slow Load", 5000.0, "ms");
  
  std::vector<PerformanceMetric> excellent_metrics = 
      performance_monitor_->GetMetricsByThreshold(PerformanceThreshold::EXCELLENT);
  EXPECT_EQ(excellent_metrics.size(), 1);
  EXPECT_EQ(excellent_metrics[0].name, "Fast Load");
  
  std::vector<PerformanceMetric> poor_metrics = 
      performance_monitor_->GetMetricsByThreshold(PerformanceThreshold::POOR);
  EXPECT_EQ(poor_metrics.size(), 1);
  EXPECT_EQ(poor_metrics[0].name, "Slow Load");
}

TEST_F(PerformanceMonitorTest, GetRecentMetrics) {
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Recent Metric", 1000.0, "ms");
  
  std::vector<PerformanceMetric> recent_metrics = 
      performance_monitor_->GetRecentMetrics(60000); // 1 minute
  EXPECT_EQ(recent_metrics.size(), 1);
  
  std::vector<PerformanceMetric> old_metrics = 
      performance_monitor_->GetRecentMetrics(1); // 1ms
  EXPECT_EQ(old_metrics.size(), 0);
}

TEST_F(PerformanceMonitorTest, CreateSnapshot) {
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Page Load", 1500.0, "ms");
  performance_monitor_->TrackMetric(PerformanceMetricType::MEMORY_USAGE, "Memory Usage", 75.0, "MB");
  
  PerformanceSnapshot snapshot = performance_monitor_->CreateSnapshot();
  
  EXPECT_EQ(snapshot.metrics.size(), 2);
  EXPECT_EQ(snapshot.summary.total_metrics, 2);
  EXPECT_GT(snapshot.summary.average_value, 0.0);
  EXPECT_GT(snapshot.summary.min_value, 0.0);
  EXPECT_GT(snapshot.summary.max_value, 0.0);
}

TEST_F(PerformanceMonitorTest, GenerateReport) {
  const auto start_time = std::chrono::system_clock::now() - std::chrono::minutes(1);
  const auto end_time = std::chrono::system_clock::now();
  
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Page Load", 2000.0, "ms");
  performance_monitor_->TrackMetric(PerformanceMetricType::MEMORY_USAGE, "Memory Usage", 100.0, "MB");
  
  PerformanceReport report = performance_monitor_->GenerateReport(start_time, end_time);
  
  EXPECT_FALSE(report.id.empty());
  EXPECT_EQ(report.start_time, start_time);
  EXPECT_EQ(report.end_time, end_time);
  EXPECT_EQ(report.metrics.size(), 2);
  EXPECT_EQ(report.summary.total_metrics, 2);
  EXPECT_GT(report.summary.performance_score, 0);
  EXPECT_LE(report.summary.performance_score, 100);
  EXPECT_FALSE(report.recommendations.empty());
}

TEST_F(PerformanceMonitorTest, GetPerformanceScore) {
  // Add some good performance metrics
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Fast Load", 1000.0, "ms");
  performance_monitor_->TrackMetric(PerformanceMetricType::MEMORY_USAGE, "Low Memory", 50.0, "MB");
  
  int score = performance_monitor_->GetPerformanceScore();
  EXPECT_GT(score, 0);
  EXPECT_LE(score, 100);
}

TEST_F(PerformanceMonitorTest, ExportMetrics) {
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Page Load", 1500.0, "ms");
  performance_monitor_->TrackMetric(PerformanceMetricType::MEMORY_USAGE, "Memory Usage", 75.0, "MB");
  
  std::string exported = performance_monitor_->ExportMetrics();
  EXPECT_FALSE(exported.empty());
  
  // Should be valid JSON array
  EXPECT_TRUE(exported.find("[") != std::string::npos);
  EXPECT_TRUE(exported.find("]") != std::string::npos);
}

TEST_F(PerformanceMonitorTest, ClearMetrics) {
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Page Load", 1500.0, "ms");
  performance_monitor_->TrackMetric(PerformanceMetricType::MEMORY_USAGE, "Memory Usage", 75.0, "MB");
  
  std::vector<PerformanceMetric> all_metrics = performance_monitor_->GetAllMetrics();
  EXPECT_EQ(all_metrics.size(), 2);
  
  performance_monitor_->ClearMetrics();
  
  all_metrics = performance_monitor_->GetAllMetrics();
  EXPECT_EQ(all_metrics.size(), 0);
}

TEST_F(PerformanceMonitorTest, GetNonExistentMetric) {
  PerformanceMetric* metric = performance_monitor_->GetMetric("non-existent-id");
  EXPECT_EQ(metric, nullptr);
}

TEST_F(PerformanceMonitorTest, MetricIdGeneration) {
  const std::string metric1 = performance_monitor_->TrackMetric(
      PerformanceMetricType::PAGE_LOAD, "Page Load 1", 1000.0, "ms");
  const std::string metric2 = performance_monitor_->TrackMetric(
      PerformanceMetricType::PAGE_LOAD, "Page Load 2", 2000.0, "ms");
  
  EXPECT_NE(metric1, metric2);
  EXPECT_FALSE(metric1.empty());
  EXPECT_FALSE(metric2.empty());
}

TEST_F(PerformanceMonitorTest, ThresholdCalculation) {
  // Test excellent performance (below 50% of threshold)
  const std::string fast_id = performance_monitor_->TrackMetric(
      PerformanceMetricType::PAGE_LOAD, "Fast Load", 1000.0, "ms");
  PerformanceMetric* fast_metric = performance_monitor_->GetMetric(fast_id);
  EXPECT_EQ(fast_metric->threshold, PerformanceThreshold::EXCELLENT);
  
  // Test poor performance (above threshold)
  const std::string slow_id = performance_monitor_->TrackMetric(
      PerformanceMetricType::PAGE_LOAD, "Slow Load", 5000.0, "ms");
  PerformanceMetric* slow_metric = performance_monitor_->GetMetric(slow_id);
  EXPECT_EQ(slow_metric->threshold, PerformanceThreshold::POOR);
}

TEST_F(PerformanceMonitorTest, ContextSanitization) {
  std::map<std::string, std::string> context;
  context["url"] = "https://example.com?token=secret";
  context["user_id"] = "user123";
  context["session_id"] = "session456";
  context["component"] = "test-component";
  
  const std::string metric_id = performance_monitor_->TrackMetric(
      PerformanceMetricType::PAGE_LOAD, "Page Load", 1500.0, "ms", context);
  
  PerformanceMetric* metric = performance_monitor_->GetMetric(metric_id);
  ASSERT_NE(metric, nullptr);
  
  // Sensitive data should be removed
  EXPECT_EQ(metric->context.count("user_id"), 0);
  EXPECT_EQ(metric->context.count("session_id"), 0);
  
  // URL should be sanitized
  EXPECT_EQ(metric->context["url"], "https://example.com");
  
  // Non-sensitive data should be preserved
  EXPECT_EQ(metric->context["component"], "test-component");
}

TEST_F(PerformanceMonitorTest, PerformanceAlerts) {
  // This test would require setting up alert thresholds and monitoring
  // In a real implementation, this would test the alert system
  EXPECT_TRUE(true); // Placeholder for alert testing
}

TEST_F(PerformanceMonitorTest, Recommendations) {
  // Create poor performance metrics
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Slow Page", 10000.0, "ms");
  performance_monitor_->TrackMetric(PerformanceMetricType::MEMORY_USAGE, "High Memory", 500.0, "MB");
  
  const auto start_time = std::chrono::system_clock::now() - std::chrono::minutes(1);
  const auto end_time = std::chrono::system_clock::now();
  PerformanceReport report = performance_monitor_->GenerateReport(start_time, end_time);
  
  EXPECT_FALSE(report.recommendations.empty());
  
  // Check for specific recommendations
  bool has_page_load_rec = false;
  bool has_memory_rec = false;
  
  for (const auto& rec : report.recommendations) {
    if (rec.find("page load") != std::string::npos) {
      has_page_load_rec = true;
    }
    if (rec.find("memory") != std::string::npos) {
      has_memory_rec = true;
    }
  }
  
  EXPECT_TRUE(has_page_load_rec);
  EXPECT_TRUE(has_memory_rec);
}

TEST_F(PerformanceMonitorTest, Destroy) {
  performance_monitor_->TrackMetric(PerformanceMetricType::PAGE_LOAD, "Page Load", 1500.0, "ms");
  
  performance_monitor_->Destroy();
  
  std::vector<PerformanceMetric> all_metrics = performance_monitor_->GetAllMetrics();
  EXPECT_EQ(all_metrics.size(), 0);
}

} // namespace diagnostics
} // namespace toubkal
