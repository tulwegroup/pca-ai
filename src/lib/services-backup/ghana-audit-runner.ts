/**
 * Enhanced Ghana Audit Runner Service
 * 
 * Orchestrates specialized audit agents for comprehensive Ghana customs audit:
 * - Context-aware agent selection based on declaration
 * - Enhanced results aggregation with Ghana metrics
 * - Real-time execution with timing and error handling
 * - Performance monitoring and optimization
 */

import { 
  ECOWASOriginVerificationAgent,
  PetroleumATGAnalyzer,
  GhanaTaxComplianceAgent,
  TSAPaymentReconciliationAgent,
  AgentResult
} from '../agents/ghana-audit-agents';
import { z } from 'zod';

// Audit execution schemas
export const AuditExecutionConfigSchema = z.object({
  caseId: z.string(),
  scope: z.enum(['all', 'hs-codes', 'shipments', 'declarations']),
  targetFilters: z.object({
    hsCodes: z.array(z.string()).optional(),
    shipmentIds: z.array(z.string()).optional(),
    declarationIds: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string(),
      end: z.string(),
    }).optional(),
    countries: z.array(z.string()).optional(),
    riskThreshold: z.number().optional(),
    sectors: z.array(z.string()).optional(),
  }),
  agentConfig: z.object({
    enableECOWASAgent: z.boolean().default(true),
    enablePetroleumAgent: z.boolean().default(true),
    enableTaxAgent: z.boolean().default(true),
    enableTSAgent: z.boolean().default(true),
  }),
  executionOptions: z.object({
    parallelExecution: z.boolean().default(true),
    maxConcurrency: z.number().default(10),
    timeoutMs: z.number().default(30000),
    enableRealTimeUpdates: z.boolean().default(true),
  }),
});

export type AuditExecutionConfig = z.infer<typeof AuditExecutionConfigSchema>;

export const AuditExecutionResultSchema = z.object({
  executionId: z.string(),
  caseId: z.string(),
  status: z.enum(['running', 'completed', 'failed', 'cancelled']),
  startTime: z.date(),
  endTime: z.date().optional(),
  totalDeclarations: z.number(),
  processedDeclarations: z.number(),
  failedDeclarations: z.number(),
  
  // Agent performance metrics
  agentResults: z.array(AgentResult),
  agentPerformance: z.record(z.object({
    totalProcessed: z.number(),
    violationsDetected: z.number(),
    averageConfidence: z.number(),
    averageProcessingTime: z.number(),
    accuracy: z.number(),
  })),
  
  // Ghana-specific metrics
  ghanaMetrics: z.object({
    totalViolations: z.number(),
    totalRecoveryAmount: z.number(),
    sectoralBreakdown: z.record(z.object({
      violations: z.number(),
      recovery: z.number(),
      declarations: z.number(),
    })),
    violationTypes: z.record(z.number()),
    riskDistribution: z.record(z.number()),
    complianceRate: z.number(),
  }),
  
  // Performance metrics
  performanceMetrics: z.object({
    totalExecutionTime: z.number(),
    averageProcessingTime: z.number(),
    throughput: z.number(), // declarations per second
    errorRate: z.number(),
    memoryUsage: z.number().optional(),
  }),
  
  errors: z.array(z.object({
    declarationId: z.string(),
    agentType: z.string(),
    error: z.string(),
    timestamp: z.date(),
  })),
});

export type AuditExecutionResult = z.infer<typeof AuditExecutionResultSchema>;

export interface AuditProgressCallback {
  (progress: {
    executionId: string;
    processed: number;
    total: number;
    currentDeclaration?: string;
    agentResults?: AgentResult[];
  }): void;
}

class GhanaAuditRunner {
  private static instance: GhanaAuditRunner;
  private agents: Map<string, any> = new Map();
  private executions: Map<string, AuditExecutionResult> = new Map();
  private progressCallbacks: Map<string, AuditProgressCallback[]> = new Map();

  private constructor() {
    this.initializeAgents();
  }

  static getInstance(): GhanaAuditRunner {
    if (!GhanaAuditRunner.instance) {
      GhanaAuditRunner.instance = new GhanaAuditRunner();
    }
    return GhanaAuditRunner.instance;
  }

