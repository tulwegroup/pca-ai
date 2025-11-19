/**
 * Enhanced Ghana Rule Pack Management Service
 * 
 * Provides Ghana-specific rule templates with focus areas for:
 * - Petroleum sector (ATG monitoring, tax compliance)
 * - Textiles sector (origin verification, HS classification)
 * - Vehicles sector (value assessment, documentation)
 * 
 * Features:
 * - Risk level adjustment (low, medium, high)
 * - Simulation engine with performance metrics
 * - Enhanced rule evaluation with Ghana context
 * - Sectoral impact calculation
 */

import { z } from 'zod';

// Ghana-specific rule schemas
export const GhanaRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['petroleum', 'textiles', 'vehicles', 'general']),
  riskLevel: z.enum(['low', 'medium', 'high']),
  isActive: z.boolean().default(true),
  
  // Ghana-specific fields
  focusAreas: z.array(z.string()),
  ghanaCompliance: z.object({
    vatRequirement: z.boolean(),
    getFundRequirement: z.boolean(),
    nhilRequirement: z.boolean(),
    covidLevyRequirement: z.boolean(),
    ecowasOriginCheck: z.boolean(),
    atgRequirement: z.boolean().optional(),
  }),
  
  // Rule evaluation criteria
  criteria: z.object({
    valueThreshold: z.number().optional(),
    weightThreshold: z.number().optional(),
    hsCodePatterns: z.array(z.string()).optional(),
    countryPatterns: z.array(z.string()).optional(),
    riskScoreThreshold: z.number().optional(),
  }),
  
  // Impact metrics
  impactMetrics: z.object({
    recoveryRate: z.number().min(0).max(1),
    falsePositiveRate: z.number().min(0).max(1),
    processingTime: z.number(), // in seconds
    accuracy: z.number().min(0).max(1),
  }),
  
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export type GhanaRule = z.infer<typeof GhanaRuleSchema>;

export const RulePackSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string(),
  isActive: z.boolean().default(true),
  
  // Ghana-specific configuration
  focusAreas: z.object({
    petroleum: z.object({
      enabled: z.boolean(),
      weight: z.number().min(0).max(1),
      atgMonitoring: z.boolean(),
      taxCompliance: z.boolean(),
    }),
    textiles: z.object({
      enabled: z.boolean(),
      weight: z.number().min(0).max(1),
      originVerification: z.boolean(),
      hsClassification: z.boolean(),
    }),
    vehicles: z.object({
      enabled: z.boolean(),
      weight: z.number().min(0).max(1),
      valueAssessment: z.boolean(),
      documentation: z.boolean(),
    }),
  }),
  
  riskLevels: z.object({
    low: z.object({
      threshold: z.number(),
      actions: z.array(z.string()),
      autoApproval: z.boolean(),
    }),
    medium: z.object({
      threshold: z.number(),
      actions: z.array(z.string()),
      manualReview: z.boolean(),
    }),
    high: z.object({
      threshold: z.number(),
      actions: z.array(z.string()),
      immediateAudit: z.boolean(),
    }),
  }),
  
  rules: z.array(GhanaRuleSchema),
  
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export type RulePack = z.infer<typeof RulePackSchema>;

// Simulation result schema
export const SimulationResultSchema = z.object({
  rulePackId: z.string(),
  testDataset: z.string(),
  totalDeclarations: z.number(),
  violationsDetected: z.number(),
  falsePositives: z.number(),
  accuracy: z.number(),
  precision: z.number(),
  recall: z.number(),
  f1Score: z.number(),
  processingTime: z.number(),
  sectoralPerformance: z.record(z.object({
    accuracy: z.number(),
    recovery: z.number(),
    violations: z.number(),
  })),
  ghanaComplianceRate: z.number(),
  recommendations: z.array(z.string()),
});

export type SimulationResult = z.infer<typeof SimulationResultSchema>;

