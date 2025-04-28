
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PlaylistPage from "./pages/PlaylistPage";
import AddStationPage from "./pages/AddStationPage";
import StationListPage from "./pages/StationListPage";
import SettingsPage from "./pages/SettingsPage";
import { Track } from "@/types/track";
import { useTrackState } from "./hooks/useTrackState";

const queryClient = new QueryClient();

const App = () => {
  const { 
    tracks, 
    addUrl, 
    toggleFavorite,
    getUserStations 
  } = useTrackState();
  
  const handleAddStation = (url: string, name: string) => {
    addUrl(url, name);
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
      toggleFavorite(index);
    }
  };
  
  const handleAddToPlaylist = (station: Track) => {
    // Important: Make a complete copy of the station to ensure all properties are preserved
    console.log("Attempting to add/update station to playlist:", station);
    
    // Pass a complete station object to preserve all properties including isFavorite
    addUrl(station.url, station.name, station.isPrebuilt, station.isFavorite);
    
    console.log("Added/Updated station in playlist");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/playlist" element={<PlaylistPage />} />
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
                    onToggleFavorite={handleToggleFavorite} 
                  />
                } 
              />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
