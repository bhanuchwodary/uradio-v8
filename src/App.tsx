
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "./pages/NotFound";
import AddStationPage from "./pages/AddStationPage";
import StationListPage from "./pages/StationListPage";
import SettingsPage from "./pages/SettingsPage";
import Index from "./pages/Index";
import PlaylistPage from "./pages/PlaylistPage";
import { TrackStateProvider } from "./context/TrackStateContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TrackStateProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/add-station" element={<AddStationPage />} />
                <Route path="/station-list" element={<StationListPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/playlist" element={<PlaylistPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TrackStateProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
