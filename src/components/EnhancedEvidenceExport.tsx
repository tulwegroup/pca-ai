// Enhanced Evidence Export and Reports Component
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download } from 'lucide-react';

interface EnhancedEvidenceExportProps {
  pcaHistory: any[];
  selectedCase: string;
  setSelectedCase: (caseId: string) => void;
  onGenerateReport: (caseId: string, reportType: string) => void;
  onGenerateEvidencePackage: () => void;
}

export function EnhancedEvidenceExport({ 
  pcaHistory, 
  selectedCase, 
  setSelectedCase, 
  onGenerateReport, 
  onGenerateEvidencePackage 
}: EnhancedEvidenceExportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence Export & Reports</CardTitle>
        <CardDescription>Export evidence packages and generate case-specific reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Case Selection for Reports */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Select Audit Case for Reports</Label>
          <Select onValueChange={setSelectedCase}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a completed case" />
            </SelectTrigger>
            <SelectContent>
              {pcaHistory.filter(c => c.status === 'completed').map((auditCase) => (
                <SelectItem key={auditCase.id} value={auditCase.id}>
                  {auditCase.name} ({auditCase.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Report Generation */}
        {selectedCase && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Generate Reports for: {pcaHistory.find(c => c.id === selectedCase)?.name}</h4>
              <Badge variant="outline" className="text-blue-600">
                Case ID: {selectedCase}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['executive-summary', 'detailed-violations', 'declarant-communications', 'statistical-analysis', 'compliance-certificate'].map((reportType) => (
                <Button
                  key={reportType}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => onGenerateReport(selectedCase, reportType)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {reportType.charAt(0).toUpperCase() + reportType.slice(1).replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Evidence Package Export */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Evidence Package Export</h4>
            <Badge variant="outline" className="text-green-600">
              {selectedCase ? `Case: ${selectedCase}` : 'No case selected'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="case-reference">Case Reference</Label>
              <Input 
                id="case-reference" 
                placeholder="Enter case reference number" 
                value={selectedCase || ''}
                readOnly={!!selectedCase}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select defaultValue="secure">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Package</SelectItem>
                  <SelectItem value="zip">ZIP Archive</SelectItem>
                  <SelectItem value="secure">Secure Digital Package</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence-types">Evidence Types</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Declaration Documents', 'Supporting Documents', 'AI Analysis Reports', 'Communication Logs', 'Audit Trails', 'Photographic Evidence', 'Financial Records', 'Compliance Certificates'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id={`evidence-${type}`} 
                    className="rounded" 
                    defaultChecked={['Declaration Documents', 'AI Analysis Reports', 'Audit Trails'].includes(type)}
                  />
                  <Label htmlFor={`evidence-${type}`} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-notes">Additional Notes</Label>
            <Textarea 
              id="additional-notes" 
              placeholder="Enter any additional notes or requirements for evidence package" 
              rows={3} 
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={onGenerateEvidencePackage} disabled={!selectedCase}>
              <Download className="h-4 w-4 mr-2" />
              Generate Evidence Package
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Preview Package
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}