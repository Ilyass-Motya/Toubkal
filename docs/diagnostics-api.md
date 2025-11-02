# Toubkal Diagnostics System API Reference

## Overview

This document provides comprehensive API reference for the Toubkal Diagnostics System, including all classes, methods, interfaces, and enums.

## Core Classes

### Logger

The central logging system for the Toubkal Browser.

#### Methods

##### `getInstance(): Logger`
Returns the singleton instance of the Logger.

**Returns:** `Logger` - The logger instance

##### `initialize(config: LoggerConfig): Promise<void>`
Initializes the logger with the specified configuration.

**Parameters:**
- `config: LoggerConfig` - Logger configuration object

**Returns:** `Promise<void>`

##### `log(level: LogLevel, message: string, context?: Record<string, any>): Promise<void>`
Logs a message with the specified level and optional context.

**Parameters:**
- `level: LogLevel` - Log level (DEBUG, INFO, WARN, ERROR, FATAL)
- `message: string` - Log message
- `context?: Record<string, any>` - Optional context object

**Returns:** `Promise<void>`

##### `getRecentLogs(limit?: number): LogEntry[]`
Retrieves recent log entries.

**Parameters:**
- `limit?: number` - Maximum number of logs to return (default: 100)

**Returns:** `LogEntry[]` - Array of log entries

##### `clearLogs(): void`
Clears all stored logs.

**Returns:** `void`

##### `getHealthStatus(): HealthStatus`
Returns the health status of the logger.

**Returns:** `HealthStatus` - Health status object

##### `getConfig(): LoggerConfig`
Returns the current logger configuration.

**Returns:** `LoggerConfig` - Current configuration

#### Interfaces

##### `LoggerConfig`
```typescript
interface LoggerConfig {
  consoleEnabled: boolean;
  fileEnabled: boolean;
  jsonEnabled: boolean;
  maxLogLevel: LogLevel;
  privacyMode: boolean;
}
```

##### `LogEntry`
```typescript
interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
}
```

##### `HealthStatus`
```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  message?: string;
}
```

#### Enums

##### `LogLevel`
```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}
```

### ErrorTracker

Comprehensive error tracking and reporting system.

#### Methods

##### `getInstance(): ErrorTracker`
Returns the singleton instance of the ErrorTracker.

**Returns:** `ErrorTracker` - The error tracker instance

##### `initialize(config: ErrorTrackerConfig): Promise<void>`
Initializes the error tracker with the specified configuration.

**Parameters:**
- `config: ErrorTrackerConfig` - Error tracker configuration object

**Returns:** `Promise<void>`

##### `trackError(error: ErrorData): Promise<ErrorEntry>`
Tracks an error with the specified data.

**Parameters:**
- `error: ErrorData` - Error data object

**Returns:** `Promise<ErrorEntry>` - The tracked error entry

##### `getRecentErrors(limit?: number): ErrorEntry[]`
Retrieves recent error entries.

**Parameters:**
- `limit?: number` - Maximum number of errors to return (default: 100)

**Returns:** `ErrorEntry[]` - Array of error entries

##### `clearErrors(): void`
Clears all stored errors.

**Returns:** `void`

##### `getHealthStatus(): HealthStatus`
Returns the health status of the error tracker.

**Returns:** `HealthStatus` - Health status object

##### `getConfig(): ErrorTrackerConfig`
Returns the current error tracker configuration.

**Returns:** `ErrorTrackerConfig` - Current configuration

#### Interfaces

##### `ErrorTrackerConfig`
```typescript
interface ErrorTrackerConfig {
  autoReport: boolean;
  maxErrors: number;
  deduplicationWindow: number;
  privacyMode: boolean;
}
```

##### `ErrorData`
```typescript
interface ErrorData {
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  context?: Record<string, any>;
}
```

##### `ErrorEntry`
```typescript
interface ErrorEntry {
  id: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
}
```

#### Enums

##### `ErrorSeverity`
```typescript
enum ErrorSeverity {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3
}
```

##### `ErrorCategory`
```typescript
enum ErrorCategory {
  SYSTEM = 0,
  NETWORK = 1,
  SECURITY = 2,
  PERFORMANCE = 3
}
```

### PerformanceMonitor

Real-time performance metrics collection and analysis system.

