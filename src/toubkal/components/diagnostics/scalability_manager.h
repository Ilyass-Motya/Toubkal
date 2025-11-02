#ifndef TOUBKAL_COMPONENTS_DIAGNOSTICS_SCALABILITY_MANAGER_H_
#define TOUBKAL_COMPONENTS_DIAGNOSTICS_SCALABILITY_MANAGER_H_

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <chrono>
#include "base/memory/singleton.h"
#include "toubkal/components/diagnostics/logging/logger.h"

namespace toubkal {
namespace diagnostics {

enum class ScalabilityMode {
  SINGLE_INSTANCE = 0,
  CLUSTER,
  DISTRIBUTED,
  CLOUD
};

enum class ResourceType {
  CPU = 0,
  MEMORY,
  NETWORK,
  STORAGE,
  GPU
};

enum class LoadBalancingStrategy {
  ROUND_ROBIN = 0,
  LEAST_CONNECTIONS,
  WEIGHTED_ROUND_ROBIN,
  LEAST_RESPONSE_TIME,
  IP_HASH,
  RANDOM
};

struct ResourceLimits {
  double cpu; // CPU percentage
  int64_t memory; // Memory in bytes
  int64_t network; // Network bandwidth in bytes/second
  int64_t storage; // Storage in bytes
  int64_t gpu; // GPU memory in bytes
};

struct ResourceUsage {
  double cpu;
  int64_t memory;
  int64_t network;
  int64_t storage;
  int64_t gpu;
  std::chrono::system_clock::time_point timestamp;
};

struct NodeInfo {
  std::string id;
  std::string hostname;
  int port;
  std::string status; // "active", "inactive", "maintenance", "overloaded"
  ResourceUsage resources;
  ResourceLimits limits;
  double load; // Current load percentage
  std::chrono::system_clock::time_point last_heartbeat;
  std::vector<std::string> capabilities;
  std::string region;
  std::string zone;
};

struct LoadBalancerConfig {
  LoadBalancingStrategy strategy;
  int health_check_interval_ms;
  int max_retries;
  int timeout_ms;
  bool sticky_sessions;
  int session_timeout_ms;
  bool failover_enabled;
  int circuit_breaker_threshold;
};

struct ClusterConfig {
  ScalabilityMode mode;
  int max_nodes;
  int min_nodes;
  bool auto_scaling;
  double scale_up_threshold;
  double scale_down_threshold;
  int cooldown_period_ms;
  LoadBalancerConfig load_balancer;
  ResourceLimits resource_limits;
};

struct ScalingDecision {
  std::string action; // "scale_up", "scale_down", "maintain"
  std::string reason;
  int target_nodes;
  int current_nodes;
  struct {
    double cpu;
    double memory;
    double load;
    double response_time;
  } metrics;
  std::chrono::system_clock::time_point timestamp;
};

struct ScalabilityMetrics {
  int total_nodes;
  int active_nodes;
  double average_load;
  double average_response_time;
  ResourceUsage resource_utilization;
  std::vector<ScalingDecision> scaling_events;
  std::string health_status; // "healthy", "degraded", "critical"
};

class ScalabilityManager {
 public:
  static ScalabilityManager* GetInstance();

  void Initialize(const ClusterConfig& config);
  
  std::string AddNode(const NodeInfo& node_info);
  bool RemoveNode(const std::string& node_id);
  bool UpdateNodeStatus(const std::string& node_id, const std::string& status);
  bool UpdateNodeResources(const std::string& node_id, const ResourceUsage& resources);
  
  NodeInfo* GetNode(const std::string& node_id);
  std::vector<NodeInfo> GetAllNodes() const;
  std::vector<NodeInfo> GetActiveNodes() const;
  NodeInfo* SelectNode(const std::string& request_id = "");
  
  ScalabilityMetrics GetScalabilityMetrics() const;
  ScalingDecision ShouldScale() const;
  bool ExecuteScaling(const ScalingDecision& decision);
  
  std::string ExportClusterState() const;
  void ClearCluster();

 private:
  ScalabilityManager();
  ~ScalabilityManager();
  ScalabilityManager(const ScalabilityManager&) = delete;
  ScalabilityManager& operator=(const ScalabilityManager&) = delete;

  std::string GenerateNodeId(const std::string& hostname, int port);
  double CalculateNodeLoad(const NodeInfo& node) const;
  ResourceUsage CalculateResourceUtilization() const;
  double CalculateAverageResponseTime() const;
  std::string CalculateHealthStatus() const;
  std::vector<ScalingDecision> GetRecentScalingEvents() const;
  
  NodeInfo* SelectRoundRobin(const std::vector<NodeInfo>& nodes);
  NodeInfo* SelectLeastConnections(const std::vector<NodeInfo>& nodes);
  NodeInfo* SelectWeightedRoundRobin(const std::vector<NodeInfo>& nodes);
  NodeInfo* SelectLeastResponseTime(const std::vector<NodeInfo>& nodes);
  NodeInfo* SelectIPHash(const std::vector<NodeInfo>& nodes, const std::string& request_id);
  NodeInfo* SelectRandom(const std::vector<NodeInfo>& nodes);
  
  uint32_t HashString(const std::string& str) const;
  
  bool ScaleUp(int target_nodes);
  bool ScaleDown(int target_nodes);
  
  void PerformHealthChecks();
  void CheckScaling();

  Logger* logger_;
  ClusterConfig config_;
  std::map<std::string, NodeInfo> nodes_;
  bool is_initialized_;
  std::chrono::system_clock::time_point scaling_cooldown_;
  int node_counter_;
};

} // namespace diagnostics
} // namespace toubkal

#endif // TOUBKAL_COMPONENTS_DIAGNOSTICS_SCALABILITY_MANAGER_H_
