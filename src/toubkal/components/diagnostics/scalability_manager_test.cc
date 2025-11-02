#include "toubkal/components/diagnostics/scalability_manager.h"

#include <gtest/gtest.h>
#include <memory>
#include <chrono>
#include "base/test/scoped_task_environment.h"

namespace toubkal {
namespace diagnostics {

class ScalabilityManagerTest : public testing::Test {
 protected:
  void SetUp() override {
    scalability_manager_ = ScalabilityManager::GetInstance();
    scalability_manager_->ClearCluster();
    
    // Initialize with test config
    ClusterConfig config;
    config.mode = ScalabilityMode::CLUSTER;
    config.max_nodes = 5;
    config.min_nodes = 1;
    config.auto_scaling = true;
    config.scale_up_threshold = 80.0;
    config.scale_down_threshold = 20.0;
    config.cooldown_period_ms = 300000; // 5 minutes
    config.load_balancer = {
      LoadBalancingStrategy::ROUND_ROBIN,
      30000,  // health_check_interval_ms
      3,      // max_retries
      5000,   // timeout_ms
      false,  // sticky_sessions
      1800000, // session_timeout_ms
      true,   // failover_enabled
      5       // circuit_breaker_threshold
    };
    config.resource_limits = {
      80.0,                    // cpu
      8LL * 1024 * 1024 * 1024, // memory (8GB)
      100LL * 1024 * 1024,      // network (100MB/s)
      100LL * 1024 * 1024 * 1024, // storage (100GB)
      2LL * 1024 * 1024 * 1024   // gpu (2GB)
    };
    
    scalability_manager_->Initialize(config);
  }

  void TearDown() override {
    scalability_manager_->ClearCluster();
  }

