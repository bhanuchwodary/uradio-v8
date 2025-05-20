
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Track } from "@/types/track";

interface StationCardProps {
  station: Track;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const StationCard: React.FC<StationCardProps> = ({ station, index, onEdit, onDelete }) => {
  return (
    <div className="flex flex-col p-4 rounded-lg bg-background/60 backdrop-blur-sm hover:bg-background/80 material-shadow-1 hover:material-shadow-2 material-transition">
      <div className="flex-1">
        <h3 className="font-medium text-foreground line-clamp-2 mb-1">
          {station.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
          {station.language || "Unknown"}
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-blue-500 hover:text-blue-700"
          onClick={() => onEdit(index)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700"
          onClick={() => onDelete(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StationCard;
