/**
 * Enhanced Ghana Evidence Validation Service
 * 
 * Provides comprehensive evidence validation with Ghana-specific compliance checking:
 * - Tax rate verification (VAT, GETFund, NHIL, COVID)
 * - Port of entry validation for Ghana ports
 * - TIN format validation (TIN + 7-10 digits)
 * - Sector-specific evidence requirements
 * - Risk level assessment with compliance scoring
 * - Automated recommendation generation
 */

import { z } from 'zod';

// Ghana ports configuration
const GHANA_PORTS = {
  'TEMA': { name: 'Tema Port', type: 'sea', region: 'Greater Accra' },
  'TAKORADI': { name: 'Takoradi Port', type: 'sea', region: 'Western Region' },
  'KOTOKA': { name: 'Kotoka International Airport', type: 'air', region: 'Greater Accra' },
  'KUMASI': { name: 'Kumasi Airport', type: 'air', region: 'Ashanti Region' },
  'TAMALE': { name: 'Tamale Airport', type: 'air', region: 'Northern Region' },
};

// Ghana tax rates
const GHANA_TAX_RATES = {
  VAT: 15.0,
  GETFUND: 2.5,
  NHIL: 2.5,
  COVID_LEVY: 1.0,
  IMPORT_DUTY_ECOWAS: 0.0,
  IMPORT_DUTY_NON_ECOWAS: 5.0,
};

// Evidence validation schemas
export const EvidenceDocumentSchema = z.object({
  id: z.string(),
  type: z.enum([
    'commercial-invoice',
    'bill-of-lading',
    'certificate-of-origin',
    'packing-list',
    'insurance-certificate',
    'import-permit',
    'tax-clearance',
    'atg-certificate',
    'pre-arrival-assessment',
    'customs-declaration',
    'delivery-note',
    'quality-certificate',
  ]),
  name: z.string(),
  path: z.string(),
  size: z.number(), // in bytes
  format: z.string(), // pdf, jpg, png, etc.
  uploadedAt: z.date(),
  extractedData: z.record(z.any()).optional(),
});

export type EvidenceDocument = z.infer<typeof EvidenceDocumentSchema>;

