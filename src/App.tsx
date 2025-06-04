
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TrackStateProvider } from "@/context/TrackStateContext";
import PlaylistPage from "@/pages/PlaylistPage";
import AddStationPage from "@/pages/AddStationPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import StationListPage from "@/pages/StationListPage";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TrackStateProvider>
        <Router>
          <Routes>
            <Route path="/" element={<PlaylistPage />} />
            <Route path="/playlist" element={<PlaylistPage />} />
            <Route path="/add" element={<AddStationPage />} />
            <Route path="/add-station" element={<AddStationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/station-list" element={<StationListPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </TrackStateProvider>
    </ThemeProvider>
  );
};

export default App;
