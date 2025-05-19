
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TrackStateProvider } from "@/context/TrackStateContext";
import Index from "@/pages/Index";
import PlaylistPage from "@/pages/PlaylistPage";
import AddStationPage from "@/pages/AddStationPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import StationListPage from "@/pages/StationListPage";
import AdminPage from "@/pages/AdminPage";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TrackStateProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/playlist" element={<PlaylistPage />} />
            <Route path="/add" element={<AddStationPage />} />
            <Route path="/add-station" element={<AddStationPage />} /> {/* Add alternate route */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/station-list" element={<StationListPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </TrackStateProvider>
    </ThemeProvider>
  );
};

export default App;
