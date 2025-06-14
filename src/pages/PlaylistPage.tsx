
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
    toggleFavorite,
    toggleInPlaylist
  } = useTrackStateContext();

  // Playlist stations are those with inPlaylist === true
  const playlistStations = tracks.filter(track => track.inPlaylist);

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
      const idx = tracks.findIndex(t => t.url === stationToDelete.url);
      if (idx !== -1) {
        toggleInPlaylist(idx);
        toast({
          title: "Station removed from playlist",
          description: `${stationToDelete.name} was removed from your playlist.`
        });
      }
      setStationToDelete(null);
    }
  };

  const handleToggleFavorite = (station: Track) => {
    const idx = tracks.findIndex(t => t.url === station.url);
    if (idx !== -1) {
      toggleFavorite(idx);
    }
  };

  const handleToggleInPlaylist = (station: Track) => {
    const idx = tracks.findIndex(t => t.url === station.url);
    if (idx !== -1) {
      toggleInPlaylist(idx);
    }
  };

  const handleClearAll = () => {
    setShowClearDialog(true);
  };

  const confirmClearAll = () => {
    // FIXED: Don't stop playback when clearing playlist - just remove from playlist view
    let countCleared = 0;
    tracks.forEach((station, idx) => {
      if (station.inPlaylist) {
        toggleInPlaylist(idx);
        countCleared++;
      }
    });

    // The currently playing station will continue playing, it's just no longer in the playlist view
    console.log("Cleared", countCleared, "stations from playlist. Player continues with current station.");

    toast({
      title: "Playlist cleared",
      description: `${
        countCleared === 0
          ? "No stations were"
          : countCleared + " station" + (countCleared === 1 ? " was" : "s were")
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
      <div className={`w-full max-w-none space-y-6 transition-opacity duration-300 ease-in-out pt-4 ${isPageReady ? 'opacity-100' : 'opacity-0'}`}>
        <PlaylistContent
          stations={playlistStations}
          currentIndex={currentIndex}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onSelectStation={handleSelectStation}
          onEditStation={handleEditStation}
          onConfirmDelete={handleConfirmDelete}
          onToggleFavorite={handleToggleFavorite}
          onToggleInPlaylist={handleToggleInPlaylist}
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
