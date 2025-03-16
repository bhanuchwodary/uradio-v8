
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ImportCsvDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (stations: Array<{ name: string; url: string }>) => void;
}

const ImportCsvDialog: React.FC<ImportCsvDialogProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Array<{ name: string; url: string }>>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (csvFile: File) => {
    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/);
        const stations: Array<{ name: string; url: string }> = [];
        
        // Skip header if it exists and process each line
        const startIndex = lines[0].toLowerCase().includes('name') && lines[0].toLowerCase().includes('url') ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Support both comma and semicolon delimiters
          const delimiter = line.includes(',') ? ',' : ';';
          const parts = line.split(delimiter);
          
          if (parts.length >= 2) {
            const name = parts[0].trim();
            const url = parts[1].trim();
            
            // Basic URL validation
            try {
              new URL(url);
              stations.push({ name, url });
            } catch (e) {
              console.warn(`Invalid URL in CSV at line ${i + 1}: ${url}`);
            }
          }
        }
        
        if (stations.length === 0) {
          setError("No valid stations found in the CSV file. Make sure the format is correct (name,url).");
        } else {
          setPreview(stations.slice(0, 5)); // Preview first 5 stations
        }
        
      } catch (error) {
        setError("Failed to parse CSV file. Please check the format and try again.");
        console.error("CSV parsing error:", error);
      }
      
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
      setIsLoading(false);
    };
    
    reader.readAsText(csvFile);
  };

  const handleImport = () => {
    if (!file) return;
    
    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/);
        const stations: Array<{ name: string; url: string }> = [];
        
        // Skip header if it exists
        const startIndex = lines[0].toLowerCase().includes('name') && lines[0].toLowerCase().includes('url') ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const delimiter = line.includes(',') ? ',' : ';';
          const parts = line.split(delimiter);
          
          if (parts.length >= 2) {
            const name = parts[0].trim();
            const url = parts[1].trim();
            
            try {
              new URL(url);
              stations.push({ name, url });
            } catch (e) {
              // Skip invalid URLs
            }
          }
        }
        
        if (stations.length > 0) {
          onImport(stations);
          toast({
            title: "Import Successful",
            description: `Imported ${stations.length} stations from CSV`,
          });
          onClose();
        } else {
          setError("No valid stations found in the CSV file.");
        }
        
      } catch (error) {
        setError("Failed to parse CSV file. Please check the format and try again.");
      }
      
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Stations from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with station names and URLs. 
            Format: "Station Name,https://example.com/stream.mp3"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-slate-100/10 transition-colors"
            onClick={() => document.getElementById('csv-file-input')?.click()}
          >
            <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">
              {file ? file.name : 'Click to select CSV file'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'CSV with name,url format'}
            </p>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Preview:</p>
              <div className="max-h-40 overflow-y-auto rounded-md bg-secondary/20 p-2">
                {preview.map((station, idx) => (
                  <div key={idx} className="flex items-center gap-2 py-1">
                    <Check className="h-4 w-4 text-green-500" />
                    <div className="text-sm">
                      <span className="font-medium">{station.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{station.url}</span>
                    </div>
                  </div>
                ))}
                {preview.length < 5 ? null : <div className="text-xs text-center mt-1">+ more stations</div>}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || isLoading || !!error}
          >
            {isLoading ? 'Importing...' : 'Import Stations'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCsvDialog;
