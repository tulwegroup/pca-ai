#!/usr/bin/env node

/**
 * Evidence Validation CLI Tool
 * 
 * Automated compliance checking tool for Ghana customs evidence:
 * - Batch evidence validation
 * - Ghana compliance verification
 * - TIN format validation
 * - Tax rate verification
 * - Port of entry validation
 * - Sector-specific requirements
 * - Detailed reporting
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// Import validation service (adapted for CLI)
const GhanaEvidenceValidationService = require('../src/lib/services/ghana-evidence-validation-service');

class EvidenceValidationCLI {
  constructor() {
    this.validationService = new GhanaEvidenceValidationService();
  }

  async validateSingleDocument(filePath, documentType, declarationData = null) {
    try {
      console.log(`🔍 Validating document: ${filePath}`);
      
      // Read document
      const document = await this.readDocument(filePath, documentType);
      
      // Validate
      const result = await this.validationService.validateDocument(document, declarationData);
      
      // Display results
      this.displayValidationResult(result);
      
      return result;
    } catch (error) {
      console.error(`❌ Error validating document: ${error.message}`);
      process.exit(1);
    }
  }

  async validateBatch(configPath) {
    try {
      console.log(`📁 Starting batch validation with config: ${configPath}`);
      
      // Load configuration
      const config = this.loadConfig(configPath);
      
      const results = [];
      
      for (const item of config.documents) {
        console.log(`\n🔍 Processing: ${item.name}`);
        
        try {
          const document = await this.readDocument(item.path, item.type);
          const result = await this.validationService.validateDocument(document, item.declarationData);
          
          results.push({
            document: item.name,
            path: item.path,
            result: result
          });
          
          this.displayValidationResult(result, item.name);
          
        } catch (error) {
          console.error(`❌ Error processing ${item.name}: ${error.message}`);
          results.push({
            document: item.name,
            path: item.path,
            error: error.message
          });
        }
      }
      
      // Generate summary report
      this.generateBatchReport(results, config.outputPath);
      
    } catch (error) {
      console.error(`❌ Batch validation failed: ${error.message}`);
      process.exit(1);
    }
  }

  async validateDirectory(dirPath, documentType = null, recursive = false) {
    try {
      console.log(`📂 Scanning directory: ${dirPath}`);
      
      const files = this.scanDirectory(dirPath, documentType, recursive);
      console.log(`📄 Found ${files.length} files to validate`);
      
      const results = [];
      
      for (const file of files) {
        console.log(`\n🔍 Validating: ${file.name}`);
        
        try {
          const document = await this.readDocument(file.path, file.type);
          const result = await this.validationService.validateDocument(document);
          
          results.push({
            document: file.name,
            path: file.path,
            type: file.type,
            result: result
          });
          
          this.displayValidationResult(result, file.name);
          
        } catch (error) {
          console.error(`❌ Error validating ${file.name}: ${error.message}`);
          results.push({
            document: file.name,
            path: file.path,
            type: file.type,
            error: error.message
          });
        }
      }
      
      // Generate directory report
      const reportPath = path.join(dirPath, 'validation-report.json');
      this.generateBatchReport(results, reportPath);
      
    } catch (error) {
      console.error(`❌ Directory validation failed: ${error.message}`);
      process.exit(1);
    }
  }

  async readDocument(filePath, documentType) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();
    
    // Determine document type if not provided
    if (!documentType) {
      documentType = this.inferDocumentType(fileName, fileExtension);
    }

    // Extract text content (simulated OCR for PDFs/images)
    const content = await this.extractContent(filePath, fileExtension);
    
    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: documentType,
      name: fileName,
      path: filePath,
      size: stats.size,
      format: fileExtension.replace('.', ''),
      uploadedAt: new Date(),
      extractedData: content
    };
  }

  inferDocumentType(fileName, fileExtension) {
    const name = fileName.toLowerCase();
    
    if (name.includes('invoice') || name.includes('commercial')) {
      return 'commercial-invoice';
    } else if (name.includes('origin') || name.includes('certificate')) {
      return 'certificate-of-origin';
    } else if (name.includes('bill') || name.includes('lading') || name.includes('bl')) {
      return 'bill-of-lading';
    } else if (name.includes('packing') || name.includes('pack')) {
      return 'packing-list';
    } else if (name.includes('insurance')) {
      return 'insurance-certificate';
    } else if (name.includes('permit') || name.includes('import')) {
      return 'import-permit';
    } else if (name.includes('tax') || name.includes('clearance')) {
      return 'tax-clearance';
    } else if (name.includes('atg')) {
      return 'atg-certificate';
    } else if (name.includes('paa') || name.includes('assessment')) {
      return 'pre-arrival-assessment';
    } else if (name.includes('declaration') || name.includes('customs')) {
      return 'customs-declaration';
    } else if (name.includes('delivery') || name.includes('dn')) {
      return 'delivery-note';
    } else if (name.includes('quality') || name.includes('certificate')) {
      return 'quality-certificate';
    }
    
    return 'other';
  }

  async extractContent(filePath, fileExtension) {
    // Simulated content extraction
    // In real implementation, this would use OCR for PDFs/images
    const mockData = {
      'commercial-invoice': {
        declarantTin: 'TIN1234567',
        value: 100000,
        taxes: {
          vat: 15000,
          getFund: 2500,
          nhil: 2500,
          covid: 1000,
        },
        invoiceNumber: 'INV-2024-001',
        date: new Date().toISOString(),
      },
      'certificate-of-origin': {
        originCountry: 'NG',
        certificateNumber: 'ECO-2024-001',
        issuingAuthority: 'Ministry of Trade and Industry',
        ecowasProtocol: 'ECOWAS Trade Protocol',
        date: new Date().toISOString(),
      },
      'bill-of-lading': {
        portOfDischarge: 'TEMA',
        vesselName: 'MV Ghana Trader',
        grossWeight: 5000,
        billNumber: 'BL-2024-001',
        date: new Date().toISOString(),
      },
      'tax-clearance': {
        tin: 'TIN1234567',
        clearanceNumber: 'GRA-2024-001',
        issuingAuthority: 'Ghana Revenue Authority',
        date: new Date().toISOString(),
      },
      'atg-certificate': {
        atgNumber: 'ATG-2024-001',
        productType: 'Petroleum Products',
        volume: 5882,
        date: new Date().toISOString(),
      },
    };

    return mockData[this.inferDocumentType(path.basename(filePath), fileExtension)] || {
      documentNumber: `DOC-${Date.now()}`,
      issueDate: new Date().toISOString(),
      extractedText: 'Sample extracted text content',
    };
  }

  scanDirectory(dirPath, documentType, recursive) {
    const files = [];
    const extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];
    
    const scan = (currentPath) => {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory() && recursive) {
          scan(itemPath);
        } else if (stats.isFile()) {
          const ext = path.extname(item).toLowerCase();
          
          if (extensions.includes(ext)) {
            const inferredType = this.inferDocumentType(item, ext);
            
            if (!documentType || inferredType === documentType) {
              files.push({
                name: item,
                path: itemPath,
                type: inferredType
              });
            }
          }
        }
      }
    };
    
    scan(dirPath);
    return files;
  }

  loadConfig(configPath) {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }
    
    try {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      throw new Error(`Invalid configuration file: ${error.message}`);
    }
  }

  displayValidationResult(result, documentName = '') {
    if (documentName) {
      console.log(`\n📋 ${documentName}`);
    }
    
    // Overall status
    const status = result.isValid ? '✅ VALID' : '❌ INVALID';
    const score = result.validationScore.toFixed(1);
    const risk = result.riskLevel.toUpperCase();
    
    console.log(`   Status: ${status} (Score: ${score}/100, Risk: ${risk})`);
    console.log(`   Processing Time: ${result.processingTime}ms`);
    
    // Ghana compliance
    console.log(`\n   🇬🇭 Ghana Compliance:`);
    console.log(`     TIN Valid: ${result.ghanaCompliance.tinValid ? '✅' : '❌'}`);
    console.log(`     Port Valid: ${result.ghanaCompliance.portValid ? '✅' : '❌'}`);
    console.log(`     Tax Rates Valid: ${result.ghanaCompliance.taxRatesValid ? '✅' : '❌'}`);
    console.log(`     ECOWAS Compliance: ${result.ghanaCompliance.ecowasCompliance ? '✅' : '❌'}`);
    console.log(`     Sector Requirements: ${result.ghanaCompliance.sectorRequirements ? '✅' : '❌'}`);
    
    // Issues
    if (result.issues.length > 0) {
      console.log(`\n   ⚠️  Issues (${result.issues.length}):`);
      result.issues.forEach((issue, index) => {
        const icon = issue.severity === 'critical' ? '🚨' : 
                    issue.severity === 'high' ? '❗' : 
                    issue.severity === 'medium' ? '⚠️' : 'ℹ️';
        console.log(`     ${index + 1}. ${icon} ${issue.type}: ${issue.message}`);
        if (issue.field) {
          console.log(`        Field: ${issue.field}`);
        }
      });
    }
    
    // Recommendations
    if (result.recommendations.length > 0) {
      console.log(`\n   💡 Recommendations:`);
      result.recommendations.forEach((rec, index) => {
        console.log(`     ${index + 1}. ${rec}`);
      });
    }
  }

  generateBatchReport(results, outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDocuments: results.length,
        validDocuments: results.filter(r => r.result && r.result.isValid).length,
        invalidDocuments: results.filter(r => r.result && !r.result.isValid).length,
        errors: results.filter(r => r.error).length,
        averageScore: results
          .filter(r => r.result)
          .reduce((sum, r) => sum + r.result.validationScore, 0) / 
          results.filter(r => r.result).length || 0
      },
      ghanaCompliance: {
        tinValid: results.filter(r => r.result && r.result.ghanaCompliance.tinValid).length,
        portValid: results.filter(r => r.result && r.result.ghanaCompliance.portValid).length,
        taxRatesValid: results.filter(r => r.result && r.result.ghanaCompliance.taxRatesValid).length,
        ecowasCompliance: results.filter(r => r.result && r.result.ghanaCompliance.ecowasCompliance).length,
        sectorRequirements: results.filter(r => r.result && r.result.ghanaCompliance.sectorRequirements).length,
      },
      riskDistribution: {
        low: results.filter(r => r.result && r.result.riskLevel === 'low').length,
        medium: results.filter(r => r.result && r.result.riskLevel === 'medium').length,
        high: results.filter(r => r.result && r.result.riskLevel === 'high').length,
        critical: results.filter(r => r.result && r.result.riskLevel === 'critical').length,
      },
      details: results
    };
    
    // Write report
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    // Display summary
    console.log(`\n📊 Validation Summary:`);
    console.log(`   Total Documents: ${report.summary.totalDocuments}`);
    console.log(`   Valid: ${report.summary.validDocuments} ✅`);
    console.log(`   Invalid: ${report.summary.invalidDocuments} ❌`);
    console.log(`   Errors: ${report.summary.errors} ⚠️`);
    console.log(`   Average Score: ${report.summary.averageScore.toFixed(1)}/100`);
    console.log(`   Report saved to: ${outputPath}`);
  }
}

// CLI Setup
const cli = new EvidenceValidationCLI();

program
  .name('evidence-validator')
  .description('Ghana Customs Evidence Validation CLI Tool')
  .version('1.0.0');

program
  .command('validate')
  .description('Validate a single document')
  .argument('<file>', 'Document file path')
  .option('-t, --type <type>', 'Document type (auto-detected if not provided)')
  .option('-d, --declaration <file>', 'Declaration data file (JSON)')
  .action(async (file, options) => {
    let declarationData = null;
    
    if (options.declaration) {
      declarationData = JSON.parse(fs.readFileSync(options.declaration, 'utf8'));
    }
    
    await cli.validateSingleDocument(file, options.type, declarationData);
  });

program
  .command('batch')
  .description('Validate multiple documents using configuration file')
  .argument('<config>', 'Configuration file path')
  .action(async (config) => {
    await cli.validateBatch(config);
  });

program
  .command('directory')
  .description('Validate all documents in a directory')
  .argument('<directory>', 'Directory path')
  .option('-t, --type <type>', 'Filter by document type')
  .option('-r, --recursive', 'Scan subdirectories recursively')
  .action(async (directory, options) => {
    await cli.validateDirectory(directory, options.type, options.recursive);
  });

program
  .command('config')
  .description('Generate sample configuration file')
  .argument('<output>', 'Output file path')
  .action((output) => {
    const sampleConfig = {
      documents: [
        {
          name: "Commercial Invoice",
          path: "./documents/invoice.pdf",
          type: "commercial-invoice",
          declarationData: {
            value: 100000,
            ecowasOrigin: true,
            originCountry: "NG"
          }
        },
        {
          name: "Certificate of Origin",
          path: "./documents/origin.pdf",
          type: "certificate-of-origin",
          declarationData: {
            ecowasOrigin: true,
            originCountry: "NG"
          }
        }
      ],
      outputPath: "./validation-report.json"
    };
    
    fs.writeFileSync(output, JSON.stringify(sampleConfig, null, 2));
    console.log(`✅ Sample configuration saved to: ${output}`);
  });

// Parse command line arguments
program.parse();

// Export for testing
module.exports = EvidenceValidationCLI;