export const ValidationResultSchema = z.object({
  documentId: z.string(),
  isValid: z.boolean(),
  validationScore: z.number().min(0).max(100),
  issues: z.array(z.object({
    type: z.enum(['error', 'warning', 'info']),
    message: z.string(),
    field: z.string().optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
  })),
  ghanaCompliance: z.object({
    tinValid: z.boolean(),
    portValid: z.boolean(),
    taxRatesValid: z.boolean(),
    ecowasCompliance: z.boolean(),
    sectorRequirements: z.boolean(),
  }),
  recommendations: z.array(z.string()),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  processingTime: z.number(), // in milliseconds
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

export const EvidencePackageSchema = z.object({
  id: z.string(),
  declarationId: z.string(),
  documents: z.array(EvidenceDocumentSchema),
  validationResults: z.array(ValidationResultSchema),
  overallScore: z.number().min(0).max(100),
  overallCompliance: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EvidencePackage = z.infer<typeof EvidencePackageSchema>;

class GhanaEvidenceValidationService {
  private static instance: GhanaEvidenceValidationService;
  private evidencePackages: Map<string, EvidencePackage> = new Map();

  private constructor() {}

  static getInstance(): GhanaEvidenceValidationService {
    if (!GhanaEvidenceValidationService.instance) {
      GhanaEvidenceValidationService.instance = new GhanaEvidenceValidationService();
    }
    return GhanaEvidenceValidationService.instance;
  }

  // Main validation method
  async validateEvidencePackage(
    declarationId: string,
    documents: EvidenceDocument[],
    declarationData?: any
  ): Promise<EvidencePackage> {
    const startTime = Date.now();
    
    const validationResults: ValidationResult[] = [];
    let totalScore = 0;
    let allCompliant = true;

    for (const document of documents) {
      const result = await this.validateDocument(document, declarationData);
      validationResults.push(result);
      totalScore += result.validationScore;
      
      if (!result.isValid || result.riskLevel === 'critical') {
        allCompliant = false;
      }
    }

    const overallScore = documents.length > 0 ? totalScore / documents.length : 0;
    const processingTime = Date.now() - startTime;

    const evidencePackage: EvidencePackage = {
      id: `ep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      declarationId,
      documents,
      validationResults,
      overallScore,
      overallCompliance: allCompliant && overallScore >= 70,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.evidencePackages.set(evidencePackage.id, evidencePackage);
    return evidencePackage;
  }

  // Individual document validation
  async validateDocument(
    document: EvidenceDocument,
    declarationData?: any
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const issues: any[] = [];
    const ghanaCompliance = {
      tinValid: true,
      portValid: true,
      taxRatesValid: true,
      ecowasCompliance: true,
      sectorRequirements: true,
    };

    // Extract data from document (simulated OCR/extraction)
    const extractedData = document.extractedData || await this.extractDocumentData(document);

    // Validate based on document type
    switch (document.type) {
      case 'commercial-invoice':
        await this.validateCommercialInvoice(extractedData, issues, ghanaCompliance, declarationData);
        break;
      case 'certificate-of-origin':
        await this.validateCertificateOfOrigin(extractedData, issues, ghanaCompliance, declarationData);
        break;
      case 'bill-of-lading':
        await this.validateBillOfLading(extractedData, issues, ghanaCompliance, declarationData);
        break;
      case 'tax-clearance':
        await this.validateTaxClearance(extractedData, issues, ghanaCompliance, declarationData);
        break;
      case 'atg-certificate':
        await this.validateATGCertificate(extractedData, issues, ghanaCompliance, declarationData);
        break;
      default:
        await this.validateGenericDocument(extractedData, issues, ghanaCompliance, declarationData);
    }

    // Calculate validation score
    const validationScore = this.calculateValidationScore(issues);
    const isValid = validationScore >= 70 && !issues.some(issue => issue.type === 'error');
    const riskLevel = this.determineRiskLevel(issues, validationScore);
    const recommendations = this.generateRecommendations(issues, document.type);

    const processingTime = Date.now() - startTime;

    return {
      documentId: document.id,
      isValid,
      validationScore,
      issues,
      ghanaCompliance,
      recommendations,
      riskLevel,
      processingTime,
    };
  }

  // Document type specific validations
  private async validateCommercialInvoice(
    data: any,
    issues: any[],
    ghanaCompliance: any,
    declarationData?: any
  ) {
    // TIN validation
    if (data.declarantTin) {
      const tinValidation = this.validateTIN(data.declarantTin);
      if (!tinValidation.isValid) {
        issues.push({
          type: 'error',
          message: tinValidation.message,
          field: 'declarantTin',
          severity: 'high',
        });
        ghanaCompliance.tinValid = false;
      }
    } else {
      issues.push({
        type: 'error',
        message: 'Declarant TIN not found on invoice',
        field: 'declarantTin',
        severity: 'high',
      });
      ghanaCompliance.tinValid = false;
    }

    // Tax calculation validation
    if (data.value && data.taxes) {
      const expectedVAT = data.value * (GHANA_TAX_RATES.VAT / 100);
      const expectedGETFund = data.value * (GHANA_TAX_RATES.GETFUND / 100);
      const expectedNHIL = data.value * (GHANA_TAX_RATES.NHIL / 100);
      const expectedCOVID = data.value * (GHANA_TAX_RATES.COVID_LEVY / 100);

      const vatTolerance = expectedVAT * 0.05; // 5% tolerance
      const getFundTolerance = expectedGETFund * 0.05;
      const nhilTolerance = expectedNHIL * 0.05;
      const covidTolerance = expectedCOVID * 0.05;

      if (Math.abs(data.taxes.vat - expectedVAT) > vatTolerance) {
        issues.push({
          type: 'error',
          message: `VAT calculation mismatch. Expected: GHS ${expectedVAT.toFixed(2)}, Found: GHS ${data.taxes.vat}`,
          field: 'taxes.vat',
          severity: 'high',
        });
        ghanaCompliance.taxRatesValid = false;
      }

      if (Math.abs(data.taxes.getFund - expectedGETFund) > getFundTolerance) {
        issues.push({
          type: 'error',
          message: `GETFund levy calculation mismatch. Expected: GHS ${expectedGETFund.toFixed(2)}, Found: GHS ${data.taxes.getFund}`,
          field: 'taxes.getFund',
          severity: 'medium',
        });
        ghanaCompliance.taxRatesValid = false;
      }

      if (Math.abs(data.taxes.nhil - expectedNHIL) > nhilTolerance) {
        issues.push({
          type: 'error',
          message: `NHIL calculation mismatch. Expected: GHS ${expectedNHIL.toFixed(2)}, Found: GHS ${data.taxes.nhil}`,
          field: 'taxes.nhil',
          severity: 'medium',
        });
        ghanaCompliance.taxRatesValid = false;
      }

      if (Math.abs(data.taxes.covid - expectedCOVID) > covidTolerance) {
        issues.push({
          type: 'warning',
          message: `COVID levy calculation mismatch. Expected: GHS ${expectedCOVID.toFixed(2)}, Found: GHS ${data.taxes.covid}`,
          field: 'taxes.covid',
          severity: 'low',
        });
      }
    } else {
      issues.push({
        type: 'warning',
        message: 'Tax breakdown not found on invoice',
        field: 'taxes',
        severity: 'medium',
      });
    }

    // Value validation
    if (data.value && declarationData && declarationData.value) {
      const valueTolerance = declarationData.value * 0.1; // 10% tolerance
      if (Math.abs(data.value - declarationData.value) > valueTolerance) {
        issues.push({
          type: 'error',
          message: `Invoice value mismatch with declaration. Expected: $${declarationData.value}, Found: $${data.value}`,
          field: 'value',
          severity: 'high',
        });
      }
    }
  }

  private async validateCertificateOfOrigin(
    data: any,
    issues: any[],
    ghanaCompliance: any,
    declarationData?: any
  ) {
    // ECOWAS origin validation
    if (data.originCountry && declarationData) {
      const ecowasCountries = ['NG', 'BJ', 'CI', 'BF', 'ML', 'NE', 'SN', 'SL', 'TG'];
      const isEcowaSOrigin = ecowasCountries.includes(data.originCountry);
      
      if (declarationData.ecowasOrigin !== isEcowaSOrigin) {
        issues.push({
          type: 'error',
          message: 'ECOWAS origin claim mismatch between certificate and declaration',
          field: 'originCountry',
          severity: 'critical',
        });
        ghanaCompliance.ecowasCompliance = false;
      }

      if (isEcowaSOrigin) {
        // Validate ECOWAS certificate format
        if (!data.certificateNumber || !data.issuingAuthority) {
          issues.push({
            type: 'error',
            message: 'ECOWAS certificate missing required fields',
            field: 'certificate',
            severity: 'high',
          });
        }

        // Check for ECOWAS specific markings
        if (!data.ecowasProtocol) {
          issues.push({
            type: 'warning',
            message: 'ECOWAS protocol reference not found',
            field: 'ecowasProtocol',
            severity: 'medium',
          });
        }
      }
    }

    // Authority validation
    if (data.issuingAuthority) {
      const validAuthorities = [
        'Ministry of Trade and Industry',
        'Chamber of Commerce',
        'Export Promotion Authority',
      ];
      
      if (!validAuthorities.some(auth => data.issuingAuthority.toLowerCase().includes(auth.toLowerCase()))) {
        issues.push({
          type: 'warning',
          message: 'Unrecognized issuing authority for certificate of origin',
          field: 'issuingAuthority',
          severity: 'medium',
        });
      }
    }
  }

  private async validateBillOfLading(
    data: any,
    issues: any[],
    ghanaCompliance: any,
    declarationData?: any
  ) {
    // Port of entry validation
    if (data.portOfLoading || data.portOfDischarge) {
      const port = data.portOfDischarge || data.portOfLoading;
      const portValidation = this.validateGhanaPort(port);
      
      if (!portValidation.isValid) {
        issues.push({
          type: 'error',
          message: portValidation.message,
          field: 'port',
          severity: 'high',
        });
        ghanaCompliance.portValid = false;
      }
    }

    // Container/vessel validation
    if (!data.vesselName && !data.flightNumber) {
      issues.push({
        type: 'error',
        message: 'Vessel or flight information missing',
        field: 'transport',
        severity: 'high',
      });
    }

    // Weight validation
    if (data.grossWeight && declarationData && declarationData.weight) {
      const weightTolerance = declarationData.weight * 0.05; // 5% tolerance
      if (Math.abs(data.grossWeight - declarationData.weight) > weightTolerance) {
        issues.push({
          type: 'warning',
          message: `Weight discrepancy. Declaration: ${declarationData.weight}kg, B/L: ${data.grossWeight}kg`,
          field: 'grossWeight',
          severity: 'medium',
        });
      }
    }
  }

  private async validateTaxClearance(
    data: any,
    issues: any[],
    ghanaCompliance: any,
    declarationData?: any
  ) {
    // TIN validation on tax clearance
    if (data.tin) {
      const tinValidation = this.validateTIN(data.tin);
      if (!tinValidation.isValid) {
        issues.push({
          type: 'error',
          message: `Invalid TIN format on tax clearance: ${tinValidation.message}`,
          field: 'tin',
          severity: 'critical',
        });
        ghanaCompliance.tinValid = false;
      }
    }

    // Tax clearance number validation
    if (!data.clearanceNumber) {
      issues.push({
        type: 'error',
        message: 'Tax clearance number missing',
        field: 'clearanceNumber',
        severity: 'high',
      });
    }

    // Authority validation
    if (data.issuingAuthority !== 'Ghana Revenue Authority') {
      issues.push({
        type: 'error',
        message: 'Tax clearance must be issued by Ghana Revenue Authority',
        field: 'issuingAuthority',
        severity: 'critical',
      });
    }
  }

  private async validateATGCertificate(
    data: any,
    issues: any[],
    ghanaCompliance: any,
    declarationData?: any
  ) {
    // ATG specific validations
    if (!data.atgNumber) {
      issues.push({
        type: 'error',
        message: 'ATG certificate number missing',
        field: 'atgNumber',
        severity: 'high',
      });
    }

    if (!data.productType || !data.productType.toLowerCase().includes('petroleum')) {
      issues.push({
        type: 'warning',
        message: 'ATG certificate should be for petroleum products',
        field: 'productType',
        severity: 'medium',
      });
    }

    // Volume validation
    if (data.volume && declarationData && declarationData.weight) {
      // Convert volume to weight (approximate: 1 liter = 0.85 kg for petroleum)
      const expectedWeight = data.volume * 0.85;
      const weightTolerance = expectedWeight * 0.1; // 10% tolerance
      
      if (Math.abs(declarationData.weight - expectedWeight) > weightTolerance) {
        issues.push({
          type: 'warning',
          message: `Weight-volume discrepancy. Expected: ${expectedWeight.toFixed(0)}kg, Found: ${declarationData.weight}kg`,
          field: 'volume',
          severity: 'medium',
        });
      }
    }
  }

  private async validateGenericDocument(
    data: any,
    issues: any[],
    ghanaCompliance: any,
    declarationData?: any
  ) {
    // Basic validation for other document types
    if (!data.documentNumber) {
      issues.push({
        type: 'warning',
        message: 'Document number not found',
        field: 'documentNumber',
        severity: 'low',
      });
    }

    if (!data.issueDate) {
      issues.push({
        type: 'warning',
        message: 'Document issue date not found',
        field: 'issueDate',
        severity: 'low',
      });
    }
  }

  // Helper methods
  private validateTIN(tin: string): { isValid: boolean; message: string } {
    if (!tin) {
      return { isValid: false, message: 'TIN is required' };
    }

    // Ghana TIN format: TIN followed by 7-10 digits
    const tinPattern = /^TIN\d{7,10}$/;
    if (!tinPattern.test(tin)) {
      return { isValid: false, message: 'TIN must be in format: TIN followed by 7-10 digits' };
    }

    return { isValid: true, message: 'Valid TIN format' };
  }

  private validateGhanaPort(port: string): { isValid: boolean; message: string } {
    if (!port) {
      return { isValid: false, message: 'Port information is required' };
    }

    const portCode = port.toUpperCase();
    if (!GHANA_PORTS[portCode as keyof typeof GHANA_PORTS]) {
      return { 
        isValid: false, 
        message: `Invalid Ghana port. Valid ports: ${Object.keys(GHANA_PORTS).join(', ')}` 
      };
    }

    return { isValid: true, message: 'Valid Ghana port' };
  }

  private calculateValidationScore(issues: any[]): number {
    let score = 100;
    
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    return Math.max(0, score);
  }

  private determineRiskLevel(issues: any[], score: number): 'low' | 'medium' | 'high' | 'critical' {
    const hasCritical = issues.some(issue => issue.severity === 'critical');
    const hasHigh = issues.some(issue => issue.severity === 'high');
    
    if (hasCritical || score < 40) return 'critical';
    if (hasHigh || score < 60) return 'high';
    if (score < 80) return 'medium';
    return 'low';
  }

  private generateRecommendations(issues: any[], documentType: string): string[] {
    const recommendations: string[] = [];

    // Document-specific recommendations
    switch (documentType) {
      case 'commercial-invoice':
        recommendations.push('Ensure all Ghana taxes (VAT, GETFund, NHIL, COVID) are correctly calculated');
        recommendations.push('Verify declarant TIN format: TIN followed by 7-10 digits');
        break;
      case 'certificate-of-origin':
        recommendations.push('For ECOWAS origin, ensure proper ECOWAS protocol compliance');
        recommendations.push('Verify issuing authority is recognized');
        break;
      case 'bill-of-lading':
        recommendations.push('Confirm port of entry is a valid Ghana port');
        recommendations.push('Ensure vessel/flight information is complete');
        break;
      case 'tax-clearance':
        recommendations.push('Tax clearance must be issued by Ghana Revenue Authority');
        recommendations.push('Verify TIN matches across all documents');
        break;
      case 'atg-certificate':
        recommendations.push('ATG certificate required for petroleum products');
        recommendations.push('Verify volume-weight calculations');
        break;
    }

    // General recommendations based on issues
    if (issues.some(issue => issue.type === 'error')) {
      recommendations.push('Address all error-level issues before submission');
    }

    if (issues.some(issue => issue.severity === 'critical')) {
      recommendations.push('Critical issues found - immediate attention required');
    }

    recommendations.push('Consider digital verification for faster processing');
    recommendations.push('Maintain consistent information across all documents');

    return recommendations;
  }

  private async extractDocumentData(document: EvidenceDocument): Promise<any> {
    // Simulated OCR/extraction - in real implementation, this would use
    // OCR services, AI extraction, or document parsing
    
    const mockData: Record<string, any> = {
      'commercial-invoice': {
        declarantTin: 'TIN1234567',
        value: 100000,
        taxes: {
          vat: 15000,
          getFund: 2500,
          nhil: 2500,
          covid: 1000,
        },
      },
      'certificate-of-origin': {
        originCountry: 'NG',
        certificateNumber: 'ECO-2024-001',
        issuingAuthority: 'Ministry of Trade and Industry',
        ecowasProtocol: 'ECOWAS Trade Protocol',
      },
      'bill-of-lading': {
        portOfDischarge: 'TEMA',
        vesselName: 'MV Ghana Trader',
        grossWeight: 5000,
      },
      'tax-clearance': {
        tin: 'TIN1234567',
        clearanceNumber: 'GRA-2024-001',
        issuingAuthority: 'Ghana Revenue Authority',
      },
      'atg-certificate': {
        atgNumber: 'ATG-2024-001',
        productType: 'Petroleum Products',
        volume: 5882, // liters
      },
    };

    return mockData[document.type] || {
      documentNumber: `DOC-${Date.now()}`,
      issueDate: new Date().toISOString(),
    };
  }

  // Public methods for evidence package management
  async getEvidencePackage(id: string): Promise<EvidencePackage | null> {
    return this.evidencePackages.get(id) || null;
  }

  async getAllEvidencePackages(): Promise<EvidencePackage[]> {
    return Array.from(this.evidencePackages.values());
  }

  async getEvidencePackagesByDeclaration(declarationId: string): Promise<EvidencePackage[]> {
    return Array.from(this.evidencePackages.values()).filter(
      pkg => pkg.declarationId === declarationId
    );
  }

  async deleteEvidencePackage(id: string): Promise<boolean> {
    return this.evidencePackages.delete(id);
  }

  // Analytics and reporting
  async getValidationMetrics(): Promise<any> {
    const packages = Array.from(this.evidencePackages.values());
    const totalPackages = packages.length;
    
    if (totalPackages === 0) {
      return {
        totalPackages: 0,
        averageScore: 0,
        complianceRate: 0,
        riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
        commonIssues: [],
      };
    }

    const totalScore = packages.reduce((sum, pkg) => sum + pkg.overallScore, 0);
    const compliantPackages = packages.filter(pkg => pkg.overallCompliance).length;
    
    // Risk distribution
    const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
    const issueFrequency: Record<string, number> = {};

    for (const pkg of packages) {
      for (const result of pkg.validationResults) {
        riskDistribution[result.riskLevel]++;
        
        for (const issue of result.issues) {
          const key = `${issue.type}-${issue.field || 'general'}`;
          issueFrequency[key] = (issueFrequency[key] || 0) + 1;
        }
      }
    }

    // Common issues
    const commonIssues = Object.entries(issueFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, count]) => ({ issue: key, frequency: count }));

    return {
      totalPackages,
      averageScore: totalScore / totalPackages,
      complianceRate: (compliantPackages / totalPackages) * 100,
      riskDistribution,
      commonIssues,
    };
  }
}

export default GhanaEvidenceValidationService;