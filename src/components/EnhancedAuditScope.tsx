// Enhanced Audit Scope Component
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';

interface EnhancedAuditScopeProps {
  executionConfig: any;
  setExecutionConfig: (config: any) => void;
}

export function EnhancedAuditScope({ executionConfig, setExecutionConfig }: EnhancedAuditScopeProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Audit Scope</Label>
        <Badge variant="outline" className="text-blue-600">
          <Target className="h-3 w-3 mr-1" />
          Flexible Targeting
        </Badge>
      </div>
      <Select value={executionConfig.auditScope} onValueChange={(value) => setExecutionConfig({...executionConfig, auditScope: value})}>
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

      {/* Conditional Filters Based on Scope */}
      {executionConfig.auditScope === 'hs-codes' && (
        <div className="space-y-2">
          <Label>HS Codes (comma-separated)</Label>
          <Input
            placeholder="e.g., 27101990, 27090010, 27111200"
            value={executionConfig.hsCodes.join(', ')}
            onChange={(e) => setExecutionConfig(prev => ({
              ...prev,
              hsCodes: e.target.value.split(',').map(code => code.trim()).filter(code => code)
            }))}
          />
        </div>
      )}

      {executionConfig.auditScope === 'shipments' && (
        <div className="space-y-2">
          <Label>Shipment IDs (comma-separated)</Label>
          <Input
            placeholder="e.g., BL-2025-0892, BL-2025-0893"
            value={executionConfig.shipmentIds.join(', ')}
            onChange={(e) => setExecutionConfig(prev => ({
              ...prev,
              shipmentIds: e.target.value.split(',').map(id => id.trim()).filter(id => id)
            }))}
          />
        </div>
      )}

      {executionConfig.auditScope === 'declarations' && (
        <div className="space-y-2">
          <Label>Declaration IDs (comma-separated)</Label>
          <Input
            placeholder="e.g., DECL-2025-001, DECL-2025-002"
            value={executionConfig.declarationIds.join(', ')}
            onChange={(e) => setExecutionConfig(prev => ({
              ...prev,
              declarationIds: e.target.value.split(',').map(id => id.trim()).filter(id => id)
            }))}
          />
        </div>
      )}

      {/* Sectoral Focus */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Sectoral Focus (Optional)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['petroleum', 'textiles', 'vehicles'].map((sector) => (
            <div key={sector} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`sector-${sector}`}
                checked={executionConfig.sectoralFocus.includes(sector)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setExecutionConfig(prev => ({
                      ...prev,
                      sectoralFocus: [...prev.sectoralFocus, sector]
                    }));
                  } else {
                    setExecutionConfig(prev => ({
                      ...prev,
                      sectoralFocus: prev.sectoralFocus.filter(s => s !== sector)
                    }));
                  }
                }}
                className="rounded"
              />
              <Label htmlFor={`sector-${sector}`} className="text-sm capitalize">{sector}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}