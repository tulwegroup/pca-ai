/**
 * Comprehensive Ghana PCA AI API
 * 
 * RESTful API with comprehensive endpoints for:
 * - Audit case management (create, update, run, monitor)
 * - Report generation with case-specific context
 * - Evidence validation with Ghana compliance
 * - System health monitoring and statistics
 * - Real-time audit execution tracking
 * - Error handling with detailed responses
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { db } from '@/lib/db';
import GhanaRulePackService from '@/lib/services/ghana-rule-pack-service';
import GhanaEvidenceValidationService from '@/lib/services/ghana-evidence-validation-service';
import GhanaAuditRunner from '@/lib/services/ghana-audit-runner';
import GhanaMinisterReportService from '@/lib/services/ghana-minister-report-service';

// Initialize services
const rulePackService = GhanaRulePackService.getInstance();
const evidenceService = GhanaEvidenceValidationService.getInstance();
const auditRunner = GhanaAuditRunner.getInstance();
const reportService = GhanaMinisterReportService.getInstance();

// API Request/Response schemas
const CreateAuditCaseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  config: z.object({
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
  }),
});

const RunAuditSchema = z.object({
  caseId: z.string(),
  executionOptions: z.object({
    parallelExecution: z.boolean().default(true),
    maxConcurrency: z.number().default(10),
    timeoutMs: z.number().default(30000),
    enableRealTimeUpdates: z.boolean().default(true),
  }),
});

const GenerateReportSchema = z.object({
  caseId: z.string(),
  reportType: z.enum(['executive-summary', 'detailed-violations', 'declarant', 'statistical', 'compliance']),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  exportFormats: z.array(z.enum(['pdf', 'excel', 'word'])).default(['pdf']),
});

const ValidateEvidenceSchema = z.object({
  declarationId: z.string(),
  documents: z.array(z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    path: z.string(),
    size: z.number(),
    format: z.string(),
  })),
});

// Main API handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    switch (endpoint) {
      case 'health':
        return await handleHealthCheck();
      
      case 'audit-cases':
        return await handleGetAuditCases();
      
      case 'audit-case':
        const caseId = searchParams.get('id');
        if (!caseId) {
          return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
        }
        return await handleGetAuditCase(caseId);
      
      case 'audit-executions':
        return await handleGetAuditExecutions();
      
      case 'audit-execution':
        const executionId = searchParams.get('id');
        if (!executionId) {
          return NextResponse.json({ error: 'Execution ID is required' }, { status: 400 });
        }
        return await handleGetAuditExecution(executionId);
      
      case 'reports':
        return await handleGetReports();
      
      case 'report':
        const reportId = searchParams.get('id');
        if (!reportId) {
          return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
        }
        return await handleGetReport(reportId);
      
      case 'rule-packs':
        return await handleGetRulePacks();
      
      case 'evidence-packages':
        return await handleGetEvidencePackages();
      
      case 'system-stats':
        return await handleGetSystemStats();
      
      case 'agent-performance':
        return await handleGetAgentPerformance();
      
      default:
        return NextResponse.json({ 
          message: "Ghana PCA AI API",
          version: "1.0.0",
          endpoints: [
            'health',
            'audit-cases',
            'audit-case?id={id}',
            'audit-executions',
            'audit-execution?id={id}',
            'reports',
            'report?id={id}',
            'rule-packs',
            'evidence-packages',
            'system-stats',
            'agent-performance',
          ],
          methods: ['GET', 'POST']
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const body = await request.json();

    switch (endpoint) {
      case 'create-audit-case':
        return await handleCreateAuditCase(body);
      
      case 'run-audit':
        return await handleRunAudit(body);
      
      case 'generate-report':
        return await handleGenerateReport(body);
      
      case 'validate-evidence':
        return await handleValidateEvidence(body);
      
      case 'create-rule-pack':
        return await handleCreateRulePack(body);
      
      case 'simulate-rule-pack':
        return await handleSimulateRulePack(body);
      
      case 'cancel-execution':
        return await handleCancelExecution(body);
      
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
async function handleHealthCheck() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      rulePackService: 'active',
      evidenceService: 'active',
      auditRunner: 'active',
      reportService: 'active',
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
}

// Audit case management
async function handleGetAuditCases() {
  try {
    const auditCases = await db.auditCase.findMany({
      include: {
        reports: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: auditCases,
      count: auditCases.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch audit cases', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGetAuditCase(caseId: string) {
  try {
    const auditCase = await db.auditCase.findUnique({
      where: { id: caseId },
      include: {
        reports: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!auditCase) {
      return NextResponse.json({ error: 'Audit case not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: auditCase,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch audit case', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleCreateAuditCase(body: any) {
  try {
    const validatedData = CreateAuditCaseSchema.parse(body);
    
    // Create audit case in database
    const auditCase = await db.auditCase.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        config: validatedData.config,
        status: 'created',
        createdById: 'default-user', // In real app, get from auth
      },
      include: {
        reports: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Audit case created successfully',
      data: auditCase,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create audit case', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Audit execution
async function handleRunAudit(body: any) {
  try {
    const validatedData = RunAuditSchema.parse(body);
    
    // Get audit case
    const auditCase = await db.auditCase.findUnique({
      where: { id: validatedData.caseId },
    });

    if (!auditCase) {
      return NextResponse.json({ error: 'Audit case not found' }, { status: 404 });
    }

    // Get test data (in real implementation, this would fetch from database)
    const testData = await getTestData(auditCase.config);
    
    // Update audit case status
    await db.auditCase.update({
      where: { id: validatedData.caseId },
      data: {
        status: 'running',
        startedAt: new Date(),
      }
    });

    // Execute audit
    const execution = await auditRunner.executeAudit(
      {
        caseId: validatedData.caseId,
        ...auditCase.config as any,
        executionOptions: validatedData.executionOptions,
      },
      testData,
      (progress) => {
        // Handle real-time progress updates
        console.log(`Audit progress: ${progress.processed}/${progress.total}`);
      }
    );

    // Update audit case with results
    await db.auditCase.update({
      where: { id: validatedData.caseId },
      data: {
        status: execution.status,
        completedAt: execution.endTime,
        results: execution as any,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Audit execution completed',
      data: execution,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to run audit', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGetAuditExecutions() {
  try {
    const executions = await auditRunner.getAllExecutions();
    
    return NextResponse.json({
      success: true,
      data: executions,
      count: executions.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch audit executions', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGetAuditExecution(executionId: string) {
  try {
    const execution = await auditRunner.getExecution(executionId);
    
    if (!execution) {
      return NextResponse.json({ error: 'Audit execution not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: execution,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch audit execution', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleCancelExecution(body: any) {
  try {
    const { executionId } = body;
    
    if (!executionId) {
      return NextResponse.json({ error: 'Execution ID is required' }, { status: 400 });
    }

    const cancelled = await auditRunner.cancelExecution(executionId);
    
    if (!cancelled) {
      return NextResponse.json({ error: 'Failed to cancel execution or execution not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Audit execution cancelled successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cancel execution', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Report generation
async function handleGenerateReport(body: any) {
  try {
    const validatedData = GenerateReportSchema.parse(body);
    
    const report = await reportService.generateMinisterReport({
      caseId: validatedData.caseId,
      reportType: validatedData.reportType as any,
      period: validatedData.period,
      exportFormats: validatedData.exportFormats,
    });

    // Save report to database
    await db.report.create({
      data: {
        name: report.reportType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: validatedData.reportType,
        content: report as any,
        auditCaseId: validatedData.caseId,
        createdById: 'default-user',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Report generated successfully',
      data: report,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to generate report', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGetReports() {
  try {
    const reports = await db.report.findMany({
      include: {
        auditCase: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reports', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGetReport(reportId: string) {
  try {
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: {
        auditCase: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch report', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Evidence validation
async function handleValidateEvidence(body: any) {
  try {
    const validatedData = ValidateEvidenceSchema.parse(body);
    
    const evidencePackage = await evidenceService.validateEvidencePackage(
      validatedData.declarationId,
      validatedData.documents,
    );

    return NextResponse.json({
      success: true,
      message: 'Evidence validation completed',
      data: evidencePackage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to validate evidence', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGetEvidencePackages() {
  try {
    const packages = await evidenceService.getAllEvidencePackages();
    
    return NextResponse.json({
      success: true,
      data: packages,
      count: packages.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch evidence packages', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Rule pack management
async function handleGetRulePacks() {
  try {
    const rulePacks = await rulePackService.getAllRulePacks();
    
    return NextResponse.json({
      success: true,
      data: rulePacks,
      count: rulePacks.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch rule packs', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleCreateRulePack(body: any) {
  try {
    const rulePack = await rulePackService.createRulePack(body);
    
    return NextResponse.json({
      success: true,
      message: 'Rule pack created successfully',
      data: rulePack,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create rule pack', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleSimulateRulePack(body: any) {
  try {
    const { rulePackId, testDataset } = body;
    
    if (!rulePackId || !testDataset) {
      return NextResponse.json({ error: 'Rule pack ID and test dataset are required' }, { status: 400 });
    }

    const simulationResult = await rulePackService.simulateRulePack(rulePackId, testDataset);
    
    return NextResponse.json({
      success: true,
      message: 'Rule pack simulation completed',
      data: simulationResult,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to simulate rule pack', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// System statistics
async function handleGetSystemStats() {
  try {
    const systemPerformance = await auditRunner.getSystemPerformanceMetrics();
    const agentPerformance = await auditRunner.getAgentPerformanceMetrics();
    const evidenceMetrics = await evidenceService.getValidationMetrics();
    
    return NextResponse.json({
      success: true,
      data: {
        system: systemPerformance,
        agents: agentPerformance,
        evidence: evidenceMetrics,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch system statistics', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGetAgentPerformance() {
  try {
    const agentPerformance = await auditRunner.getAgentPerformanceMetrics();
    
    return NextResponse.json({
      success: true,
      data: agentPerformance,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agent performance', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to get test data
async function getTestData(config: any): Promise<any[]> {
  // In real implementation, this would fetch from database based on config
  // For now, return mock data
  return [
    {
      id: 'DECL-001',
      declarationId: 'D20241118001',
      type: 'import',
      hsCode: '27101990',
      description: 'Petroleum products',
      originCountry: 'NG',
      destinationCountry: 'GH',
      value: 100000,
      currency: 'USD',
      weight: 5000,
      declarantTin: 'TIN1234567',
      declarantName: 'Ghana Trading Ltd',
      portOfEntry: 'TEMA',
      date: new Date(),
      status: 'pending',
      ecowasOrigin: true,
      atgApplicable: true,
      sector: 'petroleum',
      riskScore: 75,
    },
    // Add more mock data as needed
  ];
}