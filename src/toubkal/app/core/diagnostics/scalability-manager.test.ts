/**
 * Scalability Manager Tests
 * 
 * Comprehensive test suite for the Scalability Manager system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScalabilityManager, ScalabilityMode, LoadBalancingStrategy } from './scalability-manager';

// Mock the Logger
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn()
};

vi.mock('./logger', () => ({
  logger: {
    getInstance: vi.fn(() => mockLogger)
  }
}));

// Mock the PerformanceMonitor
vi.mock('./performance-monitor', () => ({
  performanceMonitor: {
    getInstance: vi.fn(() => ({
      trackMetric: vi.fn()
    }))
  }
}));

// Mock the ErrorTracker
vi.mock('./error-tracker', () => ({
  errorTracker: {
    getInstance: vi.fn(() => ({
      trackError: vi.fn()
    }))
  }
}));

describe('ScalabilityManager', () => {
  let scalabilityManager: ScalabilityManager;

  beforeEach(() => {
    scalabilityManager = ScalabilityManager.getInstance();
    
    // Clear any existing state
    scalabilityManager.clearCluster();
    
    // Clear mock calls
    mockLogger.info.mockClear();
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
    mockLogger.debug.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      scalabilityManager.initialize();
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ScalabilityManager',
        'Scalability framework initialized',
        expect.objectContaining({
          mode: ScalabilityMode.SingleInstance,
          maxNodes: 1,
          autoScaling: false
        })
      );
    });

    it('should initialize with custom config', () => {
      const customConfig = {
        mode: ScalabilityMode.Cluster,
        maxNodes: 5,
        minNodes: 2,
        autoScaling: true,
        scaleUpThreshold: 85,
        scaleDownThreshold: 15
      };
      
      scalabilityManager.initialize(customConfig);
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ScalabilityManager',
        'Scalability framework initialized',
        expect.objectContaining({
          mode: ScalabilityMode.Cluster,
          maxNodes: 5,
          autoScaling: true
        })
      );
    });
  });

  describe('node management', () => {
    beforeEach(() => {
      scalabilityManager.initialize();
    });

    it('should add a node to the cluster', () => {
      const nodeInfo = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024, // 4GB
          network: 50 * 1024 * 1024, // 50MB/s
          storage: 50 * 1024 * 1024 * 1024, // 50GB
          gpu: 1 * 1024 * 1024 * 1024, // 1GB
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024, // 8GB
          network: 100 * 1024 * 1024, // 100MB/s
          storage: 100 * 1024 * 1024 * 1024, // 100GB
          gpu: 2 * 1024 * 1024 * 1024 // 2GB
        },
        load: 0,
        capabilities: ['web', 'api'],
        region: 'us-west-1',
        zone: 'us-west-1a'
      };
      
      const nodeId = scalabilityManager.addNode(nodeInfo);
      
      expect(nodeId).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ScalabilityManager',
        'Node added to cluster',
        expect.objectContaining({
          nodeId,
          hostname: 'node1.example.com',
          port: 8080,
          status: 'active'
        })
      );
    });

    it('should remove a node from the cluster', () => {
      const nodeInfo = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024,
          network: 50 * 1024 * 1024,
          storage: 50 * 1024 * 1024 * 1024,
          gpu: 1 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      const nodeId = scalabilityManager.addNode(nodeInfo);
      const result = scalabilityManager.removeNode(nodeId);
      
      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ScalabilityManager',
        'Node removed from cluster',
        expect.objectContaining({
          nodeId,
          hostname: 'node1.example.com'
        })
      );
    });

    it('should update node status', () => {
      const nodeInfo = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024,
          network: 50 * 1024 * 1024,
          storage: 50 * 1024 * 1024 * 1024,
          gpu: 1 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      const nodeId = scalabilityManager.addNode(nodeInfo);
      const result = scalabilityManager.updateNodeStatus(nodeId, 'maintenance');
      
      expect(result).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'ScalabilityManager',
        'Node status updated',
        expect.objectContaining({
          nodeId,
          status: 'maintenance'
        })
      );
    });

    it('should update node resources', () => {
      const nodeInfo = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024,
          network: 50 * 1024 * 1024,
          storage: 50 * 1024 * 1024 * 1024,
          gpu: 1 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      const nodeId = scalabilityManager.addNode(nodeInfo);
      const newResources = {
        cpu: 75,
        memory: 6 * 1024 * 1024 * 1024,
        network: 75 * 1024 * 1024,
        storage: 75 * 1024 * 1024 * 1024,
        gpu: 1.5 * 1024 * 1024 * 1024,
        timestamp: Date.now()
      };
      
      const result = scalabilityManager.updateNodeResources(nodeId, newResources);
      
      expect(result).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'ScalabilityManager',
        'Node resources updated',
        expect.objectContaining({
          nodeId,
          cpu: 75,
          memory: 6 * 1024 * 1024 * 1024
        })
      );
    });
  });

  describe('node retrieval', () => {
    beforeEach(() => {
      scalabilityManager.initialize();
    });

    it('should get a specific node', () => {
      const nodeInfo = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024,
          network: 50 * 1024 * 1024,
          storage: 50 * 1024 * 1024 * 1024,
          gpu: 1 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      const nodeId = scalabilityManager.addNode(nodeInfo);
      const node = scalabilityManager.getNode(nodeId);
      
      expect(node).toBeDefined();
      expect(node?.hostname).toBe('node1.example.com');
      expect(node?.port).toBe(8080);
    });

    it('should return undefined for non-existent node', () => {
      const node = scalabilityManager.getNode('non-existent-id');
      expect(node).toBeUndefined();
    });

    it('should get all nodes', () => {
      const nodeInfo1 = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024,
          network: 50 * 1024 * 1024,
          storage: 50 * 1024 * 1024 * 1024,
          gpu: 1 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      const nodeInfo2 = {
        hostname: 'node2.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 60,
          memory: 5 * 1024 * 1024 * 1024,
          network: 60 * 1024 * 1024,
          storage: 60 * 1024 * 1024 * 1024,
          gpu: 1.2 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      scalabilityManager.addNode(nodeInfo1);
      scalabilityManager.addNode(nodeInfo2);
      
      const allNodes = scalabilityManager.getAllNodes();
      expect(allNodes).toHaveLength(2);
    });

    it('should get only active nodes', () => {
      const nodeInfo1 = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024,
          network: 50 * 1024 * 1024,
          storage: 50 * 1024 * 1024 * 1024,
          gpu: 1 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      const nodeInfo2 = {
        hostname: 'node2.example.com',
        port: 8080,
        status: 'inactive' as const,
        resources: {
          cpu: 60,
          memory: 5 * 1024 * 1024 * 1024,
          network: 60 * 1024 * 1024,
          storage: 60 * 1024 * 1024 * 1024,
          gpu: 1.2 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      scalabilityManager.addNode(nodeInfo1);
      scalabilityManager.addNode(nodeInfo2);
      
      const activeNodes = scalabilityManager.getActiveNodes();
      expect(activeNodes).toHaveLength(1);
      expect(activeNodes[0].hostname).toBe('node1.example.com');
    });
  });

  describe('load balancing', () => {
    beforeEach(() => {
      scalabilityManager.initialize({
        loadBalancer: {
          strategy: LoadBalancingStrategy.RoundRobin,
          healthCheckInterval: 30000,
          maxRetries: 3,
          timeout: 5000,
          stickySessions: false,
          sessionTimeout: 1800000,
          failoverEnabled: true,
          circuitBreakerThreshold: 5
        }
      });
    });

    it('should select a node using round-robin strategy', () => {
      const nodeInfo1 = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024,
          network: 50 * 1024 * 1024,
          storage: 50 * 1024 * 1024 * 1024,
          gpu: 1 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      const nodeInfo2 = {
        hostname: 'node2.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 60,
          memory: 5 * 1024 * 1024 * 1024,
          network: 60 * 1024 * 1024,
          storage: 60 * 1024 * 1024 * 1024,
          gpu: 1.2 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      scalabilityManager.addNode(nodeInfo1);
      scalabilityManager.addNode(nodeInfo2);
      
      const selectedNode = scalabilityManager.selectNode();
      expect(selectedNode).toBeDefined();
      expect(['node1.example.com', 'node2.example.com']).toContain(selectedNode?.hostname);
    });

    it('should return null when no active nodes available', () => {
      const selectedNode = scalabilityManager.selectNode();
      expect(selectedNode).toBeNull();
    });

    it('should select node using IP hash strategy', () => {
      scalabilityManager.initialize({
        loadBalancer: {
          strategy: LoadBalancingStrategy.IpHash,
          healthCheckInterval: 30000,
          maxRetries: 3,
          timeout: 5000,
          stickySessions: false,
          sessionTimeout: 1800000,
          failoverEnabled: true,
          circuitBreakerThreshold: 5
        }
      });
      
      const nodeInfo = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024,
          network: 50 * 1024 * 1024,
          storage: 50 * 1024 * 1024 * 1024,
          gpu: 1 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      scalabilityManager.addNode(nodeInfo);
      
      const selectedNode1 = scalabilityManager.selectNode('192.168.1.1');
      const selectedNode2 = scalabilityManager.selectNode('192.168.1.1');
      
      // Same IP should select same node
      expect(selectedNode1?.id).toBe(selectedNode2?.id);
    });
  });

  describe('scalability metrics', () => {
    beforeEach(() => {
      scalabilityManager.initialize();
    });

    it('should get scalability metrics', () => {
      const nodeInfo = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024,
          network: 50 * 1024 * 1024,
          storage: 50 * 1024 * 1024 * 1024,
          gpu: 1 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      scalabilityManager.addNode(nodeInfo);
      
      const metrics = scalabilityManager.getScalabilityMetrics();
      
      expect(metrics.totalNodes).toBe(1);
      expect(metrics.activeNodes).toBe(1);
      expect(metrics.averageLoad).toBeGreaterThanOrEqual(0);
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.healthStatus).toBeDefined();
    });
  });

  describe('scaling decisions', () => {
    beforeEach(() => {
      scalabilityManager.initialize({
        autoScaling: true,
        maxNodes: 3,
        minNodes: 1,
        scaleUpThreshold: 80,
        scaleDownThreshold: 20
      });
    });

    it('should decide to scale up when load is high', () => {
      const nodeInfo = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 90, // High CPU usage
          memory: 7 * 1024 * 1024 * 1024, // High memory usage
          network: 90 * 1024 * 1024,
          storage: 90 * 1024 * 1024 * 1024,
          gpu: 1.8 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      scalabilityManager.addNode(nodeInfo);
      
      const decision = scalabilityManager.shouldScale();
      
      expect(decision).toBeDefined();
      expect(decision?.action).toBe('scale_up');
      expect(decision?.reason).toContain('High load detected');
    });

    it('should decide to maintain when load is normal', () => {
      const nodeInfo = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 30, // Low CPU usage
          memory: 2 * 1024 * 1024 * 1024, // Low memory usage
          network: 30 * 1024 * 1024,
          storage: 30 * 1024 * 1024 * 1024,
          gpu: 0.5 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      scalabilityManager.addNode(nodeInfo);
      
      const decision = scalabilityManager.shouldScale();
      
      expect(decision).toBeDefined();
      expect(decision?.action).toBe('maintain');
      expect(decision?.reason).toContain('Load within acceptable range');
    });

    it('should execute scaling decision', () => {
      const decision = {
        action: 'scale_up' as const,
        reason: 'High load detected',
        targetNodes: 2,
        currentNodes: 1,
        metrics: {
          cpu: 90,
          memory: 7 * 1024 * 1024 * 1024,
          load: 90,
          responseTime: 200
        },
        timestamp: Date.now()
      };
      
      const result = scalabilityManager.executeScaling(decision);
      
      expect(result).toBe(true);
    });
  });

  describe('export and cleanup', () => {
    beforeEach(() => {
      scalabilityManager.initialize();
    });

    it('should export cluster state', () => {
      const nodeInfo = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024,
          network: 50 * 1024 * 1024,
          storage: 50 * 1024 * 1024 * 1024,
          gpu: 1 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      scalabilityManager.addNode(nodeInfo);
      
      const exported = scalabilityManager.exportClusterState();
      expect(exported).toBeDefined();
      
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('config');
      expect(parsed).toHaveProperty('nodes');
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed.nodes).toHaveLength(1);
    });

    it('should clear cluster state', () => {
      const nodeInfo = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024,
          network: 50 * 1024 * 1024,
          storage: 50 * 1024 * 1024 * 1024,
          gpu: 1 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      scalabilityManager.addNode(nodeInfo);
      expect(scalabilityManager.getAllNodes()).toHaveLength(1);
      
      scalabilityManager.clearCluster();
      expect(scalabilityManager.getAllNodes()).toHaveLength(0);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ScalabilityManager',
        'Cluster state cleared'
      );
    });
  });

  describe('destroy', () => {
    it('should destroy the manager', () => {
      scalabilityManager.initialize();
      const nodeInfo = {
        hostname: 'node1.example.com',
        port: 8080,
        status: 'active' as const,
        resources: {
          cpu: 50,
          memory: 4 * 1024 * 1024 * 1024,
          network: 50 * 1024 * 1024,
          storage: 50 * 1024 * 1024 * 1024,
          gpu: 1 * 1024 * 1024 * 1024,
          timestamp: Date.now()
        },
        limits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024,
          network: 100 * 1024 * 1024,
          storage: 100 * 1024 * 1024 * 1024,
          gpu: 2 * 1024 * 1024 * 1024
        },
        load: 0,
        capabilities: ['web', 'api']
      };
      
      scalabilityManager.addNode(nodeInfo);
      scalabilityManager.destroy();
      
      expect(scalabilityManager.getAllNodes()).toHaveLength(0);
    });
  });
});
