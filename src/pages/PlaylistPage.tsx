
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
    clearPlaylist // FIXED: Use the new clearPlaylist function
  } = useTrackStateContext();
  
  // Split stations into different categories - ensure proper filtering
  const userStations = tracks.filter(track => !track.isFeatured);
  const featuredStations = tracks.filter(track => track.isFeatured);
  const favoriteStations = tracks.filter(track => track.isFavorite);
  
  // Calculate popular stations based on play time
  const popularStations = [...tracks]
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 8);
  
  // Add effect for smooth transition on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate current track
  const currentTrack = tracks[currentIndex] || null;
  
  // Handle selecting a station from a grid with pause functionality
  const handleSelectStation = (stationIndex: number, stationList: typeof tracks) => {
    // Find the corresponding index in the full tracks list
    const mainIndex = tracks.findIndex(t => t.url === stationList[stationIndex].url);
    if (mainIndex !== -1) {
      // If clicking on the currently playing station, toggle pause/play
      if (mainIndex === currentIndex && isPlaying) {
        setIsPlaying(false);
      } else {
        setCurrentIndex(mainIndex);
        setIsPlaying(true);
      }
    }
  };
  
  // Edit station handler
  const handleEditStation = (station: Track) => {
    setEditingStation(station);
  };
  
  // Open the delete confirmation dialog for a station
  const handleConfirmDelete = (station: Track) => {
    setStationToDelete(station);
  };
  
  // Handle actual deletion after confirmation
  const handleDeleteStation = () => {
    if (stationToDelete) {
      const stationName = stationToDelete.name;
      removeStationByValue(stationToDelete);
      toast({
        title: "Station removed",
        description: `${stationName} has been removed from your playlist`
      });
      setStationToDelete(null);
    }
  };
  
  // Toggle favorite for a station
  const handleToggleFavorite = (station: Track) => {
    const index = tracks.findIndex(t => t.url === station.url);
    if (index !== -1) {
      toggleFavorite(index);
    }
  };
  
  // Clear all stations from playlist
  const handleClearAll = () => {
    setShowClearDialog(true);
  };
  
  // FIXED: Clear all function now uses the new clearPlaylist function
  const confirmClearAll = () => {
    console.log("PlaylistPage - Clearing playlist using clearPlaylist function");
    
    const remainingTracks = clearPlaylist();
    
    console.log("PlaylistPage - Playlist cleared, remaining tracks:", remainingTracks);
    
    toast({
      title: "Playlist cleared",
      description: `Your playlist has been cleared. Stations remain available on the Stations screen.`
    });
    setShowClearDialog(false);
  };
  
  // Save edited station
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
        {/* Playlist Content Component - Now unified layout */}
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
        
        {/* Dialogs Component */}
        <PlaylistDialogs
          editingStation={editingStation}
          stationToDelete={stationToDelete}
          onCloseEditDialog={() => setEditingStation(null)}
          onSaveEdit={handleSaveEdit}
          onCloseDeleteDialog={() => setStationToDelete(null)}
          onConfirmDelete={handleDeleteStation}
        />
        
        {/* FIXED: Clear All Confirmation Dialog with better messaging */}
        {showClearDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Clear Playlist</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to clear your playlist? This will remove all stations from your current playlist, but they will remain available on the Stations screen. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmClearAll}>
                  Clear Playlist
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
