
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useState } from "react";
import NotFound from "./pages/NotFound";
import PlaylistPage from "./pages/PlaylistPage";
import AddStationPage from "./pages/AddStationPage";
import StationListPage from "./pages/StationListPage";
import SettingsPage from "./pages/SettingsPage";
import Index from "./pages/Index";
import { Track } from "@/types/track";
import { useTrackState } from "./hooks/useTrackState";
import { TrackStateProvider } from "./context/TrackStateContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <TrackStateProvider>
            <AppRoutes />
          </TrackStateProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Separate component to use the context inside the provider
const AppRoutes = () => {
  const { 
    tracks, 
    addUrl, 
    toggleFavorite,
    getUserStations,
    removeStationByValue,
    editStationByValue,
    checkIfStationExists,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying
  } = useTrackState();
  
  const handleAddStation = (url: string, name: string) => {
    const stationCheck = checkIfStationExists(url);
    if (stationCheck.exists && !stationCheck.isUserStation) {
      return { success: false, message: "This station already exists in the prebuilt stations" };
    } else if (stationCheck.exists && stationCheck.isUserStation) {
      return { success: false, message: "This station already exists in your stations" };
    }
    
    const result = addUrl(url, name);
    return result;
  };
  
  const handleImportStations = (stations: Array<{ name: string; url: string }>) => {
    stations.forEach(station => {
      addUrl(station.url, station.name);
    });
  };
  
  const handleToggleFavorite = (station: Track) => {
    // Find the index of the station in tracks array
    const index = tracks.findIndex(t => t.url === station.url);
    if (index !== -1) {
      console.log(`Toggling favorite for station ${station.name} at index ${index}, current value: ${tracks[index].isFavorite}`);
      toggleFavorite(index);
    }
  };
  
  const handleAddToPlaylist = (station: Track) => {
    // Important: Make a complete copy of the station to ensure all properties are preserved
    console.log("Attempting to add/update station to playlist:", station);
    
    // Critical fix: EXPLICITLY pass the isFavorite status to preserve it
    const result = addUrl(station.url, station.name, station.isPrebuilt, station.isFavorite);
    
    console.log("Added/Updated station in playlist with favorite status:", station.isFavorite);
    return result;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <Index 
              currentIndex={currentIndex}
              isPlaying={isPlaying}
              setCurrentIndex={setCurrentIndex}
              setIsPlaying={setIsPlaying}
            />
          } 
        />
        <Route 
          path="/playlist" 
          element={
            <PlaylistPage 
              currentIndex={currentIndex}
              isPlaying={isPlaying}
              setCurrentIndex={setCurrentIndex}
              setIsPlaying={setIsPlaying}
            />
          } 
        />
        <Route 
          path="/add-station" 
          element={
            <AddStationPage 
              onAddStation={handleAddStation} 
              onImportStations={handleImportStations} 
            />
          } 
        />
        <Route 
          path="/station-list" 
          element={
            <StationListPage 
              userStations={getUserStations()} 
              onAddToPlaylist={handleAddToPlaylist} 
              onRemoveStation={removeStationByValue}
              onEditStation={editStationByValue}
            />
          } 
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
