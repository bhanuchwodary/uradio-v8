
import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { Track } from "@/types/track";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import PlaylistContent from "@/components/playlist/PlaylistContent";
import PlaylistDialogs from "@/components/playlist/PlaylistDialogs";
import { PlaylistMusicPlayer } from "@/components/playlist/PlaylistMusicPlayer";

const PlaylistPage: React.FC = () => {
  const { toast } = useToast();
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Track | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  // Core state from context - do not change!
  const {
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    editStationByValue,
    removeStationByValue,
    toggleFavorite,
    toggleInPlaylist,
    clearAllFromPlaylist
  } = useTrackStateContext();

  // -- PLAYLIST MANAGEMENT --
  // Always derive playlist stations from core tracks
  const playlistStations: Track[] = useMemo(
    () => tracks.filter(t => t.inPlaylist),
    [tracks]
  );

  // Map global currentIndex (in tracks) to its index in playlistStations (if present)
  function getPlaylistIndexForCurrent() {
    if (currentIndex < 0) return 0;
    // Use url match for mapping
    const idx = playlistStations.findIndex(st => st.url === (tracks[currentIndex]?.url));
    return idx >= 0 ? idx : 0;
  }

  // Local index for navigating inside the playlist ONLY
  const [playlistIndex, setPlaylistIndex] = useState(getPlaylistIndexForCurrent());

  // Whenever playlistStations or currentIndex changes, resync playlistIndex
  useEffect(() => {
    setPlaylistIndex(getPlaylistIndexForCurrent());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, currentIndex, playlistStations.length]);

  // When switching playlistIndex (player navigation) -> update core selection to correct track
  const handleSelectPlaylistStation = (plIndex: number) => {
    // Get the selected station's url
    const station = playlistStations[plIndex];
    if (station) {
      // Find in the master tracks array for core selection/playback
      const masterIdx = tracks.findIndex(st => st.url === station.url);
      if (masterIdx !== -1) {
        setCurrentIndex(masterIdx);
        setIsPlaying(true);
      }
      setPlaylistIndex(plIndex);
    }
  };

  // All navigation (next/prev/play) inside player uses setPlaylistIndex (playlist bounds only)
  // Only explicit selections update actual setCurrentIndex for app-wide state.
  // Playlist player is totally isolated from tracks not in the playlist!

  // Triggered by grid "Play" button
  const handleSelectStation = (stationIndex: number, stationList: typeof tracks) => {
    // Always play ONLY from playlistStations
    const station = stationList[stationIndex];
    if (station) {
      const plIdx = playlistStations.findIndex(s => s.url === station.url);
      if (plIdx !== -1) {
        handleSelectPlaylistStation(plIdx);
      }
    }
  };

  const currentPlaylistTrack = playlistStations[playlistIndex] || null;

  const handleEditStation = (station: Track) => setEditingStation(station);
  const handleConfirmDelete = (station: Track) => setStationToDelete(station);
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
    if (idx !== -1) toggleFavorite(idx);
  };
  const handleToggleInPlaylist = (station: Track) => {
    const idx = tracks.findIndex(t => t.url === station.url);
    if (idx !== -1) toggleInPlaylist(idx);
  };

  const handleClearAll = () => setShowClearDialog(true);
  const confirmClearAll = () => {
    if (clearAllFromPlaylist) {
      const countCleared = playlistStations.length;
      clearAllFromPlaylist();
      toast({
        title: "Playlist cleared",
        description: `${countCleared === 0 ? "No stations were" : countCleared + " station" + (countCleared === 1 ? " was" : "s were")} removed from your playlist.`,
      });
    }
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

  useEffect(() => {
    const timer = setTimeout(() => setIsPageReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLayout>
      <div className={`w-full max-w-none space-y-6 transition-opacity duration-300 ease-in-out pt-4 ${isPageReady ? 'opacity-100' : 'opacity-0'}`}>
        <PlaylistContent
          stations={playlistStations}
          currentIndex={playlistIndex}
          currentTrack={currentPlaylistTrack}
          isPlaying={isPlaying}
          onSelectStation={handleSelectStation}
          onEditStation={handleEditStation}
          onConfirmDelete={handleConfirmDelete}
          onToggleFavorite={handleToggleFavorite}
          onToggleInPlaylist={handleToggleInPlaylist}
          onClearAll={handleClearAll}
        />
        {/* NEW: Isolated Playlist Music Player, works ONLY with in-playlist stations */}
        <PlaylistMusicPlayer
          playlistStations={playlistStations}
          currentPlaylistIndex={playlistIndex}
          setCurrentPlaylistIndex={setPlaylistIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
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

