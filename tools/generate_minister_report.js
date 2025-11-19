#!/usr/bin/env node

/**
 * Minister Report Generation Tool
 * 
 * Command-line tool for generating Ghana PCA minister reports:
 * - Multiple report types (executive summary, detailed analysis, strategic plan, financial projections)
 * - Multiple export formats (PDF, Excel, Word, PowerPoint)
 * - Sectoral impact analysis
 * - Financial projections and ROI calculations
 * - Strategic recommendations
 * - Custom templates and branding
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// Import report service (adapted for CLI)
const GhanaMinisterReportService = require('../src/lib/services/ghana-minister-report-service');

class MinisterReportCLI {
  constructor() {
    this.reportService = new GhanaMinisterReportService();
  }

  async generateReport(config) {
    try {
      console.log(`📊 Generating ${config.reportType} report for case ${config.caseId}`);
      
      // Validate configuration
      this.validateConfig(config);
      
      // Generate report
      const report = await this.reportService.generateMinisterReport(config);
      
      // Display summary
      this.displayReportSummary(report);
      
      // Export reports
      if (config.exportFormats && config.exportFormats.length > 0) {
        await this.exportReports(report, config.exportFormats, config.outputDir);
      }
      
      // Save report data
      if (config.saveData) {
        this.saveReportData(report, config.outputDir);
      }
      
      return report;
      
    } catch (error) {
      console.error(`❌ Report generation failed: ${error.message}`);
      process.exit(1);
    }
  }

  async generateFromTemplate(templatePath, outputPath, data = {}) {
    try {
      console.log(`📝 Generating report from template: ${templatePath}`);
      
      // Load template
      const template = this.loadTemplate(templatePath);
      
      // Process template with data
      const report = await this.processTemplate(template, data);
      
      // Export to specified format
      const format = path.extname(outputPath).toLowerCase().replace('.', '');
      await this.exportSingleReport(report, format, outputPath);
      
      console.log(`✅ Report generated: ${outputPath}`);
      
    } catch (error) {
      console.error(`❌ Template generation failed: ${error.message}`);
      process.exit(1);
    }
  }

  async batchGenerate(configPath) {
    try {
      console.log(`📁 Starting batch report generation with config: ${configPath}`);
      
      // Load batch configuration
      const batchConfig = this.loadBatchConfig(configPath);
      
      const results = [];
      
      for (const reportConfig of batchConfig.reports) {
        console.log(`\n📊 Generating: ${reportConfig.name}`);
        
        try {
          const report = await this.generateReport(reportConfig);
          
          results.push({
            name: reportConfig.name,
            config: reportConfig,
            report: report,
            status: 'success'
          });
          
          console.log(`✅ Completed: ${reportConfig.name}`);
          
        } catch (error) {
          console.error(`❌ Failed: ${reportConfig.name} - ${error.message}`);
          results.push({
            name: reportConfig.name,
            config: reportConfig,
            error: error.message,
            status: 'failed'
          });
        }
      }
      
      // Generate batch summary
      this.generateBatchSummary(results, batchConfig.outputDir);
      
    } catch (error) {
      console.error(`❌ Batch generation failed: ${error.message}`);
      process.exit(1);
    }
  }

  validateConfig(config) {
    const required = ['caseId', 'reportType', 'period'];
    
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    const validTypes = ['executive-summary', 'detailed-analysis', 'strategic-plan', 'financial-projections'];
    if (!validTypes.includes(config.reportType)) {
      throw new Error(`Invalid report type. Valid types: ${validTypes.join(', ')}`);
    }
    
    if (!config.period.start || !config.period.end) {
      throw new Error('Period must include both start and end dates');
    }
  }

  displayReportSummary(report) {
    console.log(`\n📊 Report Summary:`);
    console.log(`   ID: ${report.id}`);
    console.log(`   Type: ${report.reportType.replace('-', ' ').toUpperCase()}`);
    console.log(`   Case: ${report.caseId}`);
    console.log(`   Period: ${report.period.start} to ${report.period.end}`);
    console.log(`   Generated: ${report.generatedAt.toLocaleString()}`);
    
    // Executive summary highlights
    if (report.executiveSummary) {
      console.log(`\n🎯 Key Findings:`);
      report.executiveSummary.keyFindings.forEach((finding, index) => {
        console.log(`   ${index + 1}. ${finding}`);
      });
      
      console.log(`\n💰 Total Recovery: GHS ${this.formatNumber(report.executiveSummary.totalRecovery)}`);
      console.log(`📈 Compliance Rate: ${report.executiveSummary.complianceRate.toFixed(1)}%`);
      console.log(`⚡ Risk Reduction: ${report.executiveSummary.riskReduction.toFixed(1)}%`);
    }
    
    // Sectoral impact
    if (report.sectoralImpact) {
      console.log(`\n🏭 Sectoral Impact:`);
      Object.entries(report.sectoralImpact).forEach(([sector, data]) => {
        console.log(`   ${sector.charAt(0).toUpperCase() + sector.slice(1)}: GHS ${this.formatNumber(data.recoveryAmount)} (${data.violationsDetected} violations)`);
      });
    }
    
    // Financial projections
    if (report.financialProjections) {
      console.log(`\n💸 Financial Projections:`);
      console.log(`   Current Recovery: GHS ${this.formatNumber(report.financialProjections.currentRecovery)}`);
      console.log(`   3-Year Projection: GHS ${this.formatNumber(report.financialProjections.threeYearProjection)}`);
      console.log(`   ROI: ${report.financialProjections.roi.toFixed(1)}%`);
      console.log(`   Break-Even: ${report.financialProjections.breakEvenPoint}`);
    }
  }

  async exportReports(report, formats, outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    for (const format of formats) {
      const fileName = `${report.caseId}_${report.reportType}_${Date.now()}.${format}`;
      const outputPath = path.join(outputDir, fileName);
      
      try {
        await this.exportSingleReport(report, format, outputPath);
        console.log(`📄 Exported ${format.toUpperCase()}: ${outputPath}`);
      } catch (error) {
        console.error(`❌ Failed to export ${format}: ${error.message}`);
      }
    }
  }

  async exportSingleReport(report, format, outputPath) {
    switch (format) {
      case 'pdf':
        await this.exportToPDF(report, outputPath);
        break;
      case 'excel':
        await this.exportToExcel(report, outputPath);
        break;
      case 'word':
        await this.exportToWord(report, outputPath);
        break;
      case 'powerpoint':
        await this.exportToPowerPoint(report, outputPath);
        break;
      case 'json':
        await this.exportToJSON(report, outputPath);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async exportToPDF(report, outputPath) {
    // Simulated PDF generation
    const pdfContent = this.generatePDFContent(report);
    fs.writeFileSync(outputPath, pdfContent);
  }

  async exportToExcel(report, outputPath) {
    // Simulated Excel generation
    const excelContent = this.generateExcelContent(report);
    fs.writeFileSync(outputPath, excelContent);
  }

  async exportToWord(report, outputPath) {
    // Simulated Word generation
    const wordContent = this.generateWordContent(report);
    fs.writeFileSync(outputPath, wordContent);
  }

  async exportToPowerPoint(report, outputPath) {
    // Simulated PowerPoint generation
    const pptContent = this.generatePowerPointContent(report);
    fs.writeFileSync(outputPath, pptContent);
  }

  async exportToJSON(report, outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  }

  generatePDFContent(report) {
    // Simulated PDF content (in real implementation, use PDF library)
    return `PDF Content for ${report.reportType} report\n\n${JSON.stringify(report, null, 2)}`;
  }

  generateExcelContent(report) {
    // Simulated Excel content (in real implementation, use Excel library)
    const sheets = [
      'Executive Summary',
      'Sectoral Impact',
      'Financial Projections',
      'Recommendations'
    ];
    
    return `Excel Content with sheets: ${sheets.join(', ')}\n\n${JSON.stringify(report, null, 2)}`;
  }

  generateWordContent(report) {
    // Simulated Word content (in real implementation, use Word library)
    return `Word Document for ${report.reportType} report\n\n${JSON.stringify(report, null, 2)}`;
  }

  generatePowerPointContent(report) {
    // Simulated PowerPoint content (in real implementation, use PowerPoint library)
    return `PowerPoint Presentation for ${report.reportType} report\n\n${JSON.stringify(report, null, 2)}`;
  }

  saveReportData(report, outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const dataPath = path.join(outputDir, `${report.id}_data.json`);
    fs.writeFileSync(dataPath, JSON.stringify(report, null, 2));
    
    console.log(`💾 Report data saved: ${dataPath}`);
  }

  loadTemplate(templatePath) {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }
    
    try {
      const templateData = fs.readFileSync(templatePath, 'utf8');
      return JSON.parse(templateData);
    } catch (error) {
      throw new Error(`Invalid template file: ${error.message}`);
    }
  }

  async processTemplate(template, data) {
    // Process template with provided data
    const reportConfig = {
      ...template.config,
      ...data
    };
    
    return await this.reportService.generateMinisterReport(reportConfig);
  }

  loadBatchConfig(configPath) {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Batch configuration file not found: ${configPath}`);
    }
    
    try {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      throw new Error(`Invalid batch configuration: ${error.message}`);
    }
  }

  generateBatchSummary(results, outputDir) {
    const summary = {
      timestamp: new Date().toISOString(),
      totalReports: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      results: results
    };
    
    const summaryPath = path.join(outputDir, 'batch-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`\n📊 Batch Summary:`);
    console.log(`   Total Reports: ${summary.totalReports}`);
    console.log(`   Successful: ${summary.successful} ✅`);
    console.log(`   Failed: ${summary.failed} ❌`);
    console.log(`   Summary saved: ${summaryPath}`);
  }

  formatNumber(num) {
    return new Intl.NumberFormat('en-GH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }
}

// CLI Setup
const cli = new MinisterReportCLI();

program
  .name('minister-report')
  .description('Ghana PCA Minister Report Generation Tool')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a minister report')
  .requiredOption('-c, --case <id>', 'Audit case ID')
  .requiredOption('-t, --type <type>', 'Report type (executive-summary, detailed-analysis, strategic-plan, financial-projections)')
  .requiredOption('-s, --start <date>', 'Start date (YYYY-MM-DD)')
  .requiredOption('-e, --end <date>', 'End date (YYYY-MM-DD)')
  .option('-f, --formats <formats>', 'Export formats (comma-separated)', 'pdf')
  .option('-o, --output <dir>', 'Output directory', './reports')
  .option('--save-data', 'Save report data as JSON')
  .option('--projections', 'Include financial projections')
  .option('--comparisons', 'Include comparative analysis')
  .option('--recommendations', 'Include recommendations')
  .action(async (options) => {
    const config = {
      caseId: options.case,
      reportType: options.type,
      period: {
        start: options.start,
        end: options.end
      },
      exportFormats: options.formats.split(',').map(f => f.trim()),
      outputDir: options.output,
      saveData: options.saveData,
      includeProjections: options.projections,
      includeComparisons: options.comparisons,
      includeRecommendations: options.recommendations
    };
    
    await cli.generateReport(config);
  });

program
  .command('template')
  .description('Generate report from template')
  .argument('<template>', 'Template file path')
  .argument('<output>', 'Output file path')
  .option('-d, --data <file>', 'Data file (JSON)')
  .action(async (template, output, options) => {
    let data = {};
    
    if (options.data) {
      data = JSON.parse(fs.readFileSync(options.data, 'utf8'));
    }
    
    await cli.generateFromTemplate(template, output, data);
  });

program
  .command('batch')
  .description('Generate multiple reports from batch configuration')
  .argument('<config>', 'Batch configuration file')
  .action(async (config) => {
    await cli.batchGenerate(config);
  });

program
  .command('create-template')
  .description('Create sample report template')
  .argument('<output>', 'Output template file')
  .option('-t, --type <type>', 'Template type', 'executive-summary')
  .action((output, options) => {
    const template = {
      name: `${options.type} Template`,
      version: '1.0.0',
      description: `Sample template for ${options.type} reports`,
      config: {
        reportType: options.type,
        includeProjections: true,
        includeComparisons: true,
        includeRecommendations: true,
        exportFormats: ['pdf', 'excel']
      },
      branding: {
        logo: './assets/logo.png',
        header: 'Ghana Revenue Authority',
        footer: 'Confidential - For Internal Use Only'
      },
      sections: [
        'Executive Summary',
        'Sectoral Impact Analysis',
        'Financial Projections',
        'Strategic Recommendations'
      ]
    };
    
    fs.writeFileSync(output, JSON.stringify(template, null, 2));
    console.log(`✅ Template created: ${output}`);
  });

program
  .command('create-batch')
  .description('Create sample batch configuration')
  .argument('<output>', 'Output configuration file')
  .action((output) => {
    const batchConfig = {
      name: 'Monthly Minister Reports',
      version: '1.0.0',
      description: 'Batch configuration for monthly ministerial reporting',
      outputDir: './reports',
      reports: [
        {
          name: 'Executive Summary - November 2024',
          caseId: 'CASE-2024-001',
          reportType: 'executive-summary',
          period: {
            start: '2024-11-01',
            end: '2024-11-30'
          },
          exportFormats: ['pdf', 'excel'],
          saveData: true
        },
        {
          name: 'Financial Projections - Q4 2024',
          caseId: 'CASE-2024-002',
          reportType: 'financial-projections',
          period: {
            start: '2024-10-01',
            end: '2024-12-31'
          },
          exportFormats: ['pdf', 'excel', 'powerpoint'],
          saveData: true
        }
      ]
    };
    
    fs.writeFileSync(output, JSON.stringify(batchConfig, null, 2));
    console.log(`✅ Batch configuration created: ${output}`);
  });

// Parse command line arguments
program.parse();

// Export for testing
module.exports = MinisterReportCLI;