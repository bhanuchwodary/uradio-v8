
import React from "react";
import { EnhancedAppLayout } from "@/components/layout/EnhancedAppLayout";
import { useTrackStateContext } from "@/context/TrackStateContext";
import EnhancedFavoritesSection from "@/components/home/EnhancedFavoritesSection";
import EnhancedStationsTabsSection from "@/components/home/EnhancedStationsTabsSection";
import HomePageDialogs from "@/components/home/HomePageDialogs";
import { AnimatePresence } from "framer-motion";
import { useHomePageState } from "@/hooks/useHomePageState";
import PlayerSection from "@/components/home/sections/PlayerSection";

const Index: React.FC = () => {
  const { 
    tracks, 
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    currentTrack,
    favoriteStations,
    popularStations,
    userStations,
    prebuiltStations,
    editingStation,
    stationToDelete,
    handleSelectStation,
    handleToggleFavorite,
    handleToggleCurrentFavorite,
    handleEditStation,
    handleConfirmDelete,
    handleDeleteStation,
    handleSaveEdit,
    setEditingStation,
    setStationToDelete
  } = useHomePageState();

  return (
    <EnhancedAppLayout>
      <div className="space-y-6">
        {/* Player Card */}
        <PlayerSection
          tracks={tracks}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          setCurrentIndex={setCurrentIndex}
          setIsPlaying={setIsPlaying}
          currentTrack={currentTrack}
          onToggleFavorite={handleToggleCurrentFavorite}
        />

        {/* Favorites Section */}
        <AnimatePresence>
          {favoriteStations.length > 0 && (
            <EnhancedFavoritesSection 
              favoriteStations={favoriteStations}
              currentIndex={currentIndex}
              currentTrackUrl={currentTrack?.url}
              isPlaying={isPlaying}
              onSelectStation={handleSelectStation}
              onToggleFavorite={handleToggleFavorite}
              onDeleteStation={handleConfirmDelete}
            />
          )}
        </AnimatePresence>
        
        {/* All Stations Section with Tabs */}
        <EnhancedStationsTabsSection
          popularStations={popularStations}
          userStations={userStations}
          prebuiltStations={prebuiltStations}
          currentIndex={currentIndex}
          currentTrackUrl={currentTrack?.url}
          isPlaying={isPlaying}
          onSelectStation={handleSelectStation}
          onEditStation={handleEditStation}
          onDeleteStation={handleConfirmDelete}
          onToggleFavorite={handleToggleFavorite}
        />
        
        {/* Dialogs for editing and deleting */}
        <HomePageDialogs 
          editingStation={editingStation}
          stationToDelete={stationToDelete}
          onCloseEditDialog={() => setEditingStation(null)}
          onSaveEdit={handleSaveEdit}
          onCloseDeleteDialog={() => setStationToDelete(null)}
          onConfirmDelete={handleDeleteStation}
        />
      </div>
    </EnhancedAppLayout>
  );
};

export default Index;
