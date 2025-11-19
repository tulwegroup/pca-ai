#!/usr/bin/env node

/**
 * Enhanced Synthetic Data Generator for Ghana PCA AI System
 * 
 * Generates realistic Ghana customs declaration data with:
 * - Ghana-specific infraction patterns
 * - ECOWAS origin fraud scenarios
 * - ATG (Automated Transfer Gauger) shortfall simulation
 * - Route diversion detection patterns
 * - Ghana tax structure integration
 * - Sectoral risk assessment (petroleum, textiles, vehicles)
 */

const fs = require('fs');
const path = require('path');

// Ghana-specific data configurations
const GHANA_PORTS = ['TEMA', 'TAKORADI', 'KOTOKA', 'KUMASI', 'TAMALE'];
const ECOWAS_COUNTRIES = ['NG', 'BJ', 'CI', 'BF', 'ML', 'NE', 'SN', 'SL', 'TG'];
const NON_ECOWAS_COUNTRIES = ['CN', 'US', 'GB', 'DE', 'JP', 'KR', 'IN', 'BR'];
const SECTORS = {
  petroleum: {
    hsCodes: ['27090010', '27101990', '27111200', '27111990', '27132000'],
    riskLevel: 'high',
    violationTypes: ['atg-shortfall', 'value-under-declaration', 'origin-fraud']
  },
  textiles: {
    hsCodes: ['52010000', '52030000', '52050000', '52060000', '52070000'],
    riskLevel: 'medium',
    violationTypes: ['hs-misclassification', 'value-under-declaration', 'origin-fraud']
  },
  vehicles: {
    hsCodes: ['87019000', '87032100', '87032200', '87032300', '87032400'],
    riskLevel: 'high',
    violationTypes: ['value-under-declaration', 'false-declarations', 'weight-discrepancies']
  }
};

const DECLARATION_TYPES = ['import', 'export', 'transit'];
const VIOLATION_TYPES = [
  'value-under-declaration',
  'hs-misclassification',
  'origin-fraud',
  'false-declarations',
  'documentation-errors',
  'weight-discrepancies',
  'atg-shortfall',
  'tax-evasion'
];

const GHANA_TAX_RATES = {
  vat: 15.0,
  getFund: 2.5,
  nhil: 2.5,
  covid: 1.0,
  customsDuty: {
    ecowas: 0.0,
    nonEcowaS: 5.0
  }
};

// Utility functions
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTIN() {
  return `TIN${randomInt(1000000, 9999999)}`;
}

function generateDeclarationId() {
  const year = new Date().getFullYear();
  const random = randomInt(10000, 99999);
  return `D${year}${random}`;
}

