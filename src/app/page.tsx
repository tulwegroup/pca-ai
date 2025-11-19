'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CalendarIcon, Play, Pause, RotateCcw, Download, Upload, Settings, AlertTriangle, CheckCircle, Clock, TrendingUp, FileText, Activity, Globe, Shield, Eye, BarChart3, Users, Target, Zap, Database, Wifi, WifiOff, RefreshCw, Search, Filter, ChevronRight, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(0)
  
  // Ghana PCA System Data
  const [auditCases, setAuditCases] = useState([
    {
      id: 'CASE-2025-001',
      name: 'Q4 2025 Ghana Petroleum Audit',
      description: 'Comprehensive audit of petroleum imports with ATG analysis',
      status: 'completed',
      createdAt: '2025-11-15T10:00:00Z',
      startedAt: '2025-11-15T10:30:00Z',
      completedAt: '2025-11-15T14:45:00Z',
      results: {
        totalDeclarations: 1247,
        violationsDetected: 89,
        riskScore: 76.4,
        recoveryAmount: 2847392,
        accuracy: 94.2,
        sectoralImpact: {
          petroleum: { violations: 45, recovery: 1708435 },
          textiles: { violations: 28, recovery: 683374 },
          vehicles: { violations: 16, recovery: 455583 }
        },
        violationBreakdown: {
          'value-under-declaration': 34,
          'hs-misclassification': 22,
          'origin-fraud': 18,
          'documentation-errors': 15
        }
      }
    },
    {
      id: 'CASE-2025-002', 
      name: 'High-Risk Shipments Investigation',
      description: 'Targeted audit of high-risk shipment patterns',
      status: 'running',
      createdAt: '2025-11-18T09:00:00Z',
      startedAt: '2025-11-18T09:15:00Z',
      completedAt: null,
      results: null
    }
  ]);

  const [auditReports, setAuditReports] = useState([
    {
      id: 'REPORT-2025-001',
      caseId: 'CASE-2025-001',
      type: 'executive-summary',
      name: 'Executive Summary Report',
      generatedAt: '2025-11-15T15:00:00Z',
      downloadUrl: '#',
      content: {
        totalViolations: 89,
        recoveryAmount: 2847392,
        accuracy: 94.2,
        sectoralBreakdown: {
          petroleum: { violations: 45, recovery: 1708435 },
          textiles: { violations: 28, recovery: 683374 },
          vehicles: { violations: 16, recovery: 455583 }
        }
      }
    },
    {
      id: 'REPORT-2025-002',
      caseId: 'CASE-2025-001', 
      type: 'detailed-violations',
      name: 'Detailed Violations Analysis',
      generatedAt: '2025-11-15T15:30:00Z',
      downloadUrl: '#',
      content: {
        violationCategories: {
          'value-under-declaration': { count: 34, percentage: 38.2 },
          'hs-misclassification': { count: 22, percentage: 24.7 },
          'origin-fraud': { count: 18, percentage: 20.2 },
          'documentation-errors': { count: 15, percentage: 16.9 }
        },
        highRiskCases: 27,
        criticalViolations: 9
      }
    },
    {
      id: 'REPORT-2025-003',
      caseId: 'CASE-2025-001',
      type: 'declarant-communications',
      name: 'Declarant Communications Package',
      generatedAt: '2025-11-15T16:00:00Z',
      downloadUrl: '#',
      content: {
        totalDeclarants: 67,
        noticesSent: 89,
        responsesReceived: 45,
        pendingActions: 22
      }
    },
    {
      id: 'REPORT-2025-004',
      caseId: 'CASE-2025-001',
      type: 'statistical-analysis',
      name: 'Statistical Analysis Report',
      generatedAt: '2025-11-15T16:30:00Z',
      downloadUrl: '#',
      content: {
        trends: {
          violations: '+12.5%',
          riskScore: '+8.3%',
          recovery: '+15.7%'
        },
        patterns: {
          peakViolationHours: ['14:00-16:00', '09:00-11:00'],
          highRiskHS: ['2710', '5201', '8703'],
          commonOrigins: ['CN', 'NG', 'US']
        }
      }
    },
    {
      id: 'REPORT-2025-005',
      caseId: 'CASE-2025-001',
      type: 'compliance-certificate',
      name: 'Compliance Certificate',
      generatedAt: '2025-11-15T17:00:00Z',
      downloadUrl: '#',
      content: {
        complianceScore: 85.7,
        grade: 'A-',
        recommendations: 12,
        nextAuditDate: '2025-12-15'
      }
    }
  ]);

  const [stats, setStats] = useState({
    totalDeclarations: 45829,
    totalViolations: 1247,
    riskScore: 72.6,
    recoveryAmount: 2847392,
    weeklyDeclarations: 1182,
    weeklyViolations: 47,
    monthlyTrend: { violations: 12.5, riskScore: 8.3, recovery: 15.7 },
    countryBreakdown: {
      'GH': { declarations: 12567, violations: 342, riskScore: 68.4 },
      'NG': { declarations: 8934, violations: 567, riskScore: 78.9 },
      'KE': { declarations: 10234, violations: 189, riskScore: 64.2 },
      'CN': { declarations: 14094, violations: 149, riskScore: 58.7 }
    },
    lastUpdated: '2025-11-18 14:30:00',
    processingQueue: 127,
    averageProcessingTime: 4.7
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'violation', description: 'High-risk shipment detected from Ghana', time: '2 minutes ago', risk: 94 },
    { id: 2, type: 'audit', description: 'PCA audit completed for 150 shipments', time: '15 minutes ago', risk: null },
    { id: 3, type: 'alert', description: 'Unusual routing pattern detected - Nigeria to China', time: '1 hour ago', risk: 87 },
    { id: 4, type: 'report', description: 'Weekly compliance report generated', time: '2 hours ago', risk: null },
    { id: 5, type: 'violation', description: 'Value discrepancy detected in Kenyan import', time: '3 hours ago', risk: 76 },
    { id: 6, type: 'system', description: 'ICUMS database synchronized successfully', time: '5 hours ago', risk: null },
    { id: 7, type: 'audit', description: 'Historical audit completed for 2025-10-01 to 2025-10-31', time: '1 day ago', risk: null },
    { id: 8, type: 'alert', description: 'New sanction list updates applied', time: '1 day ago', risk: null }
  ]);

  useEffect(() => {
    if (isExecuting && executionProgress < 100) {
      const timer = setTimeout(() => {
        setExecutionProgress(prev => Math.min(prev + Math.random() * 15, 100));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (executionProgress >= 100) {
      setTimeout(() => {
        setIsExecuting(false);
        setExecutionProgress(0);
      }, 2000);
    }
  }, [isExecuting, executionProgress]);

  const handleExecutePCA = () => {
    setIsExecuting(true);
    setExecutionProgress(0);
  };

  const handlePauseExecution = () => {
    setIsExecuting(false);
  };

  const violationTypes = [
    { name: 'Value Under-declaration', count: 342, trend: '+12%', risk: 'high' },
    { name: 'HS Code Misclassification', count: 256, trend: '+8%', risk: 'medium' },
    { name: 'False Declarations', count: 189, trend: '-3%', risk: 'high' },
    { name: 'Documentation Errors', count: 167, trend: '+15%', risk: 'low' },
    { name: 'Origin Fraud', count: 145, trend: '+5%', risk: 'high' },
    { name: 'Weight Discrepancies', count: 148, trend: '-2%', risk: 'medium' }
  ];

  const reportTypes = [
    { id: 'executive', name: 'Executive Summary', description: 'High-level overview for management', icon: BarChart3 },
    { id: 'detailed', name: 'Detailed Violations', description: 'Comprehensive violation analysis', icon: FileText },
    { id: 'declarant', name: 'Declarant Communications', description: 'Notices and required actions', icon: Users },
    { id: 'statistical', name: 'Statistical Analysis', description: 'Trends and patterns', icon: TrendingUp },
    { id: 'compliance', name: 'Compliance Certificate', description: 'Official compliance documentation', icon: Shield }
  ];

  const countryFlags = {
    'GH': '🇬🇭', 'NG': '🇳🇬', 'KE': '🇰🇪', 'CN': '🇨🇳'
  };

  const handleGenerateReport = (reportType) => {
    const completedCase = auditCases.find(c => c.status === 'completed');
    if (!completedCase) {
      alert('Please complete an audit case first before generating reports');
      return;
    }

    const newReport = {
      id: `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      caseId: completedCase.id,
      type: reportType,
      name: reportTypes.find(r => r.id === reportType)?.name || `${reportType} Report`,
      generatedAt: new Date().toISOString(),
      downloadUrl: '#',
      content: generateReportContent(completedCase, reportType)
    };

    setAuditReports(prev => [newReport, ...prev]);
    
    // Simulate report download
    setTimeout(() => {
      const reportContent = generateReportContent(completedCase, reportType);
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${completedCase.name.replace(/\s+/g, '_')}_${reportType}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const generateReportContent = (auditCase, reportType) => {
    const results = auditCase.results;
    
    const reportTemplates = {
      'executive': `
EXECUTIVE SUMMARY REPORT
========================
Audit Case: ${auditCase.name}
Case ID: ${auditCase.id}
Execution Period: ${auditCase.startedAt} to ${auditCase.completedAt}

KEY PERFORMANCE INDICATORS
- Total Declarations Processed: ${results.totalDeclarations.toLocaleString()}
- Violations Detected: ${results.violationsDetected.toLocaleString()}
- Risk Score: ${results.riskScore}%
- Estimated Recovery: GHS ${results.recoveryAmount.toLocaleString()}
- Detection Accuracy: ${results.accuracy}%

SECTORAL IMPACT
${results.sectoralImpact ? Object.entries(results.sectoralImpact).map(([sector, data]) => 
  `- ${sector.charAt(0).toUpperCase() + sector.slice(1)}: ${data.violations} violations, GHS ${data.recovery.toLocaleString()} recovered`
).join('\n') : ''}

VIOLATION BREAKDOWN
${results.violationBreakdown ? Object.entries(results.violationBreakdown).map(([type, count]) => 
  `- ${type}: ${count} cases`
).join('\n') : ''}
      `,
      
      'detailed': `
DETAILED VIOLATIONS REPORT
==========================
Audit Case: ${auditCase.name} (${auditCase.id})
Analysis Period: ${auditCase.startedAt} to ${auditCase.completedAt}

VIOLATION CATEGORIES
${results.violationBreakdown ? Object.entries(results.violationBreakdown).map(([type, count], index) => 
  `${index + 1}. ${type}: ${count} cases (${((count/results.violationsDetected) * 100).toFixed(1)}%)`
).join('\n') : ''}

HIGH-RISK FINDINGS
- Total High-Risk Cases: ${Math.floor(results.violationsDetected * 0.3)}
- Critical Violations: ${Math.floor(results.violationsDetected * 0.1)}
- Recommended Actions: Immediate audit required for critical cases

SECTORAL ANALYSIS
${results.sectoralImpact ? Object.entries(results.sectoralImpact).map(([sector, data]) => 
  `${sector.charAt(0).toUpperCase() + sector.slice(1)}: ${data.violations} violations, GHS ${data.recovery.toLocaleString()} recovery`
).join('\n') : ''}
      `,
      
      'declarant': `
DECLARANT COMMUNICATIONS PACKAGE
================================
Audit Case: ${auditCase.name} (${auditCase.id})
Generated: ${new Date().toLocaleDateString()}

SUMMARY
- Total Declarants Notified: ${Math.floor(results.violationsDetected * 0.8)}
- Notices Sent: ${results.violationsDetected}
- Responses Required: ${Math.floor(results.violationsDetected * 0.6)}
- Pending Actions: ${Math.floor(results.violationsDetected * 0.4)}

NOTICE TYPES
1. Compliance Violation Notice
2. Additional Documentation Request
3. Payment Demand Notice
4. Investigation Notice

NEXT STEPS
- Follow up on non-responsive declarants
- Schedule compliance meetings
- Prepare enforcement actions for critical cases
      `,
      
      'statistical': `
STATISTICAL ANALYSIS REPORT
===========================
Audit Case: ${auditCase.name} (${auditCase.id})
Analysis Period: ${auditCase.startedAt} to ${auditCase.completedAt}

VIOLATION TRENDS
- Value Under-declaration: ${Math.floor(results.violationsDetected * 0.4)} cases (38.2%)
- HS Code Misclassification: ${Math.floor(results.violationsDetected * 0.25)} cases (24.7%)
- Origin Fraud: ${Math.floor(results.violationsDetected * 0.2)} cases (20.2%)
- Documentation Errors: ${Math.floor(results.violationsDetected * 0.15)} cases (16.9%)

RISK PATTERNS
- Peak Violation Hours: 14:00-16:00, 09:00-11:00
- High-Risk HS Codes: 2710, 5201, 8703
- Common Origin Countries: CN, NG, US

RECOMMENDATIONS
- Enhanced monitoring during peak hours
- Targeted inspections for high-risk HS codes
- Increased verification for specific origin countries
      `,
      
      'compliance': `
COMPLIANCE CERTIFICATE
=======================
Audit Case: ${auditCase.name} (${auditCase.id})
Certificate Date: ${new Date().toLocaleDateString()}

COMPLIANCE SCORE: ${(results.accuracy * 0.9).toFixed(1)}%
GRADE: ${results.accuracy >= 95 ? 'A' : results.accuracy >= 85 ? 'B' : results.accuracy >= 75 ? 'C' : 'D'}

KEY METRICS
- Total Declarations: ${results.totalDeclarations.toLocaleString()}
- Compliant Declarations: ${Math.floor(results.totalDeclarations * (results.accuracy / 100))}
- Non-Compliant Declarations: ${results.violationsDetected}
- Recovery Potential: GHS ${results.recoveryAmount.toLocaleString()}

RECOMMENDATIONS
1. Implement enhanced training for compliance officers
2. Strengthen pre-arrival assessment procedures
3. Improve documentation verification processes
4. Enhance risk-based targeting systems

NEXT AUDIT RECOMMENDED: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
      `
    };

    return reportTemplates[reportType] || 'Report type not found';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">🇬🇭 Ghana PCA AI System</h1>
            <p className="text-slate-600 dark:text-slate-300">Enhanced Customs Audit with AI-Powered Detection for Ghana Revenue Authority</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              ICUMS Connected
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Ghana Customs
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Declarations</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeclarations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{stats.weeklyDeclarations} this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Violations Detected</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViolations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{stats.weeklyViolations} this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovery Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">GHS {stats.recoveryAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{stats.monthlyTrend.recovery}% this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.riskScore}%</div>
              <p className="text-xs text-muted-foreground">+{stats.monthlyTrend.riskScore}% this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audit-cases">Audit Cases</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ghana System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>🇬🇭 Ghana System Status</CardTitle>
                  <CardDescription>Real-time Ghana customs audit system monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">ICUMS Integration</span>
                      <Badge variant="outline" className="flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">GRA Processing</span>
                      <Badge variant="outline" className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Agents</span>
                      <Badge variant="outline" className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        4 Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Ghana Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Ghana Activity</CardTitle>
                  <CardDescription>Latest audit events and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="mt-1">
                            {activity.type === 'violation' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            {activity.type === 'audit' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {activity.type === 'alert' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                            {activity.type === 'report' && <FileText className="w-4 h-4 text-blue-500" />}
                            {activity.type === 'system' && <Settings className="w-4 h-4 text-gray-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                          {activity.risk && (
                            <Badge variant={activity.risk > 80 ? 'destructive' : activity.risk > 60 ? 'default' : 'secondary'}>
                              {activity.risk}% Risk
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Ghana-Specific Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Violation Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Ghana Violation Types</CardTitle>
                  <CardDescription>Types of violations detected by AI system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {violationTypes.map((violation, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{violation.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">{violation.count}</span>
                              <Badge variant={violation.trend.startsWith('+') ? 'default' : 'secondary'}>
                                {violation.trend}
                              </Badge>
                              <Badge variant={violation.risk === 'high' ? 'destructive' : violation.risk === 'medium' ? 'default' : 'secondary'}>
                                {violation.risk}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sectoral Impact */}
              <Card>
                <CardHeader>
                  <CardTitle>Sectoral Impact Analysis</CardTitle>
                  <CardDescription>Ghana-specific sector breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Petroleum Sector</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">45 violations</div>
                        <div className="text-xs text-muted-foreground">GHS 1,708,435 recovery</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Textiles Sector</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">28 violations</div>
                        <div className="text-xs text-muted-foreground">GHS 683,374 recovery</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Vehicles Sector</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">16 violations</div>
                        <div className="text-xs text-muted-foreground">GHS 455,583 recovery</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Cases Tab */}
          <TabsContent value="audit-cases" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Audit Cases</h3>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                New Case
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {auditCases.map((auditCase) => (
                <Card key={auditCase.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{auditCase.name}</CardTitle>
                      <Badge variant={auditCase.status === 'completed' ? 'default' : auditCase.status === 'running' ? 'secondary' : 'outline'}>
                        {auditCase.status}
                      </Badge>
                    </div>
                    <CardDescription>{auditCase.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Case ID:</span>
                        <span className="font-mono">{auditCase.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span>{new Date(auditCase.createdAt).toLocaleDateString()}</span>
                      </div>
                      {auditCase.results && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Declarations:</span>
                            <span>{auditCase.results.totalDeclarations.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Violations:</span>
                            <span>{auditCase.results.violationsDetected}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Recovery:</span>
                            <span>GHS {auditCase.results.recoveryAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Accuracy:</span>
                            <span>{auditCase.results.accuracy}%</span>
                          </div>
                          {auditCase.results.sectoralImpact && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-sm font-medium mb-2">Sectoral Impact:</div>
                              {Object.entries(auditCase.results.sectoralImpact).map(([sector, data]) => (
                                <div key={sector} className="flex justify-between text-xs mb-1">
                                  <span className="capitalize">{sector}:</span>
                                  <span>{data.violations} violations (GHS {data.recovery.toLocaleString()})</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Execution Tab */}
          <TabsContent value="execution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Execution Control</CardTitle>
                <CardDescription>Manage and monitor audit execution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={handleExecutePCA} 
                    disabled={isExecuting}
                    className="flex items-center"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Audit
                      </>
                    )}
                  </Button>
                  
                  {isExecuting && (
                    <Button variant="outline" onClick={handlePauseExecution}>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  
                  <Button variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
                
                {isExecuting && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span>{executionProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={executionProgress} className="w-full" />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scope">Audit Scope</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Declarations</SelectItem>
                        <SelectItem value="hs-codes">Specific HS Codes</SelectItem>
                        <SelectItem value="shipments">Specific Shipments</SelectItem>
                        <SelectItem value="declarations">Specific Declarations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="risk-threshold">Risk Threshold</Label>
                    <Select defaultValue="70">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">Low (50%)</SelectItem>
                        <SelectItem value="70">Medium (70%)</SelectItem>
                        <SelectItem value="85">High (85%)</SelectItem>
                        <SelectItem value="95">Critical (95%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector Focus</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sectors</SelectItem>
                        <SelectItem value="petroleum">Petroleum</SelectItem>
                        <SelectItem value="textiles">Textiles</SelectItem>
                        <SelectItem value="vehicles">Vehicles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Reports</h3>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
            
            {/* Existing Reports */}
            {auditReports.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground">Recent Reports</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {auditReports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{report.name}</CardTitle>
                          <Badge variant="outline">{report.type}</Badge>
                        </div>
                        <CardDescription>
                          Generated: {new Date(report.generatedAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {report.content && (
                            <>
                              {report.content.totalViolations && (
                                <div className="flex justify-between text-xs">
                                  <span>Violations:</span>
                                  <span>{report.content.totalViolations}</span>
                                </div>
                              )}
                              {report.content.recoveryAmount && (
                                <div className="flex justify-between text-xs">
                                  <span>Recovery:</span>
                                  <span>GHS {report.content.recoveryAmount.toLocaleString()}</span>
                                </div>
                              )}
                              {report.content.complianceScore && (
                                <div className="flex justify-between text-xs">
                                  <span>Compliance:</span>
                                  <span>{report.content.complianceScore}%</span>
                                </div>
                              )}
                            </>
                          )}
                          <div className="flex space-x-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                const content = generateReportContent(
                                  auditCases.find(c => c.id === report.caseId),
                                  report.type
                                );
                                const blob = new Blob([content], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Generate New Reports */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Generate New Reports</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTypes.map((report) => (
                  <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <report.icon className="w-5 h-5 mr-2" />
                        {report.name}
                      </CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleGenerateReport(report.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Country Breakdown</CardTitle>
                  <CardDescription>Declarations and violations by country</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.countryBreakdown).map(([country, data]) => (
                      <div key={country} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{countryFlags[country as keyof typeof countryFlags]}</span>
                          <span className="text-sm font-medium">{country}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{data.declarations.toLocaleString()} decl.</div>
                          <div className="text-xs text-muted-foreground">{data.violations} violations</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Real-time system metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Processing Queue:</span>
                      <span className="font-mono">{stats.processingQueue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Processing Time:</span>
                      <span className="font-mono">{stats.averageProcessingTime}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>System Uptime:</span>
                      <span className="font-mono">99.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="font-mono text-xs">{stats.lastUpdated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Configure Ghana PCA AI System settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">AI Model Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-learning">Auto-Learning Mode</Label>
                        <Switch id="auto-learning" defaultChecked />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="real-time">Real-time Processing</Label>
                        <Switch id="real-time" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Ghana Integration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="icums-url">ICUMS API URL</Label>
                      <Input id="icums-url" defaultValue="https://icums.gov.gh/api/v2" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <Input id="api-key" type="password" defaultValue="•••••••••••••••" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}