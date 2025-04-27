
import React from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AddUrlForm from "@/components/AddUrlForm";
import ImportStationsFromCsv from "@/components/ImportStationsFromCsv";
import { Track } from "@/types/track";

interface AddStationPageProps {
  onAddStation: (url: string, name: string) => void;
  onImportStations: (stations: Array<{ name: string; url: string }>) => void;
}

const AddStationPage: React.FC<AddStationPageProps> = ({
  onAddStation,
  onImportStations,
}) => {
  const navigate = useNavigate();

  const handleAddStation = (url: string, name: string) => {
    onAddStation(url, name);
    navigate("/station-list");
  };

  const handleImportStations = (stations: Array<{ name: string; url: string }>) => {
    onImportStations(stations);
    navigate("/station-list");
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <Navigation />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">Add New Station</h1>
        <div className="space-y-6">
          <AddUrlForm onAddUrl={handleAddStation} />
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or import multiple stations
              </span>
            </div>
          </div>
          <ImportStationsFromCsv onImport={handleImportStations} />
        </div>
      </div>
    </div>
  );
};

export default AddStationPage;
