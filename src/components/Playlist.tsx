
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlaylistProps {
  urls: string[];
  currentIndex: number;
  onSelectTrack: (index: number) => void;
  onRemoveTrack: (index: number) => void;
}

const Playlist: React.FC<PlaylistProps> = ({
  urls,
  currentIndex,
  onSelectTrack,
  onRemoveTrack,
}) => {
  if (urls.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No tracks added. Add a URL to get started.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[250px] pr-4">
      <div className="space-y-2">
        {urls.map((url, index) => {
          const isActive = index === currentIndex;
          let displayUrl;
          try {
            const urlObj = new URL(url);
            // Get the file name from the path
            displayUrl = urlObj.pathname.split('/').pop() || url;
          } catch (e) {
            displayUrl = url;
          }

          return (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded-md ${
                isActive
                  ? "bg-primary/20 backdrop-blur-sm"
                  : "bg-white/10 backdrop-blur-sm hover:bg-white/20"
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onSelectTrack(index)}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <span className="truncate text-sm">
                  {index + 1}. {displayUrl}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-700"
                onClick={() => onRemoveTrack(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default Playlist;
