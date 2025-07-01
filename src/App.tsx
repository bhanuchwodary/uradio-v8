
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TrackStateProvider } from "@/context/TrackStateContext";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import { PlaylistProvider, usePlaylist } from "@/context/PlaylistContext";
import { useEnhancedMediaSession } from "@/hooks/useEnhancedMediaSession";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import Index from "@/pages/Index";
import StationListPage from "@/pages/StationListPage";
import PlaylistPage from "@/pages/PlaylistPage";
import AddStationPage from "@/pages/AddStationPage";
import RequestStationPage from "@/pages/RequestStationPage";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

// Inner component that has access to playlist context
const AppWithProviders = () => {
  const [randomMode, setRandomMode] = useState(() => {
    const saved = localStorage.getItem('uradio_random_mode');
    return saved ? JSON.parse(saved) === true : false;
  });
  const [volume, setVolume] = useState(0.8);

  // Get playlist context for track state integration
  const { removeFromPlaylist } = usePlaylist();
  const playlistContext = { removeFromPlaylist };

  // Enhanced media session for better mobile experience
  useEnhancedMediaSession();

  return (
    <TrackStateProvider playlistContext={playlistContext}>
      <AudioPlayerProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/stations" element={<StationListPage />} />
          <Route path="/playlist" element={<PlaylistPage randomMode={randomMode} setRandomMode={setRandomMode} volume={volume} setVolume={setVolume} />} />
          <Route path="/add-station" element={<AddStationPage />} />
          <Route path="/request-station" element={<RequestStationPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AudioPlayerProvider>
    </TrackStateProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <BrowserRouter>
            <PlaylistProvider>
              <AppWithProviders />
              <InstallPrompt />
            </PlaylistProvider>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