#### Methods

##### `getInstance(): PerformanceMonitor`
Returns the singleton instance of the PerformanceMonitor.

**Returns:** `PerformanceMonitor` - The performance monitor instance

##### `initialize(config: PerformanceMonitorConfig): Promise<void>`
Initializes the performance monitor with the specified configuration.

**Parameters:**
- `config: PerformanceMonitorConfig` - Performance monitor configuration object

**Returns:** `Promise<void>`

##### `trackMetric(metric: MetricData): Promise<MetricEntry>`
Tracks a performance metric.

**Parameters:**
- `metric: MetricData` - Metric data object

**Returns:** `Promise<MetricEntry>` - The tracked metric entry

##### `getRecentMetrics(limit?: number): MetricEntry[]`
Retrieves recent metric entries.

**Parameters:**
- `limit?: number` - Maximum number of metrics to return (default: 100)

**Returns:** `MetricEntry[]` - Array of metric entries

##### `getMetricsByType(type: PerformanceMetricType, limit?: number): MetricEntry[]`
Retrieves metrics of a specific type.

**Parameters:**
- `type: PerformanceMetricType` - Metric type
- `limit?: number` - Maximum number of metrics to return

**Returns:** `MetricEntry[]` - Array of metric entries

##### `getRecommendations(): Recommendation[]`
Returns performance recommendations based on collected metrics.

**Returns:** `Recommendation[]` - Array of recommendations

##### `clearMetrics(): void`
Clears all stored metrics.

**Returns:** `void`

##### `getHealthStatus(): HealthStatus`
Returns the health status of the performance monitor.

**Returns:** `HealthStatus` - Health status object

##### `getConfig(): PerformanceMonitorConfig`
Returns the current performance monitor configuration.

**Returns:** `PerformanceMonitorConfig` - Current configuration

#### Interfaces

##### `PerformanceMonitorConfig`
```typescript
interface PerformanceMonitorConfig {
  enabled: boolean;
  maxMetrics: number;
  collectionInterval: number;
  privacyMode: boolean;
}
```

##### `MetricData`
```typescript
interface MetricData {
  type: PerformanceMetricType;
  name: string;
  value: number;
  context?: Record<string, any>;
}
```

##### `MetricEntry`
```typescript
interface MetricEntry {
  id: string;
  type: PerformanceMetricType;
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}
```

##### `Recommendation`
```typescript
interface Recommendation {
  type: 'optimization' | 'warning' | 'critical';
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
}
```

#### Enums

##### `PerformanceMetricType`
```typescript
enum PerformanceMetricType {
  PAGE_LOAD = 0,
  MEMORY_USAGE = 1,
  CPU_USAGE = 2,
  NETWORK_LATENCY = 3
}
```

### ScalabilityManager

System scalability management and load balancing system.

#### Methods

##### `getInstance(): ScalabilityManager`
Returns the singleton instance of the ScalabilityManager.

**Returns:** `ScalabilityManager` - The scalability manager instance

##### `initialize(config: ScalabilityManagerConfig): Promise<void>`
Initializes the scalability manager with the specified configuration.

**Parameters:**
- `config: ScalabilityManagerConfig` - Scalability manager configuration object

**Returns:** `Promise<void>`

##### `getScalabilityMetrics(): Promise<ScalabilityMetrics>`
Retrieves current scalability metrics.

**Returns:** `Promise<ScalabilityMetrics>` - Current scalability metrics

##### `shouldScale(): ScaleDecision`
Determines if the system should scale based on current metrics.

**Returns:** `ScaleDecision` - Scaling decision

##### `getActiveNodes(): NodeInfo[]`
Retrieves information about active nodes.

**Returns:** `NodeInfo[]` - Array of active node information

##### `getHealthStatus(): HealthStatus`
Returns the health status of the scalability manager.

**Returns:** `HealthStatus` - Health status object

##### `getConfig(): ScalabilityManagerConfig`
Returns the current scalability manager configuration.

**Returns:** `ScalabilityManagerConfig` - Current configuration

##### `clearMetrics(): void`
Clears all stored scalability metrics.

**Returns:** `void`

#### Interfaces

