/**
 * Scalability Manager
 * 
 * Comprehensive scalability framework for Toubkal Browser, providing
 * load balancing, resource management, horizontal scaling capabilities,
 * and adaptive performance optimization.
 */

import { Logger } from './logger';
import { PerformanceMonitor } from './performance-monitor';
import { ErrorTracker } from './error-tracker';

export enum ScalabilityMode {
  SingleInstance = 'single_instance',
  Cluster = 'cluster',
  Distributed = 'distributed',
  Cloud = 'cloud'
}

export enum ResourceType {
  CPU = 'cpu',
  MEMORY = 'memory',
  NETWORK = 'network',
  STORAGE = 'storage',
  GPU = 'gpu'
}

export enum LoadBalancingStrategy {
  RoundRobin = 'round_robin',
  LeastConnections = 'least_connections',
  WeightedRoundRobin = 'weighted_round_robin',
  LeastResponseTime = 'least_response_time',
  IpHash = 'ip_hash',
  Random = 'random'
}

export interface ResourceLimits {
  cpu: number; // CPU percentage
  memory: number; // Memory in bytes
  network: number; // Network bandwidth in bytes/second
  storage: number; // Storage in bytes
  gpu: number; // GPU memory in bytes
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  gpu: number;
  timestamp: number;
}

export interface NodeInfo {
  id: string;
  hostname: string;
  port: number;
  status: 'active' | 'inactive' | 'maintenance' | 'overloaded';
  resources: ResourceUsage;
  limits: ResourceLimits;
  load: number; // Current load percentage
  lastHeartbeat: number;
  capabilities: string[];
  region?: string;
  zone?: string;
}

export interface LoadBalancerConfig {
  strategy: LoadBalancingStrategy;
  healthCheckInterval: number;
  maxRetries: number;
  timeout: number;
  stickySessions: boolean;
  sessionTimeout: number;
  failoverEnabled: boolean;
  circuitBreakerThreshold: number;
}

export interface ClusterConfig {
  mode: ScalabilityMode;
  maxNodes: number;
  minNodes: number;
  autoScaling: boolean;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownPeriod: number;
  loadBalancer: LoadBalancerConfig;
  resourceLimits: ResourceLimits;
  loadBalancingStrategy?: LoadBalancingStrategy;
  privacyMode?: boolean;
}

export interface ScalingDecision {
  action: 'scale_up' | 'scale_down' | 'maintain';
  reason: string;
  targetNodes: number;
  currentNodes: number;
  metrics: {
    cpu: number;
    memory: number;
    load: number;
    responseTime: number;
  };
  timestamp: number;
}

export interface ScalabilityMetrics {
  totalNodes: number;
  activeNodes: number;
  averageLoad: number;
  averageResponseTime: number;
  resourceUtilization: ResourceUsage;
  scalingEvents: ScalingDecision[];
  healthStatus: 'healthy' | 'degraded' | 'critical';
}

export class ScalabilityManager {
  private static instance: ScalabilityManager;
  private logger: Logger;
  private performanceMonitor: PerformanceMonitor;
  private errorTracker: ErrorTracker;
  private config: ClusterConfig;
  private nodes: Map<string, NodeInfo> = new Map();
  private isInitialized = false;
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;
  private scalingCooldown: number = 0;

  private constructor() {
    this.logger = Logger.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.errorTracker = ErrorTracker.getInstance();
    this.config = {
      mode: ScalabilityMode.SingleInstance,
      maxNodes: 1,
      minNodes: 1,
      autoScaling: false,
      scaleUpThreshold: 80,
      scaleDownThreshold: 20,
      cooldownPeriod: 300000, // 5 minutes
      loadBalancer: {
        strategy: LoadBalancingStrategy.RoundRobin,
        healthCheckInterval: 30000, // 30 seconds
        maxRetries: 3,
        timeout: 5000, // 5 seconds
        stickySessions: false,
        sessionTimeout: 1800000, // 30 minutes
        failoverEnabled: true,
        circuitBreakerThreshold: 5
      },
      resourceLimits: {
        cpu: 80,
        memory: 8 * 1024 * 1024 * 1024, // 8GB
        network: 100 * 1024 * 1024, // 100MB/s
        storage: 100 * 1024 * 1024 * 1024, // 100GB
        gpu: 2 * 1024 * 1024 * 1024 // 2GB
      }
    };
  }

  public static getInstance(): ScalabilityManager {
    if (ScalabilityManager.instance == null) {
      ScalabilityManager.instance = new ScalabilityManager();
    }
    return ScalabilityManager.instance;
  }

  public initialize(config: Partial<ClusterConfig> = {}): void {
    this.config = { ...this.config, ...config };
    this.setupMonitoring();
    this.isInitialized = true;
    
    this.logger.info('ScalabilityManager', 'Scalability framework initialized', {
      mode: this.config.mode,
      maxNodes: this.config.maxNodes,
      autoScaling: this.config.autoScaling
    });
  }

