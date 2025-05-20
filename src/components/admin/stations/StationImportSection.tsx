
import React from "react";
import ImportStationsFromCsv from "@/components/ImportStationsFromCsv";

interface StationImportSectionProps {
  onImport: (stations: Array<{ name: string; url: string; language?: string }>) => void;
}

const StationImportSection: React.FC<StationImportSectionProps> = ({ onImport }) => {
  return (
    <div className="mb-6 p-4 rounded-lg bg-background/60 backdrop-blur-sm">
      <h3 className="text-lg font-medium mb-2">Import Stations</h3>
      <ImportStationsFromCsv onImport={onImport} />
    </div>
  );
};

export default StationImportSection;