##### `ScalabilityManagerConfig`
```typescript
interface ScalabilityManagerConfig {
  mode: ScalabilityMode;
  maxNodes: number;
  minNodes: number;
  loadBalancingStrategy: LoadBalancingStrategy;
  autoScaling: boolean;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  privacyMode: boolean;
}
```

##### `ScalabilityMetrics`
```typescript
interface ScalabilityMetrics {
  totalNodes: number;
  activeNodes: number;
  averageLoad: number;
  healthStatus: string;
}
```

##### `ScaleDecision`
```typescript
interface ScaleDecision {
  action: 'scale_up' | 'scale_down' | 'maintain';
  reason: string;
  currentLoad: number;
  threshold: number;
}
```

##### `NodeInfo`
```typescript
interface NodeInfo {
  id: string;
  status: 'active' | 'inactive' | 'maintenance';
  load: number;
  lastSeen: number;
}
```

#### Enums

##### `ScalabilityMode`
```typescript
enum ScalabilityMode {
  SINGLE_INSTANCE = 0,
  CLUSTER = 1,
  DISTRIBUTED = 2,
  CLOUD = 3
}
```

##### `LoadBalancingStrategy`
```typescript
enum LoadBalancingStrategy {
  ROUND_ROBIN = 0,
  LEAST_CONNECTIONS = 1,
  WEIGHTED_ROUND_ROBIN = 2,
  LEAST_RESPONSE_TIME = 3,
  IP_HASH = 4,
  RANDOM = 5
}
```

## Dashboard Components

### DiagnosticsDashboard

Main React component for the diagnostics dashboard.

#### Props

```typescript
interface DiagnosticsDashboardProps {
  // No props required - component is self-contained
}
```

#### Features

- Real-time monitoring interface
- Tabbed navigation (Logs, Errors, Performance, Scalability)
- Auto-refresh functionality
- Search and filtering capabilities
- Responsive design

### DeveloperTools

Advanced developer tools component.

#### Props

```typescript
interface DeveloperToolsProps {
  // No props required - component is self-contained
}
```

#### Features

- System diagnostics
- Performance profiling
- Memory analysis
- Network monitoring
- Debug utilities

### DiagnosticsConfig

Configuration management component.

#### Props

```typescript
interface DiagnosticsConfigProps {
  // No props required - component is self-contained
}
```

#### Features

- Settings management
- Log level configuration
- Performance thresholds
- Scalability settings

## Usage Examples

### Basic Logging

```typescript
import { Logger, LogLevel } from '@/toubkal/app/core/diagnostics/logger';

const logger = Logger.getInstance();
await logger.initialize({
  consoleEnabled: true,
  fileEnabled: false,
  jsonEnabled: false,
  maxLogLevel: LogLevel.INFO,
  privacyMode: false
});

// Log a message
await logger.log(LogLevel.INFO, 'User action completed', { 
  userId: '123', 
  action: 'login' 
});
```

### Error Tracking

```typescript
import { ErrorTracker, ErrorSeverity, ErrorCategory } from '@/toubkal/app/core/diagnostics/error-tracker';

const errorTracker = ErrorTracker.getInstance();
await errorTracker.initialize({
  autoReport: true,
  maxErrors: 1000,
  deduplicationWindow: 300000,
  privacyMode: false
});

// Track an error
const error = await errorTracker.trackError({
  severity: ErrorSeverity.HIGH,
  category: ErrorCategory.SYSTEM,
  message: 'Service unavailable',
  context: { service: 'auth-service', endpoint: '/login' }
});
```

### Performance Monitoring

```typescript
import { PerformanceMonitor, PerformanceMetricType } from '@/toubkal/app/core/diagnostics/performance-monitor';

const performanceMonitor = PerformanceMonitor.getInstance();
await performanceMonitor.initialize({
  enabled: true,
  maxMetrics: 10000,
  collectionInterval: 1000,
  privacyMode: false
});

// Track a performance metric
const metric = await performanceMonitor.trackMetric({
  type: PerformanceMetricType.PAGE_LOAD,
  name: 'Homepage Load Time',
  value: 1500,
  context: { url: 'https://example.com' }
});
```

### Scalability Management