  public addNode(nodeInfo: Omit<NodeInfo, 'id' | 'lastHeartbeat'>): string {
    if (!this.isInitialized) {
      this.initialize();
    }

    const nodeId = this.generateNodeId(nodeInfo.hostname, nodeInfo.port);
    const node: NodeInfo = {
      ...nodeInfo,
      id: nodeId,
      lastHeartbeat: Date.now()
    };

    this.nodes.set(nodeId, node);
    
    this.logger.info('ScalabilityManager', 'Node added to cluster', {
      nodeId,
      hostname: node.hostname,
      port: node.port,
      status: node.status
    });

    return nodeId;
  }

  public removeNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return false;
    }

    this.nodes.delete(nodeId);
    
    this.logger.info('ScalabilityManager', 'Node removed from cluster', {
      nodeId,
      hostname: node.hostname,
      port: node.port
    });

    return true;
  }

  public updateNodeStatus(nodeId: string, status: NodeInfo['status']): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return false;
    }

    node.status = status;
    node.lastHeartbeat = Date.now();
    
    this.logger.debug('ScalabilityManager', 'Node status updated', {
      nodeId,
      status,
      hostname: node.hostname
    });

    return true;
  }

  public updateNodeResources(nodeId: string, resources: ResourceUsage): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return false;
    }

    node.resources = resources;
    node.lastHeartbeat = Date.now();
    
    // Calculate load percentage
    node.load = this.calculateNodeLoad(node);
    
    this.logger.debug('ScalabilityManager', 'Node resources updated', {
      nodeId,
      load: node.load,
      cpu: resources.cpu,
      memory: resources.memory
    });

    return true;
  }

  public getNode(nodeId: string): NodeInfo | undefined {
    return this.nodes.get(nodeId);
  }

  public getAllNodes(): NodeInfo[] {
    return Array.from(this.nodes.values());
  }

  public getActiveNodes(): NodeInfo[] {
    return Array.from(this.nodes.values()).filter(node => node.status === 'active');
  }

  public selectNode(requestId?: string): NodeInfo | null {
    const activeNodes = this.getActiveNodes();
    if (activeNodes.length === 0) {
      return null;
    }

    switch (this.config.loadBalancer.strategy) {
      case LoadBalancingStrategy.RoundRobin:
        return this.selectRoundRobin(activeNodes);
      case LoadBalancingStrategy.LeastConnections:
        return this.selectLeastConnections(activeNodes);
      case LoadBalancingStrategy.WeightedRoundRobin:
        return this.selectWeightedRoundRobin(activeNodes);
      case LoadBalancingStrategy.LeastResponseTime:
        return this.selectLeastResponseTime(activeNodes);
      case LoadBalancingStrategy.IpHash:
        return this.selectIPHash(activeNodes, requestId);
      case LoadBalancingStrategy.Random:
        return this.selectRandom(activeNodes);
      default:
        return this.selectRoundRobin(activeNodes);
    }
  }

  public getScalabilityMetrics(): ScalabilityMetrics {
    const allNodes = this.getAllNodes();
    const activeNodes = this.getActiveNodes();
    
    const totalNodes = allNodes.length;
    const activeNodeCount = activeNodes.length;
    
    const averageLoad = activeNodes.length > 0 
      ? activeNodes.reduce((sum, node) => sum + node.load, 0) / activeNodes.length 
      : 0;
    
    const averageResponseTime = this.calculateAverageResponseTime();
    
    const resourceUtilization = this.calculateResourceUtilization();
    
    const scalingEvents = this.getRecentScalingEvents();
    
    const healthStatus = this.calculateHealthStatus();
    
    return {
      totalNodes,
      activeNodes: activeNodeCount,
      averageLoad,
      averageResponseTime,
      resourceUtilization,
      scalingEvents,
      healthStatus
    };
  }

  public shouldScale(): ScalingDecision | null {
    if (!this.config.autoScaling) {
      return null;
    }

    // Check cooldown period
    if (Date.now() - this.scalingCooldown < this.config.cooldownPeriod) {
      return null;
    }

    const metrics = this.getScalabilityMetrics();
    const currentNodes = metrics.activeNodes;
    
    // Scale up conditions
    if (currentNodes < this.config.maxNodes && 
        (metrics.averageLoad > this.config.scaleUpThreshold || 
         metrics.resourceUtilization.cpu > this.config.scaleUpThreshold ||
         metrics.resourceUtilization.memory > this.config.scaleUpThreshold)) {
      
      const targetNodes = Math.min(currentNodes + 1, this.config.maxNodes);
      
      return {
        action: 'scale_up',
        reason: `High load detected: ${metrics.averageLoad.toFixed(2)}%`,
        targetNodes,
        currentNodes,
        metrics: {
          cpu: metrics.resourceUtilization.cpu,
          memory: metrics.resourceUtilization.memory,
          load: metrics.averageLoad,
          responseTime: metrics.averageResponseTime
        },
        timestamp: Date.now()
      };
    }
    
    // Scale down conditions
    if (currentNodes > this.config.minNodes && 
        metrics.averageLoad < this.config.scaleDownThreshold &&
        metrics.resourceUtilization.cpu < this.config.scaleDownThreshold &&
        metrics.resourceUtilization.memory < this.config.scaleDownThreshold) {
      
      const targetNodes = Math.max(currentNodes - 1, this.config.minNodes);
      
      return {
        action: 'scale_down',
        reason: `Low load detected: ${metrics.averageLoad.toFixed(2)}%`,
        targetNodes,
        currentNodes,
        metrics: {
          cpu: metrics.resourceUtilization.cpu,
          memory: metrics.resourceUtilization.memory,
          load: metrics.averageLoad,
          responseTime: metrics.averageResponseTime
        },
        timestamp: Date.now()
      };
    }
    
    return {
      action: 'maintain',
      reason: 'Load within acceptable range',
      targetNodes: currentNodes,
      currentNodes,
      metrics: {
        cpu: metrics.resourceUtilization.cpu,
        memory: metrics.resourceUtilization.memory,
        load: metrics.averageLoad,
        responseTime: metrics.averageResponseTime
      },
      timestamp: Date.now()
    };
  }

  public executeScaling(decision: ScalingDecision): boolean {
    if (decision.action === 'maintain') {
      return true;
    }

    this.scalingCooldown = Date.now();
    
    if (decision.action === 'scale_up') {
      return this.scaleUp(decision.targetNodes);
    } else if (decision.action === 'scale_down') {
      return this.scaleDown(decision.targetNodes);
    }
    
    return false;
  }

  public exportClusterState(): string {
    const state = {
      config: this.config,
      nodes: Array.from(this.nodes.values()),
      metrics: this.getScalabilityMetrics(),
      timestamp: Date.now()
    };
    
    return JSON.stringify(state, null, 2);
  }

  public clearCluster(): void {
    this.nodes.clear();
    this.scalingCooldown = 0;
    this.logger.info('ScalabilityManager', 'Cluster state cleared');
  }

  public clearMetrics(): void {
    this.clearCluster();
  }

  public getHealthStatus(): { status: string; message: string; details: Record<string, unknown> } {
    const metrics = this.getScalabilityMetrics();
    
    return {
      status: metrics.healthStatus,
      message: `Scalability manager operational with ${metrics.activeNodes} active nodes`,
      details: {
        totalNodes: metrics.totalNodes,
        activeNodes: metrics.activeNodes,
        averageLoad: metrics.averageLoad,
        healthStatus: metrics.healthStatus,
        mode: this.config.mode,
        autoScaling: this.config.autoScaling
      }
    };
  }

  public getConfig(): ClusterConfig {
    return { ...this.config };
  }

  private setupMonitoring(): void {
    if (this.config.mode === ScalabilityMode.SingleInstance) {
      return;
    }

    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
      this.checkScaling();
    }, this.config.loadBalancer.healthCheckInterval);
  }

  private performHealthChecks(): void {
    const now = Date.now();
    const timeout = this.config.loadBalancer.timeout;
    
    for (const [nodeId, node] of this.nodes.entries()) {
      if (now - node.lastHeartbeat > timeout) {
        if (node.status === 'active') {
          this.updateNodeStatus(nodeId, 'inactive');
          this.logger.warn('ScalabilityManager', 'Node marked as inactive due to timeout', {
            nodeId,
            hostname: node.hostname,
            lastHeartbeat: new Date(node.lastHeartbeat).toISOString()
          });
        }
      }
    }
  }

  private checkScaling(): void {
    const decision = this.shouldScale();
    if (decision && decision.action !== 'maintain') {
      this.executeScaling(decision);
      
      this.logger.info('ScalabilityManager', 'Scaling decision executed', {
        action: decision.action,
        reason: decision.reason,
        targetNodes: decision.targetNodes,
        currentNodes: decision.currentNodes
      });
    }
  }

  private generateNodeId(hostname: string, port: number): string {
    const key = `${hostname}:${port}:${Date.now()}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private calculateNodeLoad(node: NodeInfo): number {
    const cpuWeight = 0.4;
    const memoryWeight = 0.3;
    const networkWeight = 0.2;
    const storageWeight = 0.1;
    
    const cpuLoad = (node.resources.cpu / 100) * 100;
    const memoryLoad = (node.resources.memory / node.limits.memory) * 100;
    const networkLoad = (node.resources.network / node.limits.network) * 100;
    const storageLoad = (node.resources.storage / node.limits.storage) * 100;
    
    return (cpuLoad * cpuWeight + memoryLoad * memoryWeight + 
            networkLoad * networkWeight + storageLoad * storageWeight);
  }

  private calculateResourceUtilization(): ResourceUsage {
    const activeNodes = this.getActiveNodes();
    if (activeNodes.length === 0) {
      return {
        cpu: 0,
        memory: 0,
        network: 0,
        storage: 0,
        gpu: 0,
        timestamp: Date.now()
      };
    }

    // Calculate average resource utilization as percentages
    const totalCpu = activeNodes.reduce((sum, node) => sum + node.resources.cpu, 0);
    const totalMemory = activeNodes.reduce((sum, node) => sum + node.resources.memory, 0);
    const totalNetwork = activeNodes.reduce((sum, node) => sum + node.resources.network, 0);
    const totalStorage = activeNodes.reduce((sum, node) => sum + node.resources.storage, 0);
    const totalGpu = activeNodes.reduce((sum, node) => sum + node.resources.gpu, 0);

    // Calculate memory utilization as percentage
    const totalMemoryLimit = activeNodes.reduce((sum, node) => sum + node.limits.memory, 0);
    const memoryUtilization = totalMemoryLimit > 0 ? (totalMemory / totalMemoryLimit) * 100 : 0;

    return {
      cpu: totalCpu / activeNodes.length, // CPU is already a percentage
      memory: memoryUtilization, // Convert to percentage
      network: totalNetwork / activeNodes.length,
      storage: totalStorage / activeNodes.length,
      gpu: totalGpu / activeNodes.length,
      timestamp: Date.now()
    };
  }

  private calculateAverageResponseTime(): number {
    // This would integrate with performance monitoring
    // For now, return a mock value
    return 100; // ms
  }

  private calculateHealthStatus(): 'healthy' | 'degraded' | 'critical' {
    const activeNodes = this.getActiveNodes();
    const resourceUtilization = this.calculateResourceUtilization();
    
    if (activeNodes.length === 0) {
      return 'critical';
    }
    
    const averageLoad = activeNodes.length > 0 
      ? activeNodes.reduce((sum, node) => sum + node.load, 0) / activeNodes.length 
      : 0;
    
    if (averageLoad > 90 || resourceUtilization.cpu > 90) {
      return 'critical';
    }
    
    if (averageLoad > 70 || resourceUtilization.cpu > 70) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  private getRecentScalingEvents(): ScalingDecision[] {
    // This would be implemented with a proper event store
    // For now, return empty array
    return [];
  }

  private selectRoundRobin(nodes: NodeInfo[]): NodeInfo {
    // Simple round-robin selection
    const index = Math.floor(Math.random() * nodes.length);
    return nodes[index];
  }

  private selectLeastConnections(nodes: NodeInfo[]): NodeInfo {
    return nodes.reduce((min, node) => node.load < min.load ? node : min);
  }

  private selectWeightedRoundRobin(nodes: NodeInfo[]): NodeInfo {
    // Weighted selection based on node capacity
    const totalWeight = nodes.reduce((sum, node) => sum + (100 - node.load), 0);
    let random = Math.random() * totalWeight;
    
    for (const node of nodes) {
      random -= (100 - node.load);
      if (random <= 0) {
        return node;
      }
    }
    
    return nodes[0];
  }

  private selectLeastResponseTime(nodes: NodeInfo[]): NodeInfo {
    // This would use actual response time data
    return nodes.reduce((min, node) => node.load < min.load ? node : min);
  }

  private selectIPHash(nodes: NodeInfo[], requestId?: string): NodeInfo {
    if ((requestId ?? '').length === 0) {
      return this.selectRandom(nodes);
    }
    
    const hash = this.hashString(requestId!);
    const index = hash % nodes.length;
    return nodes[index];
  }

  private selectRandom(nodes: NodeInfo[]): NodeInfo {
    const index = Math.floor(Math.random() * nodes.length);
    return nodes[index];
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private scaleUp(targetNodes: number): boolean {
    // This would integrate with cloud providers or container orchestration
    this.logger.info('ScalabilityManager', 'Scaling up cluster', {
      targetNodes,
      currentNodes: this.nodes.size
    });
    
    // Mock implementation - in reality, this would provision new nodes
    return true;
  }

  private scaleDown(targetNodes: number): boolean {
    // This would integrate with cloud providers or container orchestration
    this.logger.info('ScalabilityManager', 'Scaling down cluster', {
      targetNodes,
      currentNodes: this.nodes.size
    });
    
    // Mock implementation - in reality, this would terminate nodes
    return true;
  }

  public destroy(): void {
    if (this.monitoringInterval != null) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.clearCluster();
    this.isInitialized = false;
  }
}
