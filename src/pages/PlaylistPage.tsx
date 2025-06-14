
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { Track } from "@/types/track";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import PlaylistContent from "@/components/playlist/PlaylistContent";
import PlaylistDialogs from "@/components/playlist/PlaylistDialogs";

const PlaylistPage: React.FC = () => {
  const { toast } = useToast();
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Track | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  
  const { 
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    editStationByValue,
    removeStationByValue,
    toggleFavorite
  } = useTrackStateContext();
  
  // Make sure playlist only shows FAVORITES and FEATURED (no user station unless favorite or featured)
  const favoriteStations = tracks.filter(track => track.isFavorite);
  const featuredStations = tracks.filter(track => track.isFeatured);

  // userStations for playlist, only include favorites (not ALL user stations)
  const userStations = tracks.filter(track => !track.isFeatured && track.isFavorite);

  // Calculate popular (favorites or featured, in case you use this elsewhere)
  const popularStations = [...tracks]
    .filter(track => track.isFavorite || track.isFeatured)
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 8);

  // Gather ALL stations shown in the playlist (just like in PlaylistContent)
  // But strictly: unique combination of only favorite and featured
  const allPlaylistStations = [
    ...favoriteStations,
    ...popularStations,
    ...featuredStations
  ];

  // Remove duplicates based on URL
  const uniquePlaylistStations = allPlaylistStations.filter(
    (station, index, self) =>
      index === self.findIndex(s => s.url === station.url)
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const currentTrack = tracks[currentIndex] || null;

  const handleSelectStation = (stationIndex: number, stationList: typeof tracks) => {
    const mainIndex = tracks.findIndex(t => t.url === stationList[stationIndex].url);
    if (mainIndex !== -1) {
      if (mainIndex === currentIndex && isPlaying) {
        setIsPlaying(false);
      } else {
        setCurrentIndex(mainIndex);
        setIsPlaying(true);
      }
    }
  };
  
  const handleEditStation = (station: Track) => {
    setEditingStation(station);
  };

  const handleConfirmDelete = (station: Track) => {
    setStationToDelete(station);
  };
  
  const handleDeleteStation = () => {
    if (stationToDelete) {
      const stationName = stationToDelete.name;
      if (!stationToDelete.isFeatured) {
        toast({
          title: "Can't remove user station from playlist",
          description: `${stationName} will stay available in your stations`,
          variant: "destructive"
        });
      } else {
        removeStationByValue(stationToDelete);
        toast({
          title: "Station removed",
          description: `${stationName} has been removed from your playlist`
        });
      }
      setStationToDelete(null);
    }
  };

  const handleToggleFavorite = (station: Track) => {
    const index = tracks.findIndex(t => t.url === station.url);
    if (index !== -1) {
      toggleFavorite(index);
    }
  };

  const handleClearAll = () => {
    setShowClearDialog(true);
  };

  const confirmClearAll = () => {
    // Unfavorite all stations that are favorites (this will clear playlist view)
    let countUnfavorited = 0;

    tracks.forEach((station, idx) => {
      if (station.isFavorite) {
        toggleFavorite(idx);
        countUnfavorited++;
      }
    });

    toast({
      title: "Playlist cleared",
      description: `${
        countUnfavorited === 0
          ? "No stations were"
          : countUnfavorited + " station" + (countUnfavorited === 1 ? " was" : "s were")
      } removed from your playlist.`,
    });

    setShowClearDialog(false);
  };

  const handleSaveEdit = (data: { url: string; name: string }) => {
    if (editingStation) {
      editStationByValue(editingStation, data);
      toast({
        title: "Station updated",
        description: `"${data.name}" has been updated`,
      });
      setEditingStation(null);
    }
  };

  return (
    <AppLayout>
      <div className={`container mx-auto max-w-5xl space-y-6 transition-opacity duration-300 ease-in-out pt-4 ${isPageReady ? 'opacity-100' : 'opacity-0'}`}>
        <PlaylistContent
          userStations={userStations}
          featuredStations={featuredStations}
          favoriteStations={favoriteStations}
          popularStations={popularStations}
          currentIndex={currentIndex}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onSelectStation={handleSelectStation}
          onEditStation={handleEditStation}
          onConfirmDelete={handleConfirmDelete}
          onToggleFavorite={handleToggleFavorite}
          onClearAll={handleClearAll}
        />
        <PlaylistDialogs
          editingStation={editingStation}
          stationToDelete={stationToDelete}
          onCloseEditDialog={() => setEditingStation(null)}
          onSaveEdit={handleSaveEdit}
          onCloseDeleteDialog={() => setStationToDelete(null)}
          onConfirmDelete={handleDeleteStation}
        />
        {showClearDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Clear All Stations</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to remove all stations from your playlist? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmClearAll}>
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PlaylistPage;