```typescript
import { ScalabilityManager, ScalabilityMode, LoadBalancingStrategy } from '@/toubkal/app/core/diagnostics/scalability-manager';

const scalabilityManager = ScalabilityManager.getInstance();
await scalabilityManager.initialize({
  mode: ScalabilityMode.CLUSTER,
  maxNodes: 10,
  minNodes: 1,
  loadBalancingStrategy: LoadBalancingStrategy.ROUND_ROBIN,
  autoScaling: true,
  scaleUpThreshold: 80,
  scaleDownThreshold: 20,
  privacyMode: false
});

// Get scalability metrics
const metrics = await scalabilityManager.getScalabilityMetrics();
```

## Error Handling

All methods return promises and can throw errors. Common error scenarios:

### Initialization Errors
```typescript
try {
  await logger.initialize(config);
} catch (error) {
  console.error('Failed to initialize logger:', error);
}
```

### Configuration Errors
```typescript
try {
  await errorTracker.initialize(invalidConfig);
} catch (error) {
  console.error('Invalid configuration:', error);
}
```

### Data Access Errors
```typescript
try {
  const logs = logger.getRecentLogs();
} catch (error) {
  console.error('Failed to retrieve logs:', error);
}
```

## Performance Considerations

### Memory Usage
- Each system has configurable limits for stored data
- Regular cleanup is recommended for long-running applications
- Monitor memory usage with `process.memoryUsage()`

### Latency
- All operations are designed for low latency
- Asynchronous operations don't block the main thread
- Consider batching operations for high-volume scenarios

### Throughput
- Systems are optimized for high throughput
- Concurrent operations are supported
- Consider rate limiting for very high-volume scenarios

## Testing

### Unit Testing
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger, LogLevel } from '@/toubkal/app/core/diagnostics/logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(async () => {
    logger = Logger.getInstance();
    await logger.initialize({
      consoleEnabled: false,
      fileEnabled: false,
      jsonEnabled: false,
      maxLogLevel: LogLevel.DEBUG,
      privacyMode: false
    });
  });

  it('should log messages correctly', async () => {
    await logger.log(LogLevel.INFO, 'Test message');
    const logs = logger.getRecentLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('Test message');
  });
});
```

### Integration Testing
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { Logger, ErrorTracker, PerformanceMonitor, ScalabilityManager } from '@/toubkal/app/core/diagnostics/logger';

describe('Diagnostics System Integration', () => {
  let logger: Logger;
  let errorTracker: ErrorTracker;
  let performanceMonitor: PerformanceMonitor;
  let scalabilityManager: ScalabilityManager;

  beforeEach(async () => {
    // Initialize all systems
    logger = Logger.getInstance();
    errorTracker = ErrorTracker.getInstance();
    performanceMonitor = PerformanceMonitor.getInstance();
    scalabilityManager = ScalabilityManager.getInstance();

    await Promise.all([
      logger.initialize({ /* config */ }),
      errorTracker.initialize({ /* config */ }),
      performanceMonitor.initialize({ /* config */ }),
      scalabilityManager.initialize({ /* config */ })
    ]);
  });

  it('should work together seamlessly', async () => {
    // Test cross-system functionality
    await logger.log(LogLevel.INFO, 'Integration test');
    const error = await errorTracker.trackError({ /* error data */ });
    const metric = await performanceMonitor.trackMetric({ /* metric data */ });
    const metrics = await scalabilityManager.getScalabilityMetrics();

    expect(logger.getRecentLogs()).toHaveLength(1);
    expect(errorTracker.getRecentErrors()).toHaveLength(1);
    expect(performanceMonitor.getRecentMetrics()).toHaveLength(1);
    expect(metrics).toBeDefined();
  });
});
```

## Migration Guide

### From v1.0 to v2.0

#### Breaking Changes
- Configuration interface changes
- Method signature updates
- Enum value changes

#### Migration Steps
1. Update import statements
2. Update configuration objects
3. Update method calls
4. Test thoroughly

### From v2.0 to v3.0

#### New Features
- Enhanced privacy controls
- Improved performance monitoring
- Advanced scalability features

#### Migration Steps
1. Review new configuration options
2. Update initialization code
3. Test new features
4. Update documentation

## Support

For API support and questions:
- **Documentation**: Check this API reference
- **Examples**: See usage examples above
- **Issues**: Report issues on the project repository
- **Community**: Join the Toubkal Browser community
