
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ImportStationsFromCsvProps {
  onImport: (stations: Array<{ name: string; url: string }>) => void;
}

const ImportStationsFromCsv: React.FC<ImportStationsFromCsvProps> = ({ onImport }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const stations = lines
          .filter(line => line.trim()) // Skip empty lines
          .map(line => {
            const [name, url] = line.split(',').map(item => item.trim());
            if (!name || !url) {
              throw new Error('Invalid CSV format');
            }
            return { name, url };
          });

        onImport(stations);
        toast({
          title: "Stations imported",
          description: `Successfully imported ${stations.length} stations`,
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Please make sure your CSV file has two columns: name and URL",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        event.target.value = ''; // Reset file input
      }
    };

    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "Error reading the file",
        variant: "destructive",
      });
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Import stations from a CSV file. The file should have two columns: name and URL.
      </p>
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload"
          disabled={isProcessing}
        />
        <label htmlFor="csv-upload">
          <Button
            variant="outline"
            className="cursor-pointer bg-white/20 backdrop-blur-sm border-none"
            disabled={isProcessing}
            asChild
          >
            <span>
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : "Import from CSV"}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
};

export default ImportStationsFromCsv;