  private initializeAgents() {
    this.agents.set('ecowas-origin', new ECOWASOriginVerificationAgent());
    this.agents.set('petroleum-atg', new PetroleumATGAnalyzer());
    this.agents.set('tax-compliance', new GhanaTaxComplianceAgent());
    this.agents.set('tsa-reconciliation', new TSAPaymentReconciliationAgent());
  }

  // Main audit execution method
  async executeAudit(
    config: AuditExecutionConfig,
    declarations: any[],
    progressCallback?: AuditProgressCallback
  ): Promise<AuditExecutionResult> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    // Initialize execution result
    const execution: AuditExecutionResult = {
      executionId,
      caseId: config.caseId,
      status: 'running',
      startTime: new Date(),
      totalDeclarations: declarations.length,
      processedDeclarations: 0,
      failedDeclarations: 0,
      agentResults: [],
      agentPerformance: {},
      ghanaMetrics: {
        totalViolations: 0,
        totalRecoveryAmount: 0,
        sectoralBreakdown: {},
        violationTypes: {},
        riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
        complianceRate: 0,
      },
      performanceMetrics: {
        totalExecutionTime: 0,
        averageProcessingTime: 0,
        throughput: 0,
        errorRate: 0,
      },
      errors: [],
    };

    this.executions.set(executionId, execution);
    
    if (progressCallback) {
      this.addProgressCallback(executionId, progressCallback);
    }