  ScalabilityManager* scalability_manager_;
};

TEST_F(ScalabilityManagerTest, AddNode) {
  NodeInfo node_info;
  node_info.hostname = "node1.example.com";
  node_info.port = 8080;
  node_info.status = "active";
  node_info.resources = {
    50.0,                    // cpu
    4LL * 1024 * 1024 * 1024, // memory (4GB)
    50LL * 1024 * 1024,       // network (50MB/s)
    50LL * 1024 * 1024 * 1024, // storage (50GB)
    1LL * 1024 * 1024 * 1024,  // gpu (1GB)
    std::chrono::system_clock::now()
  };
  node_info.limits = {
    80.0,                    // cpu
    8LL * 1024 * 1024 * 1024, // memory (8GB)
    100LL * 1024 * 1024,      // network (100MB/s)
    100LL * 1024 * 1024 * 1024, // storage (100GB)
    2LL * 1024 * 1024 * 1024   // gpu (2GB)
  };
  node_info.load = 0.0;
  node_info.capabilities = {"web", "api"};
  node_info.region = "us-west-1";
  node_info.zone = "us-west-1a";
  
  const std::string node_id = scalability_manager_->AddNode(node_info);
  
  EXPECT_FALSE(node_id.empty());
  
  NodeInfo* retrieved_node = scalability_manager_->GetNode(node_id);
  ASSERT_NE(retrieved_node, nullptr);
  EXPECT_EQ(retrieved_node->hostname, "node1.example.com");
  EXPECT_EQ(retrieved_node->port, 8080);
  EXPECT_EQ(retrieved_node->status, "active");
}

TEST_F(ScalabilityManagerTest, RemoveNode) {
  NodeInfo node_info;
  node_info.hostname = "node1.example.com";
  node_info.port = 8080;
  node_info.status = "active";
  node_info.resources = {
    50.0, 4LL * 1024 * 1024 * 1024, 50LL * 1024 * 1024,
    50LL * 1024 * 1024 * 1024, 1LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info.load = 0.0;
  node_info.capabilities = {"web", "api"};
  
  const std::string node_id = scalability_manager_->AddNode(node_info);
  EXPECT_FALSE(node_id.empty());
  
  bool result = scalability_manager_->RemoveNode(node_id);
  EXPECT_TRUE(result);
  
  NodeInfo* retrieved_node = scalability_manager_->GetNode(node_id);
  EXPECT_EQ(retrieved_node, nullptr);
}

TEST_F(ScalabilityManagerTest, UpdateNodeStatus) {
  NodeInfo node_info;
  node_info.hostname = "node1.example.com";
  node_info.port = 8080;
  node_info.status = "active";
  node_info.resources = {
    50.0, 4LL * 1024 * 1024 * 1024, 50LL * 1024 * 1024,
    50LL * 1024 * 1024 * 1024, 1LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info.load = 0.0;
  node_info.capabilities = {"web", "api"};
  
  const std::string node_id = scalability_manager_->AddNode(node_info);
  
  bool result = scalability_manager_->UpdateNodeStatus(node_id, "maintenance");
  EXPECT_TRUE(result);
  
  NodeInfo* retrieved_node = scalability_manager_->GetNode(node_id);
  ASSERT_NE(retrieved_node, nullptr);
  EXPECT_EQ(retrieved_node->status, "maintenance");
}

TEST_F(ScalabilityManagerTest, UpdateNodeResources) {
  NodeInfo node_info;
  node_info.hostname = "node1.example.com";
  node_info.port = 8080;
  node_info.status = "active";
  node_info.resources = {
    50.0, 4LL * 1024 * 1024 * 1024, 50LL * 1024 * 1024,
    50LL * 1024 * 1024 * 1024, 1LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info.load = 0.0;
  node_info.capabilities = {"web", "api"};
  
  const std::string node_id = scalability_manager_->AddNode(node_info);
  
  ResourceUsage new_resources;
  new_resources.cpu = 75.0;
  new_resources.memory = 6LL * 1024 * 1024 * 1024;
  new_resources.network = 75LL * 1024 * 1024;
  new_resources.storage = 75LL * 1024 * 1024 * 1024;
  new_resources.gpu = 1.5LL * 1024 * 1024 * 1024;
  new_resources.timestamp = std::chrono::system_clock::now();
  
  bool result = scalability_manager_->UpdateNodeResources(node_id, new_resources);
  EXPECT_TRUE(result);
  
  NodeInfo* retrieved_node = scalability_manager_->GetNode(node_id);
  ASSERT_NE(retrieved_node, nullptr);
  EXPECT_EQ(retrieved_node->resources.cpu, 75.0);
  EXPECT_EQ(retrieved_node->resources.memory, 6LL * 1024 * 1024 * 1024);
}

TEST_F(ScalabilityManagerTest, GetAllNodes) {
  NodeInfo node_info1;
  node_info1.hostname = "node1.example.com";
  node_info1.port = 8080;
  node_info1.status = "active";
  node_info1.resources = {
    50.0, 4LL * 1024 * 1024 * 1024, 50LL * 1024 * 1024,
    50LL * 1024 * 1024 * 1024, 1LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info1.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info1.load = 0.0;
  node_info1.capabilities = {"web", "api"};
  
  NodeInfo node_info2;
  node_info2.hostname = "node2.example.com";
  node_info2.port = 8080;
  node_info2.status = "active";
  node_info2.resources = {
    60.0, 5LL * 1024 * 1024 * 1024, 60LL * 1024 * 1024,
    60LL * 1024 * 1024 * 1024, 1.2LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info2.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info2.load = 0.0;
  node_info2.capabilities = {"web", "api"};
  
  scalability_manager_->AddNode(node_info1);
  scalability_manager_->AddNode(node_info2);
  
  std::vector<NodeInfo> all_nodes = scalability_manager_->GetAllNodes();
  EXPECT_EQ(all_nodes.size(), 2);
}

TEST_F(ScalabilityManagerTest, GetActiveNodes) {
  NodeInfo node_info1;
  node_info1.hostname = "node1.example.com";
  node_info1.port = 8080;
  node_info1.status = "active";
  node_info1.resources = {
    50.0, 4LL * 1024 * 1024 * 1024, 50LL * 1024 * 1024,
    50LL * 1024 * 1024 * 1024, 1LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info1.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info1.load = 0.0;
  node_info1.capabilities = {"web", "api"};
  
  NodeInfo node_info2;
  node_info2.hostname = "node2.example.com";
  node_info2.port = 8080;
  node_info2.status = "inactive";
  node_info2.resources = {
    60.0, 5LL * 1024 * 1024 * 1024, 60LL * 1024 * 1024,
    60LL * 1024 * 1024 * 1024, 1.2LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info2.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info2.load = 0.0;
  node_info2.capabilities = {"web", "api"};
  
  scalability_manager_->AddNode(node_info1);
  scalability_manager_->AddNode(node_info2);
  
  std::vector<NodeInfo> active_nodes = scalability_manager_->GetActiveNodes();
  EXPECT_EQ(active_nodes.size(), 1);
  EXPECT_EQ(active_nodes[0].hostname, "node1.example.com");
}

TEST_F(ScalabilityManagerTest, SelectNode) {
  NodeInfo node_info1;
  node_info1.hostname = "node1.example.com";
  node_info1.port = 8080;
  node_info1.status = "active";
  node_info1.resources = {
    50.0, 4LL * 1024 * 1024 * 1024, 50LL * 1024 * 1024,
    50LL * 1024 * 1024 * 1024, 1LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info1.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info1.load = 0.0;
  node_info1.capabilities = {"web", "api"};
  
  NodeInfo node_info2;
  node_info2.hostname = "node2.example.com";
  node_info2.port = 8080;
  node_info2.status = "active";
  node_info2.resources = {
    60.0, 5LL * 1024 * 1024 * 1024, 60LL * 1024 * 1024,
    60LL * 1024 * 1024 * 1024, 1.2LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info2.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info2.load = 0.0;
  node_info2.capabilities = {"web", "api"};
  
  scalability_manager_->AddNode(node_info1);
  scalability_manager_->AddNode(node_info2);
  
  NodeInfo* selected_node = scalability_manager_->SelectNode();
  EXPECT_NE(selected_node, nullptr);
  EXPECT_TRUE(selected_node->hostname == "node1.example.com" || 
              selected_node->hostname == "node2.example.com");
}

TEST_F(ScalabilityManagerTest, SelectNodeWithNoActiveNodes) {
  NodeInfo* selected_node = scalability_manager_->SelectNode();
  EXPECT_EQ(selected_node, nullptr);
}

TEST_F(ScalabilityManagerTest, GetScalabilityMetrics) {
  NodeInfo node_info;
  node_info.hostname = "node1.example.com";
  node_info.port = 8080;
  node_info.status = "active";
  node_info.resources = {
    50.0, 4LL * 1024 * 1024 * 1024, 50LL * 1024 * 1024,
    50LL * 1024 * 1024 * 1024, 1LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info.load = 0.0;
  node_info.capabilities = {"web", "api"};
  
  scalability_manager_->AddNode(node_info);
  
  ScalabilityMetrics metrics = scalability_manager_->GetScalabilityMetrics();
  
  EXPECT_EQ(metrics.total_nodes, 1);
  EXPECT_EQ(metrics.active_nodes, 1);
  EXPECT_GE(metrics.average_load, 0.0);
  EXPECT_GE(metrics.average_response_time, 0.0);
  EXPECT_FALSE(metrics.health_status.empty());
}

TEST_F(ScalabilityManagerTest, ShouldScale) {
  NodeInfo node_info;
  node_info.hostname = "node1.example.com";
  node_info.port = 8080;
  node_info.status = "active";
  node_info.resources = {
    90.0, 7LL * 1024 * 1024 * 1024, 90LL * 1024 * 1024,
    90LL * 1024 * 1024 * 1024, 1.8LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info.load = 0.0;
  node_info.capabilities = {"web", "api"};
  
  scalability_manager_->AddNode(node_info);
  
  ScalingDecision decision = scalability_manager_->ShouldScale();
  
  EXPECT_FALSE(decision.action.empty());
  EXPECT_FALSE(decision.reason.empty());
  EXPECT_GE(decision.target_nodes, 0);
  EXPECT_GE(decision.current_nodes, 0);
}

TEST_F(ScalabilityManagerTest, ExecuteScaling) {
  ScalingDecision decision;
  decision.action = "scale_up";
  decision.reason = "High load detected";
  decision.target_nodes = 2;
  decision.current_nodes = 1;
  decision.metrics = {90.0, 7LL * 1024 * 1024 * 1024, 90.0, 200.0};
  decision.timestamp = std::chrono::system_clock::now();
  
  bool result = scalability_manager_->ExecuteScaling(decision);
  EXPECT_TRUE(result);
}

TEST_F(ScalabilityManagerTest, ExportClusterState) {
  NodeInfo node_info;
  node_info.hostname = "node1.example.com";
  node_info.port = 8080;
  node_info.status = "active";
  node_info.resources = {
    50.0, 4LL * 1024 * 1024 * 1024, 50LL * 1024 * 1024,
    50LL * 1024 * 1024 * 1024, 1LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info.load = 0.0;
  node_info.capabilities = {"web", "api"};
  
  scalability_manager_->AddNode(node_info);
  
  std::string exported = scalability_manager_->ExportClusterState();
  EXPECT_FALSE(exported.empty());
  
  // Should be valid JSON
  EXPECT_TRUE(exported.find("{") != std::string::npos);
  EXPECT_TRUE(exported.find("}") != std::string::npos);
}

TEST_F(ScalabilityManagerTest, ClearCluster) {
  NodeInfo node_info;
  node_info.hostname = "node1.example.com";
  node_info.port = 8080;
  node_info.status = "active";
  node_info.resources = {
    50.0, 4LL * 1024 * 1024 * 1024, 50LL * 1024 * 1024,
    50LL * 1024 * 1024 * 1024, 1LL * 1024 * 1024 * 1024,
    std::chrono::system_clock::now()
  };
  node_info.limits = {
    80.0, 8LL * 1024 * 1024 * 1024, 100LL * 1024 * 1024,
    100LL * 1024 * 1024 * 1024, 2LL * 1024 * 1024 * 1024
  };
  node_info.load = 0.0;
  node_info.capabilities = {"web", "api"};
  
  scalability_manager_->AddNode(node_info);
  EXPECT_EQ(scalability_manager_->GetAllNodes().size(), 1);
  
  scalability_manager_->ClearCluster();
  EXPECT_EQ(scalability_manager_->GetAllNodes().size(), 0);
}

TEST_F(ScalabilityManagerTest, GetNonExistentNode) {
  NodeInfo* node = scalability_manager_->GetNode("non-existent-id");
  EXPECT_EQ(node, nullptr);
}

TEST_F(ScalabilityManagerTest, UpdateNonExistentNode) {
  bool result = scalability_manager_->UpdateNodeStatus("non-existent-id", "active");
  EXPECT_FALSE(result);
  
  ResourceUsage resources;
  resources.cpu = 50.0;
  resources.memory = 4LL * 1024 * 1024 * 1024;
  resources.network = 50LL * 1024 * 1024;
  resources.storage = 50LL * 1024 * 1024 * 1024;
  resources.gpu = 1LL * 1024 * 1024 * 1024;
  resources.timestamp = std::chrono::system_clock::now();
  
  result = scalability_manager_->UpdateNodeResources("non-existent-id", resources);
  EXPECT_FALSE(result);
}

TEST_F(ScalabilityManagerTest, RemoveNonExistentNode) {
  bool result = scalability_manager_->RemoveNode("non-existent-id");
  EXPECT_FALSE(result);
}

} // namespace diagnostics
} // namespace toubkal
