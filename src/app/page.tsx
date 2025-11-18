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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Play, Pause, RotateCcw, Download, Upload, Settings, AlertTriangle, CheckCircle, Clock, TrendingUp, FileText, Activity, Globe, Shield, Eye, BarChart3, Users, Target, Zap, Database, Wifi, WifiOff, RefreshCw, Search, Filter, ChevronRight, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')
  const [executionConfig, setExecutionConfig] = useState({
    period: 'custom', // Changed to custom by default
    customRange: { start: '2025-09-18', end: '2025-11-18' }, // Updated to current date
    riskThreshold: 70,
    useAdvancedFilters: true,
    countries: ['GH', 'NG', 'KE', 'CN'],
    declarationTypes: ['import', 'export', 'transit'],
    hsCodes: [],
    valueRange: { min: 0, max: 1000000 },
    auditFrequency: 'weekly',
    deepAnalysis: true,
    historicalComparison: true
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportViewerOpen, setReportViewerOpen] = useState(false);
  const [selectedHistoricalReport, setSelectedHistoricalReport] = useState(null);
  const [pcaHistory, setPcaHistory] = useState([
    { id: 'PCA-2025-001', date: '2025-11-15', type: 'transit', status: 'completed', violations: 12, score: 85 },
    { id: 'PCA-2025-002', date: '2025-11-10', type: 'import', status: 'completed', violations: 8, score: 72 },
    { id: 'PCA-2025-003', date: '2025-11-05', type: 'export', status: 'completed', violations: 15, score: 91 },
    { id: 'PCA-2025-004', date: '2025-10-28', type: 'import', status: 'completed', violations: 6, score: 68 },
    { id: 'PCA-2025-005', date: '2025-10-20', type: 'transit', status: 'completed', violations: 22, score: 88 },
    { id: 'PCA-2025-006', date: '2025-10-15', type: 'export', status: 'completed', violations: 5, score: 64 },
    { id: 'PCA-2025-007', date: '2025-10-10', type: 'import', status: 'completed', violations: 18, score: 79 },
    { id: 'PCA-2025-008', date: '2025-10-05', type: 'transit', status: 'completed', violations: 9, score: 71 }
  ]);
  const [selectedCountry, setSelectedCountry] = useState('GH');
  const [countryConfigs, setCountryConfigs] = useState({
    'GH': {
      name: 'Ghana ICUMS',
      serverUrl: 'https://icums.gov.gh/api/v2',
      apiKey: '•••••••••••••••',
      connected: true,
      lastSync: '2 minutes ago'
    },
    'NG': {
      name: 'Nigeria Customs System',
      serverUrl: 'https://customs.gov.ng/api/v2',
      apiKey: '•••••••••••••••',
      connected: true,
      lastSync: '5 minutes ago'
    },
    'KE': {
      name: 'Kenya Customs System',
      serverUrl: 'https://customs.go.ke/api/v2',
      apiKey: '•••••••••••••••',
      connected: false,
      lastSync: '1 hour ago'
    },
    'CN': {
      name: 'China Customs System',
      serverUrl: 'https://customs.gov.cn/api/v2',
      apiKey: '•••••••••••••••',
      connected: true,
      lastSync: '10 minutes ago'
    }
  });
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

  // Date picker states
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [startDate, setStartDate] = useState(new Date('2025-09-18'));
  const [endDate, setEndDate] = useState(new Date('2025-11-18'));

  useEffect(() => {
    const interval = setInterval(() => {
      setIcumsConnected(prev => Math.random() > 0.1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
        
        // Update the running audit to completed
        setPcaHistory(prev => prev.map(audit => 
          audit.status === 'running' 
            ? { ...audit, status: 'completed' }
            : audit
        ));
      }, 2000);
    }
  }, [isExecuting, executionProgress]);

  const handleExecutePCA = () => {
    setIsExecuting(true);
    setExecutionProgress(0);
    
    // Create a new audit entry with current date and selected configuration
    const today = new Date('2025-11-18');
    const newAudit = {
      id: `PCA-2025-${String(Math.floor(Math.random() * 900) + 100)}`,
      date: format(today, 'yyyy-MM-dd'),
      type: executionConfig.declarationTypes.length === 1 ? executionConfig.declarationTypes[0].toUpperCase() : 'MULTIPLE',
      status: 'running',
      violations: Math.floor(Math.random() * 20) + 5,
      score: Math.floor(Math.random() * 30) + 60
    };
    
    // Add to history
    setPcaHistory(prev => [newAudit, ...prev.slice(0, 7)]);
  };

  const handlePauseExecution = () => {
    setIsExecuting(false);
  };

  const handleResumeExecution = () => {
    setIsExecuting(true);
  };

  const handleReportSelect = (reportType) => {
    setSelectedReport(reportType);
  };

  const handleDownloadReport = (reportType) => {
    // Generate actual report content
    const reportContent = generateReportContent(reportType);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PCA-${reportType.toUpperCase()}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = (reportType) => {
    const reportData = {
      executive: {
        title: 'PCA Executive Summary Report',
        sections: [
          'AUDIT OVERVIEW',
          'Total Declarations Processed: 45,829',
          'Violations Detected: 1,247',
          'Risk Score: 72.6%',
          'Recovery Amount: $2,847,392',
          '',
          'KEY FINDINGS',
          '• Value under-declaration remains the primary violation type',
          '• HS Code misclassification increased by 8% this period',
          '• Cross-border smuggling patterns detected in 3 regions',
          '• AI model accuracy improved to 94.2%',
          '',
          'RECOMMENDATIONS',
          '• Enhanced screening for high-risk origin countries',
          '• Implementation of advanced HS Code verification',
          '• Increased frequency of random inspections'
        ]
      },
      detailed: {
        title: 'PCA Detailed Violations Report',
        sections: [
          'DETAILED VIOLATION ANALYSIS',
          'Period: ' + (executionConfig.period === 'custom' ? `${executionConfig.customRange.start} to ${executionConfig.customRange.end}` : executionConfig.period),
          'Countries: ' + executionConfig.countries.join(', '),
          '',
          'VIOLATION BREAKDOWN',
          '1. Value Under-declaration: 342 cases (+12%)',
          '2. HS Code Misclassification: 256 cases (+8%)',
          '3. False Declarations: 189 cases (-3%)',
          '4. Documentation Errors: 167 cases (+15%)',
          '5. Origin Fraud: 145 cases (+5%)',
          '6. Weight Discrepancies: 148 cases (-2%)',
          '',
          'HIGH-RISK SHIPMENTS',
          '• 15 shipments with risk score > 90%',
          '• 8 shipments involving sanctioned entities',
          '• 23 shipments with unusual routing patterns'
        ]
      },
      declarant: {
        title: 'PCA Declarant Communications Report',
        sections: [
          'NOTICES AND REQUIRED ACTIONS',
          '',
          'URGENT - IMMEDIATE ACTION REQUIRED',
          'The following declarants have 72 hours to respond:',
          '',
          'HIGH PRIORITY VIOLATIONS:',
          '1. ABC Trading Ltd - Case #2025-0892',
          '   Violation: Value under-declaration of $125,000',
          '   Action: Submit revised valuation and supporting documents',
          '   Deadline: November 25, 2025',
          '',
          '2. Global Imports Inc - Case #2025-0893',
          '   Violation: False origin declaration',
          '   Action: Provide authentic certificates of origin',
          '   Deadline: November 25, 2025',
          '',
          'STANDARD COMPLIANCE NOTICES:',
          '• 45 declarants requiring additional documentation',
          '• 23 declarants selected for random audit',
          '• 8 declarants with compliance warnings'
        ]
      },
      statistical: {
        title: 'PCA Statistical Analysis Report',
        sections: [
          'STATISTICAL TRENDS AND PATTERNS',
          'Analysis Period: ' + (executionConfig.period === 'custom' ? `${executionConfig.customRange.start} to ${executionConfig.customRange.end}` : executionConfig.period),
          '',
          'TREND ANALYSIS:',
          '• Violation trend: +12.5% (increasing)',
          '• Risk score trend: +8.3% (elevated risk)',
          '• Recovery trend: +15.7% (improved collection)',
          '',
          'COUNTRY-SPECIFIC ANALYSIS:',
          '🇬🇭 Ghana: 342 violations, 68.4% risk score',
          '🇳🇬 Nigeria: 567 violations, 78.9% risk score',
          '🇰🇪 Kenya: 189 violations, 64.2% risk score',
          '🇨🇳 China: 149 violations, 58.7% risk score',
          '',
          'PREDICTIVE INDICATORS:',
          '• Expected increase in violation attempts: +18%',
          '• Emerging risk routes: West Africa to Europe',
          '• High-risk commodities: Electronics, textiles, machinery'
        ]
      },
      compliance: {
        title: 'PCA Compliance Certificate',
        sections: [
          'OFFICIAL COMPLIANCE CERTIFICATION',
          '',
          'CERTIFICATE #: PCA-COMP-2025-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          'DATE: ' + new Date().toLocaleDateString(),
          'PERIOD: ' + (executionConfig.period === 'custom' ? `${executionConfig.customRange.start} to ${executionConfig.customRange.end}` : executionConfig.period),
          '',
          'COMPLIANCE STATUS: ACCEPTABLE',
          '',
          'KEY METRICS:',
          '✓ Overall compliance rate: 97.3%',
          '✓ Risk mitigation effectiveness: 89.1%',
          '✓ Audit coverage: 94.7%',
          '✓ Recovery rate: 87.2%',
          '',
          'RECOMMENDATIONS FOR NEXT PERIOD:',
          '• Maintain current detection parameters',
          '• Focus on high-risk commodity categories',
          '• Continue cross-border intelligence sharing',
          '',
          'CERTIFIED BY:',
          '_______________________________',
          'PCA Compliance Authority',
          'Accredited Customs Administration'
        ]
      }
    };
    
    return reportData[reportType] ? 
      reportData[reportType].sections.join('\n') : 
      'Report type not found';
  };

  const handleRetrieveHistoricalReport = (pcaId) => {
    const audit = pcaHistory.find(a => a.id === pcaId);
    setSelectedHistoricalReport(audit);
    setReportViewerOpen(true);
  };

  const handlePreviewPackage = () => {
    alert('Evidence Package Preview\n\nThis would show a preview of the evidence package containing:\n- Declaration documents\n- Supporting documentation\n- AI analysis reports\n- Communication logs\n- Audit trails\n- Photographic evidence\n- Financial records\n- Compliance certificates');
  };

  const handleGenerateEvidencePackage = () => {
    alert('Generating Evidence Package...\n\nThis would:\n1. Collect all selected evidence types\n2. Organize documents by category\n3. Generate index and summary\n4. Create secure digital package\n5. Apply encryption and watermarking\n6. Generate download link\n\nPackage would be ready for download in 2-3 minutes.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">PCA-AI Platform</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Post-Clearance Audit with Artificial Intelligence</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${countryConfigs[selectedCountry].connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {countryConfigs[selectedCountry].connected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span className="text-sm font-medium">{countryConfigs[selectedCountry].name} {countryConfigs[selectedCountry].connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detection">Detection</TabsTrigger>
            <TabsTrigger value="workflow">PCA Workflow</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="evidence">Evidence Export</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                  <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.riskScore}%</div>
                  <p className="text-xs text-muted-foreground">+{stats.monthlyTrend.riskScore}% monthly</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recovery Amount</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(stats.recoveryAmount / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">+{stats.monthlyTrend.recovery}% monthly</p>
                </CardContent>
              </Card>
            </div>

            {/* Country Breakdown & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Country Breakdown
                  </CardTitle>
                  <CardDescription>Analysis for selected origin countries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {executionConfig.countries.map((country) => (
                      <div key={country} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{countryFlags[country]}</span>
                          <span className="font-medium">{country}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{stats.countryBreakdown[country]?.declarations?.toLocaleString() || 0} declarations</div>
                          <div className="text-xs text-muted-foreground">{stats.countryBreakdown[country]?.violations || 0} violations ({stats.countryBreakdown[country]?.riskScore || 0}% risk)</div>
                        </div>
                      </div>
                    ))}
                    {executionConfig.countries.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        <p>No countries selected. Please select origin countries in the PCA Workflow tab.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`mt-0.5 ${activity.type === 'violation' ? 'text-red-500' : activity.type === 'alert' ? 'text-yellow-500' : activity.type === 'audit' ? 'text-blue-500' : activity.type === 'system' ? 'text-green-500' : 'text-gray-500'}`}>
                            {activity.type === 'violation' ? <AlertTriangle className="h-4 w-4" /> : activity.type === 'alert' ? <AlertCircle className="h-4 w-4" /> : activity.type === 'audit' ? <Eye className="h-4 w-4" /> : activity.type === 'system' ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm">{activity.description}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{activity.time}</span>
                              {activity.risk && (
                                <Badge variant={activity.risk > 80 ? 'destructive' : activity.risk > 60 ? 'secondary' : 'outline'}>
                                  Risk: {activity.risk}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Detection Tab */}
          <TabsContent value="detection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Violation Types
                  </CardTitle>
                  <CardDescription>Detection patterns and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {violationTypes.map((violation) => (
                      <div key={violation.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{violation.name}</h4>
                          <p className="text-sm text-muted-foreground">{violation.count} cases</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={violation.risk === 'high' ? 'destructive' : violation.risk === 'medium' ? 'secondary' : 'outline'}>
                            {violation.risk} risk
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">{violation.trend}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    AI Detection Engine
                  </CardTitle>
                  <CardDescription>Real-time processing status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Processing Queue</span>
                    <Badge variant="outline">{stats.processingQueue} items</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg Processing Time</span>
                    <Badge variant="outline">{stats.averageProcessingTime}s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Pattern Recognition</span>
                      <span>94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Anomaly Detection</span>
                      <span>87.8%</span>
                    </div>
                    <Progress value={87.8} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Risk Assessment</span>
                      <span>91.5%</span>
                    </div>
                    <Progress value={91.5} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PCA Workflow Tab */}
          <TabsContent value="workflow" className="space-y-6">
            {/* Execution Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Configuration</CardTitle>
                <CardDescription>Configure PCA execution parameters and date range</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Period Selection with Flexible Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Analysis Period</Label>
                    <Select value={executionConfig.period} onValueChange={(value) => {
                      // Calculate date ranges based on selection
                      const today = new Date('2025-11-18');
                      let newCustomRange = { ...executionConfig.customRange };
                      
                      switch(value) {
                        case 'last7days':
                          const last7 = new Date(today);
                          last7.setDate(today.getDate() - 7);
                          newCustomRange = { 
                            start: format(last7, 'yyyy-MM-dd'), 
                            end: format(today, 'yyyy-MM-dd') 
                          };
                          break;
                        case 'last30days':
                          const last30 = new Date(today);
                          last30.setDate(today.getDate() - 30);
                          newCustomRange = { 
                            start: format(last30, 'yyyy-MM-dd'), 
                            end: format(today, 'yyyy-MM-dd') 
                          };
                          break;
                        case 'last90days':
                          const last90 = new Date(today);
                          last90.setDate(today.getDate() - 90);
                          newCustomRange = { 
                            start: format(last90, 'yyyy-MM-dd'), 
                            end: format(today, 'yyyy-MM-dd') 
                          };
                          break;
                        case 'ytd':
                          newCustomRange = { 
                            start: '2025-01-01', 
                            end: format(today, 'yyyy-MM-dd') 
                          };
                          break;
                        case 'lastyear':
                          newCustomRange = { 
                            start: '2024-01-01', 
                            end: '2024-12-31' 
                          };
                          break;
                        // 'custom' keeps existing dates
                      }
                      
                      setExecutionConfig({
                        ...executionConfig, 
                        period: value,
                        customRange: newCustomRange
                      });
                      
                      // Update calendar dates if not custom
                      if (value !== 'custom') {
                        setStartDate(new Date(newCustomRange.start));
                        setEndDate(new Date(newCustomRange.end));
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Date Range</SelectItem>
                        <SelectItem value="last7days">Last 7 Days</SelectItem>
                        <SelectItem value="last30days">Last 30 Days</SelectItem>
                        <SelectItem value="last90days">Last 90 Days</SelectItem>
                        <SelectItem value="ytd">Year to Date</SelectItem>
                        <SelectItem value="lastyear">Last Year</SelectItem>
                      </SelectContent>
                    </Select>

                    {executionConfig.period === 'custom' && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">From Date</Label>
                          <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(startDate, 'PPP')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => {
                                  setStartDate(date);
                                  setShowStartCalendar(false);
                                  setExecutionConfig({
                                    ...executionConfig,
                                    customRange: {
                                      ...executionConfig.customRange,
                                      start: format(date, 'yyyy-MM-dd')
                                    }
                                  });
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div>
                          <Label className="text-sm">To Date</Label>
                          <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(endDate, 'PPP')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => {
                                  setEndDate(date);
                                  setShowEndCalendar(false);
                                  setExecutionConfig({
                                    ...executionConfig,
                                    customRange: {
                                      ...executionConfig.customRange,
                                      end: format(date, 'yyyy-MM-dd')
                                    }
                                  });
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Risk Threshold</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Minimum Risk Score</span>
                        <span className="text-sm font-medium">{executionConfig.riskThreshold}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={executionConfig.riskThreshold}
                        onChange={(e) => setExecutionConfig({...executionConfig, riskThreshold: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="advanced-filters"
                        checked={executionConfig.useAdvancedFilters}
                        onCheckedChange={(checked) => setExecutionConfig({...executionConfig, useAdvancedFilters: checked})}
                      />
                      <Label htmlFor="advanced-filters">Use Advanced Filters</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="deep-analysis"
                        checked={executionConfig.deepAnalysis}
                        onCheckedChange={(checked) => setExecutionConfig({...executionConfig, deepAnalysis: checked})}
                      />
                      <Label htmlFor="deep-analysis">Deep Analysis Mode</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Country and Declaration Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Origin Countries</Label>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Select one or more countries of shipment origin</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['GH', 'NG', 'KE', 'CN'].map((country) => (
                          <div key={country} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`country-${country}`}
                              checked={executionConfig.countries.includes(country)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExecutionConfig({...executionConfig, countries: [...executionConfig.countries, country]});
                                } else {
                                  setExecutionConfig({...executionConfig, countries: executionConfig.countries.filter(c => c !== country)});
                                }
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`country-${country}`} className="flex items-center gap-1">
                              <span>{countryFlags[country]}</span>
                              <span className="text-sm">{country}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Declaration Types</Label>
                    <div className="space-y-2">
                      {['Import', 'Export', 'Transit'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`type-${type.toLowerCase()}`}
                            checked={executionConfig.declarationTypes.includes(type.toLowerCase())}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExecutionConfig({...executionConfig, declarationTypes: [...executionConfig.declarationTypes, type.toLowerCase()]});
                              } else {
                                setExecutionConfig({...executionConfig, declarationTypes: executionConfig.declarationTypes.filter(t => t !== type.toLowerCase())});
                              }
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`type-${type.toLowerCase()}`} className="text-sm">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  {!isExecuting ? (
                    <Button onClick={handleExecutePCA} className="bg-blue-600 hover:bg-blue-700">
                      <Play className="h-4 w-4 mr-2" />
                      Execute PCA
                    </Button>
                  ) : (
                    <Button onClick={handlePauseExecution} variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  {executionProgress > 0 && !isExecuting && (
                    <Button onClick={handleResumeExecution} variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setExecutionProgress(0)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Execution Progress */}
                {executionProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Execution Progress</span>
                      <span className="text-sm">{Math.round(executionProgress)}%</span>
                    </div>
                    <Progress value={executionProgress} className="h-2" />
                    {executionProgress < 100 && (
                      <p className="text-sm text-muted-foreground">Processing declarations... {Math.round(executionProgress * 1.5)} of {Math.round(150 * 1.5)} completed</p>
                    )}
                    {executionProgress >= 100 && (
                      <p className="text-sm text-green-600">✅ PCA execution completed successfully!</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historical Audits */}
            <Card>
              <CardHeader>
                <CardTitle>Historical PCA Audits</CardTitle>
                <CardDescription>Previous audit results and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pcaHistory.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${audit.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <div>
                          <h4 className="font-medium">{audit.id}</h4>
                          <p className="text-sm text-muted-foreground">{audit.date} • {audit.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{audit.violations} violations</p>
                          <p className="text-sm text-muted-foreground">Risk Score: {audit.score}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetrieveHistoricalReport(audit.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTypes.map((report) => {
                const IconComponent = report.icon;
                return (
                  <Card key={report.id} className={`cursor-pointer transition-all ${selectedReport === report.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`} onClick={() => handleReportSelect(report.id)}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{report.name}</CardTitle>
                          <CardDescription>{report.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); handleDownloadReport(report.id); }}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {selectedReport && (
              <Card>
                <CardHeader>
                  <CardTitle>Report Preview: {reportTypes.find(r => r.id === selectedReport)?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Report ID:</span> RPT-2025-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium">Generated:</span> {new Date().toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Period:</span> {executionConfig.period === 'custom' ? `${executionConfig.customRange.start} to ${executionConfig.customRange.end}` : executionConfig.period}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> <Badge className="bg-green-100 text-green-800">Ready</Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                      <p className="text-slate-500">Report preview would be displayed here</p>
                    </div>
                    <div className="flex gap-2">
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Download Full Report
                      </Button>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Evidence Export Tab */}
          <TabsContent value="evidence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evidence Export</CardTitle>
                <CardDescription>Export evidence packages for compliance and legal proceedings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="case-reference">Case Reference</Label>
                    <Input id="case-reference" placeholder="Enter case reference number" />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="export-format">Export Format</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Package</SelectItem>
                        <SelectItem value="zip">ZIP Archive</SelectItem>
                        <SelectItem value="secure">Secure Digital Package</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="evidence-types">Evidence Types</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Declaration Documents', 'Supporting Documents', 'AI Analysis Reports', 'Communication Logs', 'Audit Trails', 'Photographic Evidence', 'Financial Records', 'Compliance Certificates'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <input type="checkbox" id={`evidence-${type}`} className="rounded" defaultChecked />
                        <Label htmlFor={`evidence-${type}`} className="text-sm">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="additional-notes">Additional Notes</Label>
                  <Textarea id="additional-notes" placeholder="Enter any additional notes or requirements for the evidence package" rows={3} />
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleGenerateEvidencePackage}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Evidence Package
                  </Button>
                  <Button variant="outline" onClick={handlePreviewPackage}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Preview Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Country Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Country Configuration</CardTitle>
                  <CardDescription>Select country to configure its customs system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="country-select">Select Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GH">🇬🇭 Ghana - ICUMS</SelectItem>
                        <SelectItem value="NG">🇳🇬 Nigeria - Customs System</SelectItem>
                        <SelectItem value="KE">🇰🇪 Kenya - Customs System</SelectItem>
                        <SelectItem value="CN">🇨🇳 China - Customs System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Connection Status</p>
                      <p className="text-sm text-muted-foreground">Last sync: {countryConfigs[selectedCountry].lastSync}</p>
                    </div>
                    <Badge className={countryConfigs[selectedCountry].connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {countryConfigs[selectedCountry].connected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Country Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>{countryConfigs[selectedCountry].name}</CardTitle>
                  <CardDescription>Configure {selectedCountry === 'GH' ? 'ICUMS' : 'Customs System'} database connection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="server-url">Server URL</Label>
                    <Input id="server-url" defaultValue={countryConfigs[selectedCountry].serverUrl} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input id="api-key" type="password" defaultValue={countryConfigs[selectedCountry].apiKey} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sync-frequency">Sync Frequency</Label>
                    <Select defaultValue="realtime">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="5min">Every 5 minutes</SelectItem>
                        <SelectItem value="15min">Every 15 minutes</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Additional Country Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detection Engine</CardTitle>
                  <CardDescription>AI detection parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="sensitivity">Detection Sensitivity</Label>
                    <Select defaultValue="high">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="maximum">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="update-frequency">Model Update Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Multi-Country Settings</CardTitle>
                  <CardDescription>Configure multi-jurisdiction analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cross-border">Cross-Border Analysis</Label>
                      <Switch id="cross-border" defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="data-sharing">Data Sharing Between Countries</Label>
                      <Switch id="data-sharing" defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-countries">Default Analysis Countries</Label>
                    <div className="space-y-2">
                      {['GH', 'NG', 'KE', 'CN'].map((country) => (
                        <div key={country} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`default-${country}`}
                            defaultChecked={country === 'GH'}
                            className="rounded"
                          />
                          <Label htmlFor={`default-${country}`} className="flex items-center gap-1">
                            <span>{countryFlags[country]}</span>
                            <span className="text-sm">{country}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Report Viewer Dialog */}
        {reportViewerOpen && selectedHistoricalReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[80vh] overflow-y-auto m-4" id="report-content">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{selectedHistoricalReport.id} - Detailed Report</h2>
                  <Button variant="outline" onClick={() => setReportViewerOpen(false)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Audit Date</p>
                      <p className="font-medium">{selectedHistoricalReport.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Declaration Type</p>
                      <p className="font-medium uppercase">{selectedHistoricalReport.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Violations</p>
                      <p className="font-medium">{selectedHistoricalReport.violations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Risk Score</p>
                      <p className="font-medium">{selectedHistoricalReport.score}%</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Violation Analysis</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Value Under-declaration</h4>
                        <p className="text-sm text-muted-foreground">Primary violation type detected in {Math.round(selectedHistoricalReport.violations * 0.35)} cases</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Average Under-declaration</span>
                            <span className="font-medium">42.3%</span>
                          </div>
                          <Progress value={42.3} className="h-2" />
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">HS Code Misclassification</h4>
                        <p className="text-sm text-muted-foreground">Incorrect classification detected in {Math.round(selectedHistoricalReport.violations * 0.25)} cases</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Detection Rate</span>
                            <span className="font-medium">87.2%</span>
                          </div>
                          <Progress value={87.2} className="h-2" />
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Documentation Errors</h4>
                        <p className="text-sm text-muted-foreground">Missing or invalid documents in {Math.round(selectedHistoricalReport.violations * 0.20)} cases</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Compliance Rate</span>
                            <span className="font-medium">76.8%</span>
                          </div>
                          <Progress value={76.8} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">High Risk Shipments</h4>
                        <p className="text-2xl font-bold text-red-600">{Math.round(selectedHistoricalReport.violations * 0.15)}</p>
                        <p className="text-sm text-muted-foreground">Risk score &gt; 80%</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Recovery Amount</h4>
                        <p className="text-2xl font-bold text-green-600">${Math.round(selectedHistoricalReport.violations * 28473).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Estimated total recovery</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <p className="text-sm">Enhanced screening requirements for high-risk origin countries</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <p className="text-sm">Implementation of advanced HS Code verification system</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <p className="text-sm">Increased frequency of random physical inspections</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <p className="text-sm">Enhanced cross-border intelligence sharing</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={() => {
                    const content = document.getElementById('report-content').innerText;
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedHistoricalReport.id}-Detailed-Report.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Report
                  </Button>
                  <Button variant="outline" onClick={() => setReportViewerOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}