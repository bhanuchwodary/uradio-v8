
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import PlaylistContent from "@/components/playlist/PlaylistContent";
import PlaylistDialogs from "@/components/playlist/PlaylistDialogs";
import ClearAllDialog from "@/components/playlist/ClearAllDialog";
import { usePlaylistState } from "@/hooks/usePlaylistState";
import { usePlaylistHandlers } from "@/hooks/usePlaylistHandlers";

const PlaylistPage: React.FC = () => {
  const {
    editingStation,
    setEditingStation,
    stationToDelete,
    setStationToDelete,
    showClearDialog,
    setShowClearDialog,
    isPageReady,
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    toggleFavorite,
    userStations,
    featuredStations,
    favoriteStations,
    popularStations,
    currentTrack
  } = usePlaylistState();

  const {
    handleSelectStation,
    handleEditStation,
    handleConfirmDelete,
    handleDeleteStation,
    handleToggleFavorite,
    handleClearAll,
    confirmClearAll,
    handleSaveEdit
  } = usePlaylistHandlers({
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    toggleFavorite,
    setEditingStation,
    setStationToDelete,
    setShowClearDialog
  });

  // Show loading spinner while page is initializing
  if (!isPageReady) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-5xl flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading your playlist..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={`container mx-auto max-w-5xl space-y-6 pt-4 page-transition ${isPageReady ? 'page-enter-active' : 'page-enter'}`}>
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
          onSaveEdit={(data) => handleSaveEdit(data, editingStation)}
          onCloseDeleteDialog={() => setStationToDelete(null)}
          onConfirmDelete={() => handleDeleteStation(stationToDelete)}
        />
        
        {/* Clear All Confirmation Dialog */}
        <ClearAllDialog
          isOpen={showClearDialog}
          onClose={() => setShowClearDialog(false)}
          onConfirm={confirmClearAll}
        />
      </div>
    </AppLayout>
  );
};

export default PlaylistPage;
