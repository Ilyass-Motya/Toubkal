#include "toubkal/components/diagnostics/scalability_manager.h"

#include <sstream>
#include <iomanip>
#include <algorithm>
#include <ctime>
#include <cmath>
#include <random>
#include "base/logging.h"
#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"

namespace toubkal {
namespace diagnostics {

ScalabilityManager* ScalabilityManager::GetInstance() {
  return base::Singleton<ScalabilityManager>::get();
}

ScalabilityManager::ScalabilityManager() 
    : logger_(Logger::GetInstance()),
      is_initialized_(false),
      node_counter_(0) {
  config_ = {
    ScalabilityMode::SINGLE_INSTANCE,
    1,    // max_nodes
    1,    // min_nodes
    false, // auto_scaling
    80.0,  // scale_up_threshold
    20.0,  // scale_down_threshold
    300000, // cooldown_period_ms (5 minutes)
    {
      LoadBalancingStrategy::ROUND_ROBIN,
      30000,  // health_check_interval_ms
      3,      // max_retries
      5000,   // timeout_ms
      false,  // sticky_sessions
      1800000, // session_timeout_ms (30 minutes)
      true,   // failover_enabled
      5       // circuit_breaker_threshold
    },
    {
      80.0,                    // cpu
      8LL * 1024 * 1024 * 1024, // memory (8GB)
      100LL * 1024 * 1024,      // network (100MB/s)
      100LL * 1024 * 1024 * 1024, // storage (100GB)
      2LL * 1024 * 1024 * 1024   // gpu (2GB)
    }
  };
}

ScalabilityManager::~ScalabilityManager() = default;

void ScalabilityManager::Initialize(const ClusterConfig& config) {
  config_ = config;
  is_initialized_ = true;
  
  logger_->Info("ScalabilityManager", "Scalability framework initialized", {
    {"mode", std::to_string(static_cast<int>(config_.mode))},
    {"max_nodes", std::to_string(config_.max_nodes)},
    {"auto_scaling", config_.auto_scaling ? "true" : "false"}
  });
}

std::string ScalabilityManager::AddNode(const NodeInfo& node_info) {
  if (!is_initialized_) {
    Initialize(config_);
  }

  const std::string node_id = GenerateNodeId(node_info.hostname, node_info.port);
  NodeInfo node = node_info;
  node.id = node_id;
  node.last_heartbeat = std::chrono::system_clock::now();
  
  nodes_[node_id] = node;
  
  logger_->Info("ScalabilityManager", "Node added to cluster", {
    {"node_id", node_id},
    {"hostname", node.hostname},
    {"port", std::to_string(node.port)},
    {"status", node.status}
  });

  return node_id;
}

bool ScalabilityManager::RemoveNode(const std::string& node_id) {
  auto it = nodes_.find(node_id);
  if (it == nodes_.end()) {
    return false;
  }

  const NodeInfo& node = it->second;
  nodes_.erase(it);
  
  logger_->Info("ScalabilityManager", "Node removed from cluster", {
    {"node_id", node_id},
    {"hostname", node.hostname},
    {"port", std::to_string(node.port)}
  });

  return true;
}

bool ScalabilityManager::UpdateNodeStatus(const std::string& node_id, const std::string& status) {
  auto it = nodes_.find(node_id);
  if (it == nodes_.end()) {
    return false;
  }

  it->second.status = status;
  it->second.last_heartbeat = std::chrono::system_clock::now();
  
  logger_->Debug("ScalabilityManager", "Node status updated", {
    {"node_id", node_id},
    {"status", status},
    {"hostname", it->second.hostname}
  });

  return true;
}

bool ScalabilityManager::UpdateNodeResources(const std::string& node_id, const ResourceUsage& resources) {
  auto it = nodes_.find(node_id);
  if (it == nodes_.end()) {
    return false;
  }

  it->second.resources = resources;
  it->second.last_heartbeat = std::chrono::system_clock::now();
  
  // Calculate load percentage
  it->second.load = CalculateNodeLoad(it->second);
  
  logger_->Debug("ScalabilityManager", "Node resources updated", {
    {"node_id", node_id},
    {"load", std::to_string(it->second.load)},
    {"cpu", std::to_string(resources.cpu)},
    {"memory", std::to_string(resources.memory)}
  });

  return true;
}

NodeInfo* ScalabilityManager::GetNode(const std::string& node_id) {
  auto it = nodes_.find(node_id);
  return (it != nodes_.end()) ? &it->second : nullptr;
}

std::vector<NodeInfo> ScalabilityManager::GetAllNodes() const {
  std::vector<NodeInfo> all_nodes;
  for (const auto& pair : nodes_) {
    all_nodes.push_back(pair.second);
  }
  return all_nodes;
}

std::vector<NodeInfo> ScalabilityManager::GetActiveNodes() const {
  std::vector<NodeInfo> active_nodes;
  for (const auto& pair : nodes_) {
    if (pair.second.status == "active") {
      active_nodes.push_back(pair.second);
    }
  }
  return active_nodes;
}

NodeInfo* ScalabilityManager::SelectNode(const std::string& request_id) {
  const std::vector<NodeInfo> active_nodes = GetActiveNodes();
  if (active_nodes.empty()) {
    return nullptr;
  }

  switch (config_.load_balancer.strategy) {
    case LoadBalancingStrategy::ROUND_ROBIN:
      return SelectRoundRobin(active_nodes);
    case LoadBalancingStrategy::LEAST_CONNECTIONS:
      return SelectLeastConnections(active_nodes);
    case LoadBalancingStrategy::WEIGHTED_ROUND_ROBIN:
      return SelectWeightedRoundRobin(active_nodes);
    case LoadBalancingStrategy::LEAST_RESPONSE_TIME:
      return SelectLeastResponseTime(active_nodes);
    case LoadBalancingStrategy::IP_HASH:
      return SelectIPHash(active_nodes, request_id);
    case LoadBalancingStrategy::RANDOM:
      return SelectRandom(active_nodes);
    default:
      return SelectRoundRobin(active_nodes);
  }
}

ScalabilityMetrics ScalabilityManager::GetScalabilityMetrics() const {
  const std::vector<NodeInfo> all_nodes = GetAllNodes();
  const std::vector<NodeInfo> active_nodes = GetActiveNodes();
  
  const int total_nodes = all_nodes.size();
  const int active_node_count = active_nodes.size();
  
  const double average_load = active_nodes.empty() ? 0.0 :
    std::accumulate(active_nodes.begin(), active_nodes.end(), 0.0,
      [](double sum, const NodeInfo& node) { return sum + node.load; }) / active_nodes.size();
  
  const double average_response_time = CalculateAverageResponseTime();
  const ResourceUsage resource_utilization = CalculateResourceUtilization();
  const std::vector<ScalingDecision> scaling_events = GetRecentScalingEvents();
  const std::string health_status = CalculateHealthStatus();
  
  return {
    total_nodes,
    active_node_count,
    average_load,
    average_response_time,
    resource_utilization,
    scaling_events,
    health_status
  };
}

ScalingDecision ScalabilityManager::ShouldScale() const {
  if (!config_.auto_scaling) {
    return {"maintain", "Auto-scaling disabled", 0, 0, {0, 0, 0, 0}, std::chrono::system_clock::now()};
  }

  // Check cooldown period
  const auto now = std::chrono::system_clock::now();
  if (now - scaling_cooldown_ < std::chrono::milliseconds(config_.cooldown_period_ms)) {
    return {"maintain", "Cooldown period active", 0, 0, {0, 0, 0, 0}, now};
  }

  const ScalabilityMetrics metrics = GetScalabilityMetrics();
  const int current_nodes = metrics.active_nodes;
  
  // Scale up conditions
  if (current_nodes < config_.max_nodes && 
      (metrics.average_load > config_.scale_up_threshold || 
       metrics.resource_utilization.cpu > config_.scale_up_threshold ||
       metrics.resource_utilization.memory > config_.scale_up_threshold)) {
    
    const int target_nodes = std::min(current_nodes + 1, config_.max_nodes);
    
    return {
      "scale_up",
      "High load detected: " + std::to_string(metrics.average_load),
      target_nodes,
      current_nodes,
      {
        metrics.resource_utilization.cpu,
        metrics.resource_utilization.memory,
        metrics.average_load,
        metrics.average_response_time
      },
      now
    };
  }
  
  // Scale down conditions
  if (current_nodes > config_.min_nodes && 
      metrics.average_load < config_.scale_down_threshold &&
      metrics.resource_utilization.cpu < config_.scale_down_threshold &&
      metrics.resource_utilization.memory < config_.scale_down_threshold) {
    
    const int target_nodes = std::max(current_nodes - 1, config_.min_nodes);
    
    return {
      "scale_down",
      "Low load detected: " + std::to_string(metrics.average_load),
      target_nodes,
      current_nodes,
      {
        metrics.resource_utilization.cpu,
        metrics.resource_utilization.memory,
        metrics.average_load,
        metrics.average_response_time
      },
      now
    };
  }
  
  return {
    "maintain",
    "Load within acceptable range",
    current_nodes,
    current_nodes,
    {
      metrics.resource_utilization.cpu,
      metrics.resource_utilization.memory,
      metrics.average_load,
      metrics.average_response_time
    },
    now
  };
}

bool ScalabilityManager::ExecuteScaling(const ScalingDecision& decision) {
  if (decision.action == "maintain") {
    return true;
  }

  scaling_cooldown_ = std::chrono::system_clock::now();
  
  if (decision.action == "scale_up") {
    return ScaleUp(decision.target_nodes);
  } else if (decision.action == "scale_down") {
    return ScaleDown(decision.target_nodes);
  }
  
  return false;
}

std::string ScalabilityManager::ExportClusterState() const {
  std::ostringstream json;
  json << "{\n";
  json << "  \"config\": {\n";
  json << "    \"mode\": " << static_cast<int>(config_.mode) << ",\n";
  json << "    \"max_nodes\": " << config_.max_nodes << ",\n";
  json << "    \"min_nodes\": " << config_.min_nodes << ",\n";
  json << "    \"auto_scaling\": " << (config_.auto_scaling ? "true" : "false") << "\n";
  json << "  },\n";
  json << "  \"nodes\": [\n";
  
  bool first = true;
  for (const auto& pair : nodes_) {
    if (!first) {
      json << ",\n";
    }
    first = false;
    
    const NodeInfo& node = pair.second;
    json << "    {\n";
    json << "      \"id\": \"" << node.id << "\",\n";
    json << "      \"hostname\": \"" << node.hostname << "\",\n";
    json << "      \"port\": " << node.port << ",\n";
    json << "      \"status\": \"" << node.status << "\",\n";
    json << "      \"load\": " << node.load << "\n";
    json << "    }";
  }
  
  json << "\n  ],\n";
  json << "  \"timestamp\": " << std::chrono::duration_cast<std::chrono::seconds>(
      std::chrono::system_clock::now().time_since_epoch()).count() << "\n";
  json << "}";
  
  return json.str();
}

void ScalabilityManager::ClearCluster() {
  nodes_.clear();
  scaling_cooldown_ = std::chrono::system_clock::time_point{};
  logger_->Info("ScalabilityManager", "Cluster state cleared");
}

std::string ScalabilityManager::GenerateNodeId(const std::string& hostname, int port) {
  const std::string key = hostname + ":" + std::to_string(port) + ":" + 
                         std::to_string(std::chrono::duration_cast<std::chrono::milliseconds>(
                         std::chrono::system_clock::now().time_since_epoch()).count());
  
  std::hash<std::string> hasher;
  const size_t hash = hasher(key);
  
  std::ostringstream oss;
  oss << std::hex << hash;
  return oss.str().substr(0, 16);
}

double ScalabilityManager::CalculateNodeLoad(const NodeInfo& node) const {
  const double cpu_weight = 0.4;
  const double memory_weight = 0.3;
  const double network_weight = 0.2;
  const double storage_weight = 0.1;
  
  const double cpu_load = (node.resources.cpu / 100.0) * 100.0;
  const double memory_load = (static_cast<double>(node.resources.memory) / node.limits.memory) * 100.0;
  const double network_load = (static_cast<double>(node.resources.network) / node.limits.network) * 100.0;
  const double storage_load = (static_cast<double>(node.resources.storage) / node.limits.storage) * 100.0;
  
  return (cpu_load * cpu_weight + memory_load * memory_weight + 
          network_load * network_weight + storage_load * storage_weight);
}

ResourceUsage ScalabilityManager::CalculateResourceUtilization() const {
  const std::vector<NodeInfo> active_nodes = GetActiveNodes();
  if (active_nodes.empty()) {
    return {0, 0, 0, 0, 0, std::chrono::system_clock::now()};
  }

  double total_cpu = 0.0;
  int64_t total_memory = 0;
  int64_t total_network = 0;
  int64_t total_storage = 0;
  int64_t total_gpu = 0;
  
  for (const NodeInfo& node : active_nodes) {
    total_cpu += node.resources.cpu;
    total_memory += node.resources.memory;
    total_network += node.resources.network;
    total_storage += node.resources.storage;
    total_gpu += node.resources.gpu;
  }

  return {
    total_cpu / active_nodes.size(),
    total_memory / active_nodes.size(),
    total_network / active_nodes.size(),
    total_storage / active_nodes.size(),
    total_gpu / active_nodes.size(),
    std::chrono::system_clock::now()
  };
}

double ScalabilityManager::CalculateAverageResponseTime() const {
  // This would integrate with performance monitoring
  // For now, return a mock value
  return 100.0; // ms
}

std::string ScalabilityManager::CalculateHealthStatus() const {
  const ScalabilityMetrics metrics = GetScalabilityMetrics();
  
  if (metrics.active_nodes == 0) {
    return "critical";
  }
  
  if (metrics.average_load > 90.0 || metrics.resource_utilization.cpu > 90.0) {
    return "critical";
  }
  
  if (metrics.average_load > 70.0 || metrics.resource_utilization.cpu > 70.0) {
    return "degraded";
  }
  
  return "healthy";
}

std::vector<ScalingDecision> ScalabilityManager::GetRecentScalingEvents() const {
  // This would be implemented with a proper event store
  // For now, return empty vector
  return {};
}

NodeInfo* ScalabilityManager::SelectRoundRobin(const std::vector<NodeInfo>& nodes) {
  if (nodes.empty()) return nullptr;
  
  static int counter = 0;
  return const_cast<NodeInfo*>(&nodes[counter++ % nodes.size()]);
}

NodeInfo* ScalabilityManager::SelectLeastConnections(const std::vector<NodeInfo>& nodes) {
  if (nodes.empty()) return nullptr;
  
  auto min_it = std::min_element(nodes.begin(), nodes.end(),
    [](const NodeInfo& a, const NodeInfo& b) { return a.load < b.load; });
  
  return const_cast<NodeInfo*>(&(*min_it));
}

NodeInfo* ScalabilityManager::SelectWeightedRoundRobin(const std::vector<NodeInfo>& nodes) {
  if (nodes.empty()) return nullptr;
  
  double total_weight = 0.0;
  for (const NodeInfo& node : nodes) {
    total_weight += (100.0 - node.load);
  }
  
  static std::random_device rd;
  static std::mt19937 gen(rd());
  std::uniform_real_distribution<> dis(0.0, total_weight);
  double random = dis(gen);
  
  for (const NodeInfo& node : nodes) {
    random -= (100.0 - node.load);
    if (random <= 0.0) {
      return const_cast<NodeInfo*>(&node);
    }
  }
  
  return const_cast<NodeInfo*>(&nodes[0]);
}

NodeInfo* ScalabilityManager::SelectLeastResponseTime(const std::vector<NodeInfo>& nodes) {
  if (nodes.empty()) return nullptr;
  
  auto min_it = std::min_element(nodes.begin(), nodes.end(),
    [](const NodeInfo& a, const NodeInfo& b) { return a.load < b.load; });
  
  return const_cast<NodeInfo*>(&(*min_it));
}

NodeInfo* ScalabilityManager::SelectIPHash(const std::vector<NodeInfo>& nodes, const std::string& request_id) {
  if (nodes.empty()) return nullptr;
  if (request_id.empty()) return SelectRandom(nodes);
  
  const uint32_t hash = HashString(request_id);
  const size_t index = hash % nodes.size();
  return const_cast<NodeInfo*>(&nodes[index]);
}

NodeInfo* ScalabilityManager::SelectRandom(const std::vector<NodeInfo>& nodes) {
  if (nodes.empty()) return nullptr;
  
  static std::random_device rd;
  static std::mt19937 gen(rd());
  std::uniform_int_distribution<> dis(0, nodes.size() - 1);
  
  const size_t index = dis(gen);
  return const_cast<NodeInfo*>(&nodes[index]);
}

uint32_t ScalabilityManager::HashString(const std::string& str) const {
  uint32_t hash = 0;
  for (char c : str) {
    hash = ((hash << 5) - hash) + static_cast<uint32_t>(c);
  }
  return hash;
}

bool ScalabilityManager::ScaleUp(int target_nodes) {
  logger_->Info("ScalabilityManager", "Scaling up cluster", {
    {"target_nodes", std::to_string(target_nodes)},
    {"current_nodes", std::to_string(nodes_.size())}
  });
  
  // Mock implementation - in reality, this would provision new nodes
  return true;
}

bool ScalabilityManager::ScaleDown(int target_nodes) {
  logger_->Info("ScalabilityManager", "Scaling down cluster", {
    {"target_nodes", std::to_string(target_nodes)},
    {"current_nodes", std::to_string(nodes_.size())}
  });
  
  // Mock implementation - in reality, this would terminate nodes
  return true;
}

void ScalabilityManager::PerformHealthChecks() {
  const auto now = std::chrono::system_clock::now();
  const auto timeout = std::chrono::milliseconds(config_.load_balancer.timeout_ms);
  
  for (auto& pair : nodes_) {
    if (now - pair.second.last_heartbeat > timeout) {
      if (pair.second.status == "active") {
        pair.second.status = "inactive";
        logger_->Warn("ScalabilityManager", "Node marked as inactive due to timeout", {
          {"node_id", pair.first},
          {"hostname", pair.second.hostname}
        });
      }
    }
  }
}

void ScalabilityManager::CheckScaling() {
  const ScalingDecision decision = ShouldScale();
  if (decision.action != "maintain") {
    ExecuteScaling(decision);
    
    logger_->Info("ScalabilityManager", "Scaling decision executed", {
      {"action", decision.action},
      {"reason", decision.reason},
      {"target_nodes", std::to_string(decision.target_nodes)},
      {"current_nodes", std::to_string(decision.current_nodes)}
    });
  }
}

} // namespace diagnostics
} // namespace toubkal