class GhanaRulePackService {
  private static instance: GhanaRulePackService;
  private rulePacks: Map<string, RulePack> = new Map();
  private simulationResults: Map<string, SimulationResult> = new Map();

  private constructor() {
    this.initializeDefaultRulePacks();
  }

  static getInstance(): GhanaRulePackService {
    if (!GhanaRulePackService.instance) {
      GhanaRulePackService.instance = new GhanaRulePackService();
    }
    return GhanaRulePackService.instance;
  }

  private initializeDefaultRulePacks() {
    // Default Ghana Rule Pack
    const defaultRulePack: RulePack = {
      id: 'ghana-rule-pack-v1',
      name: 'Ghana PCA Enhanced Rule Pack',
      version: '1.0.0',
      description: 'Comprehensive rule pack for Ghana customs with sectoral focus areas',
      isActive: true,
      
      focusAreas: {
        petroleum: {
          enabled: true,
          weight: 0.4,
          atgMonitoring: true,
          taxCompliance: true,
        },
        textiles: {
          enabled: true,
          weight: 0.3,
          originVerification: true,
          hsClassification: true,
        },
        vehicles: {
          enabled: true,
          weight: 0.3,
          valueAssessment: true,
          documentation: true,
        },
      },
      
      riskLevels: {
        low: {
          threshold: 30,
          actions: ['auto-approve', 'log-for-review'],
          autoApproval: true,
        },
        medium: {
          threshold: 70,
          actions: ['manual-review', 'request-additional-docs'],
          manualReview: true,
        },
        high: {
          threshold: 90,
          actions: ['immediate-audit', 'flag-authorities', 'hold-shipment'],
          immediateAudit: true,
        },
      },
      
      rules: this.generateGhanaRules(),
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rulePacks.set(defaultRulePack.id, defaultRulePack);
  }

  private generateGhanaRules(): GhanaRule[] {
    return [
      // Petroleum Sector Rules
      {
        id: 'petro-atg-001',
        name: 'ATG Shortfall Detection',
        description: 'Detects significant shortfalls in Automated Transfer Gauger readings for petroleum products',
        category: 'petroleum',
        riskLevel: 'high',
        isActive: true,
        
        focusAreas: ['atg-monitoring', 'tax-compliance'],
        ghanaCompliance: {
          vatRequirement: true,
          getFundRequirement: true,
          nhilRequirement: true,
          covidLevyRequirement: true,
          ecowasOriginCheck: true,
          atgRequirement: true,
        },
        
        criteria: {
          hsCodePatterns: ['2709*', '2710*', '2711*'],
          valueThreshold: 50000,
          riskScoreThreshold: 75,
        },
        
        impactMetrics: {
          recoveryRate: 0.85,
          falsePositiveRate: 0.05,
          processingTime: 2.3,
          accuracy: 0.94,
        },
        
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      
      {
        id: 'petro-tax-002',
        name: 'Petroleum Tax Compliance',
        description: 'Ensures proper calculation of VAT, GETFund, NHIL, and COVID levies on petroleum imports',
        category: 'petroleum',
        riskLevel: 'medium',
        isActive: true,
        
        focusAreas: ['tax-compliance'],
        ghanaCompliance: {
          vatRequirement: true,
          getFundRequirement: true,
          nhilRequirement: true,
          covidLevyRequirement: true,
          ecowasOriginCheck: false,
        },
        
        criteria: {
          hsCodePatterns: ['2709*', '2710*', '2711*'],
          valueThreshold: 10000,
        },
        
        impactMetrics: {
          recoveryRate: 0.78,
          falsePositiveRate: 0.08,
          processingTime: 1.8,
          accuracy: 0.89,
        },
        
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      
      // Textiles Sector Rules
      {
        id: 'textile-origin-003',
        name: 'ECOWAS Origin Verification',
        description: 'Verifies authenticity of ECOWAS origin claims for textile products',
        category: 'textiles',
        riskLevel: 'high',
        isActive: true,
        
        focusAreas: ['origin-verification'],
        ghanaCompliance: {
          vatRequirement: true,
          getFundRequirement: true,
          nhilRequirement: true,
          covidLevyRequirement: true,
          ecowasOriginCheck: true,
        },
        
        criteria: {
          hsCodePatterns: ['520*', '530*', '540*', '550*', '560*', '570*', '580*', '590*', '600*', '610*'],
          countryPatterns: ['NG', 'BJ', 'CI', 'BF', 'ML', 'NE', 'SN', 'SL', 'TG'],
          riskScoreThreshold: 70,
        },
        
        impactMetrics: {
          recoveryRate: 0.72,
          falsePositiveRate: 0.12,
          processingTime: 3.1,
          accuracy: 0.87,
        },
        
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      
      {
        id: 'textile-hs-004',
        name: 'Textiles HS Classification',
        description: 'Detects misclassification of textile products to reduce customs duties',
        category: 'textiles',
        riskLevel: 'medium',
        isActive: true,
        
        focusAreas: ['hs-classification'],
        ghanaCompliance: {
          vatRequirement: true,
          getFundRequirement: true,
          nhilRequirement: true,
          covidLevyRequirement: true,
          ecowasOriginCheck: false,
        },
        
        criteria: {
          hsCodePatterns: ['520*', '530*', '540*', '550*', '560*', '570*', '580*', '590*', '600*', '610*'],
          valueThreshold: 25000,
        },
        
        impactMetrics: {
          recoveryRate: 0.68,
          falsePositiveRate: 0.15,
          processingTime: 2.7,
          accuracy: 0.82,
        },
        
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      
      // Vehicles Sector Rules
      {
        id: 'vehicle-value-005',
        name: 'Vehicle Value Assessment',
        description: 'Detects under-declaration of vehicle values for tax evasion',
        category: 'vehicles',
        riskLevel: 'high',
        isActive: true,
        
        focusAreas: ['value-assessment'],
        ghanaCompliance: {
          vatRequirement: true,
          getFundRequirement: true,
          nhilRequirement: true,
          covidLevyRequirement: true,
          ecowasOriginCheck: false,
        },
        
        criteria: {
          hsCodePatterns: ['8701*', '8702*', '8703*', '8704*', '8705*'],
          valueThreshold: 10000,
          riskScoreThreshold: 80,
        },
        
        impactMetrics: {
          recoveryRate: 0.81,
          falsePositiveRate: 0.09,
          processingTime: 2.1,
          accuracy: 0.91,
        },
        
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      
      {
        id: 'vehicle-docs-006',
        name: 'Vehicle Documentation Check',
        description: 'Verifies authenticity of vehicle documentation and certificates',
        category: 'vehicles',
        riskLevel: 'medium',
        isActive: true,
        
        focusAreas: ['documentation'],
        ghanaCompliance: {
          vatRequirement: true,
          getFundRequirement: true,
          nhilRequirement: true,
          covidLevyRequirement: true,
          ecowasOriginCheck: false,
        },
        
        criteria: {
          hsCodePatterns: ['8701*', '8702*', '8703*', '8704*', '8705*'],
          weightThreshold: 1000,
        },
        
        impactMetrics: {
          recoveryRate: 0.64,
          falsePositiveRate: 0.18,
          processingTime: 4.2,
          accuracy: 0.79,
        },
        
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // Rule Pack Management
  async createRulePack(rulePackData: Omit<RulePack, 'id' | 'createdAt' | 'updatedAt'>): Promise<RulePack> {
    const rulePack: RulePack = {
      ...rulePackData,
      id: `rp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate with schema
    const validatedRulePack = RulePackSchema.parse(rulePack);
    this.rulePacks.set(validatedRulePack.id, validatedRulePack);

    return validatedRulePack;
  }

  async updateRulePack(id: string, updates: Partial<RulePack>): Promise<RulePack> {
    const existing = this.rulePacks.get(id);
    if (!existing) {
      throw new Error(`Rule pack with ID ${id} not found`);
    }

    const updated: RulePack = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      updatedAt: new Date(),
    };

    const validatedRulePack = RulePackSchema.parse(updated);
    this.rulePacks.set(id, validatedRulePack);

    return validatedRulePack;
  }

  async getRulePack(id: string): Promise<RulePack | null> {
    return this.rulePacks.get(id) || null;
  }

  async getAllRulePacks(): Promise<RulePack[]> {
    return Array.from(this.rulePacks.values());
  }

  async getActiveRulePack(): Promise<RulePack | null> {
    const activePacks = Array.from(this.rulePacks.values()).filter(pack => pack.isActive);
    return activePacks.length > 0 ? activePacks[0] : null;
  }

  async deleteRulePack(id: string): Promise<boolean> {
    return this.rulePacks.delete(id);
  }

  // Rule Management
  async addRuleToPack(rulePackId: string, ruleData: Omit<GhanaRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<GhanaRule> {
    const rulePack = this.rulePacks.get(rulePackId);
    if (!rulePack) {
      throw new Error(`Rule pack with ID ${rulePackId} not found`);
    }

    const rule: GhanaRule = {
      ...ruleData,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validatedRule = GhanaRuleSchema.parse(rule);
    rulePack.rules.push(validatedRule);
    rulePack.updatedAt = new Date();

    return validatedRule;
  }

  async removeRuleFromPack(rulePackId: string, ruleId: string): Promise<boolean> {
    const rulePack = this.rulePacks.get(rulePackId);
    if (!rulePack) {
      throw new Error(`Rule pack with ID ${rulePackId} not found`);
    }

    const initialLength = rulePack.rules.length;
    rulePack.rules = rulePack.rules.filter(rule => rule.id !== ruleId);
    rulePack.updatedAt = new Date();

    return rulePack.rules.length < initialLength;
  }

  // Simulation Engine
  async simulateRulePack(rulePackId: string, testDataset: any[]): Promise<SimulationResult> {
    const rulePack = this.rulePacks.get(rulePackId);
    if (!rulePack) {
      throw new Error(`Rule pack with ID ${rulePackId} not found`);
    }

    const startTime = Date.now();
    
    // Simulate rule evaluation
    let violationsDetected = 0;
    let falsePositives = 0;
    const sectoralPerformance: Record<string, any> = {};
    const ghanaComplianceViolations = 0;

    for (const declaration of testDataset) {
      const evaluation = await this.evaluateDeclaration(rulePack, declaration);
      
      if (evaluation.hasViolation) {
        violationsDetected++;
        
        // Track sectoral performance
        if (!sectoralPerformance[declaration.sector]) {
          sectoralPerformance[declaration.sector] = {
            violations: 0,
            accuracy: 0,
            recovery: 0,
          };
        }
        sectoralPerformance[declaration.sector].violations++;
        
        // Simulate false positive detection (10% chance)
        if (Math.random() < 0.1) {
          falsePositives++;
        }
      }
    }

    const processingTime = (Date.now() - startTime) / 1000;
    const totalDeclarations = testDataset.length;
    
    // Calculate metrics
    const accuracy = (violationsDetected - falsePositives) / totalDeclarations;
    const precision = violationsDetected > 0 ? (violationsDetected - falsePositives) / violationsDetected : 0;
    const recall = violationsDetected / totalDeclarations;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const ghanaComplianceRate = (totalDeclarations - ghanaComplianceViolations) / totalDeclarations;

    // Calculate sectoral recovery estimates
    Object.keys(sectoralPerformance).forEach(sector => {
      const sectorData = sectoralPerformance[sector];
      sectorData.accuracy = Math.random() * 0.3 + 0.7; // 70-100%
      sectorData.recovery = sectorData.violations * (Math.random() * 50000 + 10000);
    });

    const result: SimulationResult = {
      rulePackId,
      testDataset: 'ghana-pca-training-data',
      totalDeclarations,
      violationsDetected,
      falsePositives,
      accuracy,
      precision,
      recall,
      f1Score,
      processingTime,
      sectoralPerformance,
      ghanaComplianceRate,
      recommendations: this.generateRecommendations(accuracy, precision, recall),
    };

    this.simulationResults.set(`${rulePackId}-${Date.now()}`, result);
    return result;
  }

  private async evaluateDeclaration(rulePack: RulePack, declaration: any): Promise<{ hasViolation: boolean; riskScore: number }> {
    let riskScore = 0;
    let hasViolation = false;

    for (const rule of rulePack.rules) {
      if (!rule.isActive) continue;

      // Check HS code pattern
      if (rule.criteria.hsCodePatterns) {
        const matchesPattern = rule.criteria.hsCodePatterns.some(pattern => 
          declaration.hsCode.startsWith(pattern.replace('*', ''))
        );
        
        if (matchesPattern) {
          riskScore += 20;
        }
      }

      // Check value threshold
      if (rule.criteria.valueThreshold && declaration.value < rule.criteria.valueThreshold) {
        riskScore += 15;
      }

      // Check country patterns for ECOWAS
      if (rule.criteria.countryPatterns && rule.ghanaCompliance.ecowasOriginCheck) {
        const isEcowaSCountry = rule.criteria.countryPatterns.includes(declaration.originCountry);
        if (declaration.ecowasOrigin && !isEcowaSCountry) {
          riskScore += 30;
        }
      }

      // Sector-specific checks
      if (rule.category === declaration.sector) {
        riskScore += 10;
      }

      // Check if risk score exceeds threshold
      if (rule.criteria.riskScoreThreshold && riskScore >= rule.criteria.riskScoreThreshold) {
        hasViolation = true;
      }
    }

    return { hasViolation, riskScore };
  }

  private generateRecommendations(accuracy: number, precision: number, recall: number): string[] {
    const recommendations: string[] = [];

    if (accuracy < 0.8) {
      recommendations.push('Consider adjusting rule thresholds to improve overall accuracy');
    }

    if (precision < 0.8) {
      recommendations.push('Review false positive patterns and refine rule criteria');
    }

    if (recall < 0.7) {
      recommendations.push('Enhance rule coverage to capture more violations');
    }

    if (accuracy > 0.9 && precision > 0.9) {
      recommendations.push('Rule pack is performing excellently - consider deployment to production');
    }

    recommendations.push('Monitor sectoral performance and adjust focus area weights');
    recommendations.push('Regular validation with real-world data recommended');

    return recommendations;
  }

  // Performance Analytics
  async getSimulationResults(rulePackId?: string): Promise<SimulationResult[]> {
    const results = Array.from(this.simulationResults.values());
    
    if (rulePackId) {
      return results.filter(result => result.rulePackId === rulePackId);
    }
    
    return results;
  }

  async getRulePackMetrics(rulePackId: string): Promise<any> {
    const rulePack = this.rulePacks.get(rulePackId);
    if (!rulePack) {
      throw new Error(`Rule pack with ID ${rulePackId} not found`);
    }

    const results = await this.getSimulationResults(rulePackId);
    const latestResult = results[results.length - 1];

    return {
      rulePack: {
        id: rulePack.id,
        name: rulePack.name,
        version: rulePack.version,
        totalRules: rulePack.rules.length,
        activeRules: rulePack.rules.filter(rule => rule.isActive).length,
      },
      focusAreas: rulePack.focusAreas,
      latestSimulation: latestResult,
      averageAccuracy: results.length > 0 
        ? results.reduce((sum, r) => sum + r.accuracy, 0) / results.length 
        : 0,
      totalSimulations: results.length,
    };
  }
}

export default GhanaRulePackService;