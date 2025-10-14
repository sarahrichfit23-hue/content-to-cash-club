import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
}

interface Mapping {
  email: string;
  name: string;
  phone: string;
  tags: string;
}

interface SubscriberImportProps {
  onImportComplete?: () => void;
}

export default function SubscriberImport({
  onImportComplete,
}: SubscriberImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({
    email: "",
    name: "",
    phone: "",
    tags: "",
  });
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  // 🧾 Parse CSV file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = (event.target?.result as string)?.trim();
      if (!text) {
        toast({
          title: "Invalid File",
          description: "The uploaded file appears to be empty.",
          variant: "destructive",
        });
        return;
      }

      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      const firstRow = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      setHeaders(firstRow);

      // Auto-map based on header names
      const autoMapping: Mapping = {
        email:
          firstRow.find((h) => h.toLowerCase().includes("email")) || "",
        name: firstRow.find((h) => h.toLowerCase().includes("name")) || "",
        phone:
          firstRow.find((h) => h.toLowerCase().includes("phone")) || "",
        tags: firstRow.find((h) => h.toLowerCase().includes("tag")) || "",
      };
      setMapping(autoMapping);

      // Parse preview (first 5 rows)
      const preview = lines.slice(1, 6).map((line) => {
        const cols = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        return firstRow.reduce((obj, key, idx) => {
          obj[key] = cols[idx] || "";
          return obj;
        }, {} as Record<string, string>);
      });

      setCsvData(preview);
    };

    reader.readAsText(uploadedFile);
  };

  // 🚀 Import to Supabase via Edge Function
  const handleImport = async () => {
    if (!file || !mapping.email) {
      toast({
        title: "Error",
        description: "Please select a CSV file and map the email column.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvContent = event.target?.result as string;

        try {
          const { data, error } = await supabase.functions.invoke(
            "subscriber-operations",
            {
              body: {
                action: "import_csv",
                data: {
                  csvContent,
                  mapping: {
                    email: headers.indexOf(mapping.email),
                    name: mapping.name
                      ? headers.indexOf(mapping.name)
                      : null,
                    phone: mapping.phone
                      ? headers.indexOf(mapping.phone)
                      : null,
                    tags: mapping.tags ? headers.indexOf(mapping.tags) : null,
                  },
                },
              },
            }
          );

          if (error) throw error;
          if (!data) throw new Error("No data returned from import function");

          setImportResult(data as ImportResult);
          toast({
            title: "✅ Import Complete",
            description: `Successfully imported ${data.imported} subscribers.`,
          });

          onImportComplete?.();
        } catch (err: any) {
          console.error("❌ Import failed:", err);
          toast({
            title: "Import Failed",
            description:
              err.message || "Unable to import subscribers. Please verify file format.",
            variant: "destructive",
          });
        } finally {
          setImporting(false);
        }
      };

      reader.readAsText(file);
    } catch (err) {
      console.error("❌ Unexpected import error:", err);
      toast({
        title: "Unexpected Error",
        description:
          "An unexpected error occurred during import. Please try again.",
        variant: "destructive",
      });
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📤 Import Subscribers from CSV</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Upload Section */}
          <div>
            <Label htmlFor="csv-file">Select CSV File</Label>
            <div className="mt-2">
              <label htmlFor="csv-file" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Column Mapping */}
          {headers.length > 0 && (
            <>
              <div className="space-y-3">
                <Label>Column Mapping</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(["email", "name", "phone", "tags"] as (keyof Mapping)[]).map(
                    (key) => (
                      <div key={key}>
                        <Label className="text-sm capitalize">
                          {key === "email" ? `${key} *` : key}
                        </Label>
                        <Select
                          value={mapping[key]}
                          onValueChange={(v) =>
                            setMapping({ ...mapping, [key]: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={`Select ${key} column`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {key !== "email" && (
                              <SelectItem value="">None</SelectItem>
                            )}
                            {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div>
                <Label>Preview</Label>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Phone</th>
                        <th className="px-4 py-2 text-left">Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center text-gray-400 py-4 italic"
                          >
                            No preview data
                          </td>
                        </tr>
                      ) : (
                        csvData.map((row, i) => (
                          <tr
                            key={i}
                            className="border-t hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-2">
                              {mapping.email && row[mapping.email]}
                            </td>
                            <td className="px-4 py-2">
                              {mapping.name && row[mapping.name]}
                            </td>
                            <td className="px-4 py-2">
                              {mapping.phone && row[mapping.phone]}
                            </td>
                            <td className="px-4 py-2">
                              {mapping.tags && row[mapping.tags]}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              {importResult.imported > 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>
                    {importResult.imported} subscribers successfully imported
                  </span>
                </div>
              )}
              {importResult.skipped > 0 && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{importResult.skipped} rows skipped</span>
                </div>
              )}
              {importResult.errors > 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span>{importResult.errors} errors encountered</span>
                </div>
              )}
            </div>
          )}

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={!file || !mapping.email || importing}
            className="w-full"
          >
            {importing ? "Importing..." : "Import Subscribers"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
