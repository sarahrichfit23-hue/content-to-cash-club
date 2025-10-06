import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { FileJson, FileText, FileSpreadsheet, Download } from 'lucide-react';

interface ExportDialogProps {
  contentIds: string[];
  folderId?: string;
  onClose: () => void;
}

export default function ExportDialog({ contentIds, folderId, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState('json');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    try {
      const { data, error } = await supabase.functions.invoke('export-content', {
        body: {
          format,
          contentIds: contentIds.length > 0 ? contentIds : undefined,
          folderId
        }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 
              format === 'csv' ? 'text/csv' : 
              'text/plain'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-export.${format === 'pdf' ? 'txt' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({ title: 'Content exported successfully' });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center cursor-pointer">
                  <FileJson className="w-4 h-4 mr-2" />
                  JSON - Complete data with all metadata
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  CSV - Spreadsheet compatible format
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                  <FileText className="w-4 h-4 mr-2" />
                  Text - Plain text format
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="text-sm text-gray-600">
            {contentIds.length > 0 
              ? `Exporting ${contentIds.length} selected item${contentIds.length > 1 ? 's' : ''}`
              : folderId 
                ? 'Exporting all content from folder'
                : 'Exporting all content'
            }
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>Exporting...</>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
