
import React from "react";
import { Track } from "@/types/track";
import StationCard from "./StationCard";

interface StationGridProps {
  stations: Track[];
  gridCols: string;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const StationGrid: React.FC<StationGridProps> = ({ 
  stations, 
  gridCols, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className={`grid ${gridCols} gap-4 mb-6`}>
      {stations.map((station, index) => (
        <StationCard
          key={`${station.url}-${index}`}
          station={station}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default StationGrid;