function generateDate(startYear = 2024, endYear = 2025) {
  const start = new Date(`${startYear}-01-01`);
  const end = new Date(`${endYear}-12-31`);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function calculateGhanaTaxes(value, isEcowaS = false) {
  const vat = value * (GHANA_TAX_RATES.vat / 100);
  const getFund = value * (GHANA_TAX_RATES.getFund / 100);
  const nhil = value * (GHANA_TAX_RATES.nhil / 100);
  const covid = value * (GHANA_TAX_RATES.covid / 100);
  const customsDuty = isEcowaS ? 0 : value * (GHANA_TAX_RATES.customsDuty.nonEcowaS / 100);
  
  return {
    vat,
    getFund,
    nhil,
    covid,
    customsDuty,
    total: vat + getFund + nhil + covid + customsDuty
  };
}

function generateSyntheticDeclaration(index) {
  const sector = randomChoice(Object.keys(SECTORS));
  const sectorConfig = SECTORS[sector];
  const hsCode = randomChoice(sectorConfig.hsCodes);
  const isEcowaS = Math.random() < 0.4; // 40% ECOWAS declarations
  const originCountry = isEcowaS ? randomChoice(ECOWAS_COUNTRIES) : randomChoice(NON_ECOWAS_COUNTRIES);
  const destinationCountry = randomChoice(['GH', 'TG', 'BF', 'CI']);
  
  const value = randomFloat(10000, 500000);
  const weight = randomFloat(100, 50000);
  const taxes = calculateGhanaTaxes(value, isEcowaS);
  
  // Generate violations based on sector risk
  const hasViolation = Math.random() < (sectorConfig.riskLevel === 'high' ? 0.7 : sectorConfig.riskLevel === 'medium' ? 0.4 : 0.2);
  const violations = [];
  
  if (hasViolation) {
    const violationType = randomChoice(sectorConfig.violationTypes);
    const severity = randomChoice(['low', 'medium', 'high', 'critical']);
    
    violations.push({
      type: violationType,
      severity,
      description: generateViolationDescription(violationType, sector),
      riskScore: randomFloat(60, 95),
      recoveryAmount: randomFloat(value * 0.1, value * 0.5),
      ghanaTaxImpact: randomFloat(taxes.total * 0.1, taxes.total * 0.3),
      sector
    });
  }
  
  return {
    id: `DECL-${String(index + 1).padStart(6, '0')}`,
    declarationId: generateDeclarationId(),
    type: randomChoice(DECLARATION_TYPES),
    hsCode,
    description: generateHSDescription(hsCode, sector),
    originCountry,
    destinationCountry,
    value,
    currency: 'USD',
    weight,
    declarantTin: generateTIN(),
    declarantName: generateCompanyName(),
    portOfEntry: randomChoice(GHANA_PORTS),
    date: generateDate(),
    status: hasViolation ? 'flagged' : 'approved',
    
    // Ghana-specific fields
    getFundLevy: taxes.getFund,
    nhilLevy: taxes.nhil,
    covidLevy: taxes.covid,
    vatRate: GHANA_TAX_RATES.vat,
    ecowasOrigin: isEcowaS,
    atgApplicable: sector === 'petroleum' && Math.random() < 0.8,
    
    violations,
    sector,
    riskScore: violations.length > 0 ? Math.max(...violations.map(v => v.riskScore)) : randomFloat(10, 40),
    
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function generateViolationDescription(type, sector) {
  const descriptions = {
    'value-under-declaration': {
      petroleum: 'Petroleum product value significantly under-declared, possible tax evasion',
      textiles: 'Textile goods value under-declared to reduce customs duties',
      vehicles: 'Vehicle value manipulated to avoid higher import taxes'
    },
    'hs-misclassification': {
      petroleum: 'Petroleum products misclassified under lower duty HS codes',
      textiles: 'Textiles classified under incorrect categories to reduce duties',
      vehicles: 'Vehicle type misclassified to benefit from lower tax rates'
    },
    'origin-fraud': {
      petroleum: 'False ECOWAS origin claimed for petroleum products',
      textiles: 'Textile origin falsified to qualify for ECOWAS preferences',
      vehicles: 'Vehicle origin documents appear fraudulent'
    },
    'atg-shortfall': {
      petroleum: 'Automated Transfer Gauger indicates significant volume shortfall',
      textiles: null,
      vehicles: null
    },
    'false-declarations': {
      petroleum: 'False information provided on petroleum product specifications',
      textiles: 'Incorrect textile composition and origin declarations',
      vehicles: 'Vehicle specifications and condition falsely declared'
    },
    'weight-discrepancies': {
      petroleum: 'Significant discrepancy between declared and actual petroleum weight',
      textiles: 'Textile shipment weight does not match documentation',
      vehicles: 'Vehicle weight discrepancies suggest possible tampering'
    },
    'tax-evasion': {
      petroleum: 'Evidence of systematic tax evasion in petroleum imports',
      textiles: 'Textile imports structured to avoid Ghana tax obligations',
      vehicles: 'Vehicle imports show patterns of tax avoidance'
    }
  };
  
  return descriptions[type]?.[sector] || `Violation detected in ${sector} sector`;
}

function generateHSDescription(hsCode, sector) {
  const descriptions = {
    petroleum: {
      '27090010': 'Petroleum oils and oils obtained from bituminous minerals, crude',
      '27101990': 'Petroleum oils and oils obtained from bituminous minerals (other)',
      '27111200': 'Propane, liquefied',
      '27111990': 'Other liquefied petroleum gases',
      '27132000': 'Petroleum bitumen, petroleum coke'
    },
    textiles: {
      '52010000': 'Cotton, not carded or combed',
      '52030000': 'Cotton, carded or combed',
      '52050000': 'Cotton waste (including yarn waste and garnetted stock)',
      '52060000': 'Yarn of cotton, containing 85% or more by weight of cotton',
      '52070000': 'Yarn of cotton, containing less than 85% by weight of cotton'
    },
    vehicles: {
      '87019000': 'Motor vehicles for the transport of goods',
      '87032100': 'Motor cars and motor wagons, with spark-ignition engine of <= 1000cc',
      '87032200': 'Motor cars and motor wagons, with spark-ignition engine of > 1000cc & <= 1500cc',
      '87032300': 'Motor cars and motor wagons, with spark-ignition engine of > 1500cc & <= 3000cc',
      '87032400': 'Motor cars and motor wagons, with spark-ignition engine of > 3000cc'
    }
  };
  
  return descriptions[sector]?.[hsCode] || `Product under HS code ${hsCode}`;
}

function generateCompanyName() {
  const prefixes = ['Ghana', 'Accra', 'Kumasi', 'Tema', 'Takoradi', 'West Africa', 'ECOWAS'];
  const suffixes = ['Trading', 'Imports', 'Exports', 'Enterprises', 'Company Ltd', 'Group', 'Corporation', 'International'];
  
  return `${randomChoice(prefixes)} ${randomChoice(suffixes)}`;
}

function generateTrainingDataset(size = 800) {
  console.log(`Generating ${size} synthetic Ghana customs declarations...`);
  
  const dataset = [];
  const sectorCounts = {
    petroleum: 0,
    textiles: 0,
    vehicles: 0
  };
  
  // Generate balanced dataset across sectors
  for (let i = 0; i < size; i++) {
    const declaration = generateSyntheticDeclaration(i);
    dataset.push(declaration);
    sectorCounts[declaration.sector]++;
  }
  
  // Generate summary statistics
  const stats = {
    totalDeclarations: size,
    sectorBreakdown: sectorCounts,
    violationCount: dataset.filter(d => d.violations.length > 0).length,
    ecowasDeclarations: dataset.filter(d => d.ecowasOrigin).length,
    atgApplicable: dataset.filter(d => d.atgApplicable).length,
    averageValue: dataset.reduce((sum, d) => sum + d.value, 0) / size,
    averageRiskScore: dataset.reduce((sum, d) => sum + d.riskScore, 0) / size,
    totalRecoveryAmount: dataset.reduce((sum, d) => 
      sum + d.violations.reduce((vSum, v) => vSum + (v.recoveryAmount || 0), 0), 0
    )
  };
  
  return { dataset, stats };
}

function main() {
  try {
    const { dataset, stats } = generateTrainingDataset(800);
    
    // Create output directory
    const outputDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save JSON dataset
    const jsonPath = path.join(outputDir, 'ghana_pca_training_data.json');
    fs.writeFileSync(jsonPath, JSON.stringify({ dataset, stats }, null, 2));
    
    // Save CSV dataset
    const csvPath = path.join(outputDir, 'ghana_pca_training_data.csv');
    const csvHeaders = [
      'id', 'declarationId', 'type', 'hsCode', 'description', 'originCountry',
      'destinationCountry', 'value', 'currency', 'weight', 'declarantTin',
      'declarantName', 'portOfEntry', 'date', 'status', 'getFundLevy',
      'nhilLevy', 'covidLevy', 'vatRate', 'ecowasOrigin', 'atgApplicable',
      'sector', 'riskScore', 'violationCount', 'recoveryAmount'
    ];
    
    const csvRows = dataset.map(d => [
      d.id,
      d.declarationId,
      d.type,
      d.hsCode,
      `"${d.description}"`,
      d.originCountry,
      d.destinationCountry,
      d.value,
      d.currency,
      d.weight,
      d.declarantTin,
      `"${d.declarantName}"`,
      d.portOfEntry,
      d.date.toISOString().split('T')[0],
      d.status,
      d.getFundLevy || 0,
      d.nhilLevy || 0,
      d.covidLevy || 0,
      d.vatRate,
      d.ecowasOrigin,
      d.atgApplicable,
      d.sector,
      d.riskScore,
      d.violations.length,
      d.violations.reduce((sum, v) => sum + (v.recoveryAmount || 0), 0)
    ]);
    
    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    fs.writeFileSync(csvPath, csvContent);
    
    // Display statistics
    console.log('\n=== GHANA PCA TRAINING DATASET GENERATION COMPLETE ===');
    console.log(`Total Declarations: ${stats.totalDeclarations.toLocaleString()}`);
    console.log(`Sector Breakdown:`);
    Object.entries(stats.sectorBreakdown).forEach(([sector, count]) => {
      const percentage = ((count / stats.totalDeclarations) * 100).toFixed(1);
      console.log(`  - ${sector.charAt(0).toUpperCase() + sector.slice(1)}: ${count} (${percentage}%)`);
    });
    console.log(`Violations Detected: ${stats.violationCount} (${((stats.violationCount / stats.totalDeclarations) * 100).toFixed(1)}%)`);
    console.log(`ECOWAS Declarations: ${stats.ecowasDeclarations} (${((stats.ecowasDeclarations / stats.totalDeclarations) * 100).toFixed(1)}%)`);
    console.log(`ATG Applicable: ${stats.atgApplicable} (${((stats.atgApplicable / stats.totalDeclarations) * 100).toFixed(1)}%)`);
    console.log(`Average Declaration Value: $${stats.averageValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
    console.log(`Average Risk Score: ${stats.averageRiskScore.toFixed(1)}`);
    console.log(`Total Recovery Amount: $${stats.totalRecoveryAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
    console.log(`\nFiles Generated:`);
    console.log(`  - JSON: ${jsonPath}`);
    console.log(`  - CSV: ${csvPath}`);
    console.log('\n✅ Enhanced synthetic data generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error generating synthetic data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateSyntheticDeclaration,
  generateTrainingDataset,
  calculateGhanaTaxes,
  GHANA_TAX_RATES,
  SECTORS
};