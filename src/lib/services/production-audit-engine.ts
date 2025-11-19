/**
 * Production-Ready Audit Execution Engine
 * 
 * Real-time monitoring and execution engine for Ghana PCA audits:
 * - Real-time WebSocket monitoring
 * - Performance metrics and analytics
 * - Error handling and recovery
 * - Scalable execution architecture
 * - Resource management
 * - Audit trail and logging
 */

import { EventEmitter } from 'events';
import { WebSocketServer, WebSocket } from 'ws';
import GhanaAuditRunner from './ghana-audit-runner';
import { z } from 'zod';

// Monitoring schemas
export const ExecutionMetricsSchema = z.object({
  executionId: z.string(),
  timestamp: z.date(),
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  activeConnections: z.number(),
  queueSize: z.number(),
  throughput: z.number(),
  errorRate: z.number(),
  averageResponseTime: z.number(),
});

export type ExecutionMetrics = z.infer<typeof ExecutionMetricsSchema>;

export const AuditEventSchema = z.object({
  id: z.string(),
  executionId: z.string(),
  type: z.enum(['started', 'progress', 'completed', 'failed', 'cancelled']),
  timestamp: z.date(),
  data: z.any(),
  metadata: z.record(z.any()).optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

export interface AuditProgressCallback {
  (event: AuditEvent): void;
}

class ProductionAuditEngine extends EventEmitter {
  private static instance: ProductionAuditEngine;
  private auditRunner: GhanaAuditRunner;
  private wsServer: WebSocketServer | null = null;
  private activeConnections: Set<WebSocket> = new Set();
  private executionQueue: any[] = [];
  private activeExecutions: Map<string, any> = new Map();
  private metrics: Map<string, ExecutionMetrics[]> = new Map();
  private eventHistory: AuditEvent[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  private constructor() {
    super();
    this.auditRunner = GhanaAuditRunner.getInstance();
    this.initializeMonitoring();
    this.setupGracefulShutdown();
  }

  static getInstance(): ProductionAuditEngine {
    if (!ProductionAuditEngine.instance) {
      ProductionAuditEngine.instance = new ProductionAuditEngine();
    }
    return ProductionAuditEngine.instance;
  }

  // Initialize WebSocket server for real-time monitoring
  async initializeWebSocketServer(port: number = 8080): Promise<void> {
    try {
      this.wsServer = new WebSocketServer({ port });
      
      this.wsServer.on('connection', (ws: WebSocket) => {
        this.handleNewConnection(ws);
      });

      this.wsServer.on('error', (error) => {
        console.error('WebSocket server error:', error);
      });

      console.log(`🔌 WebSocket monitoring server started on port ${port}`);
      
      // Start monitoring
      this.startMonitoring();
      
    } catch (error) {
      console.error('Failed to start WebSocket server:', error);
      throw error;
    }
  }

  private handleNewConnection(ws: WebSocket) {
    this.activeConnections.add(ws);
    
    console.log(`📱 New monitoring connection (total: ${this.activeConnections.size})`);
    
    // Send current status
    ws.send(JSON.stringify({
      type: 'connection-established',
      data: {
        timestamp: new Date(),
        activeExecutions: this.activeExecutions.size,
        queueSize: this.executionQueue.length,
        connections: this.activeConnections.size,
      }
    }));

    // Send recent events
    const recentEvents = this.eventHistory.slice(-50);
    ws.send(JSON.stringify({
      type: 'event-history',
      data: recentEvents
    }));

    ws.on('message', (data: Buffer) => {
      this.handleWebSocketMessage(ws, data);
    });

    ws.on('close', () => {
      this.activeConnections.delete(ws);
      console.log(`📱 Monitoring connection closed (total: ${this.activeConnections.size})`);
    });

    ws.on('error', (error) => {
      console.error('WebSocket connection error:', error);
      this.activeConnections.delete(ws);
    });
  }

  private handleWebSocketMessage(ws: WebSocket, data: Buffer) {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'subscribe-execution':
          this.subscribeToExecution(ws, message.executionId);
          break;
        case 'get-metrics':
          this.sendMetrics(ws, message.executionId);
          break;
        case 'cancel-execution':
          this.cancelExecution(message.executionId);
          break;
        case 'get-status':
          this.sendStatus(ws);
          break;
        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  // Enhanced audit execution with monitoring
  async executeAuditWithMonitoring(
    config: any,
    declarations: any[],
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<any> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    // Add to queue based on priority
    this.queueExecution(executionId, config, declarations, priority);
    
    // Process queue
    this.processQueue();
    
    return new Promise((resolve, reject) => {
      // Store promise handlers
      this.activeExecutions.set(executionId, { resolve, reject, config, startTime: Date.now() });
      
      // Set up event listeners
      const handleComplete = (event: AuditEvent) => {
        if (event.executionId === executionId) {
          this.off('audit-event', handleComplete);
          this.off('audit-error', handleError);
          
          if (event.type === 'completed') {
            resolve(event.data);
          } else if (event.type === 'failed') {
            reject(new Error(event.data.error || 'Execution failed'));
          }
        }
      };
      
      const handleError = (event: any) => {
        if (event.executionId === executionId) {
          this.off('audit-event', handleComplete);
          this.off('audit-error', handleError);
          reject(new Error(event.error));
        }
      };
      
      this.on('audit-event', handleComplete);
      this.on('audit-error', handleError);
      
      // Emit start event
      this.emitAuditEvent({
        id: `event-${Date.now()}`,
        executionId,
        type: 'started',
        timestamp: new Date(),
        data: { config, priority, queuePosition: this.executionQueue.length }
      });
    });
  }

  private queueExecution(
    executionId: string,
    config: any,
    declarations: any[],
    priority: 'low' | 'medium' | 'high'
  ) {
    const queueItem = {
      executionId,
      config,
      declarations,
      priority,
      timestamp: new Date(),
      attempts: 0
    };
    
    // Insert based on priority
    if (priority === 'high') {
      this.executionQueue.unshift(queueItem);
    } else if (priority === 'medium') {
      const insertIndex = this.executionQueue.findIndex(item => item.priority === 'low');
      if (insertIndex === -1) {
        this.executionQueue.push(queueItem);
      } else {
        this.executionQueue.splice(insertIndex, 0, queueItem);
      }
    } else {
      this.executionQueue.push(queueItem);
    }
  }

  private async processQueue() {
    if (this.executionQueue.length === 0) {
      return;
    }

    // Check resource availability
    const maxConcurrent = 5; // Configurable
    if (this.activeExecutions.size >= maxConcurrent) {
      return;
    }

    const queueItem = this.executionQueue.shift();
    if (!queueItem) {
      return;
    }

    try {
      // Execute audit with progress monitoring
      const execution = await this.auditRunner.executeAudit(
        queueItem.config,
        queueItem.declarations,
        (progress) => {
          this.emitAuditEvent({
            id: `event-${Date.now()}`,
            executionId: queueItem.executionId,
            type: 'progress',
            timestamp: new Date(),
            data: progress
          });
        }
      );

      // Emit completion event
      this.emitAuditEvent({
        id: `event-${Date.now()}`,
        executionId: queueItem.executionId,
        type: 'completed',
        timestamp: new Date(),
        data: execution
      });

      // Resolve promise
      const executionData = this.activeExecutions.get(queueItem.executionId);
      if (executionData && executionData.resolve) {
        executionData.resolve(execution);
        this.activeExecutions.delete(queueItem.executionId);
      }

    } catch (error) {
      console.error(`Execution failed for ${queueItem.executionId}:`, error);
      
      // Emit error event
      this.emit('audit-error', {
        executionId: queueItem.executionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Reject promise
      const executionData = this.activeExecutions.get(queueItem.executionId);
      if (executionData && executionData.reject) {
        executionData.reject(error);
        this.activeExecutions.delete(queueItem.executionId);
      }
    }

    // Process next item
    setTimeout(() => this.processQueue(), 100);
  }

  // Real-time monitoring
  private initializeMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.checkResourceLimits();
      this.cleanupOldEvents();
    }, 5000); // Every 5 seconds
  }

  private collectMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const metrics: ExecutionMetrics = {
      executionId: 'system',
      timestamp: new Date(),
      cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to milliseconds
      memoryUsage: memUsage.heapUsed / 1024 / 1024, // Convert to MB
      activeConnections: this.activeConnections.size,
      queueSize: this.executionQueue.length,
      throughput: this.calculateThroughput(),
      errorRate: this.calculateErrorRate(),
      averageResponseTime: this.calculateAverageResponseTime(),
    };

    // Store metrics
    if (!this.metrics.has('system')) {
      this.metrics.set('system', []);
    }
    
    const systemMetrics = this.metrics.get('system')!;
    systemMetrics.push(metrics);
    
    // Keep only last 100 data points
    if (systemMetrics.length > 100) {
      systemMetrics.shift();
    }

    // Broadcast to WebSocket clients
    this.broadcast({
      type: 'metrics',
      data: metrics
    });
  }

  private calculateThroughput(): number {
    const recentEvents = this.eventHistory.filter(
      event => event.type === 'completed' && 
      Date.now() - event.timestamp.getTime() < 60000 // Last minute
    );
    
    return recentEvents.length;
  }

  private calculateErrorRate(): number {
    const recentEvents = this.eventHistory.filter(
      event => Date.now() - event.timestamp.getTime() < 300000 // Last 5 minutes
    );
    
    if (recentEvents.length === 0) return 0;
    
    const errorEvents = recentEvents.filter(event => event.type === 'failed');
    return (errorEvents.length / recentEvents.length) * 100;
  }

  private calculateAverageResponseTime(): number {
    const completedExecutions = Array.from(this.activeExecutions.values())
      .filter(exec => exec.endTime);
    
    if (completedExecutions.length === 0) return 0;
    
    const totalTime = completedExecutions.reduce((sum, exec) => {
      return sum + (exec.endTime - exec.startTime);
    }, 0);
    
    return totalTime / completedExecutions.length;
  }

  private checkResourceLimits() {
    const memUsage = process.memoryUsage();
    const memUsageMB = memUsage.heapUsed / 1024 / 1024;
    
    // Memory limit check
    if (memUsageMB > 1024) { // 1GB limit
      console.warn(`⚠️ High memory usage: ${memUsageMB.toFixed(2)}MB`);
      
      // Trigger garbage collection
      if (global.gc) {
        global.gc();
      }
    }
    
    // Queue size check
    if (this.executionQueue.length > 50) {
      console.warn(`⚠️ High queue size: ${this.executionQueue.length} items`);
    }
    
    // Connection limit check
    if (this.activeConnections.size > 100) {
      console.warn(`⚠️ High connection count: ${this.activeConnections.size}`);
    }
  }

  private cleanupOldEvents() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    this.eventHistory = this.eventHistory.filter(
      event => event.timestamp.getTime() > cutoffTime
    );
  }

  // Event handling
  private emitAuditEvent(event: AuditEvent) {
    this.eventHistory.push(event);
    
    // Keep only last 1000 events
    if (this.eventHistory.length > 1000) {
      this.eventHistory.shift();
    }
    
    // Emit to listeners
    this.emit('audit-event', event);
    
    // Broadcast to WebSocket clients
    this.broadcast({
      type: 'audit-event',
      data: event
    });
  }

  // WebSocket communication
  private broadcast(message: any) {
    const data = JSON.stringify(message);
    
    this.activeConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(data);
        } catch (error) {
          console.error('Error broadcasting to WebSocket:', error);
          this.activeConnections.delete(ws);
        }
      }
    });
  }

  private subscribeToExecution(ws: WebSocket, executionId: string) {
    // Send execution-specific updates
    const events = this.eventHistory.filter(event => event.executionId === executionId);
    
    ws.send(JSON.stringify({
      type: 'execution-events',
      data: events
    }));
  }

  private sendMetrics(ws: WebSocket, executionId?: string) {
    const metrics = executionId 
      ? this.metrics.get(executionId) || []
      : this.metrics.get('system') || [];
    
    ws.send(JSON.stringify({
      type: 'metrics-data',
      data: metrics
    }));
  }

  private sendStatus(ws: WebSocket) {
    ws.send(JSON.stringify({
      type: 'system-status',
      data: {
        activeExecutions: this.activeExecutions.size,
        queueSize: this.executionQueue.length,
        connections: this.activeConnections.size,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        totalEvents: this.eventHistory.length
      }
    }));
  }

  private async cancelExecution(executionId: string) {
    try {
      // Remove from queue if pending
      const queueIndex = this.executionQueue.findIndex(item => item.executionId === executionId);
      if (queueIndex !== -1) {
        this.executionQueue.splice(queueIndex, 1);
        
        this.emitAuditEvent({
          id: `event-${Date.now()}`,
          executionId,
          type: 'cancelled',
          timestamp: new Date(),
          data: { reason: 'cancelled-from-queue' }
        });
        
        return;
      }
      
      // Cancel active execution
      const cancelled = await this.auditRunner.cancelExecution(executionId);
      
      if (cancelled) {
        this.emitAuditEvent({
          id: `event-${Date.now()}`,
          executionId,
          type: 'cancelled',
          timestamp: new Date(),
          data: { reason: 'cancelled-during-execution' }
        });
      }
      
    } catch (error) {
      console.error(`Error cancelling execution ${executionId}:`, error);
    }
  }

  // Lifecycle management
  private startMonitoring() {
    console.log('📊 Production audit monitoring started');
  }

  private setupGracefulShutdown() {
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      this.isShuttingDown = true;
      
      // Stop monitoring
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
      
      // Close WebSocket connections
      this.activeConnections.forEach(ws => {
        ws.close(1001, 'Server shutting down');
      });
      
      // Close WebSocket server
      if (this.wsServer) {
        this.wsServer.close();
      }
      
      // Wait for active executions to complete (with timeout)
      const timeout = setTimeout(() => {
        console.log('⏰ Shutdown timeout, forcing exit');
        process.exit(1);
      }, 30000); // 30 seconds
      
      while (this.activeExecutions.size > 0 && !this.isShuttingDown) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      clearTimeout(timeout);
      console.log('✅ Graceful shutdown complete');
      process.exit(0);
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  // Public API
  async start(port: number = 8080): Promise<void> {
    await this.initializeWebSocketServer(port);
  }

  getSystemStatus(): any {
    return {
      activeExecutions: this.activeExecutions.size,
      queueSize: this.executionQueue.length,
      connections: this.activeConnections.size,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      totalEvents: this.eventHistory.length,
      metrics: this.metrics.get('system')?.slice(-10) || []
    };
  }

  getExecutionHistory(limit: number = 100): AuditEvent[] {
    return this.eventHistory.slice(-limit);
  }

  getMetrics(executionId?: string): ExecutionMetrics[] {
    return executionId 
      ? this.metrics.get(executionId) || []
      : this.metrics.get('system') || [];
  }
}

export default ProductionAuditEngine;