    try {
      // Filter declarations based on scope
      const filteredDeclarations = this.filterDeclarations(declarations, config);
      execution.totalDeclarations = filteredDeclarations.length;

      // Execute audit based on configuration
      if (config.executionOptions.parallelExecution) {
        await this.executeParallel(execution, filteredDeclarations, config);
      } else {
        await this.executeSequential(execution, filteredDeclarations, config);
      }

      // Calculate final metrics
      this.calculateFinalMetrics(execution);
      execution.status = 'completed';
      execution.endTime = new Date();

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errors.push({
        declarationId: 'system',
        agentType: 'system',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
    }

    this.executions.set(executionId, execution);
    this.removeProgressCallbacks(executionId);
    
    return execution;
  }

  private async executeParallel(
    execution: AuditExecutionResult,
    declarations: any[],
    config: AuditExecutionConfig
  ) {
    const { maxConcurrency } = config.executionOptions;
    const chunks = this.chunkArray(declarations, maxConcurrency);
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (declaration) => {
        try {
          return await this.processDeclaration(declaration, config);
        } catch (error) {
          execution.failedDeclarations++;
          execution.errors.push({
            declarationId: declaration.id || declaration.declarationId,
            agentType: 'system',
            error: error instanceof Error ? error.message : 'Processing error',
            timestamp: new Date(),
          });
          return null;
        }
      });

      const results = await Promise.all(promises);
      
      // Process results
      results.forEach(result => {
        if (result) {
          execution.agentResults.push(...result);
          execution.processedDeclarations++;
          
          // Update progress
          this.updateProgress(execution.executionId, {
            processed: execution.processedDeclarations,
            total: execution.totalDeclarations,
            currentDeclaration: `Processed ${execution.processedDeclarations}/${execution.totalDeclarations}`,
            agentResults: result,
          });
        }
      });
    }
  }

  private async executeSequential(
    execution: AuditExecutionResult,
    declarations: any[],
    config: AuditExecutionConfig
  ) {
    for (const declaration of declarations) {
      try {
        const results = await this.processDeclaration(declaration, config);
        execution.agentResults.push(...results);
        execution.processedDeclarations++;
        
        // Update progress
        this.updateProgress(execution.executionId, {
          processed: execution.processedDeclarations,
          total: execution.totalDeclarations,
          currentDeclaration: declaration.id || declaration.declarationId,
          agentResults: results,
        });
        
      } catch (error) {
        execution.failedDeclarations++;
        execution.errors.push({
          declarationId: declaration.id || declaration.declarationId,
          agentType: 'system',
          error: error instanceof Error ? error.message : 'Processing error',
          timestamp: new Date(),
        });
      }
    }
  }

  private async processDeclaration(declaration: any, config: AuditExecutionConfig): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    const enabledAgents = this.getEnabledAgents(config);

    for (const [agentType, agent] of enabledAgents) {
      // Check if agent should run on this declaration
      if (this.shouldAgentRun(agentType, declaration)) {
        try {
          const result = await agent.analyze(declaration);
          results.push(result);
        } catch (error) {
          // Log error but continue with other agents
          console.error(`Agent ${agentType} failed for declaration ${declaration.id}:`, error);
        }
      }
    }

    return results;
  }

  private getEnabledAgents(config: AuditExecutionConfig): Map<string, any> {
    const enabled = new Map();
    
    if (config.agentConfig.enableECOWASAgent) {
      enabled.set('ecowas-origin', this.agents.get('ecowas-origin'));
    }
    if (config.agentConfig.enablePetroleumAgent) {
      enabled.set('petroleum-atg', this.agents.get('petroleum-atg'));
    }
    if (config.agentConfig.enableTaxAgent) {
      enabled.set('tax-compliance', this.agents.get('tax-compliance'));
    }
    if (config.agentConfig.enableTSAgent) {
      enabled.set('tsa-reconciliation', this.agents.get('tsa-reconciliation'));
    }
    
    return enabled;
  }

  private shouldAgentRun(agentType: string, declaration: any): boolean {
    switch (agentType) {
      case 'ecowas-origin':
        return declaration.ecowasOrigin || this.isEcowaSCountry(declaration.originCountry);
      
      case 'petroleum-atg':
        const petroleumHSCodes = ['2709', '2710', '2711', '2713'];
        return petroleumHSCodes.some(code => declaration.hsCode.startsWith(code));
      
      case 'tax-compliance':
        return true; // Always run tax compliance
      
      case 'tsa-reconciliation':
        return declaration.value > 1000; // Only for significant values
      
      default:
        return true;
    }
  }

  private isEcowaSCountry(country: string): boolean {
    const ecowasCountries = ['NG', 'BJ', 'CI', 'BF', 'ML', 'NE', 'SN', 'SL', 'TG'];
    return ecowasCountries.includes(country);
  }

  private filterDeclarations(declarations: any[], config: AuditExecutionConfig): any[] {
    let filtered = [...declarations];

    // Apply filters based on scope
    switch (config.scope) {
      case 'hs-codes':
        if (config.targetFilters.hsCodes) {
          filtered = filtered.filter(decl => 
            config.targetFilters.hsCodes!.some(code => decl.hsCode.startsWith(code))
          );
        }
        break;
      
      case 'shipments':
        if (config.targetFilters.shipmentIds) {
          filtered = filtered.filter(decl => 
            config.targetFilters.shipmentIds!.includes(decl.shipmentId)
          );
        }
        break;
      
      case 'declarations':
        if (config.targetFilters.declarationIds) {
          filtered = filtered.filter(decl => 
            config.targetFilters.declarationIds!.includes(decl.id || decl.declarationId)
          );
        }
        break;
    }

    // Apply common filters
    if (config.targetFilters.dateRange) {
      const start = new Date(config.targetFilters.dateRange.start);
      const end = new Date(config.targetFilters.dateRange.end);
      filtered = filtered.filter(decl => {
        const declDate = new Date(decl.date);
        return declDate >= start && declDate <= end;
      });
    }

    if (config.targetFilters.countries) {
      filtered = filtered.filter(decl => 
        config.targetFilters.countries!.includes(decl.originCountry) ||
        config.targetFilters.countries!.includes(decl.destinationCountry)
      );
    }

    if (config.targetFilters.riskThreshold !== undefined) {
      filtered = filtered.filter(decl => 
        (decl.riskScore || 0) >= config.targetFilters.riskThreshold!
      );
    }

    if (config.targetFilters.sectors) {
      filtered = filtered.filter(decl => 
        config.targetFilters.sectors!.includes(decl.sector)
      );
    }

    return filtered;
  }

  private calculateFinalMetrics(execution: AuditExecutionResult) {
    const endTime = execution.endTime || new Date();
    execution.performanceMetrics.totalExecutionTime = endTime.getTime() - execution.startTime.getTime();
    execution.performanceMetrics.averageProcessingTime = 
      execution.agentResults.length > 0 
        ? execution.agentResults.reduce((sum, result) => sum + result.processingTime, 0) / execution.agentResults.length
        : 0;
    execution.performanceMetrics.throughput = 
      execution.performanceMetrics.totalExecutionTime > 0 
        ? (execution.processedDeclarations * 1000) / execution.performanceMetrics.totalExecutionTime
        : 0;
    execution.performanceMetrics.errorRate = 
      execution.totalDeclarations > 0 
        ? (execution.failedDeclarations / execution.totalDeclarations) * 100
        : 0;

    // Calculate agent performance
    const agentGroups = this.groupResultsByAgent(execution.agentResults);
    for (const [agentType, results] of agentGroups) {
      const violations = results.filter(r => r.hasViolation).length;
      const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
      const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;
      
      execution.agentPerformance[agentType] = {
        totalProcessed: results.length,
        violationsDetected: violations,
        averageConfidence: avgConfidence,
        averageProcessingTime: avgProcessingTime,
        accuracy: avgConfidence, // Simplified accuracy calculation
      };
    }

    // Calculate Ghana-specific metrics
    this.calculateGhanaMetrics(execution);
  }

  private calculateGhanaMetrics(execution: AuditExecutionResult) {
    const violations = execution.agentResults.filter(r => r.hasViolation);
    
    execution.ghanaMetrics.totalViolations = violations.length;
    execution.ghanaMetrics.totalRecoveryAmount = violations.reduce((sum, v) => {
      const recovery = v.metadata?.recoveryAmount || v.metadata?.estimatedShortfall || 0;
      return sum + recovery;
    }, 0);

    // Sectoral breakdown
    const sectorGroups = this.groupResultsBySector(execution.agentResults);
    for (const [sector, results] of sectorGroups) {
      const sectorViolations = results.filter(r => r.hasViolation);
      const sectorRecovery = sectorViolations.reduce((sum, v) => {
        const recovery = v.metadata?.recoveryAmount || v.metadata?.estimatedShortfall || 0;
        return sum + recovery;
      }, 0);

      execution.ghanaMetrics.sectoralBreakdown[sector] = {
        violations: sectorViolations.length,
        recovery: sectorRecovery,
        declarations: results.length,
      };
    }

    // Violation types
    for (const violation of violations) {
      for (const finding of violation.findings) {
        execution.ghanaMetrics.violationTypes[finding.type] = 
          (execution.ghanaMetrics.violationTypes[finding.type] || 0) + 1;
      }
    }

    // Risk distribution
    for (const result of execution.agentResults) {
      execution.ghanaMetrics.riskDistribution[result.riskLevel >= 80 ? 'critical' : 
                                               result.riskLevel >= 60 ? 'high' : 
                                               result.riskLevel >= 40 ? 'medium' : 'low']++;
    }

    // Compliance rate
    execution.ghanaMetrics.complianceRate = 
      execution.agentResults.length > 0 
        ? ((execution.agentResults.length - violations.length) / execution.agentResults.length) * 100
        : 0;
  }

  private groupResultsByAgent(results: AgentResult[]): Map<string, AgentResult[]> {
    const groups = new Map<string, AgentResult[]>();
    
    for (const result of results) {
      if (!groups.has(result.agentType)) {
        groups.set(result.agentType, []);
      }
      groups.get(result.agentType)!.push(result);
    }
    
    return groups;
  }

  private groupResultsBySector(results: AgentResult[]): Map<string, AgentResult[]> {
    const groups = new Map<string, AgentResult[]>();
    
    for (const result of results) {
      const sector = result.metadata?.sector || 'unknown';
      if (!groups.has(sector)) {
        groups.set(sector, []);
      }
      groups.get(sector)!.push(result);
    }
    
    return groups;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private addProgressCallback(executionId: string, callback: AuditProgressCallback) {
    if (!this.progressCallbacks.has(executionId)) {
      this.progressCallbacks.set(executionId, []);
    }
    this.progressCallbacks.get(executionId)!.push(callback);
  }

  private removeProgressCallbacks(executionId: string) {
    this.progressCallbacks.delete(executionId);
  }

  private updateProgress(executionId: string, progress: any) {
    const callbacks = this.progressCallbacks.get(executionId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback({ executionId, ...progress });
        } catch (error) {
          console.error('Progress callback error:', error);
        }
      });
    }
  }

  // Public API methods
  async getExecution(executionId: string): Promise<AuditExecutionResult | null> {
    return this.executions.get(executionId) || null;
  }

  async getAllExecutions(): Promise<AuditExecutionResult[]> {
    return Array.from(this.executions.values());
  }

  async getExecutionsByCase(caseId: string): Promise<AuditExecutionResult[]> {
    return Array.from(this.executions.values()).filter(exec => exec.caseId === caseId);
  }

  async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled';
      execution.endTime = new Date();
      this.executions.set(executionId, execution);
      return true;
    }
    return false;
  }

  // Analytics methods
  async getAgentPerformanceMetrics(): Promise<any> {
    const allExecutions = Array.from(this.executions.values()).filter(exec => exec.status === 'completed');
    const agentMetrics: Record<string, any> = {};

    for (const execution of allExecutions) {
      for (const [agentType, performance] of Object.entries(execution.agentPerformance)) {
        if (!agentMetrics[agentType]) {
          agentMetrics[agentType] = {
            totalProcessed: 0,
            totalViolations: 0,
            averageConfidence: 0,
            averageProcessingTime: 0,
            executions: 0,
          };
        }

        const metrics = agentMetrics[agentType];
        metrics.totalProcessed += performance.totalProcessed;
        metrics.totalViolations += performance.violationsDetected;
        metrics.averageConfidence += performance.averageConfidence;
        metrics.averageProcessingTime += performance.averageProcessingTime;
        metrics.executions++;
      }
    }

    // Calculate averages
    for (const [agentType, metrics] of Object.entries(agentMetrics)) {
      if (metrics.executions > 0) {
        metrics.averageConfidence /= metrics.executions;
        metrics.averageProcessingTime /= metrics.executions;
        metrics.violationRate = (metrics.totalViolations / metrics.totalProcessed) * 100;
      }
    }

    return agentMetrics;
  }

  async getSystemPerformanceMetrics(): Promise<any> {
    const allExecutions = Array.from(this.executions.values());
    const completed = allExecutions.filter(exec => exec.status === 'completed');
    
    if (completed.length === 0) {
      return {
        totalExecutions: 0,
        averageExecutionTime: 0,
        totalDeclarationsProcessed: 0,
        systemThroughput: 0,
        errorRate: 0,
      };
    }

    const totalTime = completed.reduce((sum, exec) => sum + exec.performanceMetrics.totalExecutionTime, 0);
    const totalDeclarations = completed.reduce((sum, exec) => sum + exec.processedDeclarations, 0);
    const totalErrors = allExecutions.reduce((sum, exec) => sum + exec.failedDeclarations, 0);

    return {
      totalExecutions: allExecutions.length,
      completedExecutions: completed.length,
      averageExecutionTime: totalTime / completed.length,
      totalDeclarationsProcessed: totalDeclarations,
      systemThroughput: totalDeclarations / (totalTime / 1000), // declarations per second
      errorRate: totalErrors > 0 ? (totalErrors / (totalDeclarations + totalErrors)) * 100 : 0,
      averageAccuracy: this.calculateAverageAccuracy(completed),
    };
  }

  private calculateAverageAccuracy(executions: AuditExecutionResult[]): number {
    if (executions.length === 0) return 0;
    
    const totalAccuracy = executions.reduce((sum, exec) => {
      const avgAgentAccuracy = Object.values(exec.agentPerformance)
        .reduce((agentSum: number, agent: any) => agentSum + agent.accuracy, 0) / 
        Object.keys(exec.agentPerformance).length;
      return sum + avgAgentAccuracy;
    }, 0);
    
    return totalAccuracy / executions.length;
  }
}

export default GhanaAuditRunner;